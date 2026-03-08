import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const AvisoLegalNpl = () => {
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get("tipo") || "npl";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link to="/inmuebles" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-8">
          <ChevronLeft className="w-4 h-4" /> Volver al listado
        </Link>

        <div className="bg-card rounded-2xl border border-border p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            AVISO LEGAL – Productos de inversión inmobiliaria
          </h1>
          <p className="text-sm text-muted-foreground mb-10">Última actualización: 10 de marzo de 2025</p>

          {/* SECCIÓN COMÚN */}
          <div className="space-y-5 mb-10">
            <p className="text-sm text-muted-foreground leading-relaxed">
              1. Esta página web es propiedad de IKESA INMOBILIARIA S.L. (en adelante, «IKESA»), con domicilio social en [Dirección], provista de CIF B-XXXXXXXX e inscrita en el Registro Mercantil de [Provincia]. Contacto: info@ikesa.es.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              2. La información que se facilita en esta página web en modo alguno constituye una oferta y, por tanto, no hace surgir obligación de venta alguna, ni ninguna otra obligación, que sea exigible a IKESA o a los propietarios de los activos por parte del usuario de la web o de la persona a la que represente (los «Usuarios» e, individualmente, el «Usuario»). La decisión final de la venta, y de los términos y condiciones de la misma, será siempre de los Propietarios que la adoptarán de manera discrecional.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              3. La información que aparece publicada en esta página web (i) es selectiva y está sujeta a posibles actualizaciones, correcciones, ampliaciones, revisiones y modificaciones; (ii) le será de aplicación la legislación vigente en cada momento; y (iii) no pretende incluir toda la información que los Usuarios puedan precisar a los efectos de tomar una decisión de inversión. En consecuencia, IKESA (y los Propietarios) no garantizan a los Usuarios ningún acceso a información adicional, o a corregir o actualizar la publicada en esta web en caso de que la misma sea incorrecta o inexacta.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              4. Ni IKESA, los Propietarios, ni ninguna de sus filiales, administradores, socios, accionistas, empleados o agentes realizan declaración o manifestación, ni otorgan garantía alguna en relación con la exactitud, razonabilidad o integridad de la información publicada en esta página web, ni sobre la idoneidad o rentabilidad de la compra de un activo en particular.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              5. Los precios y datos sobre el importe de la deuda o el valor de los inmuebles, si los hubiera, publicados en esta página web son orientativos y están sujetos a variación.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              6. El acceso y consulta o análisis de información por parte de cualesquiera intermediarios del mercado inmobiliario y/o financiero no crea ninguna obligación para IKESA (o los Propietarios) a favor de aquéllos. IKESA (o los Propietarios) no abonarán cantidad alguna, como comisión o por cualquier otro concepto, a dichos intermediarios como consecuencia de su participación en el proceso de compra.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed font-semibold text-foreground">
              7. IMPORTANTE. Se recomienda encarecidamente que los Usuarios, y muy particularmente si son consumidores y usuarios (no inversores profesionales), (i) lean detenidamente este Aviso Legal; (ii) contacten con IKESA; y (iii) lleven a cabo su propia investigación y análisis, contratando asesoramiento legal, financiero y fiscal de profesionales cualificados.
            </p>
          </div>

          {/* SECCIÓN NPL */}
          <div id="npl" className={`mb-10 p-6 rounded-xl border ${tipo === "npl" ? "border-accent bg-accent/5" : "border-border bg-secondary/30"}`}>
            <h2 className="text-lg font-bold text-foreground mb-4">A. Compra de deuda hipotecaria (NPL)</h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                A.1. Los inmuebles publicados bajo esta categoría son la garantía hipotecaria de préstamos o créditos en situación de impago (los «Préstamos» o los «NPLs») que son gestionados por IKESA y son de titularidad de terceros (los «Propietarios»).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A.2. Lo que se publicita para una eventual venta NO son directamente los Inmuebles, sino los Préstamos o NPLs que están garantizados con los Inmuebles. Por tanto, la compra de un Préstamo/NPL NO supone la compra del inmueble que lo garantiza, ni asegura que dicho inmueble se vaya a adquirir por el comprador del NPL al finalizar el procedimiento judicial correspondiente. El inmueble puede acabar adjudicado a un tercero, o incluso es posible que el deudor cancele (pague) la deuda antes de la adjudicación y, por tanto, mantenga la propiedad del inmueble.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A.3. No es posible visitar el inmueble que sirve como garantía del crédito. El inmueble no es hipotecable. No se adquiere la propiedad directamente, sino la posición acreedora del préstamo.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A.4. La recuperación del activo inmobiliario subyacente requerirá, en la mayoría de los casos, un procedimiento judicial de ejecución hipotecaria cuyos plazos son variables y pueden extenderse significativamente. El comprador asume los riesgos inherentes a la gestión del crédito, incluyendo la posibilidad de no recuperar la totalidad de la inversión.
              </p>
            </div>
          </div>

          {/* SECCIÓN CESIÓN DE REMATE */}
          <div id="cesion-remate" className={`mb-10 p-6 rounded-xl border ${tipo === "cesion-remate" ? "border-accent bg-accent/5" : "border-border bg-secondary/30"}`}>
            <h2 className="text-lg font-bold text-foreground mb-4">B. Cesión de Remate</h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                B.1. Los inmuebles publicados bajo esta categoría han sido adjudicados en subasta judicial y se comercializan mediante cesión de los derechos de remate por parte del adjudicatario original. La cesión de remate implica que el adjudicatario cede al comprador su derecho a adquirir el inmueble en las condiciones fijadas por el decreto de adjudicación.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                B.2. La operación está sujeta a la aprobación del juzgado competente, que podrá denegarla sin necesidad de motivación. IKESA no garantiza que la cesión sea aprobada. La decisión final corresponde al juzgado y, en su caso, al ejecutante.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                B.3. El inmueble puede encontrarse ocupado, lo que requeriría un proceso judicial adicional (lanzamiento) para obtener la posesión efectiva. Los plazos de dicho procedimiento son variables e inciertos.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                B.4. El inmueble no será hipotecable hasta que se complete la inscripción registral a favor del cesionario, lo que puede requerir un plazo significativo tras la aprobación judicial de la cesión.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                B.5. Los precios indicados están sujetos a las condiciones del decreto de adjudicación. Pueden existir cargas registrales anteriores a la hipoteca ejecutada que no se cancelan con la adjudicación.
              </p>
            </div>
          </div>

          {/* SECCIÓN OCUPADOS */}
          <div id="ocupado" className={`mb-10 p-6 rounded-xl border ${tipo === "ocupado" ? "border-accent bg-accent/5" : "border-border bg-secondary/30"}`}>
            <h2 className="text-lg font-bold text-foreground mb-4">C. Inmuebles Ocupados</h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                C.1. Los inmuebles publicados bajo esta categoría se encuentran actualmente ocupados por terceros sin título jurídico válido o con título extinguido.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                C.2. La adquisición del inmueble transfiere la propiedad pero NO la posesión efectiva. El comprador deberá llevar a cabo los trámites legales pertinentes para recuperar la posesión, incluyendo posibles procedimientos judiciales de desahucio (por precario, efectividad de derechos reales inscritos u otro procedimiento aplicable).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                C.3. No es posible visitar el interior del inmueble, por lo que su estado de conservación, distribución real y posibles vicios ocultos son desconocidos. Los valores de mercado indicados se refieren al inmueble libre de ocupantes y en estado medio de conservación.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                C.4. El inmueble no será hipotecable mientras se encuentre ocupado y hasta que el nuevo propietario obtenga la posesión efectiva y la inscripción registral limpia.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                C.5. Los plazos judiciales para la recuperación de la posesión son variables y pueden extenderse significativamente dependiendo de la jurisdicción, la situación de los ocupantes y las circunstancias procesales.
              </p>
            </div>
          </div>

          {/* CIERRE */}
          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              IKESA actúa como intermediario y no garantiza el resultado de las operaciones. El presente Aviso Legal es aplicable a todos los activos publicados en la plataforma según su categoría correspondiente. Para cualquier consulta, contacte con info@ikesa.es.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AvisoLegalNpl;
