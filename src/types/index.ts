export type ViewMode = 'landing' | 'studio';

export type KitId = 'classic-808' | 'lofi-dust' | 'studio-acoustic' | 'future-perc' | 'jungle-breaks' | 'trap-hifi' | 'electro-pop' | 'boom-bap' | 'acid-techno';

export interface DrumChannel {
  id: string;
  name: string;
  shortLabel: string;
  type: 'synth' | 'sample';
  badge: string;
  steps: boolean[]; // 16 steps
  mute: boolean;
  solo: boolean;
  volume: number; // 0 - 100
  pitch: number; // -12 to +12 semitones
}

export interface SoundKit {
  id: KitId;
  name: string;
  description: string;
  tag: string;
}

export interface MasterState {
  bpm: number; // 60 - 200
  swing: number; // 0 - 100%
  masterVolume: number; // 0 - 100
  isPlaying: boolean;
  currentStep: number; // 0 - 15
  activeKit: KitId;
  activePatternName: string;
}

export interface AppPreferences {
  introSeen: boolean;
  theme: 'light' | 'dark';
  reducedMotion: boolean;
}
