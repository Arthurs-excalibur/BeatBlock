import { describe, it, expect } from 'vitest';
import { INITIAL_CHANNELS, INITIAL_MASTER_STATE, INITIAL_KITS } from '../state/instrumentState';

describe('Instrument State Foundation', () => {
  it('contains exactly 8 drum channels as specified in PRD', () => {
    expect(INITIAL_CHANNELS).toHaveLength(8);
    const channelLabels = INITIAL_CHANNELS.map((ch) => ch.shortLabel);
    expect(channelLabels).toEqual(['KICK', 'SNARE', 'CLAP', 'CH', 'OH', 'TOM', 'RIM', 'PERC']);
  });

  it('provides exactly 16 steps for every channel (128 total steps)', () => {
    let totalSteps = 0;
    for (const channel of INITIAL_CHANNELS) {
      expect(channel.steps).toHaveLength(16);
      totalSteps += channel.steps.length;
    }
    expect(totalSteps).toBe(128);
  });

  it('includes a playable starter groove pattern', () => {
    const kickChannel = INITIAL_CHANNELS.find((c) => c.shortLabel === 'KICK');
    expect(kickChannel).toBeDefined();
    expect(kickChannel?.steps[0]).toBe(true); // Downbeat on step 1

    const snareChannel = INITIAL_CHANNELS.find((c) => c.shortLabel === 'SNARE');
    expect(snareChannel).toBeDefined();
    expect(snareChannel?.steps[4]).toBe(true); // Snare backbeat on step 5 (beat 2)
  });

  it('provides the built-in starter kits', () => {
    expect(INITIAL_KITS).toHaveLength(9);
    const kitIds = INITIAL_KITS.map((k) => k.id);
    expect(kitIds).toEqual(['classic-808', 'lofi-dust', 'studio-acoustic', 'future-perc', 'jungle-breaks', 'trap-hifi', 'electro-pop', 'boom-bap', 'acid-techno']);
  });

  it('initializes master transport state within valid hardware ranges', () => {
    expect(INITIAL_MASTER_STATE.bpm).toBeGreaterThanOrEqual(60);
    expect(INITIAL_MASTER_STATE.bpm).toBeLessThanOrEqual(200);
    expect(INITIAL_MASTER_STATE.swing).toBeGreaterThanOrEqual(0);
    expect(INITIAL_MASTER_STATE.swing).toBeLessThanOrEqual(100);
    expect(INITIAL_MASTER_STATE.masterVolume).toBeGreaterThanOrEqual(0);
    expect(INITIAL_MASTER_STATE.masterVolume).toBeLessThanOrEqual(100);
    expect(INITIAL_MASTER_STATE.isPlaying).toBe(false);
  });
});
