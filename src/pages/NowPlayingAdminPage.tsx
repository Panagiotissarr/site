import React, { useEffect, useMemo, useState } from "react";
import { useNowPlayingSettings } from "../components/useNowPlayingSettings";

const PRESETS = [
  { label: "Now playing", title: "Ambient focus mix", imageUrl: "/assets/img/logo-mini.png" },
  { label: "Now eating", title: "Having a snack", imageUrl: "/assets/img/logo-mini.png" },
  { label: "Now coding", title: "Working on projects", imageUrl: "/assets/img/logo-mini.png" },
  { label: "Now gaming", title: "In a session", imageUrl: "/assets/img/logo-mini.png" },
];

const DURATIONS = [
  { label: "Permanent", value: 0 },
  { label: "1 min", value: 1 },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
  { label: "Custom", value: -1 },
];

export const NowPlayingAdminPage: React.FC = () => {
  const { settings, updateSettings, verifyPassword, isLoading } = useNowPlayingSettings();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [safetyLock, setSafetyLock] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [customDuration, setCustomDuration] = useState(120);
  const pinLength = 6;

  const formState = useMemo(
    () => ({
      enabled: settings.enabled,
      label: settings.label,
      title: settings.title,
      imageUrl: settings.imageUrl
    }),
    [settings]
  );

  const [draft, setDraft] = useState(formState);

  useEffect(() => {
    setDraft(formState);
  }, [formState]);

  const handleUnlock = async () => {
    setIsVerifying(true);
    setStatus("Verifying...");
    const success = await verifyPassword(pin);
    setIsVerifying(false);
    
    if (success) {
      setUnlocked(true);
      setStatus("Unlocked");
      setSafetyLock(false);
    } else {
      setStatus("Unauthorized");
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length >= pinLength && pinLength > 0) return;
    setPin((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setDraft((prev) => ({
      ...prev,
      label: preset.label,
      title: preset.title,
      imageUrl: preset.imageUrl,
      enabled: true
    }));
  };

  const handleSave = async () => {
    setStatus("Saving...");
    try {
      const finalDuration = duration === -1 ? customDuration : duration;
      await updateSettings(draft, pin, finalDuration);
      setStatus("Applied globally");
    } catch (err: any) {
      setStatus(err.message || "Save failed");
    }
  };

  const isDisabled = !unlocked || safetyLock || isLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-12 text-white font-sans">
      <div className="mx-auto max-w-xl space-y-6 rounded-magic-out border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">
            Secure panel for real-time website updates.
          </p>
        </div>

        {!unlocked && (
          <div className="space-y-3">
            <label className="text-sm text-white/70">Master Password</label>
            <div className="flex items-center justify-center gap-3 py-2">
              {Array.from({ length: Math.max(pin.length, pinLength) }).map((_, index) => (
                <span
                  key={`dot-${index}`}
                  className={`h-3 w-3 rounded-full border transition-all duration-200 ${
                    index < pin.length
                      ? "border-primary bg-primary scale-110 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                      : "border-white/30"
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(digit)}
                  className="h-14 rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-white hover:bg-white/10 active:scale-95 transition-transform"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-14 rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wide text-white/70 hover:bg-white/10"
              >
                Clear
              </button>
              <button
                onClick={() => handleDigit("0")}
                className="h-14 rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-white hover:bg-white/10 active:scale-95 transition-transform"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-14 rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wide text-white/70 hover:bg-white/10"
              >
                Del
              </button>
            </div>

            <button
              onClick={handleUnlock}
              disabled={isVerifying}
              className="w-full rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "Unlock"}
            </button>
          </div>
        )}

        {unlocked && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <label className="flex items-center justify-between text-sm text-white/70">
              Safety lock
              <input
                type="checkbox"
                checked={safetyLock}
                onChange={(e) => setSafetyLock(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black"
              />
            </label>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-white/40">Presets</label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    disabled={isDisabled}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs hover:bg-white/10 disabled:opacity-50"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between text-sm text-white/70 pt-2 border-t border-white/5">
              Enable widget
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="h-4 w-4 rounded border-white/20 bg-black"
                disabled={isDisabled}
              />
            </label>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-white/40">Label</label>
              <input
                type="text"
                value={draft.label}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, label: e.target.value }))
                }
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none focus:border-white/30"
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-white/40">Title</label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white focus:outline-none focus:border-white/30"
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-white/40">Duration</label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setDuration(d.value)}
                    disabled={isDisabled}
                    className={`rounded-md border px-3 py-1 text-xs transition-colors ${
                      duration === d.value 
                        ? "border-primary bg-primary/20 text-white" 
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              {duration === -1 && (
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    className="w-24 rounded-md border border-white/10 bg-black/40 px-3 py-1 text-sm text-white"
                    disabled={isDisabled}
                  />
                  <span className="text-xs text-white/40">minutes</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              className="w-full rounded-md bg-white text-black px-4 py-2 text-sm font-bold hover:bg-white/90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              disabled={isDisabled}
            >
              Apply to All Users
            </button>
          </div>
        )}

        {status && (
          <p className={`text-center text-xs ${status === "Unauthorized" ? "text-red-400" : "text-white/40"}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};
