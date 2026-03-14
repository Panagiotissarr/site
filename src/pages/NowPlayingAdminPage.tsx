import React, { useMemo, useState } from "react";
import { useNowPlayingSettings } from "../components/useNowPlayingSettings";

const hashPin = async (pin: string) => {
  const data = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const NowPlayingAdminPage: React.FC = () => {
  const { settings, updateSettings } = useNowPlayingSettings();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [safetyLock, setSafetyLock] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
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

  const handleUnlock = async () => {
    const hashed = await hashPin(pin);
    const expected = await hashPin("136013");
    if (hashed === expected) {
      setUnlocked(true);
      setStatus("Unlocked");
      setSafetyLock(false);
    } else {
      setStatus("Wrong pin");
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length >= pinLength) return;
    setPin((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const handleSave = () => {
    updateSettings(draft);
    setStatus("Saved");
  };

  const isDisabled = !unlocked || safetyLock;

  return (
    <div className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-xl space-y-6 rounded-magic-out border border-white/10 bg-white/5 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Now Playing Controls</h1>
          <p className="mt-1 text-sm text-white/60">
            Private panel for changing the now playing widget.
          </p>
        </div>

        {!unlocked && (
          <div className="space-y-3">
            <label className="text-sm text-white/70">PIN</label>
            <div className="flex items-center justify-center gap-3 py-2">
              {Array.from({ length: pinLength }).map((_, index) => (
                <span
                  key={`dot-${index}`}
                  className={`h-3 w-3 rounded-full border ${
                    index < pin.length
                      ? "border-primary bg-primary"
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
                  className="h-14 rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-white hover:bg-white/10"
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
                className="h-14 rounded-full border border-white/10 bg-white/5 text-lg font-semibold text-white hover:bg-white/10"
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
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Unlock
            </button>
          </div>
        )}

        {unlocked && (
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm text-white/70">
              Safety lock
              <input
                type="checkbox"
                checked={safetyLock}
                onChange={(e) => setSafetyLock(e.target.checked)}
                className="h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between text-sm text-white/70">
              Enable widget
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="h-4 w-4"
                disabled={isDisabled}
              />
            </label>

            <label className="text-sm text-white/70">Label</label>
            <input
              type="text"
              value={draft.label}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, label: e.target.value }))
              }
              className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
              disabled={isDisabled}
            />

            <label className="text-sm text-white/70">Title</label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
              disabled={isDisabled}
            />

            <label className="text-sm text-white/70">Image URL</label>
            <input
              type="text"
              value={draft.imageUrl}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              className="w-full rounded-md border border-white/10 bg-black/60 px-3 py-2 text-white"
              disabled={isDisabled}
            />

            <button
              onClick={handleSave}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
              disabled={isDisabled}
            >
              Save changes
            </button>
          </div>
        )}

        {status && <p className="text-xs text-white/60">{status}</p>}
      </div>
    </div>
  );
};
