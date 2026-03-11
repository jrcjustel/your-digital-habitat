import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, User, ClipboardList, Bell, Heart, PartyPopper, ArrowRight, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WelcomeStep {
  id: string;
  label: string;
  description: string;
  icon: typeof User;
  route: string;
  completed: boolean;
}

interface DashboardWelcomeChecklistProps {
  profileComplete: boolean;
  selfAssessmentDone: boolean;
  hasAlerts: boolean;
  hasFavorites: boolean;
}

const DashboardWelcomeChecklist = ({
  profileComplete,
  selfAssessmentDone,
  hasAlerts,
  hasFavorites,
}: DashboardWelcomeChecklistProps) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem("ikesa_welcome_checklist_dismissed") === "true";
  });
  const [showCelebration, setShowCelebration] = useState(false);

  const steps: WelcomeStep[] = useMemo(() => [
    {
      id: "profile",
      label: "Completa tu perfil",
      description: "Nombre, nivel de inversor y preferencias",
      icon: User,
      route: "/mi-cuenta",
      completed: profileComplete,
    },
    {
      id: "assessment",
      label: "Haz el test de perfil inversor",
      description: "Descubre qué tipo de activos encajan contigo",
      icon: ClipboardList,
      route: "/inversores/test-perfil",
      completed: selfAssessmentDone,
    },
    {
      id: "alert",
      label: "Crea tu primera alerta",
      description: "Te avisamos cuando haya oportunidades para ti",
      icon: Bell,
      route: "/mi-cuenta",
      completed: hasAlerts,
    },
    {
      id: "favorite",
      label: "Guarda un activo en favoritos",
      description: "Empieza a analizar oportunidades reales",
      icon: Heart,
      route: "/inmuebles",
      completed: hasFavorites,
    },
  ], [profileComplete, selfAssessmentDone, hasAlerts, hasFavorites]);

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;
  const allComplete = completedCount === steps.length;

  // Trigger celebration when all steps complete
  useEffect(() => {
    if (allComplete && !dismissed) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [allComplete, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("ikesa_welcome_checklist_dismissed", "true");
  };

  // Don't show if dismissed or all complete and previously seen
  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-8 relative"
    >
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <PartyPopper className="w-16 h-16 text-accent mx-auto mb-3" />
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mb-1">¡Enhorabuena! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-4">Has completado todos los pasos iniciales</p>
              <Button onClick={handleDismiss} size="sm">
                Continuar explorando
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Primeros pasos</h2>
              <p className="text-xs text-muted-foreground">
                {allComplete
                  ? "¡Todo listo! Ya puedes invertir con confianza."
                  : `${completedCount} de ${steps.length} completados — empieza por lo que prefieras`}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                onClick={() => !step.completed && navigate(step.route)}
                disabled={step.completed}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl text-left transition-all w-full",
                  step.completed
                    ? "bg-accent/5 cursor-default"
                    : "bg-muted/30 hover:bg-muted/60 cursor-pointer group"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  step.completed ? "bg-accent/10" : "bg-muted group-hover:bg-accent/10"
                )}>
                  {step.completed ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-accent" />
                  ) : (
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold leading-tight",
                    step.completed ? "text-accent line-through decoration-accent/30" : "text-foreground"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
                    {step.description}
                  </p>
                </div>
                {!step.completed && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardWelcomeChecklist;
