import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KitId } from '../types';
import { MockAudioContext } from '../__tests__/setup';
import { SampleVoiceBank, triggerChannelVoice, getChannelVoiceTypeForKit, SAMPLE_KIT_ASSETS } from './sampleVoice';

const sampleAssets = {
  'lofi-dust': [{
    id: 'test-kick',
    channelId: 'ch-kick',
    displayName: 'Test Kick',
    type: 'sample',
    assetPath: '/samples/test-kick.wav',
    license: 'CC0-1.0',
    defaultVolume: 80,
    defaultPitch: 0,
    previewAvailable: true,
  }],
} as const;

describe('sample voice playback', () => {
  let ctx: AudioContext;
  let decodedBuffer: AudioBuffer;
  let source: {
    buffer: AudioBuffer | null;
    playbackRate: { setValueAtTime: ReturnType<typeof vi.fn> };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };
  let bank: SampleVoiceBank;

  beforeEach(() => {
    vi.restoreAllMocks();
    const mock = new MockAudioContext();
    decodedBuffer = { duration: 0.25 } as AudioBuffer;
    source = {
      buffer: null,
      playbackRate: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    ctx = Object.assign(mock, {
      decodeAudioData: vi.fn().mockResolvedValue(decodedBuffer),
      createBufferSource: vi.fn(() => source),
    }) as unknown as AudioContext;
    bank = new SampleVoiceBank(sampleAssets);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    }));
  });

  it('loads a kit sample once and schedules it with channel gain and semitone pitch', async () => {
    await bank.loadKit(ctx, 'lofi-dust');
    await bank.loadKit(ctx, 'lofi-dust');

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const createGain = vi.spyOn(ctx, 'createGain');
    expect(triggerChannelVoice(ctx, ctx.destination, 3, 'lofi-dust', 'ch-kick', 64, 12, bank)).toBe('sample');
    expect(source.buffer).toBe(decodedBuffer);
    expect(source.start).toHaveBeenCalledWith(3);
    expect(source.playbackRate.setValueAtTime).toHaveBeenCalledWith(2, 3);
    expect(createGain.mock.results[0].value.gain.setValueAtTime).toHaveBeenCalledWith(0.64, 3);
  });

  it('keeps unassigned channels synthesized within a sample kit', () => {
    expect(triggerChannelVoice(ctx, ctx.destination, 1, 'lofi-dust', 'ch-clap', 75, 0, bank)).toBe('synth');
  });

  it('reports the sample and synth assignments for each starter kit', () => {
    expect(getChannelVoiceTypeForKit('lofi-dust', 'ch-kick')).toBe('sample');
    expect(getChannelVoiceTypeForKit('lofi-dust', 'ch-clap')).toBe('synth');
    expect(getChannelVoiceTypeForKit('classic-808', 'ch-kick')).toBe('synth');
    expect(getChannelVoiceTypeForKit('studio-acoustic', 'ch-ohat')).toBe('sample');
  });

  it('exposes original sample identity and license metadata in the kit manifest', () => {
    const clips = SAMPLE_KIT_ASSETS['lofi-dust'] ?? [];
    expect(clips).toHaveLength(4);
    expect(clips[0]).toMatchObject({
      type: 'sample',
      license: 'CC0-1.0',
      defaultPitch: 0,
      previewAvailable: true,
    });
  });

  it('falls back to synthesis when a mapped sample cannot be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await bank.loadKit(ctx, 'lofi-dust');

    expect(triggerChannelVoice(ctx, ctx.destination, 1, 'lofi-dust', 'ch-kick', 80, 0, bank)).toBe('synth');
  });

  it('keeps synthesis kits independent from sample loading', () => {
    expect(triggerChannelVoice(ctx, ctx.destination, 1, 'classic-808' as KitId, 'ch-kick', 80, 0, bank)).toBe('synth');
  });
});
