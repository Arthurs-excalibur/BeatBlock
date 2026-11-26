import { KitId } from '../types';

let cachedNoiseBuffer: AudioBuffer | null = null;
let cachedDistortionCurve: Float32Array | null = null;

/** Pink noise buffer for boom-bap vinyl warmth (Voss-McCartney algorithm) */
let cachedPinkBuffer: AudioBuffer | null = null;

function getPinkBuffer(ctx: AudioContext): AudioBuffer {
  if (cachedPinkBuffer && cachedPinkBuffer.sampleRate === ctx.sampleRate) return cachedPinkBuffer;
  const bufferSize = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  cachedPinkBuffer = buffer;
  return buffer;
}

/**
 * Returns a cached 1-second stereo white noise buffer.
 */
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer;
  }
  const bufferSize = ctx.sampleRate; // 1 second
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  cachedNoiseBuffer = buffer;
  return buffer;
}

/**
 * Generates an aggressive distortion wave shaper curve for Jungle / gritty sounds.
 */
function getDistortionCurve(amount = 25): Float32Array {
  if (cachedDistortionCurve) return cachedDistortionCurve;
  const n_samples = 256;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  cachedDistortionCurve = curve;
  return curve;
}

export interface VoiceTriggerOptions {
  volume?: number; // 0..100
  pitch?: number;  // -12..12 semitones
  kitId?: KitId;
}

/**
 * KICK DRUM
 * - classic-808: Deep clean resonant sub drop (55Hz -> 36Hz)
 * - lofi-dust: Lowpass warm thud with vinyl tape crackle
 * - studio-acoustic: Crisp beater click + 54Hz acoustic shell resonance
 * - future-perc: FM laser glitch sub drop (240Hz -> 46Hz)
 * - jungle-breaks: Hard clipped 90s breakbeat kick with heavy transient punch (180Hz -> 44Hz)
 * - trap-hifi: Long saturated sliding 808 sub bass with high-click attack (0.65s decay)
 * - electro-pop: Punchy gated LinnDrum-style kick (140Hz -> 50Hz, 180ms gate)
 * - boom-bap: Deep slow-attack hip-hop boom (100Hz, long sustain)
 * - acid-techno: TR-909 hard kick with distorted transient (280Hz -> 42Hz, saturated)
 */
