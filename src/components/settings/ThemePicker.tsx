import React from 'react';
import { Check } from 'lucide-react';
import type { ThemeId } from '../../types';

export type { ThemeId };

interface ThemeDef {
  id: ThemeId;
  name: string;
  subtitle: string;
  dark: boolean;
  /** CSS gradient string used as the blob swatch */
  blob: string;
  /** Solid background colour for the card */
  cardBg: string;
  /** Text colour inside the card */
  cardText: string;
  /** Accent colour chip */
  accent: string;
}

const THEMES: ThemeDef[] = [
  {
    id: 'light',
    name: 'Warm Ivory',
    subtitle: 'Soft neumorphic daylight',
    dark: false,
    blob: 'radial-gradient(circle at 35% 40%, #F6C89A 0%, #F0A87A 35%, #E07840 60%, #C45820 100%)',
    cardBg: '#F2EFE8',
    cardText: '#292824',
    accent: '#F07832',
  },
  {
    id: 'dark',
    name: 'Dark Obsidian',
    subtitle: 'Charcoal hardware shell',
    dark: true,
    blob: 'radial-gradient(circle at 35% 40%, #6A5A40 0%, #3E3020 40%, #1E1810 70%, #0A0804 100%)',
    cardBg: '#292825',
    cardText: '#F2EFE8',
    accent: '#F07832',
  },
  {
    id: 'dusk',
    name: 'Dusk Rose',
    subtitle: 'Warm blush & magenta',
    dark: false,
    blob: `radial-gradient(circle at 65% 55%, #F5D0E8 0%, #E890C0 30%, #C4517A 55%, #8B2050 85%, #5A0A30 100%)`,
    cardBg: '#FAF4F8',
    cardText: '#2A1F27',
    accent: '#C4517A',
  },
  {
    id: 'ocean',
    name: 'Ocean Deep',
    subtitle: 'Cool sapphire & cobalt',
    dark: false,
    blob: `radial-gradient(ellipse at 40% 35%, #A8D0F8 0%, #5890E0 30%, #2060C8 55%, #0C3080 80%, #040E40 100%)`,
    cardBg: '#EEF4FC',
    cardText: '#101828',
    accent: '#2060C8',
  },
  {
    id: 'forest',
    name: 'Forest Moss',
    subtitle: 'Earthy greens & bark',
    dark: false,
    blob: `radial-gradient(circle at 50% 45%, #B8E0B0 0%, #70B870 30%, #3A7D44 58%, #1A4820 82%, #081808 100%)`,
    cardBg: '#EEF4EC',
    cardText: '#111F14',
    accent: '#3A7D44',
  },
  {
    id: 'violet',
    name: 'Acid Violet',
    subtitle: 'Electric purple prism',
    dark: false,
    blob: `radial-gradient(circle at 40% 40%, #E0C8FF 0%, #A878F0 28%, #7B3FD8 54%, #4A18A0 78%, #200060 100%)`,
    cardBg: '#F7F4FC',
    cardText: '#1A1030',
    accent: '#7B3FD8',
  },
  {
    id: 'midnight',
    name: 'Midnight Indigo',
    subtitle: 'Deep space & starlight',
    dark: true,
    blob: `radial-gradient(ellipse at 45% 40%, #8098FF 0%, #4860D8 30%, #2030A8 55%, #0C1660 80%, #040820 100%)`,
    cardBg: '#1C1E38',
    cardText: '#E8EAFF',
    accent: '#6C8FFF',
  },
  {
    id: 'ember',
    name: 'Ember Forge',
    subtitle: 'Molten core & soot',
    dark: true,
    blob: `radial-gradient(circle at 42% 48%, #FF9050 0%, #E84010 35%, #A01000 62%, #540800 84%, #200000 100%)`,
    cardBg: '#2E1E0A',
    cardText: '#FFE8CC',
    accent: '#FF6B1A',
  },
];

interface ThemePickerProps {
  activeTheme: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({ activeTheme, onSelectTheme }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
      }}
      role="listbox"
      aria-label="Color Themes"
    >
      {THEMES.map((theme) => {
        const isActive = activeTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            role="option"
            aria-selected={isActive}
            aria-label={`${theme.name} theme`}
            onClick={() => onSelectTheme(theme.id)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              borderRadius: '14px',
              overflow: 'hidden',
              border: isActive
                ? `2px solid ${theme.accent}`
                : '2px solid transparent',
              boxShadow: isActive
                ? `0 0 0 1px ${theme.accent}60, 0 6px 20px ${theme.accent}30`
                : '0 2px 8px rgba(0,0,0,0.12)',
              transition: 'box-shadow 160ms ease, border-color 160ms ease, transform 120ms ease',
              position: 'relative',
              display: 'block',
              transform: isActive ? 'scale(1.025)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            {/* Card body */}
            <div
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                minHeight: '168px',
              }}
            >
              {/* Top row: blob + selected badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                {/* Blob swatch — inspired by the gradient orb inspo */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: theme.blob,
                    flexShrink: 0,
                    boxShadow: `0 4px 16px ${theme.accent}50`,
                    filter: 'blur(0.5px)',
                  }}
                  aria-hidden="true"
                />

                {/* Selected indicator */}
                {isActive && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      backgroundColor: theme.accent,
                      color: theme.dark ? '#000' : '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Check size={10} strokeWidth={3} />
                    ON
                  </div>
                )}
              </div>

              {/* Bottom: name, subtitle, accent strip */}
              <div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: theme.cardText,
                    letterSpacing: '-0.01em',
                    fontFamily: `'Space Grotesk', sans-serif`,
                  }}
                >
                  {theme.name}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    marginTop: '2px',
                    color: theme.cardText,
                    opacity: 0.55,
                    fontWeight: 500,
                  }}
                >
                  {theme.subtitle}
                </div>

                {/* Accent colour strip */}
                <div
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    gap: '5px',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: theme.accent,
                    }}
                    aria-hidden="true"
                  />
                  <div
                    style={{
                      flex: 1,
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: theme.cardText,
                      opacity: 0.12,
                    }}
                    aria-hidden="true"
                  />
                  <div
                    style={{
                      width: '14px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: theme.cardText,
                      opacity: 0.07,
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
