import React from 'react';

interface PortraitPromptProps {
  onDismissOverride?: () => void;
}

export const PortraitPrompt: React.FC<PortraitPromptProps> = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'var(--bb-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(24px, 5vh, 48px) 24px',
        textAlign: 'center',
      }}
      data-node-id="3:1731"
      data-name="BEATBLOCK Portrait Orientation Notice"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
        data-node-id="3:1732"
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '2px',
            backgroundColor: 'var(--bb-accent)',
          }}
          data-node-id="3:1734"
        />
        <span
          className="font-heading"
          style={{
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: 'var(--bb-text-primary)',
          }}
          data-node-id="3:1736"
        >
          BEATBLOCK
        </span>
      </div>

      {/* Center Phone Rotation Graphic */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          maxWidth: '340px',
          width: '100%',
        }}
      >
        {/* Animated Phone Graphic */}
        <div
          style={{
            position: 'relative',
            width: '180px',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          data-node-id="3:1737"
        >
          {/* Outer Rotating Device Silhouette */}
          <div
            className="neu-raised"
            style={{
              width: '74px',
              height: '124px',
              borderRadius: '16px',
              border: '2px solid var(--bb-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 4px',
              animation: 'bbRotatePhone 3s ease-in-out infinite',
            }}
            data-node-id="3:1742"
          >
            {/* Speaker bar */}
            <div
              style={{
                width: '24px',
                height: '3px',
                borderRadius: '9999px',
                backgroundColor: 'var(--bb-text-secondary)',
                opacity: 0.4,
              }}
            />

            {/* Orange screen accent */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--bb-accent)',
                opacity: 0.85,
                boxShadow: 'var(--bb-shadow-orange-glow)',
              }}
            />

            {/* Home indicator bar */}
            <div
              style={{
                width: '36px',
                height: '3px',
                borderRadius: '9999px',
                backgroundColor: 'var(--bb-text-secondary)',
                opacity: 0.4,
              }}
            />
          </div>

          <style>
            {`
              @keyframes bbRotatePhone {
                0%, 20% { transform: rotate(0deg); }
                45%, 75% { transform: rotate(90deg); }
                95%, 100% { transform: rotate(0deg); }
              }
            `}
          </style>
        </div>

        {/* Text */}
        <div data-node-id="3:1758">
          <h1
            className="font-heading"
            style={{
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--bb-text-primary)',
              margin: '0 0 12px 0',
            }}
            data-node-id="3:1760"
          >
            Turn up the<br />groove.
          </h1>

          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.5,
              color: 'var(--bb-text-secondary)',
              margin: 0,
            }}
            data-node-id="3:1762"
          >
            Rotate your device to landscape for the full studio experience.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: 'var(--bb-text-secondary)',
        }}
        data-node-id="3:1763"
      >
        <span data-node-id="3:1773">Works best in landscape · Nothing to install</span>
      </div>
    </div>
  );
};
