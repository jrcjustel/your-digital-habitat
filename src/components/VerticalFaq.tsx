import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface VerticalFaqProps {
  assetType: "npl" | "cesion" | "ocupado";
}

const faqs: Record<string, { q: string; a: string }[]> = {
  npl: [
    { q: "¿Qué significa comprar un NPL?", a: "Compras el derecho de crédito impagado (la deuda), no el inmueble directamente. Te subrogas en la posición del acreedor y puedes ejecutar la garantía hipotecaria para obtener el inmueble." },
    { q: "¿Necesito experiencia previa?", a: "Es recomendable tener conocimientos básicos de procesos judiciales. IKESA ofrece rutas formativas específicas y asesoramiento a través de gestores especializados." },
    { q: "¿Cuánto tiempo tarda en resolverse un NPL?", a: "Depende del estado del procedimiento judicial. Si la ejecución está avanzada, puede resolverse en 6-12 meses. Si está en fase inicial, puede tardar 18-36 meses." },
    { q: "¿Puede el deudor ejercer retracto?", a: "Sí, el artículo 1535 del Código Civil permite al deudor ejercer retracto en créditos litigiosos, pagando el precio de cesión + costas + intereses." },
    { q: "¿Qué descuentos son típicos en NPL?", a: "Los descuentos sobre la deuda pendiente suelen oscilar entre el 25% y el 50%, dependiendo del estado del procedimiento, la garantía y la zona geográfica." },
  ],
  cesion: [
    { q: "¿Qué es exactamente una cesión de remate?", a: "Cuando la subasta queda desierta o el ejecutante es mejor postor, este puede ceder su derecho de adjudicación a un tercero. Tú adquieres el inmueble al precio de adjudicación más el importe de la cesión." },
    { q: "¿Es seguro comprar por cesión de remate?", a: "Sí, la cesión se formaliza ante el Juzgado. El Juez emite un auto de adjudicación a tu nombre y un mandamiento de cancelación de cargas posteriores a la hipoteca." },
    { q: "¿Cuánto tarda el proceso?", a: "Una vez acordada la cesión, el proceso ante el Juzgado suele tardar entre 1 y 3 meses para obtener el auto de adjudicación." },
    { q: "¿Qué pasa con las cargas del inmueble?", a: "Las cargas posteriores a la hipoteca ejecutada se cancelan automáticamente con el mandamiento judicial. Las cargas anteriores (si las hubiera) subsisten." },
    { q: "¿Puede estar ocupado el inmueble?", a: "Sí, es posible. En ese caso, además de la cesión, necesitarás gestionar un lanzamiento judicial para obtener la posesión, lo cual añade tiempo y coste." },
  ],
  ocupado: [
    { q: "¿Qué significa que un inmueble está ocupado?", a: "Que hay personas viviendo en él sin título válido (contrato vencido, ocupación sin título, etc.). Adquieres la propiedad pero no la posesión física." },
    { q: "¿Cuánto tarda un desahucio?", a: "En España, el plazo varía mucho por CCAA y juzgado: entre 6 y 24 meses. En Madrid y Barcelona suele ser más largo que en provincias más pequeñas." },
    { q: "¿Y si hay personas vulnerables?", a: "La normativa actual (RDL 11/2020 y extensiones) puede suspender lanzamientos de hogares vulnerables. Esto alarga el plazo y puede requerir ofrecer alternativa habitacional." },
    { q: "¿Merece la pena el descuento por ocupación?", a: "Los descuentos por ocupación suelen ser del 30-55% sobre valor de mercado. Si la situación legal es gestionable, puede ser muy rentable, pero requiere experiencia y paciencia." },
    { q: "¿Puedo negociar directamente con el ocupante?", a: "Sí, y de hecho es la vía más rápida. Un acuerdo extrajudicial (ofreciendo compensación por la salida voluntaria) puede resolver la situación en semanas en lugar de meses." },
  ],
};

const VerticalFaq = ({ assetType }: VerticalFaqProps) => {
  const items = faqs[assetType];
  return (
    <div className="my-8">
      <h3 className="font-heading text-base font-bold text-foreground mb-4 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-accent" /> Preguntas frecuentes
      </h3>
      <Accordion type="single" collapsible className="space-y-2">
        {items.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-xl border border-border px-4">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default VerticalFaq;
