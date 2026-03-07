import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";

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

export const properties: Property[] = [
  {
    id: "1",
    title: "Piso reformado en centro histórico",
    type: "vivienda",
    operation: "venta",
    saleType: "compraventa",
    price: 145000,
    marketValue: 180000,
    location: "Cádiz Centro",
    province: "Cádiz",
    community: "Andalucía",
    municipality: "Cádiz",
    postalCode: "11001",
    area: 95,
    bedrooms: 3,
    bathrooms: 2,
    description: "Magnífico piso completamente reformado en pleno centro histórico de Cádiz. Luminoso, con techos altos y acabados de primera calidad. Cocina equipada, suelos de mármol y carpintería de madera. A pocos metros de la Catedral y la playa de La Caleta.",
    features: ["Reformado", "Ascensor", "Terraza", "Aire acondicionado", "Amueblado"],
    images: [property1],
    profitability: 6.2,
    reference: "IKE-001",
    hasTerrace: true,
    hasElevator: true,
    year: 2022,
    lat: 36.5271,
    lng: -6.2886,
    catastralRef: "1234567AB1234N0001AB",
    occupancyStatus: "libre",
    isHabitualResidence: false,
    ownershipPercent: 100,
    isVPO: false,
  },
  {
    id: "2",
    title: "Casa tradicional andaluza con patio",
    type: "vivienda",
    operation: "venta",
    saleType: "npl",
    price: 185000,
    marketValue: 285000,
    location: "Jerez de la Frontera",
    province: "Cádiz",
    community: "Andalucía",
    municipality: "Jerez de la Frontera",
    postalCode: "11403",
    area: 180,
    bedrooms: 4,
    bathrooms: 3,
    description: "Preciosa casa tradicional andaluza con patio interior típico. Distribuida en dos plantas con amplias habitaciones, salón con chimenea y cocina rústica. Patio con fuente original y jardín trasero. Oportunidad de adquisición vía crédito hipotecario impagado (NPL) con alto descuento sobre valor de mercado.",
    features: ["Patio", "Jardín", "Chimenea", "Garaje", "Trastero"],
    images: [property2],
    profitability: 14.8,
    reference: "IKE-002",
    hasGarage: true,
    year: 1995,
    lat: 36.6850,
    lng: -6.1261,
    catastralRef: "2345678CD2345S0002CD",
    occupancyStatus: "ocupado-sin-derecho",
    isHabitualResidence: true,
    ownershipPercent: 100,
    isVPO: false,
    judicialInfo: {
      judicializado: true,
      phase: "ejecucion",
      court: "Juzgado de Primera Instancia Nº 3 de Jerez",
      proceedingNumber: "1234/2023",
    },
    debtInfo: {
      outstandingDebt: 220000,
      debtType: "Préstamo hipotecario",
      guaranteeType: "Hipoteca",
    },
  },
  {
    id: "3",
    title: "Villa moderna con piscina y vistas al mar",
    type: "vivienda",
    operation: "venta",
    saleType: "compraventa",
    price: 520000,
    marketValue: 620000,
    location: "Rota",
    province: "Cádiz",
    community: "Andalucía",
    municipality: "Rota",
    postalCode: "11520",
    area: 250,
    landArea: 500,
    bedrooms: 5,
    bathrooms: 4,
    description: "Espectacular villa contemporánea con piscina infinity y vistas panorámicas al mar. Diseño minimalista con grandes ventanales, domótica integrada, cocina de diseño italiano y jardín paisajístico. Garaje para dos vehículos y zona de barbacoa.",
    features: ["Piscina", "Vistas al mar", "Domótica", "Jardín", "Garaje doble", "Barbacoa"],
    images: [property3],
    profitability: 5.5,
    reference: "IKE-003",
    hasPool: true,
    hasGarage: true,
    hasTerrace: true,
    year: 2024,
    isNew: true,
    lat: 36.6213,
    lng: -6.3500,
    occupancyStatus: "libre",
    ownershipPercent: 100,
    isVPO: false,
  },
  {
    id: "4",
    title: "Local comercial en zona prime",
    type: "local",
    operation: "venta",
    saleType: "cesion-remate",
    price: 125000,
    marketValue: 195000,
    location: "Sevilla Centro",
    province: "Sevilla",
    community: "Andalucía",
    municipality: "Sevilla",
    postalCode: "41001",
    area: 120,
    description: "Local comercial en planta baja en una de las calles más transitadas de Sevilla. Diáfano, con escaparate de 8 metros lineales, suelo técnico y sistema de climatización. Oportunidad vía cesión de remate con descuento del 36% sobre valor de mercado.",
    features: ["Diáfano", "Escaparate", "Climatización", "Suelo técnico", "Salida de humos"],
    images: [property4],
    profitability: 18.3,
    reference: "IKE-004",
    year: 2018,
    lat: 37.3886,
    lng: -5.9823,
    catastralRef: "4567890GH4567N0004GH",
    occupancyStatus: "libre",
    ownershipPercent: 100,
    isVPO: false,
    judicialInfo: {
      judicializado: true,
      phase: "adjudicacion",
      court: "Juzgado de Primera Instancia Nº 7 de Sevilla",
      proceedingNumber: "567/2022",
    },
  },
  {
    id: "5",
    title: "Finca rústica con olivar",
    type: "terreno",
    operation: "venta",
    saleType: "compraventa",
    price: 89000,
    marketValue: 110000,
    location: "Carmona",
    province: "Sevilla",
    community: "Andalucía",
    municipality: "Carmona",
    postalCode: "41410",
    area: 15000,
    landArea: 15000,
    description: "Finca rústica de 15.000 m² con olivar en producción. Terreno llano con acceso por camino asfaltado, pozo propio y caseta de aperos. Excelente oportunidad de inversión con rentabilidad agrícola garantizada.",
    features: ["Olivar", "Pozo", "Acceso asfaltado", "Caseta", "Cercado"],
    images: [property5],
    profitability: 3.2,
    reference: "IKE-005",
    lat: 37.4711,
    lng: -5.6411,
    occupancyStatus: "libre",
    ownershipPercent: 100,
  },
  {
    id: "6",
    title: "Edificio residencial - Obra parada",
    type: "obra-parada",
    operation: "venta",
    saleType: "npl",
    price: 220000,
    marketValue: 380000,
    location: "Huelva",
    province: "Huelva",
    community: "Andalucía",
    municipality: "Huelva",
    postalCode: "21001",
    area: 800,
    landArea: 400,
    description: "Edificio residencial con estructura terminada y 8 viviendas proyectadas. Licencia de obra vigente. Oportunidad de adquisición vía NPL con descuento del 42% sobre valor de mercado. Ideal para promotores que buscan activos con alto potencial de revalorización.",
    features: ["Estructura terminada", "Licencia vigente", "8 viviendas", "Céntrico", "Proyecto incluido"],
    images: [property6],
    profitability: 22.5,
    reference: "IKE-006",
    lat: 37.2614,
    lng: -6.9447,
    occupancyStatus: "libre",
    ownershipPercent: 100,
    isVPO: false,
    judicialInfo: {
      judicializado: true,
      phase: "subasta",
      court: "Juzgado de Primera Instancia Nº 2 de Huelva",
      proceedingNumber: "890/2021",
    },
    debtInfo: {
      outstandingDebt: 450000,
      debtType: "Préstamo promotor",
      guaranteeType: "Hipoteca",
    },
  },
  {
    id: "7",
    title: "Apartamento primera línea de playa",
    type: "vivienda",
    operation: "alquiler",
    saleType: "compraventa",
    price: 850,
    location: "Chipiona",
    province: "Cádiz",
    community: "Andalucía",
    municipality: "Chipiona",
    postalCode: "11550",
    area: 75,
    bedrooms: 2,
    bathrooms: 1,
    description: "Bonito apartamento en primera línea de playa con terraza y vistas al mar. Completamente amueblado y equipado. Comunidad con piscina y jardines. Ideal para inversión en alquiler vacacional o residencia permanente.",
    features: ["Primera línea", "Terraza", "Piscina comunitaria", "Amueblado", "Vistas al mar"],
    images: [property1],
    reference: "IKE-007",
    hasPool: true,
    hasTerrace: true,
    year: 2010,
    lat: 36.7369,
    lng: -6.4370,
    occupancyStatus: "libre",
    ownershipPercent: 100,
  },
  {
    id: "8",
    title: "Nave industrial logística",
    type: "nave",
    operation: "venta",
    saleType: "cesion-remate",
    price: 190000,
    marketValue: 310000,
    location: "Dos Hermanas",
    province: "Sevilla",
    community: "Andalucía",
    municipality: "Dos Hermanas",
    postalCode: "41700",
    area: 500,
    landArea: 800,
    description: "Nave industrial en polígono logístico con excelente acceso a autovía. Altura libre de 8 metros, muelle de carga, oficinas en altillo y parking privado. Cesión de remate con descuento del 39% sobre valor de mercado.",
    features: ["Muelle de carga", "Oficinas", "Parking", "Altura 8m", "Acceso autovía"],
    images: [property4],
    profitability: 17.1,
    reference: "IKE-008",
    year: 2015,
    lat: 37.2831,
    lng: -5.9222,
    catastralRef: "8901234MN8901S0008MN",
    occupancyStatus: "ocupado-con-derecho",
    isHabitualResidence: false,
    ownershipPercent: 100,
    isVPO: false,
    judicialInfo: {
      judicializado: true,
      phase: "adjudicacion",
      court: "Juzgado de lo Mercantil Nº 1 de Sevilla",
      proceedingNumber: "234/2023",
    },
  },
  {
    id: "9",
    title: "Piso a reformar con gran potencial",
    type: "vivienda",
    operation: "venta",
    saleType: "ocupado",
    price: 38000,
    marketValue: 68000,
    location: "Granada Centro",
    province: "Granada",
    community: "Andalucía",
    municipality: "Granada",
    postalCode: "18001",
    area: 85,
    bedrooms: 3,
    bathrooms: 1,
    description: "Piso ocupado sin derecho en zona céntrica de Granada, cerca de la Gran Vía. Distribución clásica con posibilidad de redistribución. Gran oportunidad para inversores con experiencia en gestión de ocupación. Descuento del 44% sobre valor de mercado.",
    features: ["A reformar", "Céntrico", "Fachada rehabilitada", "Buen potencial"],
    images: [property1],
    profitability: 19.8,
    reference: "IKE-009",
    hasElevator: true,
    year: 1975,
    lat: 37.1760,
    lng: -3.5986,
    catastralRef: "9012345OP9012N0009OP",
    occupancyStatus: "ocupado-sin-derecho",
    isHabitualResidence: true,
    ownershipPercent: 100,
    isVPO: false,
    judicialInfo: {
      judicializado: false,
    },
  },
];

export const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: "vivienda", label: "Vivienda" },
  { value: "local", label: "Local" },
  { value: "oficina", label: "Oficina" },
  { value: "terreno", label: "Terreno" },
  { value: "nave", label: "Nave" },
  { value: "edificio", label: "Edificio" },
  { value: "obra-parada", label: "Obra parada" },
];

export const provinces = ["Cádiz", "Sevilla", "Huelva", "Granada", "Málaga", "Córdoba"];

export const communities = ["Andalucía"];
