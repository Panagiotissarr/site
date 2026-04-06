import React, { useState, useCallback, useEffect } from "react";
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
  const [view, setView] = useState<"google" | "crop">("google");

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

      return canvas.toDataURL("image/jpeg", 0.9);
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
      alert("Failed to process image. This can happen if the image source blocks external access (CORS).");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    if (searchTerm.startsWith("http") || searchTerm.includes(".")) {
      setImgUrl(searchTerm);
      setView("crop");
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${searchTerm}&per_page=20&client_id=Y5S78qR_X549E_X97-y6vYVq_o703t6U8E9N-4X0_0E`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300 font-sans text-white cursor-auto !important" >
      {/* Header / Search Bar */}
      <div className={`p-6 border-b border-white/10 ${searchTerm ? 'flex items-center gap-6 bg-zinc-950' : 'flex flex-col items-center gap-4 bg-zinc-950 w-full'} `}>
        
        {!searchTerm ? ( // Centered Google-like logo and search bar when empty
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="text-4xl font-bold tracking-tight flex items-center gap-1">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </div>
            <div className="w-full max-w-3xl relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for images or paste a direct URL..."
                className="w-full bg-zinc-900 border border-white/10 rounded-full py-3 px-6 pl-12 text-sm focus:outline-none focus:border-white/30 transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        ) : ( // Row layout when searching
          <>
            <div className="text-2xl font-bold tracking-tighter flex items-center gap-1">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
              <span className="ml-2 text-sm font-medium text-white/40 uppercase tracking-widest">Images</span>
            </div>
            
            <div className="flex-1 max-w-2xl relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for images or paste a direct URL..."
                className="w-full rounded-full py-3 px-6 pl-12 text-sm focus:outline-none focus:border-white/30 transition-all bg-zinc-900 border border-white/10"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {view === "google" ? (
          <div className="flex-1 overflow-y-auto p-8">
            {isSearching ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white/40 text-sm font-medium">Searching Google Images...</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
                {searchResults.map((img) => (
                  <div 
                    key={img.id}
                    onClick={() => { setImgUrl(img.urls.regular); setView("crop"); }}
                    className="group relative aspect-square cursor-pointer rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all"
                  >
                    <img
                      src={img.urls.small}
                      alt={img.alt_description}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <span className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">Select</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/20 italic">
                {searchTerm ? "No results found. Try another search." : "Enter a search term or URL to get started."}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-zinc-950 p-8">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setView("google")}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    ← Back to Search
                  </button>
                  <h3 className="text-lg font-semibold italic">Select area to crop</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-zinc-900 rounded-full px-4 py-1.5 border border-white/10">
                    <span className="text-[10px] text-white/40 uppercase font-bold">Zoom</span>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-24 accent-white"
                    />
                  </div>
                  <button
                    onClick={handleApply}
                    disabled={isUploading}
                    className="bg-white text-black px-8 py-2 rounded-full text-sm font-bold hover:bg-[#EA4335] hover:text-white transition-all disabled:opacity-50 shadow-xl"
                  >
                    {isUploading ? "Applying..." : "Confirm & Save"}
                  </button>
                </div>
              </div>

              <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl">
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
              <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.2em]">Drag to reposition • Scroll to zoom</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
