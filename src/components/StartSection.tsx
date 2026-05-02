import { ArrowUpRight } from "lucide-react";
import HLSVideo from "./HLSVideo";
import BlurText from "./BlurText";

const VIDEO_SRC =
  "https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8";

export default function StartSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "700px" }}
    >
      {/* HLS Video Background */}
      <HLSVideo
        src={VIDEO_SRC}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: "200px",
          background: "linear-gradient(to bottom, black, transparent)",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: "200px",
          background: "linear-gradient(to top, black, transparent)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-32 gap-6"
        style={{ minHeight: "700px" }}
      >
        <div className="liquid-glass rounded-full px-3.5 py-1">
          <span className="text-white text-xs font-medium font-body">
            How It Works
          </span>
        </div>

        <BlurText
          text="You dream it. We ship it."
          className="text-4xl md:text-5xl lg:text-6xl font-heading italic tracking-tight leading-[0.9] text-white justify-center"
          delay={120}
        />

        <p className="text-white/60 font-body font-light text-sm md:text-base max-w-md leading-relaxed">
          Share your vision. Our AI handles the rest—wireframes, design, code,
          launch. All in days, not quarters.
        </p>

        <button className="liquid-glass-strong rounded-full px-6 py-3 text-white font-body text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform">
          Get Started
          <ArrowUpRight size={16} />
        </button>
      </div>
    </section>
  );
}
