import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const legalDocs: Record<string, { title: string; content: string[] }> = {
  npl: {
    title: "AVISO LEGAL – Compra de deuda hipotecaria (NPL)",
    content: [
      "1. Esta página web es propiedad de IKESA INMOBILIARIA S.L. (en adelante, «IKESA»), con domicilio social en [Dirección], provista de CIF B-XXXXXXXX e inscrita en el Registro Mercantil de [Provincia].",
      "2. Los inmuebles publicados en esta página web (los «Inmuebles») son la garantía hipotecaria de préstamos o créditos en situación de impago (los «Préstamos» o los «NPLs») que son gestionados por IKESA y son de titularidad de terceros (los «Propietarios»).",
      "3. Lo que se publicita en esta web para una eventual venta NO son directamente los Inmuebles, sino los Préstamos o NPLs que están garantizados con los Inmuebles. Por tanto, la compra de un Préstamo/NPL NO supone la compra del inmueble que lo garantiza, ni asegura que dicho inmueble se vaya a adquirir por el comprador del NPL al finalizar el procedimiento judicial correspondiente. El inmueble puede acabar adjudicado a un tercero, o incluso es posible que el deudor cancele (pague) la deuda antes de la adjudicación a un tercero o al ejecutante (acreedor) y, por tanto, mantenga la propiedad del inmueble.",
      "4. La información que se facilita en esta página web en modo alguno constituye una oferta y, por tanto, no hace surgir obligación de venta alguna del NPL, ni ninguna otra obligación, que sea exigible a IKESA o a los Propietarios por parte del usuario de la web o de la persona a la que represente (los «Usuarios» e, individualmente, el «Usuario»). La decisión final de la venta del Préstamo, y de los términos y condiciones de la venta, será siempre de los Propietarios que la adoptarán de manera discrecional.",
      "5. La información que aparece publicada en esta página web con respecto a los Inmuebles y/o Préstamos/NPLs (i) es selectiva y está sujeta a posibles actualizaciones, correcciones, ampliaciones, revisiones y modificaciones; (ii) le será de aplicación la legislación vigente en cada momento; y (iii) no pretende incluir toda la información que los Usuarios puedan precisar a los efectos de tomar una decisión sobre la potencial compra de los Préstamos/NPLs. En consecuencia, IKESA (y los Propietarios) no garantizan a los Usuarios ningún acceso a información adicional, o a corregir o actualizar la publicada en esta web en caso de que la misma sea incorrecta o inexacta, no asumiendo IKESA (o los Propietarios) ninguna responsabilidad a dicho respecto frente a los Usuarios.",
      "6. IMPORTANTE. En caso de que los Usuarios estén interesados en la compra de Préstamos/NPLs y, muy particularmente, si son consumidores y usuarios (no inversores profesionales) que no se dedican profesional o habitualmente a la compra de este tipo de productos, deberán (i) leer detenidamente este Aviso Legal; (ii) contactar con IKESA; y (iii) llevar a cabo su propia investigación y análisis sobre los Préstamos y los Inmuebles y sobre la información publicada en esta página web; recomendando para ello que contraten y, por tanto, reciban asesoramiento legal, financiero y fiscal de profesionales cualificados, y formulen cuantas preguntas consideren oportunas y soliciten cuanta información estimen pertinente al gestor que le sea asignado; debiendo, en todo caso, pasar un test de idoneidad llegado el momento.",
      "7. Ni IKESA, los Propietarios, ni ninguna de sus filiales, administradores, socios, accionistas, empleados o agentes realizan declaración o manifestación, ni otorgan garantía alguna en relación con la exactitud, razonabilidad o integridad de la información publicada en esta página web, ni sobre la idoneidad o rentabilidad de la compra de un Préstamo en particular.",
      "8. Los precios y datos sobre el importe de la deuda bajo los Préstamos o el valor de los Inmuebles, si los hubiera, publicados en esta página web son orientativos y están sujetos a variación.",
      "9. El acceso y consulta o análisis de información por parte de cualesquiera intermediarios del mercado inmobiliario y/o financiero no crea ninguna obligación para IKESA (o los Propietarios) a favor de aquéllos, incluso si, en el caso de formalización de una operación en relación con cualquier Préstamo, dichos intermediarios hubieran participado o intervenido de cualquier modo. IKESA (o los Propietarios) no abonarán cantidad alguna, como comisión o por cualquier otro concepto, a dichos intermediarios como consecuencia de su participación en el proceso de compra.",
    ],
  },
  "cesion-remate": {
    title: "AVISO LEGAL – Cesión de Remate",
    content: [
      "1. Esta página web es propiedad de IKESA INMOBILIARIA S.L. (en adelante, «IKESA»), con domicilio social en [Dirección], provista de CIF B-XXXXXXXX e inscrita en el Registro Mercantil de [Provincia].",
      "2. Los inmuebles publicados en esta sección (los «Inmuebles») han sido adjudicados en subasta judicial y se comercializan mediante cesión de los derechos de remate por parte del adjudicatario original.",
      "3. La cesión de remate implica que el adjudicatario cede al comprador su derecho a adquirir el inmueble en las condiciones fijadas por el decreto de adjudicación. La operación está sujeta a la aprobación del juzgado competente, que podrá denegarla sin necesidad de motivación.",
      "4. La información que se facilita en esta página web en modo alguno constituye una oferta vinculante. La decisión final sobre la aprobación de la cesión corresponde al juzgado y, en su caso, al ejecutante. IKESA no garantiza que la cesión sea aprobada.",
      "5. El inmueble puede encontrarse ocupado, lo que requeriría un proceso judicial adicional (lanzamiento) para obtener la posesión efectiva. Los plazos de dicho procedimiento son variables e inciertos.",
      "6. El inmueble no será hipotecable hasta que se complete la inscripción registral a favor del cesionario, lo que puede requerir un plazo significativo tras la aprobación judicial de la cesión.",
      "7. Los precios indicados son orientativos y están sujetos a las condiciones del decreto de adjudicación. Pueden existir cargas registrales anteriores a la hipoteca ejecutada que no se cancelan con la adjudicación.",
      "8. Se recomienda encarecidamente que los Usuarios contraten asesoramiento jurídico, financiero y fiscal independiente antes de tomar cualquier decisión de inversión. IKESA actúa como intermediario y no garantiza el resultado de las operaciones.",
      "9. El acceso y consulta de información por parte de intermediarios del mercado inmobiliario y/o financiero no crea obligación alguna para IKESA ni generará derecho a comisión o compensación de ningún tipo.",
    ],
  },
  ocupado: {
    title: "AVISO LEGAL – Inmueble Ocupado",
    content: [
      "1. Esta página web es propiedad de IKESA INMOBILIARIA S.L. (en adelante, «IKESA»), con domicilio social en [Dirección], provista de CIF B-XXXXXXXX e inscrita en el Registro Mercantil de [Provincia].",
      "2. Los inmuebles publicados en esta sección se encuentran actualmente ocupados por terceros sin título jurídico válido o con título extinguido.",
      "3. La adquisición del inmueble transfiere la propiedad pero NO la posesión efectiva. El comprador deberá llevar a cabo los trámites legales pertinentes para recuperar la posesión, incluyendo posibles procedimientos judiciales de desahucio (por precario, efectividad de derechos reales inscritos u otro procedimiento aplicable).",
      "4. La información que se facilita en esta página web en modo alguno constituye una oferta vinculante. Los importes mostrados son orientativos y no hacen surgir obligación de venta alguna que sea exigible a IKESA o a los propietarios.",
      "5. No es posible visitar el interior del inmueble, por lo que su estado de conservación, distribución real y posibles vicios ocultos son desconocidos. Los valores de mercado indicados se refieren al inmueble libre de ocupantes y en estado medio de conservación.",
      "6. El inmueble no será hipotecable mientras se encuentre ocupado y hasta que el nuevo propietario obtenga la posesión efectiva y la inscripción registral limpia.",
      "7. Los plazos judiciales para la recuperación de la posesión son variables y pueden extenderse significativamente dependiendo de la jurisdicción, la situación de los ocupantes y las circunstancias procesales.",
      "8. Se recomienda encarecidamente que los Usuarios contraten asesoramiento jurídico, financiero y fiscal independiente antes de tomar cualquier decisión de inversión. IKESA actúa como intermediario y no garantiza el resultado de las operaciones ni los plazos de recuperación posesoria.",
      "9. El acceso y consulta de información por parte de intermediarios del mercado inmobiliario y/o financiero no crea obligación alguna para IKESA ni generará derecho a comisión o compensación de ningún tipo.",
    ],
  },
};

const AvisoLegalNpl = () => {
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get("tipo") || "npl";
  const doc = legalDocs[tipo] || legalDocs.npl;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/inmuebles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-8">
          <ChevronLeft className="w-4 h-4" /> Volver al listado
        </Link>

        <div className="bg-card rounded-2xl border border-border p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{doc.title}</h1>
          <p className="text-sm text-muted-foreground mb-8">Última actualización: 10 de marzo de 2025</p>

          <div className="space-y-6">
            {doc.content.map((paragraph, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AvisoLegalNpl;
