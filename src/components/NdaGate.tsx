import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, LogIn, FileSignature, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import type { User } from "@supabase/supabase-js";

interface NdaGateProps {
  user: User | null;
  ndaSigned: boolean;
  onNdaSigned: () => void;
  children: React.ReactNode;
}

const NdaGate = ({ user, ndaSigned, onNdaSigned, children }: NdaGateProps) => {
  const [accepted, setAccepted] = useState(false);
  const [signing, setSigning] = useState(false);

  if (!user) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <Lock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">
          Contenido restringido
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          La documentación detallada, información judicial y datos de deuda solo está disponible
          para usuarios registrados que hayan aceptado las Condiciones Generales.
        </p>
        <Link to="/auth">
          <Button className="gap-2">
            <LogIn className="w-4 h-4" />
            Regístrate o inicia sesión
          </Button>
        </Link>
      </div>
    );
  }

  if (!ndaSigned) {
    const handleSignNda = async () => {
      setSigning(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ nda_signed: true, nda_signed_at: new Date().toISOString() } as any)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Condiciones aceptadas. Ya puedes acceder a la documentación completa.");
        onNdaSigned();
      } catch (err) {
        console.error(err);
        toast.error("Error al firmar. Inténtalo de nuevo.");
      } finally {
        setSigning(false);
      }
    };

    return (
      <div className="bg-card rounded-2xl border border-border p-8">
        <div className="flex items-center gap-3 mb-4">
          <FileSignature className="w-8 h-8 text-accent" />
          <h3 className="font-heading text-xl font-bold text-foreground">
            Condiciones Generales y Confidencialidad
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Para acceder a la información detallada de las oportunidades de inversión
          (documentación, datos judiciales, información de deuda y análisis financiero),
          es necesario aceptar nuestras Condiciones Generales.
        </p>

        <div className="bg-secondary rounded-xl p-5 mb-6 max-h-80 overflow-y-auto text-sm text-muted-foreground leading-relaxed space-y-4">
          <p className="font-semibold text-foreground text-base">CONDICIONES GENERALES DE IKESA</p>
          <p>
            El presente Acuerdo Marco refleja los términos y condiciones que son de aplicación
            para los usuarios (en adelante, "Usuario") en la plataforma IKESA, titularidad de
            IKESA INVESTMENT S.L.
          </p>

          <p className="font-semibold text-foreground">1. Información general</p>

          <p className="font-semibold text-foreground">a. Modalidades de transacción</p>
          <p>
            IKESA contempla cuatro modalidades de transacción en la plataforma:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Compraventa de crédito:</strong> el Usuario está adquiriendo el derecho de crédito
              que ostenta una entidad (prestamista) frente a un tercero (prestatario-deudor), y subrogándose
              en su posición acreedora. El adquirente de un crédito impagado puede encontrarse con varios
              escenarios: que el prestatario pague la deuda, que se subaste el inmueble en garantía, o que
              el Usuario se adjudique el inmueble en la subasta.
            </li>
            <li>
              <strong>Acuerdo de postura en subasta:</strong> en el marco de un procedimiento de ejecución
              hipotecario, la entidad ejecutante alcanza un acuerdo con el Usuario en virtud del cual éste
              se obliga a realizar una puja mínima en la subasta. En ningún caso ello garantiza la
              adjudicación del inmueble, pues la subasta pública es un proceso abierto y concurrente.
            </li>
            <li>
              <strong>Cesión de remate:</strong> en caso de que la subasta haya quedado desierta o resulte
              el ejecutante el mejor postor, éste tendrá derecho a ceder el remate (derecho de adjudicación)
              a un tercero (el Usuario). Este acto se lleva a cabo ante el Juez. La cesión no supone la
              traslación de la posesión del inmueble.
            </li>
            <li>
              <strong>Compraventa de inmueble:</strong> IKESA publica inmuebles con o sin posesión. En los
              casos en que la parte vendedora tenga posesión, se hará la entrega de llaves. En inmuebles
              sin posesión, el Usuario deberá llevar a cabo los trámites pertinentes para obtenerla.
            </li>
          </ul>

          <p className="font-semibold text-foreground">b. Ofertas y depósito</p>
          <p>
            El Usuario puede hacer su oferta sin necesidad de realizar depósito previamente. Una vez
            la oferta ha sido aprobada, deberá firmar un documento de oferta así como realizar el pago
            del depósito para el buen fin de la operación. El importe del depósito está indicado en
            cada oportunidad.
          </p>

          <p className="font-semibold text-foreground">c. Comisión</p>
          <p>
            El Usuario solo deberá pagar comisión a IKESA cuando así se concrete expresamente en la
            oportunidad. La comisión será porcentual sobre el precio finalmente aprobado para la firma
            de la operación.
          </p>

          <p className="font-semibold text-foreground">d. Documentación</p>
          <p>
            IKESA facilitará al Usuario toda la documentación e información de la que disponga.
            Las estimaciones se realizan según su leal saber y entender, no teniendo carácter de
            asesoramiento vinculante. El Usuario debe cotejar las oportunidades con sus asesores.
          </p>

          <p className="font-semibold text-foreground">2. Confidencialidad</p>
          <p>
            IKESA tiene encomendada la comercialización de posiciones crediticias e inmobiliarias
            por los titulares de los derechos. Para su exposición detallada, el Usuario asume una
            obligación de confidencialidad:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Información Confidencial:</strong> toda documentación e información, verbal o escrita,
              en cualquier soporte, que se suministre al Usuario para estudiar, evaluar, negociar y
              concluir operaciones publicadas en IKESA.
            </li>
            <li>
              <strong>Obligaciones:</strong> guardar secreto sobre la documentación, utilizar la información
              únicamente para evaluar las oportunidades, no contactar directa o indirectamente con terceros
              relacionados con los préstamos o activos objeto de comercialización.
            </li>
            <li>
              <strong>Revelación:</strong> el Usuario solo puede revelar información a sus asesores
              profesionales, agentes y empleados que necesiten conocerla, limitando al mínimo el número
              de personas con acceso.
            </li>
          </ul>

          <p className="font-semibold text-foreground">3. Tratamiento de datos</p>
          <p>
            El Usuario consiente el tratamiento de sus datos personales por parte de IKESA, en
            cumplimiento de la normativa vigente en materia de protección de datos. Los datos serán
            utilizados para gestionar el acceso a los servicios y mantener al Usuario informado.
            El Usuario tiene derecho a acceder, rectificar y suprimir sus datos dirigiéndose a
            info@ikesa.es.
          </p>

          <p className="font-semibold text-foreground">4. Duración</p>
          <p>
            Las obligaciones de confidencialidad permanecerán vigentes durante un período de 2 años
            desde la aceptación del presente Acuerdo.
          </p>

          <p className="font-semibold text-foreground">5. Jurisdicción</p>
          <p>
            Para cualquier controversia derivada del presente Acuerdo, las partes se someten a los
            Juzgados y Tribunales de Cádiz.
          </p>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <Checkbox
            id="nda-accept"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <label htmlFor="nda-accept" className="text-sm text-foreground cursor-pointer leading-tight">
            He leído y acepto las Condiciones Generales de IKESA, incluyendo las obligaciones de
            confidencialidad. Entiendo que la información proporcionada es confidencial y me
            comprometo a no divulgarla a terceros.
          </label>
        </div>

        <Button onClick={handleSignNda} disabled={!accepted || signing} className="gap-2">
          {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {signing ? "Firmando..." : "Aceptar condiciones y acceder"}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default NdaGate;
