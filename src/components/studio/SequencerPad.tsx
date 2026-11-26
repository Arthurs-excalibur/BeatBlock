import React from 'react';

interface SequencerPadProps {
  stepIndex: number;
  isActive: boolean;
  isCurrentStep: boolean;
  channelName: string;
  isMuted?: boolean;
  onToggle: (stepIndex: number) => void;
}

export const SequencerPad: React.FC<SequencerPadProps> = ({
  stepIndex,
  isActive,
  isCurrentStep,
  channelName,
  isMuted = false,
  onToggle,
}) => {
  const isDownbeat = stepIndex % 4 === 0;
  const groupIdx = Math.floor(stepIndex / 4);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={`${channelName} Step ${stepIndex + 1}${isActive ? ' (Active)' : ''}${isCurrentStep ? ' (Current Playhead)' : ''}`}
      onClick={() => onToggle(stepIndex)}
      className={`step-pad pad-group-${groupIdx}${isActive ? ' is-active' : ''}${isCurrentStep ? ' is-current' : ''}${isDownbeat ? ' is-downbeat' : ''}${isMuted ? ' is-muted' : ''}`}
      data-node-id={isActive ? '3:1006' : '3:1007'}
    >
      {/* Playhead Center Dot when active */}
      {isCurrentStep && isActive && (
        <span className="pad-playhead-dot-active" />
      )}

      {/* When playhead sweeps inactive pad: signal orange pip */}
      {isCurrentStep && !isActive && (
        <span className="pad-playhead-pip" />
      )}

      {/* Downbeat accent dot when not playhead and not active */}
      {!isCurrentStep && !isActive && isDownbeat && (
        <span className="pad-downbeat-pip" />
      )}

      {/* Active step center indicator pip */}
      {!isCurrentStep && isActive && !isMuted && (
        <span className="pad-active-pip" />
      )}
    </button>
  );
};
