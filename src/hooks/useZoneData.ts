import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ZoneData {
  population?: number;
  unemploymentRate?: number;
  averageFamilyIncome?: number;
  absorptionRate?: number;
  pricePerSqm?: number;
  dataYear?: string;
  source?: string;
}

export function useZoneData() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ZoneData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchZoneData = useCallback(async (
    municipality?: string | null,
    province?: string | null,
    postalCode?: string | null,
  ): Promise<ZoneData | null> => {
    if (!municipality && !province) return null;

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("zone-data", {
        body: {
          municipality: municipality || undefined,
          province: province || undefined,
          postalCode: postalCode || undefined,
        },
      });

      if (fnError) throw fnError;

      if (result?.error) {
        setError(result.error);
        return null;
      }

      setData(result);
      return result as ZoneData;
    } catch (err: any) {
      const msg = err?.message || "Error al obtener datos de zona";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchZoneData };
}
