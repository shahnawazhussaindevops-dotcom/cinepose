import React from 'react';
import { useAppStore } from '../../stores/appStore';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">{title}</h2>
      <div className="glass rounded-2xl divide-y divide-white/5 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, value, isToggle = false, onToggle }: { label: string; value: string; isToggle?: boolean; onToggle?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[#F9FAFB]">{label}</span>
      {isToggle ? (
        <button
          onClick={onToggle}
          className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${
            value === 'On' ? 'bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] shadow-[0_0_10px_rgba(167,139,250,0.3)]' : 'bg-white/10'
          }`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${
            value === 'On' ? 'right-0.5' : 'left-0.5'
          }`} />
        </button>
      ) : (
        <span className="text-sm text-[#6B7280]">{value}</span>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { settings, updateSettings } = useAppStore();

  return (
    <main className="px-4 pt-6 space-y-6 pb-20">
      <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#6EE7B7]">Settings</h1>

      <Section title="Appearance">
        <SettingRow label="Theme" value={settings.theme === 'dark' ? 'Dark' : 'Light'} />
        <SettingRow label="Language" value={settings.language === 'en' ? 'English' : 'Urdu'} />
      </Section>

      <Section title="Camera Defaults">
        <SettingRow label="Grid Overlay" value={settings.gridOverlay === 'off' ? 'Off' : settings.gridOverlay} isToggle onToggle={() => updateSettings({ gridOverlay: settings.gridOverlay === 'off' ? 'rule_of_thirds' : 'off' })} />
        <SettingRow label="Focus Peaking" value={settings.focusPeaking ? 'On' : 'Off'} isToggle onToggle={() => updateSettings({ focusPeaking: !settings.focusPeaking })} />
        <SettingRow label="Live Histogram" value={settings.histogram ? 'On' : 'Off'} isToggle onToggle={() => updateSettings({ histogram: !settings.histogram })} />
        <SettingRow label="Level Indicator" value={settings.levelIndicator ? 'On' : 'Off'} isToggle onToggle={() => updateSettings({ levelIndicator: !settings.levelIndicator })} />
      </Section>

      <Section title="Pose Preferences">
        <SettingRow label="Gender" value={settings.gender === 'neutral' ? 'Prefer not to say' : settings.gender === 'male' ? 'Male' : 'Female'} />
      </Section>

      <Section title="Privacy & Security">
        <p className="text-xs text-[#6EE7B7] mb-3 flex items-center gap-1 px-4 pt-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Privacy First — All AI runs on your device
        </p>
        <SettingRow label="Cloud Backup" value={settings.cloudBackup ? 'On' : 'Off'} isToggle onToggle={() => updateSettings({ cloudBackup: !settings.cloudBackup })} />
        <SettingRow label="Crash Telemetry" value={settings.telemetry ? 'On' : 'Off'} isToggle onToggle={() => updateSettings({ telemetry: !settings.telemetry })} />
        <button className="w-full text-left text-sm text-red-400 py-3.5 px-4 hover:bg-red-500/5 transition-colors border-t border-white/5">
          Delete My Data
        </button>
      </Section>

      <Section title="About">
        <SettingRow label="Version" value="1.0.0" />
        <SettingRow label="CinePose" value="See the shot before you take it." />
      </Section>

      <button className="w-full py-3 text-center text-sm text-[#6B7280] hover:text-[#F9FAFB] transition-colors">
        Sign Out
      </button>

      <div className="h-8" />
    </main>
  );
}
