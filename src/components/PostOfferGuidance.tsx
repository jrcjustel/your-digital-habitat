import { CheckCircle, Clock, FileText, Phone, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PostOfferGuidanceProps {
  mode: "offer" | "contact";
  assetType?: string;
}

const offerSteps = [
  {
    icon: CheckCircle,
    title: "Oferta registrada",
    description: "Tu propuesta ha sido registrada en nuestro sistema y asignada al gestor de zona.",
    time: "Inmediato",
  },
  {
    icon: Phone,
    title: "Contacto del gestor",
    description: "Un gestor especializado te contactará para confirmar los detalles y resolver dudas.",
    time: "24–48 horas",
  },
  {
    icon: FileText,
    title: "Validación y documentación",
    description: "Se verifica la oferta con el servicer propietario del activo. Te solicitaremos documentación si es necesario (DNI/NIF, prueba de fondos).",
    time: "3–7 días",
  },
  {
    icon: Clock,
    title: "Respuesta del servicer",
    description: "El servicer evalúa tu propuesta. Puede aceptar, contraoferta o declinar. Te mantendremos informado en cada paso.",
    time: "7–21 días",
  },
];

const contactSteps = [
  {
    icon: CheckCircle,
    title: "Solicitud recibida",
    description: "Hemos registrado tu consulta y la hemos asignado al gestor especializado en la zona del activo.",
    time: "Inmediato",
  },
  {
    icon: Phone,
    title: "Respuesta del gestor",
    description: "El gestor te contactará para resolver tus dudas sobre el activo, proceso de adquisición o documentación.",
    time: "24–48 horas",
  },
];

const PostOfferGuidance = ({ mode, assetType }: PostOfferGuidanceProps) => {
  const steps = mode === "offer" ? offerSteps : contactSteps;
  const academyRoute = assetType === "npl" ? "deuda-npl" : assetType === "cdr" ? "cesiones-remate" : "ocupados";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-accent/5 border border-accent/20 rounded-2xl p-5 mt-6"
    >
      <h4 className="font-heading text-sm font-bold text-foreground mb-1 flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-accent" />
        {mode === "offer" ? "¿Qué pasa ahora con tu oferta?" : "¿Qué pasa ahora?"}
      </h4>
      <p className="text-xs text-muted-foreground mb-4">
        {mode === "offer"
          ? "Tu oferta sigue un proceso profesional de validación. Estos son los siguientes pasos:"
          : "Tu consulta será gestionada por un profesional especializado:"}
      </p>

      <div className="space-y-3 mb-5">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                <step.icon className="w-4 h-4 text-accent" />
              </div>
              {i < steps.length - 1 && <div className="w-px h-full bg-border mt-1 min-h-[16px]" />}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{step.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
          <Link to="/mi-cuenta">
            Seguir en Mi cuenta <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
          <Link to={`/academia/ruta/${academyRoute}`}>
            <BookOpen className="w-3 h-3" /> Aprender más sobre este activo
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default PostOfferGuidance;
