/**
 * Adapters to convert Property and NplAsset data into DossierData
 */
import type { DossierData } from "./types";
import type { Property } from "@/data/properties";
import { occupancyLabels, judicialPhaseLabels } from "@/data/properties";

export { generateInvestmentDossier, generateDossierBlob } from "./generateDossier";
export type { DossierData } from "./types";

const saleTypeToOpType: Record<string, DossierData["operationType"]> = {
  npl: "compra-credito",
  "cesion-remate": "cesion-remate",
  compraventa: "reo",
  ocupado: "reo",
};

/** Convert a Property to DossierData with auto-calculated financial scenarios */
export function propertyToDossier(p: Property): DossierData {
  const price = p.price;
  const market = p.marketValue || price;
  const discount = market > 0 ? Math.round(((market - price) / market) * 100) : 0;
  const pricePerSqm = p.area > 0 ? Math.round(market / p.area) : 0;

  // Estimate financial scenario 1
  const taxes = Math.round(price * 0.08);
  const judicialCosts = p.saleType === "compraventa" ? 0 : Math.round(price * 0.05);
  const reformCosts = Math.round(p.area * 350);
  const totalInvest = price + taxes + judicialCosts + reformCosts;
  const salePrice = Math.round(market * 0.92);
  const margin1 = salePrice - totalInvest;
  const durationMonths1 = p.saleType === "npl" ? 48 : p.saleType === "cesion-remate" ? 36 : 18;
  const irr1 = totalInvest > 0 ? Math.round((margin1 / totalInvest) * 100 / (durationMonths1 / 12) * 10) / 10 : 0;

  // Estimate calendar
  const isJudicial = p.saleType === "npl" || p.saleType === "cesion-remate";
  const calendar = {
    arras: 1,
    escritura: isJudicial ? 3 : 1,
    testimonioJudicial: isJudicial ? 6 : 0,
    posesion: p.occupancyStatus !== "libre" ? 12 : 1,
    reforma: 4,
    venta: 6,
  };

  const data: DossierData = {
    operationType: saleTypeToOpType[p.saleType] || "reo",
    reference: p.reference,
    description: p.description,
    investmentSummary: `Oportunidad de inversión: ${p.title}. Precio potencial de compra de ${price.toLocaleString("es-ES")} € frente a un valor de mercado estimado de ${market.toLocaleString("es-ES")} €, lo que supone un descuento del ${discount}%.`,
    potentialPurchasePrice: price,
    estimatedAssetValue: market,

    propertyType: p.type,
    catastralRef: p.catastralRef,
    builtArea: p.area,
    landArea: p.landArea,
    yearBuilt: p.year,
    conservationState: p.features.includes("Reformado") ? "Reformado" : p.features.includes("A reformar") ? "A reformar" : "Buen estado",
    occupancyStatus: occupancyLabels[p.occupancyStatus],
    isVPO: p.isVPO,

    currentDebt: p.debtInfo?.outstandingDebt,
    debtorType: undefined,
    judicialPhase: p.judicialInfo?.phase ? judicialPhaseLabels[p.judicialInfo.phase] : undefined,
    court: p.judicialInfo?.court,
    proceedingNumber: p.judicialInfo?.proceedingNumber,

    pricePerSqm,
    adoptedArea: p.area,
    totalValuation: market,
    marketValue: market,

    address: p.location,
    postalCode: p.postalCode,
    municipality: p.municipality,
    province: p.province,
    community: p.community,
    lat: p.lat,
    lng: p.lng,

    detailedDescription: p.description,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    features: p.features,

    calendar,

    scenario1: {
      purchasePrice: price,
      taxes,
      judicialCosts,
      reformCosts,
      estimatedSalePrice: salePrice,
      operationMargin: margin1,
      grossIRR: irr1,
      durationMonths: durationMonths1,
    },

    profitability: p.profitability,
    discount,
  };

  // Scenario 2 only for NPL/cesion
  if (p.saleType === "npl" || p.saleType === "cesion-remate") {
    const assignmentIncome = Math.round(market * 0.7);
    const legalCosts2 = Math.round(price * 0.03);
    const margin2 = assignmentIncome - price - legalCosts2;
    const dur2 = 18;
    const irr2 = price > 0 ? Math.round((margin2 / price) * 100 / (dur2 / 12) * 10) / 10 : 0;

    data.scenario2 = {
      purchasePrice: price,
      assignmentIncome,
      legalCosts: legalCosts2,
      estimatedMargin: margin2,
      operationIRR: irr2,
      durationMonths: dur2,
    };
  }

  return data;
}

