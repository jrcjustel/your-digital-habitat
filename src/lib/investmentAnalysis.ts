/**
 * IKESA — Motor de Análisis de Inversión Inmobiliaria
 * Algoritmo profesional para subastas BOE, NPL y cesiones de remate.
 */

// ─── TYPES ───

export type AssetType = "subasta" | "npl" | "cesion-remate" | "ocupado" | "libre";
export type JudicialPhaseType = "pre-demanda" | "demanda" | "ejecucion" | "subasta" | "adjudicacion" | "posesion";
export type OccupancyRisk = "libre" | "bajo" | "medio" | "alto" | "critico";
export type RiskLevel = "bajo" | "medio" | "alto";
export type TrafficLight = "verde" | "amarillo" | "rojo";
export type ExitStrategy = "reventa" | "alquiler" | "cesion" | "desarrollo";

export interface InvestmentInput {
  // Financieros
  salePrice: number;            // precio de venta o deuda
  marketValue: number;          // valor de mercado estimado
  judicialCosts: number;        // costes judiciales
  evictionCosts: number;        // coste de lanzamiento
  reformCosts: number;          // coste de reforma
  taxRate?: number;             // ITP % (default 8%)
  otherCosts?: number;          // notaría, registro, etc.

  // Temporales
  estimatedMonths: number;      // plazo para venta/alquiler

  // Riesgo
  occupancyRisk: OccupancyRisk; // riesgo ocupación
  judicialPhase: JudicialPhaseType;
  hasLitigations: boolean;
  hasPriorCharges: boolean;

  // Contexto
  assetType: AssetType;
  province: string;
  monthlyRentEstimate?: number; // alquiler mensual estimado
}

export interface InvestmentResult {
  // Core outputs
  recommendedPrice: number;
  roi: number;                  // %
  safetyMargin: number;         // %
  riskLevel: RiskLevel;
  trafficLight: TrafficLight;
  investmentScore: number;      // 0-100

  // Financials
  totalInvestment: number;
  grossProfit: number;
  netProfit: number;
  discount: number;             // % sobre mercado
  costBreakdown: CostBreakdown;

  // Strategies
  strategies: StrategyResult[];
  bestStrategy: ExitStrategy;

  // Risk
  riskScore: number;            // 0-100 (higher = riskier)
  riskFactors: RiskFactor[];

  // Sensitivity
  sensitivityData: SensitivityPoint[];

  // Explanation
  explanation: string;
  pros: string[];
  cons: string[];
}

export interface CostBreakdown {
  acquisition: number;
  taxes: number;
  judicial: number;
  eviction: number;
  reform: number;
  other: number;
  total: number;
}

export interface StrategyResult {
  strategy: ExitStrategy;
  label: string;
  roi: number;
  timeMonths: number;
  netProfit: number;
  feasibility: RiskLevel;
}

export interface RiskFactor {
  factor: string;
  impact: number;       // 0-30
  description: string;
}

export interface SensitivityPoint {
  discountPercent: number;
  roi: number;
  netProfit: number;
  safetyMargin: number;
}

// ─── CONSTANTS ───

const JUDICIAL_PHASE_RISK: Record<JudicialPhaseType, number> = {
  "pre-demanda": 10,
  "demanda": 15,
  "ejecucion": 20,
  "subasta": 12,
  "adjudicacion": 8,
  "posesion": 5,
};

const JUDICIAL_PHASE_MONTHS: Record<JudicialPhaseType, number> = {
  "pre-demanda": 24,
  "demanda": 18,
  "ejecucion": 12,
  "subasta": 6,
  "adjudicacion": 4,
  "posesion": 2,
};

const OCCUPANCY_RISK_SCORE: Record<OccupancyRisk, number> = {
  libre: 0,
  bajo: 10,
  medio: 25,
  alto: 40,
  critico: 55,
};

const OCCUPANCY_COST_FACTOR: Record<OccupancyRisk, number> = {
  libre: 0,
  bajo: 0.01,
  medio: 0.03,
  alto: 0.06,
  critico: 0.10,
};

const PROVINCE_LIQUIDITY: Record<string, number> = {
  Madrid: 95, Barcelona: 92, Málaga: 88, Valencia: 85, Sevilla: 82,
  Alicante: 80, Bilbao: 78, Palma: 78, Cádiz: 72, Granada: 70,
  Zaragoza: 68, Murcia: 65, Las_Palmas: 65,
};

// ─── CORE ALGORITHM ───

