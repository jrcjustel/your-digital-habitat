import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import {
  GraduationCap,
  CreditCard,
  Gavel,
  Home,
  Building2,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const WIZARD_DONE_KEY = "ikesa_welcome_wizard_done";

const levels = [
  { value: "principiante", label: "Principiante", desc: "Nunca he invertido en inmobiliario distressed" },
  { value: "intermedio", label: "Intermedio", desc: "He hecho 1-3 operaciones" },
  { value: "avanzado", label: "Avanzado", desc: "Invierto regularmente en activos distressed" },
  { value: "profesional", label: "Profesional", desc: "Gestiono una cartera o fondo" },
];

const assetTypes = [
  { value: "npl", label: "NPL (Deuda)", icon: CreditCard },
  { value: "cesion_remate", label: "Cesiones de Remate", icon: Gavel },
  { value: "ocupados", label: "Inmuebles Ocupados", icon: Home },
  { value: "reo_libre", label: "REO Libre", icon: Building2 },
];

const budgets = [
  { min: 0, max: 50000, label: "< 50.000 €" },
  { min: 50000, max: 150000, label: "50.000 – 150.000 €" },
  { min: 150000, max: 500000, label: "150.000 – 500.000 €" },
  { min: 500000, max: 10000000, label: "> 500.000 €" },
] as const;

const routeMap: Record<string, { path: string; label: string }> = {
  npl: { path: "/academia/ruta/deuda-npl", label: "Ruta NPL" },
  cesion_remate: { path: "/academia/ruta/cesiones-remate", label: "Ruta Cesiones de Remate" },
  ocupados: { path: "/academia/ruta/ocupados", label: "Ruta Ocupados" },
  reo_libre: { path: "/academia/ruta/subastas-boe", label: "Ruta Subastas BOE" },
};

const WelcomeWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState<(typeof budgets)[number] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const done = localStorage.getItem(WIZARD_DONE_KEY);
    if (!done) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const toggleType = (v: string) =>
    setSelectedTypes((prev) =>
      prev.includes(v) ? prev.filter((t) => t !== v) : [...prev, v]
    );

  const handleFinish = async () => {
    setSaving(true);
    try {
      await supabase.from("profiles").update({
        investor_level: level as any,
        tipos_activo_preferidos: selectedTypes,
        presupuesto_min: budget?.min ?? 0,
        presupuesto_max: budget?.max ?? 0,
        search_preferences: { wizard_completed: true } as any,
      }).eq("user_id", user!.id);

      localStorage.setItem(WIZARD_DONE_KEY, "true");
      toast.success("¡Perfil configurado!");
      setOpen(false);
    } catch {
      toast.error("Error al guardar preferencias");
    }
    setSaving(false);
  };

  const recommendedRoute = selectedTypes[0] ? routeMap[selectedTypes[0]] : null;

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-accent" />
            {step === 0 && "¿Cuál es tu experiencia inversora?"}
            {step === 1 && "¿Qué tipos de activo te interesan?"}
            {step === 2 && "¿Cuál es tu presupuesto orientativo?"}
            {step === 3 && "Tu ruta recomendada"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 mb-4">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-accent" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-2">
            {levels.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  level === l.value
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{l.label}</p>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-2">
            {assetTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => toggleType(t.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  selectedTypes.includes(t.value)
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <t.icon className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            {budgets.map((b) => (
              <button
                key={b.label}
                onClick={() => setBudget(b)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  budget?.label === b.label
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{b.label}</p>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <p className="text-sm font-semibold text-foreground">Perfil configurado</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-background rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Nivel</p>
                  <p className="text-xs font-bold text-foreground capitalize">{level}</p>
                </div>
                <div className="bg-background rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Tipos</p>
                  <p className="text-xs font-bold text-foreground">{selectedTypes.length}</p>
                </div>
                <div className="bg-background rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Budget</p>
                  <p className="text-xs font-bold text-foreground">{budget?.label ?? "—"}</p>
                </div>
              </div>
            </div>
            {recommendedRoute && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  handleFinish();
                  navigate(recommendedRoute.path);
                }}
              >
                <GraduationCap className="w-4 h-4" />
                Empezar con {recommendedRoute.label}
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}

        <div className="flex justify-between mt-4">
          {step > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              Atrás
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => { localStorage.setItem(WIZARD_DONE_KEY, "true"); setOpen(false); }}>
              Omitir
            </Button>
          )}
          {step < 3 ? (
            <Button
              size="sm"
              className="gap-1"
              disabled={
                (step === 0 && !level) ||
                (step === 1 && selectedTypes.length === 0) ||
                (step === 2 && !budget)
              }
              onClick={() => setStep(step + 1)}
            >
              Siguiente <ArrowRight className="w-3 h-3" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleFinish} disabled={saving}>
              {saving ? "Guardando..." : "Finalizar"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeWizard;
