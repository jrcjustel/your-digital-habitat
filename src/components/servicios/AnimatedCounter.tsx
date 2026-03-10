import { useRef, useState, useEffect } from "react";
import { useMotionValue, useSpring, useInView } from "framer-motion";

const AnimatedCounter = ({ target, label }: { target: number; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionVal.set(target);
  }, [isInView, target, motionVal]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsubscribe;
  }, [spring]);

  return (
    <div ref={ref} className="flex items-center gap-3 bg-accent/10 rounded-xl p-4 mb-4 mx-5">
      <span className="text-3xl font-heading font-black text-accent tabular-nums">{display}</span>
      <span className="text-xs text-muted-foreground leading-tight">{label}</span>
    </div>
  );
};

export default AnimatedCounter;
