import { INITIAL_CHANNELS } from './instrumentState';
import { DrumChannel, KitId } from '../types';

export interface PatternData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  tempo: number;
  swing: number;
  masterVolume: number;
  kitId: KitId;
  channels: DrumChannel[];
}

export interface PatternFileV1 {
  format: 'beatblock-pattern';
  schemaVersion: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  tempo: number;
  swing: number;
  masterVolume: number;
  kitId: KitId;
  steps: 16;
  channels: Array<{
    id: string;
    name: string;
    muted: boolean;
    solo: boolean;
    voice: { type: 'synth' | 'sample' };
    volume: number;
    pitch: number;
    activeSteps: number[];
  }>;
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export const WORKING_SESSION_KEY = 'beatblock_working_session_v1';
export const NAMED_PATTERNS_KEY = 'beatblock_named_patterns_v1';
const MAX_IMPORT_BYTES = 1024 * 1024;
const KIT_IDS: KitId[] = ['classic-808', 'lofi-dust', 'studio-acoustic', 'future-perc', 'jungle-breaks', 'trap-hifi', 'electro-pop', 'boom-bap', 'acid-techno'];
const channelById = new Map(INITIAL_CHANNELS.map((channel) => [channel.id.replace(/^ch-/, ''), channel]));

const browserStorage = (): StorageLike | undefined => {
  try { return typeof localStorage === 'undefined' ? undefined : localStorage; } catch { return undefined; }
};
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const cleanText = (value: unknown, field: string, max = 64): string => {
  if (typeof value !== 'string') throw new Error(`Invalid ${field}`);
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
  if (!cleaned) throw new Error(`Invalid ${field}`);
  return cleaned;
};
const validTimestamp = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw new Error(`Invalid ${field}`);
  return new Date(value).toISOString();
};
const bounded = (value: unknown, field: string, min: number, max: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error(`Invalid ${field}`);
  return value;
};
const idIsValid = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);

export const serializePattern = (pattern: PatternData): string => {
  const file: PatternFileV1 = {
    format: 'beatblock-pattern', schemaVersion: 1, id: pattern.id, name: pattern.name,
    createdAt: pattern.createdAt, updatedAt: pattern.updatedAt, tempo: pattern.tempo,
    swing: pattern.swing, masterVolume: pattern.masterVolume / 100, kitId: pattern.kitId,
    steps: 16,
    channels: pattern.channels.map((channel) => ({
      id: channel.id.replace(/^ch-/, ''), name: channel.name, muted: channel.mute, solo: channel.solo,
      voice: { type: channel.type }, volume: channel.volume / 100, pitch: channel.pitch,
      activeSteps: channel.steps.flatMap((active, index) => active ? [index] : []),
    })),
  };
  return JSON.stringify(file, null, 2);
};

export const parsePatternFile = (raw: string): PatternData => {
  if (new TextEncoder().encode(raw).byteLength > MAX_IMPORT_BYTES) throw new Error('Pattern file exceeds 1 MB');
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error('Pattern file is not valid JSON'); }
  if (!isObject(parsed) || parsed.format !== 'beatblock-pattern') throw new Error('Invalid pattern format');
  if (parsed.schemaVersion !== 1) throw new Error('Unsupported pattern schema version');
  if (!idIsValid(parsed.id)) throw new Error('Invalid pattern id');
  const name = cleanText(parsed.name, 'pattern name');
  const createdAt = validTimestamp(parsed.createdAt, 'created date');
  const updatedAt = validTimestamp(parsed.updatedAt, 'updated date');
  const tempo = bounded(parsed.tempo, 'tempo', 40, 240);
  if (!Number.isInteger(tempo)) throw new Error('Tempo must be a whole number');
  const swing = bounded(parsed.swing, 'swing', 0, 100);
  const masterVolume = bounded(parsed.masterVolume, 'master volume', 0, 1) * 100;
  if (!KIT_IDS.includes(parsed.kitId as KitId)) throw new Error('Invalid kit id');
  if (parsed.steps !== 16 || !Array.isArray(parsed.channels) || parsed.channels.length !== INITIAL_CHANNELS.length) {
    throw new Error('Pattern must contain all eight 16-step channels');
  }
  const seen = new Set<string>();
  const channels = parsed.channels.map((rawChannel): DrumChannel => {
    if (!isObject(rawChannel) || !idIsValid(rawChannel.id)) throw new Error('Invalid channel id');
    const base = channelById.get(rawChannel.id);
    if (!base || seen.has(rawChannel.id)) throw new Error('Unknown or duplicate channel id');
    seen.add(rawChannel.id);
    if (typeof rawChannel.muted !== 'boolean' || typeof rawChannel.solo !== 'boolean') throw new Error(`Invalid mute/solo state for ${base.name}`);
    if (!isObject(rawChannel.voice) || !['synth', 'sample'].includes(String(rawChannel.voice.type))) throw new Error(`Invalid voice type for ${base.name}`);
    const volume = bounded(rawChannel.volume, `${base.name} volume`, 0, 1) * 100;
    const pitch = bounded(rawChannel.pitch, `${base.name} pitch`, -12, 12);
    const channelName = cleanText(rawChannel.name, 'channel name');
    if (!Array.isArray(rawChannel.activeSteps) || rawChannel.activeSteps.some((step) => !Number.isInteger(step) || step < 0 || step > 15)) {
      throw new Error(`Invalid active steps for ${base.name}`);
    }
    const activeSteps = new Set(rawChannel.activeSteps as number[]);
    if (activeSteps.size !== rawChannel.activeSteps.length) throw new Error(`Duplicate active steps for ${base.name}`);
    return {
      ...base,
      name: channelName,
      type: rawChannel.voice.type as DrumChannel['type'],
      mute: rawChannel.muted,
      solo: rawChannel.solo,
      volume,
      pitch,
      steps: Array.from({ length: 16 }, (_, index) => activeSteps.has(index)),
    };
  });
  if (seen.size !== channelById.size) throw new Error('Pattern is missing a channel');
  return { id: parsed.id, name, createdAt, updatedAt, tempo, swing, masterVolume, kitId: parsed.kitId as KitId, channels };
};

