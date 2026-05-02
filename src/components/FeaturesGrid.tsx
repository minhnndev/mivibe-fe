import { Zap, Palette, BarChart3, Shield } from "lucide-react";
import BlurText from "./BlurText";
import { motion } from "motion/react";

const features = [
  {
    icon: Zap,
    title: "Real-Time Preview",
    body: "See your filter stack update instantly—no renders, no delays. Compare looks side-by-side and commit when it feels right.",
  },
  {
    icon: Palette,
    title: "Curated LUT Library",
    body: "From clean and modern to bold and cinematic. Start with a preset, then shape it into your own style.",
  },
  {
    icon: BarChart3,
    title: "Consistent Results",
    body: "Save presets, apply them across a set, and keep your feed or client deliverables perfectly cohesive.",
  },
  {
    icon: Shield,
    title: "Export-Ready",
    body: "Deliver high-quality results with the look intact—ready for social, web, or your next campaign.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-24 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <div className="liquid-glass rounded-full px-3.5 py-1">
            <span className="text-white text-xs font-medium font-body">
              Why It Works
            </span>
          </div>
          <BlurText
            text="Make your photos feel intentional."
            className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] justify-center"
            delay={100}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="liquid-glass rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="liquid-glass-strong rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                <f.icon size={18} className="text-white" />
              </div>
              <h4 className="text-white font-heading italic text-xl leading-tight">
                {f.title}
              </h4>
              <p className="text-white/60 font-body font-light text-sm leading-relaxed">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
