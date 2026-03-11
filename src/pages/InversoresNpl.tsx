import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InvestmentListing from "@/components/InvestmentListing";
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
import { CreditCard, TrendingDown, Shield, FileText } from "lucide-react";

const highlights = [
  { icon: CreditCard, text: "Adquieres el derecho de crédito impagado" },
  { icon: TrendingDown, text: "Descuentos significativos sobre deuda" },
  { icon: Shield, text: "Te subrogas en posición acreedora" },
  { icon: FileText, text: "Gestión judicial o negociación" },
];

const InversoresNpl = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-14 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">Inversión en <GlossaryTooltip termKey="npl" showIcon={false}><span className="text-accent">NPL</span></GlossaryTooltip></span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Compra de crédito impagado (<GlossaryTooltip termKey="npl" showIcon={false}>NPL</GlossaryTooltip>)</h1>
        <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mb-8">
          Adquiere derechos de <GlossaryTooltip termKey="cesion-credito" showIcon={false}><span className="text-primary-foreground/90">crédito hipotecario</span></GlossaryTooltip> impagado subrogándote en la posición del acreedor.
          Accede a descuentos significativos sobre la deuda pendiente y obtén la garantía inmobiliaria asociada al préstamo.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {highlights.map((h) => (
            <div key={h.text} className="bg-primary-foreground/10 rounded-xl p-3 flex items-start gap-2">
              <h.icon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <span className="text-xs text-primary-foreground/90 leading-tight">{h.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
    <div className="container mx-auto px-4 py-8">
      <NewInvestorBanner />
      <ListingAcademyBanner assetType="npl" />
      <HowThisWorks assetType="npl" />
      <AssetTypeDeepDive assetType="npl" />
      <LegalSafetyBanner />
      <div className="mt-8">
        <InvestmentListing filterFn={(q: any) => q.eq("cesion_credito", true)} />
      </div>
      <VerticalConversionCta assetType="npl" />
      <VerticalFaq assetType="npl" />
      <Disclaimer type="npl" />
    </div>
    <RealCaseStudies filterType="npl" />
    <Footer />
  </div>
);

export default InversoresNpl;
