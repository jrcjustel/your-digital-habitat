import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UnifiedAssetListing from "@/components/UnifiedAssetListing";
import RealCaseStudies from "@/components/RealCaseStudies";
import Disclaimer from "@/components/Disclaimer";
import GlossaryTooltip from "@/components/GlossaryTooltip";
import HowThisWorks from "@/components/HowThisWorks";
import AssetTypeDeepDive from "@/components/AssetTypeDeepDive";
import LegalSafetyBanner from "@/components/LegalSafetyBanner";
import NewInvestorBanner from "@/components/NewInvestorBanner";
import ListingAcademyBanner from "@/components/ListingAcademyBanner";
import VerticalConversionCta from "@/components/VerticalConversionCta";
import VerticalFaq from "@/components/VerticalFaq";
import rutaOcupados from "@/assets/ruta-ocupados.jpg";

const metrics = [
  { label: "Descuento medio", value: "35–55%" },
  { label: "ROI esperado", value: "30–55%" },
  { label: "Plazo medio", value: "12–30 m" },
  { label: "Capital orientativo", value: "50k–200k €" },
];

const InversoresOcupados = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Premium hero with background image */}
    <section className="relative overflow-hidden">
      <img src={rutaOcupados} alt="Inmuebles ocupados" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
      <div className="relative container mx-auto px-4 py-16 md:py-24 max-w-5xl">
        <div className="flex items-center gap-2 text-xs text-primary-foreground/50 mb-6">
          <Link to="/" className="hover:text-primary-foreground/80 transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/inversores" className="hover:text-primary-foreground/80 transition-colors">Inversores</Link>
          <span>/</span>
          <span className="text-primary-foreground/80">Inmuebles Ocupados</span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-4 block">
          Inversión en Inmuebles Ocupados
        </span>
        <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-primary-foreground tracking-tight mb-4">
          Inmuebles Ocupados
        </h1>
        <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl leading-relaxed">
          Inmuebles que se transmiten sin posesión. El comprador debe llevar a cabo un
          <GlossaryTooltip termKey="lanzamiento" showIcon={false}><span className="text-primary-foreground/90"> lanzamiento judicial</span></GlossaryTooltip> para
          obtener la posesión efectiva. Los mayores descuentos del mercado para inversores experimentados.
        </p>
      </div>
    </section>

    {/* Metrics strip */}
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center gap-8">
        {metrics.map((m, i) => (
          <div key={m.label} className="flex items-center gap-3">
            {i > 0 && <div className="w-px h-5 bg-border -ml-4 mr-0 hidden sm:block" />}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
              <p className="text-sm font-extrabold text-foreground tracking-tight">{m.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="container mx-auto px-4 py-8">
      <NewInvestorBanner />
      <ListingAcademyBanner assetType="ocupado" />
      <HowThisWorks assetType="ocupado" />
      <AssetTypeDeepDive assetType="ocupado" />
      <LegalSafetyBanner />
      <div className="mt-8">
        <UnifiedAssetListing defaultSaleType="ocupado" hideSaleTypeFilter />
      </div>
      <VerticalConversionCta assetType="ocupado" />
      <VerticalFaq assetType="ocupado" />
      <Disclaimer type="ocupados" />
    </div>
    <RealCaseStudies filterType="ocupado" />
    <Footer />
  </div>
);

export default InversoresOcupados;
