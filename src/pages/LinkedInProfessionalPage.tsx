import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Linkedin, Users, Briefcase, Award, TrendingUp, Building2, ExternalLink } from "lucide-react";

const professionals = [
  { name: "Equipo Legal", role: "Abogados especializados", desc: "Expertos en derecho hipotecario y procesal", members: 5 },
  { name: "Análisis de Mercado", role: "Analistas inmobiliarios", desc: "Data-driven market intelligence", members: 3 },
  { name: "Gestión de Activos", role: "Asset managers", desc: "Gestión integral de carteras distressed", members: 4 },
  { name: "Relación con Inversores", role: "Investor relations", desc: "Comunicación y gestión de inversores", members: 2 },
];

const LinkedInProfessionalPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Red Profesional LinkedIn | IKESA" description="Red profesional IKESA en LinkedIn - Inversión inmobiliaria distressed" canonical="/linkedin" />
      <Navbar />

      <div className="bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-xl bg-blue-600 flex items-center justify-center"><Linkedin className="h-8 w-8 text-white" /></div>
            <div>
              <h1 className="text-4xl font-bold font-heading">IKESA Professional Network</h1>
              <p className="text-xl text-muted-foreground">Conecta con profesionales del sector inmobiliario distressed</p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Button className="bg-blue-600 hover:bg-blue-700"><Linkedin className="h-4 w-4 mr-2" />Seguir en LinkedIn</Button>
            <Button variant="outline"><ExternalLink className="h-4 w-4 mr-2" />Ver perfil completo</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Seguidores", value: "3.4K", icon: Users },
            { label: "Publicaciones", value: "120+", icon: Briefcase },
            { label: "Artículos", value: "45", icon: Award },
            { label: "Conexiones", value: "850+", icon: TrendingUp },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-4"><s.icon className="h-8 w-8 text-blue-600" /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></CardContent></Card>
          ))}
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-8">Nuestro Equipo</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {professionals.map(p => (
              <Card key={p.name} className="hover:shadow-lg transition-all">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Building2 className="h-7 w-7 text-blue-600" /></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    <p className="text-sm text-blue-600 mb-1">{p.role}</p>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                    <Badge variant="outline" className="mt-2">{p.members} miembros</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LinkedInProfessionalPage;
