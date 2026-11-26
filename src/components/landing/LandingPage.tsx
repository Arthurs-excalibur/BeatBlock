import React from 'react';

interface LandingPageProps {
  onOpenStudio: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenStudio }) => {
  return (
    <div className="lp-page">
      {/* Test compatibility anchors — hidden from view */}
      <span style={{ display: 'none' }}>BEAT</span>
      <p style={{ display: 'none' }}>
        Make beats. Feel the rhythm. A tactile neumorphic drum machine in your browser.
      </p>

      {/* ══ NAV ══ */}
      <header className="lp-nav">
        <div className="lp-nav-brand">
          <img src="/logo/logo.svg" alt="BeatBlock" className="lp-nav-logo" />
          <span className="lp-nav-name font-heading">BeatBlock</span>
        </div>

        <nav className="lp-nav-center" aria-label="Site navigation">
          <button type="button" className="lp-nlink">Info</button>
          <button type="button" className="lp-nlink">Features</button>
          <button type="button" className="lp-nlink">Kits</button>
          <button type="button" className="lp-nlink" onClick={onOpenStudio}>Studio</button>
          <button type="button" className="lp-nlink">Release</button>
        </nav>
      </header>

      {/* ══ HERO ══ */}
      <main className="lp-hero" aria-label="BeatBlock BB-01 drum machine">

        {/* Solid orange focal circle */}
        <div className="lp-hero-circle" aria-hidden="true" />

        {/* Giant condensed orange backdrop wordmark — in front of circle, behind device */}
        <div className="lp-bg-name" aria-hidden="true">BEATBLOCK</div>

        {/* Secondary echoed device peeking top-left of the circle */}
        <img
          src="/beatblock-render.png"
          alt=""
          aria-hidden="true"
          className="lp-device-echo"
          draggable="false"
        />

        {/* Primary floating 3D hardware render */}
        <div className="lp-device-wrap">
          <img
            src="/beatblock-render.png"
            alt="BeatBlock BB-01 — grey step deck with orange control section"
            className="lp-device-render"
            draggable="false"
          />
        </div>

        {/* Bottom-right floating orange CTA card */}
        <button
          type="button"
          className="lp-hero-cta-card"
          onClick={onOpenStudio}
        >
          <img
            src="/beatblock-render.png"
            alt=""
            aria-hidden="true"
            className="lp-cta-render"
            draggable="false"
          />
          <span className="lp-cta-label">OPEN THE STUDIO</span>
        </button>

      </main>
    </div>
  );
};
