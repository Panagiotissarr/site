import { useEffect, useMemo, useState } from "react";

export type NowPlayingSettings = {
  enabled: boolean;
  label: string;
  title: string;
  imageUrl: string;
  expiresAt?: number | null;
};

const defaultSettings: NowPlayingSettings = {
  enabled: true,
  label: "Now playing",
  title: "Ambient focus mix",
  imageUrl: "/assets/img/logo-mini.png",
  expiresAt: null
};

export const useNowPlayingSettings = () => {
  const [settings, setSettings] = useState<NowPlayingSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/now-playing");
      if (response.ok) {
        const data = await response.json();
        
        // Frontend check for expiry
        if (data.enabled && data.expiresAt && Date.now() > data.expiresAt) {
          setSettings({ ...data, enabled: false });
        } else {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const verifyPassword = async (password: string) => {
    const response = await fetch("/api/now-playing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password, action: "verify" })
    });
    return response.ok;
  };

  const updateSettings = async (next: NowPlayingSettings, password: string, durationMinutes?: number) => {
    const response = await fetch("/api/now-playing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password, settings: next, durationMinutes })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Update failed");
    }

    const data = await response.json();
    setSettings(data.settings);
  };

  return useMemo(
    () => ({
      settings,
      isLoading,
      updateSettings,
      verifyPassword,
      refresh: fetchSettings
    }),
    [settings, isLoading]
  );
};
