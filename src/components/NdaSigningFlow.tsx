import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import {
  FileSignature, Upload, ShieldCheck, Loader2, CheckCircle, CreditCard, User, Building2, MapPin, IdCard,
} from "lucide-react";
import type { User as SupaUser } from "@supabase/supabase-js";
import ikesaLogo from "@/assets/ikesa-logo-color.png";

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
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setDniFront(file);
      setDniFrontPreview(url);
    } else {
      setDniBack(file);
      setDniBackPreview(url);
    }
  };

  const canProceedData = clientData.nombre_completo && clientData.dni && clientData.domicilio_localidad && clientData.domicilio_calle;
  const canProceedDni = dniFront && dniBack;
  const canSign = accepted && signatureText.length >= 3;

  const handleSign = async () => {
    setSigning(true);
    try {
      // 1. Upload DNI files
      const timestamp = Date.now();
      const frontPath = `${user.id}/dni_anverso_${timestamp}.${dniFront!.name.split(".").pop()}`;
      const backPath = `${user.id}/dni_reverso_${timestamp}.${dniBack!.name.split(".").pop()}`;

      const [frontUpload, backUpload] = await Promise.all([
        supabase.storage.from("documents").upload(frontPath, dniFront!),
        supabase.storage.from("documents").upload(backPath, dniBack!),
      ]);

      if (frontUpload.error) throw new Error("Error subiendo DNI anverso: " + frontUpload.error.message);
      if (backUpload.error) throw new Error("Error subiendo DNI reverso: " + backUpload.error.message);

      // 2. Create document records for DNI
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

      // 3. Create NDA document record with the signed data
      const ndaContent = JSON.stringify({
        client_data: clientData,
        is_persona_juridica: isPersonaJuridica,
        signature: signatureText,
        signed_at: now,
        ip: "client-side",
        user_agent: navigator.userAgent,
      });

      // Store NDA as a JSON blob
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

      // 4. Update profile
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
            {/* Persona type toggle */}
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
              <img src={ikesaLogo} alt="IKESA" className="h-8" />
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

      {/* Step 3: DNI Upload */}
      {step === "dni" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IdCard className="w-5 h-5 text-accent" /> Documento de identidad
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sube una copia de tu DNI/NIE por ambas caras. Es requisito obligatorio para completar el registro.
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
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null, "front")}
                />
                {dniFrontPreview ? (
                  <div className="relative group">
                    <img src={dniFrontPreview} alt="DNI anverso" className="w-full h-40 object-cover rounded-lg border border-border" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button size="sm" variant="secondary" onClick={() => frontRef.current?.click()}>Cambiar</Button>
                    </div>
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-500" />
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
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null, "back")}
                />
                {dniBackPreview ? (
                  <div className="relative group">
                    <img src={dniBackPreview} alt="DNI reverso" className="w-full h-40 object-cover rounded-lg border border-border" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button size="sm" variant="secondary" onClick={() => backRef.current?.click()}>Cambiar</Button>
                    </div>
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-500" />
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

            <p className="text-xs text-muted-foreground">
              Formatos aceptados: JPG, PNG, PDF. Máximo 10 MB por archivo. Tus documentos se almacenan de forma segura y confidencial.
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
            {/* Summary */}
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
                <span className="text-muted-foreground">DNI subido:</span>
                <span className="font-medium text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Anverso y reverso</span>
              </div>
            </div>

            {/* Signature input */}
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

            {/* Accept */}
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
