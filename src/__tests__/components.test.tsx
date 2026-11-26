import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '../App';
import { audioEngine } from '../engine/AudioEngine';
import { INITIAL_CHANNELS } from '../state/instrumentState';
import { saveWorkingSession, type PatternData } from '../state/patternPersistence';

describe('App & Component Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('shows the landing page on first visit when intro has not been seen', () => {
    render(<App />);
    expect(screen.getByText('BEAT')).toBeDefined();
    expect(screen.getByText('Make beats. Feel the rhythm. A tactile neumorphic drum machine in your browser.')).toBeDefined();
    expect(screen.getByText(/OPEN THE STUDIO/i)).toBeDefined();
  });

  it('transitions from landing to main studio when clicking OPEN THE STUDIO', () => {
    render(<App />);
    const openBtn = screen.getByText(/OPEN THE STUDIO/i);
    fireEvent.click(openBtn);

    // Studio is now visible
    expect(screen.getByText('PLAY')).toBeDefined();
    expect(screen.getByText(/KICK/i)).toBeDefined();
    expect(screen.getByText(/SNARE/i)).toBeDefined();
    expect(screen.getByText(/TEMPO/i)).toBeDefined();
  });

  it('opens studio directly on returning visit if intro seen flag is stored', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);
    expect(screen.getByText('PLAY')).toBeDefined();
    expect(screen.getAllByText(/808/i).length).toBeGreaterThan(0);
  });

  it('restores the working session and allows dismissing recovery feedback', async () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    const now = new Date().toISOString();
    const recovered: PatternData = {
      id: 'working_session', name: 'Recovery QA', createdAt: now, updatedAt: now,
      tempo: 137, swing: 20, masterVolume: 65, kitId: 'lofi-dust', channels: INITIAL_CHANNELS,
    };
    expect(saveWorkingSession(recovered)).toBe(true);
    render(<App />);

    const toast = await screen.findByText('Recovered last session');
    expect(screen.getByText('Recovery QA')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Recovered last session')).toBeNull();
    expect(toast).toBeDefined();
  });

  it('communicates audio initialization failures without entering playback', async () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    vi.spyOn(audioEngine, 'init').mockResolvedValue(false);
    render(<App />);
    fireEvent.click(screen.getByLabelText('Start Playback'));
    expect(await screen.findByText(/Audio unavailable/i)).toBeDefined();
    expect(screen.getByLabelText('Start Playback')).toBeDefined();
  });

  it('communicates audio initialization failures when previewing a kit', async () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    vi.spyOn(audioEngine, 'init').mockResolvedValue(false);
    render(<App />);
    fireEvent.click(screen.getByLabelText(/Settings and Kit Library/i));
    fireEvent.click(screen.getByRole('button', { name: 'Preview Lo-Fi Dust sound' }));
    expect(await screen.findByText(/Audio unavailable/i)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Load Lo-Fi Dust kit' })).toBeDefined();
  });

  it('falls back to an in-memory session when browser storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage denied'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage denied'); });
    render(<App />);
    fireEvent.click(screen.getByText(/OPEN THE STUDIO/i));
    expect(screen.getByText('PLAY')).toBeDefined();
    expect(await screen.findByText(/Storage unavailable — changes will not survive refresh/i)).toBeDefined();
  });

  it('closes the settings dialog on Escape and restores focus to its trigger', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);
    const trigger = screen.getByLabelText(/Settings and Kit Library/i);
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeDefined();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('traps Tab and Shift+Tab inside the settings dialog', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);
    fireEvent.click(screen.getByLabelText(/Settings and Kit Library/i));
    const closeButton = screen.getByLabelText('Close Settings');
    const lastButton = screen.getByRole('button', { name: 'Back to Studio' });
    expect(document.activeElement).toBe(closeButton);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastButton);
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);
  });

  it('renders meaningful channel metadata without invalid numeric IDs', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);

    expect(document.body.textContent).not.toContain('NaN');
    expect(screen.getByText('Kick Drum')).toBeDefined();
    expect(screen.getByText('808 BOOM')).toBeDefined();
    expect(screen.getAllByRole('button', { name: / mute$/i })).toHaveLength(8);
    expect(screen.getAllByRole('button', { name: / solo$/i })).toHaveLength(8);
  });

  it('renders all 8 channel strips and 128 sequencer pad buttons in studio', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);

    const pads = screen.getAllByRole('switch');
    expect(pads).toHaveLength(128); // 8 channels * 16 steps = 128
  });

  it('toggles a sequencer pad when clicked', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);

    const pads = screen.getAllByRole('switch');
    const firstPad = pads[0];
    const initialChecked = firstPad.getAttribute('aria-checked');

    fireEvent.click(firstPad);
    expect(firstPad.getAttribute('aria-checked')).not.toBe(initialChecked);
  });

  it('toggles playback with the transport PLAY/STOP button', async () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);

    const playBtn = screen.getByText('PLAY');
    fireEvent.click(playBtn);

    expect(await screen.findByText('STOP')).toBeDefined();

    const stopBtn = screen.getByText('STOP');
    fireEvent.click(stopBtn);

    expect(await screen.findByText('PLAY')).toBeDefined();
  });

  it('opens settings workspace and allows selecting a different sound kit', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);

    const settingsBtn = screen.getByLabelText(/Settings and Kit Library/i);
    fireEvent.click(settingsBtn);

    expect(screen.getByText('SETTINGS & SOUND KITS')).toBeDefined();
    expect(screen.getByText('Lo-Fi Dust')).toBeDefined();
    expect(screen.getByText('Studio Acoustic')).toBeDefined();
    expect(screen.getByText('Future Percussion')).toBeDefined();

    // Previewing must not replace the selected kit.
    fireEvent.click(screen.getByRole('button', { name: 'Preview Lo-Fi Dust sound' }));
    expect(screen.getByRole('button', { name: 'Load Lo-Fi Dust kit' })).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Load Lo-Fi Dust kit' }));
    expect(screen.getAllByText('SAMPLE')).toHaveLength(4);

    // Close settings modal
    fireEvent.click(screen.getByText('Back to Studio'));
    expect(screen.getAllByText(/lofi dust/i).length).toBeGreaterThanOrEqual(1);
  });

  it('edits channel volume and mute state in the Channels workspace', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);
    fireEvent.click(screen.getByLabelText(/Settings and Kit Library/i));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Channels' }));

    const volume = within(dialog).getByRole('slider', { name: 'Kick Drum channel volume' });
    fireEvent.change(volume, { target: { value: '37' } });
    expect(volume).toHaveProperty('value', '37');

    const mute = within(dialog).getByRole('button', { name: 'Kick Drum Mute' });
    fireEvent.click(mute);
    expect(mute.getAttribute('aria-pressed')).toBe('true');
  });

  it('persists the reduced-motion accessibility preference', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);
    fireEvent.click(screen.getByLabelText(/Settings and Kit Library/i));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Settings' }));
    const toggle = within(dialog).getByRole('button', { name: 'Turn On Reduced Motion' });
    fireEvent.click(toggle);
    expect(localStorage.getItem('beatblock_reduced_motion')).toBe('true');
    expect(document.documentElement.dataset.reducedMotion).toBe('true');
  });

  it('shows a clear empty state for custom kits and returns from settings to the studio', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);
    fireEvent.click(screen.getByLabelText(/Settings and Kit Library/i));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Custom' }));
    expect(within(dialog).getByText(/No custom sound kits yet/i)).toBeDefined();
    fireEvent.click(within(dialog).getByText('Back to Studio'));
    expect(screen.getByText('PLAY')).toBeDefined();
  });
});
