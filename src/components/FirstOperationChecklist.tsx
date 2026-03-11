import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Circle,
  GraduationCap,
  Search,
  Calculator,
  Heart,
  GitCompare,
  FileText,
  ArrowRight,
  Rocket,
} from "lucide-react";

interface ChecklistStep {
  id: string;
  label: string;
  description: string;
  icon: typeof CheckCircle;
  route: string;
  checkFn: (data: ChecklistData) => boolean;
}

interface ChecklistData {
  profileComplete: boolean;
  hasFavorites: boolean;
  hasOffers: boolean;
  ndaSigned: boolean;
}

const steps: ChecklistStep[] = [
  {
    id: "profile",
    label: "Completa tu perfil de inversor",
    description: "Configura tu nivel, presupuesto y preferencias",
    icon: FileText,
    route: "/mi-cuenta",
    checkFn: (d) => d.profileComplete,
  },
  {
    id: "academy",
    label: "Explora la Academia",
    description: "Elige una ruta formativa según tu interés",
    icon: GraduationCap,
    route: "/academia",
    checkFn: () => !!localStorage.getItem("ikesa_academy_visited"),
  },
  {
    id: "explore",
    label: "Consulta al menos 5 oportunidades",
    description: "Familiarízate con las fichas de activos",
    icon: Search,
    route: "/inmuebles",
    checkFn: () => {
      const count = parseInt(localStorage.getItem("ikesa_assets_viewed") || "0");
      return count >= 5;
    },
  },
  {
    id: "calculator",
    label: "Usa la calculadora de inversión",
    description: "Simula los costes reales de una operación",
    icon: Calculator,
    route: "/calculadoras",
    checkFn: () => !!localStorage.getItem("ikesa_calculator_used"),
  },
  {
    id: "favorite",
    label: "Guarda tu primer favorito",
    description: "Marca las oportunidades que te interesan",
    icon: Heart,
    route: "/inmuebles",
    checkFn: (d) => d.hasFavorites,
  },
  {
    id: "nda",
    label: "Firma el NDA para ver datos confidenciales",
    description: "Accede a información detallada de los activos",
    icon: FileText,
    route: "/mi-cuenta",
    checkFn: (d) => d.ndaSigned,
  },
  {
    id: "offer",
    label: "Prepara tu primera oferta",
    description: "Da el paso hacia tu primera inversión",
    icon: Rocket,
    route: "/inmuebles",
    checkFn: (d) => d.hasOffers,
  },
];

interface FirstOperationChecklistProps {
  profileComplete?: boolean;
  hasFavorites?: boolean;
  hasOffers?: boolean;
  ndaSigned?: boolean;
}

const FirstOperationChecklist = ({
  profileComplete = false,
  hasFavorites = false,
  hasOffers = false,
  ndaSigned = false,
}: FirstOperationChecklistProps) => {
  const navigate = useNavigate();
  const data: ChecklistData = { profileComplete, hasFavorites, hasOffers, ndaSigned };

  const completed = steps.filter((s) => s.checkFn(data)).length;
  const progress = Math.round((completed / steps.length) * 100);

  if (progress === 100) return null;

  return (
    <Card className="border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Rocket className="w-4 h-4 text-accent" />
          Mi primera operación
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {completed}/{steps.length}
          </span>
        </CardTitle>
        <Progress value={progress} className="h-1.5" />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {steps.map((step) => {
          const done = step.checkFn(data);
          return (
            <button
              key={step.id}
              onClick={() => navigate(step.route)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                done
                  ? "bg-accent/5 opacity-60"
                  : "hover:bg-muted/50"
              }`}
            >
              {done ? (
                <CheckCircle className="w-4 h-4 text-accent shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{step.description}</p>
              </div>
              {!done && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default FirstOperationChecklist;
