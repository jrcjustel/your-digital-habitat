import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { createBreadcrumbSchema } from "@/components/SEOHead";
import UnifiedAssetListing from "@/components/UnifiedAssetListing";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const PropertyListing = () => {
  const [searchParams] = useSearchParams();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Inmuebles en Venta — Viviendas, Locales, Oficinas y Terrenos | IKESA"
        description="Encuentra inmuebles en venta en toda España: viviendas, locales comerciales, oficinas y terrenos. Inversión inmobiliaria con descuentos sobre valor de mercado."
        canonical="/inmuebles"
        keywords="inmuebles en venta España, viviendas baratas, locales comerciales, oficinas inversión, terrenos en venta, comprar piso descuento"
        jsonLd={createBreadcrumbSchema([
          { name: "Inicio", url: "/" },
          { name: "Inmuebles", url: "/inmuebles" },
        ])}
      />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Oportunidades</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Title – humanized */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Datos reales, actualizados a diario
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
            className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2"
          >
            Encuentra tu próxima inversión
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-muted-foreground max-w-2xl leading-relaxed"
          >
            NPLs, cesiones de remate, ocupados, subastas… Todo en un sitio, con información
            verificada y análisis financiero para que no vayas a ciegas.
          </motion.p>
        </div>

        <UnifiedAssetListing
          initialSearch={searchParams.get("q") || ""}
          initialSaleType={searchParams.get("saleType") || ""}
          initialProvince={searchParams.get("province") || ""}
          initialType={searchParams.get("type") || ""}
          initialView={(searchParams.get("view") as "grid" | "list" | "map") || "grid"}
        />
      </div>

      <Footer />
    </div>
  );
};

export default PropertyListing;