export function playKick(ctx: AudioContext, dest: AudioNode, time: number, opts: VoiceTriggerOptions = {}) {
  const gainScale = (opts.volume ?? 80) / 100;
  const kit = opts.kitId ?? 'classic-808';

  if (kit === 'electro-pop') {
    // LinnDrum/Oberheim gated kick: punchy body with tight gate chop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(165, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.03);
    // Hard gate: volume cut at 180ms (gated 80s sound)
    gain.gain.setValueAtTime(1.0 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.5 * gainScale, time + 0.12);
    gain.gain.setValueAtTime(0.5 * gainScale, time + 0.17);
    gain.gain.linearRampToValueAtTime(0.001, time + 0.195); // hard gate chop
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.21);
    // High transient click
    const click = ctx.createOscillator();
    const clickG = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(800, time);
    clickG.gain.setValueAtTime(0.4 * gainScale, time);
    clickG.gain.exponentialRampToValueAtTime(0.001, time + 0.009);
    click.connect(clickG); clickG.connect(dest);
    click.start(time); click.stop(time + 0.011);
    return;
  }

  if (kit === 'boom-bap') {
    // Classic hip-hop boom: slow attack, deep sub, wide punch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(48, time + 0.08);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.42);
    // Slow attack rise then long sustain decay
    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(gainScale, time + 0.018); // slow attack
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    osc.connect(gain); gain.connect(dest);
    osc.start(time); osc.stop(time + 0.52);
    // Thump transient (muffled)
    const thump = ctx.createOscillator();
    const thumpG = ctx.createGain();
    const thumpF = ctx.createBiquadFilter();
    thump.type = 'triangle';
    thump.frequency.setValueAtTime(220, time);
    thump.frequency.exponentialRampToValueAtTime(80, time + 0.025);
    thumpF.type = 'lowpass';
    thumpF.frequency.setValueAtTime(400, time);
    thumpG.gain.setValueAtTime(0.5 * gainScale, time);
    thumpG.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    thump.connect(thumpF); thumpF.connect(thumpG); thumpG.connect(dest);
    thump.start(time); thump.stop(time + 0.045);
    return;
  }

  if (kit === 'acid-techno') {
    // TR-909 hard kick: punchy with distorted transient and long sub decay
    const osc = ctx.createOscillator();
    const drive = ctx.createWaveShaper();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.055);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.38);
    drive.curve = getDistortionCurve(12) as unknown as Float32Array<ArrayBuffer>;
    drive.oversample = '2x';
    gain.gain.setValueAtTime(0.95 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.42);
    osc.connect(drive); drive.connect(gain); gain.connect(dest);
    osc.start(time); osc.stop(time + 0.44);
    // Hard transient click
    const snap = ctx.createOscillator();
    const snapG = ctx.createGain();
    snap.type = 'square';
    snap.frequency.setValueAtTime(1800, time);
    snapG.gain.setValueAtTime(0.6 * gainScale, time);
    snapG.gain.exponentialRampToValueAtTime(0.001, time + 0.011);
    snap.connect(snapG); snapG.connect(dest);
    snap.start(time); snap.stop(time + 0.013);
    return;
  }

  if (kit === 'jungle-breaks') {
    // 90s Amen Break kick: punchy, driven, clipping transient + deep punch
    const osc = ctx.createOscillator();
    const drive = ctx.createWaveShaper();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, time);
    osc.frequency.exponentialRampToValueAtTime(52, time + 0.04);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.22);

    drive.curve = getDistortionCurve(18) as unknown as Float32Array<ArrayBuffer>;
    drive.oversample = '2x';

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, time);
    filter.frequency.exponentialRampToValueAtTime(90, time + 0.15);

    gain.gain.setValueAtTime(1.1 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

    osc.connect(drive);
    drive.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.28);
    return;
  }

  if (kit === 'trap-hifi') {
    // Modern Trap 808: Deep sustained rumbling sub with sharp attack click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, time);
    osc.frequency.exponentialRampToValueAtTime(62, time + 0.045);
    osc.frequency.exponentialRampToValueAtTime(34, time + 0.65);

    gain.gain.setValueAtTime(1.0 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.7 * gainScale, time + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.72);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.74);

    // Hyper-click transient
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(1200, time);
    click.frequency.exponentialRampToValueAtTime(80, time + 0.012);
    clickGain.gain.setValueAtTime(0.6 * gainScale, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
    click.connect(clickGain);
    clickGain.connect(dest);
    click.start(time);
    click.stop(time + 0.018);
    return;
  }

  if (kit === 'studio-acoustic') {
    // Acoustic kick: Punchy beater attack + dual acoustic drum head resonance
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(54, time + 0.04);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.28);

    oscGain.gain.setValueAtTime(0.95 * gainScale, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);

    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.34);

    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(320, time);
    click.frequency.exponentialRampToValueAtTime(80, time + 0.015);
    clickGain.gain.setValueAtTime(0.4 * gainScale, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.018);

    click.connect(clickGain);
    clickGain.connect(dest);
    click.start(time);
    click.stop(time + 0.02);
    return;
  }

  if (kit === 'future-perc') {
    // FM Cyber Kick: Frequency-modulated sub drop with laser transient
    const carrier = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(240, time);
    carrier.frequency.exponentialRampToValueAtTime(46, time + 0.06);

    mod.type = 'square';
    mod.frequency.setValueAtTime(120, time);
    mod.frequency.exponentialRampToValueAtTime(28, time + 0.08);

    modGain.gain.setValueAtTime(180, time);
    modGain.gain.exponentialRampToValueAtTime(1, time + 0.07);

    mod.connect(carrier.frequency);
    carrier.connect(mainGain);
    mainGain.gain.setValueAtTime(0.9 * gainScale, time);
    mainGain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

    mainGain.connect(dest);
    carrier.start(time);
    mod.start(time);
    carrier.stop(time + 0.4);
    mod.stop(time + 0.4);
    return;
  }

  // Classic 808 or Lo-Fi Dust
  const isLofi = kit === 'lofi-dust';
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const startPitch = isLofi ? 120 : 150;
  const endPitch = isLofi ? 44 : 36;
  const decayTime = isLofi ? 0.32 : 0.45;

  osc.type = 'sine';
  osc.frequency.setValueAtTime(startPitch, time);
  osc.frequency.exponentialRampToValueAtTime(endPitch, time + (isLofi ? 0.048 : 0.055));

  gain.gain.setValueAtTime((isLofi ? 0.95 : 0.9) * gainScale, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decayTime);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + decayTime + 0.02);

  // Transient click
  const clickOsc = ctx.createOscillator();
  const clickGain = ctx.createGain();
  clickOsc.type = isLofi ? 'sine' : 'triangle';
  clickOsc.frequency.setValueAtTime(isLofi ? 160 : 220, time);
  clickGain.gain.setValueAtTime(0.3 * gainScale, time);
  clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

  clickOsc.connect(clickGain);
  clickGain.connect(dest);
  clickOsc.start(time);
  clickOsc.stop(time + 0.02);
}

