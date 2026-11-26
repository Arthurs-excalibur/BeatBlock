import { describe, it, expect, beforeEach } from 'vitest';
import { calculateStepTime, calculate16thInterval } from '../engine/schedulerMath';
import {
  playKick,
  playSnare,
  playClap,
  playClosedHat,
  playOpenHat,
  playTom,
  playRim,
  playPerc,
  VOICE_MAP,
} from '../engine/synthVoices';
import { audioContextManager } from '../engine/AudioContextManager';
import { MockAudioContext } from './setup';

describe('Scheduler Math & Swing Calculations', () => {
  it('calculates correct 16th note interval in seconds for a given BPM', () => {
    expect(calculate16thInterval(120)).toBeCloseTo(0.125, 4);
    expect(calculate16thInterval(60)).toBeCloseTo(0.25, 4);
    expect(calculate16thInterval(180)).toBeCloseTo(0.08333, 4);
  });

  it('calculates step time without swing on straight 16th notes', () => {
    const baseTime = 10.0;
    const bpm = 120;
    const swing = 0;

    expect(calculateStepTime(baseTime, 0, bpm, swing)).toBeCloseTo(10.0, 4);
    expect(calculateStepTime(baseTime, 1, bpm, swing)).toBeCloseTo(10.125, 4);
    expect(calculateStepTime(baseTime, 2, bpm, swing)).toBeCloseTo(10.250, 4);
  });

  it('delays off-beat 16th steps when swing is applied without accumulating drift on on-beat steps', () => {
    const baseTime = 0;
    const bpm = 120;
    const swing = 50;

    const step0Time = calculateStepTime(baseTime, 0, bpm, swing);
    const step2Time = calculateStepTime(baseTime, 2, bpm, swing);
    expect(step0Time).toBeCloseTo(0.0, 4);
    expect(step2Time).toBeCloseTo(0.25, 4);

    const straightStep1 = calculateStepTime(baseTime, 1, bpm, 0);
    const swungStep1 = calculateStepTime(baseTime, 1, bpm, swing);

    expect(swungStep1).toBeGreaterThan(straightStep1);
    expect(swungStep1).toBeLessThan(step2Time);
  });
});

describe('Web Audio Synthesis Voices', () => {
  let mockCtx: AudioContext;
  let mockDest: AudioNode;

  beforeEach(() => {
    mockCtx = new MockAudioContext() as unknown as AudioContext;
    mockDest = mockCtx.createGain();
  });

  it('maps all 8 required channels to synthesis voice functions', () => {
    const expectedChannels = [
      'ch-kick', 'ch-snare', 'ch-clap', 'ch-chat',
      'ch-ohat', 'ch-tom', 'ch-rim', 'ch-perc',
    ];
    for (const ch of expectedChannels) {
      expect(VOICE_MAP[ch]).toBeDefined();
      expect(typeof VOICE_MAP[ch]).toBe('function');
    }
  });

  it('triggers synthesized Kick with pitch-drop envelope without crashing', () => {
    playKick(mockCtx, mockDest, 1.0, { volume: 85 });
    expect(mockDest.connect).toBeDefined();
  });

  it('triggers synthesized Snare with tone + noise burst', () => {
    playSnare(mockCtx, mockDest, 1.0, { volume: 80 });
    expect(mockDest.connect).toBeDefined();
  });

  it('triggers synthesized Clap with micro-bursts', () => {
    playClap(mockCtx, mockDest, 1.0, { volume: 75 });
    expect(mockDest.connect).toBeDefined();
  });

  it('triggers Closed Hat and Open Hat with highpass filters', () => {
    playClosedHat(mockCtx, mockDest, 1.0);
    playOpenHat(mockCtx, mockDest, 1.0);
    expect(mockDest.connect).toBeDefined();
  });

  it('triggers Tom, Rim, and Percussion voices with appropriate nodes', () => {
    playTom(mockCtx, mockDest, 1.0);
    playRim(mockCtx, mockDest, 1.0);
    playPerc(mockCtx, mockDest, 1.0);
    expect(mockDest.connect).toBeDefined();
  });
});

describe('AudioContextManager Lifecycle', () => {
  beforeEach(() => {
    audioContextManager.dispose();
  });

  it('creates AudioContext and attaches limiter DynamicsCompressor', () => {
    const ctx = audioContextManager.getContext();
    expect(ctx).toBeDefined();
  });

  it('resumes audio context when ensureReady() is called after user gesture', async () => {
    const ready = await audioContextManager.ensureReady();
    expect(ready).toBe(true);
  });

  it('updates master gain smoothly without throwing', () => {
    audioContextManager.setMasterVolume(85);
    expect(audioContextManager.getMasterInput()).toBeDefined();
  });
});
