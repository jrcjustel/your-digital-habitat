import { AlertTriangle, Ban, Eye, Landmark, Home, Scale } from "lucide-react";

interface DisclaimerProps {
  type: "npl" | "cesion-remate" | "ocupados" | "general" | "compraventa";
}

interface DisclaimerData {
  title: string;
  text: string;
  restrictions: { icon: React.ReactNode; label: string }[];
}

const disclaimers: Record<string, DisclaimerData> = {
  npl: {
    title: "Producto de inversión: Compra de Crédito (NPL)",
    text: "Este activo es un crédito hipotecario impagado. La adquisición implica subrogarse en la posición del acreedor, NO la compra directa del inmueble. El comprador asume los riesgos inherentes a la gestión del crédito, incluyendo la posibilidad de no recuperar la totalidad de la inversión. Los plazos de ejecución hipotecaria pueden variar significativamente. Los importes mostrados son orientativos y no constituyen oferta vinculante. Se recomienda asesoramiento jurídico y financiero independiente. IKESA actúa como intermediario y no garantiza el resultado de las operaciones.",
    restrictions: [
      { icon: <Eye className="w-3.5 h-3.5" />, label: "No se puede visitar el inmueble" },
      { icon: <Landmark className="w-3.5 h-3.5" />, label: "No es hipotecable" },
      { icon: <Home className="w-3.5 h-3.5" />, label: "No se adquiere la propiedad directamente" },
      { icon: <Scale className="w-3.5 h-3.5" />, label: "Requiere proceso judicial para la posesión" },
    ],
  },
  "cesion-remate": {
    title: "Producto de inversión: Cesión de Remate (CDR)",
    text: "La cesión de remate requiere aprobación del juzgado competente. El inmueble puede tener cargas registrales anteriores que no se cancelan con la adjudicación. La posesión efectiva no está garantizada en el momento de la cesión. Los precios son orientativos y están sujetos al decreto de adjudicación. Se recomienda verificación registral independiente y asesoramiento legal especializado. IKESA no se responsabiliza de la resolución judicial de la cesión.",
    restrictions: [
      { icon: <Eye className="w-3.5 h-3.5" />, label: "No se puede visitar el inmueble" },
      { icon: <Landmark className="w-3.5 h-3.5" />, label: "No es hipotecable" },
      { icon: <Scale className="w-3.5 h-3.5" />, label: "Requiere aprobación judicial" },
      { icon: <Home className="w-3.5 h-3.5" />, label: "Posesión no garantizada de inmediato" },
    ],
  },
  ocupados: {
    title: "Producto de inversión: Inmueble Ocupado",
    text: "Este inmueble se transmite SIN posesión efectiva. El adquirente deberá gestionar la recuperación posesoria por vía amistosa o judicial, asumiendo los plazos y costes asociados. El estado de conservación interior es desconocido. Los valores de mercado se refieren al inmueble libre de ocupantes. Se recomienda asesoramiento legal antes de la adquisición.",
    restrictions: [
      { icon: <Eye className="w-3.5 h-3.5" />, label: "No se puede visitar el inmueble" },
      { icon: <Landmark className="w-3.5 h-3.5" />, label: "No es hipotecable" },
      { icon: <Home className="w-3.5 h-3.5" />, label: "Se transmite sin posesión" },
      { icon: <Ban className="w-3.5 h-3.5" />, label: "Estado interior desconocido" },
    ],
  },
  compraventa: {
    title: "Información importante",
    text: "La información contenida en esta ficha tiene carácter meramente informativo y no constituye oferta vinculante. Las rentabilidades indicadas son estimaciones y no garantizan rendimientos futuros. Se recomienda realizar una due diligence independiente y visitar el inmueble antes de tomar cualquier decisión de inversión.",
    restrictions: [],
  },
  general: {
    title: "Información importante",
    text: "La información contenida en esta plataforma tiene carácter meramente informativo y no constituye asesoramiento financiero, jurídico ni fiscal. Las rentabilidades pasadas no garantizan rendimientos futuros. Toda inversión inmobiliaria conlleva riesgos, incluida la pérdida parcial o total del capital invertido. Se recomienda siempre realizar una due diligence independiente.",
    restrictions: [],
  },
};

const Disclaimer = ({ type }: DisclaimerProps) => {
  const d = disclaimers[type] || disclaimers.general;

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 mt-8">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="space-y-3 flex-1">
          <p className="text-xs font-bold text-destructive uppercase tracking-wide">{d.title}</p>

          {d.restrictions.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {d.restrictions.map((r, i) => (
                <div key={i} className="flex items-center gap-2 bg-destructive/5 rounded-lg px-3 py-2">
                  <span className="text-destructive">{r.icon}</span>
                  <span className="text-[11px] font-semibold text-foreground">{r.label}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground leading-relaxed">{d.text}</p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