/**
 * SNARE
 * - classic-808: Resonant 185Hz body tone + bright analog noise rattle
 * - lofi-dust: Warm vinyl crackle + low-filtered dusty snap (1400Hz)
 * - studio-acoustic: Crisp woody attack + ringing snare wires
 * - future-perc: Metallic ring-mod zap / laser glitch snap
 * - jungle-breaks: High-pitched 'Amen crack' snare with ringing body & snappy rattle (320Hz peak)
 * - trap-hifi: Ultra-tight snappy trap snare with explosive high-end crack (4500Hz)
 */
export function playSnare(ctx: AudioContext, dest: AudioNode, time: number, opts: VoiceTriggerOptions = {}) {
  const gainScale = (opts.volume ?? 80) / 100;
  const kit = opts.kitId ?? 'classic-808';

  if (kit === 'electro-pop') {
    // 80s LinnDrum style gated snare: fat resonant body + aggressive gated noise
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, time);
    osc.frequency.exponentialRampToValueAtTime(130, time + 0.05);
    oscGain.gain.setValueAtTime(0.85 * gainScale, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.14);

    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, time);
    filter.Q.value = 1.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9 * gainScale, time);
    // Gated cut
    noiseGain.gain.setValueAtTime(0.7 * gainScale, time + 0.14);
    noiseGain.gain.linearRampToValueAtTime(0.001, time + 0.16);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.17);
    return;
  }

  if (kit === 'boom-bap') {
    // Dusty vinyl hip-hop snare: punchy acoustic body + filtered pink noise tail
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(210, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.04);
    oscGain.gain.setValueAtTime(0.9 * gainScale, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.12);

    const noise = ctx.createBufferSource();
    noise.buffer = getPinkBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.Q.value = 2.0;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85 * gainScale, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.24);
    return;
  }

  if (kit === 'acid-techno') {
    // TR-909 style punchy metallic snare crack
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(320, time);
    osc1.frequency.exponentialRampToValueAtTime(175, time + 0.05);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(240, time);
    osc2.frequency.exponentialRampToValueAtTime(140, time + 0.05);
    oscGain.gain.setValueAtTime(0.8 * gainScale, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
    osc1.connect(oscGain);
    osc2.connect(oscGain);
    oscGain.connect(dest);
    osc1.start(time); osc2.start(time);
    osc1.stop(time + 0.13); osc2.stop(time + 0.13);

    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2200, time);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9 * gainScale, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.19);
    return;
  }

  if (kit === 'jungle-breaks') {
    // Amen style high-pitched snare crack (330Hz pitch drop + high sizzle rattle)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, time);
    osc.frequency.exponentialRampToValueAtTime(140, time + 0.05);
    oscGain.gain.setValueAtTime(0.85 * gainScale, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.14);

    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, time);
    filter.Q.value = 2.2;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9 * gainScale, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.18);
    return;
  }

  if (kit === 'trap-hifi') {
    // Modern Trap Snappy Snare: high-tuned tight snap
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, time);
    osc.frequency.exponentialRampToValueAtTime(110, time + 0.035);
    oscGain.gain.setValueAtTime(0.7 * gainScale, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.09);

    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(4500, time);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.95 * gainScale, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
    noise.connect(hp);
    hp.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.13);
    return;
  }

  if (kit === 'future-perc') {
    // Metallic glitch snap with FM modulation
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const carGain = ctx.createGain();

    car.type = 'square';
    car.frequency.setValueAtTime(440, time);
    car.frequency.exponentialRampToValueAtTime(90, time + 0.07);

    mod.type = 'sine';
    mod.frequency.setValueAtTime(880, time);
    modGain.gain.setValueAtTime(600, time);
    modGain.gain.exponentialRampToValueAtTime(1, time + 0.06);

    mod.connect(car.frequency);
    car.connect(carGain);
    carGain.gain.setValueAtTime(0.65 * gainScale, time);
    carGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    carGain.connect(dest);

    car.start(time); mod.start(time);
    car.stop(time + 0.12); mod.stop(time + 0.12);
    return;
  }

  const isLofi = kit === 'lofi-dust';
  const isAcoustic = kit === 'studio-acoustic';

  const bodyFreq = isAcoustic ? 210 : isLofi ? 165 : 185;
  const decay = isAcoustic ? 0.16 : isLofi ? 0.22 : 0.18;

  // 1. Tonal body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(bodyFreq, time);
  osc.frequency.exponentialRampToValueAtTime(isAcoustic ? 110 : 75, time + 0.06);

  oscGain.gain.setValueAtTime((isAcoustic ? 0.7 : 0.6) * gainScale, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  osc.connect(oscGain);
  oscGain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.13);

  // 2. Snare noise rattle
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = isLofi ? 'lowpass' : 'bandpass';
  filter.frequency.setValueAtTime(isLofi ? 1400 : isAcoustic ? 2400 : 1800, time);
  filter.Q.value = isAcoustic ? 2.4 : 1.8;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime((isAcoustic ? 0.8 : 0.7) * gainScale, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(dest);

  noise.start(time);
  noise.stop(time + decay + 0.02);
}

