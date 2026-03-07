import { AlertTriangle } from "lucide-react";

interface DisclaimerProps {
  type: "npl" | "cesion-remate" | "ocupados" | "general";
}

const disclaimers: Record<string, { title: string; text: string }> = {
  npl: {
    title: "Aviso sobre NPL (Non-Performing Loans)",
    text: "La adquisición de créditos hipotecarios impagados implica la subrogación en la posición del acreedor. El comprador asume los riesgos inherentes a la gestión del crédito, incluyendo la posibilidad de no recuperar la totalidad de la inversión. Los plazos de ejecución hipotecaria pueden variar significativamente. Los importes y datos mostrados son orientativos y no constituyen oferta vinculante. Se recomienda asesoramiento jurídico y financiero independiente antes de realizar cualquier inversión. IKESA actúa como intermediario y no garantiza el resultado de las operaciones.",
  },
  "cesion-remate": {
    title: "Aviso sobre Cesiones de Remate",
    text: "La cesión de remate requiere aprobación del juzgado competente. El inmueble puede tener cargas registrales anteriores a la hipoteca ejecutada que no se cancelan con la adjudicación. La posesión efectiva no está garantizada en el momento de la cesión. Los precios mostrados son orientativos y están sujetos a las condiciones del decreto de adjudicación. Se recomienda verificación registral independiente y asesoramiento legal especializado en derecho procesal civil. IKESA no se responsabiliza de la resolución judicial de la cesión.",
  },
  ocupados: {
    title: "Aviso sobre Inmuebles Ocupados",
    text: "Los inmuebles marcados como «ocupados» se transmiten sin posesión efectiva. El adquirente deberá gestionar la recuperación posesoria por vía amistosa o judicial, asumiendo los plazos y costes asociados (desahucio, lanzamiento). El estado de conservación del inmueble puede ser desconocido o deteriorado. Los valores de mercado se refieren al inmueble libre de ocupantes y no reflejan su valor actual con ocupación. Se recomienda encarecidamente asesoramiento legal y una inspección física, si es posible, antes de la adquisición.",
  },
  general: {
    title: "Información importante",
    text: "La información contenida en esta plataforma tiene carácter meramente informativo y no constituye asesoramiento financiero, jurídico ni fiscal. Las rentabilidades pasadas no garantizan rendimientos futuros. Toda inversión inmobiliaria conlleva riesgos, incluida la pérdida parcial o total del capital invertido. Los datos de los activos provienen de fuentes consideradas fiables, pero IKESA no garantiza su exactitud ni exhaustividad. Se recomienda siempre realizar una due diligence independiente.",
  },
};

const Disclaimer = ({ type }: DisclaimerProps) => {
  const d = disclaimers[type];

  return (
    <div className="bg-secondary/60 border border-border rounded-xl p-5 mt-8">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-foreground mb-1">{d.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{d.text}</p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