export function analyzeInvestment(input: InvestmentInput): InvestmentResult {
  // 1. Cost breakdown
  const taxRate = input.taxRate ?? 8;
  const taxes = input.salePrice * (taxRate / 100);
  const otherCosts = input.otherCosts ?? input.salePrice * 0.02;
  const occupancyCostAdj = input.marketValue * OCCUPANCY_COST_FACTOR[input.occupancyRisk];

  const costBreakdown: CostBreakdown = {
    acquisition: input.salePrice,
    taxes,
    judicial: input.judicialCosts,
    eviction: input.evictionCosts + occupancyCostAdj,
    reform: input.reformCosts,
    other: otherCosts,
    total: 0,
  };
  costBreakdown.total = costBreakdown.acquisition + costBreakdown.taxes + costBreakdown.judicial +
    costBreakdown.eviction + costBreakdown.reform + costBreakdown.other;

  const totalInvestment = costBreakdown.total;

  // 2. Risk calculation
  const riskFactors: RiskFactor[] = [];
  let riskScore = 0;

  // Judicial phase risk
  const jpRisk = JUDICIAL_PHASE_RISK[input.judicialPhase];
  riskScore += jpRisk;
  if (jpRisk > 10) riskFactors.push({ factor: "Fase judicial", impact: jpRisk, description: `Fase "${input.judicialPhase}" añade incertidumbre temporal y legal.` });

  // Occupancy risk
  const occRisk = OCCUPANCY_RISK_SCORE[input.occupancyRisk];
  riskScore += occRisk;
  if (occRisk > 0) riskFactors.push({ factor: "Ocupación", impact: occRisk, description: `Riesgo de ocupación ${input.occupancyRisk}: puede requerir procedimiento de lanzamiento.` });

  // Litigations
  if (input.hasLitigations) {
    riskScore += 20;
    riskFactors.push({ factor: "Litigios activos", impact: 20, description: "Existen litigios pendientes que pueden afectar plazos y costes." });
  }

  // Prior charges
  if (input.hasPriorCharges) {
    riskScore += 15;
    riskFactors.push({ factor: "Cargas previas", impact: 15, description: "Existen cargas registrales anteriores que podrían subsistir tras la adjudicación." });
  }

  // Debt exceeds market value
  if (input.salePrice > input.marketValue) {
    riskScore += 15;
    riskFactors.push({ factor: "Deuda > Mercado", impact: 15, description: "El precio/deuda supera el valor de mercado estimado." });
  }

  // Time risk
  const additionalMonths = JUDICIAL_PHASE_MONTHS[input.judicialPhase];
  const totalMonths = input.estimatedMonths + additionalMonths;
  if (totalMonths > 24) {
    const timeRisk = Math.min(15, Math.round((totalMonths - 24) * 0.5));
    riskScore += timeRisk;
    riskFactors.push({ factor: "Plazo largo", impact: timeRisk, description: `Plazo total estimado de ${totalMonths} meses supera los 2 años.` });
  }

  riskScore = Math.min(100, riskScore);
  const riskLevel: RiskLevel = riskScore >= 60 ? "alto" : riskScore >= 30 ? "medio" : "bajo";

  // 3. Recommended purchase price (with safety margin)
  const safetyFactor = riskLevel === "alto" ? 0.55 : riskLevel === "medio" ? 0.65 : 0.75;
  const recommendedPrice = Math.round(input.marketValue * safetyFactor - (costBreakdown.total - costBreakdown.acquisition));

  // 4. Profitability calculations
  const discount = input.marketValue > 0 ? ((input.marketValue - input.salePrice) / input.marketValue) * 100 : 0;
  const grossProfit = input.marketValue - totalInvestment;
  const netProfit = grossProfit * (1 - riskScore / 200); // risk-adjusted
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  const safetyMargin = input.marketValue > 0 ? ((input.marketValue - totalInvestment) / input.marketValue) * 100 : 0;

  // 5. Traffic light
  const trafficLight: TrafficLight =
    roi >= 20 && riskScore < 40 ? "verde" :
    roi >= 10 || riskScore < 60 ? "amarillo" : "rojo";

  // 6. Investment score (0-100)
  const discountScore = Math.min(discount * 1.5, 40);
  const roiScore = Math.min(Math.max(roi, 0) * 1.2, 30);
  const riskPenalty = riskScore * 0.3;
  const liquidityBonus = (getProvinceLiquidity(input.province) / 100) * 10;
  const investmentScore = Math.max(0, Math.min(100, Math.round(discountScore + roiScore - riskPenalty + liquidityBonus)));

  // 7. Exit strategies
  const strategies = calculateStrategies(input, totalInvestment, totalMonths);
  const bestStrategy = strategies.reduce((best, s) => s.roi > best.roi ? s : best, strategies[0]).strategy;

  // 8. Sensitivity analysis
  const sensitivityData = calculateSensitivity(input, costBreakdown);

  // 9. Explanation
  const { explanation, pros, cons } = generateExplanation(input, roi, riskLevel, discount, safetyMargin, totalMonths, bestStrategy);

  return {
    recommendedPrice: Math.max(0, recommendedPrice),
    roi: Math.round(roi * 10) / 10,
    safetyMargin: Math.round(safetyMargin * 10) / 10,
    riskLevel,
    trafficLight,
    investmentScore,
    totalInvestment: Math.round(totalInvestment),
    grossProfit: Math.round(grossProfit),
    netProfit: Math.round(netProfit),
    discount: Math.round(discount * 10) / 10,
    costBreakdown,
    strategies,
    bestStrategy,
    riskScore,
    riskFactors,
    sensitivityData,
    explanation,
    pros,
    cons,
  };
}

