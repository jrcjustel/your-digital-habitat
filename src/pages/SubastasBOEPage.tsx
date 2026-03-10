import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gavel, MapPin, Clock, Euro, ExternalLink, Filter, Calendar, Building2 } from "lucide-react";

const mockSubastas = [
  { id: 1, ref: "BOE-2024-001", title: "Vivienda unifamiliar", location: "Madrid, Getafe", type: "Ejecución hipotecaria", valorSubasta: 180000, valorMercado: 260000, fechaSubasta: "2024-04-20", juzgado: "Juzgado 1ª Instancia nº2 Getafe", lote: 1, estado: "Abierta" },
  { id: 2, ref: "BOE-2024-002", title: "Local comercial centro", location: "Barcelona, Eixample", type: "Concursal", valorSubasta: 320000, valorMercado: 450000, fechaSubasta: "2024-04-25", juzgado: "Juzgado Mercantil nº5 Barcelona", lote: 1, estado: "Próxima" },
  { id: 3, ref: "BOE-2024-003", title: "Piso 2 hab. playa", location: "Alicante, Benidorm", type: "Ejecución hipotecaria", valorSubasta: 95000, valorMercado: 155000, fechaSubasta: "2024-05-02", juzgado: "Juzgado 1ª Instancia nº1 Benidorm", lote: 2, estado: "Abierta" },
];

const SubastasBOEPage = () => {
  const fmt = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const discount = (v: number, m: number) => Math.round((1 - v / m) * 100);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Subastas BOE | IKESA" description="Subastas judiciales del BOE con análisis IKESA" canonical="/subastas-boe" />
      <Navbar />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2"><Gavel className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold font-heading">Subastas BOE</h1></div>
          <p className="text-xl text-muted-foreground">Subastas judiciales del Boletín Oficial del Estado con análisis de oportunidad</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap gap-4 items-center p-4 bg-muted/30 rounded-lg">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Input className="w-60" placeholder="Buscar por referencia..." />
          <Select><SelectTrigger className="w-48"><SelectValue placeholder="Provincia" /></SelectTrigger><SelectContent><SelectItem value="madrid">Madrid</SelectItem><SelectItem value="barcelona">Barcelona</SelectItem><SelectItem value="alicante">Alicante</SelectItem></SelectContent></Select>
          <Select><SelectTrigger className="w-48"><SelectValue placeholder="Tipo procedimiento" /></SelectTrigger><SelectContent><SelectItem value="hipotecaria">Ejecución hipotecaria</SelectItem><SelectItem value="concursal">Concursal</SelectItem></SelectContent></Select>
        </div>

        <div className="space-y-4">
          {mockSubastas.map(s => (
            <Card key={s.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge>{s.ref}</Badge>
                      <Badge variant={s.estado === "Abierta" ? "default" : "secondary"}>{s.estado}</Badge>
                      <Badge variant="outline">{s.type}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{s.location}</div>
                    <p className="text-sm text-muted-foreground">{s.juzgado} — Lote {s.lote}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <div><p className="text-sm text-muted-foreground">Valor subasta</p><p className="text-2xl font-bold text-primary">{fmt(s.valorSubasta)}</p></div>
                    <div><p className="text-sm text-muted-foreground">Valor mercado</p><p className="text-lg font-semibold">{fmt(s.valorMercado)}</p></div>
                    <Badge className="bg-primary/10 text-primary">-{discount(s.valorSubasta, s.valorMercado)}% descuento</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Fecha subasta: <strong>{s.fechaSubasta}</strong></span></div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-1" />Ver en BOE</Button>
                    <Button size="sm">Analizar oportunidad</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubastasBOEPage;
