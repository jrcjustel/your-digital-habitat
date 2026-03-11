import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, ArrowRight, X } from "lucide-react";
import { didYouKnowFacts } from "@/data/asset-type-content";
import type { OpportunityType } from "./OpportunityTypeBadge";
import { motion, AnimatePresence } from "framer-motion";

const typeToFactKey: Record<string, string> = {
  npl: "npl",
  "reo-ocupado": "ocupado",
  "reo-libre": "ocupado",
  cdr: "cesion",
  subasta: "cesion",
};

const typeToAcademySlug: Record<string, string> = {
  npl: "ruta-deuda-npl",
  "reo-ocupado": "ruta-inmuebles-ocupados",
  "reo-libre": "ruta-inmuebles-ocupados",
  cdr: "ruta-cesiones-remate",
  subasta: "ruta-subastas-boe",
};

interface EducationNudgeBarProps {
  activeType?: OpportunityType | "all";
}

const EducationNudgeBar = ({ activeType = "all" }: EducationNudgeBarProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [currentKey, setCurrentKey] = useState("npl");

  // Determine which fact pool to use
  useEffect(() => {
    const key = activeType !== "all" ? (typeToFactKey[activeType] || "npl") : "npl";
    setCurrentKey(key);
    setFactIndex(0);
  }, [activeType]);

  const facts = didYouKnowFacts[currentKey] || didYouKnowFacts.npl;
  const academySlug = activeType !== "all" ? (typeToAcademySlug[activeType] || "ruta-deuda-npl") : "ruta-deuda-npl";

  // Auto-rotate every 8s
  const rotateFact = useCallback(() => {
    setFactIndex((prev) => (prev + 1) % facts.length);
  }, [facts.length]);

  useEffect(() => {
    const interval = setInterval(rotateFact, 8000);
    return () => clearInterval(interval);
  }, [rotateFact]);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4"
    >
      <div className="relative bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-accent" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-0.5">
            ¿Sabías que…?
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={`${currentKey}-${factIndex}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-foreground/80 leading-relaxed"
            >
              {facts[factIndex]}
            </motion.p>
          </AnimatePresence>
          <Link
            to={`/academia/ruta/${academySlug}`}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent mt-1.5 hover:underline"
          >
            Aprende más en la Academia
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default EducationNudgeBar;
