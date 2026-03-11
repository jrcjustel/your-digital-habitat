import Navbar from "@/components/Navbar";
import HeroSearch from "@/components/HeroSearch";
import KpiBar from "@/components/KpiBar";
import CategoryShowcase from "@/components/CategoryShowcase";
import CategoryCards from "@/components/CategoryCards";
import ServicersBar from "@/components/ServicersBar";
import ConversionCtas from "@/components/ConversionCtas";
import WhyInvest from "@/components/WhyInvest";
import ValuationCta from "@/components/ValuationCta";
import Newsletter from "@/components/Newsletter";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import SEOHead, { organizationSchema, websiteSchema, createFAQSchema } from "@/components/SEOHead";

const homeFAQs = [
  { question: "¿Qué es un activo NPL?", answer: "Un NPL (Non-Performing Loan) es un préstamo hipotecario impagado que los bancos y fondos venden con descuentos significativos, permitiendo al inversor adquirir el derecho sobre el inmueble a precios muy por debajo del valor de mercado." },
  { question: "¿Qué es una cesión de remate?", answer: "Es la cesión del derecho de adjudicación en una subasta judicial. El adjudicatario original cede su posición a un tercero, permitiendo adquirir inmuebles a precios de subasta sin participar directamente en el proceso judicial." },
  { question: "¿Cuánto puedo ahorrar invirtiendo en activos distressed?", answer: "Los descuentos sobre valor de mercado oscilan entre el 30% y el 60%, dependiendo del tipo de activo, su estado ocupacional y la fase judicial en la que se encuentre." },
  { question: "¿Es seguro invertir en inmuebles ocupados?", answer: "Con el debido análisis legal y asesoramiento profesional, la inversión en inmuebles ocupados puede ser muy rentable. IKESA proporciona toda la información judicial, catastral y de valoración necesaria para tomar decisiones informadas." },
  { question: "¿Necesito experiencia para invertir en NPL?", answer: "No es imprescindible, pero sí recomendable. IKESA ofrece una Academia gratuita con rutas formativas especializadas en cada tipología de activo para que puedas invertir con conocimiento." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="IKESA — Inversión Inmobiliaria Alternativa en España | NPL, Cesiones de Remate, Subastas BOE"
        description="Plataforma líder en inversión inmobiliaria alternativa en España. Accede a +27.000 activos NPL, cesiones de remate, subastas BOE e inmuebles ocupados con descuentos de hasta el 60%."
        canonical="/"
        keywords="inversión inmobiliaria España, NPL, cesiones de remate, subastas BOE, inmuebles ocupados, activos distressed, comprar deuda hipotecaria, non-performing loans, inversión alternativa, IKESA"
        jsonLd={[organizationSchema, websiteSchema, createFAQSchema(homeFAQs)]}
      />
      <Navbar />
      <HeroSearch />
      <KpiBar />
      <ServicersBar />
      <CategoryShowcase />
      <ConversionCtas />
      <WhyInvest />
      <ValuationCta />
      <Newsletter />
      <BlogSection />
      <Footer />
    </div>
  );
};

export default Index;
