import React, { useEffect, useRef, useState } from 'react';
import { X, Check, Play } from 'lucide-react';
import { KitId, DrumChannel } from '../../types';
import type { PatternData } from '../../state/patternPersistence';
import { ThemePicker, type ThemeId } from './ThemePicker';

interface SettingsModalProps {
  isOpen: boolean;
  activeKit: KitId;
  channels: DrumChannel[];
  activePattern: PatternData;
  activePatternId: string | null;
  savedPatterns: PatternData[];
  onLoadPattern: (pattern: PatternData) => void;
  onSavePattern: () => void;
  onSaveAs: (name: string) => void;
  onDuplicatePattern: (id: string) => void;
  onRenamePattern: (id: string, name: string) => void;
  onDeletePattern: (id: string) => void;
  onImportPattern: (raw: string) => void;
  onExportPattern: () => void;
  theme: ThemeId;
  onClose: () => void;
  onSelectKit: (kitId: KitId) => void;
  onChangeChannelVolume: (channelId: string, volume: number) => void;
  onToggleChannelMute: (channelId: string) => void;
  onToggleChannelSolo: (channelId: string) => void;
  onPreviewChannel: (channelId: string) => void;
  onPreviewKitSound?: (kitId: KitId) => void;
  onSelectTheme: (id: ThemeId) => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onReplayIntro?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  activeKit,
  channels,
  activePattern,
  activePatternId,
  savedPatterns,
  onLoadPattern,
  onSavePattern,
  onSaveAs,
  onDuplicatePattern,
  onRenamePattern,
  onDeletePattern,
  onImportPattern,
  onExportPattern,
  theme,
  onClose,
  onSelectKit,
  onChangeChannelVolume,
  onToggleChannelMute,
  onToggleChannelSolo,
  onPreviewChannel,
  onPreviewKitSound,
  onSelectTheme,
  reducedMotion,
  onToggleReducedMotion,
}) => {
  const [activeTab, setActiveTab] = useState<'kits' | 'channels' | 'patterns' | 'appearance' | 'settings'>('kits');
  const [filter, setFilter] = useState<'all' | 'builtin' | 'custom'>('all');
  const [saveAsName, setSaveAsName] = useState('');
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const getFocusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) ?? []);

    dialog?.querySelector<HTMLElement>('[aria-label="Close Settings"]')?.focus();
    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleDialogKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDialogKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Sound kit definitions aligned with Figma 3:1776 and instrumentState.ts
  const kitsList = [
    {
      id: 'lofi-dust' as KitId,
      name: 'Lo-Fi Dust',
      description: 'Original generated drum samples with a warm, dusty character; toms and hand percussion are synthesized.',
      type: 'builtin',
      waveform: [6, 11, 14, 8, 10, 13, 5, 8],
    },
    {
      id: 'studio-acoustic' as KitId,
      name: 'Studio Acoustic',
      description: 'Acoustic-inspired generated kick, snare, and hat samples blended with synthesized toms and hand percussion.',
      type: 'builtin',
      waveform: [4, 8, 12, 10, 6, 9, 7, 4],
    },
    {
      id: 'future-perc' as KitId,
      name: 'Future Percussion',
      description: 'Experimental synthesized modular sounds',
      type: 'builtin',
      waveform: [3, 8, 5, 13, 6, 10, 14, 3],
    },
    {
      id: 'classic-808' as KitId,
      name: 'Classic 808',
      description: 'Synthesized drum sounds with deep resonant sub',
      type: 'builtin',
      waveform: [10, 14, 12, 8, 11, 9, 7, 6],
    },
    {
      id: 'jungle-breaks' as KitId,
      name: 'Jungle Breaks',
      description: 'Pitched Amen-style breakbeats with heavy sub kicks and rave stabs. Classic DnB energy.',
      type: 'builtin',
      waveform: [8, 14, 9, 13, 7, 12, 10, 5],
    },
    {
      id: 'trap-hifi' as KitId,
      name: 'Trap Hi-Fi',
      description: 'Modern trap: crisp 808 sub, snappy snare, rapid hi-hats, and pitched perc stabs.',
      type: 'builtin',
      waveform: [12, 6, 14, 8, 11, 5, 13, 7],
    },
    {
      id: 'electro-pop' as KitId,
      name: 'Electro Pop',
      description: '80s LinnDrum-style electronic snare crack, punchy gated kick, bright synth toms and digital cowbell.',
      type: 'builtin',
      waveform: [9, 13, 7, 11, 5, 14, 8, 10],
    },
    {
      id: 'boom-bap' as KitId,
      name: 'Boom Bap',
      description: 'Classic NY hip-hop: deep punchy kick, vinyl-snap snare, dusty ride hat, raw rimshot.',
      type: 'builtin',
      waveform: [14, 8, 11, 6, 9, 13, 5, 10],
    },
    {
      id: 'acid-techno' as KitId,
      name: 'Acid Techno',
      description: 'TR-909 inspired: hard distorted kick, metallic snare crack, acid bass stab, industrial hats.',
      type: 'builtin',
      waveform: [11, 14, 6, 13, 9, 7, 12, 5],
    },
  ];

  const filteredKits = kitsList.filter((k) => {
    if (filter === 'builtin') return k.type === 'builtin';
    if (filter === 'custom') return k.type === 'custom';
    return true;
  });

  return (
    <div
      className="settings-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'rgba(41, 40, 36, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(12px, 3vw, 24px)',
      }}
      onClick={onClose}
      data-node-id="3:1776"
      data-name="BEATBLOCK Settings Sound Kits"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings and Sound Kit Workspace"
        ref={dialogRef}
        tabIndex={-1}
        className="neu-card settings-modal-dialog"
        style={{
          width: '100%',
          maxWidth: '1440px',
          height: '100%',
          maxHeight: '100%',
          backgroundColor: 'var(--bb-canvas)',
          borderRadius: 'var(--bb-radius-panel)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          className="settings-modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--bb-border)',
            backgroundColor: 'var(--bb-surface-raised)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="font-heading settings-modal-title"
              style={{
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--bb-text-primary)',
              }}
            >
              SETTINGS & SOUND KITS
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-hardware"
            style={{ width: '32px', height: '32px', borderRadius: '8px', padding: 0 }}
            aria-label="Close Settings"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation Pill Bar (Figma: 3:1777 Nav) */}
        <div
          className="settings-nav-bar"
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 24px',
            borderBottom: '1px solid var(--bb-border)',
            backgroundColor: 'var(--bb-canvas)',
          }}
          data-node-id="3:1777"
        >
          <div
            className="neu-inset-sm settings-nav-scroll"
            style={{
              display: 'flex',
              gap: '6px',
              padding: '5px',
              borderRadius: 'var(--bb-radius-md)',
              overflowX: 'auto',
              maxWidth: '100%',
            }}
            data-node-id="3:1778"
          >
            {[
              { id: 'kits', label: 'Sound Kits' },
              { id: 'channels', label: 'Channels' },
              { id: 'patterns', label: 'Patterns' },
              { id: 'appearance', label: 'Appearance' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as 'kits' | 'channels' | 'patterns' | 'appearance' | 'settings')}
                  className="settings-tab-btn"
                  style={{
                    padding: '8px 20px',
                    borderRadius: 'var(--bb-radius-sm)',
                    border: isActive ? '1px solid var(--bb-border)' : '1px solid transparent',
                    backgroundColor: isActive ? 'var(--bb-surface-raised)' : 'transparent',
                    boxShadow: isActive ? 'var(--bb-shadow-raised-sm)' : 'none',
                    color: isActive ? 'var(--bb-text-primary)' : 'var(--bb-text-secondary)',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                  }}
                  data-node-id={isActive ? '3:1779' : '3:1782'}
                >
                  {tab.label}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '25%',
                        right: '25%',
                        height: '2px',
                        backgroundColor: 'var(--bb-accent)',
                      }}
                      data-node-id="3:1781"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div
          className="settings-modal-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
          data-node-id="3:1791"
        >
          {activeTab === 'kits' && (
            <>
              {/* Header & Filter Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
                data-node-id="3:1793"
              >
                <div>
                  <h2
                    className="font-heading"
                    style={{
                      fontSize: '26px',
                      fontWeight: 700,
                      color: 'var(--bb-text-primary)',
                      margin: 0,
                    }}
                    data-node-id="3:1796"
                  >
                    Sound Kits
                  </h2>
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--bb-text-secondary)',
                      margin: '4px 0 0 0',
                    }}
                    data-node-id="3:1798"
                  >
                    Choose the voice of your instrument. Previews play instantly.
                  </p>
                </div>

                {/* Filter Pills */}
                <div
                  className="neu-inset-sm"
                  style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '4px',
                    borderRadius: 'var(--bb-radius-sm)',
                  }}
                  data-node-id="3:1799"
                >
                  {(['all', 'builtin', 'custom'] as const).map((f) => {
                    const isFActive = filter === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '4px',
                          border: isFActive ? '1px solid var(--bb-border)' : 'none',
                          backgroundColor: isFActive ? 'var(--bb-surface-raised)' : 'transparent',
                          boxShadow: isFActive ? 'var(--bb-shadow-raised-sm)' : 'none',
                          color: isFActive ? 'var(--bb-text-primary)' : 'var(--bb-text-secondary)',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}
                      >
                        {f === 'all' ? 'All' : f === 'builtin' ? 'Built-in' : 'Custom'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid of Sound Kit Cards (Figma: 3:1806) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                }}
                data-node-id="3:1806"
              >
                {filteredKits.map((kit) => {
                  const isSelected = activeKit === kit.id;

                  return (
                    <div
                      key={kit.id}
                      className="neu-raised"
                      style={{
                        padding: '20px',
                        borderRadius: 'var(--bb-radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '160px',
                        border: isSelected ? '2px solid var(--bb-accent)' : '1px solid var(--bb-border)',
                        position: 'relative',
                        boxShadow: isSelected
                          ? 'var(--bb-shadow-orange-glow), var(--bb-shadow-raised)'
                          : 'var(--bb-shadow-raised)',
                      }}
                      data-node-id={isSelected ? '3:1876' : '3:1807'}
                    >
                      {/* Selected Badge */}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '14px',
                            right: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            border: '1px solid var(--bb-border)',
                            backgroundColor: 'var(--bb-surface-raised)',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'var(--bb-accent-ink)',
                          }}
                          data-node-id="3:1900"
                        >
                          <Check size={12} strokeWidth={3} />
                          SELECTED
                        </div>
                      )}

                      {/* Kit Title & Info */}
                      <div>
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: 'var(--bb-text-primary)',
                            margin: 0,
                          }}
                          data-node-id="3:1810"
                        >
                          {kit.name}
                        </h3>
                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--bb-text-secondary)',
                            margin: '4px 0 0 0',
                          }}
                          data-node-id="3:1812"
                        >
                          {kit.description}
                        </p>
                      </div>

                      {/* Card Bottom Row: Waveform Bars + Select + Preview */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '20px',
                        }}
                        data-node-id="3:1813"
                      >
                        {/* Waveform graphic */}
                        <div
                          role="img"
                          aria-label={`${kit.name} waveform preview`}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '4px',
                            height: '18px',
                          }}
                          data-node-id="3:1814"
                        >
                          {kit.waveform.map((barH, bIdx) => (
                            <div
                              key={bIdx}
                              style={{
                                width: '4px',
                                height: `${barH}px`,
                                borderRadius: '9999px',
                                backgroundColor: isSelected ? 'var(--bb-accent)' : 'var(--bb-text-secondary)',
                                opacity: isSelected ? 1 : 0.6,
                              }}
                            />
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectKit(kit.id);
                            }}
                            className="btn-hardware"
                            style={{
                              padding: '6px 16px',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              backgroundColor: isSelected ? 'var(--bb-surface-inset)' : 'var(--bb-surface-raised)',
                              color: isSelected ? 'var(--bb-accent)' : 'var(--bb-text-primary)',
                            }}
                            data-node-id="3:1824"
                            aria-label={isSelected ? `${kit.name} loaded` : `Load ${kit.name} kit`}
                          >
                            {isSelected ? 'Loaded' : 'Load Kit'}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreviewKitSound?.(kit.id);
                            }}
                            className="btn-hardware"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '9999px',
                              padding: 0,
                            }}
                            data-node-id="3:1826"
                            aria-label={`Preview ${kit.name} sound`}
                            title={`Preview ${kit.name} sound`}
                          >
                            <Play size={13} fill="var(--bb-text-primary)" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredKits.length === 0 && (
                  <p role="status" style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: 'var(--bb-text-secondary)' }}>
                    No custom sound kits yet. Your built-in kits are ready to use above.
                  </p>
                )}
              </div>
            </>
          )}

          {activeTab === 'channels' && (
            <section aria-label="Channel Strip Configuration" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Channel Strip Configuration</h2>
                <p style={{ fontSize: '13px', color: 'var(--bb-text-secondary)', margin: '6px 0 0' }}>
                  Adjust level, mute or solo a channel, and preview its current kit voice.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {channels.map((ch) => (
                  <article key={ch.id} className="neu-raised-sm channel-config-row" style={{ padding: '14px 16px', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'minmax(110px, 1fr) minmax(150px, 2fr) auto auto auto', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '14px' }}>{ch.name}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--bb-text-secondary)' }}>{ch.badge}</div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                      <span>Level</span>
                      <input type="range" min="0" max="100" step="1" value={ch.volume} aria-label={`${ch.name} channel volume`} onChange={(event) => onChangeChannelVolume(ch.id, Number(event.target.value))} style={{ width: '100%', accentColor: 'var(--bb-accent)' }} />
                      <output aria-live="off" style={{ width: '38px', textAlign: 'right' }}>{Math.round(ch.volume)}%</output>
                    </label>
                    <button type="button" className="btn-hardware" aria-label={`${ch.name} Mute`} aria-pressed={ch.mute} onClick={() => onToggleChannelMute(ch.id)} style={{ padding: '7px 10px', color: ch.mute ? 'var(--bb-accent-ink)' : undefined }}>Mute</button>
                    <button type="button" className="btn-hardware" aria-label={`${ch.name} Solo`} aria-pressed={ch.solo} onClick={() => onToggleChannelSolo(ch.id)} style={{ padding: '7px 10px', color: ch.solo ? 'var(--bb-accent-ink)' : undefined }}>Solo</button>
                    <button type="button" className="btn-hardware" aria-label={`Preview ${ch.name}`} onClick={() => onPreviewChannel(ch.id)} style={{ padding: '7px 10px' }}><Play size={14} /><span>Preview</span></button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'patterns' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h2 className="font-heading" style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Pattern Library</h2>
                <p style={{ fontSize: '13px', color: 'var(--bb-text-secondary)', margin: '5px 0 0' }}>
                  Save and recall grooves locally. Loading a pattern keeps playback running.
                </p>
              </div>
              <section className="neu-raised-sm" aria-label="Current pattern" style={{ padding: '14px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div><strong>{activePattern.name}</strong><div style={{ fontSize: '12px', color: 'var(--bb-text-secondary)' }}>{activePattern.tempo} BPM · Swing {activePattern.swing}%</div></div>
                <button type="button" className="btn-hardware" onClick={onSavePattern} style={{ padding: '8px 14px' }}>Save Current</button>
              </section>
              <form onSubmit={(event) => { event.preventDefault(); if (saveAsName.trim()) { onSaveAs(saveAsName); setSaveAsName(''); } }} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input aria-label="New pattern name" value={saveAsName} onChange={(event) => setSaveAsName(event.target.value)} placeholder={`Save “${activePattern.name}” as…`} maxLength={64} style={{ flex: '1 1 220px', minWidth: 0, padding: '9px 12px', border: '1px solid var(--bb-border)', borderRadius: '8px', background: 'var(--bb-surface-raised)', color: 'var(--bb-text-primary)' }} />
                <button type="submit" className="btn-hardware" disabled={!saveAsName.trim()} style={{ padding: '8px 14px' }}>Save As</button>
                <button type="button" className="btn-hardware" onClick={onExportPattern} style={{ padding: '8px 14px' }}>Export JSON</button>
                <label className="btn-hardware" htmlFor="pattern-import-file" style={{ padding: '8px 14px' }}>Import JSON</label>
                <input id="pattern-import-file" type="file" accept=".json,.beatblock.json,application/json" aria-label="Import pattern JSON file" style={{ display: 'none' }} onChange={async (event) => {
                  const file = event.currentTarget.files?.[0];
                  if (!file) return;
                  try { onImportPattern(await file.text()); } catch { onImportPattern(''); }
                  event.currentTarget.value = '';
                }} />
              </form>
              <div role="list" aria-label="Saved patterns" style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {savedPatterns.length === 0 && <div style={{ padding: '18px', textAlign: 'center', color: 'var(--bb-text-secondary)' }}>No saved patterns yet. Save the current groove to add it here.</div>}
                {savedPatterns.map((pattern) => (
                  <article role="listitem" key={pattern.id} className="neu-raised-sm" style={{ padding: '12px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '150px', flex: '1 1 180px' }}>
                      {editingPatternId === pattern.id ? (
                        <form onSubmit={(event) => { event.preventDefault(); onRenamePattern(pattern.id, renameDraft); setEditingPatternId(null); }} style={{ display: 'flex', gap: '6px' }}>
                          <input aria-label={`Rename ${pattern.name}`} value={renameDraft} onChange={(event) => setRenameDraft(event.target.value)} maxLength={64} autoFocus style={{ minWidth: 0, width: '100%', padding: '6px 8px', border: '1px solid var(--bb-border)', borderRadius: '6px', background: 'var(--bb-surface-raised)', color: 'var(--bb-text-primary)' }} />
                          <button className="btn-hardware" type="submit" aria-label="Confirm rename" style={{ padding: '5px 8px' }}><Check size={14} /></button>
                          <button className="btn-hardware" type="button" aria-label="Cancel rename" onClick={() => setEditingPatternId(null)} style={{ padding: '5px 8px' }}><X size={14} /></button>
                        </form>
                      ) : <><strong>{pattern.name}</strong>{activePatternId === pattern.id && <span style={{ marginLeft: '8px', color: 'var(--bb-accent-ink)', fontSize: '10px', fontWeight: 700 }}>ACTIVE</span>}<div style={{ fontSize: '12px', color: 'var(--bb-text-secondary)' }}>{pattern.tempo} BPM · {pattern.kitId.replace('-', ' ')} · {new Date(pattern.updatedAt).toLocaleDateString()}</div></>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button type="button" className="btn-hardware" onClick={() => { onLoadPattern(pattern); onClose(); }} style={{ padding: '6px 10px' }}>Load</button>
                      <button type="button" className="btn-hardware" onClick={() => onDuplicatePattern(pattern.id)} style={{ padding: '6px 10px' }}>Duplicate</button>
                      <button type="button" className="btn-hardware" onClick={() => { setRenameDraft(pattern.name); setEditingPatternId(pattern.id); }} style={{ padding: '6px 10px' }}>Rename</button>
                      {confirmDeleteId === pattern.id ? <><button type="button" className="btn-hardware" onClick={() => { onDeletePattern(pattern.id); setConfirmDeleteId(null); }} style={{ padding: '6px 10px', color: 'var(--bb-error)' }}>Confirm Delete</button><button type="button" className="btn-hardware" onClick={() => setConfirmDeleteId(null)} style={{ padding: '6px 10px' }}>Cancel</button></> : <button type="button" className="btn-hardware" onClick={() => setConfirmDeleteId(pattern.id)} style={{ padding: '6px 10px', color: 'var(--bb-error)' }}>Delete</button>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  Appearance & Theme
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--bb-text-secondary)', margin: '5px 0 0' }}>
                  Choose a colour palette — changes apply instantly to the whole instrument.
                </p>
              </div>
              <ThemePicker activeTheme={theme} onSelectTheme={onSelectTheme} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Settings & Accessibility</h2>
              <section className="neu-raised-sm" style={{ padding: '16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 650 }}>Reduced Motion</div>
                  <div style={{ fontSize: '12px', color: 'var(--bb-text-secondary)' }}>
                    {reducedMotion ? 'Enabled — interface transitions are minimized' : 'Disabled — follows your operating-system preference'}
                  </div>
                </div>
                <button type="button" className="btn-hardware" aria-pressed={reducedMotion} onClick={onToggleReducedMotion} style={{ padding: '8px 16px' }}>
                  {reducedMotion ? 'Turn Off' : 'Turn On'} Reduced Motion
                </button>
              </section>
              <section className="neu-raised-sm" style={{ padding: '16px', borderRadius: '10px' }}>
                <strong>Keyboard shortcut</strong>
                <div style={{ marginTop: '5px', fontSize: '12px', color: 'var(--bb-text-secondary)' }}>Space toggles playback when focus is not in a text field.</div>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="settings-modal-footer"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--bb-border)',
            backgroundColor: 'var(--bb-surface-raised)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-hardware btn-primary-orange btn-settings-close-main"
            style={{
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: 'var(--bb-radius-sm)',
            }}
          >
            Back to Studio
          </button>
        </div>
      </div>
    </div>
  );
};
