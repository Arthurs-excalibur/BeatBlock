import { DrumChannel, SoundKit, MasterState, KitId } from '../types';

export const INITIAL_KITS: SoundKit[] = [
  {
    id: 'classic-808',
    name: 'Classic 808',
    description: 'Original generated analog-style kick, snare, hats and punchy sub-bass.',
    tag: 'ANALOG SYNTH',
  },
  {
    id: 'lofi-dust',
    name: 'Lo-Fi Dust',
    description: 'Original generated warm drum samples blended with synthesized hand percussion.',
    tag: 'SAMPLE + SYNTH',
  },
  {
    id: 'studio-acoustic',
    name: 'Studio Acoustic',
    description: 'Original acoustic-inspired kick/snare/hat samples with synthesized toms and hand percussion.',
    tag: 'SAMPLE + SYNTH',
  },
  {
    id: 'future-perc',
    name: 'Future Percussion',
    description: 'Metallic, frequency-modulated tonal percussion and glitch layers.',
    tag: 'FM SYNTH',
  },
  {
    id: 'jungle-breaks',
    name: 'Jungle Breaks',
    description: 'Pitched Amen-style breakbeats with heavy sub kicks and rave stabs. Classic DnB energy.',
    tag: 'BREAKBEAT',
  },
  {
    id: 'trap-hifi',
    name: 'Trap Hi-Fi',
    description: 'Modern trap: crisp 808 sub, snappy snare, rapid hi-hats, and pitched perc stabs.',
    tag: 'TRAP',
  },
  {
    id: 'electro-pop',
    name: 'Electro Pop',
    description: '80s LinnDrum-style electronic snare crack, punchy gated kick, bright synth toms and digital cowbell.',
    tag: 'ELECTRO',
  },
  {
    id: 'boom-bap',
    name: 'Boom Bap',
    description: 'Classic NY hip-hop: deep punchy kick, vinyl-snap snare, dusty ride hat, raw rimshot.',
    tag: 'HIP-HOP',
  },
  {
    id: 'acid-techno',
    name: 'Acid Techno',
    description: 'TR-909 inspired: hard distorted kick, metallic snare crack, acid bass stab, industrial hats.',
    tag: 'TECHNO',
  },
];

export const KIT_BADGES: Record<KitId, Record<string, string>> = {
  'classic-808': {
    'ch-kick': '808 BOOM',
    'ch-snare': '808 TONE',
    'ch-clap': 'ANALOG',
    'ch-chat': 'METALLIC',
    'ch-ohat': 'SUSTAIN',
    'ch-tom': 'RESONANT',
    'ch-rim': 'WOODEN',
    'ch-perc': 'MODULATED',
  },
  'lofi-dust': {
    'ch-kick': 'DUST SUB',
    'ch-snare': 'VINYL SNAP',
    'ch-clap': 'TAPE CLAP',
    'ch-chat': 'TAPE HAT',
    'ch-ohat': 'DUST SIZZLE',
    'ch-tom': 'WARM TOM',
    'ch-rim': 'WOODBLOCK',
    'ch-perc': 'PERC SNAP',
  },
  'studio-acoustic': {
    'ch-kick': 'ACOUSTIC',
    'ch-snare': 'CRISP CRACK',
    'ch-clap': 'STUDIO CLAP',
    'ch-chat': 'BRIGHT HAT',
    'ch-ohat': 'CYMBAL',
    'ch-tom': 'FLOOR TOM',
    'ch-rim': 'CROSS-STICK',
    'ch-perc': 'SHAKER',
  },
  'future-perc': {
    'ch-kick': 'FM SUB',
    'ch-snare': 'CYBER GLITCH',
    'ch-clap': 'DIGI SNAP',
    'ch-chat': 'ZAP HAT',
    'ch-ohat': 'RING SIZZLE',
    'ch-tom': 'FM DROP',
    'ch-rim': 'PIEZO',
    'ch-perc': 'FM BELL',
  },
  'jungle-breaks': {
    'ch-kick': 'JUNGLE SUB',
    'ch-snare': 'AMEN CRACK',
    'ch-clap': 'RAVE CLAP',
    'ch-chat': 'BREAK HAT',
    'ch-ohat': 'ROLL SIZZLE',
    'ch-tom': 'PITCHED TOM',
    'ch-rim': 'STICK HIT',
    'ch-perc': 'REESE STAB',
  },
  'trap-hifi': {
    'ch-kick': '808 SLIDE',
    'ch-snare': 'SNAP',
    'ch-clap': 'TRAP CLAP',
    'ch-chat': 'RAPID HAT',
    'ch-ohat': 'OPEN ROLL',
    'ch-tom': 'TUNED TOM',
    'ch-rim': 'RIM TAP',
    'ch-perc': 'PITCH STAB',
  },
  'electro-pop': {
    'ch-kick': 'GATED KICK',
    'ch-snare': 'LINN CRACK',
    'ch-clap': 'DIGITAL SLAP',
    'ch-chat': 'SYNC HAT',
    'ch-ohat': 'SHIMMER',
    'ch-tom': 'SYNTH TOM',
    'ch-rim': 'STICK',
    'ch-perc': 'COWBELL',
  },
  'boom-bap': {
    'ch-kick': 'BOOM',
    'ch-snare': 'VINYL SNAP',
    'ch-clap': 'HAND SLAP',
    'ch-chat': 'RIDE TIP',
    'ch-ohat': 'RIDE WASH',
    'ch-tom': 'BOOM TOM',
    'ch-rim': 'RAW RIM',
    'ch-perc': 'SCRATCH',
  },
  'acid-techno': {
    'ch-kick': '909 HARD',
    'ch-snare': 'METAL SNAP',
    'ch-clap': 'ACID CLAP',
    'ch-chat': 'INDUSTRIAL',
    'ch-ohat': 'GRIND',
    'ch-tom': 'PUNCH TOM',
    'ch-rim': 'STEEL RIM',
    'ch-perc': 'ACID STAB',
  },
};

