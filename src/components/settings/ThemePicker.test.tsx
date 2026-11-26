import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemePicker } from './ThemePicker';
import { App } from '../../App';

describe('ThemePicker', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders all 8 theme cards and marks the active theme as selected', () => {
    const onSelectTheme = vi.fn();
    render(<ThemePicker activeTheme="ocean" onSelectTheme={onSelectTheme} />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(8);

    const oceanOption = screen.getByRole('option', { name: 'Ocean Deep theme' });
    expect(oceanOption.getAttribute('aria-selected')).toBe('true');

    fireEvent.click(screen.getByRole('option', { name: 'Midnight Indigo theme' }));
    expect(onSelectTheme).toHaveBeenCalledWith('midnight');
  });

  it('switches themes in Settings -> Appearance and persists to localStorage and data-theme', () => {
    localStorage.setItem('beatblock_intro_seen', 'true');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Settings and Kit Library' }));
    fireEvent.click(screen.getByRole('button', { name: 'Appearance' }));

    const emberOption = screen.getByRole('option', { name: 'Ember Forge theme' });
    fireEvent.click(emberOption);

    expect(document.documentElement.getAttribute('data-theme')).toBe('ember');
    expect(localStorage.getItem('beatblock_theme')).toBe('ember');
    expect(emberOption.getAttribute('aria-selected')).toBe('true');
  });
});
