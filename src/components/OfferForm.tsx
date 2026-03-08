import { useState, useEffect } from "react";
import { Loader2, Phone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const [form, setForm] = useState({
    nombre: defaultName.split(" ")[0] || "",
    apellidos: defaultName.split(" ").slice(1).join(" ") || "",
    telefono: "",
    email: defaultEmail,
    sociedad: "",
    nif: "",
    offerAmount: "",
  });
  const [alertas, setAlertas] = useState(false);
  const [marketing, setMarketing] = useState(false);

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
      if (data) {
        setGestorName(data.nombre);
      }
    };
    fetchGestor();
  }, [provincia, comunidadAutonoma]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const minOffer = precioOrientativo > 0 ? Math.round(precioOrientativo * 0.95) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = `${form.nombre.trim()} ${form.apellidos.trim()}`.trim();
    if (!fullName || !form.email.trim() || !form.telefono.trim()) {
      toast.error("Por favor, completa los campos obligatorios");
      return;
    }

    // If offer amount is provided, validate it
    let amount = 0;
    if (form.offerAmount.trim()) {
      amount = parseFloat(form.offerAmount.replace(/[^\d.,]/g, "").replace(",", "."));
      if (isNaN(amount) || amount <= 0) {
        toast.error("Introduce un importe válido");
        return;
      }
      if (minOffer > 0 && amount < minOffer) {
        toast.error(`La oferta mínima es de ${minOffer.toLocaleString("es-ES")} €`);
        return;
      }
    }

    setLoading(true);
    try {
      if (amount > 0) {
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

      // Auto-contact: notify assigned zone manager + AI response
      await supabase.functions.invoke("auto-contact", {
        body: {
          lead_name: fullName,
          lead_email: form.email.trim(),
          lead_phone: form.telefono.trim(),
          channel: amount > 0 ? "web_offer" : "web_contact",
          asset_id: propertyId,
          asset_reference: propertyReference,
          message: amount > 0
            ? `Oferta de ${amount.toLocaleString("es-ES")} € sobre activo ${propertyReference}`
            : `Solicitud de información sobre activo ${propertyReference}`,
          sociedad: form.sociedad.trim() || null,
          nif: form.nif.trim() || null,
          acepta_alertas: alertas,
          acepta_marketing: marketing,
        },
      });

      toast.success(
        amount > 0
          ? "¡Oferta enviada! Tu gestor se pondrá en contacto contigo."
          : "¡Solicitud enviada! Tu gestor te contactará en breve."
      );

      setForm({ nombre: "", apellidos: "", telefono: "", email: "", sociedad: "", nif: "", offerAmount: "" });
      setAlertas(false);
      setMarketing(false);

      // Trigger proactive AI chat
      const event = new CustomEvent("ikesa-proactive-chat", {
        detail: {
          message: amount > 0
            ? `Acabo de enviar una oferta de ${amount.toLocaleString("es-ES")} € por el activo ${propertyReference}. ¿Puedes darme información sobre los siguientes pasos?`
            : `Estoy interesado en el activo ${propertyReference}. ¿Puedes darme más información?`,
          openChat: false,
        },
      });
      window.dispatchEvent(event);
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Error al enviar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-5">
        <h3 className="font-heading text-xl font-bold text-primary-foreground text-center">
          Contacta con nosotros
        </h3>
        {gestorName && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">Tu gestor asignado</p>
              <p className="text-sm font-semibold text-primary-foreground">{gestorName}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Price info */}
        {precioOrientativo > 0 && (
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Precio orientativo</p>
            <p className="text-xl font-bold text-accent">
              {precioOrientativo.toLocaleString("es-ES")} €
            </p>
            {(depositoPorcentaje > 0 || comisionPorcentaje >= 0) && (
              <div className="flex justify-center gap-4 mt-2">
                {depositoPorcentaje > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Depósito: <strong className="text-foreground">{depositoPorcentaje}%</strong>
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  Comisión: <strong className={comisionPorcentaje > 0 ? "text-foreground" : "text-green-600"}>
                    {comisionPorcentaje > 0 ? `${comisionPorcentaje}%` : "Exenta"}
                  </strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-sm font-semibold text-foreground">Nombre*</Label>
            <Input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre inversor"
              required
              maxLength={50}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-foreground">Apellidos*</Label>
            <Input
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              placeholder="Tus apellidos inversor"
              required
              maxLength={100}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-foreground">Teléfono*</Label>
            <Input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Introduce tu teléfono inversor"
              required
              maxLength={20}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-foreground">Email*</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Introduce tu email inversor"
              required
              maxLength={255}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm text-foreground">Sociedad o persona física inversora</Label>
            <Input
              name="sociedad"
              value={form.sociedad}
              onChange={handleChange}
              placeholder="Introduce el nombre"
              maxLength={200}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm text-foreground">NIF</Label>
            <Input
              name="nif"
              value={form.nif}
              onChange={handleChange}
              placeholder="NIF Sociedad o Persona inversora"
              maxLength={20}
              className="mt-1"
            />
          </div>

          {/* Offer amount - optional */}
          {precioOrientativo > 0 && (
            <div>
              <Label className="text-sm font-semibold text-foreground">Importe de la oferta (opcional)</Label>
              <Input
                name="offerAmount"
                value={form.offerAmount}
                onChange={handleChange}
                placeholder={`Introduce tu oferta (€)`}
                maxLength={20}
                className="mt-1"
              />
              {minOffer > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Mín. recomendado: <span className="font-bold text-accent">{minOffer.toLocaleString("es-ES")} €</span>
                </p>
              )}
            </div>
          )}

          <div className="border-t border-border pt-3 space-y-3">
            {/* Alerts checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="alertas"
                checked={alertas}
                onCheckedChange={(v) => setAlertas(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="alertas" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Quiero recibir alertas de productos similares a este.
              </Label>
            </div>

            {/* Marketing checkbox */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="marketing"
                checked={marketing}
                onCheckedChange={(v) => setMarketing(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="marketing" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Acepto recibir comunicaciones comerciales de IKESA, incluso por medios digitales.
                IKESA es el responsable del tratamiento de tus datos personales. Puedes ejercer tus derechos en materia de protección de datos, inclusive revocar su consentimiento, dirigiéndote a{" "}
                <a href="mailto:protecciondatos@ikesa.es" className="text-primary underline hover:text-primary/80">
                  protecciondatos@ikesa.es
                </a>
                , y consultar la información detallada sobre tratamiento de tus datos{" "}
                <a href="/politica-privacidad" className="text-primary underline hover:text-primary/80">
                  aquí
                </a>.
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 mt-2"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
            {loading ? "Enviando..." : "Contacta"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OfferForm;
