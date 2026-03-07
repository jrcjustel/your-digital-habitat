export const BRAND_NAVY = [3, 54, 81] as const;
export const BRAND_BLUE = [63, 184, 234] as const;
export const BRAND_DARK = [30, 30, 30] as const;
export const BRAND_GRAY = [120, 120, 120] as const;
export const BRAND_LIGHT_BG = [240, 247, 252] as const;
export const WHITE = [255, 255, 255] as const;
export const GREEN = [34, 139, 34] as const;
export const RED = [200, 50, 50] as const;

export const PAGE_WIDTH = 210;
export const PAGE_HEIGHT = 297;
export const MARGIN = 18;
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export const operationTypeLabels: Record<string, string> = {
  "compra-credito": "Compra de Crédito",
  "cesion-remate": "Cesión de Remate",
  subasta: "Subasta",
  reo: "Activo REO",
};

export const propertyTypeLabels: Record<string, string> = {
  vivienda: "Vivienda", local: "Local comercial", oficina: "Oficina",
  terreno: "Terreno", nave: "Nave industrial", edificio: "Edificio",
  "obra-parada": "Obra parada", "Casa Pareada": "Casa Pareada",
};
