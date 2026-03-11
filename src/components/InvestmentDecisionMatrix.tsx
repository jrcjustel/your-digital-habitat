import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Gavel, Home, Building2, Star, Clock, TrendingDown, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const types = [
  {
    key: "npl",
    label: "NPL",
    icon: CreditCard,
    color: "text-destructive",
    bg: "bg-destructive/10",
    route: "/inversores/npl",
    capital: "20k – 80k €",
    level: "Avanzado",
    levelStars: 4,
    timeline: "12 – 24 m",
    discount: "40 – 70%",
    roi: "40 – 80%",
    complexity: 3,
    risk: 3,
  },
  {
    key: "cesion",
    label: "CDR",
    icon: Gavel,
    color: "text-accent",
    bg: "bg-accent/10",
    route: "/inversores/cesiones-remate",
    capital: "60k – 150k €",
    level: "Intermedio",
    levelStars: 3,
    timeline: "6 – 12 m",
    discount: "30 – 50%",
    roi: "25 – 45%",
    complexity: 2,
    risk: 2,
  },
  {
    key: "ocupado",
    label: "Ocupado",
    icon: Home,
    color: "text-primary",
    bg: "bg-primary/10",
    route: "/inversores/ocupados",
    capital: "50k – 200k €",
    level: "Avanzado",
    levelStars: 4,
    timeline: "12 – 30 m",
    discount: "35 – 55%",
    roi: "30 – 55%",
    complexity: 3,
    risk: 3,
  },
  {
    key: "reo-libre",
    label: "REO Libre",
    icon: Building2,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    route: "/inmuebles",
    capital: "80k – 300k €",
    level: "Principiante",
    levelStars: 1,
    timeline: "3 – 6 m",
    discount: "10 – 25%",
    roi: "10 – 25%",
    complexity: 1,
    risk: 1,
  },
];

const renderDots = (n: number, max: number = 4) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${
          i < n ? "bg-accent" : "bg-muted-foreground/20"
        }`}
      />
    ))}
  </div>
);

const InvestmentDecisionMatrix = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3 text-xs font-semibold tracking-wider uppercase">
          Comparativa
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          ¿Qué tipo de inversión encaja contigo?
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Compara los principales tipos de inversión distressed según tu perfil, capital y tolerancia al riesgo.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {types.map((t, i) => (
          <motion.div
            key={t.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow border-border">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center`}>
                    <t.icon className={`w-4 h-4 ${t.color}`} />
                  </div>
                  <span className="font-bold text-foreground">{t.label}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Descuento típico
                    </p>
                    <p className="text-sm font-semibold text-foreground">{t.discount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> ROI esperado
                    </p>
                    <p className="text-sm font-semibold text-accent">{t.roi}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Plazo
                    </p>
                    <p className="text-sm font-semibold text-foreground">{t.timeline}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Capital orientativo
                    </p>
                    <p className="text-sm font-semibold text-foreground">{t.capital}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Complejidad
                    </p>
                    {renderDots(t.complexity)}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                      <Users className="w-3 h-3" /> Nivel recomendado
                    </p>
                    <p className="text-xs font-medium text-foreground">{t.level}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate(t.route)}
                >
                  Ver oportunidades
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default InvestmentDecisionMatrix;
