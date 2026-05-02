import BlurText from "./BlurText";
import { motion } from "motion/react";

const testimonials = [
  {
    quote:
      "A complete rebuild in five days. The result outperformed everything we'd spent months building before.",
    name: "Sarah Chen",
    role: "CEO, Luminary",
  },
  {
    quote:
      "Conversions up 4x. That's not a typo. The design just works differently when it's built on real data.",
    name: "Marcus Webb",
    role: "Head of Growth, Arcline",
  },
  {
    quote:
      "They didn't just design our site. They defined our brand. World-class doesn't begin to cover it.",
    name: "Elena Voss",
    role: "Brand Director, Helix",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 gap-4">
          <div className="liquid-glass rounded-full px-3.5 py-1">
            <span className="text-white text-xs font-medium font-body">
              What They Say
            </span>
          </div>
          <BlurText
            text="Don't take our word for it."
            className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9] justify-center"
            delay={100}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="liquid-glass rounded-2xl p-8 flex flex-col gap-6"
            >
              <p className="text-white/80 font-body font-light text-sm italic leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div>
                <p className="text-white font-body font-medium text-sm">
                  {t.name}
                </p>
                <p className="text-white/50 font-body font-light text-xs mt-0.5">
                  {t.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
