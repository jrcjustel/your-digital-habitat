import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UserCheck, ChevronRight, ChevronLeft, RotateCcw,
  GraduationCap, CreditCard, Gavel, Home, Building2,
  Target, Clock, ShieldCheck, TrendingUp, BookOpen,
} from "lucide-react";

interface Option {
  label: string;
  scores: { npl: number; cdr: number; ocupado: number; reo: number };
}

interface Question {
  id: string;
  icon: typeof UserCheck;
  question: string;
  subtitle: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: "experience",
    icon: GraduationCap,
    question: "¿Cuál es tu experiencia en inversión inmobiliaria?",
    subtitle: "Esto nos ayuda a recomendarte activos acordes a tu nivel.",
    options: [
      { label: "Ninguna — estoy empezando", scores: { npl: 0, cdr: 1, ocupado: 0, reo: 3 } },
      { label: "He comprado algún inmueble para reformar/alquilar", scores: { npl: 1, cdr: 2, ocupado: 1, reo: 3 } },
      { label: "Tengo experiencia con subastas o activos bancarios", scores: { npl: 2, cdr: 3, ocupado: 2, reo: 2 } },
      { label: "Soy inversor profesional / institucional", scores: { npl: 3, cdr: 3, ocupado: 3, reo: 2 } },
    ],
  },
  {
    id: "capital",
    icon: Target,
    question: "¿De qué presupuesto dispones para tu primera operación?",
    subtitle: "Sin contar financiación bancaria.",
    options: [
      { label: "Menos de 50.000 €", scores: { npl: 2, cdr: 1, ocupado: 1, reo: 0 } },
      { label: "50.000 – 150.000 €", scores: { npl: 2, cdr: 3, ocupado: 2, reo: 2 } },
      { label: "150.000 – 500.000 €", scores: { npl: 3, cdr: 2, ocupado: 3, reo: 3 } },
      { label: "Más de 500.000 €", scores: { npl: 3, cdr: 2, ocupado: 3, reo: 3 } },
    ],
  },
  {
    id: "timeline",
    icon: Clock,
    question: "¿Cuánto tiempo puedes esperar para obtener rentabilidad?",
    subtitle: "Los activos distressed requieren paciencia. Indica tu horizonte.",
    options: [
      { label: "Menos de 6 meses", scores: { npl: 0, cdr: 1, ocupado: 0, reo: 3 } },
      { label: "6 a 12 meses", scores: { npl: 1, cdr: 3, ocupado: 1, reo: 2 } },
      { label: "12 a 24 meses", scores: { npl: 3, cdr: 2, ocupado: 2, reo: 1 } },
      { label: "Más de 24 meses — puedo esperar", scores: { npl: 3, cdr: 1, ocupado: 3, reo: 1 } },
    ],
  },
  {
    id: "risk",
    icon: ShieldCheck,
    question: "¿Cuál es tu tolerancia al riesgo?",
    subtitle: "Mayor riesgo suele implicar mayor descuento, pero también mayor complejidad.",
    options: [
      { label: "Bajo — prefiero seguridad ante todo", scores: { npl: 0, cdr: 1, ocupado: 0, reo: 3 } },
      { label: "Medio — acepto cierta incertidumbre", scores: { npl: 1, cdr: 3, ocupado: 1, reo: 2 } },
      { label: "Alto — busco el máximo descuento", scores: { npl: 3, cdr: 2, ocupado: 3, reo: 0 } },
    ],
  },
  {
    id: "legal",
    icon: BookOpen,
    question: "¿Tienes acceso a asesoramiento jurídico especializado?",
    subtitle: "Algunas inversiones requieren acompañamiento legal específico.",
    options: [
      { label: "No, y prefiero operaciones sencillas", scores: { npl: 0, cdr: 1, ocupado: 0, reo: 3 } },
      { label: "Puedo contratar un abogado si es necesario", scores: { npl: 2, cdr: 3, ocupado: 2, reo: 2 } },
      { label: "Sí, cuento con equipo legal propio", scores: { npl: 3, cdr: 2, ocupado: 3, reo: 1 } },
    ],
  },
];

interface Result {
  key: string;
  label: string;
  icon: typeof CreditCard;
  score: number;
  description: string;
  route: string;
  academyRoute: string;
  academyLabel: string;
  color: string;
  bgColor: string;
}

