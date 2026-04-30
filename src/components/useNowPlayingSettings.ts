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
  label: "Loading",
  title: "...",
  imageUrl: "/assets/img/logo-mini.png",
  expiresAt: null,
  showEqualizer: true,
  showImage: true,
  lastUpdated: 0,
  isScrobbling: false,
  lastfmEnabled: true
};

const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("nowplaying-lastfm") : null;
const LEADER_KEY = "nowplaying-leader";
const LEADER_TIMEOUT = 30000;

function tryClaimLeader(): boolean {
  if (typeof sessionStorage === "undefined") return true;
  const currentLeader = sessionStorage.getItem(LEADER_KEY);
  if (!currentLeader) {
    const id = Math.random().toString(36).slice(2);
    sessionStorage.setItem(LEADER_KEY, id);
    return true;
  }
  return false;
}

export const useNowPlayingSettings = () => {
  const [settings, setSettings] = useState<NowPlayingSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const lastUpdatedRef = useRef<number>(0);
  const manualSettingsRef = useRef<NowPlayingSettings>(defaultSettings);
  const currentTrackRef = useRef<string>("");
  const isLeaderRef = useRef<boolean>(false);

  useEffect(() => {
    if (!channel) return;
    channel.onmessage = (e) => {
      const data = e.data;
      if (data.type === "nowplaying") {
        currentTrackRef.current = data.trackKey;
        setSettings({
          ...data.settings,
          isScrobbling: true
        });
      } else if (data.type === "lastfm-ended") {
        currentTrackRef.current = "";
        setSettings({ ...manualSettingsRef.current, isScrobbling: false });
      }
    };
    return () => { channel.onmessage = null; };
  }, []);

  const fetchLastfm = async () => {
    try {
      const response = await fetch("/api/lastfm-now-playing");
      if (response.ok) {
        const data = await response.json();

        if (data.nowPlaying) {
          const trackKey = `${data.artist} - ${data.title}`;
          const displayTitle = `${data.artist} — ${data.title}`;

          if (currentTrackRef.current !== trackKey) {
            currentTrackRef.current = trackKey;
            const newSettings: NowPlayingSettings = {
              enabled: true,
              label: "Scrobbling",
              title: displayTitle,
              imageUrl: data.image || "/assets/img/logo-mini.png",
              expiresAt: null,
              showEqualizer: true,
              showImage: true,
              lastUpdated: Date.now(),
              isScrobbling: true
            };
            setSettings(newSettings);
            channel?.postMessage({ type: "nowplaying", trackKey, settings: newSettings });
          }
        } else if (currentTrackRef.current !== "") {
          currentTrackRef.current = "";
          setSettings({ ...manualSettingsRef.current, isScrobbling: false });
          channel?.postMessage({ type: "lastfm-ended" });
        }
      }
    } catch (error) {
      console.error("Failed to fetch Last.fm data:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/debug");
      if (response.ok) {
        const data = await response.json();

        if (data.showEqualizer === undefined) data.showEqualizer = true;
        if (data.showImage === undefined) data.showImage = true;
        if (data.lastfmEnabled === undefined) data.lastfmEnabled = true;

        const serverLastUpdated = data.lastUpdated || 0;

        if (serverLastUpdated > lastUpdatedRef.current) {
          lastUpdatedRef.current = serverLastUpdated;
          manualSettingsRef.current = data;

          if (data.enabled && data.expiresAt && Date.now() > data.expiresAt) {
            setSettings({ ...data, enabled: false });
          } else {
            if (currentTrackRef.current === "") {
              setSettings(data);
            }
          }
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
    fetchLastfm();

    isLeaderRef.current = tryClaimLeader();

    const lastfmInterval = setInterval(() => {
      if (isLeaderRef.current) {
        fetchLastfm();
      }
    }, 5000);

    const leaderCheckInterval = setInterval(() => {
      if (isLeaderRef.current) {
        tryClaimLeader();
      } else {
        isLeaderRef.current = tryClaimLeader();
      }
    }, LEADER_TIMEOUT);

    const settingsInterval = setInterval(() => {
      fetchSettings();
    }, 7000);

    return () => {
      clearInterval(lastfmInterval);
      clearInterval(leaderCheckInterval);
      clearInterval(settingsInterval);
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
    manualSettingsRef.current = data.settings;
    if (currentTrackRef.current === "") {
      setSettings(data.settings);
    }
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
