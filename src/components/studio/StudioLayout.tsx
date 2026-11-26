import React, { useState } from 'react';
import { DrumChannel, MasterState, KitId, ThemeId } from '../../types';
import { TopBar } from './TopBar';
import { ChannelRow } from './ChannelRow';
import { TransportBar } from './TransportBar';
import { ChevronDown } from 'lucide-react';

interface StudioLayoutProps {
  channels: DrumChannel[];
  masterState: MasterState;
  theme: ThemeId;
  onTogglePlay: () => void;
  onToggleStep: (channelId: string, stepIndex: number) => void;
  onToggleMute: (channelId: string) => void;
  onToggleSolo: (channelId: string) => void;
  onChangeChannelVolume: (channelId: string, volume: number) => void;
  onPreviewChannel: (channelId: string) => void;
  onChangeBpm: (bpm: number) => void;
  onChangeSwing: (swing: number) => void;
  onChangeMasterVolume: (vol: number) => void;
  onClearPattern: () => void;
  onRandomizePattern?: () => void;
  onOpenSettings: () => void;
  onOpenSave: () => void;
  onToggleTheme: () => void;
  onReplayIntro: () => void;
  onSelectKit?: (kitId: KitId) => void;
  onPreviewKitSound?: (kitId: KitId) => void;
  activePatternBank?: 'A' | 'B' | 'C' | 'D';
  onSelectPatternBank?: (bank: 'A' | 'B' | 'C' | 'D') => void;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({
  channels,
  masterState,
  theme,
  onTogglePlay,
  onToggleStep,
  onToggleMute,
  onToggleSolo,
  onChangeChannelVolume,
  onPreviewChannel,
  onChangeBpm,
  onChangeSwing,
  onChangeMasterVolume,
  onClearPattern,
  onRandomizePattern,
  onOpenSettings,
  onOpenSave,
  onToggleTheme,
  onReplayIntro,
  onSelectKit,
  onPreviewKitSound,
  activePatternBank = 'A',
  onSelectPatternBank,
}) => {
  const [isTopBarHidden, setIsTopBarHidden] = useState(false);

  const handleKnobDrag = (
    e: React.PointerEvent<HTMLDivElement>,
    currentVal: number,
    min: number,
    max: number,
    onCommit: (val: number) => void,
  ) => {
    e.preventDefault();
    const startY = e.clientY;
    const startVal = currentVal;
    const target = e.currentTarget;
    target.setPointerCapture?.(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const delta = startY - ev.clientY;
      const next = Math.round(Math.max(min, Math.min(max, startVal + delta * ((max - min) / 110))));
      onCommit(next);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className={`studio-layout${isTopBarHidden ? ' topbar-collapsed' : ''}`} data-name="BEATBLOCK Studio">
      <div className="device-shell-shadow">
        <div className="device-body">
        <div className="device-chassis-left">
          {isTopBarHidden && (
            <button
              type="button"
              onClick={() => setIsTopBarHidden(false)}
              className="btn-hardware btn-show-topbar-mobile mobile-only-btn"
              aria-label="Show Top Bar"
              title="Show Top Bar"
            >
              <ChevronDown size={14} />
              <span>BAR</span>
            </button>
          )}
          <div className={`topbar-wrapper${isTopBarHidden ? ' is-hidden' : ''}`}>
            <TopBar
              activeKit={masterState.activeKit}
              activePatternName={masterState.activePatternName}
              theme={theme}
              onOpenSettings={onOpenSettings}
              onOpenSave={onOpenSave}
              onToggleTheme={onToggleTheme}
              onReplayIntro={onReplayIntro}
              onSelectKit={onSelectKit}
              onPreviewKitSound={onPreviewKitSound}
              onToggleCollapseMobile={() => setIsTopBarHidden(true)}
              isCollapsedMobile={isTopBarHidden}
            />
          </div>
          {/* BB-01 Hardware Top Row: 8 Dark Charcoal Channel Level Knobs */}
          <div className="hardware-knob-deck hide-on-mobile" aria-label="Channel Volume Knobs">
            <div className="knob-deck-spacer">
              <span className="knob-deck-label">LEVEL</span>
            </div>
            <div className="knob-deck-grid">
              {channels.map((ch) => {
                const angle = -135 + (Math.max(0, Math.min(100, ch.volume)) / 100) * 270;
                return (
                  <div key={ch.id} className="hw-knob-slot" title={`${ch.name}: ${Math.round(ch.volume)}%`}>
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label={`${ch.name} level knob`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(ch.volume)}
                      className="hw-charcoal-knob"
                      onPointerDown={(e) => handleKnobDrag(e, ch.volume, 0, 100, (v) => onChangeChannelVolume(ch.id, v))}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                          e.preventDefault();
                          onChangeChannelVolume(ch.id, Math.min(100, ch.volume + 2));
                        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                          e.preventDefault();
                          onChangeChannelVolume(ch.id, Math.max(0, ch.volume - 2));
                        }
                      }}
                    >
                      <span
                        className="hw-charcoal-knob-cap"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <span className="hw-charcoal-knob-notch" />
                      </span>
                    </div>
                    <span className="hw-knob-caption">{ch.name.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <main className="sequencer-workspace">
            <div className="step-header">
              <div className="channel-header-spacer" />
              <div className="step-grid step-number-grid" aria-label="Sequencer step numbers">
                {Array.from({ length: 16 }, (_, stepIdx) => {
                  const isDownbeat = stepIdx % 4 === 0;
                  const isCurrent = masterState.isPlaying && masterState.currentStep === stepIdx;
                  const groupIdx = Math.floor(stepIdx / 4);
                  return (
                    <div
                      key={stepIdx}
                      className={`step-number group-${groupIdx}${isDownbeat ? ' beat-start' : ''}${isCurrent ? ' current-step' : ''}`}
                    >
                      <span>{stepIdx + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="channel-list">
              {channels.map((channel) => (
                <ChannelRow
                  key={channel.id}
                  channel={channel}
                  currentStep={masterState.currentStep}
                  isPlaying={masterState.isPlaying}
                  onToggleStep={onToggleStep}
                  onToggleMute={onToggleMute}
                  onToggleSolo={onToggleSolo}
                  onChangeVolume={onChangeChannelVolume}
                  onPreview={onPreviewChannel}
                />
              ))}
            </div>
          </main>
        </div>

        <aside className="device-chassis-right" aria-label="Master & Transport Section">
          <TransportBar
            isPlaying={masterState.isPlaying}
            currentStep={masterState.currentStep}
            bpm={masterState.bpm}
            swing={masterState.swing}
            masterVolume={masterState.masterVolume}
            activePatternBank={activePatternBank}
            activeKit={masterState.activeKit}
            onTogglePlay={onTogglePlay}
            onChangeBpm={onChangeBpm}
            onChangeSwing={onChangeSwing}
            onChangeMasterVolume={onChangeMasterVolume}
            onClearPattern={onClearPattern}
            onRandomizePattern={onRandomizePattern}
            onSelectPatternBank={onSelectPatternBank}
            onOpenKitSelector={onOpenSettings}
            onSelectKit={onSelectKit}
            onPreviewKitSound={onPreviewKitSound}
          />
        </aside>
        </div>
      </div>
    </div>
  );
};