/**
 * CLAP
 * - classic-808: 3 micro-bursts + 1100Hz analog bandpass tail
 * - lofi-dust: Lowpass warm vinyl tape clap (950Hz)
 * - studio-acoustic: Crisp room slap with stereo presence
 * - future-perc: Digital piezo click burst (3000Hz)
 * - jungle-breaks: Oldschool rave warehouse clap with long metallic wash
 * - trap-hifi: Layered 808 clap with sharp mid sizzle
 */
export function playClap(ctx: AudioContext, dest: AudioNode, time: number, opts: VoiceTriggerOptions = {}) {
  const gainScale = (opts.volume ?? 75) / 100;
  const kit = opts.kitId ?? 'classic-808';

  const filter = ctx.createBiquadFilter();
  filter.type = kit === 'lofi-dust' ? 'lowpass' : 'bandpass';
  filter.frequency.setValueAtTime(
    kit === 'lofi-dust' ? 950 : kit === 'studio-acoustic' ? 1600 : kit === 'future-perc' ? 3200 : kit === 'jungle-breaks' ? 1400 : kit === 'trap-hifi' ? 2200 : kit === 'electro-pop' ? 1900 : kit === 'boom-bap' ? 1200 : kit === 'acid-techno' ? 2800 : 1100,
    time
  );
  filter.Q.value = kit === 'future-perc' ? 3.5 : kit === 'jungle-breaks' ? 1.4 : kit === 'acid-techno' ? 3.0 : 2.2;

  const mainGain = ctx.createGain();
  mainGain.gain.setValueAtTime(gainScale * (kit === 'jungle-breaks' ? 0.95 : kit === 'acid-techno' ? 0.9 : 0.82), time);

  // Micro bursts
  const burstTimes = kit === 'future-perc'
    ? [0, 0.006, 0.014]
    : kit === 'jungle-breaks'
    ? [0, 0.012, 0.024, 0.038]
    : kit === 'trap-hifi'
    ? [0, 0.008, 0.016]
    : kit === 'electro-pop'
    ? [0, 0.01, 0.022]
    : kit === 'boom-bap'
    ? [0, 0.015, 0.03]
    : kit === 'acid-techno'
    ? [0, 0.007, 0.015, 0.025]
    : kit === 'studio-acoustic'
    ? [0, 0.009, 0.02]
    : kit === 'lofi-dust'
    ? [0, 0.014, 0.028]
    : [0, 0.011, 0.024];

  burstTimes.forEach((offset) => {
    const burst = ctx.createBufferSource();
    burst.buffer = getNoiseBuffer(ctx);
    const burstGain = ctx.createGain();
    burstGain.gain.setValueAtTime(0.75, time + offset);
    burstGain.gain.exponentialRampToValueAtTime(0.01, time + offset + 0.014);

    burst.connect(filter);
    burst.start(time + offset);
    burst.stop(time + offset + 0.016);
  });

  // Tail
  const tail = ctx.createBufferSource();
  tail.buffer = getNoiseBuffer(ctx);
  const tailGain = ctx.createGain();
  const tailStart = burstTimes[burstTimes.length - 1] + 0.01;
  const tailDecay = kit === 'jungle-breaks' ? 0.35 : kit === 'acid-techno' ? 0.28 : kit === 'electro-pop' ? 0.15 : kit === 'boom-bap' ? 0.24 : kit === 'trap-hifi' ? 0.14 : kit === 'studio-acoustic' ? 0.16 : kit === 'future-perc' ? 0.12 : kit === 'lofi-dust' ? 0.26 : 0.22;

  tailGain.gain.setValueAtTime(0.85, time + tailStart);
  tailGain.gain.exponentialRampToValueAtTime(0.001, time + tailDecay);

  tail.connect(filter);
  filter.connect(tailGain);
  tailGain.connect(mainGain);
  mainGain.connect(dest);

  tail.start(time + tailStart);
  tail.stop(time + tailDecay + 0.02);
}

