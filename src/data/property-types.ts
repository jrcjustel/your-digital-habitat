/**
 * Shared property types and label constants.
 * Extracted from the former data/properties.ts (static mock data removed).
 */

export type PropertyType = "vivienda" | "local" | "oficina" | "terreno" | "nave" | "edificio" | "obra-parada";
export type OperationType = "venta" | "alquiler";
export type SaleType = "compraventa" | "npl" | "cesion-remate" | "ocupado";
export type OccupancyStatus = "libre" | "ocupado-con-derecho" | "ocupado-sin-derecho" | "desconocido";
export type JudicialPhase = "no-judicializado" | "demanda" | "oposicion" | "ejecucion" | "subasta" | "adjudicacion" | "posesion";

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  operation: OperationType;
  saleType: SaleType;
  price: number;
  marketValue?: number;
  location: string;
  province: string;
  community: string;
  municipality: string;
  postalCode?: string;
  area: number;
  landArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  description: string;
  features: string[];
  images: string[];
  profitability?: number;
  reference: string;
  isNew?: boolean;
  hasGarage?: boolean;
  hasPool?: boolean;
  hasTerrace?: boolean;
  hasElevator?: boolean;
  year?: number;
  lat: number;
  lng: number;
  catastralRef?: string;
  occupancyStatus: OccupancyStatus;
  isHabitualResidence?: boolean;
  ownershipPercent?: number;
  isVPO?: boolean;
  cee?: {
    rating: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "exento" | "en_tramite" | "no_disponible";
    consumption?: number;
    emissions?: number;
    expiryDate?: string;
  };
  judicialInfo?: {
    judicializado: boolean;
    phase?: JudicialPhase;
    court?: string;
    proceedingNumber?: string;
  };
  debtInfo?: {
    outstandingDebt?: number;
    debtType?: string;
    guaranteeType?: string;
  };
  depositoPorcentaje?: number;
  comisionPorcentaje?: number;
}

export const saleTypes: { value: SaleType; label: string }[] = [
  { value: "compraventa", label: "Compraventa de inmuebles" },
  { value: "npl", label: "Compra de crédito (NPL)" },
  { value: "cesion-remate", label: "Cesión de remate" },
  { value: "ocupado", label: "Inmueble ocupado" },
];

export const occupancyLabels: Record<OccupancyStatus, string> = {
  libre: "Libre",
  "ocupado-con-derecho": "Ocupante con derecho",
  "ocupado-sin-derecho": "Ocupante sin derecho",
  desconocido: "Desconocido",
};

export const judicialPhaseLabels: Record<JudicialPhase, string> = {
  "no-judicializado": "No judicializado",
  demanda: "Demanda",
  oposicion: "Oposición",
  ejecucion: "Ejecución",
  subasta: "Subasta",
  adjudicacion: "Adjudicación",
  posesion: "Posesión",
};
