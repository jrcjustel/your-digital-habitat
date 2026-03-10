import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Building2, Gavel, TrendingUp, Brain, Calculator, Map, Users, FileText, BarChart3, Shield, BookOpen, MessageSquare, Star, ArrowRight } from "lucide-react";

const sections = [
  { title: "Marketplace", desc: "Activos inmobiliarios disponibles", href: "/marketplace", icon: Building2, badge: "12 activos" },
  { title: "Marketplace Avanzado", desc: "Filtros profesionales de búsqueda", href: "/marketplace-avanzado", icon: BarChart3 },
  { title: "Subastas", desc: "Pujas en tiempo real", href: "/subastas", icon: Gavel, badge: "3 activas" },
  { title: "Subastas BOE", desc: "Subastas judiciales del BOE", href: "/subastas-boe", icon: Gavel },
  { title: "Subastas Premium", desc: "Oportunidades premium con análisis", href: "/subastas-premium", icon: Star },
  { title: "Inversiones", desc: "Portfolio y seguimiento", href: "/inversiones", icon: TrendingUp },
  { title: "Insights IA", desc: "Análisis con inteligencia artificial", href: "/ai-insights", icon: Brain },
  { title: "Analítica Predictiva", desc: "Predicciones de mercado", href: "/analitica-predictiva", icon: BarChart3 },
  { title: "Calculadoras", desc: "Hipoteca y rentabilidad", href: "/calculadoras", icon: Calculator },
  { title: "Mapa", desc: "Explorar por ubicación", href: "/mapa", icon: Map },
  { title: "Comparador", desc: "Compara activos", href: "/comparador", icon: Users },
  { title: "Academia", desc: "Aprende a invertir", href: "/academia", icon: BookOpen },
  { title: "Red Profesional", desc: "Networking con profesionales", href: "/red-profesional", icon: Users },
  { title: "Colaboradores", desc: "Partners y colaboradores", href: "/colaboradores", icon: Users },
  { title: "Testimonios", desc: "Lo que dicen nuestros clientes", href: "/testimonios", icon: MessageSquare },
  { title: "Panel de Cliente", desc: "Tu panel personalizado", href: "/panel-cliente", icon: Shield },
];

const IkesaHubPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Hub IKESA | Centro de Inversión" description="Centro de todas las herramientas y secciones de IKESA" canonical="/hub" />
      <Navbar />
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl font-bold font-heading mb-4">Hub IKESA</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Accede a todas las herramientas, secciones y funcionalidades de la plataforma</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map(s => (
            <Card key={s.title} className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate(s.href)}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"><s.icon className="h-5 w-5 text-primary" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{s.title}</h3>
                    {s.badge && <Badge variant="secondary" className="text-xs">{s.badge}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default IkesaHubPage;
