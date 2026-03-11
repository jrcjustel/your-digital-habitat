import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Package, Percent, Euro } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/* Animated counter */
const AnimatedNumber = ({ target, suffix = "" }: { target: string; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const num = parseFloat(target.replace(/[^0-9.,]/g, "").replace(",", "."));
    if (isNaN(num)) { setDisplay(target); return; }
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = num * eased;
      setDisplay(
        num >= 1000
          ? Math.round(current).toLocaleString("es-ES")
          : num % 1 !== 0
          ? current.toFixed(1)
          : Math.round(current).toString()
      );
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, target]);

  return <span ref={ref}>{display}{suffix}</span>;
};

const KpiBar = () => {
  const { data: stats } = useQuery({
    queryKey: ["home-kpis"],
    queryFn: async () => {
      const { count: totalAssets } = await supabase
        .from("npl_assets")
        .select("*", { count: "exact", head: true })
        .eq("publicado", true);

      const { data: assets } = await supabase
        .from("npl_assets")
        .select("precio_orientativo, valor_mercado, provincia")
        .eq("publicado", true)
        .not("valor_mercado", "is", null)
        .gt("valor_mercado", 0)
        .limit(1000);

      const discountable = assets?.filter(a => a.precio_orientativo && a.valor_mercado && a.valor_mercado > 0) || [];
      const avgDiscount = discountable.length
        ? Math.round(discountable.reduce((s, a) => s + (1 - a.precio_orientativo! / a.valor_mercado!) * 100, 0) / discountable.length)
        : 42;

      const provinces = new Set(assets?.map(a => a.provincia).filter(Boolean)).size || 52;

      const totalVolume = assets?.reduce((s, a) => s + (a.valor_mercado || 0), 0) || 0;
      const volumeMillions = (totalVolume / 1_000_000).toFixed(1);

      return {
        totalAssets: totalAssets || 27000,
        avgDiscount,
        provinces,
        volumeMillions,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const kpis = [
    { icon: Package, value: stats ? `${stats.totalAssets}` : "27000", suffix: "", label: "Activos analizados" },
    { icon: Percent, value: stats ? `${stats.avgDiscount}` : "42", suffix: "%", label: "Descuento medio" },
    { icon: MapPin, value: stats ? `${stats.provinces}` : "52", suffix: "", label: "Provincias cubiertas" },
    { icon: Euro, value: stats ? `${stats.volumeMillions}` : "0", suffix: "M €", label: "Volumen gestionado" },
  ];

  return (
    <section className="relative z-10 -mt-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.9 }}
          className="bg-card rounded-2xl shadow-xl border border-border p-2"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 px-4 py-5 md:px-6 group"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors duration-300">
                  <kpi.icon className="w-5 h-5 text-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-extrabold text-foreground leading-none">
                    <AnimatedNumber target={kpi.value} suffix={kpi.suffix} />
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{kpi.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default KpiBar;