export const getKitBadge = (kitId: KitId, channelId: string): string => {
  return KIT_BADGES[kitId]?.[channelId] ?? 'VOICE';
};

// Preset drum pattern variations for Banks A, B, C, D (Drumhaus / Roland TR style)
export const PRESET_PATTERNS: Record<'A' | 'B' | 'C' | 'D', boolean[][]> = {
  // A: Core 808 / Lo-Fi foundational groove
  A: [
    [true, false, false, false,  false, false, true, false,  true, false, false, false,  false, true, false, false], // Kick
    [false, false, false, false,  true, false, false, false,  false, false, false, false,  true, false, false, false], // Snare
    [false, false, false, false,  true, false, false, false,  false, false, false, false,  true, false, false, true],  // Clap
    [true, false, true, false,  true, false, true, false,  true, false, true, false,  true, false, true, false],      // Closed Hat
    [false, false, false, false,  false, false, false, true,  false, false, false, false,  false, false, true, false], // Open Hat
    [false, false, false, true,   false, false, false, false,  false, false, true, false,   false, false, false, false], // Tom
    [false, false, false, false,  false, true, false, false,  false, false, false, false,  false, false, false, false], // Rim
    [false, true, false, false,   false, false, false, false,  false, true, false, false,   false, false, false, true],  // Perc
  ],
  // B: Syncopated groove with rolling 16th hats
  B: [
    [true, false, false, true,   false, false, true, false,  false, true, false, false,   true, false, false, false], // Kick
    [false, false, false, false,  true, false, false, false,  false, false, false, false,  true, false, false, true],  // Snare
    [false, false, false, false,  true, false, false, false,  false, false, false, false,  true, false, false, false], // Clap
    [true, true, true, true,      true, true, true, true,      true, true, true, true,      true, true, true, true],   // Closed Hat (16ths)
    [false, false, false, false,  false, false, true, false,  false, false, false, false,  false, false, true, false], // Open Hat
    [false, false, false, false,  false, false, false, true,  false, false, false, false,  false, true, false, false], // Tom
    [false, false, true, false,   false, false, false, false,  false, false, true, false,   false, false, false, false], // Rim
    [true, false, false, false,   false, true, false, false,  true, false, false, false,   false, false, true, false],  // Perc
  ],
  // C: Half-time / Breakdown groove
  C: [
    [true, false, false, false,  false, false, false, false,  true, false, false, false,  false, false, false, false], // Kick
    [false, false, false, false,  false, false, false, false,  true, false, false, false,  false, false, false, false], // Snare (beat 3)
    [false, false, false, false,  false, false, false, false,  true, false, false, false,  false, false, false, true],  // Clap
    [true, false, false, false,  true, false, false, false,  true, false, false, false,  true, false, false, false],  // Closed Hat (quarters)
    [false, false, false, false,  false, false, false, false,  false, false, false, false,  false, false, false, true],  // Open Hat
    [false, false, true, false,   false, false, false, false,  false, false, false, false,  false, false, true, false], // Tom
    [false, false, false, false,  true, false, false, false,  false, false, false, false,  true, false, false, false],  // Rim
    [false, false, false, true,   false, false, false, false,  false, false, false, true,   false, false, false, false], // Perc
  ],
  // D: High-energy build / climax
  D: [
    [true, false, true, false,   true, false, true, false,   true, false, true, false,   true, false, true, false],   // Kick (four on the floor)
    [false, false, false, false,  true, false, false, true,   false, false, true, false,   true, true, true, true],     // Snare (building roll)
    [false, false, false, false,  true, false, false, false,  false, false, false, false,  true, false, true, false],   // Clap
    [true, true, true, true,      true, true, true, true,      true, true, true, true,      true, true, true, true],   // Closed Hat
    [false, false, true, false,   false, false, true, false,  false, false, true, false,   false, false, true, false], // Open Hat (offbeats)
    [false, false, false, false,  false, true, false, false,  false, false, false, false,  true, false, false, false], // Tom
    [false, true, false, false,   false, false, false, false,  false, true, false, false,   false, false, false, false], // Rim
    [false, false, false, true,   false, false, true, false,  false, false, false, true,   false, true, false, true],   // Perc
  ],
};

