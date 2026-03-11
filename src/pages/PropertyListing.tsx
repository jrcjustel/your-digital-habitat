import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { createBreadcrumbSchema } from "@/components/SEOHead";
import UnifiedAssetListing from "@/components/UnifiedAssetListing";
import { motion } from "framer-motion";

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

      {/* Premium editorial header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Oportunidades</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-2"
          >
            Encuentra tu próxima inversión
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-muted-foreground max-w-2xl"
          >
            NPLs, cesiones de remate, ocupados, subastas — información verificada y análisis financiero en cada oportunidad.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
