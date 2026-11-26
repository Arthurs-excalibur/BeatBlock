import { DrumChannel, MasterState, KitId } from '../types';
import { audioContextManager } from './AudioContextManager';
import { scheduler, OnStepCallback } from './Scheduler';
import { sampleVoiceBank, triggerChannelVoice } from './sampleVoice';

export class AudioEngine {
  private startGeneration = 0;
  private preparedKit: KitId | null = null;
  private loadingKit: KitId | null = null;
  private latestKit: KitId | null = null;
  private latestChannels: DrumChannel[] | null = null;
  private latestMasterState: MasterState | null = null;

  public async init(): Promise<boolean> {
    return await audioContextManager.ensureReady();
  }

  public isReady(): boolean {
    return audioContextManager.isRunning();
  }

  public async start(
    channels: DrumChannel[],
    masterState: MasterState,
    onStep: OnStepCallback
  ): Promise<boolean> {
    const generation = ++this.startGeneration;
    this.latestKit = masterState.activeKit;
    this.latestChannels = channels;
    this.latestMasterState = masterState;
    if (!(await this.init())) return false;

    const ctx = audioContextManager.getContext();
    let kitToStart = masterState.activeKit;
    // Load samples before scheduling the first step; unavailable clips use their synth fallback.
    await sampleVoiceBank.loadKit(ctx, kitToStart);
    if (generation !== this.startGeneration) return false;

    let latestState = this.latestMasterState ?? masterState;
    while (latestState.activeKit !== kitToStart) {
      kitToStart = latestState.activeKit;
      await sampleVoiceBank.loadKit(ctx, kitToStart);
      if (generation !== this.startGeneration) return false;
      latestState = this.latestMasterState ?? latestState;
    }

    const stateToStart = this.latestMasterState ?? masterState;
    this.preparedKit = stateToStart.activeKit;
    audioContextManager.setMasterVolume(stateToStart.masterVolume);
    scheduler.start(this.latestChannels ?? channels, stateToStart, onStep);
    return true;
  }

  public stop() {
    this.startGeneration += 1;
    scheduler.stop();
  }

  public updateState(channels: DrumChannel[], masterState: MasterState) {
    this.latestChannels = channels;
    this.latestMasterState = masterState;
    audioContextManager.setMasterVolume(masterState.masterVolume);
    scheduler.updateState(channels, masterState);
    this.latestKit = masterState.activeKit;
    if (!audioContextManager.isRunning() || this.preparedKit === masterState.activeKit || this.loadingKit === masterState.activeKit) return;

    const kitId = masterState.activeKit;
    this.loadingKit = kitId;
    void sampleVoiceBank.loadKit(audioContextManager.getContext(), kitId).finally(() => {
      if (this.latestKit === kitId) this.preparedKit = kitId;
      if (this.loadingKit === kitId) this.loadingKit = null;
    });
  }

  public async previewChannel(channelId: string, kitId: KitId, volume = 80): Promise<boolean> {
    try {
      if (!(await this.init())) return false;
      const ctx = audioContextManager.getContext();
      await sampleVoiceBank.loadKit(ctx, kitId);
      return triggerChannelVoice(ctx, audioContextManager.getMasterInput(), ctx.currentTime, kitId, channelId, volume) !== 'missing';
    } catch {
      return false;
    }
  }

  public dispose() {
    this.stop();
    this.preparedKit = null;
    this.loadingKit = null;
    this.latestKit = null;
    this.latestChannels = null;
    this.latestMasterState = null;
    audioContextManager.dispose();
  }
}

export const audioEngine = new AudioEngine();
