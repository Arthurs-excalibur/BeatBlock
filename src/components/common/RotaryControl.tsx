import React, { useRef, useState, useCallback, useEffect } from 'react';

interface RotaryControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const RotaryControl: React.FC<RotaryControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  size = 'md',
  onChange,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number>(0);
  const startValRef = useRef<number>(value);

  // Normalize value to 0..1
  const normalized = Math.min(Math.max((value - min) / (max - min), 0), 1);
  // Map to angle: -135deg to +135deg (270 degree rotation)
  const angle = -135 + normalized * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    const deltaY = startYRef.current - e.clientY;
    const range = max - min;
    const sensitivity = 150; // pixels for full range
    const stepCount = Math.round((deltaY / sensitivity) * (range / step));
    const newVal = Math.min(Math.max(startValRef.current + stepCount * step, min), max);
    onChange(newVal);
  }, [isDragging, disabled, min, max, step, onChange]);

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(Math.min(value + step, max));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(Math.max(value - step, min));
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('pointerup', handleGlobalMouseUp);
    return () => window.removeEventListener('pointerup', handleGlobalMouseUp);
  }, []);

  const sizePx = size === 'sm' ? 36 : size === 'lg' ? 56 : 46;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'ns-resize',
      }}
    >
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--bb-text-secondary)',
        }}
      >
        {label}
      </span>

      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        style={{
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          borderRadius: '50%',
          background: 'var(--bb-surface-raised)',
          boxShadow: isDragging
            ? 'inset 2px 2px 5px var(--bb-shadow), inset -2px -2px 5px var(--bb-highlight)'
            : 'var(--bb-shadow-raised)',
          border: '1px solid var(--bb-border)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'box-shadow var(--bb-motion-fast)',
          touchAction: 'none',
        }}
      >
        {/* Subtle center cap */}
        <div
          style={{
            width: `${sizePx * 0.4}px`,
            height: `${sizePx * 0.4}px`,
            borderRadius: '50%',
            background: 'var(--bb-surface-inset)',
            boxShadow: 'var(--bb-shadow-inset)',
          }}
        />

        {/* Rotary pointer indicator line */}
        <div
          style={{
            position: 'absolute',
            width: '3px',
            height: `${sizePx * 0.28}px`,
            background: isDragging ? 'var(--bb-accent)' : 'var(--bb-text-primary)',
            borderRadius: '2px',
            top: '4px',
            left: 'calc(50% - 1.5px)',
            transformOrigin: `center ${sizePx / 2 - 4}px`,
            transform: `rotate(${angle}deg)`,
            transition: isDragging ? 'none' : 'transform var(--bb-motion-fast)',
          }}
        />
      </div>

      <div
        className="tabular-nums"
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: isDragging ? 'var(--bb-accent-ink)' : 'var(--bb-text-primary)',
          background: 'var(--bb-surface-inset)',
          padding: '1px 6px',
          borderRadius: '4px',
          border: '1px solid var(--bb-border)',
          minWidth: '34px',
          textAlign: 'center',
        }}
      >
        {value}
        {unit}
      </div>
    </div>
  );
};
