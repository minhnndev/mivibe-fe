import HLSVideo from "./HLSVideo";
import { motion } from "motion/react";

const VIDEO_SRC =
  "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8";

const stats = [
  { value: "200+", label: "Sites launched" },
  { value: "98%", label: "Client satisfaction" },
  { value: "3.2x", label: "More conversions" },
  { value: "5 days", label: "Average delivery" },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden py-32">
      <HLSVideo
        src={VIDEO_SRC}
        className="absolute inset-0 w-full h-full object-cover"
        desaturate
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
      <div className="relative z-10 flex items-center justify-center px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="liquid-glass rounded-3xl p-12 md:p-16 w-full max-w-5xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white">
                  {s.value}
                </span>
                <span className="text-white/60 font-body font-light text-sm">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
