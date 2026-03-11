import { useMemo } from "react";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface JourneyStageWidgetProps {
  profileComplete: boolean;
  hasFavorites: boolean;
  hasOffers: boolean;
  ndaSigned: boolean;
  hasCompletedOperation?: boolean;
}

const stages = [
  { key: "profile", label: "Perfil completado", shortLabel: "Perfil" },
  { key: "nda", label: "NDA firmado", shortLabel: "NDA" },
  { key: "favorites", label: "Oportunidades guardadas", shortLabel: "Favoritos" },
  { key: "offers", label: "Primera oferta", shortLabel: "Oferta" },
  { key: "operation", label: "Operación cerrada", shortLabel: "Operación" },
];

const JourneyStageWidget = ({ profileComplete, hasFavorites, hasOffers, ndaSigned, hasCompletedOperation = false }: JourneyStageWidgetProps) => {
  const completedStages = useMemo(() => {
    const completed: Record<string, boolean> = {
      profile: profileComplete,
      nda: ndaSigned,
      favorites: hasFavorites,
      offers: hasOffers,
      operation: hasCompletedOperation,
    };
    return completed;
  }, [profileComplete, hasFavorites, hasOffers, ndaSigned, hasCompletedOperation]);

  const completedCount = Object.values(completedStages).filter(Boolean).length;
  const progress = Math.round((completedCount / stages.length) * 100);

  const currentStageIndex = stages.findIndex((s) => !completedStages[s.key]);
  const currentStage = currentStageIndex >= 0 ? stages[currentStageIndex] : null;

  const levelLabel = completedCount <= 1 ? "Explorador" : completedCount <= 3 ? "Inversor activo" : "Inversor experto";

  return (
    <div className="bg-card rounded-2xl border border-border p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-foreground">Tu camino inversor</p>
          <p className="text-xs text-muted-foreground">{levelLabel} — {completedCount}/{stages.length} etapas</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-accent">{progress}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Stages */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {stages.map((stage, i) => {
          const done = completedStages[stage.key];
          const isCurrent = currentStageIndex === i;
          return (
            <div key={stage.key} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${
                done ? "bg-accent/15 text-accent" : isCurrent ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                {stage.shortLabel}
              </div>
              {i < stages.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Next step suggestion */}
      {currentStage && (
        <div className="bg-accent/5 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Siguiente paso: {currentStage.label}</p>
            <p className="text-[11px] text-muted-foreground">Avanza en tu camino como inversor inmobiliario</p>
          </div>
          {currentStage.key === "profile" && (
            <Button size="sm" variant="outline" className="text-xs shrink-0">Completar perfil</Button>
          )}
          {currentStage.key === "favorites" && (
            <Button asChild size="sm" variant="outline" className="text-xs shrink-0">
              <Link to="/inmuebles">Explorar activos</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default JourneyStageWidget;
