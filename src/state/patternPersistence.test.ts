import { describe, expect, it } from 'vitest';
import { INITIAL_CHANNELS, INITIAL_MASTER_STATE } from './instrumentState';
import {
  parsePatternFile,
  serializePattern,
  saveWorkingSession,
  recoverWorkingSession,
  getNamedPatterns,
  saveNamedPattern,
  savePatternAs,
  duplicateNamedPattern,
  renameNamedPattern,
  deleteNamedPattern,
} from './patternPersistence';

const snapshot = {
  id: 'test-pattern',
  name: 'Night Walk',
  createdAt: '2026-11-20T12:00:00.000Z',
  updatedAt: '2026-11-20T12:00:00.000Z',
  tempo: INITIAL_MASTER_STATE.bpm,
  swing: INITIAL_MASTER_STATE.swing,
  masterVolume: INITIAL_MASTER_STATE.masterVolume,
  kitId: INITIAL_MASTER_STATE.activeKit,
  channels: INITIAL_CHANNELS,
};

const memoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
};

describe('Pattern persistence and schema v1', () => {
  it('round-trips an eight-channel pattern through versioned JSON', () => {
    const serialized = serializePattern(snapshot);
    const decoded = parsePatternFile(serialized);
    const envelope = JSON.parse(serialized);
    expect(envelope.format).toBe('beatblock-pattern');
    expect(envelope.schemaVersion).toBe(1);
    expect(decoded.channels).toHaveLength(8);
    expect(decoded.channels[0].steps).toEqual(snapshot.channels[0].steps);
    expect(decoded.masterVolume).toBe(80);
    expect(decoded.channels[0].volume).toBe(85);
  });

  it('rejects invalid schema, tempo, and malformed step lists', () => {
    const payload = JSON.parse(serializePattern(snapshot));
    expect(() => parsePatternFile(JSON.stringify({ ...payload, schemaVersion: 2 }))).toThrow(/schema/i);
    expect(() => parsePatternFile(JSON.stringify({ ...payload, tempo: 999 }))).toThrow(/tempo/i);
    expect(() => parsePatternFile(JSON.stringify({ ...payload, tempo: 120.5 }))).toThrow(/whole number/i);
    const malformed = { ...payload, channels: payload.channels.map((channel: unknown, index: number) =>
      index === 0 ? { ...channel as object, activeSteps: [1, 99] } : channel) };
    expect(() => parsePatternFile(JSON.stringify(malformed))).toThrow(/step/i);
  });

  it('recovers a saved working session and safely rejects corrupt data', () => {
    const storage = memoryStorage();
    expect(saveWorkingSession(snapshot, storage)).toBe(true);
    expect(recoverWorkingSession(storage)?.name).toBe('Night Walk');
    storage.setItem('beatblock_working_session_v1', '{broken');
    expect(recoverWorkingSession(storage)).toBeNull();
  });

  it('supports named pattern save-as, duplicate, rename, and delete', () => {
    const storage = memoryStorage();
    const first = savePatternAs(snapshot, 'First copy', storage);
    expect(first?.name).toBe('First copy');
    expect(savePatternAs(snapshot, String.fromCharCode(1), storage)).toBeNull();
    const duplicate = duplicateNamedPattern(first!.id, storage);
    expect(duplicate?.id).not.toBe(first?.id);
    expect(duplicate?.name).toBe('First copy Copy');
    expect(renameNamedPattern(duplicate!.id, 'Renamed', storage)).toBe(true);
    expect(getNamedPatterns(storage).map((item) => item.name)).toContain('Renamed');
    expect(deleteNamedPattern(first!.id, storage)).toBe(true);
    expect(getNamedPatterns(storage)).toHaveLength(1);
  });

  it('stores named patterns and degrades safely when storage throws', () => {
    const storage = memoryStorage();
    expect(saveNamedPattern(snapshot, storage)).toBe(true);
    expect(getNamedPatterns(storage)).toHaveLength(1);
    const blocked = { getItem: () => null, setItem: () => { throw new Error('blocked'); }, removeItem: () => {} };
    expect(saveWorkingSession(snapshot, blocked)).toBe(false);
    expect(saveNamedPattern(snapshot, blocked)).toBe(false);
  });
});
