import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

type Point = { x: number; y: number };
type Area = { x: number; y: number; width: number; height: number };

interface ImagePickerProps {
  onSave: (url: string) => void;
  onCancel: () => void;
  password?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ onSave, onCancel, password }) => {
  const [imgUrl, setImgUrl] = useState("");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string | null> => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      return canvas.toDataURL("image/jpeg", 0.8);
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleApply = async () => {
    if (!croppedAreaPixels || !imgUrl) return;
    setIsUploading(true);

    try {
      const croppedBase64 = await getCroppedImg(imgUrl, croppedAreaPixels);
      if (!croppedBase64) throw new Error("Cropping failed");

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password || ""
        },
        body: JSON.stringify({
          filename: `cropped-${Date.now()}.jpg`,
          contentType: "image/jpeg",
          data: croppedBase64
        })
      });

      if (!response.ok) throw new Error("Upload failed");

      const blob = await response.json();
      onSave(blob.url);
    } catch (err) {
      console.error(err);
      alert("Failed to process image. Make sure the image allows CORS (try Unsplash images).");
    } finally {
      setIsUploading(false);
    }
  };

  const searchUnsplash = async () => {
    if (!searchTerm) return;
    setIsSearching(true);
    try {
      // Using Unsplash's public API as a "Google Search" alternative as it has CORS support.
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${searchTerm}&client_id=Y5S78qR_X549E_X97-y6vYVq_o703t6U8E9N-4X0_0E`); // Fallback public key
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl rounded-magic-out border border-white/10 bg-zinc-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Image Editor</h2>
          <button onClick={onCancel} className="text-white/40 hover:text-white">✕</button>
        </div>

        {!imgUrl ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUnsplash()}
                placeholder="Search images (e.g. synthwave, beach)..."
                className="flex-1 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white"
              />
              <button 
                onClick={searchUnsplash}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black"
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-3 gap-2 h-64 overflow-y-auto pr-2">
                {searchResults.map((img) => (
                  <img
                    key={img.id}
                    src={img.urls.small}
                    alt={img.alt_description}
                    onClick={() => setImgUrl(img.urls.regular)}
                    className="h-24 w-full cursor-pointer rounded object-cover hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}

            <div className="pt-2">
              <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Or paste URL</label>
              <input
                type="text"
                onBlur={(e) => e.target.value && setImgUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative h-80 w-full overflow-hidden rounded-lg bg-black">
              <Cropper
                image={imgUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-white/40 uppercase">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setImgUrl("")}
                className="flex-1 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Change Image
              </button>
              <button
                onClick={handleApply}
                disabled={isUploading}
                className="flex-[2] rounded-md bg-white px-4 py-2 text-sm font-bold text-black hover:bg-white/90 disabled:opacity-50"
              >
                {isUploading ? "Processing..." : "Crop & Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
