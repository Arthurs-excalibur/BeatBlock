import React from 'react';
import { DrumChannel } from '../../types';
import { SequencerPad } from './SequencerPad';

interface ChannelRowProps {
  channel: DrumChannel;
  currentStep: number;
  isPlaying: boolean;
  onToggleStep: (channelId: string, stepIndex: number) => void;
  onToggleMute: (channelId: string) => void;
  onToggleSolo: (channelId: string) => void;
  onChangeVolume: (channelId: string, volume: number) => void;
  onPreview?: (channelId: string) => void;
}

export const ChannelRow: React.FC<ChannelRowProps> = ({
  channel, currentStep, isPlaying, onToggleStep, onToggleMute, onToggleSolo, onChangeVolume, onPreview,
}) => (
  <div className={`channel-row neu-raised${channel.mute ? ' is-muted' : ''}${channel.solo ? ' is-solo' : ''}`}>
    <span className="channel-accent" aria-hidden="true" />
    <div className="channel-header">
      <button
        type="button"
        className="channel-name"
        onClick={() => onPreview?.(channel.id)}
        title={`Click to preview ${channel.name}`}
        aria-label={`Preview ${channel.name}`}
      >
        <span className="channel-name-text">{channel.name}</span>
        <span className="channel-badge">{channel.type === 'sample' ? 'SAMPLE' : channel.badge}</span>
      </button>
      <div
        className="channel-volume neu-inset-sm hide-on-mobile"
        role="slider"
        aria-label={`${channel.name} volume`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={channel.volume}
        tabIndex={0}
        title={`Volume: ${Math.round(channel.volume)}%`}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          onChangeVolume(channel.id, Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)));
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') onChangeVolume(channel.id, Math.min(100, channel.volume + 1));
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') onChangeVolume(channel.id, Math.max(0, channel.volume - 1));
        }}
      >
        <span style={{ width: `${Math.max(0, Math.min(100, channel.volume))}%` }} />
      </div>
      <div className="channel-actions">
        <button type="button" aria-label={`${channel.name} Mute`} aria-pressed={channel.mute} onClick={() => onToggleMute(channel.id)} className={`channel-toggle${channel.mute ? ' active mute-active' : ''}`}>M</button>
        <button type="button" aria-label={`${channel.name} Solo`} aria-pressed={channel.solo} onClick={() => onToggleSolo(channel.id)} className={`channel-toggle${channel.solo ? ' active solo-active' : ''}`}>S</button>
      </div>
    </div>
    <div className="step-grid">
      {channel.steps.map((active, stepIdx) => (
        <SequencerPad
          key={stepIdx}
          stepIndex={stepIdx}
          isActive={active}
          isCurrentStep={isPlaying && currentStep === stepIdx}
          channelName={channel.name}
          isMuted={channel.mute}
          onToggle={(idx) => onToggleStep(channel.id, idx)}
        />
      ))}
    </div>
  </div>
);