/**
 * CLOSED HI-HAT
 * - classic-808: 6-oscillator cluster metallic analog hat simulation
 * - lofi-dust: Lowpass filtered vinyl hiss hat (4800Hz)
 * - studio-acoustic: Crisp bright cymbal strike
 * - future-perc: Resonant FM digital zap hat
 * - jungle-breaks: Open-sounding ride-cymbal style break hat
 * - trap-hifi: Ultra-bright crispy 10kHz+ sizzling trap hat (rapid rolls)
 */
export function playClosedHat(ctx: AudioContext, dest: AudioNode, time: number, opts: VoiceTriggerOptions = {}) {
  const gainScale = (opts.volume ?? 70) / 100;
  const kit = opts.kitId ?? 'classic-808';

  if (kit === 'electro-pop') {
    // 80s gated bright digital hat
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(8500, time);
    bp.Q.value = 2.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.038);
    noise.connect(bp);
    bp.connect(gain);
    gain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.042);
    return;
  }

  if (kit === 'boom-bap') {
    // Dusty vinyl hi-hat: mellow filtered pink noise with tape warmth
    const noise = ctx.createBufferSource();
    noise.buffer = getPinkBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(5200, time);
    filter.Q.value = 1.4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.75 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.06);
    return;
  }

  if (kit === 'acid-techno') {
    // Industrial metal 909-style sizzle hat: highpass + resonant peak
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(7500, time);
    const peak = ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.setValueAtTime(9500, time);
    peak.gain.value = 6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
    noise.connect(hp);
    hp.connect(peak);
    peak.connect(gain);
    gain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.05);
    return;
  }

  if (kit === 'classic-808') {
    // Authentic Roland TR-808 Hat: 6 square wave oscillators with detuned ratios
    const fundamental = 40;
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(7000, time);
    bp.Q.value = 1.8;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(8000, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    bp.connect(hp);
    hp.connect(gain);
    gain.connect(dest);

    ratios.forEach((ratio) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(fundamental * ratio * 20, time);
      osc.connect(bp);
      osc.start(time);
      osc.stop(time + 0.05);
    });
    return;
  }

  if (kit === 'trap-hifi') {
    // Ultra high-frequency laser hat (sharp, zero mid-range clutter)
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(10500, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.026); // ultra tight 26ms

    noise.connect(hp);
    hp.connect(gain);
    gain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.03);
    return;
  }

  if (kit === 'future-perc') {
    // FM zap hat
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modG = ctx.createGain();
    const mainG = ctx.createGain();

    car.type = 'triangle';
    car.frequency.setValueAtTime(5500, time);
    mod.type = 'square';
    mod.frequency.setValueAtTime(3200, time);
    modG.gain.setValueAtTime(4000, time);
    modG.gain.exponentialRampToValueAtTime(1, time + 0.025);

    mod.connect(car.frequency);
    car.connect(mainG);
    mainG.gain.setValueAtTime(0.6 * gainScale, time);
    mainG.gain.exponentialRampToValueAtTime(0.001, time + 0.032);
    mainG.connect(dest);

    car.start(time); mod.start(time);
    car.stop(time + 0.04); mod.stop(time + 0.04);
    return;
  }

  // lofi, studio, jungle noise-based hats
  const isLofi = kit === 'lofi-dust';
  const isAcoustic = kit === 'studio-acoustic';
  const isJungle = kit === 'jungle-breaks';

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = isJungle ? 'bandpass' : 'highpass';
  filter.frequency.setValueAtTime(
    isLofi ? 4200 : isAcoustic ? 8500 : isJungle ? 6000 : 7200,
    time
  );
  if (isJungle) filter.Q.value = 1.2;

  const gain = ctx.createGain();
  const decay = isAcoustic ? 0.045 : isLofi ? 0.06 : isJungle ? 0.05 : 0.05;
  gain.gain.setValueAtTime(0.7 * gainScale, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  noise.start(time);
  noise.stop(time + decay + 0.01);
}

