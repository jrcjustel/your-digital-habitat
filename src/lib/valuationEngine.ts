import type { Property, OccupancyStatus, JudicialPhase } from "@/data/property-types";

// ─── ZONE LIQUIDITY ───
export type ZoneLiquidity = "alta" | "media" | "baja";

const liquidityCoefficients: Record<ZoneLiquidity, number> = {
  alta: 0.85,
  media: 0.75,
  baja: 0.65,
};

// Estimate zone liquidity from province (simplified heuristic)
export function estimateZoneLiquidity(province: string): ZoneLiquidity {
  const highLiquidity = ["Madrid", "Barcelona", "Málaga", "Sevilla", "Valencia", "Bilbao", "Palma de Mallorca"];
  const mediumLiquidity = ["Cádiz", "Alicante", "Granada", "Zaragoza", "Murcia", "Las Palmas", "Santa Cruz de Tenerife", "Valladolid", "Salamanca"];
  if (highLiquidity.some((h) => province.toLowerCase().includes(h.toLowerCase()))) return "alta";
  if (mediumLiquidity.some((m) => province.toLowerCase().includes(m.toLowerCase()))) return "media";
  return "baja";
}

// ─── 1. VALORACIÓN CESIONES DE REMATE ───
export interface CesionRemateParams {
  marketValue: number;
  auctionAmount: number;       // importe adjudicación
  outstandingDebt: number;
  judicialCosts?: number;
  taxRate?: number;             // % impuestos (ITP ~8-10%)
  reformCosts?: number;
  evictionCosts?: number;
  chargesCancellation?: number; // costes cancelación cargas
  oppositionProbability?: number; // 0-1
  possessionTimeMonths?: number;
  zoneLiquidity: ZoneLiquidity;
}

export interface CesionRemateResult {
  valorCesion: number;
  costesTotales: number;
  margenBeneficio: number;
  margenPorcentaje: number;
  coeficienteLiquidacion: number;
  riesgoOposicion: "bajo" | "medio" | "alto";
  tiempoPosesionEstimado: number;
  desgloseCostes: {
    judiciales: number;
    impuestos: number;
    reformas: number;
    desahucio: number;
    cargas: number;
  };
}

export function valuateCesionRemate(params: CesionRemateParams): CesionRemateResult {
  const coef = liquidityCoefficients[params.zoneLiquidity];
  const judiciales = params.judicialCosts ?? params.marketValue * 0.03;
  const impuestos = params.marketValue * (params.taxRate ?? 0.08);
  const reformas = params.reformCosts ?? 0;
  const desahucio = params.evictionCosts ?? 0;
  const cargas = params.chargesCancellation ?? 0;
  const costesTotales = judiciales + impuestos + reformas + desahucio + cargas;

  const valorCesion = (params.marketValue * coef) - costesTotales;
  const margenBeneficio = valorCesion - params.auctionAmount;
  const margenPorcentaje = params.auctionAmount > 0 ? (margenBeneficio / params.auctionAmount) * 100 : 0;

  const opp = params.oppositionProbability ?? 0.2;
  const riesgoOposicion = opp > 0.6 ? "alto" : opp > 0.3 ? "medio" : "bajo";
  const tiempoPosesionEstimado = params.possessionTimeMonths ?? (opp > 0.5 ? 18 : opp > 0.2 ? 12 : 6);

  return {
    valorCesion: Math.round(valorCesion),
    costesTotales: Math.round(costesTotales),
    margenBeneficio: Math.round(margenBeneficio),
    margenPorcentaje: Math.round(margenPorcentaje * 10) / 10,
    coeficienteLiquidacion: coef,
    riesgoOposicion,
    tiempoPosesionEstimado,
    desgloseCostes: {
      judiciales: Math.round(judiciales),
      impuestos: Math.round(impuestos),
      reformas: Math.round(reformas),
      desahucio: Math.round(desahucio),
      cargas: Math.round(cargas),
    },
  };
}

// ─── 2. VALORACIÓN ACTIVOS OCUPADOS ───
export type OccupationType = "conocida" | "conflictiva" | "familiar";

const occupationPenalties: Record<OccupationType, number> = {
  conocida: 0.60,    // -40%
  conflictiva: 0.40, // -60%
  familiar: 0.70,    // -30%
};

export interface OcupadoParams {
  marketValue: number;
  occupationType: OccupationType;
  legalRisk?: number; // 0-1
  estimatedRecoveryMonths?: number;
  reformCosts?: number;
  judicialCosts?: number;
}

export interface OcupadoResult {
  valorInversor: number;
  factorOcupacion: number;
  penalizacionPorcentaje: number;
  riesgoLegal: "bajo" | "medio" | "alto";
  tiempoRecuperacion: number;
  ahorro: number;
  ahorroPorcentaje: number;
}