const readRecord = (raw: string | null): PatternData | null => {
  if (!raw) return null;
  try { return parsePatternFile(raw); } catch { return null; }
};

export const saveWorkingSession = (pattern: PatternData, storage = browserStorage()): boolean => {
  if (!storage) return false;
  try { storage.setItem(WORKING_SESSION_KEY, serializePattern(pattern)); return true; } catch { return false; }
};
export const recoverWorkingSession = (storage = browserStorage()): PatternData | null => {
  if (!storage) return null;
  try { return readRecord(storage.getItem(WORKING_SESSION_KEY)); } catch { return null; }
};
export const getNamedPatterns = (storage = browserStorage()): PatternData[] => {
  if (!storage) return [];
  try {
    const raw = storage.getItem(NAMED_PATTERNS_KEY);
    if (!raw) return [];
    const values: unknown = JSON.parse(raw);
    if (!Array.isArray(values)) return [];
    return values.flatMap((entry) => {
      if (typeof entry !== 'string') return [];
      const record = readRecord(entry);
      return record ? [record] : [];
    });
  } catch { return []; }
};
const writeNamedPatterns = (patterns: PatternData[], storage = browserStorage()): boolean => {
  if (!storage) return false;
  try { storage.setItem(NAMED_PATTERNS_KEY, JSON.stringify(patterns.map(serializePattern))); return true; } catch { return false; }
};
const newId = (): string => `pattern_${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`}`;
const cloneNamed = (pattern: PatternData, name = pattern.name): PatternData => ({
  ...pattern, id: newId(), name: cleanText(name, 'pattern name'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  channels: pattern.channels.map((channel) => ({ ...channel, steps: [...channel.steps] })),
});

export const saveNamedPattern = (pattern: PatternData, storage = browserStorage(), asNew = false): boolean => {
  const existing = getNamedPatterns(storage);
  const index = existing.findIndex((item) => item.id === pattern.id);
  const saved = { ...pattern, updatedAt: new Date().toISOString() };
  if (asNew) existing.push(cloneNamed(saved));
  else if (index < 0) existing.push(saved);
  else existing[index] = saved;
  return writeNamedPatterns(existing, storage);
};
export const savePatternAs = (pattern: PatternData, name: string, storage = browserStorage()): PatternData | null => {
  try {
    const saved = cloneNamed(pattern, name);
    return writeNamedPatterns([...getNamedPatterns(storage), saved], storage) ? saved : null;
  } catch { return null; }
};
export const duplicateNamedPattern = (id: string, storage = browserStorage()): PatternData | null => {
  const source = getNamedPatterns(storage).find((item) => item.id === id);
  if (!source) return null;
  const copy = cloneNamed(source, `${source.name} Copy`.slice(0, 64));
  return writeNamedPatterns([...getNamedPatterns(storage), copy], storage) ? copy : null;
};
export const renameNamedPattern = (id: string, name: string, storage = browserStorage()): boolean => {
  try {
    const patterns = getNamedPatterns(storage);
    const index = patterns.findIndex((item) => item.id === id);
    if (index < 0) return false;
    patterns[index] = { ...patterns[index], name: cleanText(name, 'pattern name'), updatedAt: new Date().toISOString() };
    return writeNamedPatterns(patterns, storage);
  } catch { return false; }
};
export const deleteNamedPattern = (id: string, storage = browserStorage()): boolean => {
  const patterns = getNamedPatterns(storage);
  const remaining = patterns.filter((item) => item.id !== id);
  return remaining.length !== patterns.length && writeNamedPatterns(remaining, storage);
};
