import { motion } from "framer-motion";

const logoStrips = [
  "/logos/strip-1.webp",
  "/logos/strip-2.webp",
  "/logos/strip-3.webp",
];

const ServicersBar = () => (
  <section className="py-10 border-y border-border bg-background overflow-hidden">
    <div className="container mx-auto px-4">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-8"
      >
        Colaboramos con múltiples entidades
      </motion.p>
    </div>

    {/* Infinite scrolling marquee */}
    <div className="relative w-full">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee items-center gap-12">
        {/* Double the strips for seamless loop */}
        {[...logoStrips, ...logoStrips, ...logoStrips, ...logoStrips, ...logoStrips, ...logoStrips].map((src, i) => (
          <img
            key={i}
            src={src}
            alt="Entidades colaboradoras"
            className="h-8 md:h-12 w-auto object-contain flex-shrink-0 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
          />
        ))}
      </div>
    </div>
  </section>
);

export default ServicersBar;
