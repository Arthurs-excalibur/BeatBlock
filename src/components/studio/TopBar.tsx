import React from 'react';
import { Settings, Save, ChevronUp } from 'lucide-react';
import { KitId } from '../../types';

interface TopBarProps {
  activeKit?: KitId;
  activePatternName: string;
  theme?: 'light' | 'dark';
  onOpenSettings: () => void;
  onOpenSave: () => void;
  onToggleTheme?: () => void;
  onReplayIntro?: () => void;
  onSelectKit?: (kitId: KitId) => void;
  onPreviewKitSound?: (kitId: KitId) => void;
  onToggleCollapseMobile?: () => void;
  isCollapsedMobile?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activePatternName,
  onOpenSettings,
  onOpenSave,
  onToggleCollapseMobile,
  isCollapsedMobile,
}) => {
  return (
    <header
      className="neu-raised-sm top-bar"
      data-node-id="3:1341"
      data-name="Header"
    >
      {/* Left: Brand Identity */}
      <div className="brand-group" data-node-id="3:1342">
        <img
          src="/logo/logo.svg"
          alt="BeatBlock Logo"
          className="brand-logo"
          data-node-id="3:1343"
        />
        <div
          className="font-heading brand-title"
          data-node-id="3:1345"
        >
          BEATBLOCK
        </div>
        <span className="brand-subtitle hide-on-mobile">TR-GROOVEBOX</span>
      </div>

      {/* Center: Pattern indicator */}
      <div
        className="hide-on-mobile header-center-group"
        data-node-id="3:1346"
      >
        <div
          className="neu-inset-sm pattern-name-display"
          data-node-id="3:1347"
          title="Active Pattern"
        >
          <span className="pattern-name-text">
            {activePatternName || 'Pattern 01'}
          </span>
        </div>
      </div>

      {/* Right: Actions & Tools */}
      <div className="header-actions-group" data-node-id="3:1358">
        {/* Save Button */}
        <button
          type="button"
          onClick={onOpenSave}
          className="btn-hardware btn-save"
          data-node-id="3:1365"
          aria-label="Save Pattern"
        >
          <Save size={12} />
          <span>SAVE</span>
        </button>

        {/* Settings Circular Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="btn-hardware btn-icon-round"
          data-node-id="3:1367"
          aria-label="Settings and Kit Library"
          title="Settings and Sound Kits"
        >
          <Settings size={13} />
        </button>

        {/* Mobile Hide/Collapse Top Bar Button */}
        {onToggleCollapseMobile && (
          <button
            type="button"
            onClick={onToggleCollapseMobile}
            className="btn-hardware btn-icon-round mobile-only-btn btn-collapse-topbar"
            aria-label={isCollapsedMobile ? 'Show Top Bar' : 'Hide Top Bar'}
            title={isCollapsedMobile ? 'Show Top Bar' : 'Hide Top Bar'}
          >
            <ChevronUp size={14} />
          </button>
        )}
      </div>
    </header>
  );
};
