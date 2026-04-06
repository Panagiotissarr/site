import { useEffect, useMemo, useState } from "react";

export type NowPlayingSettings = {
  enabled: boolean;
  label: string;
  title: string;
  imageUrl: string;
};

const defaultSettings: NowPlayingSettings = {
  enabled: true,
  label: "Now playing",
  title: "Ambient focus mix",
  imageUrl: "/assets/img/logo-mini.png"
};

export const useNowPlayingSettings = () => {
  const [settings, setSettings] = useState<NowPlayingSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/now-playing");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
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

  const updateSettings = async (next: NowPlayingSettings, password: string) => {
    const response = await fetch("/api/now-playing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password, settings: next })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Update failed");
    }

    setSettings(next);
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
