import { motion } from "framer-motion";

const servicers = [
  { name: "Hipoges", logo: "/logos/hipoges.png" },
  { name: "Servihabitat", logo: "/logos/servihabitat.png" },
  { name: "Aliseda", logo: "/logos/aliseda.png" },
  { name: "Anticipa", logo: "/logos/anticipa.png" },
  { name: "Axactor", logo: "/logos/axactor.png" },
  { name: "doValue", logo: "/logos/dovalue.png" },
];

const ServicersBar = () => (
  <section className="py-10 border-y border-border bg-background">
    <div className="container mx-auto px-4">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-6"
      >
        Servicers y fondos institucionales con los que operamos
      </motion.p>
      <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
        {servicers.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-500"
          >
            <img
              src={s.logo}
              alt={s.name}
              className="h-9 md:h-11 w-auto object-contain"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicersBar;