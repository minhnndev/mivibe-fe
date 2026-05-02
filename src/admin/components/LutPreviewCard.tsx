import { useEffect, useState, useRef } from "react";
import { renderLutPreview } from "../lutEngine";
import type { Lut } from "../types";

// Default preview images (royalty-free Unsplash photos)
const DEFAULT_PREVIEW_IMAGES = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", // landscape
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80", // portrait
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80", // urban
];

type LutPreviewCardProps = {
  lut: Lut;
  previewImage?: string;
  onClick?: () => void;
  selected?: boolean;
  showBadge?: boolean;
};

export default function LutPreviewCard({
  lut,
  previewImage,
  onClick,
  selected = false,
  showBadge = true,
}: LutPreviewCardProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const imgUrl = previewImage || DEFAULT_PREVIEW_IMAGES[0]!;
  const lutUrl = `/luts-cube/${lut.filename}`;

  useEffect(() => {
    abortRef.current = false;
    setLoading(true);
    setError(null);
    setPreview(null);

    renderLutPreview(imgUrl, lutUrl, lut.intensity || 1.0, 300)
      .then((dataUrl) => {
        if (!abortRef.current) {
          setPreview(dataUrl);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!abortRef.current) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      abortRef.current = true;
    };
  }, [imgUrl, lutUrl, lut.intensity]);

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
        selected ? "ring-2 ring-white scale-[1.02]" : "hover:scale-[1.02]"
      }`}
      style={{ background: "#111" }}
    >
      {/* Preview Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 text-red-400 text-xs p-2 text-center">
            <span className="text-lg mb-1">⚠</span>
            Failed to render
          </div>
        )}
        {preview && (
          <img
            src={preview}
            alt={lut.name}
            className="w-full h-full object-cover"
          />
        )}
        {!lut.is_active && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white/60 text-xs font-body border border-white/20 rounded-full px-2 py-0.5">
              Inactive
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-white text-sm font-body font-medium leading-tight">
              {lut.name}
            </p>
            <p className="text-white/40 text-xs font-body mt-0.5">
              {lut.filename}
            </p>
          </div>
          {showBadge && lut.is_free && (
            <span className="shrink-0 text-[10px] font-body font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
              Free
            </span>
          )}
        </div>
        {lut.tags?.length ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {lut.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-white/30 font-body">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
