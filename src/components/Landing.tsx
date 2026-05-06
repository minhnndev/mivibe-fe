import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getCategories, getLuts } from "@/admin/store";
import { renderLutPreview } from "@/admin/lutEngine";
import type { Lut } from "@/admin/types";

const PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=85";

const lutLabels = ["Warm", "Blue", "Teal", "Noir", "Film"];

const storeBadgeStyle = {
  backgroundImage: "url('/google-apple-download.png')",
  backgroundSize: "400px 122.5px",
  backgroundRepeat: "no-repeat",
};

function isCinematicLut(lut: Lut, cinematicCategoryId?: string) {
  const fields = [lut.name, lut.slug, lut.description, ...(lut.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return lut.category_id === cinematicCategoryId || fields.includes("cinematic");
}

export default function Landing() {
  const [luts, setLuts] = useState<Lut[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [appliedPreview, setAppliedPreview] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const compareAreaRef = useRef<HTMLDivElement | null>(null);

  const activeLut = luts[activeIndex];

  const updateComparePosition = (clientX: number) => {
    const rect = compareAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setComparePosition(Math.min(100, Math.max(0, next)));
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([getLuts(), getCategories()]).then(([allLuts, categories]) => {
      if (cancelled) return;

      const cinematicCategoryId = categories.find(
        (category) => category.slug === "cinematic",
      )?.id;
      const activeLuts = allLuts
        .filter((lut) => lut.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);
      const cinematicLuts = activeLuts.filter((lut) =>
        isCinematicLut(lut, cinematicCategoryId),
      );

      setLuts((cinematicLuts.length ? cinematicLuts : activeLuts).slice(0, 5));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (luts.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % luts.length);
      setComparePosition(50);
    }, 12000);

    return () => window.clearInterval(interval);
  }, [luts.length]);

  useEffect(() => {
    let cancelled = false;
    if (!activeLut) {
      setLoadingPreview(false);
      return;
    }

    setLoadingPreview(true);
    setAppliedPreview(null);

    renderLutPreview(
      PREVIEW_IMAGE,
      activeLut.storage_key || activeLut.filename,
      activeLut.intensity || 1,
      1100,
    )
      .then((preview) => {
        if (!cancelled) setAppliedPreview(preview);
      })
      .catch(() => {
        if (!cancelled) setAppliedPreview(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeLut]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0b0b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(255,180,120,0.22),transparent_56%),linear-gradient(135deg,#17110d_0%,#0b0b0b_45%,#050505_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_62%,rgba(197,138,79,0.14),transparent_36%)]" />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-12 px-5 py-8 sm:px-8 lg:grid-cols-[0.72fr_1fr] lg:px-10">
        <div className="relative z-10 max-w-2xl space-y-8">
          <div className="text-xs font-medium uppercase tracking-[0.36em] text-[#c58a4f]">
            Mivibe Studio
          </div>

          <div className="space-y-5">
            <h1 className="font-serif text-6xl leading-[0.92] tracking-[-0.02em] text-white sm:text-7xl lg:text-8xl">
              Craft <span className="text-[#c58a4f]">cinematic</span> photos.
            </h1>
            <p className="max-w-md text-base leading-7 text-white/60 sm:text-lg">
              Apply cinematic LUTs instantly. Drag to compare. See the
              difference before you commit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              aria-label="Download on the App Store"
              className="h-[3.5rem] w-[12.25rem] rounded-[0.72rem] border border-white/18 bg-black p-0 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:scale-[1.02] hover:bg-black"
            >
              <span
                className="block h-full w-full rounded-[0.72rem]"
                style={{
                  ...storeBadgeStyle,
                  backgroundPosition: "-203.5px -65.5px",
                }}
              />
            </Button>
            <Button
              aria-label="Get it on Google Play"
              className="h-[3.5rem] w-[12.25rem] rounded-[0.72rem] border border-white/18 bg-black p-0 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:scale-[1.02] hover:bg-black"
            >
              <span
                className="block h-full w-full rounded-[0.72rem]"
                style={{
                  ...storeBadgeStyle,
                  backgroundPosition: "-203.5px 0px",
                }}
              />
            </Button>
          </div>
        </div>

        <div className="relative -mx-5 sm:mx-0 lg:-mr-16">
          <div className="absolute -inset-8 rounded-full bg-[#c58a4f]/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-l-[2rem] bg-black shadow-[0_50px_180px_rgba(0,0,0,0.68)] sm:rounded-[2rem] lg:rounded-[2.75rem]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium uppercase tracking-[0.24em] text-white/80">
                  {activeLut?.name ?? "Loading cinematic LUT"}
                </p>
                <p className="mt-1 truncate text-xs text-white/42">
                  Drag to compare the grade
                </p>
              </div>
              <div className="liquid-glass rounded-full px-3 py-1 text-xs text-white/62">
                {activeIndex + 1}/{Math.max(luts.length, 1)}
              </div>
            </div>

            <div className="relative bg-black">
              <div
                ref={compareAreaRef}
                className="relative aspect-[4/5] overflow-hidden select-none touch-none sm:aspect-[16/11] lg:aspect-[15/11]"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  updateComparePosition(event.clientX);
                }}
                onPointerMove={(event) => {
                  if (event.buttons !== 1) return;
                  event.preventDefault();
                  updateComparePosition(event.clientX);
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_24%,rgba(255,198,129,0.38),transparent_28%),linear-gradient(135deg,#2a170f_0%,#9b6338_46%,#101820_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,232,196,0.22),transparent_34%),linear-gradient(0deg,rgba(0,0,0,0.34),transparent_52%)]" />
                {!imageFailed && (
                  <>
                    <img
                      src={appliedPreview || PREVIEW_IMAGE}
                      alt={
                        activeLut ? `${activeLut.name} applied` : "Applied LUT"
                      }
                      draggable={false}
                      onError={() => setImageFailed(true)}
                      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-500"
                    />
                    <img
                      src={PREVIEW_IMAGE}
                      alt="Original sample"
                      draggable={false}
                      onError={() => setImageFailed(true)}
                      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                      style={{
                        clipPath: `inset(0 ${100 - comparePosition}% 0 0)`,
                      }}
                    />
                  </>
                )}

                {loadingPreview && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/32">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                  </div>
                )}

                <div
                  className="pointer-events-none absolute top-0 h-full w-px -translate-x-1/2 bg-white/70 shadow-[0_0_28px_rgba(255,255,255,0.65)]"
                  style={{
                    left: `clamp(18px, ${comparePosition}%, calc(100% - 18px))`,
                  }}
                >
                  <div className="liquid-glass-strong absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_12px_42px_rgba(0,0,0,0.45)]">
                    <div className="h-4 w-px bg-white/80" />
                  </div>
                </div>

                <div className="liquid-glass absolute bottom-20 left-5 rounded-full px-3 py-1 text-[10px] uppercase tracking-widest text-white/75 sm:bottom-24">
                  Original
                </div>
                <div className="liquid-glass absolute bottom-20 right-5 rounded-full px-3 py-1 text-[10px] uppercase tracking-widest text-white/75 sm:bottom-24">
                  LUT
                </div>
              </div>

              <Slider
                min={0}
                max={100}
                value={[comparePosition]}
                onValueChange={([value]) => setComparePosition(value ?? 50)}
                className="absolute inset-x-5 bottom-5 w-auto opacity-0"
              />
            </div>

            <div className="absolute inset-x-4 bottom-4 grid grid-cols-5 gap-2 sm:inset-x-6 sm:bottom-6">
              {luts.map((lut, index) => (
                <button
                  key={lut.id}
                  type="button"
                  onClick={() => {
                    setActiveIndex(index);
                    setComparePosition(50);
                  }}
                  className={`liquid-glass rounded-full px-2 py-2 text-[10px] uppercase tracking-[0.16em] transition sm:text-xs ${
                    index === activeIndex ? "text-white" : "text-white/45"
                  }`}
                >
                  {lutLabels[index] ?? lut.name.slice(0, 6)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
