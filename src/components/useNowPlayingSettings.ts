import { useEffect, useMemo, useState } from "react";

export type NowPlayingSettings = {
  enabled: boolean;
  label: string;
  title: string;
  imageUrl: string;
};

const STORAGE_KEY = "nowPlaying.settings.v1";

const defaultSettings: NowPlayingSettings = {
  enabled: true,
  label: "Now playing",
  title: "Ambient focus mix",
  imageUrl: "/assets/img/logo-mini.png"
};

const readSettings = (): NowPlayingSettings => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<NowPlayingSettings>;
    return {
      enabled: parsed.enabled ?? defaultSettings.enabled,
      label: parsed.label ?? defaultSettings.label,
      title: parsed.title ?? defaultSettings.title,
      imageUrl: parsed.imageUrl ?? defaultSettings.imageUrl
    };
  } catch {
    return defaultSettings;
  }
};

export const useNowPlayingSettings = () => {
  const [settings, setSettings] = useState<NowPlayingSettings>(defaultSettings);

  useEffect(() => {
    setSettings(readSettings());
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setSettings(readSettings());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateSettings = (next: NowPlayingSettings) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSettings(next);
  };

  return useMemo(
    () => ({
      settings,
      updateSettings
    }),
    [settings]
  );
};

