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
          La documentación detallada, información judicial y datos de deuda de productos NPL y Cesión de Remate
          solo está disponible para usuarios registrados con NDA firmado.
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
        toast.success("NDA firmado correctamente. Ya puedes acceder a la documentación.");
        onNdaSigned();
      } catch (err) {
        console.error(err);
        toast.error("Error al firmar el NDA. Inténtalo de nuevo.");
      } finally {
        setSigning(false);
      }
    };

    return (
      <div className="bg-card rounded-2xl border border-border p-8">
        <div className="flex items-center gap-3 mb-4">
          <FileSignature className="w-8 h-8 text-accent" />
          <h3 className="font-heading text-xl font-bold text-foreground">
            Acuerdo de Confidencialidad (NDA)
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Para acceder a la información detallada de productos NPL y Cesión de Remate
          (documentación, datos judiciales, información de deuda y análisis financiero),
          es necesario aceptar nuestro Acuerdo de Confidencialidad.
        </p>

        <div className="bg-secondary rounded-xl p-5 mb-6 max-h-60 overflow-y-auto text-sm text-muted-foreground leading-relaxed space-y-3">
          <p className="font-semibold text-foreground">ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACIÓN</p>
          <p>
            El presente Acuerdo de Confidencialidad (en adelante, el "Acuerdo") se celebra entre
            IKESA INVESTMENT S.L. (en adelante, "IKESA") y el usuario registrado en la plataforma
            (en adelante, el "Receptor").
          </p>
          <p><strong>1. OBJETO.</strong> El Receptor se compromete a mantener la más estricta confidencialidad
            sobre toda la información proporcionada por IKESA relativa a los activos inmobiliarios,
            incluyendo pero no limitándose a: datos financieros, información judicial, documentación
            de deuda, valoraciones, informes periciales y cualquier otro dato de carácter reservado.</p>
          <p><strong>2. OBLIGACIONES.</strong> El Receptor se compromete a: (a) No divulgar la información
            confidencial a terceros sin autorización previa y por escrito de IKESA; (b) Utilizar la
            información exclusivamente para evaluar las oportunidades de inversión presentadas;
            (c) No reproducir, copiar o distribuir la documentación recibida.</p>
          <p><strong>3. DURACIÓN.</strong> Las obligaciones de confidencialidad permanecerán vigentes durante
            un período de 2 años desde la firma del presente Acuerdo.</p>
          <p><strong>4. INCUMPLIMIENTO.</strong> El incumplimiento de las obligaciones de confidencialidad
            dará derecho a IKESA a reclamar los daños y perjuicios que se deriven, así como a
            revocar el acceso a la plataforma.</p>
          <p><strong>5. JURISDICCIÓN.</strong> Para cualquier controversia derivada del presente Acuerdo,
            las partes se someten a los Juzgados y Tribunales de Cádiz.</p>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <Checkbox
            id="nda-accept"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
          />
          <label htmlFor="nda-accept" className="text-sm text-foreground cursor-pointer leading-tight">
            He leído y acepto el Acuerdo de Confidencialidad (NDA). Entiendo que la información
            proporcionada es confidencial y me comprometo a no divulgarla a terceros.
          </label>
        </div>

        <Button onClick={handleSignNda} disabled={!accepted || signing} className="gap-2">
          {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {signing ? "Firmando..." : "Firmar NDA y acceder"}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default NdaGate;
