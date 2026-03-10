import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TrendingUp, FileText, Bell, User, Download, History, Settings, Building2, Euro, Shield } from "lucide-react";

const ClientPanelPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Panel de Cliente | IKESA" description="Tu panel personalizado de inversiones inmobiliarias" canonical="/panel-cliente" />
      <Navbar />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold font-heading mb-2">Panel de Cliente</h1>
          <p className="text-xl text-muted-foreground">Gestiona tus inversiones, favoritos y documentación</p>
          <div className="flex gap-2 mt-4">
            <Badge>KYC: Verificado</Badge>
            <Badge variant="outline">Inversor Avanzado</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Inversiones Activas", value: "3", icon: TrendingUp },
            { label: "Favoritos", value: "12", icon: Heart },
            { label: "Documentos", value: "8", icon: FileText },
            { label: "Alertas Activas", value: "5", icon: Bell },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-4"><s.icon className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></CardContent></Card>
          ))}
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="investments">Inversiones</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            <TabsTrigger value="docs">Documentos</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="settings">Ajustes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle>Últimas Operaciones</CardTitle></CardHeader><CardContent>
                {["Oferta enviada - IKE-901 (€285.000)", "NDA firmado - Cartera Alfa", "Documentación solicitada - IKE-679"].map((op, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0"><History className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{op}</span></div>
                ))}
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Notificaciones</CardTitle></CardHeader><CardContent>
                {["Nuevo activo en Madrid matching tu perfil", "Tu oferta IKE-901 está en revisión", "Webinar: Inversión en NPL - Mañana 18h"].map((n, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0"><Bell className="h-4 w-4 text-primary" /><span className="text-sm">{n}</span></div>
                ))}
              </CardContent></Card>
            </div>
          </TabsContent>
          <TabsContent value="investments"><Card><CardContent className="py-12 text-center text-muted-foreground"><Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p>Tus inversiones activas aparecerán aquí</p><Button className="mt-4">Explorar oportunidades</Button></CardContent></Card></TabsContent>
          <TabsContent value="favorites"><Card><CardContent className="py-12 text-center text-muted-foreground"><Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p>Marca activos como favoritos para verlos aquí</p></CardContent></Card></TabsContent>
          <TabsContent value="docs"><Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p>Documentación de tus operaciones</p></CardContent></Card></TabsContent>
          <TabsContent value="alerts"><Card><CardContent className="py-12 text-center text-muted-foreground"><Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p>Configura alertas personalizadas</p></CardContent></Card></TabsContent>
          <TabsContent value="settings"><Card><CardContent className="py-12 text-center text-muted-foreground"><Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p>Preferencias y configuración de cuenta</p></CardContent></Card></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default ClientPanelPage;
