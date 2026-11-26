import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Square, Minus, Plus, Volume2, VolumeX, ChevronDown, Check, Settings } from 'lucide-react';
import { KitId } from '../../types';
import { INITIAL_KITS } from '../../state/instrumentState';

interface TransportBarProps {
  isPlaying: boolean;
  currentStep?: number;
  bpm: number;
  swing: number;
  masterVolume: number;
  activePatternBank?: 'A' | 'B' | 'C' | 'D';
  activeKit?: KitId;
  onTogglePlay: () => void;
  onChangeBpm: (bpm: number) => void;
  onChangeSwing: (swing: number) => void;
  onChangeMasterVolume: (vol: number) => void;
  onClearPattern?: () => void;
  onRandomizePattern?: () => void;
  onSelectPatternBank?: (bank: 'A' | 'B' | 'C' | 'D') => void;
  onOpenKitSelector?: () => void;
  onSelectKit?: (kitId: KitId) => void;
  onPreviewKitSound?: (kitId: KitId) => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  isPlaying,
  bpm,
  swing,
  masterVolume,
  activePatternBank = 'A',
  activeKit = 'classic-808',
  onTogglePlay,
  onChangeBpm,
  onChangeSwing,
  onChangeMasterVolume,
  onClearPattern,
  onRandomizePattern,
  onSelectPatternBank,
  onOpenKitSelector,
  onSelectKit,
  onPreviewKitSound,
}) => {
  const patternBanks: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  // Tap tempo state
  const tapTimesRef = useRef<number[]>([]);
  const [tapActive, setTapActive] = useState(false);
  const [prevVolume, setPrevVolume] = useState(80);

  // Kit dropdown state
  const [isKitMenuOpen, setIsKitMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const kitDropdownRef = useRef<HTMLDivElement>(null);
  const kitButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  const getKitDisplayName = (id: KitId): string => {
    switch (id) {
      case 'lofi-dust':
        return 'Lo-Fi Dust';
      case 'studio-acoustic':
        return 'Studio Acoustic';
      case 'future-perc':
        return 'Future Percussion';
      case 'jungle-breaks':
        return 'Jungle Breaks';
      case 'trap-hifi':
        return 'Trap Hi-Fi';
      case 'electro-pop':
        return 'Electro Pop';
      case 'boom-bap':
        return 'Boom Bap';
      case 'acid-techno':
        return 'Acid Techno';
      case 'classic-808':
      default:
        return 'Classic 808';
    }
  };

  const kitDisplayName = getKitDisplayName(activeKit);

  // Position calculation for dropdown
  const updateDropdownPosition = () => {
    if (kitButtonRef.current) {
      const rect = kitButtonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth <= 900;
      if (isMobile) {
        setMenuPosition({
          top: Math.min(window.innerHeight - 300, Math.max(10, rect.bottom + 6)),
          left: Math.max(10, Math.min(window.innerWidth - 300, rect.left)),
        });
      } else {
        setMenuPosition({
          top: rect.bottom + 6,
          left: Math.max(8, rect.left),
        });
      }
    }
  };

  // Close kit dropdown on click outside or escape, and update position on scroll/resize
  useEffect(() => {
    if (!isKitMenuOpen) return;
    updateDropdownPosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        kitButtonRef.current &&
        !kitButtonRef.current.contains(target) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(target)
      ) {
        setIsKitMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsKitMenuOpen(false);
    };
    const handleReposition = () => {
      updateDropdownPosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isKitMenuOpen]);

  const handleKitButtonClick = () => {
    if (onSelectKit) {
      setIsKitMenuOpen((prev) => {
        if (!prev) updateDropdownPosition();
        return !prev;
      });
    } else if (onOpenKitSelector) {
      onOpenKitSelector();
    }
  };

  const handleSwingCycle = () => {
    // Cycle swing: 0 -> 25 -> 50 -> 65 -> 0
    const nextSwing = swing === 0 ? 25 : swing === 25 ? 50 : swing === 50 ? 65 : 0;
    onChangeSwing(nextSwing);
  };

  const handleTapTempo = () => {
    const now = performance.now();
    const tapTimes = tapTimesRef.current.filter((t) => now - t < 2500);
    tapTimes.push(now);
    tapTimesRef.current = tapTimes;

    setTapActive(true);
    setTimeout(() => setTapActive(false), 120);

    if (tapTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimes.length; i++) {
        intervals.push(tapTimes[i] - tapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval > 200 && avgInterval < 1500) {
        const calculatedBpm = Math.round(60000 / avgInterval);
        onChangeBpm(Math.max(40, Math.min(240, calculatedBpm)));
      }
    }
  };

  const handleHalfBpm = () => {
    onChangeBpm(Math.max(40, Math.round(bpm / 2)));
  };

  const handleDoubleBpm = () => {
    onChangeBpm(Math.min(240, bpm * 2));
  };

  const handleToggleMasterMute = () => {
    if (masterVolume > 0) {
      setPrevVolume(masterVolume);
      onChangeMasterVolume(0);
    } else {
      onChangeMasterVolume(prevVolume > 0 ? prevVolume : 80);
    }
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '8.5px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--bb-text-secondary)',
    whiteSpace: 'nowrap',
    lineHeight: 1,
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '26px',
    background: 'var(--bb-border)',
    flexShrink: 0,
  };

  return (
    <section
      className="transport-bar"
      data-node-id="3:883"
      data-name="TransportBar"
    >
      {/* Top: Kit Selector & Pattern Banks */}
      <div className="wing-top-section">
        <div className="kit-selector-wrapper" ref={kitDropdownRef}>
          <button
            ref={kitButtonRef}
            type="button"
            onClick={handleKitButtonClick}
            className="btn-hardware kit-selector-btn"
            aria-label="Sound Kit Selector"
            aria-expanded={isKitMenuOpen}
            aria-haspopup="listbox"
          >
            <span className="kit-label-prefix">Kit:</span>
            <span className="kit-name-value">{kitDisplayName}</span>
            <ChevronDown size={11} className={`kit-chevron${isKitMenuOpen ? ' rotate-180' : ''}`} />
          </button>

          {/* Hardware Kit Dropdown — Rendered in Portal so it floats above everything */}
          {isKitMenuOpen && onSelectKit && createPortal(
            <div
              ref={dropdownMenuRef}
              className="kit-dropdown-menu neu-raised"
              role="listbox"
              aria-label="Select Sound Kit"
              style={menuPosition ? {
                position: 'fixed',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                zIndex: 99999,
              } : undefined}
            >
              <div className="kit-dropdown-header">
                <span>SOUND KITS</span>
                <span className="kit-dropdown-subtitle">HOT-SWAP PRESETS</span>
              </div>
              <div className="kit-dropdown-list">
                {INITIAL_KITS.map((kit) => {
                  const isCurrent = kit.id === activeKit;
                  return (
                    <div
                      key={kit.id}
                      role="option"
                      aria-selected={isCurrent}
                      className={`kit-dropdown-item${isCurrent ? ' selected' : ''}`}
                      onClick={() => {
                        onSelectKit(kit.id);
                        setIsKitMenuOpen(false);
                      }}
                    >
                      <div className="kit-item-info">
                        <div className="kit-item-name-row">
                          <span className="kit-item-name">{kit.name}</span>
                          <span className="kit-item-tag">{kit.tag}</span>
                        </div>
                        <span className="kit-item-desc">{kit.description}</span>
                      </div>
                      <div className="kit-item-actions">
                        {onPreviewKitSound && (
                          <button
                            type="button"
                            className="kit-item-preview-btn"
                            title={`Preview ${kit.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreviewKitSound(kit.id);
                            }}
                          >
                            <Volume2 size={12} />
                          </button>
                        )}
                        {isCurrent && <Check size={14} className="kit-check-icon" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="kit-dropdown-footer">
                <button
                  type="button"
                  className="btn-hardware kit-footer-btn"
                  onClick={() => {
                    setIsKitMenuOpen(false);
                    onOpenKitSelector?.();
                  }}
                >
                  <Settings size={11} />
                  <span>Kit Library & Custom Kits...</span>
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* Pattern banks (A, B, C, D) */}
        <div className="transport-pattern-banks-group">
          <div
            className="neu-inset-sm pattern-banks-container"
            aria-label="Pattern Bank Selector"
          >
            {patternBanks.map((bank) => {
              const isActive = activePatternBank === bank;
              return (
                <button
                  key={bank}
                  type="button"
                  onClick={() => onSelectPatternBank?.(bank)}
                  className={`pattern-bank-btn${isActive ? ' active' : ''}`}
                  aria-label={`Pattern ${bank}${isActive ? ' (Active)' : ''}`}
                >
                  {bank}
                </button>
              );
            })}
          </div>
          <span className="wing-label" style={labelStyle}>BANK</span>
        </div>
      </div>

      <div className="wing-divider" style={dividerStyle} />

      {/* Middle: Hardware Control Cluster (TEMPO, SWING, VOL, TOOLS) */}
      <div className="wing-controls-grid">
        {/* Tempo / BPM Hardware Dial & Multipliers */}
        <div className="wing-control-cell transport-control-group">
          <div
            className="wing-knob-cap wing-knob-rotatable"
            aria-hidden="true"
            style={{ transform: `rotate(${-135 + ((bpm - 40) / 200) * 270}deg)` }}
          >
            <span className="wing-knob-notch" />
          </div>
          <div className="wing-tempo-row">
            <button
              type="button"
              onClick={() => onChangeBpm(Math.max(40, bpm - 1))}
              className="btn-hardware btn-bpm-step"
              aria-label="Decrease BPM"
            >
              <Minus size={11} strokeWidth={2.5} />
            </button>

            <div className="transport-display-readout">
              <span className="transport-value font-mono">{bpm}</span>
              <span className="wing-label" style={labelStyle}>TEMPO</span>
            </div>

            <button
              type="button"
              onClick={() => onChangeBpm(Math.min(240, bpm + 1))}
              className="btn-hardware btn-bpm-step"
              aria-label="Increase BPM"
            >
              <Plus size={11} strokeWidth={2.5} />
            </button>
          </div>

          {/* Global Tempo Tools: TAP, /2, 2x */}
          <div className="transport-tempo-tools">
            <button
              type="button"
              onClick={handleTapTempo}
              className={`btn-hardware btn-tempo-tool${tapActive ? ' active-tap' : ''}`}
              title="Tap tempo rhythmically to set BPM"
              aria-label="Tap Tempo"
            >
              TAP
            </button>
            <button
              type="button"
              onClick={handleHalfBpm}
              className="btn-hardware btn-tempo-tool"
              title="Half tempo (/2)"
              aria-label="Half Tempo"
            >
              /2
            </button>
            <button
              type="button"
              onClick={handleDoubleBpm}
              className="btn-hardware btn-tempo-tool"
              title="Double tempo (2x)"
              aria-label="Double Tempo"
            >
              2x
            </button>
          </div>
        </div>

        {/* Swing cycle */}
        <div className="wing-control-cell">
          <button
            type="button"
            onClick={handleSwingCycle}
            className="btn-swing-toggle"
            aria-label={`Swing: ${swing}%. Click to cycle`}
            title="Cycle swing: 0%, 25%, 50%, 65%"
          >
            <span
              className="wing-knob-cap wing-knob-rotatable"
              aria-hidden="true"
              style={{ transform: `rotate(${-135 + (swing / 65) * 270}deg)` }}
            >
              <span className="wing-knob-notch" />
            </span>
            <span className="transport-value font-mono">
              {swing}<span style={{ fontSize: '11px' }}>%</span>
            </span>
            <span className="wing-label" style={labelStyle}>SWING</span>
          </button>
        </div>

        {/* Master Volume slider & Mute button */}
        <div className="wing-control-cell transport-volume-group">
          <div
            className="wing-knob-cap wing-knob-rotatable"
            aria-hidden="true"
            style={{ transform: `rotate(${-135 + (masterVolume / 100) * 270}deg)` }}
          >
            <span className="wing-knob-notch" />
          </div>
          <div className="master-volume-header">
            <button
              type="button"
              onClick={handleToggleMasterMute}
              className="btn-master-mute"
              title={masterVolume === 0 ? 'Unmute Master' : 'Mute Master Output'}
              aria-label={masterVolume === 0 ? 'Unmute Master' : 'Mute Master Output'}
            >
              {masterVolume === 0 ? (
                <VolumeX size={13} color="var(--bb-error)" />
              ) : (
                <Volume2 size={13} color="currentColor" />
              )}
            </button>
            <span className="wing-label" style={labelStyle}>VOL {masterVolume}</span>
          </div>
          <div
            className="master-volume-track neu-inset-sm"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onChangeMasterVolume(Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100));
            }}
            role="slider"
            aria-label="Master Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={masterVolume}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChangeMasterVolume(Math.min(100, masterVolume + 1));
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChangeMasterVolume(Math.max(0, masterVolume - 1));
            }}
          >
            <div
              className="master-volume-fill"
              style={{ width: `${masterVolume}%` }}
            />
          </div>
        </div>

        {/* Creative & Global Tools: Randomize & Clear */}
        <div className="wing-control-cell transport-utility-tools">
          <div className="wing-tools-stack">
            {onRandomizePattern && (
              <button
                type="button"
                onClick={onRandomizePattern}
                className="btn-hardware btn-utility-tool"
                title="Randomize / Generate musical groove variation"
                aria-label="Randomize Pattern"
              >
                <span>RAND</span>
              </button>
            )}

            {onClearPattern && (
              <button
                type="button"
                onClick={onClearPattern}
                className="btn-hardware btn-utility-tool btn-clear-pattern"
                title="Clear active pattern"
                aria-label="Clear active pattern"
              >
                <span>CLEAR</span>
              </button>
            )}
          </div>
          <span className="wing-label" style={labelStyle}>PATTERN</span>
        </div>
      </div>

      {/* Bottom Deck: Large Tactile Grey PLAY Key + Perforated Speaker Grille */}
      <div className="wing-bottom-deck">
        <button
          type="button"
          onClick={onTogglePlay}
          className={`btn-transport-play${isPlaying ? ' is-playing' : ''}`}
          aria-label={isPlaying ? 'Stop Playback' : 'Start Playback'}
        >
          {isPlaying ? (
            <>
              <Square size={18} fill="currentColor" strokeWidth={0} />
              <span className="btn-transport-text">STOP</span>
            </>
          ) : (
            <>
              <Play size={20} fill="currentColor" strokeWidth={0} style={{ marginLeft: '2px' }} />
              <span className="btn-transport-text">PLAY</span>
            </>
          )}
        </button>

        <div
          className={`wing-speaker-grille${isPlaying ? ' is-playing' : ''}`}
          aria-hidden="true"
        />
      </div>
    </section>
  );
};
