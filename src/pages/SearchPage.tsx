import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Filter, Building2, Ruler, Euro, SlidersHorizontal } from "lucide-react";

const SearchPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Buscador Avanzado | IKESA" description="Busca inmuebles y oportunidades de inversión con filtros avanzados" canonical="/buscar" />
      <Navbar />

      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h1 className="text-5xl font-bold font-heading">Encuentra tu inversión ideal</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Busca entre cientos de oportunidades inmobiliarias con nuestro sistema avanzado</p>
          <div className="max-w-3xl mx-auto flex gap-2">
            <div className="relative flex-1"><Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" /><Input className="pl-12 h-12 text-lg" placeholder="Buscar por referencia, ubicación o tipo..." /></div>
            <Button size="lg" className="h-12 px-8">Buscar</Button>
          </div>
        </div>
      </section>

      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 items-center">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <Select><SelectTrigger className="w-44"><SelectValue placeholder="Tipo inversión" /></SelectTrigger><SelectContent><SelectItem value="npl">NPL</SelectItem><SelectItem value="cdr">Cesión Remate</SelectItem><SelectItem value="subasta">Subasta</SelectItem><SelectItem value="compraventa">Compraventa</SelectItem></SelectContent></Select>
            <Select><SelectTrigger className="w-44"><SelectValue placeholder="Tipo activo" /></SelectTrigger><SelectContent><SelectItem value="vivienda">Vivienda</SelectItem><SelectItem value="local">Local</SelectItem><SelectItem value="nave">Nave</SelectItem><SelectItem value="terreno">Terreno</SelectItem></SelectContent></Select>
            <Select><SelectTrigger className="w-44"><SelectValue placeholder="Provincia" /></SelectTrigger><SelectContent><SelectItem value="madrid">Madrid</SelectItem><SelectItem value="barcelona">Barcelona</SelectItem><SelectItem value="valencia">Valencia</SelectItem><SelectItem value="malaga">Málaga</SelectItem></SelectContent></Select>
            <Select><SelectTrigger className="w-44"><SelectValue placeholder="Precio" /></SelectTrigger><SelectContent><SelectItem value="0-100k">Hasta €100.000</SelectItem><SelectItem value="100k-300k">€100.000 - €300.000</SelectItem><SelectItem value="300k+">Más de €300.000</SelectItem></SelectContent></Select>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground py-16">Utiliza los filtros o el buscador para encontrar oportunidades de inversión</p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SearchPage;
