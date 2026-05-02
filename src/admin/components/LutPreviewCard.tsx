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
  const [largePreview, setLargePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [largeLoading, setLargeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const abortRef = useRef(false);

  const imgUrl = previewImage || DEFAULT_PREVIEW_IMAGES[0]!;
  const lutUrl = lut.storage_key || lut.filename;

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

  useEffect(() => {
    let cancelled = false;
    if (!showCompare) return;

    setLargeLoading(true);
    setLargePreview(null);
    renderLutPreview(imgUrl, lutUrl, lut.intensity || 1.0, 1100)
      .then((dataUrl) => {
        if (!cancelled) setLargePreview(dataUrl);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLargeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showCompare, imgUrl, lutUrl, lut.intensity]);

  return (
    <>
      <div
        onClick={onClick}
        className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
          selected ? "ring-2 ring-white scale-[1.02]" : "hover:scale-[1.02]"
        }`}
        style={{ background: "#111" }}
      >
        {/* Preview Image */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowCompare(true);
          }}
          className="relative block w-full aspect-[4/3] overflow-hidden text-left"
        >
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
          <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white/60 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            Click to compare
          </span>
          {!lut.is_active && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white/60 text-xs font-body border border-white/20 rounded-full px-2 py-0.5">
                Inactive
              </span>
            </div>
          )}
        </button>

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
      {showCompare && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={(e) => {
            e.stopPropagation();
            setShowCompare(false);
          }}
        >
          <div
            className="relative w-full max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {lut.name}
                </p>
                <p className="truncate text-xs text-white/35">
                  Drag slider to compare original and LUT
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompare(false)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-white/25 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="relative bg-black">
              <div className="relative mx-auto aspect-[16/9] max-h-[82vh] overflow-hidden">
                <img
                  src={largePreview || imgUrl}
                  alt={`${lut.name} applied`}
                  className="absolute inset-0 h-full w-full object-contain"
                />
                <img
                  src={imgUrl}
                  alt="Original sample"
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{
                    clipPath: `inset(0 ${100 - comparePosition}% 0 0)`,
                  }}
                />
                {(largeLoading || !largePreview) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                  </div>
                )}
                <div
                  className="absolute top-0 h-full w-px bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                  style={{ left: `${comparePosition}%` }}
                >
                  <div className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/70 backdrop-blur" />
                </div>
                <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white/70 backdrop-blur">
                  Original
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white/70 backdrop-blur">
                  LUT
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={comparePosition}
                onChange={(e) => setComparePosition(Number(e.target.value))}
                className="absolute inset-x-4 bottom-4 accent-white"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
