import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, LogIn, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import NdaSigningFlow from "@/components/NdaSigningFlow";

interface NdaGateProps {
  user: User | null;
  ndaSigned: boolean;
  onNdaSigned: () => void;
  children: React.ReactNode;
}

const NdaGate = ({ user, ndaSigned, onNdaSigned, children }: NdaGateProps) => {
  if (!user) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <Lock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">
          Contenido restringido
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          La documentación detallada, información judicial y datos de deuda solo está disponible
          para usuarios registrados que hayan firmado el Acuerdo de Confidencialidad (NDA).
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
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileSignature className="w-8 h-8 text-accent" />
          <div>
            <h3 className="font-heading text-xl font-bold text-foreground">
              Firma del Acuerdo de Confidencialidad
            </h3>
            <p className="text-sm text-muted-foreground">
              Para acceder a la información detallada es necesario firmar el NDA y subir tu documento de identidad.
            </p>
          </div>
        </div>
        <NdaSigningFlow user={user} onComplete={onNdaSigned} />
      </div>
    );
  }

  return <>{children}</>;
};

export default NdaGate;
