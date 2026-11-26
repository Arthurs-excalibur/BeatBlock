/**
 * Manages the Web Audio API AudioContext lifecycle.
 * Ensures a single shared context, handles browser autoplay user gesture requirements,
 * and configures a master output limiter (DynamicsCompressorNode) to prevent clipping.
 */

export class AudioContextManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Limiter setup
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-1.0, this.ctx.currentTime);
      this.limiter.knee.setValueAtTime(4.0, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(20.0, this.ctx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiter.release.setValueAtTime(0.05, this.ctx.currentTime);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

      // Graph: Voice Nodes -> Master Gain -> Limiter -> Destination
      this.masterGain.connect(this.limiter);
      this.limiter.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public getMasterInput(): GainNode {
    this.getContext();
    return this.masterGain!;
  }

  public setMasterVolume(volumePercent: number) {
    if (!this.masterGain || !this.ctx) return;
    const safeVolume = Math.max(0, Math.min(100, volumePercent)) / 100;
    this.masterGain.gain.setValueAtTime(safeVolume, this.ctx.currentTime);
  }

  /**
   * Resumes the AudioContext if suspended. Must be called from a user interaction.
   */
  public async ensureReady(): Promise<boolean> {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume failed:', err);
        return false;
      }
    }
    return ctx.state === 'running';
  }

  public isRunning(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  public dispose() {
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // ignore
      }
      this.ctx = null;
      this.masterGain = null;
      this.limiter = null;
    }
  }
}

export const audioContextManager = new AudioContextManager();
