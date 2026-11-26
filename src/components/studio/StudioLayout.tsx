import React, { useState } from 'react';
import { DrumChannel, MasterState, KitId } from '../../types';
import { TopBar } from './TopBar';
import { ChannelRow } from './ChannelRow';
import { TransportBar } from './TransportBar';
import { ChevronDown } from 'lucide-react';

interface StudioLayoutProps {
  channels: DrumChannel[];
  masterState: MasterState;
  theme: 'light' | 'dark';
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

  return (
    <div className={`studio-layout${isTopBarHidden ? ' topbar-collapsed' : ''}`} data-name="BEATBLOCK Studio">
      <div className="device-body">
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
  </div>
  );
};
