import { useState, useEffect } from "react";
import { Loader2, Phone, Euro, User, Users, Building2, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostOfferGuidance from "@/components/PostOfferGuidance";

interface OfferFormProps {
  propertyId: string;
  propertyReference: string;
  descripcion?: string | null;
  precioOrientativo?: number;
  depositoPorcentaje?: number;
  comisionPorcentaje?: number;
  defaultName?: string;
  defaultEmail?: string;
  provincia?: string | null;
  comunidadAutonoma?: string | null;
}

const OfferForm = ({
  propertyId,
  propertyReference,
  descripcion,
  precioOrientativo = 0,
  depositoPorcentaje = 0,
  comisionPorcentaje = 0,
  defaultName = "",
  defaultEmail = "",
  provincia,
  comunidadAutonoma,
}: OfferFormProps) => {
  const [loading, setLoading] = useState(false);
  const [gestorName, setGestorName] = useState<string | null>(null);
  const [representacion, setRepresentacion] = useState<"propio" | "tercero">("propio");
  const [personaTipo, setPersonaTipo] = useState<"fisica" | "juridica">("fisica");
  const [alertas, setAlertas] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitted, setSubmitted] = useState<"offer" | "contact" | null>(null);

  const [form, setForm] = useState({
    nombre: defaultName.split(" ")[0] || "",
    apellidos: defaultName.split(" ").slice(1).join(" ") || "",
    telefono: "",
    email: defaultEmail,
    sociedad: "",
    nif: "",
    offerAmount: "",
    representedName: "",
    empresa: "",
    cif: "",
    mensaje: "",
  });

  // Fetch assigned gestor for this zone
  useEffect(() => {
    const fetchGestor = async () => {
      if (!provincia && !comunidadAutonoma) return;
      let query = supabase.from("gestores").select("nombre").eq("is_active", true);
      if (provincia) {
        query = query.contains("provincias", [provincia]);
      } else if (comunidadAutonoma) {
        query = query.contains("comunidades_autonomas", [comunidadAutonoma]);
      }
      const { data } = await query.limit(1).maybeSingle();
      if (data) setGestorName(data.nombre);
    };
    fetchGestor();
  }, [provincia, comunidadAutonoma]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  

  const handleSubmit = async (e: React.FormEvent, mode: "offer" | "contact") => {
    e.preventDefault();
    const fullName = `${form.nombre.trim()} ${form.apellidos.trim()}`.trim();

    if (!fullName || !form.email.trim() || !form.telefono.trim()) {
      toast.error("Por favor, completa los campos obligatorios");
      return;
    }

    let amount = 0;
    if (mode === "offer") {
      if (!form.offerAmount.trim()) {
        toast.error("Introduce el importe de tu oferta");
        return;
      }
      amount = parseFloat(form.offerAmount.replace(/[^\d.,]/g, "").replace(",", "."));
      if (isNaN(amount) || amount <= 0) {
        toast.error("Introduce un importe válido");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "offer" && amount > 0) {
        const { error } = await supabase.functions.invoke("submit-offer", {
          body: {
            propertyId,
            propertyReference,
            fullName,
            email: form.email.trim(),
            phone: form.telefono.trim(),
            offerAmount: amount,
          },
        });
        if (error) throw error;
      }

      await supabase.functions.invoke("auto-contact", {
        body: {
          lead_name: fullName,
          lead_email: form.email.trim(),
          lead_phone: form.telefono.trim(),
          channel: mode === "offer" ? "web_offer" : "web_contact",
          asset_id: propertyId,
          asset_reference: propertyReference,
          message: mode === "offer"
            ? `Oferta de ${amount.toLocaleString("es-ES")} € sobre activo ${propertyReference}`
            : form.mensaje.trim() || `Solicitud de información sobre activo ${propertyReference}`,
          sociedad: form.sociedad.trim() || null,
          nif: form.nif.trim() || null,
          acepta_alertas: alertas,
          acepta_marketing: marketing,
        },
      });

      toast.success(
        mode === "offer"
          ? "¡Oferta enviada! Tu gestor se pondrá en contacto."
          : "¡Solicitud enviada! Tu gestor te contactará en breve."
      );

      setForm({ nombre: "", apellidos: "", telefono: "", email: "", sociedad: "", nif: "", offerAmount: "", representedName: "", empresa: "", cif: "", mensaje: "" });
      setAlertas(false);
      setMarketing(false);
      setSubmitted(mode);

      window.dispatchEvent(new CustomEvent("ikesa-proactive-chat", {
        detail: {
          message: mode === "offer"
            ? `Acabo de enviar una oferta de ${amount.toLocaleString("es-ES")} € por el activo ${propertyReference}. ¿Cuáles son los siguientes pasos?`
            : `Estoy interesado en el activo ${propertyReference}. ¿Puedes darme más información?`,
          openChat: false,
        },
      }));
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Error al enviar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /* Shared contact fields */
  const ContactFields = () => (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-semibold text-foreground">Nombre*</Label>
        <Input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" required maxLength={50} className="mt-1" />
      </div>
      <div>
        <Label className="text-sm font-semibold text-foreground">Apellidos*</Label>
        <Input name="apellidos" value={form.apellidos} onChange={handleChange} placeholder="Tus apellidos" required maxLength={100} className="mt-1" />
      </div>
      <div>
        <Label className="text-sm font-semibold text-foreground">Teléfono*</Label>
        <Input type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Tu teléfono" required maxLength={20} className="mt-1" />
      </div>
      <div>
        <Label className="text-sm font-semibold text-foreground">Email*</Label>
        <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Tu email" required maxLength={255} className="mt-1" />
      </div>
      <div>
        <Label className="text-sm text-foreground">Sociedad o persona física inversora</Label>
        <Input name="sociedad" value={form.sociedad} onChange={handleChange} placeholder="Introduce el nombre" maxLength={200} className="mt-1" />
      </div>
      <div>
        <Label className="text-sm text-foreground">NIF</Label>
        <Input name="nif" value={form.nif} onChange={handleChange} placeholder="NIF Sociedad o Persona inversora" maxLength={20} className="mt-1" />
      </div>
    </div>
  );

  const [showLegalFull, setShowLegalFull] = useState(false);

  const ConsentCheckboxes = () => (
    <div className="border-t border-border pt-3 space-y-3">
      <div className="flex items-start gap-2">
        <Checkbox id="alertas" checked={alertas} onCheckedChange={(v) => setAlertas(v === true)} className="mt-0.5" />
        <Label htmlFor="alertas" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          Quiero recibir alertas de productos similares a este.
        </Label>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id="marketing" checked={marketing} onCheckedChange={(v) => setMarketing(v === true)} className="mt-0.5" />
        <Label htmlFor="marketing" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          Acepto recibir comunicaciones comerciales de IKESA.
          {showLegalFull && (
            <span className="block mt-1">
              IKESA es el responsable del tratamiento de tus datos personales. Puedes ejercer tus derechos en materia de protección de datos, inclusive revocar su consentimiento, dirigiéndote a{" "}
              <a href="mailto:protecciondatos@ikesa.es" className="text-primary underline hover:text-primary/80">protecciondatos@ikesa.es</a>
              , y consultar la información detallada sobre tratamiento de tus datos{" "}
              <a href="/politica-privacidad" className="text-primary underline hover:text-primary/80">aquí</a>.
            </span>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowLegalFull(!showLegalFull); }}
            className="text-primary underline hover:text-primary/80 ml-1"
          >
            {showLegalFull ? "Ver menos" : "Ver más"}
          </button>
        </Label>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header with gestor */}
      <div className="bg-primary p-5">
        <h3 className="font-heading text-lg font-bold text-primary-foreground text-center">
          Contacta con nosotros
        </h3>
        {gestorName && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-primary-foreground/70">Tu gestor asignado</p>
              <p className="text-sm font-semibold text-primary-foreground">{gestorName}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <Tabs defaultValue="offer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="offer" className="gap-1.5 text-xs">
              <Euro className="w-3.5 h-3.5" />
              Haz tu oferta
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5 text-xs">
              <Phone className="w-3.5 h-3.5" />
              Contactar
            </TabsTrigger>
          </TabsList>

          {/* ── OFFER TAB ── */}
          <TabsContent value="offer">
            <form onSubmit={(e) => handleSubmit(e, "offer")} className="space-y-4">
              {/* Price info */}
              {precioOrientativo > 0 && (
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Precio orientativo</p>
                  <p className="text-xl font-bold text-accent">{precioOrientativo.toLocaleString("es-ES")} €</p>
                  <div className="flex justify-center gap-4 mt-1.5">
                    {depositoPorcentaje > 0 && (
                      <span className="text-xs text-muted-foreground">Depósito: <strong className="text-foreground">{depositoPorcentaje}%</strong></span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Comisión: <strong className={comisionPorcentaje > 0 ? "text-foreground" : "text-green-600"}>
                        {comisionPorcentaje > 0 ? `${comisionPorcentaje}%` : "Exenta"}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Representación */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">¿Quién hace la oferta?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRepresentacion("propio")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${representacion === "propio" ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-muted-foreground border-border hover:border-accent/50"}`}>
                    <UserCheck className="w-3.5 h-3.5" /> Nombre propio
                  </button>
                  <button type="button" onClick={() => setRepresentacion("tercero")}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${representacion === "tercero" ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-muted-foreground border-border hover:border-accent/50"}`}>
                    <Users className="w-3.5 h-3.5" /> Representación
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setPersonaTipo("fisica")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${personaTipo === "fisica" ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-muted-foreground border-border hover:border-accent/50"}`}>
                  <User className="w-3.5 h-3.5" /> Persona física
                </button>
                <button type="button" onClick={() => setPersonaTipo("juridica")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${personaTipo === "juridica" ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-muted-foreground border-border hover:border-accent/50"}`}>
                  <Building2 className="w-3.5 h-3.5" /> Persona jurídica
                </button>
              </div>

              <div className="border-t border-border" />

              <ContactFields />

              {representacion === "tercero" && (
                <div>
                  <Label className="text-sm font-semibold text-foreground">Nombre del representado*</Label>
                  <Input name="representedName" value={form.representedName} onChange={handleChange} placeholder="Nombre del representado" required maxLength={100} className="mt-1" />
                </div>
              )}
              {personaTipo === "juridica" && (
                <>
                  <div>
                    <Label className="text-sm font-semibold text-foreground">Razón social*</Label>
                    <Input name="empresa" value={form.empresa} onChange={handleChange} placeholder="Razón social" required maxLength={200} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-foreground">CIF*</Label>
                    <Input name="cif" value={form.cif} onChange={handleChange} placeholder="CIF" required maxLength={20} className="mt-1" />
                  </div>
                </>
              )}

              {/* Offer amount */}
              <div>
                <Label className="text-sm font-semibold text-foreground">Importe de la oferta*</Label>
                <Input name="offerAmount" value={form.offerAmount} onChange={handleChange} placeholder="Introduce tu oferta (€)" required maxLength={20} className="mt-1" />
              </div>

              <ConsentCheckboxes />

              <Button type="submit" disabled={loading} className="w-full gap-2" size="lg">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Euro className="w-4 h-4" />}
                {loading ? "Enviando..." : "Enviar oferta"}
              </Button>
            </form>
          </TabsContent>

          {/* ── CONTACT TAB ── */}
          <TabsContent value="contact">
            <form onSubmit={(e) => handleSubmit(e, "contact")} className="space-y-4">
              <ContactFields />

              <div>
                <Label className="text-sm text-foreground">Mensaje</Label>
                <textarea
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  maxLength={1000}
                  rows={3}
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <ConsentCheckboxes />

              <Button type="submit" disabled={loading} className="w-full gap-2" size="lg">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                {loading ? "Enviando..." : "Contacta"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OfferForm;
