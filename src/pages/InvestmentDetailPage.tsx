import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Share2, Download, MapPin, Euro, Clock, Gavel, Building2, TrendingUp, Users, Ruler, Calendar, FileText } from "lucide-react";
import { useState, useEffect } from "react";

const mockInvestment = {
  id: "1", ref: "IKE-679", title: "Los Puertas - Vivienda Unifamiliar", location: "Málaga, Andalucía",
  address: "Camino Los Puertas s/n, 29792 Málaga", price: 46000, marketValue: 97200, debt: 169020,
  yield: 15.2, sqm: 162, sqmSuelo: 603, yearBuilt: 2009, type: "NPL", propertyType: "Vivienda",
  status: "Disponible", deposit: 6.05, commission: 5.0, occupancy: "No disponible",
  judicial: { type: "Ejecución hipotecaria", court: "Primera Instancia nº1 de Archidona", stage: "Demanda Presentada", date: "2024-04-29", amount: 99379 },
  description: "Vivienda unifamiliar con terreno de 603m² en zona residencial tranquila. Excelente oportunidad de inversión con alto potencial de revalorización.",
  endDate: new Date(Date.now() + 5 * 86400000),
};

const InvestmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);
  const inv = mockInvestment;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = inv.endDate.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${inv.title} | IKESA`} description={inv.description} canonical={`/inversion/${id}`} />
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/inversiones")}>Inversiones</Button><span>/</span><span>{inv.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex gap-2"><Badge variant="outline">{inv.type}</Badge><Badge variant="secondary">{inv.propertyType}</Badge><Badge className="bg-primary/10 text-primary">{inv.ref}</Badge></div>
                    <h1 className="text-3xl font-bold">{inv.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /><span>{inv.address}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsFav(!isFav)}><Heart className={`h-4 w-4 ${isFav ? "fill-destructive text-destructive" : ""}`} /></Button>
                    <Button variant="ghost" size="sm"><Share2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-muted/30">
                <CardHeader className="bg-foreground text-background text-center py-3"><CardTitle className="text-lg">Datos Financieros</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4 text-center">
                  <div><p className="text-2xl font-bold">{fmt(inv.marketValue)}</p><p className="text-sm text-muted-foreground">Valor de mercado</p></div>
                  <div><p className="text-2xl font-bold text-primary">{fmt(inv.price)}</p><p className="text-sm text-muted-foreground">Precio mínimo</p></div>
                  <div><p className="text-lg font-semibold">{fmt(inv.debt)}</p><p className="text-sm text-muted-foreground">Deuda aproximada</p></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="bg-foreground text-background text-center py-3"><CardTitle className="text-lg">Inmueble</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-muted-foreground">Superficie</p><p className="font-semibold">{inv.sqm} m² construidos</p></div>
                    <div><p className="text-muted-foreground">Suelo</p><p className="font-semibold">{inv.sqmSuelo} m²</p></div>
                    <div><p className="text-muted-foreground">Año</p><p className="font-semibold">{inv.yearBuilt}</p></div>
                    <div><p className="text-muted-foreground">Ocupación</p><p className="font-semibold">{inv.occupancy}</p></div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[{ v: timeLeft.days, l: "Días" }, { v: timeLeft.hours, l: "Horas" }, { v: timeLeft.minutes, l: "Min" }, { v: timeLeft.seconds, l: "Seg" }].map(t => (
                        <div key={t.l} className="bg-background rounded p-2"><p className="text-2xl font-bold">{String(t.v).padStart(2, "0")}</p><p className="text-xs text-muted-foreground">{t.l}</p></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="description">
              <TabsList><TabsTrigger value="description">Descripción</TabsTrigger><TabsTrigger value="legal">Info Judicial</TabsTrigger><TabsTrigger value="docs">Documentos</TabsTrigger></TabsList>
              <TabsContent value="description" className="mt-4"><Card><CardContent className="p-6"><p>{inv.description}</p></CardContent></Card></TabsContent>
              <TabsContent value="legal" className="mt-4"><Card><CardContent className="p-6 space-y-3">
                {[["Tipo", inv.judicial.type], ["Juzgado", inv.judicial.court], ["Fase", inv.judicial.stage], ["Fecha", inv.judicial.date], ["Cantidad reclamada", fmt(inv.judicial.amount)]].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between border-b pb-2"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
                ))}
              </CardContent></Card></TabsContent>
              <TabsContent value="docs" className="mt-4"><Card><CardContent className="py-8 text-center text-muted-foreground"><FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" /><p>Firma el NDA para acceder a la documentación</p></CardContent></Card></TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/30">
              <CardHeader><CardTitle>Presentar Oferta</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Importe oferta (€)</Label><Input type="number" placeholder="Ej: 50000" /></div>
                <div><Label>Condiciones</Label><Textarea placeholder="Condiciones de tu oferta..." /></div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm"><Euro className="h-4 w-4 text-primary" /><span>Depósito: {inv.deposit}% | Comisión: {inv.commission}%</span></div>
                <Button className="w-full">Enviar Oferta</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Rentabilidad Estimada</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">ROI estimado</span><span className="font-bold text-primary">{inv.yield}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Descuento s/mercado</span><span className="font-bold text-primary">{Math.round((1 - inv.price / inv.marketValue) * 100)}%</span></div>
                <Separator />
                <Button variant="outline" className="w-full"><Users className="h-4 w-4 mr-2" />Contactar asesor</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InvestmentDetailPage;
