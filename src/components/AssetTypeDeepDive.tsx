import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertTriangle, BookOpen, TrendingUp, Clock, Users } from "lucide-react";
import { assetTypes, type AssetTypeInfo } from "@/data/asset-type-content";

interface AssetTypeDeepDiveProps {
  assetType: "npl" | "cesion" | "ocupado";
}

const AssetTypeDeepDive = ({ assetType }: AssetTypeDeepDiveProps) => {
  const info: AssetTypeInfo = assetTypes[assetType];
  if (!info) return null;

  return (
    <section className="py-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is" className="border border-border rounded-xl px-4 mb-2">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline gap-2">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              ¿Qué es un {info.label}?
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
            {info.whatIs}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="how-works" className="border border-border rounded-xl px-4 mb-2">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline gap-2">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              ¿Cómo funciona el proceso?
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
            {info.howItWorks}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="risks" className="border border-border rounded-xl px-4 mb-2">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline gap-2">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Riesgos principales
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <ul className="space-y-2">
              {info.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive/60 shrink-0 mt-0.5" />
                  {risk}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="profile" className="border border-border rounded-xl px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline gap-2">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              ¿Para quién es esta inversión?
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Nivel recomendado</p>
                <p className="text-sm font-semibold text-foreground">{info.recommendedLevel}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Plazo estimado</p>
                <p className="text-sm font-semibold text-foreground">{info.typicalTimeline}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider">ROI típico</p>
                <p className="text-sm font-semibold text-foreground">{info.typicalRoi}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Descuento habitual</p>
                <p className="text-sm font-semibold text-foreground">{info.typicalDiscount}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default AssetTypeDeepDive;
