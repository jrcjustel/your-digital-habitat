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
import rutaCdr from "@/assets/ruta-cesiones-remate.jpg";

const metrics = [
  { label: "Descuento medio", value: "30–50%" },
  { label: "ROI esperado", value: "25–45%" },
  { label: "Plazo medio", value: "6–12 m" },
  { label: "Capital orientativo", value: "60k–150k €" },
];

const InversoresCdr = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    {/* Premium hero with background image */}
    <section className="relative overflow-hidden">
      <img src={rutaCdr} alt="Cesiones de remate" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
      <div className="relative container mx-auto px-4 py-16 md:py-24 max-w-5xl">
        <div className="flex items-center gap-2 text-xs text-primary-foreground/50 mb-6">
          <Link to="/" className="hover:text-primary-foreground/80 transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/inversores" className="hover:text-primary-foreground/80 transition-colors">Inversores</Link>
          <span>/</span>
          <span className="text-primary-foreground/80">Cesiones de Remate</span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-4 block">
          Inversión en <GlossaryTooltip termKey="cdr" showIcon={false}><span className="text-accent">Cesiones de Remate</span></GlossaryTooltip>
        </span>
        <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-primary-foreground tracking-tight mb-4">
          Cesiones de Remate
        </h1>
        <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl leading-relaxed">
          Cuando la <GlossaryTooltip termKey="subasta" showIcon={false}><span className="text-primary-foreground/90">subasta</span></GlossaryTooltip> queda desierta o el ejecutante resulta mejor postor,
          éste puede ceder su derecho de adjudicación. Adquisición por debajo de <GlossaryTooltip termKey="valor-mercado" showIcon={false}><span className="text-primary-foreground/90">valor de mercado</span></GlossaryTooltip>.
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
      <ListingAcademyBanner assetType="cesion" />
      <HowThisWorks assetType="cesion" />
      <AssetTypeDeepDive assetType="cesion" />
      <LegalSafetyBanner />
      <div className="mt-8">
        <UnifiedAssetListing defaultSaleType="cesion-remate" hideSaleTypeFilter />
      </div>
      <VerticalConversionCta assetType="cesion" />
      <VerticalFaq assetType="cesion" />
      <Disclaimer type="cesion-remate" />
    </div>
    <RealCaseStudies filterType="cesion" />
    <Footer />
  </div>
);

export default InversoresCdr;
