import { useState } from "react";
import { Loader2, Sparkles, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import type { DossierData } from "@/lib/dossier/types";
import { generateInvestmentDossier } from "@/lib/dossier";
import { useZoneData } from "@/hooks/useZoneData";

interface EnrichedDossierButtonProps {
  dossierData: DossierData;
  variant?: "default" | "outline";
  className?: string;
}

const EnrichedDossierButton = ({
  dossierData,
  variant = "default",
  className = "",
}: EnrichedDossierButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { fetchZoneData } = useZoneData();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Enrich with zone data from AI
      const zoneData = await fetchZoneData(
        dossierData.municipality,
        dossierData.province,
        dossierData.postalCode,
      );

      const enrichedData: DossierData = { ...dossierData };

      if (zoneData) {
        if (zoneData.population) enrichedData.population = zoneData.population;
        if (zoneData.unemploymentRate) enrichedData.unemploymentRate = zoneData.unemploymentRate;
        if (zoneData.averageFamilyIncome) enrichedData.averageFamilyIncome = zoneData.averageFamilyIncome;
        if (zoneData.absorptionRate) enrichedData.absorptionRate = zoneData.absorptionRate;
        if (zoneData.pricePerSqm && !enrichedData.pricePerSqm) {
          enrichedData.pricePerSqm = zoneData.pricePerSqm;
        }
        toast.success("Datos de zona enriquecidos con éxito");
      } else {
        toast.info("No se pudieron obtener datos de zona — se generará sin enriquecer");
      }

      await generateInvestmentDossier(enrichedData);
    } catch (err) {
      console.error("Error generating enriched dossier:", err);
      toast.error("Error al generar el dossier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleGenerate}
      disabled={loading}
      className={`gap-2 ${className}`}
      size="sm"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Enriqueciendo...
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5" />
          Dossier IA
        </>
      )}
    </Button>
  );
};

export default EnrichedDossierButton;
