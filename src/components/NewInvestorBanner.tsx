import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const DISMISSED_KEY = "ikesa_new_investor_banner_dismissed";

const NewInvestorBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    setDismissed(!!wasDismissed || !!user);
  }, [user]);

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  return (
    <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-xl p-4 mb-6 flex items-center gap-4 relative">
      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
        <GraduationCap className="w-5 h-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          ¿Primera vez invirtiendo en activos distressed?
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Aprende los fundamentos antes de invertir. Nuestra Academia te guía paso a paso.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 gap-1 text-xs"
        onClick={() => navigate("/academia")}
      >
        Ir a la Academia <ArrowRight className="w-3 h-3" />
      </Button>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default NewInvestorBanner;
