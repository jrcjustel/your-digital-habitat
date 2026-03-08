import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  FileSignature, Upload, ShieldCheck, Loader2, CheckCircle, CreditCard, User, Building2, MapPin, IdCard,
  Download, AlertTriangle, XCircle, ScanLine,
} from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";
import ikesaLogo from "@/assets/ikesa-logo-color.png";
import jsPDF from "jspdf";

interface NdaSigningFlowProps {
  user: SupaUser;
  onComplete: () => void;
}

interface ClientData {
  nombre_completo: string;
  nacionalidad: string;
  domicilio_localidad: string;
  domicilio_calle: string;
  dni: string;
  empresa: string;
  empresa_domicilio_localidad: string;
  empresa_domicilio_calle: string;
  empresa_nif: string;
  registro_mercantil: string;
  tomo: string;
  folio: string;
  seccion: string;
  hoja: string;
  cargo: string;
  notario_localidad: string;
  notario_nombre: string;
  escritura_dia: string;
  escritura_mes: string;
  escritura_ano: string;
  protocolo: string;
}

interface DniValidation {
  is_valid_front: boolean;
  is_valid_back: boolean;
  is_authentic: boolean;
  is_in_vigor: boolean | null;
  expiry_date: string | null;
  dni_matches: boolean | null;
  detected_number: string | null;
  detected_name: string | null;
  confidence: string;
  issues: string[];
  summary: string;
}

