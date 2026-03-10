import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Package, Percent, Euro } from "lucide-react";
import { motion } from "framer-motion";

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

      return {
        totalAssets: totalAssets || 27000,
        avgDiscount,
        provinces,
        avgRoi: 28,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const kpis = [
    { icon: Package, value: stats ? `${(stats.totalAssets).toLocaleString("es-ES")}` : "27.000+", label: "Activos disponibles" },
    { icon: Percent, value: stats ? `${stats.avgDiscount}%` : "42%", label: "Descuento medio" },
    { icon: MapPin, value: stats ? `${stats.provinces}` : "52", label: "Provincias" },
  ];

  return (
    <section className="relative z-10 -mt-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-card rounded-2xl shadow-xl border border-border p-2"
        >
          <div className="grid grid-cols-3 divide-x divide-border">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="flex items-center gap-3 px-4 py-5 md:px-6">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <kpi.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-extrabold text-foreground leading-none">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default KpiBar;
