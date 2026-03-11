import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, MapPin, Euro, Building2, Scale, Clock, TrendingDown, DoorOpen, FileText, AlertTriangle, Shield, Users, Ruler } from "lucide-react";

const fields = [
  {
    category: "Identificación",
    items: [
      { icon: FileText, field: "Referencia", description: "Código único del activo en el catálogo del servicer. Útil para comunicarte con tu gestor." },
      { icon: Building2, field: "Tipo de activo", description: "Clasificación del inmueble: vivienda, local, nave, solar, garaje, etc. Determina fiscalidad y estrategia de salida." },
      { icon: MapPin, field: "Ubicación", description: "Municipio, provincia y comunidad autónoma. Clave para evaluar liquidez de zona y demanda." },
      { icon: Ruler, field: "Superficie (m²)", description: "Metros cuadrados construidos o útiles. Fundamental para calcular el precio por metro cuadrado y comparar con testigos." },
    ],
  },
  {
    category: "Precios y descuento",
    items: [
      { icon: Euro, field: "Precio orientativo", description: "Importe de referencia para la adquisición, fijado por el servicer. No es vinculante — puedes ofertar por debajo." },
      { icon: TrendingDown, field: "Valor de mercado", description: "Estimación del valor del inmueble en condiciones normales de venta (vacío, sin cargas). Se usa como referencia para calcular el descuento." },
      { icon: TrendingDown, field: "Descuento (%)", description: "Diferencia porcentual entre el precio orientativo y el valor de mercado. Un descuento > 30% suele considerarse atractivo para inversión." },
    ],
  },
  {
    category: "Estado legal y procesal",
    items: [
      { icon: Scale, field: "Tipo de procedimiento", description: "Indica si el activo proviene de ejecución hipotecaria, concurso de acreedores, dación en pago, etc. Afecta a plazos y complejidad." },
      { icon: Clock, field: "Estado/Fase judicial", description: "Fase actual del procedimiento: pendiente subasta, adjudicado, pendiente posesión, etc. Indica cuánto falta para la resolución." },
      { icon: Shield, field: "Cesión de remate (CDR)", description: "Si está marcado, el activo se adquiere mediante cesión del derecho de adjudicación. El inmueble ya ha sido subastado." },
      { icon: FileText, field: "Cesión de crédito (NPL)", description: "Si está marcado, adquieres el derecho de crédito impagado, no el inmueble directamente. Te subrogas como acreedor." },
    ],
  },
  {
    category: "Estado ocupacional y posesión",
    items: [
      { icon: DoorOpen, field: "Estado ocupacional", description: "Indica si el inmueble está vacío, ocupado con título (alquiler), ocupado sin título (okupa) o con persona vulnerable. Impacta precio y plazos." },
      { icon: AlertTriangle, field: "Propiedad sin posesión", description: "Si está marcado, adquieres la propiedad pero necesitas un proceso judicial (lanzamiento) para obtener la posesión física." },
      { icon: Users, field: "Número de titulares", description: "Cuántos propietarios o deudores están involucrados. Más titulares = mayor complejidad en la negociación o ejecución." },
    ],
  },
  {
    category: "Datos del servicer",
    items: [
      { icon: Building2, field: "Cartera / Servicer", description: "Entidad que gestiona y comercializa el activo (Aliseda, Hipoges, Servihabitat, etc.). Cada servicer tiene sus propios procesos y tiempos." },
      { icon: Euro, field: "Comisión (%)", description: "Porcentaje sobre el precio de venta que cobra el servicer como honorarios. Se suma al precio de adquisición." },
      { icon: Euro, field: "Depósito (%)", description: "Señal o depósito requerido para formalizar la oferta. Normalmente entre 5% y 10% del precio ofertado." },
    ],
  },
];

const HowToReadListingPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-14 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-accent" />
          </div>
          <Badge variant="secondary" className="text-xs">Guía Educativa</Badge>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Cómo Leer una Ficha de Activo
        </h1>
        <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl">
          Guía campo por campo para entender toda la información que encontrarás en las fichas
          de oportunidades de inversión de IKESA.
        </p>
      </div>
    </section>

    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-10">

      {/* Intro tip */}
      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Consejo para principiantes</p>
          <p className="text-xs text-muted-foreground">
            No todos los campos estarán disponibles en cada ficha. La información varía según el tipo de activo
            (NPL, CDR, REO) y lo que el servicer haya proporcionado. Centra tu análisis en: descuento, estado
            ocupacional y tipo de procedimiento.
          </p>
        </div>
      </div>

      {/* Field categories */}
      {fields.map((cat) => (
        <div key={cat.category}>
          <h2 className="font-heading text-lg font-bold text-foreground mb-4">{cat.category}</h2>
          <div className="space-y-3">
            {cat.items.map((item) => (
              <Card key={item.field}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.field}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-8 text-center">
        <h3 className="font-heading text-xl font-bold text-primary-foreground mb-2">
          ¿Listo para explorar oportunidades?
        </h3>
        <p className="text-primary-foreground/70 text-sm mb-6">
          Ahora que entiendes cada campo, navega por el catálogo con confianza.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary" className="gap-2">
            <Link to="/inmuebles"><ArrowRight className="w-4 h-4" /> Ver catálogo</Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/guia-inversion/scoring"><BookOpen className="w-4 h-4" /> Entender el scoring</Link>
          </Button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
);

export default HowToReadListingPage;