const PROFILES: Omit<Result, "score">[] = [
  {
    key: "npl",
    label: "NPL — Crédito impagado",
    icon: CreditCard,
    description: "Tu perfil encaja con la compra de créditos hipotecarios impagados. Ofrecen los mayores descuentos (40-70%) pero requieren experiencia, paciencia y acompañamiento legal.",
    route: "/inversores/npl",
    academyRoute: "/academia/ruta/deuda-npl",
    academyLabel: "Ruta: Deuda Impagada (NPL)",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    key: "cdr",
    label: "Cesión de Remate",
    icon: Gavel,
    description: "Las cesiones de remate son ideales para tu perfil. Plazo más corto que un NPL, descuentos del 30-50% y un proceso legal más predecible al adquirir directamente del ejecutante.",
    route: "/inversores/cesiones-remate",
    academyRoute: "/academia/ruta/cesiones-remate",
    academyLabel: "Ruta: Cesiones de Remate",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    key: "ocupado",
    label: "REO Ocupado",
    icon: Home,
    description: "Los inmuebles ocupados ofrecen descuentos del 35-55%, pero requieren gestión de desahucio. Es una inversión para perfiles experimentados con tolerancia al riesgo y horizonte largo.",
    route: "/inversores/ocupados",
    academyRoute: "/academia/ruta/ocupados",
    academyLabel: "Ruta: Inmuebles Ocupados",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "reo",
    label: "REO Libre / Vacío",
    icon: Building2,
    description: "Los inmuebles vacíos con posesión inmediata son la opción más segura. Menores descuentos (10-25%) pero sin complicaciones legales. Ideal para empezar a invertir en distressed.",
    route: "/inmuebles",
    academyRoute: "/academia",
    academyLabel: "Academia IKESA — Formación completa",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
];

const InvestorSelfAssessment = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const progress = showResults ? 100 : ((currentQ) / QUESTIONS.length) * 100;

  const handleSelect = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIdx;
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setShowResults(false);
  };

  const results: Result[] = (() => {
    const totals = { npl: 0, cdr: 0, ocupado: 0, reo: 0 };
    answers.forEach((optIdx, qIdx) => {
      if (optIdx !== undefined) {
        const scores = QUESTIONS[qIdx].options[optIdx].scores;
        totals.npl += scores.npl;
        totals.cdr += scores.cdr;
        totals.ocupado += scores.ocupado;
        totals.reo += scores.reo;
      }
    });
    const maxPossible = QUESTIONS.length * 3;
    return PROFILES.map((p) => ({
      ...p,
      score: Math.round((totals[p.key as keyof typeof totals] / maxPossible) * 100),
    })).sort((a, b) => b.score - a.score);
  })();

  const q = QUESTIONS[currentQ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Test de Inversor — Descubre tu perfil de inversión | IKESA"
        description="Responde 5 preguntas y descubre qué tipo de activo distressed se adapta mejor a tu perfil: NPL, cesión de remate, inmueble ocupado o REO libre."
      />
      <Navbar />

      <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-accent/20 rounded-xl">
              <UserCheck className="w-6 h-6 text-accent" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Guía de inversión</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">Test de Perfil Inversor</h1>
          <p className="text-primary-foreground/75 text-base md:text-lg max-w-2xl">
            Responde 5 preguntas y te recomendaremos el tipo de activo que mejor encaja con tu experiencia, capital y tolerancia al riesgo.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{showResults ? "Resultado" : `Pregunta ${currentQ + 1} de ${QUESTIONS.length}`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <q.icon className="w-5 h-5 text-accent" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">Pregunta {currentQ + 1}</Badge>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">{q.question}</h2>
                  <p className="text-sm text-muted-foreground mb-6">{q.subtitle}</p>

                  <div className="space-y-3">
                    {q.options.map((opt, idx) => {
                      const isSelected = answers[currentQ] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(idx)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm
                            ${isSelected
                              ? "border-accent bg-accent/5 text-foreground font-medium"
                              : "border-border bg-background hover:border-accent/40 hover:bg-muted/30 text-foreground"
                            }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {currentQ > 0 && (
                    <div className="mt-6">
                      <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Top recommendation */}
              <Card className="border-2 border-accent shadow-md overflow-hidden">
                <div className="bg-accent/10 px-5 py-3 border-b border-accent/20">
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">Tu recomendación principal</span>
                </div>
                <CardContent className="pt-5">
                  {(() => {
                    const TopIcon = results[0].icon;
                    return (
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${results[0].bgColor}`}>
                      <TopIcon className={`w-7 h-7 ${results[0].color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">{results[0].label}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{results[0].description}</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild>
                          <Link to={results[0].route}>
                            Ver oportunidades <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link to={results[0].academyRoute}>
                            <GraduationCap className="w-4 h-4 mr-1.5" />
                            {results[0].academyLabel}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* All scores */}
              <Card className="border-border shadow-sm">
                <CardContent className="pt-5">
                  <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    Compatibilidad con cada tipo de activo
                  </h4>
                  <div className="space-y-4">
                    {results.map((r, i) => {
                      const Icon = r.icon;
                      return (
                        <div key={r.key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${r.color}`} />
                              <span className="text-sm font-medium text-foreground">{r.label}</span>
                              {i === 0 && <Badge className="text-[9px] bg-accent text-accent-foreground">Recomendado</Badge>}
                            </div>
                            <span className="text-sm font-bold text-foreground">{r.score}%</span>
                          </div>
                          <Progress value={r.score} className="h-2.5" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Academy suggestion */}
              <Card className="border-border shadow-sm bg-muted/30">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Formación recomendada</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Antes de invertir, te recomendamos completar la ruta formativa correspondiente en la Academia IKESA.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {results.slice(0, 2).map((r) => (
                          <Button key={r.key} variant="outline" size="sm" asChild>
                            <Link to={r.academyRoute}>
                              <BookOpen className="w-3.5 h-3.5 mr-1" />
                              {r.academyLabel}
                            </Link>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Volver
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Repetir test
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <div className="mt-8 bg-muted/50 border border-border rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
          <p>
            Este test es orientativo y tiene fines educativos. La recomendación no constituye asesoramiento financiero.
            Cada inversión debe analizarse individualmente con el apoyo de profesionales cualificados.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InvestorSelfAssessment;