export function valuateOcupado(params: OcupadoParams): OcupadoResult {
  const factor = occupationPenalties[params.occupationType];
  const valorBase = params.marketValue * factor;
  const costes = (params.reformCosts ?? 0) + (params.judicialCosts ?? params.marketValue * 0.02);
  const valorInversor = valorBase - costes;

  const risk = params.legalRisk ?? 0.3;
  const riesgoLegal = risk > 0.6 ? "alto" : risk > 0.3 ? "medio" : "bajo";
  const tiempoRecuperacion = params.estimatedRecoveryMonths ?? (params.occupationType === "conflictiva" ? 24 : params.occupationType === "familiar" ? 18 : 12);

  return {
    valorInversor: Math.round(valorInversor),
    factorOcupacion: factor,
    penalizacionPorcentaje: Math.round((1 - factor) * 100),
    riesgoLegal,
    tiempoRecuperacion,
    ahorro: Math.round(params.marketValue - valorInversor),
    ahorroPorcentaje: Math.round(((params.marketValue - valorInversor) / params.marketValue) * 100),
  };
}

// ─── 3. VALORACIÓN SUBASTAS BOE ───
export interface SubastaParams {
  marketValue: number;
  judicialAppraisalValue: number; // valor tasación judicial
  debtAmount: number;
  currentBid?: number;
  hasPriorCharges?: boolean;
  isOccupied?: boolean;
  isComplexProcedure?: boolean;
}

export interface SubastaResult {
  descuento: number; // %
  precioSubastaEstimado: number;
  riesgoJudicial: number; // 0-100
  riesgoNivel: "bajo" | "medio" | "alto";
  margenPotencial: number;
  recomendacion: string;
}

export function valuateSubasta(params: SubastaParams): SubastaResult {
  const precioSubasta = params.currentBid ?? params.judicialAppraisalValue * 0.7;
  const descuento = ((params.marketValue - precioSubasta) / params.marketValue) * 100;

  // Risk calculation
  let riesgo = 0;
  if (params.hasPriorCharges) riesgo += 30;
  if (params.isOccupied) riesgo += 35;
  if (params.isComplexProcedure) riesgo += 20;
  if (params.debtAmount > params.marketValue) riesgo += 15;
  riesgo = Math.min(riesgo, 100);

  const riesgoNivel = riesgo > 60 ? "alto" : riesgo > 30 ? "medio" : "bajo";
  const margenPotencial = params.marketValue - precioSubasta;

  let recomendacion = "";
  if (descuento > 40 && riesgo < 40) recomendacion = "Oportunidad excelente: alto descuento con riesgo controlado";
  else if (descuento > 30 && riesgo < 60) recomendacion = "Oportunidad interesante: buen descuento, analizar riesgos";
  else if (descuento > 20) recomendacion = "Oportunidad moderada: valorar costes asociados";
  else recomendacion = "Descuento limitado: precaución";

  return {
    descuento: Math.round(descuento * 10) / 10,
    precioSubastaEstimado: Math.round(precioSubasta),
    riesgoJudicial: riesgo,
    riesgoNivel,
    margenPotencial: Math.round(margenPotencial),
    recomendacion,
  };
}

// ─── 4. SCORING DE OPORTUNIDAD ───
export interface OpportunityScoreParams {
  discountPercent: number;       // descuento sobre mercado
  rentalYield?: number;          // rentabilidad alquiler %
  zoneLiquidity: ZoneLiquidity;
  legalRisk: number;             // 0-1
  isOccupied: boolean;
}

export interface OpportunityScoreResult {
  score: number; // 0-100
  category: "excelente" | "alta" | "media" | "alto-riesgo";
  label: string;
  color: string;
  breakdown: {
    descuento: number;
    rentabilidad: number;
    liquidez: number;
    riesgoLegal: number;
  };
}