// ─── HELPERS ───

function getProvinceLiquidity(province: string): number {
  const normalized = province.replace(/\s/g, "_");
  for (const [key, val] of Object.entries(PROVINCE_LIQUIDITY)) {
    if (province.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return 50; // default
}

function calculateStrategies(input: InvestmentInput, totalInvestment: number, totalMonths: number): StrategyResult[] {
  const mv = input.marketValue;
  const strategies: StrategyResult[] = [];

  // Reventa
  const reventaProfit = mv * 0.92 - totalInvestment; // selling at 92% market (agent fees)
  const reventaROI = totalInvestment > 0 ? (reventaProfit / totalInvestment) * 100 : 0;
  strategies.push({
    strategy: "reventa",
    label: "Reventa tras posesión",
    roi: Math.round(reventaROI * 10) / 10,
    timeMonths: totalMonths + 3,
    netProfit: Math.round(reventaProfit),
    feasibility: reventaROI > 15 ? "bajo" : reventaROI > 5 ? "medio" : "alto",
  });

  // Alquiler
  if (input.monthlyRentEstimate && input.monthlyRentEstimate > 0) {
    const annualRent = input.monthlyRentEstimate * 12;
    const alquilerROI = totalInvestment > 0 ? (annualRent / totalInvestment) * 100 : 0;
    strategies.push({
      strategy: "alquiler",
      label: "Alquiler a largo plazo",
      roi: Math.round(alquilerROI * 10) / 10,
      timeMonths: totalMonths + 1,
      netProfit: Math.round(annualRent * 5 - totalInvestment), // 5 year horizon
      feasibility: input.occupancyRisk === "libre" || input.occupancyRisk === "bajo" ? "bajo" : "medio",
    });
  }

  // Cesión
  const cesionProfit = mv * 0.6 - input.salePrice; // quick flip at 60% market
  const cesionROI = input.salePrice > 0 ? (cesionProfit / input.salePrice) * 100 : 0;
  strategies.push({
    strategy: "cesion",
    label: "Cesión de posición",
    roi: Math.round(cesionROI * 10) / 10,
    timeMonths: Math.round(totalMonths * 0.5),
    netProfit: Math.round(cesionProfit),
    feasibility: cesionROI > 10 ? "bajo" : cesionROI > 0 ? "medio" : "alto",
  });

  // Desarrollo
  const developedValue = mv * 1.3;
  const devCost = totalInvestment + input.reformCosts * 2;
  const devProfit = developedValue * 0.92 - devCost;
  const devROI = devCost > 0 ? (devProfit / devCost) * 100 : 0;
  strategies.push({
    strategy: "desarrollo",
    label: "Reforma y revalorización",
    roi: Math.round(devROI * 10) / 10,
    timeMonths: totalMonths + 12,
    netProfit: Math.round(devProfit),
    feasibility: devROI > 20 ? "bajo" : devROI > 10 ? "medio" : "alto",
  });

  return strategies;
}

function calculateSensitivity(input: InvestmentInput, baseCosts: CostBreakdown): SensitivityPoint[] {
  const points: SensitivityPoint[] = [];
  for (let discPct = 10; discPct <= 70; discPct += 5) {
    const buyPrice = input.marketValue * (1 - discPct / 100);
    const totalInv = buyPrice + baseCosts.taxes * (buyPrice / input.salePrice) +
      baseCosts.judicial + baseCosts.eviction + baseCosts.reform + baseCosts.other;
    const profit = input.marketValue - totalInv;
    const roi = totalInv > 0 ? (profit / totalInv) * 100 : 0;
    const margin = input.marketValue > 0 ? ((input.marketValue - totalInv) / input.marketValue) * 100 : 0;
    points.push({
      discountPercent: discPct,
      roi: Math.round(roi * 10) / 10,
      netProfit: Math.round(profit),
      safetyMargin: Math.round(margin * 10) / 10,
    });
  }
  return points;
}

function generateExplanation(
  input: InvestmentInput, roi: number, risk: RiskLevel,
  discount: number, margin: number, months: number, bestStrategy: ExitStrategy
): { explanation: string; pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];

  if (discount > 40) pros.push(`Descuento del ${Math.round(discount)}% sobre valor de mercado — muy por debajo del precio medio de la zona.`);
  else if (discount > 25) pros.push(`Descuento del ${Math.round(discount)}% sobre mercado — buen punto de entrada.`);
  if (roi > 20) pros.push(`ROI esperado del ${Math.round(roi)}% — retorno atractivo para inversores profesionales.`);
  else if (roi > 10) pros.push(`ROI del ${Math.round(roi)}% — rentabilidad razonable para el nivel de riesgo.`);
  if (margin > 30) pros.push(`Margen de seguridad del ${Math.round(margin)}% — colchón amplio ante imprevistos.`);
  if (input.occupancyRisk === "libre") pros.push("Inmueble libre de ocupantes — posesión inmediata tras adjudicación.");
  if (input.monthlyRentEstimate && input.monthlyRentEstimate > 0) {
    const rentYield = input.monthlyRentEstimate * 12 / (input.salePrice || 1) * 100;
    if (rentYield > 6) pros.push(`Rentabilidad bruta por alquiler del ${Math.round(rentYield)}% — superior a la media del mercado español.`);
  }

  if (risk === "alto") cons.push("Nivel de riesgo alto — se recomienda asesoramiento legal especializado antes de proceder.");
  if (input.hasLitigations) cons.push("Litigios activos pueden alargar plazos e incrementar costes judiciales de forma impredecible.");
  if (input.hasPriorCharges) cons.push("Cargas previas registrales podrían subsistir y reducir el valor efectivo del activo.");
  if (months > 24) cons.push(`Plazo estimado de ${months} meses — la operación requiere paciencia y planificación financiera.`);
  if (input.occupancyRisk === "alto" || input.occupancyRisk === "critico") cons.push("Alto riesgo de ocupación — el proceso de lanzamiento puede ser largo y costoso.");
  if (discount < 20) cons.push("Descuento limitado sobre mercado — el margen de maniobra es reducido.");
  if (roi < 5) cons.push("ROI esperado bajo — considerar si compensa el riesgo y la inmovilización de capital.");

  const stratLabels: Record<ExitStrategy, string> = { reventa: "reventa", alquiler: "alquiler a largo plazo", cesion: "cesión de posición", desarrollo: "reforma y revalorización" };

  let explanation: string;
  if (roi >= 20 && risk === "bajo") {
    explanation = `Esta oportunidad presenta un perfil excepcional: un descuento del ${Math.round(discount)}% con riesgo controlado y un ROI esperado del ${Math.round(roi)}%. La estrategia óptima es la ${stratLabels[bestStrategy]}. Es una operación que combina seguridad y rentabilidad.`;
  } else if (roi >= 10 && risk !== "alto") {
    explanation = `Oportunidad interesante con un ROI del ${Math.round(roi)}% y un margen de seguridad del ${Math.round(margin)}%. El riesgo es ${risk} y la mejor estrategia identificada es la ${stratLabels[bestStrategy]}. Recomendamos verificar la documentación judicial antes de proceder.`;
  } else if (roi > 0) {
    explanation = `Oportunidad con rentabilidad moderada (ROI ${Math.round(roi)}%). El nivel de riesgo ${risk} y el plazo estimado de ${months} meses requieren un análisis detallado de la documentación. La estrategia más viable es la ${stratLabels[bestStrategy]}.`;
  } else {
    explanation = `Esta operación presenta un ROI negativo o marginal (${Math.round(roi)}%) dado el nivel de costes y riesgo. Recomendamos no proceder salvo que se consiga un precio significativamente inferior o se reduzcan los costes estimados.`;
  }

  return { explanation, pros, cons };
}
