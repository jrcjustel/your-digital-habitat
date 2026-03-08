import { CheckCircle } from "lucide-react";

/**
 * Horizontal visual process timeline inspired by Auctree's step-by-step process.
 * Shows connected steps with durations and descriptions.
 */

const steps = [
  {
    title: "Haz tu oferta",
    duration: "Día 1",
    description: "Encuentra tu activo y envía una oferta. Recibirás notificaciones en tiempo real.",
  },
  {
    title: "Revisión y depósito",
    duration: "2-3 días",
    description: "Revisamos tu oferta. Tras la pre-aprobación, abonas el depósito de reserva.",
  },
  {
    title: "Prevención blanqueo",
    duration: "1-2 semanas",
    description: "Documentación de origen de fondos según Ley 10/2010.",
  },
  {
    title: "Contrato de arras",
    duration: "1 semana",
    description: "Establece las condiciones y reserva tu derecho de compra con el 10%.",
  },
  {
    title: "Transferencia",
    duration: "2-5 meses",
    description: "Un tribunal supervisa la transferencia y cancela cargas pendientes.",
  },
  {
    title: "¡Llaves!",
    duration: "Entrega",
    description: "Inmueble a tu nombre, libre de cargas. A rentabilizar.",
  },
];

const ProcessTimeline = () => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Desktop: horizontal */}
      <div className="hidden md:block">
        {/* Progress bar */}
        <div className="relative flex items-center justify-between mb-8">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
          {/* Filled line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/30 via-accent to-accent" />

          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  i === steps.length - 1
                    ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20"
                    : "bg-card text-foreground border-accent/50"
                }`}
              >
                {i === steps.length - 1 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  i + 1
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between">
          {steps.map((step, i) => (
            <div key={i} className="text-center px-2" style={{ width: `${100 / steps.length}%` }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{step.duration}</span>
              <h4 className="font-bold text-sm text-foreground mt-1 mb-1">{step.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-snug">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 z-10 ${
                  i === steps.length - 1
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-foreground border-accent/50"
                }`}
              >
                {i === steps.length - 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className="flex-1 w-px bg-border min-h-[40px]" />}
            </div>
            <div className="pb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{step.duration}</span>
              <h4 className="font-bold text-sm text-foreground mt-0.5 mb-0.5">{step.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessTimeline;
