import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, Target, Building2, Globe, Users, Zap } from "lucide-react";

const competitors = [
  { name: "Anticipa RE", market: "NPL/REO", strengths: "Gran cartera bancaria", coverage: "Nacional", score: 72 },
  { name: "Haya RE", market: "REO/Servicer", strengths: "Volumen transaccional", coverage: "Nacional", score: 68 },
  { name: "Servihabitat", market: "REO", strengths: "Red comercial amplia", coverage: "Nacional", score: 65 },
  { name: "Altamira", market: "REO/NPL", strengths: "Tecnología y plataforma", coverage: "Nacional", score: 70 },
  { name: "Solvia", market: "REO", strengths: "Marca reconocida", coverage: "Nacional", score: 63 },
];

const CompetitiveAnalysisPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Análisis Competitivo | IKESA" description="Inteligencia competitiva del mercado inmobiliario distressed" canonical="/analisis-competitivo" />
      <Navbar />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2"><Target className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold font-heading">Análisis Competitivo</h1></div>
          <p className="text-xl text-muted-foreground">Inteligencia de mercado y posicionamiento frente a competidores</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Cuota de Mercado IKESA", value: "3.2%", trend: "+0.8%", icon: BarChart3, up: true },
            { label: "Competidores Monitorizados", value: "12", trend: "+2", icon: Users, up: true },
            { label: "Precio Medio vs Mercado", value: "-15%", trend: "Ventaja", icon: TrendingDown, up: true },
            { label: "Velocidad de Cierre", value: "23 días", trend: "-5 días", icon: Zap, up: true },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2"><s.icon className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">{s.label}</span></div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className={`text-sm ${s.up ? "text-primary" : "text-destructive"}`}>{s.trend}</p>
            </CardContent></Card>
          ))}
        </div>

        <Tabs defaultValue="competitors">
          <TabsList>
            <TabsTrigger value="competitors">Competidores</TabsTrigger>
            <TabsTrigger value="market">Mercado</TabsTrigger>
            <TabsTrigger value="positioning">Posicionamiento</TabsTrigger>
          </TabsList>

          <TabsContent value="competitors" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Matriz Competitiva</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b">
                      <th className="text-left p-3">Empresa</th><th className="text-left p-3">Mercado</th><th className="text-left p-3">Fortaleza</th><th className="text-left p-3">Cobertura</th><th className="text-left p-3">Score</th>
                    </tr></thead>
                    <tbody>
                      {competitors.map(c => (
                        <tr key={c.name} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{c.name}</td>
                          <td className="p-3"><Badge variant="outline">{c.market}</Badge></td>
                          <td className="p-3 text-muted-foreground">{c.strengths}</td>
                          <td className="p-3">{c.coverage}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${c.score}%` }} /></div>
                              <span className="font-medium">{c.score}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-primary/5 font-semibold">
                        <td className="p-3 text-primary">IKESA</td>
                        <td className="p-3"><Badge>NPL/CDR/VSP</Badge></td>
                        <td className="p-3">IA + Especialización distressed</td>
                        <td className="p-3">Nacional</td>
                        <td className="p-3"><div className="flex items-center gap-2"><div className="h-2 w-24 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: "78%" }} /></div><span className="text-primary">78</span></div></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="market"><Card><CardContent className="py-12 text-center text-muted-foreground"><Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p>Análisis del mercado inmobiliario distressed en España</p></CardContent></Card></TabsContent>
          <TabsContent value="positioning"><Card><CardContent className="py-12 text-center text-muted-foreground"><Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p>Mapa de posicionamiento estratégico</p></CardContent></Card></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default CompetitiveAnalysisPage;
