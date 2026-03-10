export interface Property {
  id: string;
  reference: string;
  title: string;
  description?: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  originalPrice?: number;
  pricePerM2?: number;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
  };
  characteristics: {
    surface: number;
    rooms?: number;
    bathrooms?: number;
    bedrooms?: number;
    floors?: number;
    elevator?: boolean;
    parking?: boolean;
    storage?: boolean;
    terrace?: boolean;
    garden?: boolean;
    pool?: boolean;
    airConditioning?: boolean;
    heating?: boolean;
    energyRating?: string;
    orientation?: string;
    yearBuilt?: number;
    condition?: PropertyCondition;
  };
  images: PropertyImage[];
  documents: PropertyDocument[];
  owner?: PropertyOwner;
  agent?: { id: string; name: string; email: string; phone: string };
  financialInfo?: { monthlyExpenses?: number; propertyTax?: number; communityFees?: number; mortgageInfo?: string };
  legalInfo?: { cadastralReference?: string; registryNumber?: string; legalStatus?: string; restrictions?: string[] };
  marketingInfo?: { featured: boolean; publishOnWeb: boolean; portalPublications: string[]; virtualTour?: string; videoUrl?: string };
  aiAnalysis?: { priceRecommendation?: number; marketScore?: number; sellProbability?: number; timeToSell?: number; competitiveAnalysis?: string; recommendations?: string[]; lastAnalyzed?: Date };
  createdAt: Date;
  updatedAt: Date;
  visits?: PropertyVisit[];
  leads?: string[];
  notes?: PropertyNote[];
}

export interface PropertyImage { id: string; url: string; thumbnail: string; title?: string; order: number; isMain: boolean; room?: string }
export interface PropertyDocument { id: string; name: string; type: DocumentType; url: string; size: number; uploadedAt: Date }
export interface PropertyOwner { id: string; name: string; email?: string; phone?: string; type: 'individual' | 'company' | 'bank' | 'judicial'; taxId?: string }
export interface PropertyVisit { id: string; date: Date; clientName: string; clientContact: string; agentId: string; feedback?: string; rating?: number; interested: boolean }
export interface PropertyNote { id: string; content: string; authorId: string; authorName: string; createdAt: Date; type: 'general' | 'commercial' | 'technical' | 'legal' }

export type PropertyType = 'apartment' | 'house' | 'penthouse' | 'studio' | 'duplex' | 'commercial' | 'office' | 'warehouse' | 'land' | 'garage' | 'industrial' | 'rural';
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'rented' | 'off-market' | 'judicial' | 'npl' | 'auction' | 'renovation' | 'pending-documentation';
export type PropertyCondition = 'new' | 'excellent' | 'good' | 'fair' | 'needs-renovation' | 'to-demolish';
export type DocumentType = 'deed' | 'energy-certificate' | 'cadastral' | 'registry' | 'insurance' | 'tax-document' | 'legal-report' | 'valuation' | 'other';

export const getPropertyTypeLabel = (type: PropertyType): string => {
  const labels: Record<PropertyType, string> = {
    apartment: 'Piso', house: 'Casa', penthouse: 'Ático', studio: 'Estudio', duplex: 'Dúplex',
    commercial: 'Local Comercial', office: 'Oficina', warehouse: 'Nave', land: 'Terreno',
    garage: 'Garaje', industrial: 'Industrial', rural: 'Rústica'
  };
  return labels[type];
};

export const getPropertyStatusLabel = (status: PropertyStatus): string => {
  const labels: Record<PropertyStatus, string> = {
    available: 'Disponible', reserved: 'Reservado', sold: 'Vendido', rented: 'Alquilado',
    'off-market': 'Fuera de Mercado', judicial: 'Judicial', npl: 'NPL', auction: 'Subasta',
    renovation: 'En Reforma', 'pending-documentation': 'Pendiente Documentación'
  };
  return labels[status];
};

export const getPropertyStatusColor = (status: PropertyStatus): string => {
  const colors: Record<PropertyStatus, string> = {
    available: 'bg-green-500', reserved: 'bg-yellow-500', sold: 'bg-muted-foreground',
    rented: 'bg-blue-500', 'off-market': 'bg-muted-foreground', judicial: 'bg-destructive',
    npl: 'bg-destructive', auction: 'bg-yellow-500', renovation: 'bg-accent',
    'pending-documentation': 'bg-yellow-500'
  };
  return colors[status];
};