/**
 * OPEN HI-HAT
 */
export function playOpenHat(ctx: AudioContext, dest: AudioNode, time: number, opts: VoiceTriggerOptions = {}) {
  const gainScale = (opts.volume ?? 65) / 100;
  const kit = opts.kitId ?? 'classic-808';

  if (kit === 'electro-pop') {
    // 80s bright shimmering open hat (Linn-style) with long gated decay
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(8000, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.85 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    noise.connect(hp);
    hp.connect(gain);
    gain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.32);
    return;
  }

  if (kit === 'boom-bap') {
    // Dusty open ride cymbal wash with vinyl warmth
    const noise = ctx.createBufferSource();
    noise.buffer = getPinkBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4800, time);
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.75 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.48);
    return;
  }

  if (kit === 'acid-techno') {
    // Aggressive grinding 909-style open hat with metallic resonance
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(7000, time);
    const peak = ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.setValueAtTime(8800, time);
    peak.gain.value = 8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.9 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);
    noise.connect(hp);
    hp.connect(peak);
    peak.connect(gain);
    gain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.4);
    return;
  }

  if (kit === 'classic-808') {
    // Roland 808 6-oscillator cluster for authentic open hat metallic ring
    const fundamental = 40;
    const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(7200, time);
    bp.Q.value = 1.5;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(7500, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    bp.connect(hp);
    hp.connect(gain);
    gain.connect(dest);

    ratios.forEach((ratio) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(fundamental * ratio * 20, time);
      osc.connect(bp);
      osc.start(time);
      osc.stop(time + 0.38);
    });
    return;
  }

  const isLofi = kit === 'lofi-dust';
  const isAcoustic = kit === 'studio-acoustic';
  const isFuture = kit === 'future-perc';
  const isJungle = kit === 'jungle-breaks';
  const isTrap = kit === 'trap-hifi';

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = isFuture ? 'bandpass' : 'highpass';
  filter.frequency.setValueAtTime(
    isLofi ? 4200 : isAcoustic ? 7800 : isFuture ? 5800 : isJungle ? 5200 : isTrap ? 9500 : 6800,
    time
  );
  if (isFuture) filter.Q.value = 2.8;

  const gain = ctx.createGain();
  const decay = isAcoustic ? 0.38 : isLofi ? 0.26 : isFuture ? 0.28 : isJungle ? 0.38 : isTrap ? 0.42 : 0.32;
  gain.gain.setValueAtTime((isTrap ? 0.85 : 0.75) * gainScale, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  noise.start(time);
  noise.stop(time + decay + 0.02);
}

