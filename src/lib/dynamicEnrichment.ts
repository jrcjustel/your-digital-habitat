/**
 * Dynamic Enrichment Engine
 * Calculates investment intelligence metrics on-the-fly without modifying DB.
 */

// ─── Province liquidity (reusable lookup) ───
const PROVINCE_LIQUIDITY: Record<string, number> = {
  madrid: 95, barcelona: 92, málaga: 88, malaga: 88, valencia: 85, sevilla: 82,
  alicante: 80, bilbao: 78, vizcaya: 78, palma: 78, baleares: 78,
  cádiz: 72, cadiz: 72, granada: 70, zaragoza: 68, murcia: 65,
  las_palmas: 65, tenerife: 62, córdoba: 60, cordoba: 60, valladolid: 58,
  asturias: 55, cantabria: 52, toledo: 50, guadalajara: 48,
};

function getProvinceLiquidity(province?: string | null): number {
  if (!province) return 45;
  const key = province.toLowerCase().replace(/\s/g, "_");
  for (const [k, v] of Object.entries(PROVINCE_LIQUIDITY)) {
    if (key.includes(k)) return v;
  }
  return 45;
}

// ─── Judicial timeline estimates (months remaining) ───
const PHASE_MONTHS: Record<string, number> = {
  "pre-demanda": 24, "demanda": 18, "demanda presentada": 18,
  "ejecución": 12, "ejecucion": 12, "subasta": 6,
  "adjudicación": 4, "adjudicacion": 4, "posesión": 2, "posesion": 2,
};

function estimateLegalMonths(phase?: string | null): number {
  if (!phase) return 18;
  const key = phase.toLowerCase();
  for (const [k, v] of Object.entries(PHASE_MONTHS)) {
    if (key.includes(k)) return v;
  }
  return 18;
}

function estimatePossessionMonths(
  phase?: string | null,
  occupied?: boolean,
  occupancyStatus?: string | null,
): number {
  const legalMonths = estimateLegalMonths(phase);
  let evictionMonths = 0;
  if (occupied) {
    const status = (occupancyStatus || "").toLowerCase();
    if (status.includes("sin") || status.includes("okupa")) evictionMonths = 12;
    else if (status.includes("con")) evictionMonths = 18;
    else evictionMonths = 15;
  }
  return legalMonths + evictionMonths;
}

// ─── Cost estimation ───
export interface AcquisitionCosts {
  itp: number;           // Impuesto Transmisiones Patrimoniales
  notary: number;
  registry: number;
  legal: number;
  eviction: number;
  reform: number;
  commission: number;
  total: number;
}

function estimateAcquisitionCosts(params: {
  price: number;
  marketValue: number;
  occupied?: boolean;
  commissionPct?: number;
  sqm?: number;
}): AcquisitionCosts {
  const { price, marketValue, occupied, commissionPct = 0, sqm = 0 } = params;
  const itp = Math.round(price * 0.08);
  const notary = Math.round(Math.max(300, price * 0.005));
  const registry = Math.round(Math.max(200, price * 0.003));
  const legal = Math.round(Math.max(1500, price * 0.02));
  const eviction = occupied ? Math.round(Math.max(3000, marketValue * 0.05)) : 0;
  const reform = sqm > 0 ? Math.round(sqm * 200) : Math.round(marketValue * 0.08);
  const commission = Math.round(price * (commissionPct / 100));
  const total = price + itp + notary + registry + legal + eviction + reform + commission;
  return { itp, notary, registry, legal, eviction, reform, commission, total };
}

// ─── Exit strategies ───
export interface ExitStrategy {
  key: "reventa" | "alquiler" | "cesion" | "reforma";
  label: string;
  roi: number;
  timeMonths: number;
  netProfit: number;
}

