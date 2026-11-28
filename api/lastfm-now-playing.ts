import type { VercelRequest, VercelResponse } from "@vercel/node";

const LASTFM_API_KEY = process.env.last_fm_api || process.env.LAST_API;
const LASTFM_USERNAME = "panagiotis2211";
const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!LASTFM_API_KEY) {
    console.error("[lastfm] API key is not configured");
    return res.status(503).json({ error: "Service unavailable" });
  }

  try {
    const params = new URLSearchParams({
      method: "user.getrecenttracks",
      user: LASTFM_USERNAME,
      api_key: LASTFM_API_KEY,
      format: "json",
      limit: "1",
      extended: "1",
    });

    const response = await fetch(`${LASTFM_API_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Last.fm API returned status ${response.status}`);
    }

    const data = await response.json();

    if (!data.recenttracks?.track?.length) {
      return res.status(200).json({ nowPlaying: false });
    }

    const track = data.recenttracks.track[0];
    const trackAttrs = track["@attr"] || {};
    const isNowPlaying = trackAttrs.nowplaying === "true" || track.nowplaying === true || track.nowplaying === "true";

    if (!isNowPlaying) {
      return res.status(200).json({ nowPlaying: false });
    }

    let artist = "Unknown Artist";
    if (track.artist) {
      if (typeof track.artist === "string") {
        artist = track.artist;
      } else if (typeof track.artist === "object") {
        artist = track.artist["#text"] || track.artist.name || "Unknown Artist";
      }
    }

    const title = track.name || "Unknown Track";
    let image = "";

    const trackInfoParams = new URLSearchParams({
      method: "track.getInfo",
      api_key: LASTFM_API_KEY,
      format: "json",
      artist,
      track: title,
      autocorrect: "1",
    });

    const trackInfoResponse = await fetch(`${LASTFM_API_URL}?${trackInfoParams.toString()}`);

    if (trackInfoResponse.ok) {
      const trackInfoData = await trackInfoResponse.json();
      if (trackInfoData.track?.album?.image) {
        for (const size of ["extralarge", "large", "medium", "small"]) {
          const img = trackInfoData.track.album.image.find((img: any) => img.size === size);
          if (img && img["#text"]) {
            image = img["#text"];
            break;
          }
        }
      }
    }

    // Only forward a well-formed https image URL; anything else is dropped
    // so the widget falls back to its local default asset.
    if (image && (!/^https:\/\/[^\s"'<>\\]+$/i.test(image) || image.length > 2048)) {
      image = "";
    }

    return res.status(200).json({
      nowPlaying: true,
      title,
      artist,
      image,
    });
  } catch (error) {
    // Message only - never the request URL, which carries the API key.
    console.error("[lastfm] request failed:", error instanceof Error ? error.message : "unknown");
    return res.status(500).json({ error: "Failed to fetch now playing" });
  }
}