/**
 * LOW TOM
 */
export function playTom(ctx: AudioContext, dest: AudioNode, time: number, opts: VoiceTriggerOptions = {}) {
  const gainScale = (opts.volume ?? 70) / 100;
  const kit = opts.kitId ?? 'classic-808';

  const isFuture = kit === 'future-perc';
  const isAcoustic = kit === 'studio-acoustic';
  const isLofi = kit === 'lofi-dust';
  const isJungle = kit === 'jungle-breaks';
  const isTrap = kit === 'trap-hifi';
  const isElectro = kit === 'electro-pop';
  const isBoomBap = kit === 'boom-bap';
  const isAcid = kit === 'acid-techno';

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const startPitch = isFuture ? 340 : isAcoustic ? 140 : isLofi ? 110 : isJungle ? 220 : isTrap ? 175 : isElectro ? 260 : isBoomBap ? 130 : isAcid ? 200 : 125;
  const endPitch = isFuture ? 50 : isAcoustic ? 72 : isLofi ? 54 : isJungle ? 75 : isTrap ? 48 : isElectro ? 70 : isBoomBap ? 52 : isAcid ? 45 : 60;
  const decay = isFuture ? 0.2 : isAcoustic ? 0.25 : isLofi ? 0.32 : isJungle ? 0.28 : isTrap ? 0.35 : isElectro ? 0.22 : isBoomBap ? 0.38 : isAcid ? 0.2 : 0.28;

  osc.type = isFuture ? 'triangle' : isJungle ? 'sawtooth' : isElectro ? 'triangle' : isAcid ? 'sawtooth' : 'sine';
  osc.frequency.setValueAtTime(startPitch, time);
  osc.frequency.exponentialRampToValueAtTime(endPitch, time + 0.1);

  gain.gain.setValueAtTime((isJungle ? 0.75 : 0.85) * gainScale, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + decay + 0.02);
}

/**
 * RIMSHOT
 */
export function playRim(ctx: AudioContext, dest: AudioNode, time: number, opts: VoiceTriggerOptions = {}) {
  const gainScale = (opts.volume ?? 75) / 100;
  const kit = opts.kitId ?? 'classic-808';

  const isFuture = kit === 'future-perc';
  const isLofi = kit === 'lofi-dust';
  const isAcoustic = kit === 'studio-acoustic';
  const isJungle = kit === 'jungle-breaks';
  const isTrap = kit === 'trap-hifi';
  const isElectro = kit === 'electro-pop';
  const isBoomBap = kit === 'boom-bap';
  const isAcid = kit === 'acid-techno';

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const freq = isFuture ? 3200 : isAcoustic ? 1800 : isLofi ? 820 : isJungle ? 1100 : isTrap ? 2600 : isElectro ? 2200 : isBoomBap ? 1250 : isAcid ? 3000 : 1450;
  const decay = isFuture ? 0.02 : isAcoustic ? 0.04 : isLofi ? 0.05 : isJungle ? 0.035 : isTrap ? 0.018 : isElectro ? 0.028 : isBoomBap ? 0.045 : isAcid ? 0.022 : 0.035;

  osc.type = isFuture ? 'square' : isTrap ? 'square' : isAcid ? 'square' : 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  gain.gain.setValueAtTime(0.9 * gainScale, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + decay + 0.01);
}

/**
 * PERCUSSION
 * - classic-808: Authentic dual-oscillator 808 Cowbell (540Hz + 800Hz square waves)
 * - lofi-dust: Low acoustic woodblock
 * - studio-acoustic: Tambourine shaker
 * - future-perc: FM Bell chime
 * - jungle-breaks: Reese Bass Stab (detuned saw oscillators with lowpass filter sweep)
 * - trap-hifi: Tuned synth laser blip
 */
