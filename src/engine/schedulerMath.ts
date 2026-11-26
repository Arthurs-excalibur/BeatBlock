/**
 * Pure scheduler math helper functions.
 * Kept strictly pure for deterministic unit testing and zero timing drift.
 */

export function calculate16thInterval(bpm: number): number {
  const safeBpm = Math.max(40, Math.min(300, bpm));
  // 1 beat (quarter note) = 60 / BPM seconds
  // 1 step (sixteenth note) = 1 beat / 4
  return 60 / safeBpm / 4;
}

export function calculateStepTime(
  loopStartTime: number,
  stepIndex: number,
  bpm: number,
  swingPercent: number
): number {
  const interval = calculate16thInterval(bpm);
  const baseStepTime = loopStartTime + stepIndex * interval;

  // Apply swing only to odd steps (off-beats: 1, 3, 5, 7, 9, 11, 13, 15)
  if (stepIndex % 2 === 1 && swingPercent > 0) {
    const safeSwing = Math.max(0, Math.min(100, swingPercent)) / 100;
    // Maximum swing offset is 33% of a sixteenth note interval
    const maxOffset = interval * 0.33;
    return baseStepTime + maxOffset * safeSwing;
  }

  return baseStepTime;
}
