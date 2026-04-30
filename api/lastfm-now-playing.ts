import type { VercelRequest, VercelResponse } from "@vercel/node";

const LASTFM_API_KEY = process.env.last_fm_api || process.env.LAST_API;
const LASTFM_USERNAME = "panagiotis2211";
const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!LASTFM_API_KEY) {
    return res.status(500).json({ error: "Last.fm API key not configured" });
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

    if (!data.recenttracks) {
      console.error("Unexpected Last.fm response:", JSON.stringify(data).slice(0, 500));
      return res.status(200).json({ nowPlaying: false });
    }

    const tracks = data.recenttracks.track;
    const attrs = data.recenttracks["@attr"] || {};
    const totalPages = attrs.totalPages || 0;
    const total = attrs.total || 0;

    if (!tracks || tracks.length === 0) {
      return res.status(200).json({ nowPlaying: false });
    }

    const track = tracks[0];
    const trackAttrs = track["@attr"] || {};
    const isNowPlaying = trackAttrs.nowplaying === "true" || track.nowplaying === true || track.nowplaying === "true";

    if (!isNowPlaying) {
      return res.status(200).json({ nowPlaying: false, debug: { totalPages, total } });
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

    return res.status(200).json({
      nowPlaying: true,
      title,
      artist,
      image,
    });
  } catch (error) {
    console.error("Last.fm API error:", error);
    return res.status(500).json({ error: "Failed to fetch now playing", details: String(error) });
  }
}
