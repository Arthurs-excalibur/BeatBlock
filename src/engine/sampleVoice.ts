import type { DrumChannel, KitId } from '../types';
import { VOICE_MAP } from './synthVoices';

export interface SampleClipDefinition {
  id: string;
  channelId: string;
  displayName: string;
  type: 'sample';
  assetPath: string;
  license: 'CC0-1.0';
  defaultVolume: number;
  defaultPitch: number;
  previewAvailable: boolean;
}

export type SampleKitAssets = Partial<Record<KitId, readonly SampleClipDefinition[]>>;

const sampleClip = (id: string, channelId: string, displayName: string, assetPath: string): SampleClipDefinition => ({
  id,
  channelId,
  displayName,
  type: 'sample',
  assetPath,
  license: 'CC0-1.0',
  defaultVolume: 80,
  defaultPitch: 0,
  previewAvailable: true,
});

/** Original procedural clips bundled with BeatBlock; see public/samples/LICENSE.txt. */
export const SAMPLE_KIT_ASSETS: SampleKitAssets = {
  'lofi-dust': [
    sampleClip('lofi-kick', 'ch-kick', 'Dust Kick', '/samples/lofi-kick.wav'),
    sampleClip('lofi-snare', 'ch-snare', 'Dust Snare', '/samples/lofi-snare.wav'),
    sampleClip('lofi-closed-hat', 'ch-chat', 'Dust Closed Hat', '/samples/lofi-hat-closed.wav'),
    sampleClip('lofi-open-hat', 'ch-ohat', 'Dust Open Hat', '/samples/lofi-hat-open.wav'),
  ],
  'studio-acoustic': [
    sampleClip('studio-kick', 'ch-kick', 'Studio Kick', '/samples/studio-kick.wav'),
    sampleClip('studio-snare', 'ch-snare', 'Studio Snare', '/samples/studio-snare.wav'),
    sampleClip('studio-closed-hat', 'ch-chat', 'Studio Closed Hat', '/samples/studio-hat-closed.wav'),
    sampleClip('studio-open-hat', 'ch-ohat', 'Studio Open Hat', '/samples/studio-hat-open.wav'),
  ],
};

export const getChannelVoiceTypeForKit = (kitId: KitId, channelId: string): DrumChannel['type'] =>
  SAMPLE_KIT_ASSETS[kitId]?.some((clip) => clip.channelId === channelId && clip.type === 'sample') ? 'sample' : 'synth';

export class SampleVoiceBank {
  private readonly buffers = new WeakMap<AudioContext, Map<KitId, Map<string, AudioBuffer>>>();
  private readonly inFlight = new WeakMap<AudioContext, Map<KitId, Promise<boolean>>>();

  constructor(private readonly assets: SampleKitAssets = SAMPLE_KIT_ASSETS) {}

  public async loadKit(ctx: AudioContext, kitId: KitId): Promise<boolean> {
    const clips = this.assets[kitId] ?? [];
    if (clips.length === 0) return true;

    const kitBuffers = this.getKitBuffers(ctx, kitId);
    if (clips.every((clip) => kitBuffers.has(clip.channelId))) return true;

    const pendingByKit = this.inFlight.get(ctx) ?? new Map<KitId, Promise<boolean>>();
    this.inFlight.set(ctx, pendingByKit);
    const pending = pendingByKit.get(kitId);
    if (pending) return pending;

    const load = Promise.all(clips.map(async (clip) => {
      if (kitBuffers.has(clip.channelId)) return true;
      try {
        const response = await fetch(clip.assetPath);
        if (!response.ok) return false;
        const bytes = await response.arrayBuffer();
        const buffer = await ctx.decodeAudioData(bytes);
        kitBuffers.set(clip.channelId, buffer);
        return true;
      } catch {
        return false;
      }
    })).then((results) => results.every(Boolean)).finally(() => pendingByKit.delete(kitId));

    pendingByKit.set(kitId, load);
    return load;
  }

  public trigger(
    ctx: AudioContext,
    destination: AudioNode,
    time: number,
    kitId: KitId,
    channelId: string,
    volume = 80,
    pitch = 0,
  ): boolean {
    const buffer = this.buffers.get(ctx)?.get(kitId)?.get(channelId);
    if (!buffer) return false;

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const safeVolume = Math.max(0, Math.min(100, volume)) / 100;
    const safePitch = Math.max(-12, Math.min(12, pitch));
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(2 ** (safePitch / 12), time);
    gain.gain.setValueAtTime(safeVolume, time);
    source.connect(gain);
    gain.connect(destination);
    source.start(time);
    return true;
  }

  private getKitBuffers(ctx: AudioContext, kitId: KitId): Map<string, AudioBuffer> {
    let contextBuffers = this.buffers.get(ctx);
    if (!contextBuffers) {
      contextBuffers = new Map();
      this.buffers.set(ctx, contextBuffers);
    }
    let kitBuffers = contextBuffers.get(kitId);
    if (!kitBuffers) {
      kitBuffers = new Map();
      contextBuffers.set(kitId, kitBuffers);
    }
    return kitBuffers;
  }
}

export const sampleVoiceBank = new SampleVoiceBank();

export type VoiceDispatchResult = 'sample' | 'synth' | 'missing';

export function triggerChannelVoice(
  ctx: AudioContext,
  destination: AudioNode,
  time: number,
  kitId: KitId,
  channelId: string,
  volume = 80,
  pitch = 0,
  sampleBank: SampleVoiceBank = sampleVoiceBank,
): VoiceDispatchResult {
  if (sampleBank.trigger(ctx, destination, time, kitId, channelId, volume, pitch)) return 'sample';
  const synthVoice = VOICE_MAP[channelId];
  if (!synthVoice) return 'missing';
  synthVoice(ctx, destination, time, { volume, pitch, kitId });
  return 'synth';
}
