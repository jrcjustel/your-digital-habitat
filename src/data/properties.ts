import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";

export type PropertyType = "vivienda" | "local" | "oficina" | "terreno" | "nave" | "edificio" | "obra-parada";
export type OperationType = "venta" | "alquiler";

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  operation: OperationType;
  price: number;
  location: string;
  province: string;
  area: number;
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
}

export const properties: Property[] = [
  {
    id: "1",
    title: "Piso reformado en centro histórico",
    type: "vivienda",
    operation: "venta",
    price: 145000,
    location: "Cádiz Centro",
    province: "Cádiz",
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
  },
  {
    id: "2",
    title: "Casa tradicional andaluza con patio",
    type: "vivienda",
    operation: "venta",
    price: 285000,
    location: "Jerez de la Frontera",
    province: "Cádiz",
    area: 180,
    bedrooms: 4,
    bathrooms: 3,
    description: "Preciosa casa tradicional andaluza con patio interior típico. Distribuida en dos plantas con amplias habitaciones, salón con chimenea y cocina rústica. Patio con fuente original y jardín trasero. Zona tranquila y bien comunicada.",
    features: ["Patio", "Jardín", "Chimenea", "Garaje", "Trastero"],
    images: [property2],
    profitability: 4.8,
    reference: "IKE-002",
    hasGarage: true,
    year: 1995,
  },
  {
    id: "3",
    title: "Villa moderna con piscina y vistas al mar",
    type: "vivienda",
    operation: "venta",
    price: 520000,
    location: "Rota",
    province: "Cádiz",
    area: 250,
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
  },
  {
    id: "4",
    title: "Local comercial en zona prime",
    type: "local",
    operation: "venta",
    price: 195000,
    location: "Sevilla Centro",
    province: "Sevilla",
    area: 120,
    description: "Local comercial en planta baja en una de las calles más transitadas de Sevilla. Diáfano, con escaparate de 8 metros lineales, suelo técnico y sistema de climatización. Ideal para retail, hostelería o servicios profesionales.",
    features: ["Diáfano", "Escaparate", "Climatización", "Suelo técnico", "Salida de humos"],
    images: [property4],
    profitability: 8.3,
    reference: "IKE-004",
    year: 2018,
  },
  {
    id: "5",
    title: "Finca rústica con olivar",
    type: "terreno",
    operation: "venta",
    price: 89000,
    location: "Carmona",
    province: "Sevilla",
    area: 15000,
    description: "Finca rústica de 15.000 m² con olivar en producción. Terreno llano con acceso por camino asfaltado, pozo propio y caseta de aperos. Excelente oportunidad de inversión con rentabilidad agrícola garantizada.",
    features: ["Olivar", "Pozo", "Acceso asfaltado", "Caseta", "Cercado"],
    images: [property5],
    profitability: 3.2,
    reference: "IKE-005",
  },
  {
    id: "6",
    title: "Edificio en construcción - Obra parada",
    type: "obra-parada",
    operation: "venta",
    price: 380000,
    location: "Huelva",
    province: "Huelva",
    area: 800,
    description: "Edificio residencial con estructura terminada y 8 viviendas proyectadas. Licencia de obra vigente. Ubicación céntrica con todos los servicios a pie de calle. Oportunidad única para promotores e inversores que buscan activos singulares.",
    features: ["Estructura terminada", "Licencia vigente", "8 viviendas", "Céntrico", "Proyecto incluido"],
    images: [property6],
    profitability: 12.5,
    reference: "IKE-006",
  },
  {
    id: "7",
    title: "Apartamento con terraza en primera línea",
    type: "vivienda",
    operation: "alquiler",
    price: 850,
    location: "Chipiona",
    province: "Cádiz",
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
  },
  {
    id: "8",
    title: "Nave industrial logística",
    type: "nave",
    operation: "venta",
    price: 310000,
    location: "Dos Hermanas",
    province: "Sevilla",
    area: 500,
    description: "Nave industrial en polígono logístico con excelente acceso a autovía. Altura libre de 8 metros, muelle de carga, oficinas en altillo y parking privado. Apta para logística, almacenaje o actividad industrial ligera.",
    features: ["Muelle de carga", "Oficinas", "Parking", "Altura 8m", "Acceso autovía"],
    images: [property4],
    profitability: 7.1,
    reference: "IKE-008",
    year: 2015,
  },
  {
    id: "9",
    title: "Piso a reformar con gran potencial",
    type: "vivienda",
    operation: "venta",
    price: 68000,
    location: "Granada Centro",
    province: "Granada",
    area: 85,
    bedrooms: 3,
    bathrooms: 1,
    description: "Piso para reformar en zona céntrica de Granada, cerca de la Gran Vía. Distribución clásica con posibilidad de redistribución. Edificio con fachada rehabilitada. Gran oportunidad para inversores que buscan alta rentabilidad post-reforma.",
    features: ["A reformar", "Céntrico", "Fachada rehabilitada", "Buen potencial"],
    images: [property1],
    profitability: 9.8,
    reference: "IKE-009",
    hasElevator: true,
    year: 1975,
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
