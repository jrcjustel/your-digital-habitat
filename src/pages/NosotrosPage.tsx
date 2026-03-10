import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target, Eye, Shield, Lightbulb, TrendingUp, Users,
  Building2, BarChart3, BookOpen, Zap, ArrowRight, Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const values = [
  { icon: Shield, title: "Transparencia", desc: "Toda la información de cada activo disponible antes de invertir. Sin letra pequeña, sin sorpresas." },
  { icon: BarChart3, title: "Datos", desc: "Decisiones de inversión basadas en datos reales: scoring, valoración algorítmica y análisis de mercado." },
  { icon: Lightbulb, title: "Innovación", desc: "Tecnología propia para automatizar due diligence, valoraciones y matching de oportunidades." },
  { icon: Users, title: "Accesibilidad", desc: "Democratizamos el acceso a oportunidades antes reservadas a grandes fondos e inversores institucionales." },
];

const numbers = [
  { value: "+27.000", label: "Activos analizados" },
  { value: "+500", label: "Inversores activos" },
  { value: "15+", label: "Comunidades autónomas" },
  { value: "4", label: "Tipologías de activo" },
];

const differentiators = [
  { icon: Zap, title: "Motor de Scoring", desc: "Algoritmo propietario que evalúa cada activo con +10 variables: descuento, liquidez, riesgo legal, rentabilidad y más." },
  { icon: TrendingUp, title: "Valoración Institucional", desc: "Informes de valoración estándar DataVenue/Idealista con triple precio, testigos y datos sociodemográficos del INE." },
  { icon: BookOpen, title: "Academia de Inversión", desc: "Formación especializada en subastas BOE, NPL, cesiones de remate e inmuebles ocupados con casos reales." },
  { icon: Building2, title: "Dossiers Profesionales", desc: "Generación automática de dossiers de inversión con TIR, ROI, flujos de caja y cronogramas operativos." },
  { icon: Award, title: "IA Especializada", desc: "Asesor inteligente entrenado en inversión inmobiliaria alternativa para análisis de oportunidades en tiempo real." },
  { icon: Shield, title: "Compliance Total", desc: "Cumplimiento riguroso de RGPD, LOPDGDD, LSSI-CE y Ley 2/2023. Canal de denuncias integrado." },
];

const NosotrosPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Sobre IKESA — Inversión Inmobiliaria Alternativa en España"
        description="Conoce IKESA: la plataforma tecnológica líder en inversión inmobiliaria alternativa. NPL, subastas, cesiones de remate e inmuebles ocupados con herramientas profesionales."
        canonical="/nosotros"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 20l4-4 2 2-4 4-2-2zm20-16l4-4 2 2-4 4-2-2zM0 0h1.41l-1.41 1.41V0zm20 0h1.41l-18 18-1.41-1.41L20 0z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="border-accent/40 text-accent mb-6 text-xs">
              Sobre IKESA
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-heading font-bold tracking-tight mb-6">
              Democratizamos la inversión<br />
              <span className="text-accent">inmobiliaria alternativa</span>
            </h1>
            <p className="text-lg text-background/70 max-w-2xl mx-auto leading-relaxed">
              Creamos la plataforma que nos hubiera gustado tener como inversores: herramientas profesionales,
              datos transparentes y acceso a oportunidades que antes solo estaban al alcance de los grandes fondos.
            </p>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {numbers.map((n, i) => (
              <div key={i} className={`py-8 text-center ${i < numbers.length - 1 ? "border-r border-border" : ""}`}>
                <p className="text-3xl font-bold text-accent">{n.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{n.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-border/60">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-3">Misión</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Facilitar el acceso a oportunidades de inversión inmobiliaria alternativa en España mediante
                  tecnología avanzada, transparencia radical y herramientas de análisis profesionales.
                  Queremos que cualquier inversor, independientemente de su tamaño, pueda tomar decisiones
                  informadas con el mismo nivel de datos que un fondo institucional.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-3">Visión</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Convertirnos en la plataforma de referencia en España para la inversión en activos
                  inmobiliarios alternativos: subastas judiciales, NPL, cesiones de remate e inmuebles ocupados.
                  Un ecosistema completo donde inversores y vendedores se encuentren con total confianza y eficiencia.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-14">Nuestros valores</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((v, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Lo que nos diferencia</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Combinamos tecnología de nivel institucional con la accesibilidad de una plataforma abierta.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {differentiators.map((d, i) => (
              <Card key={i} className="border-border/60 hover:border-accent/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <d.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{d.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-heading font-bold mb-3">¿Listo para invertir de forma inteligente?</h2>
          <p className="text-background/70 max-w-lg mx-auto mb-6">
            Explora oportunidades con descuentos de hasta el 60% sobre valor de mercado.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-foreground font-semibold" onClick={() => navigate("/inmuebles")}>
              Ver oportunidades <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10" onClick={() => navigate("/contacto")}>
              Contactar
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NosotrosPage;
