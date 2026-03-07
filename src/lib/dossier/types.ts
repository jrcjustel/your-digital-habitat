/** Unified data model for the investment dossier PDF */

export interface DossierData {
  // Section 1 – Operation info
  operationType: "compra-credito" | "cesion-remate" | "subasta" | "reo";
  reference: string;
  description: string;
  investmentSummary: string;
  potentialPurchasePrice: number;
  estimatedAssetValue: number;

  // Section 2 – Collateral
  propertyType: string;
  catastralRef?: string;
  builtArea: number;
  landArea?: number;
  yearBuilt?: number;
  conservationState: string;
  occupancyStatus: string;
  leaseExpiryDate?: string;
  grossMonthlyRent?: number;
  preferentialCharges?: number;

  // Section 3 – Debt & Proceedings
  currentDebt?: number;
  debtorType?: string;
  auctionEffectsValue?: number;
  judicialPhase?: string;
  lastJudicialDate?: string;
  court?: string;
  proceedingNumber?: string;

  // Section 4 – Valuation
  pricePerSqm: number;
  adoptedArea: number;
  totalValuation: number;
  marketValue: number;

  // Section 5 – Zone info
  address?: string;
  postalCode?: string;
  municipality?: string;
  province?: string;
  community?: string;
  absorptionRate?: number;
  population?: number;
  unemploymentRate?: number;
  averageFamilyIncome?: number;
  lat?: number;
  lng?: number;

  // Section 6 – Description (auto-generated)
  detailedDescription?: string;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];

  // Section 7 – Calendar (estimated months)
  calendar?: {
    arras: number;
    escritura: number;
    testimonioJudicial: number;
    posesion: number;
    reforma: number;
    venta: number;
  };

  // Section 8 – Scenario 1: Buy credit → adjudication → possession → reform → sale
  scenario1?: {
    purchasePrice: number;
    taxes: number;
    judicialCosts: number;
    reformCosts: number;
    estimatedSalePrice: number;
    operationMargin: number;
    grossIRR: number;
    durationMonths: number;
  };

  // Section 9 – Scenario 2: Buy credit → assignment agreement
  scenario2?: {
    purchasePrice: number;
    assignmentIncome: number;
    legalCosts: number;
    estimatedMargin: number;
    operationIRR: number;
    durationMonths: number;
  };

  // Profitability
  profitability?: number;
  discount?: number;

  // VPO
  isVPO?: boolean;
}
