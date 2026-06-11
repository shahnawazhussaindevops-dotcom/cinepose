import React from 'react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">{title}</h2>
      <div className="glass rounded-2xl divide-y divide-white/5">
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, value, isToggle = false }: { label: string; value: string; isToggle?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-[#F9FAFB]">{label}</span>
      {isToggle ? (
        <div className="w-10 h-6 rounded-full bg-[#A78BFA] relative cursor-pointer">
          <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow" />
        </div>
      ) : (
        <span className="text-sm text-[#6B7280]">{value}</span>
      )}
    </div>
  );
}

export function SettingsPage() {
  return (
    <main className="px-4 pt-6 space-y-6">
      <h1 className="text-xl font-bold text-[#F9FAFB]">Settings</h1>

      <Section title="Appearance">
        <SettingRow label="Theme" value="Dark" />
        <SettingRow label="Language" value="English" />
      </Section>

      <Section title="Camera Defaults">
        <SettingRow label="Grid Overlay" value="Off" isToggle />
        <SettingRow label="Focus Peaking" value="Off" isToggle />
        <SettingRow label="Live Histogram" value="Off" isToggle />
        <SettingRow label="Level Indicator" value="On" isToggle />
      </Section>

      <Section title="Pose Preferences">
        <SettingRow label="Gender" value="Prefer not to say" />
      </Section>

      <Section title="Privacy & Security">
        <p className="text-xs text-[#6EE7B7] mb-3 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Privacy First — All AI runs on your device
        </p>
        <SettingRow label="Cloud Backup" value="Off" isToggle />
        <SettingRow label="Crash Telemetry" value="Off" isToggle />
        <button className="w-full text-left text-sm text-red-400 py-3 border-t border-white/5">
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
