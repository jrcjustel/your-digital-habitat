import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2, ArrowRight, MapPin, Clock, Star, Users, Euro, FileText, Scale, TrendingDown, BookOpen } from "lucide-react";

const servicers = [
  {
    name: "Aliseda (Blackstone)",
    logo: "/logos/aliseda.png",
    type: "Gran tenedor",
    coverage: "Nacional",
    assetTypes: ["Viviendas", "Locales", "Suelo", "Naves"],
    strengths: ["Gran volumen de activos", "Procesos estandarizados", "Plataforma digital propia"],
    considerations: ["Tiempos de respuesta largos en ofertas", "Negociación con poco margen en activos prime"],
    typicalDiscount: "15–35%",
    responseTime: "15–30 días",
    specialization: "REO residencial y suelo",
  },
  {
    name: "Hipoges",
    logo: "/logos/hipoges.png",
    type: "Servicer independiente",
    coverage: "Nacional + Portugal",
    assetTypes: ["NPL", "CDR", "Viviendas", "Locales"],
    strengths: ["Amplio catálogo de NPL", "Gestión integral de deuda", "Flexibilidad en cesiones"],
    considerations: ["Documentación más compleja en NPL", "Requiere due diligence más profunda"],
    typicalDiscount: "25–50%",
    responseTime: "10–20 días",
    specialization: "NPL y cesión de crédito",
  },
  {
    name: "Servihabitat (CaixaBank)",
    logo: "/logos/servihabitat.png",
    type: "Servicer bancario",
    coverage: "Nacional",
    assetTypes: ["Viviendas", "Locales", "Garajes"],
    strengths: ["Activos bien documentados", "Proceso de compra claro", "Buen estado de conservación"],
    considerations: ["Descuentos menores en activos residenciales", "Menos flexibilidad en precios"],
    typicalDiscount: "10–25%",
    responseTime: "20–30 días",
    specialization: "REO bancario residencial",
  },
  {
    name: "doValue",
    logo: "/logos/dovalue.png",
    type: "Servicer europeo",
    coverage: "Nacional",
    assetTypes: ["NPL", "CDR", "Viviendas", "Terciario"],
    strengths: ["Gestión de carteras complejas", "Experiencia en activos judicializados", "Red europea"],
    considerations: ["Procesos internos más formales", "Documentación en múltiples formatos"],
    typicalDiscount: "20–40%",
    responseTime: "15–25 días",
    specialization: "NPL y carteras mixtas",
  },
  {
    name: "Anticipa (Ares/Intrum)",
    logo: "/logos/anticipa.png",
    type: "Gran tenedor",
    coverage: "Nacional",
    assetTypes: ["Viviendas", "Ocupados", "Suelo"],
    strengths: ["Volumen alto de ocupados", "Descuentos agresivos", "Programas de alquiler social"],
    considerations: ["Alta proporción de activos sin posesión", "Plazos de posesión variables"],
    typicalDiscount: "30–55%",
    responseTime: "10–20 días",
    specialization: "Activos ocupados y situaciones especiales",
  },
  {
    name: "Axactor",
    logo: "/logos/axactor.png",
    type: "Servicer nórdico",
    coverage: "Nacional",
    assetTypes: ["NPL", "Crédito consumo", "Hipotecario"],
    strengths: ["Especialización en deuda", "Procesos digitalizados", "Equipos locales"],
    considerations: ["Catálogo inmobiliario más reducido", "Mayor enfoque en deuda que en REO"],
    typicalDiscount: "25–45%",
    responseTime: "10–15 días",
    specialization: "Gestión de deuda y NPL",
  },
];

const ServicerComparisonPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-14 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-accent" />
          </div>
          <Badge variant="secondary" className="text-xs">Guía de Mercado</Badge>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Guía de Servicers en España
        </h1>
        <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl">
          Conoce los principales gestores de activos distressed del mercado español, sus fortalezas,
          tipología de activos y qué esperar al operar con cada uno.
        </p>
      </div>
    </section>

    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">

      {/* What is a servicer */}
      <Card className="border-accent/20">
        <CardContent className="p-6">
          <h2 className="font-heading text-base font-bold text-foreground mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" /> ¿Qué es un servicer?
          </h2>
          <p className="text-sm text-muted-foreground">
            Un <strong>servicer</strong> es una entidad especializada en la gestión y comercialización de activos
            inmobiliarios y carteras de deuda procedentes de entidades financieras, fondos de inversión
            o procesos de reestructuración bancaria. Son el intermediario principal entre el propietario
            del activo (banco, fondo) y el inversor comprador.
          </p>
        </CardContent>
      </Card>

      {/* Servicer cards */}
      <div className="space-y-4">
        {servicers.map((s) => (
          <Card key={s.name}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <img src={s.logo} alt={s.name} className="w-12 h-12 rounded-xl object-contain bg-muted p-1.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-heading text-base font-bold text-foreground">{s.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{s.coverage}</Badge>
                    <Badge className="text-[10px] bg-accent/10 text-accent border-0">{s.specialization}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Descuento típico</p>
                  <p className="text-sm font-bold text-accent">{s.typicalDiscount}</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Tiempo respuesta</p>
                  <p className="text-sm font-bold text-foreground">{s.responseTime}</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Tipos de activo</p>
                  <p className="text-xs text-foreground">{s.assetTypes.join(", ")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent" /> Fortalezas
                  </p>
                  <ul className="space-y-1">
                    {s.strengths.map((str, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-accent mt-0.5">+</span> {str}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-muted-foreground" /> A tener en cuenta
                  </p>
                  <ul className="space-y-1">
                    {s.considerations.map((con, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-muted-foreground mt-0.5">•</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-8 text-center">
        <h3 className="font-heading text-xl font-bold text-primary-foreground mb-2">
          Explora activos de todos los servicers
        </h3>
        <p className="text-primary-foreground/70 text-sm mb-6">
          En IKESA agregamos oportunidades de múltiples servicers en un único catálogo.
        </p>
        <Button asChild variant="secondary" className="gap-2">
          <Link to="/inmuebles"><ArrowRight className="w-4 h-4" /> Ver catálogo completo</Link>
        </Button>
      </div>
    </div>

    <Footer />
  </div>
);

export default ServicerComparisonPage;