/** Convert an NPL asset (from database) to DossierData */
export function nplAssetToDossier(a: {
  id: string;
  municipio: string | null;
  provincia: string | null;
  comunidad_autonoma: string | null;
  tipo_activo: string | null;
  direccion: string | null;
  ref_catastral: string | null;
  valor_activo: number;
  deuda_ob: number;
  valor_mercado: number;
  precio_orientativo: number;
  sqm: number;
  estado_ocupacional: string | null;
  fase_judicial: string | null;
  judicializado: boolean;
  cesion_remate: boolean;
  cesion_credito: boolean;
  postura_subasta: boolean;
  propiedad_sin_posesion: boolean;
  anio_construccion: number | null;
  vpo: boolean;
  codigo_postal: string | null;
  persona_tipo: string | null;
  referencia_fencia: string | null;
  descripcion: string | null;
  importe_preaprobado: number;
  ndg: string | null;
  asset_id: string | null;
  comision_porcentaje: number;
  deposito_porcentaje: number;
  num_titulares: number;
  [key: string]: unknown;
}): DossierData {
  const price = a.precio_orientativo || a.importe_preaprobado || 0;
  const market = a.valor_mercado || a.valor_activo || 0;
  const debt = a.deuda_ob || 0;
  const discount = market > 0 ? Math.round(((market - price) / market) * 100) : 0;
  const pricePerSqm = a.sqm > 0 ? Math.round(market / a.sqm) : 0;
  const area = a.sqm || 0;

  const opType: DossierData["operationType"] = a.cesion_credito
    ? "compra-credito"
    : a.cesion_remate
    ? "cesion-remate"
    : a.postura_subasta
    ? "subasta"
    : "reo";

  const ref = a.referencia_fencia || a.asset_id || a.ndg || a.id.substring(0, 8);

  const taxes = Math.round(price * 0.08);
  const judicialCosts = Math.round(price * 0.05);
  const reformCosts = Math.round(area * 350);
  const totalInvest = price + taxes + judicialCosts + reformCosts;
  const salePrice = Math.round(market * 0.92);
  const margin1 = salePrice - totalInvest;
  const durationMonths1 = 48;
  const irr1 = totalInvest > 0 ? Math.round((margin1 / totalInvest) * 100 / (durationMonths1 / 12) * 10) / 10 : 0;
  const profitability = price > 0 ? Math.round(((market - price) / price) * 100 * 10) / 10 : 0;

  const isOccupied = a.estado_ocupacional === "Ocupado" || a.propiedad_sin_posesion;

  const calendar = {
    arras: 1,
    escritura: 3,
    testimonioJudicial: a.judicializado ? 8 : 0,
    posesion: isOccupied ? 12 : 1,
    reforma: 4,
    venta: 6,
  };

  const data: DossierData = {
    operationType: opType,
    reference: ref,
    description: a.descripcion || `Oportunidad de inversión en ${a.tipo_activo || "inmueble"} ubicado en ${a.municipio || "ubicación no disponible"}.`,
    investmentSummary: `Crédito por importe de ${(debt / 1000).toFixed(0)}k €, con colateral en ${a.municipio || "zona"}, valorado estimativamente en ${(market / 1000).toFixed(0)}k €. El precio potencial de compra propuesto es de ${(price / 1000).toFixed(0)}k €.`,
    potentialPurchasePrice: price,
    estimatedAssetValue: market,

    propertyType: a.tipo_activo || "Vivienda",
    catastralRef: a.ref_catastral || undefined,
    builtArea: area,
    yearBuilt: a.anio_construccion || undefined,
    conservationState: "No disponible",
    occupancyStatus: a.estado_ocupacional || "Desconocido",
    isVPO: a.vpo,

    currentDebt: debt,
    debtorType: a.persona_tipo || undefined,
    auctionEffectsValue: a.importe_preaprobado || undefined,
    judicialPhase: a.fase_judicial || undefined,

    pricePerSqm,
    adoptedArea: area,
    totalValuation: market,
    marketValue: market,

    address: a.direccion || undefined,
    postalCode: a.codigo_postal || undefined,
    municipality: a.municipio || undefined,
    province: a.provincia || undefined,
    community: a.comunidad_autonoma || undefined,

    bedrooms: undefined,
    bathrooms: undefined,
    features: [],

    calendar,

    scenario1: {
      purchasePrice: price,
      taxes,
      judicialCosts,
      reformCosts,
      estimatedSalePrice: salePrice,
      operationMargin: margin1,
      grossIRR: irr1,
      durationMonths: durationMonths1,
    },

    profitability,
    discount,
  };

  // Scenario 2 for credit/assignment operations
  if (a.cesion_credito || a.cesion_remate) {
    const assignmentIncome = Math.round(market * 0.7);
    const legalCosts2 = Math.round(price * 0.03);
    const margin2 = assignmentIncome - price - legalCosts2;
    const dur2 = 18;
    const irr2 = price > 0 ? Math.round((margin2 / price) * 100 / (dur2 / 12) * 10) / 10 : 0;

    data.scenario2 = {
      purchasePrice: price,
      assignmentIncome,
      legalCosts: legalCosts2,
      estimatedMargin: margin2,
      operationIRR: irr2,
      durationMonths: dur2,
    };
  }

  return data;
}
