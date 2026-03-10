import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2, TrendingUp, Users, Shield, BarChart3, FileText,
  ArrowRight, CheckCircle2, Briefcase, Globe, Lock, Zap,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const stats = [
  { value: "+500", label: "Inversores registrados" },
  { value: "98%", label: "Tasa de colocación" },
  { value: "<30d", label: "Tiempo medio de venta" },
  { value: "+27K", label: "Activos gestionados" },
];

const services = [
  {
    icon: BarChart3,
    title: "Venta Granular",
    desc: "Comercialización unitaria de activos con fichas profesionales, scoring de inversión y acceso a nuestra base de inversores cualificados.",
  },
  {
    icon: Briefcase,
    title: "Subasta Privada",
    desc: "Proceso de subasta controlada entre inversores preseleccionados con NDA firmado. Máxima confidencialidad y competencia de ofertas.",
  },
  {
    icon: Users,
    title: "Colocación Directa",
    desc: "Matching algorítmico entre las características del activo y los perfiles de inversor registrados. Contacto directo con compradores cualificados.",
  },
  {
    icon: Globe,
    title: "Carteras Completas",
    desc: "Gestión integral de portfolios NPL, REO y mixtos. Estructuración de la venta, data room virtual y coordinación del proceso de due diligence.",
  },
];

const process = [
  { step: "01", title: "Análisis", desc: "Evaluamos la cartera y definimos la estrategia de comercialización óptima." },
  { step: "02", title: "Preparación", desc: "Creamos fichas profesionales, scoring y documentación para cada activo." },
  { step: "03", title: "Comercialización", desc: "Activamos la difusión a nuestra red de inversores cualificados." },
  { step: "04", title: "Cierre", desc: "Gestionamos las ofertas, negociación y cierre de la operación." },
];

const advantages = [
  { icon: Zap, text: "Tecnología propia de valoración y scoring" },
  { icon: Shield, text: "Procesos con NDA y confidencialidad garantizada" },
  { icon: TrendingUp, text: "Red activa de +500 inversores profesionales" },
  { icon: Lock, text: "Data room virtual con control de acceso" },
  { icon: FileText, text: "Dossiers de inversión de nivel institucional" },
  { icon: BarChart3, text: "Algoritmo de matching inversor-activo" },
];

const VendedoresPage = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", empresa: "", email: "", telefono: "", mensaje: "", numActivos: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.empresa) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_requests").insert({
      nombre: `${form.nombre} (${form.empresa})`,
      email: form.email,
      telefono: form.telefono || null,
      mensaje: `[VENDEDORES] Nº activos: ${form.numActivos || "N/A"}. ${form.mensaje}`,
      servicio: "vendedores",
    });
    setLoading(false);
    if (error) {
      toast.error("Error al enviar. Inténtalo de nuevo.");
    } else {
      toast.success("Solicitud enviada correctamente. Nos pondremos en contacto.");
      setForm({ nombre: "", empresa: "", email: "", telefono: "", mensaje: "", numActivos: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Vende tus activos inmobiliarios | IKESA — Plataforma para Bancos y Fondos"
        description="Comercializa carteras NPL, REO e inmuebles adjudicados a través de nuestra red de +500 inversores profesionales. Venta granular, subasta privada y colocación directa."
        canonical="/vendedores"
        keywords="vender cartera NPL, vender activos inmobiliarios, comercialización REO, subasta privada inmobiliaria, IKESA vendedores"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
          <div className="max-w-3xl">
            <Badge variant="outline" className="border-accent/40 text-accent mb-6 text-xs">
              Para Bancos, Fondos y Servicers
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-heading font-bold tracking-tight mb-6">
              Comercializa tus activos <br />
              <span className="text-accent">con la mayor red de inversores</span> de España
            </h1>
            <p className="text-lg text-background/70 max-w-2xl mb-8 leading-relaxed">
              Conectamos entidades financieras y fondos con inversores cualificados.
              Tecnología, transparencia y rapidez para la desinversión de carteras NPL, REO e inmuebles adjudicados.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-foreground font-semibold" onClick={() => document.getElementById("formulario-vendedores")?.scrollIntoView({ behavior: "smooth" })}>
                Solicitar información <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10">
                Ver caso de éxito
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className={`py-8 text-center ${i < stats.length - 1 ? "border-r border-border" : ""}`}>
                <p className="text-3xl font-bold text-accent">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Modalidades de comercialización</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Adaptamos la estrategia al tipo de activo, volumen de cartera y objetivos de desinversión.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {services.map((s, i) => (
              <Card key={i} className="border-border/60 hover:border-accent/30 transition-colors">
                <CardContent className="p-7">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <s.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-14">Proceso de trabajo</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {process.map((p, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent text-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {p.step}
                </div>
                <h3 className="font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">¿Por qué IKESA?</h2>
              <p className="text-muted-foreground mb-8">No somos un portal inmobiliario al uso. Somos una plataforma tecnológica de inversión que conecta activos con inversores cualificados.</p>
              <div className="grid gap-4">
                {advantages.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <a.icon className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-sm text-foreground font-medium">{a.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <Card className="border-border/60" id="formulario-vendedores">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-foreground mb-1">Solicitar información</h3>
                <p className="text-sm text-muted-foreground mb-6">Cuéntanos sobre tus activos y te propondremos la mejor estrategia.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                    <div><Label>Empresa *</Label><Input value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                    <div><Label>Teléfono</Label><Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
                  </div>
                  <div><Label>Nº aproximado de activos</Label><Input value={form.numActivos} onChange={e => setForm({ ...form, numActivos: e.target.value })} placeholder="Ej: 50, +100, cartera mixta..." /></div>
                  <div><Label>Mensaje</Label><Textarea value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} placeholder="Tipo de activos, ubicación, urgencia..." rows={3} /></div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar solicitud"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <Building2 className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold mb-3">¿Gestionas una cartera de activos?</h2>
          <p className="text-background/70 max-w-lg mx-auto mb-6">Contacta con nuestro equipo de originación para una propuesta personalizada sin compromiso.</p>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-foreground font-semibold" onClick={() => document.getElementById("formulario-vendedores")?.scrollIntoView({ behavior: "smooth" })}>
            Contactar equipo <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VendedoresPage;
