import { FileText, Scale, Building2, BarChart3, ShieldCheck, CheckCircle2, Search, Handshake, DoorOpen, Gavel, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface IncluidoItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface ServiceItem {
  s: string;
  p: string;
}

export interface GestoriaGroup {
  emoji: string;
  cat: string;
  items: ServiceItem[];
}

export interface LegalGroup {
  icon: LucideIcon;
  cat: string;
  items: ServiceItem[];
}

export const incluidoItems: IncluidoItem[] = [
  { icon: FileText, title: "Análisis documental", desc: "Revisamos toda la documentación de la oportunidad y la presentamos al fondo." },
  { icon: Scale, title: "Análisis jurídico", desc: "Situación legal del activo: posición adquirida, implicaciones y riesgos." },
  { icon: Building2, title: "Análisis inmobiliario", desc: "Evaluación del activo vinculado para darte una visión completa." },
  { icon: BarChart3, title: "Análisis financiero", desc: "Rentabilidades, costes asociados y escenarios de salida." },
  { icon: ShieldCheck, title: "Proceso PBC", desc: "Te guiamos en Prevención de Blanqueo de Capitales." },
  { icon: CheckCircle2, title: "Cierre operación", desc: "Acompañamiento hasta la firma ante notario." },
];

export const gestoriaItems: GestoriaGroup[] = [
  { emoji: "🏠", cat: "Escrituras", items: [
    { s: "Compraventa", p: "380 €" }, { s: "Cancelación hipoteca", p: "350 €" },
    { s: "Obra nueva", p: "300–1.000 €" }, { s: "División horizontal", p: "350–2.000 €" },
    { s: "Herencias", p: "450–2.500 €" }, { s: "Donaciones", p: "250–700 €" },
  ]},
  { emoji: "📋", cat: "Catastro", items: [
    { s: "Cambio titularidad", p: "30 €" }, { s: "Subsanación ref. catastral", p: "75 €" },
  ]},
  { emoji: "🏗️", cat: "VPO / VPP", items: [
    { s: "Certificado precio máximo", p: "210 €" }, { s: "Autorización de venta", p: "210 €" },
  ]},
  { emoji: "📄", cat: "Certificados", items: [
    { s: "Tanteo y retracto", p: "175 €" }, { s: "CEE (Energético)", p: "210 €" },
  ]},
  { emoji: "💰", cat: "Deudas IBI y CCPP", items: [
    { s: "Obtención y pago IBI", p: "60 €" }, { s: "Deuda comunidad", p: "60 €" },
  ]},
  { emoji: "🧾", cat: "Fiscalidad", items: [
    { s: "Análisis fiscal", p: "120 €" }, { s: "Pago ITP / AJD", p: "120 €" },
    { s: "Sucesiones y donaciones", p: "300 €" }, { s: "No residentes (M. 211)", p: "120 €" },
  ]},
  { emoji: "📊", cat: "Plusvalía", items: [
    { s: "Comunicación Ayto.", p: "30 €" }, { s: "Estudio y cálculo", p: "120 €" },
  ]},
];

export const legalItems: LegalGroup[] = [
  { icon: Search, cat: "Informes Ocupacionales", items: [
    { s: "Informe ocupacional (1–5 uds.)", p: "250 €/ud" },
    { s: "Informe ocupacional (+5 uds.)", p: "200 €/ud" },
    { s: "Informe jurídico 24h (1–5)", p: "250 €/ud" },
    { s: "Informe jurídico 24h (+5)", p: "200 €/ud" },
    { s: "Due Diligence 48h", p: "Desde 600 €" },
    { s: "Pack Jurídico + Ocupacional", p: "400 €/ud" },
  ]},
  { icon: Handshake, cat: "Mediación (Cash for Keys)", items: [
    { s: "Resolución CFK (3–15 días)", p: "250 €/ud" },
    { s: "Mediación extrajudicial (21d)", p: "200 €/ud" },
    { s: "Negociación amistosa (0–3m)", p: "1.500 € + variable" },
  ]},
  { icon: DoorOpen, cat: "Door Knocking", items: [
    { s: "Informe + carta intenciones", p: "Consultar" },
  ]},
  { icon: Gavel, cat: "Procedimientos Judiciales", items: [
    { s: "Asistencia judicial completa", p: "2.950 €" },
    { s: "Personación + gestión CDR", p: "1.000 + 1.800 €" },
    { s: "Sucesión + homologación", p: "750 €" },
  ]},
  { icon: Briefcase, cat: "Comercialización Real Estate", items: [
    { s: "Intermediación en venta", p: "Consultar" },
  ]},
];
