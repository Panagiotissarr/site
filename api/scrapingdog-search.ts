import type { VercelRequest, VercelResponse } from "@vercel/node";

const SCRAPINGDOG_API_KEY = process.env.SCRAPINGDOG_API_KEY;
const SCRAPINGDOG_API_URL = "https://api.scrapingdog.com/google_images";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, page, country, imgsz } = req.query;

  if (!SCRAPINGDOG_API_KEY) {
    console.error("ScrapingDog API key is missing. Set SCRAPINGDOG_API_KEY environment variable.");
    return res.status(500).json({ error: "Server configuration error: SCRAPINGDOG_API_KEY not set." });
  }

  if (!query) {
    return res.status(400).json({ error: "Missing required query parameter: q" });
  }

  try {
    const params = new URLSearchParams({
      api_key: SCRAPINGDOG_API_KEY,
      q: query as string,
      page: page ? String(page) : "0",
      country: country ? String(country) : "us",
      imgsz: imgsz ? String(imgsz) : "all", // Default to all sizes
    });

    const url = `${SCRAPINGDOG_API_URL}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`ScrapingDog API request failed with status ${response.status}. Response: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`ScrapingDog API returned an error: ${data.error}`);
    }

    // Extract image URLs, ensuring we have 'original' and it's a valid URL
    const imageUrls = data.image_results 
      ? data.image_results.map((img: any) => img.original).filter(url => url && url.startsWith('http')) 
      : [];

    return res.status(200).json({ images: imageUrls });
  } catch (error) {
    console.error("ScrapingDog search error:", error);
    return res.status(500).json({ error: "Failed to fetch images", details: String(error) });
  }
}
