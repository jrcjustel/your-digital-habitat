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
  <section className="py-10 bg-secondary/50 border-y border-border">
    <div className="container mx-auto px-4">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6"
      >
        Servicers y fondos que gestionamos
      </motion.p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {servicers.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
          >
            <img
              src={s.logo}
              alt={s.name}
              className="h-10 md:h-12 w-auto object-contain"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicersBar;