export function playPerc(ctx: AudioContext, dest: AudioNode, time: number, opts: VoiceTriggerOptions = {}) {
  const gainScale = (opts.volume ?? 65) / 100;
  const kit = opts.kitId ?? 'classic-808';

  if (kit === 'electro-pop') {
    // 80s Digital Synth Cowbell (Oberheim / DX style dual square chime)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(620, time);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(940, time);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(980, time);
    filter.Q.value = 3.0;
    gain.gain.setValueAtTime(0.75 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    osc1.connect(filter); osc2.connect(filter);
    filter.connect(gain); gain.connect(dest);
    osc1.start(time); osc2.start(time);
    osc1.stop(time + 0.24); osc2.stop(time + 0.24);
    return;
  }

  if (kit === 'boom-bap') {
    // Vinyl turntable record scratch / chirp
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, time);
    osc.frequency.linearRampToValueAtTime(1400, time + 0.04);
    osc.frequency.linearRampToValueAtTime(320, time + 0.09);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.value = 2.5;
    gain.gain.setValueAtTime(0.7 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(filter); filter.connect(gain); gain.connect(dest);
    osc.start(time); osc.stop(time + 0.14);
    return;
  }

  if (kit === 'acid-techno') {
    // TB-303 Acid resonance squelch stab
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const drive = ctx.createWaveShaper();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130.81, time); // C3
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3600, time);
    filter.frequency.exponentialRampToValueAtTime(260, time + 0.14);
    filter.Q.value = 14; // heavy acid resonance
    drive.curve = getDistortionCurve(16) as unknown as Float32Array<ArrayBuffer>;
    drive.oversample = '2x';
    gain.gain.setValueAtTime(0.85 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.connect(filter); filter.connect(drive); drive.connect(gain); gain.connect(dest);
    osc.start(time); osc.stop(time + 0.2);
    return;
  }

  if (kit === 'classic-808') {
    // Authentic TR-808 Cowbell: two square waves at 540 Hz and 800 Hz through a bandpass filter
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(540, time);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(800, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(840, time);
    filter.Q.value = 2.5;

    gain.gain.setValueAtTime(0.7 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(time); osc2.start(time);
    osc1.stop(time + 0.32); osc2.stop(time + 0.32);
    return;
  }

  if (kit === 'future-perc') {
    // FM Bell chime
    const carrier = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(780, time);
    mod.type = 'square';
    mod.frequency.setValueAtTime(1170, time);

    modGain.gain.setValueAtTime(350, time);
    modGain.gain.exponentialRampToValueAtTime(1, time + 0.12);

    mainGain.gain.setValueAtTime(0.75 * gainScale, time);
    mainGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    mod.connect(carrier.frequency);
    carrier.connect(mainGain);
    mainGain.connect(dest);

    carrier.start(time); mod.start(time);
    carrier.stop(time + 0.18); mod.stop(time + 0.18);
    return;
  }

  if (kit === 'jungle-breaks') {
    // Reese Bass Stab: iconic UK Jungle/DnB bassline stab
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(110, time); // A2
    osc2.frequency.setValueAtTime(112.5, time); // detuned chorus beating

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, time);
    filter.frequency.exponentialRampToValueAtTime(220, time + 0.18);
    filter.Q.value = 3.5;

    gain.gain.setValueAtTime(0.9 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(time); osc2.start(time);
    osc1.stop(time + 0.26); osc2.stop(time + 0.26);
    return;
  }

  if (kit === 'trap-hifi') {
    // Tuned Trap Synth Pluck / Laser blip
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, time);
    osc.frequency.exponentialRampToValueAtTime(220, time + 0.08);

    gain.gain.setValueAtTime(0.85 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.13);
    return;
  }

  if (kit === 'studio-acoustic') {
    // Studio shaker / tambourine strike
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(5400, time);
    filter.Q.value = 2.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7 * gainScale, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(time);
    noise.stop(time + 0.14);
    return;
  }

  // lofi-dust: warm organic woodblock
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(480, time);
  osc.frequency.exponentialRampToValueAtTime(180, time + 0.05);

  gain.gain.setValueAtTime(0.8 * gainScale, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + 0.14);
}

/**
 * Map channel ID to voice generator function
 */
export const VOICE_MAP: Record<string, typeof playKick> = {
  'ch-kick': playKick,
  'ch-snare': playSnare,
  'ch-clap': playClap,
  'ch-chat': playClosedHat,
  'ch-ohat': playOpenHat,
  'ch-tom': playTom,
  'ch-rim': playRim,
  'ch-perc': playPerc,
};
