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
    const debug = (req.query as any)?.debug === "1" || (req.query as any)?.debug === 1;

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

    console.log("Last.fm response - nowPlaying:", isNowPlaying, "track:", track.name, "artist:", track.artist?.["#text"]);

    const artist = track.artist?.["#text"] || "Unknown Artist";
    const title = track.name || "Unknown Track";
    const album = track.album?.["#text"] || "";
    let image = "";

    if (track.image && Array.isArray(track.image)) {
      const largeImage = track.image.find((img: any) => img.size === "extralarge");
      const mediumImage = track.image.find((img: any) => img.size === "large");
      const originalImage = track.image.find((img: any) => img.size === "medium");
      image = largeImage?.["#text"] || mediumImage?.["#text"] || originalImage?.["#text"] || "";
    }

    if (debug) {
      return res.status(200).json({ nowPlaying: isNowPlaying, rawData: data });
    }

    return res.status(200).json({
      nowPlaying: true,
      title,
      artist,
      album,
      image,
    });
  } catch (error) {
    console.error("Last.fm API error:", error);
    return res.status(500).json({ error: "Failed to fetch now playing", details: String(error) });
  }
}
