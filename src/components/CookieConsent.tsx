import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "ikesa_cookie_consent";

type ConsentLevel = "all" | "necessary" | null;

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for UX
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = (level: ConsentLevel) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, level || "necessary");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-xl p-6">
        <div className="flex items-start gap-4">
          <Cookie className="w-8 h-8 text-accent shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-heading font-bold text-foreground mb-2">
              Este sitio utiliza cookies
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Utilizamos cookies propias y de terceros para analizar el uso del sitio web, mejorar nuestros servicios y mostrar publicidad personalizada.
              Puedes aceptar todas las cookies, solo las necesarias, o configurar tus preferencias. Más información en nuestra{" "}
              <Link to="/cookies" className="text-accent underline hover:text-accent/80">
                Política de Cookies
              </Link>{" "}
              y{" "}
              <Link to="/privacidad" className="text-accent underline hover:text-accent/80">
                Política de Privacidad
              </Link>.
            </p>

            {showDetails && (
              <div className="bg-secondary rounded-xl p-4 mb-4 text-xs text-muted-foreground space-y-3">
                <div>
                  <p className="font-semibold text-foreground mb-1">Cookies necesarias (siempre activas)</p>
                  <p>Esenciales para el funcionamiento del sitio: sesión de usuario, preferencias de idioma, seguridad. Base legal: interés legítimo (art. 6.1.f RGPD).</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Cookies analíticas</p>
                  <p>Nos ayudan a entender cómo interactúas con la web para mejorar la experiencia. Base legal: consentimiento (art. 6.1.a RGPD).</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Cookies de marketing</p>
                  <p>Permiten mostrar contenido y publicidad relevante. Base legal: consentimiento (art. 6.1.a RGPD).</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button onClick={() => accept("all")} size="sm">
                Aceptar todas
              </Button>
              <Button onClick={() => accept("necessary")} variant="outline" size="sm">
                Solo necesarias
              </Button>
              <Button onClick={() => setShowDetails(!showDetails)} variant="ghost" size="sm">
                {showDetails ? "Ocultar detalles" : "Configurar cookies"}
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground mt-3">
              Conforme al Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 (LOPDGDD) y la Ley 34/2002 (LSSI-CE).
              Responsable: IKESA Inmobiliaria S.L. Puede ejercer sus derechos de acceso, rectificación, supresión y portabilidad
              dirigiéndose a <span className="text-accent">protecciondedatos@ikesa.es</span>.
            </p>
          </div>
          <button onClick={() => accept("necessary")} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
