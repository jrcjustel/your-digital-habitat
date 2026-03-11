export interface GlossaryEntry {
  term: string;
  short: string;
  long?: string;
}

const glossary: Record<string, GlossaryEntry> = {
  npl: {
    term: "NPL",
    short: "Non Performing Loan — crédito hipotecario impagado.",
    long: "El inversor compra el derecho de crédito al banco con un descuento significativo y se subroga como acreedor, pudiendo negociar con el deudor o ejecutar la garantía hipotecaria.",
  },
  cdr: {
    term: "CDR",
    short: "Cesión de Remate — derecho de adjudicación tras subasta.",
    long: "Cuando la subasta queda desierta o el ejecutante resulta mejor postor, éste puede ceder su derecho de adjudicación a un tercero. El inmueble se adquiere por debajo del valor de mercado.",
  },
  reo: {
    term: "REO",
    short: "Real Estate Owned — inmueble en propiedad de entidad financiera.",
    long: "Activos que han pasado a ser propiedad directa de bancos o fondos tras procesos de ejecución hipotecaria. Pueden estar libres u ocupados.",
  },
  "reo-ocupado": {
    term: "REO Ocupado",
    short: "Inmueble propiedad de entidad financiera con ocupantes sin título.",
    long: "El comprador adquiere la propiedad pero debe gestionar la recuperación de la posesión efectiva mediante procedimiento judicial o negociación directa.",
  },
  "reo-libre": {
    term: "REO Libre",
    short: "Inmueble propiedad de entidad financiera sin ocupantes.",
    long: "Activo disponible para entrega inmediata de llaves. Menor riesgo y menor descuento que un REO ocupado.",
  },
  dacion: {
    term: "Dación en pago",
    short: "Entrega del inmueble al acreedor para cancelar la deuda.",
    long: "El deudor entrega voluntariamente la propiedad al acreedor (banco o inversor) a cambio de la extinción total o parcial de la deuda pendiente. Evita la ejecución judicial.",
  },
  lanzamiento: {
    term: "Lanzamiento",
    short: "Acto judicial de desalojo y entrega de posesión al propietario.",
    long: "Resolución judicial que ordena el desalojo de los ocupantes y la entrega de la posesión efectiva del inmueble al legítimo propietario o adjudicatario.",
  },
  subasta: {
    term: "Subasta judicial",
    short: "Venta pública de un bien inmueble ordenada por un juzgado.",
    long: "Procedimiento judicial mediante el cual se pone a la venta un inmueble embargado. Se publica en el BOE y cualquier persona puede participar depositando el 5% del valor de tasación.",
  },
  itp: {
    term: "ITP",
    short: "Impuesto de Transmisiones Patrimoniales.",
    long: "Impuesto autonómico que grava la compraventa de inmuebles de segunda mano. Varía entre el 6% y el 11% según la comunidad autónoma.",
  },
  "nota-simple": {
    term: "Nota Simple",
    short: "Documento del Registro de la Propiedad con la situación jurídica del inmueble.",
    long: "Informa sobre el titular, cargas, gravámenes e hipotecas que pesan sobre la finca. Es esencial antes de cualquier operación de compra.",
  },
  servicer: {
    term: "Servicer",
    short: "Empresa que gestiona y comercializa activos inmobiliarios de entidades financieras.",
    long: "Compañías como Servihabitat, Aliseda, Hipoges o Anticipa que gestionan las carteras de inmuebles propiedad de bancos y fondos de inversión.",
  },
  "cesion-credito": {
    term: "Cesión de crédito",
    short: "Transmisión del derecho de cobro de una deuda a un tercero.",
    long: "El acreedor original (banco) vende el derecho de crédito hipotecario a un inversor. El comprador se subroga en todos los derechos del acreedor original.",
  },
  "fase-judicial": {
    term: "Fase judicial",
    short: "Etapa del procedimiento de ejecución hipotecaria.",
    long: "Indica en qué punto se encuentra el proceso legal: demanda, requerimiento de pago, subasta, adjudicación o posesión.",
  },
  ndg: {
    term: "NDG",
    short: "Número de gestión — identificador interno del crédito.",
    long: "Código alfanumérico que identifica de forma única un préstamo o crédito hipotecario dentro del sistema de gestión del servicer o la entidad financiera.",
  },
  "valor-mercado": {
    term: "Valor de mercado",
    short: "Precio estimado de venta del inmueble en condiciones normales.",
    long: "Valor de tasación o estimación basada en comparables de la zona. Sirve como referencia para calcular el descuento de la oportunidad de inversión.",
  },
  roi: {
    term: "ROI",
    short: "Return on Investment — rentabilidad sobre la inversión total.",
    long: "Se calcula como (Beneficio neto / Inversión total) × 100. En inversión distressed incluye precio de compra, impuestos, reforma y costes legales.",
  },
};

export default glossary;

export const getGlossaryEntry = (key: string): GlossaryEntry | undefined =>
  glossary[key.toLowerCase()];

export const glossaryKeys = Object.keys(glossary);
