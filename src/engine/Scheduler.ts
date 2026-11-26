import { DrumChannel, MasterState } from '../types';
import { audioContextManager } from './AudioContextManager';
import { calculate16thInterval, calculateStepTime } from './schedulerMath';
import { triggerChannelVoice } from './sampleVoice';

export type OnStepCallback = (stepIndex: number) => void;

/**
 * Audio Clock Lookahead Scheduler.
 * Wakes up every 25ms and schedules events up to 100ms in advance onto the Web Audio hardware clock.
 * Dispatches UI playhead updates synchronized precisely to the scheduled audio time.
 */
export class Scheduler {
  private timerId: number | null = null;
  private isRunning = false;
  private nextStepTime = 0;
  private currentStep = 0;
  private loopStartTime = 0;

  // Active snapshot references
  private channels: DrumChannel[] = [];
  private masterState: MasterState | null = null;
  private onStep: OnStepCallback | null = null;

  // Lookahead settings
  private readonly lookaheadMs = 25;
  private readonly scheduleAheadTime = 0.1; // 100ms

  public start(
    channels: DrumChannel[],
    masterState: MasterState,
    onStep: OnStepCallback
  ) {
    this.channels = channels;
    this.masterState = masterState;
    this.onStep = onStep;

    const ctx = audioContextManager.getContext();
    this.isRunning = true;
    this.currentStep = 0;

    // Start slightly in the future (50ms) to allow smooth audio priming
    this.loopStartTime = ctx.currentTime + 0.05;
    this.nextStepTime = this.loopStartTime;

    this.timerId = window.setInterval(() => {
      this.scheduleLoop();
    }, this.lookaheadMs);
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public updateState(channels: DrumChannel[], masterState: MasterState) {
    this.channels = channels;
    this.masterState = masterState;
  }

  private scheduleLoop() {
    if (!this.isRunning || !this.masterState) return;

    const ctx = audioContextManager.getContext();

    // Check if any channels are soloed
    const hasSolo = this.channels.some((c) => c.solo);

    // Schedule while next event is within the lookahead window
    while (this.nextStepTime < ctx.currentTime + this.scheduleAheadTime) {
      const stepToSchedule = this.currentStep;
      const scheduledTime = this.nextStepTime;

      // 1. Trigger audio for all eligible channels
      for (const channel of this.channels) {
        // Skip if muted or if other channels are soloed and this channel is not solo
        if (channel.mute) continue;
        if (hasSolo && !channel.solo) continue;

        // Check if step is active in pattern
        if (channel.steps[stepToSchedule]) {
          triggerChannelVoice(
            ctx,
            audioContextManager.getMasterInput(),
            scheduledTime,
            this.masterState.activeKit,
            channel.id,
            channel.volume,
            channel.pitch,
          );
        }
      }

      // 2. Schedule UI visual callback synchronized with the audio clock
      const delayMs = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
      window.setTimeout(() => {
        if (this.isRunning && this.onStep) {
          this.onStep(stepToSchedule);
        }
      }, delayMs);

      // 3. Advance to the next step
      this.currentStep = (this.currentStep + 1) % 16;
      if (this.currentStep === 0) {
        // Advanced a full 16-step bar: reset loop start time to maintain zero cumulative drift
        const barInterval = calculate16thInterval(this.masterState.bpm) * 16;
        this.loopStartTime += barInterval;
      }

      this.nextStepTime = calculateStepTime(
        this.loopStartTime,
        this.currentStep,
        this.masterState.bpm,
        this.masterState.swing
      );
    }
  }
}

export const scheduler = new Scheduler();
