import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

type BlurTextProps = {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: "words" | "chars";
};

export default function BlurText({
  text,
  className = "",
  delay = 100,
  animateBy = "words",
}: BlurTextProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <p
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: animateBy === "words" ? "0.28em" : "0",
      }}
    >
      {elements.map((el, i) => (
        <motion.span
          // using index as key is fine here: deterministic animation ordering
          key={i}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={inView ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}}
          transition={{
            delay: (i * delay) / 1000,
            duration: 0.7,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          style={{ display: "inline-block" }}
        >
          {el}
        </motion.span>
      ))}
    </p>
  );
}