function calculateExitStrategies(
  totalInvestment: number,
  marketValue: number,
  possessionMonths: number,
  sqm?: number,
): ExitStrategy[] {
  const strategies: ExitStrategy[] = [];

  // Reventa
  const reventaNet = marketValue * 0.92 - totalInvestment;
  strategies.push({
    key: "reventa", label: "Reventa tras posesión",
    roi: totalInvestment > 0 ? Math.round((reventaNet / totalInvestment) * 1000) / 10 : 0,
    timeMonths: possessionMonths + 3, netProfit: Math.round(reventaNet),
  });

  // Alquiler
  const monthlyRent = sqm && sqm > 0 ? Math.round(sqm * 8) : Math.round(marketValue * 0.004);
  const annualRent = monthlyRent * 12;
  strategies.push({
    key: "alquiler", label: "Alquiler a largo plazo",
    roi: totalInvestment > 0 ? Math.round((annualRent / totalInvestment) * 1000) / 10 : 0,
    timeMonths: possessionMonths + 1, netProfit: Math.round(annualRent * 5 - totalInvestment),
  });

  // Cesión de posición
  const cesionNet = marketValue * 0.65 - totalInvestment * 0.5;
  strategies.push({
    key: "cesion", label: "Cesión de posición",
    roi: totalInvestment > 0 ? Math.round((cesionNet / (totalInvestment * 0.5)) * 1000) / 10 : 0,
    timeMonths: Math.round(possessionMonths * 0.4), netProfit: Math.round(cesionNet),
  });

  // Reforma y revalorización
  const reformedValue = marketValue * 1.3;
  const reformCost = totalInvestment + (sqm ? sqm * 400 : marketValue * 0.15);
  const reformNet = reformedValue * 0.92 - reformCost;
  strategies.push({
    key: "reforma", label: "Reforma y revalorización",
    roi: reformCost > 0 ? Math.round((reformNet / reformCost) * 1000) / 10 : 0,
    timeMonths: possessionMonths + 12, netProfit: Math.round(reformNet),
  });

  return strategies;
}

// ─── PUBLIC: Full enrichment result ───
export interface EnrichmentResult {
  // Financial
  discount: number;                // % discount vs market
  estimatedTotalInvestment: number;
  estimatedROI: number;            // % (reventa)
  costs: AcquisitionCosts;

  // Timelines
  legalTimelineMonths: number;
  possessionTimelineMonths: number;

  // Area intelligence
  liquidityScore: number;          // 0-100

  // Strategies
  exitStrategies: ExitStrategy[];
  bestStrategy: ExitStrategy;

  // Comparable
  pricePerSqm: number | null;
  marketPricePerSqm: number | null;
}

export interface EnrichmentInput {
  price: number;
  marketValue: number;
  sqm?: number;
  occupied?: boolean;
  occupancyStatus?: string | null;
  judicialPhase?: string | null;
  province?: string | null;
  commissionPct?: number;
}

export function enrichOpportunity(input: EnrichmentInput): EnrichmentResult {
  const { price, marketValue, sqm, occupied, occupancyStatus, judicialPhase, province, commissionPct } = input;

  const discount = marketValue > 0 ? Math.round((1 - price / marketValue) * 100) : 0;
  const legalTimelineMonths = estimateLegalMonths(judicialPhase);
  const possessionTimelineMonths = estimatePossessionMonths(judicialPhase, occupied, occupancyStatus);
  const liquidityScore = getProvinceLiquidity(province);

  const costs = estimateAcquisitionCosts({ price, marketValue, occupied, commissionPct, sqm });
  const exitStrategies = calculateExitStrategies(costs.total, marketValue, possessionTimelineMonths, sqm);
  const bestStrategy = exitStrategies.reduce((best, s) => s.roi > best.roi ? s : best, exitStrategies[0]);
  const estimatedROI = bestStrategy.roi;

  const pricePerSqm = sqm && sqm > 0 ? Math.round(price / sqm) : null;
  const marketPricePerSqm = sqm && sqm > 0 && marketValue > 0 ? Math.round(marketValue / sqm) : null;

  return {
    discount,
    estimatedTotalInvestment: costs.total,
    estimatedROI,
    costs,
    legalTimelineMonths,
    possessionTimelineMonths,
    liquidityScore,
    exitStrategies,
    bestStrategy,
    pricePerSqm,
    marketPricePerSqm,
  };
}
