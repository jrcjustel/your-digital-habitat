import { ShieldCheck, FileText, Scale, Building2 } from "lucide-react";

const items = [
  { icon: ShieldCheck, text: "NDA digital obligatorio" },
  { icon: FileText, text: "Due diligence incluida" },
  { icon: Scale, text: "Supervisión jurídica" },
  { icon: Building2, text: "Activos de entidades reguladas" },
];

const LegalSafetyBanner = () => (
  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      {items.map((item) => (
        <div key={item.text} className="flex items-center gap-1.5">
          <item.icon className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-foreground">{item.text}</span>
        </div>
      ))}
    </div>
  </div>
);

export default LegalSafetyBanner;
