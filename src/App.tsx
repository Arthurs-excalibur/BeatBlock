import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_CHANNELS, INITIAL_MASTER_STATE, getKitBadge, PRESET_PATTERNS } from './state/instrumentState';
import { DrumChannel, MasterState, KitId, ViewMode } from './types';
import { LandingPage } from './components/landing/LandingPage';
import { StudioLayout } from './components/studio/StudioLayout';
import { PortraitPrompt } from './components/responsive/PortraitPrompt';
import { SettingsModal } from './components/settings/SettingsModal';
import { audioEngine } from './engine/AudioEngine';
import { getChannelVoiceTypeForKit } from './engine/sampleVoice';
import { type ThemeId } from './components/settings/ThemePicker';
import {
  PatternData, recoverWorkingSession, saveWorkingSession, getNamedPatterns, saveNamedPattern,
  savePatternAs, duplicateNamedPattern, renameNamedPattern, deleteNamedPattern, parsePatternFile, serializePattern,
} from './state/patternPersistence';

const INTRO_STORAGE_KEY = 'beatblock_intro_seen';
const THEME_STORAGE_KEY = 'beatblock_theme';
const REDUCED_MOTION_STORAGE_KEY = 'beatblock_reduced_motion';

export const App: React.FC = () => {
  // First-visit detection
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const seen = localStorage.getItem(INTRO_STORAGE_KEY);
      return seen === 'true' ? 'studio' : 'landing';
    } catch {
      return 'landing';
    }
  });

  // Theme state
  const [theme, setTheme] = useState<ThemeId>(() => {
    try {
      return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeId) || 'light';
    } catch {
      return 'light';
    }
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    try { return localStorage.getItem(REDUCED_MOTION_STORAGE_KEY) === 'true'; }
    catch { return false; }
  });

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Save Toast Feedback
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Responsive Orientation Detection
  const [isPortraitLocked, setIsPortraitLocked] = useState(false);
  const [portraitDismissed, setPortraitDismissed] = useState(false);

  // Recover the last working pattern before initializing React state.
  const [startupSession] = useState<PatternData | null>(() => recoverWorkingSession());
  const [activePatternBank, setActivePatternBank] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [bankPatterns, setBankPatterns] = useState<Record<'A' | 'B' | 'C' | 'D', boolean[][]>>(() => ({
    A: startupSession ? startupSession.channels.map((ch) => [...ch.steps]) : PRESET_PATTERNS.A.map((steps) => [...steps]),
    B: PRESET_PATTERNS.B.map((steps) => [...steps]),
    C: PRESET_PATTERNS.C.map((steps) => [...steps]),
    D: PRESET_PATTERNS.D.map((steps) => [...steps]),
  }));
  const [channels, setChannels] = useState<DrumChannel[]>(() => startupSession
    ? startupSession.channels.map((channel) => ({
        ...channel,
        type: getChannelVoiceTypeForKit(startupSession.kitId, channel.id),
        badge: getKitBadge(startupSession.kitId, channel.id),
      }))
    : INITIAL_CHANNELS);
  const [masterState, setMasterState] = useState<MasterState>(() => startupSession ? ({
    ...INITIAL_MASTER_STATE,
    bpm: startupSession.tempo,
    swing: startupSession.swing,
    masterVolume: startupSession.masterVolume,
    activeKit: startupSession.kitId,
    activePatternName: startupSession.name,
  }) : INITIAL_MASTER_STATE);
  const [activePatternId, setActivePatternId] = useState<string | null>(() => startupSession?.id ?? null);
  const [savedPatterns, setSavedPatterns] = useState<PatternData[]>(() => getNamedPatterns());
  const [storageWarningShown, setStorageWarningShown] = useState(false);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
    try { localStorage.setItem(REDUCED_MOTION_STORAGE_KEY, String(reducedMotion)); }
    catch { /* keep preference for this session */ }
  }, [reducedMotion]);

  useEffect(() => {
    if (startupSession) {
      setSaveToast('Recovered last session');
      const timer = window.setTimeout(() => setSaveToast(null), 3200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [startupSession]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const record: PatternData = {
        id: activePatternId ?? 'working_session',
        name: masterState.activePatternName,
        createdAt: startupSession?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tempo: masterState.bpm,
        swing: masterState.swing,
        masterVolume: masterState.masterVolume,
        kitId: masterState.activeKit,
        channels,
      };
      if (!saveWorkingSession(record) && !storageWarningShown) {
        setStorageWarningShown(true);
        setSaveToast('Storage unavailable — changes will not survive refresh');
      }
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [channels, masterState.bpm, masterState.swing, masterState.masterVolume, masterState.activeKit, masterState.activePatternName, activePatternId, startupSession, storageWarningShown]);

  // Check viewport orientation
  useEffect(() => {
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 768;
      setIsPortraitLocked(isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Synchronize AudioEngine playback with Web Audio API hardware clock
  useEffect(() => {
    if (masterState.isPlaying) {
      audioEngine.start(channels, masterState, (stepIndex) => {
        setMasterState((prev) => ({ ...prev, currentStep: stepIndex }));
      });
    } else {
      audioEngine.stop();
    }
  }, [masterState.isPlaying]);

  // Update running audio engine when pattern, volume, bpm or swing changes
  useEffect(() => {
    if (masterState.isPlaying) {
      audioEngine.updateState(channels, masterState);
    }
  }, [channels, masterState.bpm, masterState.swing, masterState.masterVolume, masterState.activeKit, masterState.isPlaying]);

  // Keyboard shortcut: Spacebar to toggle Play/Stop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target === document.body || (e.target as HTMLElement).tagName === 'BUTTON')) {
        e.preventDefault();
        setMasterState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.dispose();
    };
  }, []);

  // Actions
  const handleOpenStudio = useCallback(() => {
    try {
      localStorage.setItem(INTRO_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    // Prime audio context on user gesture
    audioEngine.init();
    setViewMode('studio');
  }, []);

  const handleReplayIntro = useCallback(() => {
    audioEngine.stop();
    setMasterState((prev) => ({ ...prev, isPlaying: false }));
    setViewMode('landing');
  }, []);

  const handleTogglePlay = useCallback(async () => {
    if (masterState.isPlaying) {
      audioEngine.stop();
      setMasterState((prev) => ({ ...prev, isPlaying: false }));
      return;
    }

    try {
      const audioReady = await audioEngine.init();
      if (!audioReady) {
        audioEngine.stop();
        setSaveToast('Audio unavailable — check browser audio permissions');
        setMasterState((prev) => ({ ...prev, isPlaying: false }));
        return;
      }
      setMasterState((prev) => ({ ...prev, isPlaying: true }));
    } catch {
      audioEngine.stop();
      setSaveToast('Audio unavailable — check browser audio permissions');
      setMasterState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, [masterState.isPlaying]);

  const handleToggleStep = useCallback((channelId: string, stepIndex: number) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        const newSteps = [...ch.steps];
        newSteps[stepIndex] = !newSteps[stepIndex];
        return { ...ch, steps: newSteps };
      })
    );
  }, []);

  const handleToggleMute = useCallback((channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, mute: !ch.mute } : ch))
    );
  }, []);

  const handleToggleSolo = useCallback((channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, solo: !ch.solo } : ch))
    );
  }, []);

  const handleChangeChannelVolume = useCallback((channelId: string, volume: number) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, volume } : ch))
    );
  }, []);

  const handleChangeBpm = useCallback((bpm: number) => {
    setMasterState((prev) => ({ ...prev, bpm }));
  }, []);

  const handleChangeSwing = useCallback((swing: number) => {
    setMasterState((prev) => ({ ...prev, swing }));
  }, []);

  const handleChangeMasterVolume = useCallback((masterVolume: number) => {
    setMasterState((prev) => ({ ...prev, masterVolume }));
  }, []);

  const handleClearPattern = useCallback(() => {
    setChannels((prev) =>
      prev.map((ch) => ({ ...ch, steps: Array(16).fill(false) }))
    );
    setSaveToast('Pattern cleared');
    setTimeout(() => setSaveToast(null), 2000);
  }, []);

  const handleRandomizePattern = useCallback(() => {
    setChannels((prev) =>
      prev.map((ch) => {
        const newSteps = Array(16).fill(false);
        for (let i = 0; i < 16; i++) {
          let prob = 0.1;
          if (ch.id === 'ch-kick') {
            prob = i === 0 ? 0.95 : i === 8 ? 0.75 : i % 2 === 0 ? 0.35 : 0.08;
          } else if (ch.id === 'ch-snare') {
            prob = i === 4 || i === 12 ? 0.9 : i === 14 ? 0.25 : 0.05;
          } else if (ch.id === 'ch-clap') {
            prob = i === 4 || i === 12 ? 0.65 : 0.04;
          } else if (ch.id === 'ch-chat') {
            prob = i % 2 === 0 ? 0.9 : 0.45;
          } else if (ch.id === 'ch-ohat') {
            prob = i === 2 || i === 10 ? 0.5 : 0.08;
          } else if (ch.id === 'ch-tom') {
            prob = i === 7 || i === 11 || i === 15 ? 0.3 : 0.05;
          } else if (ch.id === 'ch-rim') {
            prob = i === 2 || i === 6 ? 0.35 : 0.04;
          } else if (ch.id === 'ch-perc') {
            prob = Math.random() < 0.25 ? 0.4 : 0.06;
          }
          newSteps[i] = Math.random() < prob;
        }
        return { ...ch, steps: newSteps };
      })
    );
    setSaveToast('Groove randomized');
    setTimeout(() => setSaveToast(null), 1800);
  }, []);

  const handleSelectKit = useCallback((kitId: KitId) => {
    setMasterState((prev) => ({ ...prev, activeKit: kitId }));
    setChannels((prev) => prev.map((channel) => ({
      ...channel,
      type: getChannelVoiceTypeForKit(kitId, channel.id),
      badge: getKitBadge(kitId, channel.id),
    })));
    setSaveToast(`Kit loaded: ${kitId.replace('-', ' ').toUpperCase()}`);
    setTimeout(() => setSaveToast(null), 2000);
  }, []);

  const handleSelectPatternBank = useCallback((bank: 'A' | 'B' | 'C' | 'D') => {
    if (bank === activePatternBank) return;
    // Snapshot current active channel steps
    setBankPatterns((prev) => ({
      ...prev,
      [activePatternBank]: channels.map((ch) => [...ch.steps]),
    }));
    // Switch active bank
    setActivePatternBank(bank);
    // Load chosen bank's pattern into channels
    const targetSteps = bankPatterns[bank];
    if (targetSteps && targetSteps.length === channels.length) {
      setChannels((prev) =>
        prev.map((ch, idx) => ({
          ...ch,
          steps: [...(targetSteps[idx] || ch.steps)],
        }))
      );
    }
    setSaveToast(`Pattern Bank ${bank}`);
    setTimeout(() => setSaveToast(null), 1800);
  }, [activePatternBank, channels, bankPatterns]);

  const handlePreviewChannel = useCallback(async (channelId: string) => {
    const channelVolume = channels.find((channel) => channel.id === channelId)?.volume ?? 80;
    const previewReady = await audioEngine.previewChannel(channelId, masterState.activeKit, channelVolume);
    if (!previewReady) setSaveToast('Audio unavailable — check browser audio permissions');
  }, [channels, masterState.activeKit]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const handleSelectTheme = useCallback((id: ThemeId) => {
    setTheme(id);
  }, []);

  const handleToggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => !prev);
  }, []);

  const currentPattern: PatternData = {
    id: activePatternId ?? 'working_session',
    name: masterState.activePatternName,
    createdAt: savedPatterns.find((pattern) => pattern.id === activePatternId)?.createdAt ?? startupSession?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tempo: masterState.bpm,
    swing: masterState.swing,
    masterVolume: masterState.masterVolume,
    kitId: masterState.activeKit,
    channels,
  };

  const handleOpenSave = useCallback(() => {
    if (!saveNamedPattern(currentPattern)) {
      setSaveToast('Could not save pattern — local storage may be full or unavailable');
      return;
    }
    setActivePatternId(currentPattern.id);
    setSavedPatterns(getNamedPatterns());
    setSaveToast('Pattern saved');
    setTimeout(() => setSaveToast(null), 2500);
  }, [currentPattern]);

  const handleSaveAs = useCallback((name: string) => {
    const saved = savePatternAs(currentPattern, name);
    if (!saved) { setSaveToast('Could not save pattern — check storage and pattern name'); return; }
    setActivePatternId(saved.id);
    setMasterState((prev) => ({ ...prev, activePatternName: saved.name }));
    setSavedPatterns(getNamedPatterns());
    setSaveToast(`Saved “${saved.name}”`);
  }, [currentPattern]);

  const handleLoadPattern = useCallback((pattern: PatternData) => {
    setChannels(pattern.channels.map((channel) => ({
      ...channel,
      type: getChannelVoiceTypeForKit(pattern.kitId, channel.id),
      steps: [...channel.steps],
    })));
    setMasterState((prev) => ({ ...prev, bpm: pattern.tempo, swing: pattern.swing, masterVolume: pattern.masterVolume, activeKit: pattern.kitId, activePatternName: pattern.name }));
    setActivePatternId(pattern.id);
    setSaveToast(`Loaded “${pattern.name}”`);
    setTimeout(() => setSaveToast(null), 2200);
  }, []);

  const handleDuplicatePattern = useCallback((id: string) => {
    const duplicate = duplicateNamedPattern(id);
    if (!duplicate) { setSaveToast('Could not duplicate pattern'); return; }
    setSavedPatterns(getNamedPatterns());
    setSaveToast(`Duplicated as “${duplicate.name}”`);
  }, []);

  const handleRenamePattern = useCallback((id: string, name: string) => {
    if (!renameNamedPattern(id, name)) { setSaveToast('Could not rename pattern'); return; }
    const updatedPatterns = getNamedPatterns();
    setSavedPatterns(updatedPatterns);
    if (activePatternId === id) setMasterState((prev) => ({ ...prev, activePatternName: updatedPatterns.find((pattern) => pattern.id === id)?.name ?? name.trim() }));
  }, [activePatternId]);

  const handleDeletePattern = useCallback((id: string) => {
    if (!deleteNamedPattern(id)) { setSaveToast('Could not delete pattern'); return; }
    setSavedPatterns(getNamedPatterns());
    if (activePatternId === id) setActivePatternId(null);
    setSaveToast('Pattern deleted');
  }, [activePatternId]);

  const handleImportPattern = useCallback((raw: string) => {
    try {
      const imported = parsePatternFile(raw);
      handleLoadPattern(imported);
      setSaveToast(`Imported “${imported.name}”`);
    } catch (error) {
      setSaveToast(error instanceof Error ? `Import rejected: ${error.message}` : 'Import rejected: invalid pattern');
    }
  }, [handleLoadPattern]);

  const handleExportPattern = useCallback(() => {
    try {
      const blob = new Blob([serializePattern(currentPattern)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${currentPattern.name.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'beatblock-pattern'}.beatblock.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setSaveToast('Pattern exported');
    } catch {
      setSaveToast('Could not export pattern');
    }
  }, [currentPattern]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Portrait Prompt if on narrow portrait device and not dismissed */}
      {isPortraitLocked && !portraitDismissed && viewMode === 'studio' && (
        <PortraitPrompt onDismissOverride={() => setPortraitDismissed(true)} />
      )}

      {/* Main View Transition */}
      {viewMode === 'landing' ? (
        <LandingPage onOpenStudio={handleOpenStudio} />
      ) : (
        <StudioLayout
          channels={channels}
          masterState={masterState}
          theme={theme}
          onTogglePlay={handleTogglePlay}
          onToggleStep={handleToggleStep}
          onToggleMute={handleToggleMute}
          onToggleSolo={handleToggleSolo}
          onChangeChannelVolume={handleChangeChannelVolume}
          onPreviewChannel={handlePreviewChannel}
          onChangeBpm={handleChangeBpm}
          onChangeSwing={handleChangeSwing}
          onChangeMasterVolume={handleChangeMasterVolume}
          onClearPattern={handleClearPattern}
          onRandomizePattern={handleRandomizePattern}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSave={handleOpenSave}
          onToggleTheme={handleToggleTheme}
          onReplayIntro={handleReplayIntro}
          onSelectKit={handleSelectKit}
          onPreviewKitSound={async (kitId) => {
            const previewReady = await audioEngine.previewChannel('ch-kick', kitId);
            if (!previewReady) setSaveToast('Audio unavailable — check browser audio permissions');
          }}
          activePatternBank={activePatternBank}
          onSelectPatternBank={handleSelectPatternBank}
        />
      )}

      {/* Settings & Customization Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        activeKit={masterState.activeKit}
        channels={channels}
        activePattern={currentPattern}
        activePatternId={activePatternId}
        savedPatterns={savedPatterns}
        onLoadPattern={handleLoadPattern}
        onSavePattern={handleOpenSave}
        onSaveAs={handleSaveAs}
        onDuplicatePattern={handleDuplicatePattern}
        onRenamePattern={handleRenamePattern}
        onDeletePattern={handleDeletePattern}
        onImportPattern={handleImportPattern}
        onExportPattern={handleExportPattern}
        theme={theme}
        onClose={() => setIsSettingsOpen(false)}
        onSelectKit={handleSelectKit}
        onChangeChannelVolume={handleChangeChannelVolume}
        onToggleChannelMute={handleToggleMute}
        onToggleChannelSolo={handleToggleSolo}
        onPreviewChannel={handlePreviewChannel}
        onPreviewKitSound={async (kitId) => {
          const previewReady = await audioEngine.previewChannel('ch-kick', kitId);
          if (!previewReady) setSaveToast('Audio unavailable — check browser audio permissions');
        }}
        onSelectTheme={handleSelectTheme}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={handleToggleReducedMotion}
        onReplayIntro={handleReplayIntro}
      />

      {/* Toast Notification */}
      {saveToast && (
        <div
          role={saveToast.startsWith('Audio unavailable') ? 'alert' : 'status'}
          aria-live={saveToast.startsWith('Audio unavailable') ? 'assertive' : 'polite'}
          style={{
            position: 'fixed',
            bottom: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bb-surface-raised)',
            color: 'var(--bb-text-primary)',
            padding: '10px 20px',
            borderRadius: 'var(--bb-radius-pill)',
            boxShadow: 'var(--bb-shadow-raised)',
            border: '1px solid var(--bb-border)',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 99999,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--bb-accent)',
            }}
          />
          {saveToast}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setSaveToast(null)}
            style={{ border: 0, background: 'transparent', color: 'inherit', fontSize: '18px', lineHeight: 1, cursor: 'pointer', padding: '2px 4px' }}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}
    </div>
  );
};