const INITIAL_DATA: ClientData = {
  nombre_completo: "",
  nacionalidad: "española",
  domicilio_localidad: "",
  domicilio_calle: "",
  dni: "",
  empresa: "",
  empresa_domicilio_localidad: "",
  empresa_domicilio_calle: "",
  empresa_nif: "",
  registro_mercantil: "",
  tomo: "",
  folio: "",
  seccion: "",
  hoja: "",
  cargo: "",
  notario_localidad: "",
  notario_nombre: "",
  escritura_dia: "",
  escritura_mes: "",
  escritura_ano: "",
  protocolo: "",
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const generateNdaPdf = (clientData: ClientData, isPersonaJuridica: boolean) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const addText = (text: string, options?: { bold?: boolean; size?: number; center?: boolean; indent?: number }) => {
    const size = options?.size || 10;
    const style = options?.bold ? "bold" : "normal";
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    const x = options?.center ? pageWidth / 2 : margin + (options?.indent || 0);
    const align = options?.center ? "center" : "left";
    const w = maxWidth - (options?.indent || 0);
    const lines = doc.splitTextToSize(text, w);
    if (y + lines.length * size * 0.4 > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(lines, x, y, { align } as any);
    y += lines.length * size * 0.4 + 2;
  };

  const addSpace = (h = 4) => { y += h; };

  addText("ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACIÓN", { bold: true, size: 14, center: true });
  addSpace(6);

  addText(`De una parte: D. JOSÉ RAMÓN JUSTEL CARBAYO, mayor de edad, con NIF 10202726-H, con domicilio a estos efectos calle De la Magnolia, 37, local 9, 11500, el Puerto de Santa María, Cádiz, en nombre y representación de 144INNOVA24H, SL, sociedad con domicilio social en Avenida José León de Carranza, nº 2, 11011 Cádiz; inscrita en el Registro Mercantil de Cádiz, al tomo 1942, folio 36 y hoja CA-39.017 y provista de Número de Identificación Fiscal B-72140007; actúa en calidad de Administrador Único, en adelante "IKESA".`);
  addSpace();

  let secondParty = `De otra parte: D./Dª. ${clientData.nombre_completo || "___"}, de nacionalidad ${clientData.nacionalidad || "___"}, mayor de edad, con domicilio a efectos de notificaciones en ${clientData.domicilio_localidad || "___"}, en C/Avd ${clientData.domicilio_calle || "___"} y con DNI ${clientData.dni || "___"}`;
  if (isPersonaJuridica) {
    secondParty += `, en nombre y representación de la mercantil denominada ${clientData.empresa || "___"}, domiciliada en ${clientData.empresa_domicilio_localidad || "___"}, en Calle ${clientData.empresa_domicilio_calle || "___"}, con NIF ${clientData.empresa_nif || "___"}; inscrita en el Registro Mercantil de ${clientData.registro_mercantil || "___"}, al Tomo ${clientData.tomo || "___"}, Folio ${clientData.folio || "___"}, Sección ${clientData.seccion || "___"}, Hoja ${clientData.hoja || "___"}, en su condición de ${clientData.cargo || "___"}`;
  }
  secondParty += `, en adelante "RECEPTOR DE LA INFORMACIÓN" o "PARTE RECEPTORA".`;
  addText(secondParty);
  addSpace(4);

  addText("EXPONEN", { bold: true, size: 12, center: true });
  addSpace();
  addText("I. Que ambas partes se reconocen capacidad jurídica suficiente para suscribir el presente documento.");
  addText("II. Que ambas partes desean desarrollar una relación de colaboración tendente a analizar cierta información facilitada por clientes de IKESA.");
  addText("III. Que para las PARTES es esencial y constituye necesario para cualquier tipo de gestión se asuman las obligaciones de secreto y confidencialidad respecto de la \"INFORMACIÓN\" a la que cada PARTE tenga acceso.");
  addSpace(4);

  addText("ACUERDAN", { bold: true, size: 12, center: true });
  addSpace();

  const clauses = [
    { title: "PRIMERO. – Información confidencial", text: "Se entiende por Información Confidencial toda información facilitada por IKESA a la PARTE RECEPTORA, incluyendo información técnica, financiera, operacional, comercial, de personal, de gestión o de otro tipo, así como cualquier diseño, proceso, procedimiento, código, base de datos, invención, know-how y secretos comerciales." },
    { title: "SEGUNDO. – Obligaciones de Confidencialidad", text: "Cada una de las PARTES deberá: limitar el acceso a la información; advertir de su naturaleza confidencial; adoptar medidas para su cumplimiento; proteger la información con diligencia razonable; utilizarla únicamente para la valoración del Proyecto; no revelarla a terceros." },
    { title: "TERCERO. – Excepciones", text: "Las restricciones no serán de aplicación cuando la información fuera de dominio público, obtenida legalmente de terceros, deba ser facilitada por disposición legal, o sea revelada con autorización escrita previa." },
    { title: "CUARTO. – Propiedad de la Información", text: "Toda la Información Confidencial revelada por IKESA será de su exclusiva propiedad." },
    { title: "QUINTO. – Personas con acceso", text: "La PARTE RECEPTORA se obliga a restringir la comunicación de la Información a las personas que deban necesariamente conocerla." },
    { title: "SEXTO. – Finalidad", text: "Toda la información será utilizada únicamente con la finalidad de analizar dicha información para presentar una oferta adecuada al tipo de producto." },
    { title: "SÉPTIMO. – Duración", text: "Las obligaciones permanecerán en vigor durante un periodo de veinticuatro (24) meses a partir de la fecha del presente Acuerdo." },
    { title: "OCTAVO. – Productos y Servicios competidores", text: "Este Acuerdo no afectará el derecho de las PARTES a desarrollar productos o servicios competidores." },
    { title: "NOVENO. – Carácter de la relación", text: "Las obligaciones vinculan a las PARTES y a sus respectivos sucesores legales." },
    { title: "DÉCIMO. – Protección de Datos", text: "En cumplimiento del RGPD y la LOPD, los datos serán tratados para el mantenimiento y ejecución del presente Acuerdo. Derechos: dpo@ikesa.es." },
    { title: "UNDÉCIMO. – Indemnización", text: "La PARTE RECEPTORA deberá indemnizar a IKESA por todos los daños y perjuicios derivados del incumplimiento." },
    { title: "DUODÉCIMO. – Fuero y jurisdicción", text: "Ambas PARTES se someten expresamente a los Juzgados y Tribunales de Cádiz." },
  ];

  clauses.forEach((c) => {
    addText(c.title, { bold: true });
    addText(c.text);
    addSpace(2);
  });

  addSpace(4);
  const today = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  addText(`En prueba de conformidad, ambas PARTES suscriben el presente contrato en fecha ${today}.`, { center: true });

  doc.save(`NDA_IKESA_${clientData.nombre_completo.replace(/\s+/g, "_") || "documento"}.pdf`);
};

const NdaSigningFlow = ({ user, onComplete }: NdaSigningFlowProps) => {
  const [step, setStep] = useState<"data" | "review" | "dni" | "sign">("data");
  const [clientData, setClientData] = useState<ClientData>(INITIAL_DATA);
  const [isPersonaJuridica, setIsPersonaJuridica] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [dniFront, setDniFront] = useState<File | null>(null);
  const [dniBack, setDniBack] = useState<File | null>(null);
  const [dniFrontPreview, setDniFrontPreview] = useState<string | null>(null);
  const [dniBackPreview, setDniBackPreview] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [dniValidation, setDniValidation] = useState<DniValidation | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof ClientData, value: string) => {
    setClientData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileSelect = (file: File | null, side: "front" | "back") => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo no puede superar 10 MB");
      return;
    }
    // Only accept images
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se aceptan imágenes (JPG, PNG). No se admiten PDFs.");
      return;
    }
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setDniFront(file);
      setDniFrontPreview(url);
    } else {
      setDniBack(file);
      setDniBackPreview(url);
    }
    // Reset validation when files change
    setDniValidation(null);
  };

  const validateDni = async () => {
    if (!dniFront || !dniBack) return;
    setValidating(true);
    setDniValidation(null);

    try {
      const [frontB64, backB64] = await Promise.all([
        fileToBase64(dniFront),
        fileToBase64(dniBack),
      ]);

      const { data, error } = await supabase.functions.invoke("validate-dni", {
        body: {
          front_base64: frontB64,
          back_base64: backB64,
          dni_number: clientData.dni,
        },
      });

      if (error) throw error;
      setDniValidation(data as DniValidation);

      if (data.is_valid_front && data.is_valid_back && data.is_authentic) {
        if (data.is_in_vigor === false) {
          toast.error("El documento de identidad parece estar caducado.");
        } else {
          toast.success("Documento verificado correctamente.");
        }
      } else {
        toast.error("El documento no ha superado la verificación. Revisa las indicaciones.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error al verificar el documento. Inténtalo de nuevo.");
    } finally {
      setValidating(false);
    }
  };

  const canProceedData = clientData.nombre_completo && clientData.dni && clientData.domicilio_localidad && clientData.domicilio_calle;
  const canProceedDni = dniFront && dniBack && dniValidation &&
    dniValidation.is_valid_front && dniValidation.is_valid_back &&
    dniValidation.is_authentic && dniValidation.is_in_vigor !== false;
  const canSign = accepted && signatureText.length >= 3;

  const handleSign = async () => {
    setSigning(true);
    try {
      const timestamp = Date.now();
      const frontPath = `${user.id}/dni_anverso_${timestamp}.${dniFront!.name.split(".").pop()}`;
      const backPath = `${user.id}/dni_reverso_${timestamp}.${dniBack!.name.split(".").pop()}`;

      const [frontUpload, backUpload] = await Promise.all([
        supabase.storage.from("documents").upload(frontPath, dniFront!),
        supabase.storage.from("documents").upload(backPath, dniBack!),
      ]);

      if (frontUpload.error) throw new Error("Error subiendo DNI anverso: " + frontUpload.error.message);
      if (backUpload.error) throw new Error("Error subiendo DNI reverso: " + backUpload.error.message);

      const now = new Date().toISOString();
      await Promise.all([
        supabase.from("documents").insert({
          title: "DNI - Anverso",
          file_name: dniFront!.name,
          file_path: frontPath,
          file_size: dniFront!.size,
          mime_type: dniFront!.type,
          category: "identificacion",
          uploaded_by: user.id,
          is_confidential: true,
          description: dniValidation ? `Verificado por IA: ${dniValidation.summary}` : null,
        }),
        supabase.from("documents").insert({
          title: "DNI - Reverso",
          file_name: dniBack!.name,
          file_path: backPath,
          file_size: dniBack!.size,
          mime_type: dniBack!.type,
          category: "identificacion",
          uploaded_by: user.id,
          is_confidential: true,
        }),
      ]);

      const ndaContent = JSON.stringify({
        client_data: clientData,
        is_persona_juridica: isPersonaJuridica,
        signature: signatureText,
        signed_at: now,
        dni_validation: dniValidation,
        ip: "client-side",
        user_agent: navigator.userAgent,
      });

      const ndaPath = `${user.id}/nda_firmado_${timestamp}.json`;
      const ndaBlob = new Blob([ndaContent], { type: "application/json" });
      const ndaUpload = await supabase.storage.from("documents").upload(ndaPath, ndaBlob);
      if (ndaUpload.error) throw new Error("Error guardando NDA: " + ndaUpload.error.message);

      await supabase.from("documents").insert({
        title: "NDA - Acuerdo de Confidencialidad firmado",
        file_name: `nda_firmado_${timestamp}.json`,
        file_path: ndaPath,
        file_size: ndaBlob.size,
        mime_type: "application/json",
        category: "nda",
        uploaded_by: user.id,
        is_confidential: true,
        description: `Firmado electrónicamente por ${clientData.nombre_completo} el ${new Date().toLocaleDateString("es-ES")}`,
      });

      await supabase.from("profiles").update({
        nda_signed: true,
        nda_signed_at: now,
        display_name: clientData.nombre_completo,
        cif_nif: isPersonaJuridica ? clientData.empresa_nif : clientData.dni,
        empresa: isPersonaJuridica ? clientData.empresa : null,
        persona_tipo: isPersonaJuridica ? "juridica" : "fisica",
        ciudad: clientData.domicilio_localidad,
      } as any).eq("user_id", user.id);

      toast.success("NDA firmado correctamente. Bienvenido/a a IKESA.");
      onComplete();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al firmar el NDA");
    } finally {
      setSigning(false);
    }
  };

  const today = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 text-sm">
        {["Datos personales", "Revisar NDA", "Subir DNI", "Firmar"].map((label, i) => {
          const steps = ["data", "review", "dni", "sign"] as const;
          const isActive = steps.indexOf(step) >= i;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {i + 1}
              </div>
              <span className={`hidden sm:inline ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
              {i < 3 && <div className={`w-8 h-0.5 ${isActive ? "bg-accent" : "bg-muted"}`} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Client data */}
      {step === "data" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-accent" /> Datos del firmante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <Label className="text-sm">Tipo de persona:</Label>
              <div className="flex gap-2">
                <Button size="sm" variant={!isPersonaJuridica ? "default" : "outline"} onClick={() => setIsPersonaJuridica(false)}>
                  <User className="w-4 h-4 mr-1" /> Física
                </Button>
                <Button size="sm" variant={isPersonaJuridica ? "default" : "outline"} onClick={() => setIsPersonaJuridica(true)}>
                  <Building2 className="w-4 h-4 mr-1" /> Jurídica
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre completo *</Label>
                <Input value={clientData.nombre_completo} onChange={(e) => update("nombre_completo", e.target.value)} placeholder="D./Dª." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nacionalidad</Label>
                <Input value={clientData.nacionalidad} onChange={(e) => update("nacionalidad", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Localidad de domicilio *</Label>
                <Input value={clientData.domicilio_localidad} onChange={(e) => update("domicilio_localidad", e.target.value)} placeholder="Ej: Madrid" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Dirección (C/Avd.) *</Label>
                <Input value={clientData.domicilio_calle} onChange={(e) => update("domicilio_calle", e.target.value)} placeholder="Calle ejemplo, 1" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">DNI / NIE *</Label>
                <Input value={clientData.dni} onChange={(e) => update("dni", e.target.value)} placeholder="12345678A" />
              </div>
            </div>

            {isPersonaJuridica && (
              <>
                <Separator />
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Datos de la empresa
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Denominación social</Label>
                    <Input value={clientData.empresa} onChange={(e) => update("empresa", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">NIF empresa</Label>
                    <Input value={clientData.empresa_nif} onChange={(e) => update("empresa_nif", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Localidad domicilio social</Label>
                    <Input value={clientData.empresa_domicilio_localidad} onChange={(e) => update("empresa_domicilio_localidad", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Calle domicilio social</Label>
                    <Input value={clientData.empresa_domicilio_calle} onChange={(e) => update("empresa_domicilio_calle", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Registro Mercantil</Label>
                    <Input value={clientData.registro_mercantil} onChange={(e) => update("registro_mercantil", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Cargo en la empresa</Label>
                    <Input value={clientData.cargo} onChange={(e) => update("cargo", e.target.value)} placeholder="Ej: Administrador Único" />
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:col-span-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tomo</Label>
                      <Input value={clientData.tomo} onChange={(e) => update("tomo", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Folio</Label>
                      <Input value={clientData.folio} onChange={(e) => update("folio", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sección</Label>
                      <Input value={clientData.seccion} onChange={(e) => update("seccion", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Hoja</Label>
                      <Input value={clientData.hoja} onChange={(e) => update("hoja", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Notario (localidad)</Label>
                    <Input value={clientData.notario_localidad} onChange={(e) => update("notario_localidad", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Notario (nombre)</Label>
                    <Input value={clientData.notario_nombre} onChange={(e) => update("notario_nombre", e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep("review")} disabled={!canProceedData}>
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review NDA */}
      {step === "review" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileSignature className="w-5 h-5 text-accent" /> Acuerdo de Confidencialidad
              </CardTitle>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => generateNdaPdf(clientData, isPersonaJuridica)}
                >
                  <Download className="w-4 h-4" /> Descargar PDF
                </Button>
                <img src={ikesaLogo} alt="IKESA" className="h-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-background border border-border rounded-xl p-6 max-h-[60vh] overflow-y-auto text-sm leading-relaxed space-y-4 font-serif">
              <h2 className="text-center font-bold text-base text-foreground">ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACIÓN</h2>

              <p>
                De una parte: D. <strong>JOSÉ RAMÓN JUSTEL CARBAYO</strong>, mayor de edad, con NIF 10202726‑H, con domicilio a estos efectos calle De la Magnolia, 37, local 9, 11500, el Puerto de Santa María, Cádiz, en nombre y representación de <strong>144INNOVA24H, SL</strong>, sociedad con domicilio social en Avenida José León de Carranza, nº 2, 11011 Cádiz; inscrita en el Registro Mercantil de Cádiz, al tomo 1942, folio 36 y hoja CA‑39.017 y provista de Número de Identificación Fiscal B‑72140007; actúa en calidad de Administrador Único, según escritura de poder otorgada ante la Notario de Cádiz Dª. Esperanza Prados Velasco en fecha 23 de diciembre de 2020 con nº 2020/697/N/23/12/2020 de su protocolo, en adelante <strong>"IKESA"</strong>.
              </p>

              <p>
                De otra parte: D./Dª. <strong className="text-accent underline">{clientData.nombre_completo || "___"}</strong>, de nacionalidad <strong className="text-accent underline">{clientData.nacionalidad || "___"}</strong>, mayor de edad, con domicilio a efectos de notificaciones en <strong className="text-accent underline">{clientData.domicilio_localidad || "___"}</strong>, en C/Avd <strong className="text-accent underline">{clientData.domicilio_calle || "___"}</strong> y con DNI <strong className="text-accent underline">{clientData.dni || "___"}</strong>
                {isPersonaJuridica ? (
                  <>, en nombre y representación de la mercantil denominada <strong className="text-accent underline">{clientData.empresa || "___"}</strong>, debidamente constituida, domiciliada en <strong className="text-accent underline">{clientData.empresa_domicilio_localidad || "___"}</strong>, en Calle <strong className="text-accent underline">{clientData.empresa_domicilio_calle || "___"}</strong>, con NIF en vigor número <strong className="text-accent underline">{clientData.empresa_nif || "___"}</strong>; inscrita en el Registro Mercantil de <strong className="text-accent underline">{clientData.registro_mercantil || "___"}</strong>, al Tomo <strong className="text-accent underline">{clientData.tomo || "___"}</strong>, Folio <strong className="text-accent underline">{clientData.folio || "___"}</strong>, Sección <strong className="text-accent underline">{clientData.seccion || "___"}</strong>, Hoja <strong className="text-accent underline">{clientData.hoja || "___"}</strong>, en su condición de <strong className="text-accent underline">{clientData.cargo || "___"}</strong>; </>
                ) : ", "}
                en adelante <strong>"RECEPTOR DE LA INFORMACIÓN"</strong> o <strong>"PARTE RECEPTORA"</strong>.
              </p>

              <h3 className="font-bold text-foreground text-center mt-6">EXPONEN</h3>

              <p>I. Que ambas partes se reconocen capacidad jurídica suficiente para suscribir el presente documento.</p>
              <p>II. Que ambas partes desean desarrollar una relación de colaboración tendente a analizar cierta información facilitada por clientes de IKESA.</p>
              <p>III. Que para las PARTES es esencial y constituye necesario para cualquier tipo de gestión se asuman las obligaciones de secreto y confidencialidad respecto de la "INFORMACIÓN" (según se define más adelante) a la que cada PARTE tenga acceso, en los términos previstos en este acuerdo y los que se deriven de las exigencias de la buena fe contractual, a cuyo efecto,</p>

              <h3 className="font-bold text-foreground text-center mt-6">ACUERDAN</h3>

              <h4 className="font-bold text-foreground">PRIMERO. – Información confidencial</h4>
              <p>A los efectos del presente documento, se entiende por Información Confidencial (en lo sucesivo, la "INFORMACIÓN CONFIDENCIAL") la siguiente información facilitada por IKESA a la PARTE RECEPTORA:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Cualquier información, cualquiera que fuese su naturaleza (bien técnica, financiera, operacional, comercial, de personal, de gestión o de otro tipo), facilitada por una de las PARTES a la otra PARTE, en relación con el Proyecto, incluyendo a efectos meramente enunciativos, la relacionada con sus servicios, clientes, tarifas, precios, productos, planificación estratégica, estrategias de marketing, proyectos, información financiera, operaciones, relaciones con clientes, planes de negocio, e informes internos de rendimiento relacionados con actividades empresariales de cualquiera de las PARTES, así como aquella información que fuese generada a partir de la Información Confidencial;</li>
                <li>cualquier información, diseño, proceso, procedimiento, fórmula, o mejora, de carácter científico o técnico, con valor comercial y de carácter secreto sea o no patentable o registrable;</li>
                <li>toda clase de material, documentación, informes, datos, especificaciones, software informático, código base, código objeto, diagrama de flujo, bases de datos, invenciones, información, "know‑how", "show‑how" y secretos comerciales, de carácter confidencial y privado, sean o no patentables o registrables;</li>
                <li>todo dato de carácter personal con arreglo a su definición contenida en el art 4.1 del Reglamento Europeo de Protección de Datos Personales (2016/679).</li>
              </ol>

              <h4 className="font-bold text-foreground">SEGUNDO. – Obligaciones de Confidencialidad</h4>
              <p>Salvo autorización expresa y por escrito de la PARTE que haya suministrado la Información Confidencial, cada una de las PARTES deberá:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Limitar el acceso a la Información Confidencial recibida a aquellos administradores, directores, empleados, representantes o asesores, que a efectos de la adecuada valoración del Proyecto tengan necesidad de tener conocimiento de la misma;</li>
                <li>advertir a aquellos que tengan acceso de la naturaleza confidencial de la misma y de las obligaciones contraídas;</li>
                <li>adoptar las medidas oportunas para el cumplimiento de este Acuerdo;</li>
                <li>proteger la Información Confidencial recibida empleando un grado de diligencia razonable;</li>
                <li>utilizar la Información Confidencial recibida únicamente para la adecuada valoración del Proyecto;</li>
                <li>no revelar la Información Confidencial recibida a terceros;</li>
                <li>no revelar a terceros la existencia de conversaciones entre las PARTES en relación con el Proyecto.</li>
              </ol>

              <h4 className="font-bold text-foreground">TERCERO. – Excepciones a las obligaciones de Confidencialidad</h4>
              <p>Las restricciones no serán de aplicación cuando la información: a) fuera de dominio público; b) fuera obtenida legalmente de terceros sin obligación de confidencialidad; c) deba ser facilitada por disposición legal; d) sea revelada con autorización escrita previa.</p>

              <h4 className="font-bold text-foreground">CUARTO. – Propiedad de la Información</h4>
              <p>Toda la Información Confidencial revelada por IKESA será de su exclusiva propiedad. En ningún caso se entiende concesión de licencia o cesión de derechos de propiedad industrial o intelectual.</p>

              <h4 className="font-bold text-foreground">QUINTO. – Personas con acceso a la Información</h4>
              <p>La PARTE RECEPTORA se obliga a restringir la comunicación de la Información a las personas que deban necesariamente conocerla, respondiendo solidaria e ilimitadamente por los daños y perjuicios derivados del incumplimiento.</p>

              <h4 className="font-bold text-foreground">SEXTO. – Finalidad de la Información suministrada</h4>
              <p>Toda la información será utilizada únicamente con la finalidad de analizar dicha información para presentar una oferta adecuada al tipo de producto, con exclusión de cualquier otra finalidad.</p>

              <h4 className="font-bold text-foreground">SÉPTIMO. – Duración y extensión de la obligación de Confidencialidad</h4>
              <p>Las obligaciones permanecerán en vigor durante un periodo de veinticuatro (24) meses a partir de la fecha del presente Acuerdo.</p>

              <h4 className="font-bold text-foreground">OCTAVO. – Productos y Servicios competidores</h4>
              <p>Este Acuerdo no afectará el derecho de las PARTES a desarrollar productos o servicios, incluyendo aquellos que pudieran competir con los ofrecidos por la otra PARTE.</p>

              <h4 className="font-bold text-foreground">NOVENO. – Carácter de la relación</h4>
              <p>Las obligaciones vinculan a las PARTES y a sus respectivos sucesores legales. El presente Acuerdo no crea una asociación entre las PARTES.</p>

              <h4 className="font-bold text-foreground">DÉCIMO. – Protección de Datos</h4>
              <p>En cumplimiento del RGPD y la LOPD, los Firmantes quedan informados de que sus datos serán incorporados a un fichero con finalidad de mantenimiento y ejecución del presente Acuerdo. Los Firmantes podrán ejercitar sus derechos dirigiéndose a dpo@ikesa.es.</p>

              <h4 className="font-bold text-foreground">UNDÉCIMO. – Indemnización</h4>
              <p>La PARTE RECEPTORA deberá indemnizar a IKESA por todos los daños y perjuicios que se deriven del incumplimiento de las obligaciones contenidas en el presente Acuerdo.</p>

              <h4 className="font-bold text-foreground">DUODÉCIMO. – Fuero y jurisdicción</h4>
              <p>Para resolver cualquier cuestión derivada del presente Acuerdo, ambas PARTES se someten expresamente a los Juzgados y Tribunales de Cádiz.</p>

              <Separator className="my-6" />

              <p className="text-center text-muted-foreground">En prueba de conformidad, ambas PARTES suscriben y firman el presente contrato en fecha <strong>{today}</strong>.</p>

              <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="font-bold text-foreground">144INNOVA24H, S.L.</p>
                  <p className="text-xs text-muted-foreground mt-1">p.p.</p>
                  <div className="mt-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                    <p className="font-semibold text-accent italic text-lg">José Ramón Justel</p>
                    <p className="text-xs text-muted-foreground mt-1">Firmado electrónicamente</p>
                    <p className="text-xs text-muted-foreground">Administrador Único</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground">{clientData.nombre_completo || "___"}</p>
                  <p className="text-xs text-muted-foreground mt-1">p.p.</p>
                  <div className="mt-3 p-3 bg-muted rounded-lg border border-dashed border-muted-foreground/30 min-h-[60px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Pendiente de firma</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep("data")}>Volver</Button>
              <Button onClick={() => setStep("dni")}>Continuar a subir DNI</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: DNI Upload with AI validation */}
      {step === "dni" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IdCard className="w-5 h-5 text-accent" /> Documento de identidad
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sube una <strong>fotografía</strong> de tu DNI/NIE por ambas caras. Nuestro sistema verificará automáticamente que el documento es válido y está en vigor.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Front */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Anverso (cara frontal) *</Label>
                <input
                  ref={frontRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null, "front")}
                />
                {dniFrontPreview ? (
                  <div className="relative group">
                    <img src={dniFrontPreview} alt="DNI anverso" className="w-full h-40 object-cover rounded-lg border border-border" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button size="sm" variant="secondary" onClick={() => frontRef.current?.click()}>Cambiar</Button>
                    </div>
                    {dniValidation?.is_valid_front ? (
                      <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-500" />
                    ) : dniValidation && !dniValidation.is_valid_front ? (
                      <XCircle className="absolute top-2 right-2 w-5 h-5 text-destructive" />
                    ) : null}
                  </div>
                ) : (
                  <button
                    onClick={() => frontRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-accent/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Subir anverso</span>
                  </button>
                )}
              </div>

              {/* Back */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Reverso (cara trasera) *</Label>
                <input
                  ref={backRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null, "back")}
                />
                {dniBackPreview ? (
                  <div className="relative group">
                    <img src={dniBackPreview} alt="DNI reverso" className="w-full h-40 object-cover rounded-lg border border-border" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button size="sm" variant="secondary" onClick={() => backRef.current?.click()}>Cambiar</Button>
                    </div>
                    {dniValidation?.is_valid_back ? (
                      <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-500" />
                    ) : dniValidation && !dniValidation.is_valid_back ? (
                      <XCircle className="absolute top-2 right-2 w-5 h-5 text-destructive" />
                    ) : null}
                  </div>
                ) : (
                  <button
                    onClick={() => backRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-accent/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Subir reverso</span>
                  </button>
                )}
              </div>
            </div>

            {/* Validate button */}
            {dniFront && dniBack && !dniValidation && (
              <Button onClick={validateDni} disabled={validating} className="w-full gap-2" variant="secondary">
                {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                {validating ? "Verificando documento con IA..." : "Verificar documento de identidad"}
              </Button>
            )}

            {/* Validation results */}
            {dniValidation && (
              <div className={`rounded-xl border p-4 space-y-3 ${
                dniValidation.is_valid_front && dniValidation.is_valid_back && dniValidation.is_authentic && dniValidation.is_in_vigor !== false
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-destructive/30 bg-destructive/5"
              }`}>
                <div className="flex items-center gap-2">
                  {dniValidation.is_valid_front && dniValidation.is_valid_back && dniValidation.is_authentic && dniValidation.is_in_vigor !== false ? (
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                  <p className="text-sm font-semibold text-foreground">
                    {dniValidation.is_valid_front && dniValidation.is_valid_back && dniValidation.is_authentic && dniValidation.is_in_vigor !== false
                      ? "Documento verificado correctamente"
                      : "El documento no ha superado la verificación"}
                  </p>
                  <Badge variant="outline" className="ml-auto text-xs">
                    Confianza: {dniValidation.confidence}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">{dniValidation.summary}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {dniValidation.is_valid_front ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                    <span>Anverso válido</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {dniValidation.is_valid_back ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                    <span>Reverso válido</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {dniValidation.is_authentic ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                    <span>Documento auténtico</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {dniValidation.is_in_vigor === true ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> :
                     dniValidation.is_in_vigor === false ? <XCircle className="w-3.5 h-3.5 text-destructive" /> :
                     <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
                    <span>En vigor {dniValidation.expiry_date ? `(caduca: ${dniValidation.expiry_date})` : ""}</span>
                  </div>
                  {dniValidation.dni_matches !== null && (
                    <div className="flex items-center gap-1.5 col-span-2">
                      {dniValidation.dni_matches ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                      <span>Nº DNI coincide con datos introducidos {dniValidation.detected_number ? `(${dniValidation.detected_number})` : ""}</span>
                    </div>
                  )}
                </div>

                {dniValidation.issues.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-border">
                    <p className="text-xs font-semibold text-destructive">Problemas detectados:</p>
                    {dniValidation.issues.map((issue, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-destructive mt-0.5">•</span> {issue}
                      </p>
                    ))}
                  </div>
                )}

                {/* Allow re-validation */}
                {!(dniValidation.is_valid_front && dniValidation.is_valid_back && dniValidation.is_authentic && dniValidation.is_in_vigor !== false) && (
                  <Button size="sm" variant="outline" onClick={() => setDniValidation(null)} className="gap-2">
                    <ScanLine className="w-4 h-4" /> Subir nuevas imágenes y reintentar
                  </Button>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Formatos aceptados: JPG, PNG, WebP. Máximo 10 MB por archivo. Tus documentos se almacenan de forma segura y confidencial. La verificación se realiza mediante inteligencia artificial.
            </p>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("review")}>Volver</Button>
              <Button onClick={() => setStep("sign")} disabled={!canProceedDni}>Continuar a firmar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Sign */}
      {step === "sign" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="w-5 h-5 text-accent" /> Firma electrónica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Firmante:</span>
                <span className="font-medium text-foreground">{clientData.nombre_completo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DNI/NIE:</span>
                <span className="font-medium text-foreground">{clientData.dni}</span>
              </div>
              {isPersonaJuridica && clientData.empresa && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empresa:</span>
                  <span className="font-medium text-foreground">{clientData.empresa}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium text-foreground">{today}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DNI verificado:</span>
                <span className="font-medium text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Verificado por IA</span>
              </div>
              {dniValidation?.expiry_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Caducidad DNI:</span>
                  <span className="font-medium text-foreground">{dniValidation.expiry_date}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Escribe tu nombre completo para firmar electrónicamente *</Label>
              <Input
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder={clientData.nombre_completo}
                className="text-lg font-serif italic text-center h-14"
              />
              {signatureText && (
                <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <p className="font-serif italic text-2xl text-accent">{signatureText}</p>
                  <p className="text-xs text-muted-foreground mt-2">Vista previa de tu firma</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
              <Checkbox
                id="accept-nda"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
              />
              <label htmlFor="accept-nda" className="text-sm text-foreground cursor-pointer leading-tight">
                He leído y acepto el Acuerdo de Confidencialidad y No Divulgación de IKESA. Entiendo que la información proporcionada es confidencial y me comprometo a no divulgarla a terceros. Confirmo que los datos proporcionados son veraces y que el documento de identidad subido es auténtico.
              </label>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("dni")}>Volver</Button>
              <Button onClick={handleSign} disabled={!canSign || signing} className="gap-2">
                {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
                {signing ? "Firmando..." : "Firmar NDA"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NdaSigningFlow;
