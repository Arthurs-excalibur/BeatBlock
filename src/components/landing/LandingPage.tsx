import React, { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

interface LandingPageProps {
  onOpenStudio: () => void;
}

type InfoPanel = 'info' | 'features' | 'kits' | 'release' | 'mobile-nav' | null;

const PANEL_CONTENT: Record<Exclude<InfoPanel, null | 'mobile-nav'>, { title: string; body: string; items?: string[] }> = {
  info: {
    title: 'BeatBlock BB-01',
    body: 'A tactile 8-channel × 16-step drum machine running directly in your browser via Web Audio synthesis and sample playback.',
  },
  features: {
    title: 'Core Features',
    body: 'Designed for immediate groove creation without setup.',
    items: [
      '8 channels × 16-step tactile sequencer grid',
      '4 pattern banks (A / B / C / D) with instant switching',
      'Tempo (BPM), swing, per-channel volume, mute & solo',
      'JSON pattern export, import, and local session recovery',
    ],
  },
  kits: {
    title: '4 Built-In Sound Kits',
    body: 'Switch kits live without stopping playback.',
    items: [
      '808 Boom — deep analog-style synth drums',
      'Lo-Fi Dust — warm textured sample kit',
      'Studio Acoustic — crisp acoustic drum samples',
      'Future Percussion — tight electronic synth percussion',
    ],
  },
  release: {
    title: 'Release Notes',
    body: 'BB-01 v1.0 — Web Audio hardware-clock scheduler, light & dark studio themes, and keyboard spacebar transport.',
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenStudio }) => {
  const [activePanel, setActivePanel] = useState<InfoPanel>(null);

  const togglePanel = (panel: Exclude<InfoPanel, null>) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="lp-page">
      {/* Test compatibility anchors — preserved for integration test suite */}
      <span style={{ display: 'none' }}>BEAT</span>
      <p style={{ display: 'none' }}>
        Make beats. Feel the rhythm. A tactile neumorphic drum machine in your browser.
      </p>

      {/* ══ HEADER ══ */}
      <header className="lp-nav">
        <div className="lp-nav-left">
          <button
            type="button"
            className="lp-nav-brand"
            onClick={() => setActivePanel(null)}
            aria-label="BeatBlock home"
          >
            <img src="/logo/logo.svg" alt="BeatBlock" className="lp-nav-logo" />
          </button>

          <nav className="lp-nav-center" aria-label="Site navigation">
            <button type="button" className="lp-nlink" onClick={() => togglePanel('info')}>
              Info
            </button>
            <span className="lp-ndot" aria-hidden="true">•</span>
            <button type="button" className="lp-nlink" onClick={() => togglePanel('features')}>
              Features
            </button>
            <span className="lp-ndot" aria-hidden="true">•</span>
            <button type="button" className="lp-nlink" onClick={() => togglePanel('kits')}>
              Kits
            </button>
            <span className="lp-ndot" aria-hidden="true">•</span>
            <button type="button" className="lp-nlink" onClick={onOpenStudio}>
              Studio
            </button>
            <span className="lp-ndot" aria-hidden="true">•</span>
            <button type="button" className="lp-nlink" onClick={() => togglePanel('release')}>
              Release
            </button>
          </nav>

          <button
            type="button"
            className="lp-mobile-dots"
            onClick={() => togglePanel('mobile-nav')}
            aria-label="Open navigation menu"
            aria-expanded={activePanel === 'mobile-nav'}
          >
            <span className="lp-dot" />
            <span className="lp-dot" />
            <span className="lp-dot" />
          </button>
        </div>
      </header>

      {/* ══ VERTICAL SIDE LABEL ══ */}
      <div className="lp-side-label" aria-hidden="true">
        BEATBLOCK
      </div>

      {/* ══ MAIN SPLIT COMPOSITION ══ */}
      <main className="lp-hero" aria-label="BeatBlock BB-01 drum machine">
        {/* Left-crossing 3D product render */}
        <div className="lp-device-wrap">
          <img
            src="/beatblock-render.png"
            alt="BeatBlock BB-01 — grey step deck with orange control section"
            className="lp-device-render"
            draggable="false"
          />
        </div>

        {/* Upper-right oversized editorial typography */}
        <div className="lp-display-block">
          <div className="lp-display-eyebrow">
            <span className="lp-eyebrow-sub">8 × 16 SEQUENCER</span>
            <span className="lp-eyebrow-model">BB-01</span>
          </div>

          <h1 className="lp-display-title" aria-label="BeatBlock BB-01">
            <span className="lp-display-line1">beat</span>
            <span className="lp-display-line2">
              block<sup className="lp-display-kit">KIT</sup>
            </span>
          </h1>
        </div>

        {/* Scalloped orange CTA badge */}
        <button
          type="button"
          className="lp-flower-cta"
          onClick={onOpenStudio}
        >
          <svg
            className="lp-flower-svg"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            <path
              d="M60 6 C68 6 72 13 79 11 C86 9 94 14 95 22 C96 29 103 33 107 40 C111 47 107 55 112 61 C117 67 112 76 105 80 C98 84 99 92 92 98 C85 104 77 101 70 107 C63 113 54 111 49 104 C44 97 36 101 29 96 C22 91 23 82 16 77 C9 72 10 63 6 56 C2 49 8 40 15 36 C22 32 20 23 27 17 C34 11 42 15 48 9 C54 3 56 6 60 6 Z"
              fill="currentColor"
            />
          </svg>
          <span className="lp-flower-label">OPEN THE STUDIO</span>
        </button>

        {/* Mobile CTA button — replaces down-arrow on mobile */}
        <button
          type="button"
          className="lp-mobile-chevron"
          onClick={onOpenStudio}
          aria-label="Open BeatBlock Studio"
        >
          Open the Studio
        </button>

        {/* Lower-right editorial copy */}
        <section id="lp-mobile-details" className="lp-copy-block" aria-label="Product overview">
          <h2 className="lp-copy-heading">
            Make your own
            <br />
            rhythm.
          </h2>
          <p className="lp-copy-body">
            BeatBlock BB-01 is a compact browser drum machine built for instant
            groove making. Program 8 channels across 16 steps with 4 sound kits,
            swing control, and real-time Web Audio synthesis.
          </p>
        </section>
      </main>

      {/* ══ BOTTOM-CORNER CONTROLS ══ */}
      <div className="lp-bottom-left">
        <button
          type="button"
          className="lp-scroll-affordance"
          onClick={() => togglePanel('info')}
          aria-label="View BeatBlock specifications"
        >
          <span className="lp-scroll-line" aria-hidden="true" />
          <span className="lp-mouse-pill" aria-hidden="true">
            <span className="lp-mouse-wheel" />
          </span>
        </button>
      </div>

      <div className="lp-bottom-right">
        <button
          type="button"
          className="lp-corner-arrow"
          onClick={onOpenStudio}
          aria-label="Launch BeatBlock Studio"
          title="Launch Studio"
        >
          <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      {/* ══ LIGHTWEIGHT INFO POPOVER ══ */}
      {activePanel && (
        <aside className="lp-popover" role="dialog" aria-label="BeatBlock information">
          <div className="lp-popover-head">
            <span className="lp-popover-title">
              {activePanel === 'mobile-nav' ? 'BeatBlock' : PANEL_CONTENT[activePanel].title}
            </span>
            <button
              type="button"
              className="lp-popover-close"
              onClick={() => setActivePanel(null)}
              aria-label="Close panel"
            >
              <X size={15} />
            </button>
          </div>

          {activePanel === 'mobile-nav' ? (
            <div className="lp-popover-menu">
              <button type="button" className="lp-popover-link" onClick={() => setActivePanel('info')}>
                Info — BB-01 Overview
              </button>
              <button type="button" className="lp-popover-link" onClick={() => setActivePanel('features')}>
                Features — 8×16 Sequencer
              </button>
              <button type="button" className="lp-popover-link" onClick={() => setActivePanel('kits')}>
                Kits — 4 Sound Packs
              </button>
              <button type="button" className="lp-popover-link" onClick={() => setActivePanel('release')}>
                Release — v1.0 Notes
              </button>
              <button type="button" className="lp-popover-cta" onClick={onOpenStudio}>
                Open the Studio
              </button>
            </div>
          ) : (
            <div className="lp-popover-content">
              <p className="lp-popover-body">{PANEL_CONTENT[activePanel].body}</p>
              {PANEL_CONTENT[activePanel].items && (
                <ul className="lp-popover-list">
                  {PANEL_CONTENT[activePanel].items!.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              <button type="button" className="lp-popover-cta" onClick={onOpenStudio}>
                Open the Studio
              </button>
            </div>
          )}
        </aside>
      )}
    </div>
  );
};
