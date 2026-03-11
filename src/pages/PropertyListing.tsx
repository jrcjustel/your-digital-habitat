import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { createBreadcrumbSchema } from "@/components/SEOHead";
import UnifiedAssetListing from "@/components/UnifiedAssetListing";

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
        {/* Title */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            Descubre nuestras oportunidades
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Invierte en oportunidades exclusivas: NPLs, cesiones de remate, inmuebles ocupados y compraventa directa.
            Accede a información verificada y análisis financiero con proyecciones de rentabilidad.
          </p>
        </div>

        <UnifiedAssetListing
          initialSearch={searchParams.get("q") || ""}
          initialSaleType={searchParams.get("saleType") || ""}
          initialProvince={searchParams.get("province") || ""}
          initialType={searchParams.get("type") || ""}
          initialView={(searchParams.get("view") as "grid" | "list") || "grid"}
        />
      </div>

      <Footer />
    </div>
  );
};

export default PropertyListing;
