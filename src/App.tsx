import "./index.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StartSection from "./components/StartSection";
import FeaturesChess from "./components/FeaturesChess";
import FeaturesGrid from "./components/FeaturesGrid";
import Stats from "./components/Stats";
import Testimonials from "./components/Testimonials";
import CtaFooter from "./components/CtaFooter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export default function App() {
  const slides = useMemo(
    () => [
      {
        id: "workflow",
        label: "Workflow",
        node: <StartSection asSlide />,
      },
      {
        id: "capabilities",
        label: "Capabilities",
        node: <FeaturesChess />,
      },
      {
        id: "highlights",
        label: "Highlights",
        node: <FeaturesGrid />,
      },
      {
        id: "stats",
        label: "Stats",
        node: <Stats asSlide />,
      },
      {
        id: "reviews",
        label: "Reviews",
        node: <Testimonials />,
      },
      {
        id: "get-app",
        label: "Get App",
        node: <CtaFooter asSlide />,
      },
    ],
    [],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const activeId = slides[activeIndex]?.id ?? slides[0]!.id;
  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex((i) => (i + 1) % slides.length);
  const onSelect = (id: string) => {
    const index = slides.findIndex((s) => s.id === id);
    if (index >= 0) setActiveIndex(index);
  };

  return (
    <div className="bg-black min-h-screen">
      <Hero>
        <div className="relative h-full w-full">
          <Navbar
            items={slides.map(({ id, label }) => ({ id, label }))}
            activeId={activeId}
            onSelect={onSelect}
          />

          {/* Slide viewport */}
          <div className="absolute inset-0 px-6 md:px-24 py-16 md:py-20">
            <div className="h-full w-full overflow-hidden">
              <div
                className="flex h-full w-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className="w-full h-full shrink-0 overflow-y-auto hide-scrollbar"
                  >
                    {slide.node}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom-right controls */}
          <div className="absolute right-6 bottom-6 z-50 flex items-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous section"
              className="liquid-glass-strong rounded-full w-11 h-11 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next section"
              className="liquid-glass-strong rounded-full w-11 h-11 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </div>
        </div>
      </Hero>
    </div>
  );
}
