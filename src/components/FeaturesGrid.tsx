import { Zap, Palette, BarChart3, Shield } from "lucide-react";
import BlurText from "./BlurText";
import { motion } from "motion/react";

const features = [
  {
    icon: Zap,
    title: "Days, Not Months",
    body: "Concept to launch at a pace that redefines fast. Because waiting isn't a strategy.",
  },
  {
    icon: Palette,
    title: "Obsessively Crafted",
    body: "Every detail considered. Every element refined. Design so precise, it feels inevitable.",
  },
  {
    icon: BarChart3,
    title: "Built to Convert",
    body: "Layouts informed by data. Decisions backed by performance. Results you can measure.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    body: "Enterprise-grade protection comes standard. SSL, DDoS mitigation, compliance. All included.",
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
              Why Us
            </span>
          </div>
          <BlurText
            text="The difference is everything."
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
