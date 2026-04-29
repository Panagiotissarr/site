import { useEffect, useMemo, useState, useRef } from "react";

export type NowPlayingSettings = {
  enabled: boolean;
  label: string;
  title: string;
  imageUrl: string;
  expiresAt?: number | null;
  showEqualizer?: boolean;
  showImage?: boolean;
  lastUpdated?: number;
  isScrobbling?: boolean;
  lastfmEnabled?: boolean;
};

const defaultSettings: NowPlayingSettings = {
  enabled: true,
  label: "Now playing",
  title: "Ambient focus mix",
  imageUrl: "/assets/img/logo-mini.png",
  expiresAt: null,
  showEqualizer: true,
  showImage: true,
  lastUpdated: 0,
  isScrobbling: false,
  lastfmEnabled: true
};

const FAST_REFRESH_COUNT = 3;
const FAST_REFRESH_INTERVAL = 10000;
const SLOW_REFRESH_INTERVAL = 30000;

export const useNowPlayingSettings = () => {
  const [settings, setSettings] = useState<NowPlayingSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const lastUpdatedRef = useRef<number>(0);
  const lastfmRefreshCountRef = useRef<number>(0);
  const lastfmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTrackRef = useRef<string>("");

  const startLastfmPolling = (interval: number) => {
    if (lastfmIntervalRef.current) {
      clearInterval(lastfmIntervalRef.current);
    }
    lastfmIntervalRef.current = setInterval(() => {
      fetchLastfm(true);
    }, interval);
  };

  const fetchLastfm = async (isPoll: boolean = false) => {
    try {
      const response = await fetch("/api/lastfm-now-playing");
      if (response.ok) {
        const data = await response.json();

        if (data.nowPlaying) {
          const trackKey = `${data.artist} - ${data.title}`;
          
          if (currentTrackRef.current !== trackKey || !isPoll) {
            currentTrackRef.current = trackKey;
            const displayTitle = `${data.artist} — ${data.title}`;
            setSettings({
              enabled: true,
              label: "Scrobbling",
              title: displayTitle,
              imageUrl: data.image || "/assets/img/logo-mini.png",
              expiresAt: null,
              showEqualizer: true,
              showImage: true,
              lastUpdated: Date.now(),
              isScrobbling: true
            });
          }
        } else {
          if (currentTrackRef.current !== "") {
            currentTrackRef.current = "";
            if (!isPoll) {
              setSettings({
                ...defaultSettings,
                lastUpdated: Date.now(),
                isScrobbling: false
              });
            }
          }
        }
      }
    } catch (error) {
      if (!isPoll) console.error("Failed to fetch Last.fm data:", error);
    } finally {
      if (!isPoll) setIsLoading(false);
    }
  };

  const fetchSettings = async (isPoll: boolean = false) => {
    try {
      const response = await fetch("/debug");
      if (response.ok) {
        const data = await response.json();
        
        if (data.showEqualizer === undefined) data.showEqualizer = true;
        if (data.showImage === undefined) data.showImage = true;
        if (data.lastfmEnabled === undefined) data.lastfmEnabled = true;
        
        const serverLastUpdated = data.lastUpdated || 0;

        if (serverLastUpdated > lastUpdatedRef.current || !isPoll) {
          lastUpdatedRef.current = serverLastUpdated;
          
          if (data.enabled && data.expiresAt && Date.now() > data.expiresAt) {
            setSettings({ ...data, enabled: false });
          } else {
            setSettings(data);
          }
        }
      }
    } catch (error) {
      if (!isPoll) console.error("Failed to fetch settings:", error);
    } finally {
      if (!isPoll) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchLastfm();

    const interval = setInterval(() => {
      fetchSettings(true);
    }, 7000);

    let fastCount = 0;
    const fastRefreshInterval = setInterval(() => {
      fastCount++;
      fetchLastfm(true);
      if (fastCount >= FAST_REFRESH_COUNT - 1) {
        clearInterval(fastRefreshInterval);
        startLastfmPolling(SLOW_REFRESH_INTERVAL);
      }
    }, FAST_REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
      clearInterval(fastRefreshInterval);
      if (lastfmIntervalRef.current) clearInterval(lastfmIntervalRef.current);
    };
  }, []);

  const verifyPassword = async (password: string) => {
    const response = await fetch("/debug", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password
      },
      body: JSON.stringify({ password, action: "verify" })
    });
    return response.ok;
  };

  const updateSettings = async (next: NowPlayingSettings, password: string, durationMinutes?: number) => {
    const response = await fetch("/debug", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password
      },
      body: JSON.stringify({ password, settings: next, durationMinutes })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const debugInfo = errorData.debug ? ` (Received: ${errorData.debug.receivedLength}, Expected: ${errorData.debug.expectedLength})` : "";
      throw new Error((errorData.error || "Update failed") + debugInfo);
    }

    const data = await response.json();
    lastUpdatedRef.current = data.settings.lastUpdated || Date.now();
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
