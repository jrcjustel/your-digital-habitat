export interface Lead {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  priority: LeadPriority;
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;
  nextFollowUpAt?: Date;
  preferredContact: ContactMethod;
  timeZone?: string;
  availableHours?: string;
  interestedProperties: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  propertyPreferences: {
    type: string[];
    locations: string[];
    characteristics: {
      minSurface?: number;
      maxSurface?: number;
      bedrooms?: number;
      bathrooms?: number;
      parking?: boolean;
    };
  };
  aiAnalysis?: {
    conversionProbability: number;
    qualificationScore: number;
    buyingUrgency: 'low' | 'medium' | 'high';
    financialCapacity: 'verified' | 'estimated' | 'unverified';
    recommendations: string[];
    nextBestAction: string;
  };
  assignedAgent?: {
    id: string;
    name: string;
    email: string;
  };
  activities: LeadActivity[];
  notes: LeadNote[];
  tags: string[];
}

export interface LeadActivity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}

export interface LeadNote {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: Date;
  createdBy: string;
  tags?: string[];
}

export type LeadSource =
  | 'website' | 'portal' | 'referral' | 'social_media'
  | 'email_campaign' | 'phone_call' | 'walk_in' | 'event'
  | 'advertisement' | 'idealista' | 'fotocasa' | 'pisos_com';

export type LeadStatus =
  | 'new' | 'contacted' | 'qualified' | 'meeting_scheduled'
  | 'viewing_scheduled' | 'proposal_sent' | 'negotiating'
  | 'closed_won' | 'closed_lost' | 'nurturing';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ContactMethod = 'email' | 'phone' | 'whatsapp' | 'any';

export type ActivityType =
  | 'call' | 'email' | 'meeting' | 'property_viewing'
  | 'proposal_sent' | 'document_signed' | 'note_added'
  | 'status_changed' | 'property_matched';

export interface Message {
  id: string;
  leadId: string;
  channel: MessageChannel;
  direction: 'inbound' | 'outbound';
  content: string;
  subject?: string;
  attachments?: MessageAttachment[];
  readAt?: Date;
  createdAt: Date;
  createdBy?: string;
  metadata?: Record<string, any>;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export type MessageChannel =
  | 'email' | 'whatsapp' | 'phone' | 'sms'
  | 'web_chat' | 'facebook' | 'instagram'
  | 'idealista' | 'fotocasa';

export const getLeadSourceLabel = (source: LeadSource): string => {
  const labels: Record<LeadSource, string> = {
    website: 'Web Oficial', portal: 'Portal Inmobiliario', referral: 'Referido',
    social_media: 'Redes Sociales', email_campaign: 'Campaña Email',
    phone_call: 'Llamada Telefónica', walk_in: 'Visita Oficina', event: 'Evento',
    advertisement: 'Publicidad', idealista: 'Idealista', fotocasa: 'Fotocasa',
    pisos_com: 'Pisos.com'
  };
  return labels[source] || source;
};

export const getLeadStatusLabel = (status: LeadStatus): string => {
  const labels: Record<LeadStatus, string> = {
    new: 'Nuevo', contacted: 'Contactado', qualified: 'Cualificado',
    meeting_scheduled: 'Reunión Programada', viewing_scheduled: 'Visita Programada',
    proposal_sent: 'Propuesta Enviada', negotiating: 'Negociando',
    closed_won: 'Cerrado Ganado', closed_lost: 'Cerrado Perdido', nurturing: 'En Seguimiento'
  };
  return labels[status] || status;
};

export const getLeadStatusColor = (status: LeadStatus): string => {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-500', contacted: 'bg-yellow-500', qualified: 'bg-green-500',
    meeting_scheduled: 'bg-purple-500', viewing_scheduled: 'bg-indigo-500',
    proposal_sent: 'bg-orange-500', negotiating: 'bg-pink-500',
    closed_won: 'bg-emerald-500', closed_lost: 'bg-red-500', nurturing: 'bg-gray-500'
  };
  return colors[status] || 'bg-gray-500';
};

export const getLeadPriorityColor = (priority: LeadPriority): string => {
  const colors: Record<LeadPriority, string> = {
    low: 'text-muted-foreground', medium: 'text-yellow-600',
    high: 'text-orange-600', urgent: 'text-red-600'
  };
  return colors[priority] || 'text-muted-foreground';
};
