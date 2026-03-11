import { Gavel, CreditCard, Home, Building2 } from "lucide-react";

export interface AssetTypeStep {
  icon: typeof Gavel;
  label: string;
  detail: string;
}

export interface AssetTypeInfo {
  key: string;
  label: string;
  icon: typeof Gavel;
  color: string;
  bg: string;
  steps: AssetTypeStep[];
  risks: string[];
  typicalRoi: string;
  typicalTimeline: string;
  typicalDiscount: string;
  recommendedLevel: string;
  whatIs: string;
  howItWorks: string;
}

export const assetTypes: Record<string, AssetTypeInfo> = {
  npl: {
    key: "npl",
    label: "NPL — Compra de crédito",
    icon: CreditCard,
    color: "text-destructive",
    bg: "bg-destructive/10",
    whatIs: "Un NPL (Non Performing Loan) es un préstamo hipotecario impagado. Al comprar el crédito, te subrogas en la posición del banco como acreedor y adquieres el derecho de cobro y la garantía hipotecaria asociada.",
    howItWorks: "Compras el crédito impagado al banco o fondo con un descuento significativo (40-70% sobre la deuda). Puedes negociar con el deudor (dación en pago, quita) o ejecutar la hipoteca judicialmente para obtener el inmueble.",
    steps: [
      { icon: CreditCard, label: "Compra del crédito", detail: "Adquieres el NPL del banco/fondo con descuento" },
      { icon: Gavel, label: "Negocia o ejecuta", detail: "Dación en pago, quita o ejecución hipotecaria" },
      { icon: Home, label: "Obtén el inmueble", detail: "Adjudicación y toma de posesión" },
    ],
    risks: [
      "Proceso judicial largo (12-36 meses)",
      "El deudor puede oponerse a la ejecución",
      "El inmueble puede estar ocupado tras la adjudicación",
      "Costes legales y procesales adicionales",
    ],
    typicalRoi: "40% – 80%",
    typicalTimeline: "12 – 24 meses",
    typicalDiscount: "40% – 70% sobre deuda",
    recommendedLevel: "Avanzado / Profesional",
  },
  cesion: {
    key: "cesion",
    label: "Cesión de Remate (CDR)",
    icon: Gavel,
    color: "text-accent",
    bg: "bg-accent/10",
    whatIs: "La cesión de remate ocurre cuando la subasta queda desierta y el ejecutante (banco) se adjudica el inmueble. Este puede ceder su derecho de adjudicación a un tercero por un precio pactado, ante el Juez.",
    howItWorks: "El banco te cede su derecho de adjudicación. Pagas el precio de adjudicación más la prima de cesión. El auto de adjudicación se emite a tu nombre y escrituras directamente. Proceso más rápido que un NPL.",
    steps: [
      { icon: Gavel, label: "Firma de cesión", detail: "El banco cede su derecho de adjudicación" },
      { icon: Building2, label: "Posesión judicial", detail: "Lanzamiento si el inmueble está ocupado" },
      { icon: Home, label: "Reforma y venta", detail: "Acondicionamiento y salida al mercado" },
    ],
    risks: [
      "El inmueble puede estar ocupado (requiere lanzamiento)",
      "Posibles cargas registrales no canceladas",
      "Reforma necesaria en la mayoría de casos",
      "ITP sobre el valor de adjudicación",
    ],
    typicalRoi: "25% – 45%",
    typicalTimeline: "6 – 12 meses",
    typicalDiscount: "30% – 50% bajo mercado",
    recommendedLevel: "Intermedio / Avanzado",
  },
  ocupado: {
    key: "ocupado",
    label: "Inmueble Ocupado",
    icon: Home,
    color: "text-primary",
    bg: "bg-primary/10",
    whatIs: "Un inmueble ocupado es una propiedad que se vende sin posesión efectiva. El comprador adquiere la titularidad pero debe gestionar el desalojo de los ocupantes mediante procedimiento judicial o negociación directa.",
    howItWorks: "Compras el inmueble con un descuento significativo (35-55%) porque no tiene posesión. Inicias un procedimiento de desahucio o negocias la salida voluntaria. Tras recuperar la posesión, reformas y vendes o alquilas.",
    steps: [
      { icon: CreditCard, label: "Compra con descuento", detail: "Adquisición al 35-55% bajo valor de mercado" },
      { icon: Gavel, label: "Recupera la posesión", detail: "Desahucio judicial o negociación directa" },
      { icon: Home, label: "Reforma y salida", detail: "Acondicionamiento, venta o alquiler" },
    ],
    risks: [
      "Plazo de desahucio impredecible (6-30 meses)",
      "Ocupantes vulnerables pueden alargar el proceso",
      "Posibles daños al inmueble durante la ocupación",
      "Riesgo reputacional si la gestión no es ética",
    ],
    typicalRoi: "30% – 55%",
    typicalTimeline: "12 – 30 meses",
    typicalDiscount: "35% – 55% bajo mercado",
    recommendedLevel: "Avanzado / Profesional",
  },
};

export const didYouKnowFacts: Record<string, string[]> = {
  npl: [
    "El 65% de los NPL en España se resuelven por negociación, no por ejecución judicial.",
    "España es el tercer mayor mercado de NPL de Europa, tras Italia y Grecia.",
    "El plazo medio de resolución de un NPL hipotecario en España es de 18 meses.",
    "Los fondos internacionales han adquirido más de 200.000 M€ en NPL españoles desde 2012.",
  ],
  cesion: [
    "En una cesión de remate pagas el ITP sobre el precio de adjudicación, no sobre el valor de mercado.",
    "Más del 60% de las subastas judiciales en España quedan desiertas, generando oportunidades de cesión.",
    "La cesión de remate es el tipo de inversión distressed con menor plazo medio hasta la posesión.",
    "El auto de adjudicación por cesión se inscribe directamente a nombre del cesionario.",
  ],
  ocupado: [
    "El plazo medio de un proceso de desahucio en España es de 12-18 meses.",
    "El 40% de los inmuebles ocupados se resuelven por negociación directa sin llegar a juicio.",
    "Los inmuebles ocupados en zonas prime pueden ofrecer descuentos del 40-55% sobre mercado.",
    "La Ley de Vivienda 2023 ha introducido nuevos plazos y requisitos para los lanzamientos.",
  ],
};