export function calculateOpportunityScore(params: OpportunityScoreParams): OpportunityScoreResult {
  const liquidezScore = params.zoneLiquidity === "alta" ? 90 : params.zoneLiquidity === "media" ? 60 : 30;
  const rentabilidadScore = Math.min((params.rentalYield ?? 0) * 10, 100);
  const descuentoScore = Math.min(params.discountPercent * 2, 100);
  const riesgoScore = params.legalRisk * 100;

  let occupationPenalty = 0;
  if (params.isOccupied) occupationPenalty = 10;

  const score = Math.max(0, Math.min(100, Math.round(
    (descuentoScore * 0.40) +
    (rentabilidadScore * 0.30) +
    (liquidezScore * 0.20) -
    (riesgoScore * 0.10) -
    occupationPenalty
  )));

  const category = score >= 90 ? "excelente" : score >= 70 ? "alta" : score >= 50 ? "media" : "alto-riesgo";
  const labels: Record<typeof category, string> = {
    excelente: "Oportunidad excelente",
    alta: "Oportunidad alta",
    media: "Oportunidad media",
    "alto-riesgo": "Alto riesgo",
  };
  const colors: Record<typeof category, string> = {
    excelente: "text-[hsl(142,71%,45%)]",
    alta: "text-accent",
    media: "text-[hsl(48,90%,50%)]",
    "alto-riesgo": "text-destructive",
  };

  return {
    score,
    category,
    label: labels[category],
    color: colors[category],
    breakdown: {
      descuento: Math.round(descuentoScore * 0.40),
      rentabilidad: Math.round(rentabilidadScore * 0.30),
      liquidez: Math.round(liquidezScore * 0.20),
      riesgoLegal: Math.round(riesgoScore * 0.10),
    },
  };
}

// ─── 5. CALCULADORA DE RENTABILIDAD ───
export interface InvestmentCalcParams {
  purchasePrice: number;
  reformCosts: number;
  taxes: number;  // total impuestos + gastos
  monthlyRent: number;
  annualExpenses?: number; // comunidad, IBI, seguro...
}

export interface InvestmentCalcResult {
  totalInvestment: number;
  grossYield: number;
  netYield: number;
  roi: number;
  monthlyNetIncome: number;
  paybackYears: number;
}

export function calculateInvestmentReturns(params: InvestmentCalcParams): InvestmentCalcResult {
  const totalInvestment = params.purchasePrice + params.reformCosts + params.taxes;
  const annualRent = params.monthlyRent * 12;
  const annualExpenses = params.annualExpenses ?? 0;
  const netRent = annualRent - annualExpenses;

  const grossYield = totalInvestment > 0 ? (annualRent / totalInvestment) * 100 : 0;
  const netYield = totalInvestment > 0 ? (netRent / totalInvestment) * 100 : 0;
  const roi = totalInvestment > 0 ? ((netRent) / totalInvestment) * 100 : 0;
  const monthlyNetIncome = netRent / 12;
  const paybackYears = netRent > 0 ? totalInvestment / netRent : Infinity;

  return {
    totalInvestment: Math.round(totalInvestment),
    grossYield: Math.round(grossYield * 10) / 10,
    netYield: Math.round(netYield * 10) / 10,
    roi: Math.round(roi * 10) / 10,
    monthlyNetIncome: Math.round(monthlyNetIncome),
    paybackYears: Math.round(paybackYears * 10) / 10,
  };
}

// ─── AUTO-VALUATION FROM PROPERTY ───
export function autoValuateProperty(property: Property) {
  const zoneLiquidity = estimateZoneLiquidity(property.province);
  const marketValue = property.marketValue ?? property.price;
  const discount = marketValue > 0 ? ((marketValue - property.price) / marketValue) * 100 : 0;
  const legalRisk = property.judicialInfo?.judicializado ? 0.4 : 0.1;
  const isOccupied = property.occupancyStatus !== "libre";

  // Opportunity score
  const opportunityScore = calculateOpportunityScore({
    discountPercent: discount,
    rentalYield: property.profitability,
    zoneLiquidity,
    legalRisk,
    isOccupied,
  });

  // Specific valuation based on sale type
  let cesionRemate: CesionRemateResult | null = null;
  let ocupado: OcupadoResult | null = null;
  let subasta: SubastaResult | null = null;

  if (property.saleType === "cesion-remate") {
    cesionRemate = valuateCesionRemate({
      marketValue,
      auctionAmount: property.price,
      outstandingDebt: property.debtInfo?.outstandingDebt ?? property.price * 1.2,
      zoneLiquidity,
      oppositionProbability: legalRisk,
    });
  }

  if (property.saleType === "ocupado" || isOccupied) {
    const occType: OccupationType =
      property.occupancyStatus === "ocupado-sin-derecho" ? "conflictiva" :
      property.occupancyStatus === "ocupado-con-derecho" ? "familiar" : "conocida";
    ocupado = valuateOcupado({
      marketValue,
      occupationType: occType,
      legalRisk,
    });
  }

  if (property.judicialInfo?.phase === "subasta") {
    subasta = valuateSubasta({
      marketValue,
      judicialAppraisalValue: marketValue * 0.9,
      debtAmount: property.debtInfo?.outstandingDebt ?? property.price,
      hasPriorCharges: false,
      isOccupied,
      isComplexProcedure: property.judicialInfo.phase === "subasta",
    });
  }

  return {
    opportunityScore,
    cesionRemate,
    ocupado,
    subasta,
    zoneLiquidity,
    discount: Math.round(discount),
  };
}