// Standard 8 channels as locked in PRD: Kick, Snare, Clap, Closed Hat, Open Hat, Tom, Rim, Percussion
export const INITIAL_CHANNELS: DrumChannel[] = [
  {
    id: 'ch-kick',
    name: 'Kick Drum',
    shortLabel: 'KICK',
    type: 'synth',
    badge: '808 BOOM',
    steps: [...PRESET_PATTERNS.A[0]],
    mute: false,
    solo: false,
    volume: 85,
    pitch: 0,
  },
  {
    id: 'ch-snare',
    name: 'Snare',
    shortLabel: 'SNARE',
    type: 'synth',
    badge: '808 TONE',
    steps: [...PRESET_PATTERNS.A[1]],
    mute: false,
    solo: false,
    volume: 80,
    pitch: 0,
  },
  {
    id: 'ch-clap',
    name: 'Hand Clap',
    shortLabel: 'CLAP',
    type: 'synth',
    badge: 'ANALOG',
    steps: [...PRESET_PATTERNS.A[2]],
    mute: false,
    solo: false,
    volume: 75,
    pitch: 0,
  },
  {
    id: 'ch-chat',
    name: 'Closed Hat',
    shortLabel: 'CH',
    type: 'synth',
    badge: 'METALLIC',
    steps: [...PRESET_PATTERNS.A[3]],
    mute: false,
    solo: false,
    volume: 70,
    pitch: 0,
  },
  {
    id: 'ch-ohat',
    name: 'Open Hat',
    shortLabel: 'OH',
    type: 'synth',
    badge: 'SUSTAIN',
    steps: [...PRESET_PATTERNS.A[4]],
    mute: false,
    solo: false,
    volume: 65,
    pitch: 0,
  },
  {
    id: 'ch-tom',
    name: 'Low Tom',
    shortLabel: 'TOM',
    type: 'synth',
    badge: 'RESONANT',
    steps: [...PRESET_PATTERNS.A[5]],
    mute: false,
    solo: false,
    volume: 70,
    pitch: 0,
  },
  {
    id: 'ch-rim',
    name: 'Rimshot',
    shortLabel: 'RIM',
    type: 'synth',
    badge: 'WOODEN',
    steps: [...PRESET_PATTERNS.A[6]],
    mute: false,
    solo: false,
    volume: 75,
    pitch: 0,
  },
  {
    id: 'ch-perc',
    name: 'Percussion',
    shortLabel: 'PERC',
    type: 'synth',
    badge: 'MODULATED',
    steps: [...PRESET_PATTERNS.A[7]],
    mute: false,
    solo: false,
    volume: 65,
    pitch: 0,
  },
];

export const INITIAL_MASTER_STATE: MasterState = {
  bpm: 120,
  swing: 15,
  masterVolume: 80,
  isPlaying: false,
  currentStep: 0,
  activeKit: 'classic-808',
  activePatternName: 'Pattern 01',
};
