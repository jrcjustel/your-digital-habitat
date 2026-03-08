import { useState } from "react";
import { Loader2, Euro, User, Users, Building2, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface OfferFormProps {
  propertyId: string;
  propertyReference: string;
  descripcion?: string | null;
  precioOrientativo?: number;
  depositoPorcentaje?: number;
  comisionPorcentaje?: number;
  defaultName?: string;
  defaultEmail?: string;
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
}: OfferFormProps) => {
  const [loading, setLoading] = useState(false);
  const [representacion, setRepresentacion] = useState<"propio" | "tercero">("propio");
  const [personaTipo, setPersonaTipo] = useState<"fisica" | "juridica">("fisica");
  const [form, setForm] = useState({
    fullName: defaultName,
    email: defaultEmail,
    phone: "",
    offerAmount: "",
    representedName: "",
    empresa: "",
    cif: "",
  });

  const minOffer = precioOrientativo > 0 ? Math.round(precioOrientativo * 0.95) : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.email.trim() || !form.offerAmount.trim()) {
      toast.error("Por favor, completa los campos obligatorios");
      return;
    }

    const amount = parseFloat(form.offerAmount.replace(/[^\d.,]/g, "").replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      toast.error("Introduce un importe válido");
      return;
    }

    if (minOffer > 0 && amount < minOffer) {
      toast.error(`La oferta mínima es de ${minOffer.toLocaleString("es-ES")} €`);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-offer", {
        body: {
          propertyId,
          propertyReference,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          offerAmount: amount,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("¡Oferta enviada correctamente! Nos pondremos en contacto contigo.");
      setForm({ fullName: defaultName, email: defaultEmail, phone: "", offerAmount: "", representedName: "", empresa: "", cif: "" });
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Error al enviar la oferta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-5">
        <h3 className="font-heading text-xl font-bold text-primary-foreground flex items-center gap-2">
          <Euro className="w-5 h-5" />
          ¡Haz tu oferta!
        </h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Asset description */}
        {descripcion && (
          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-accent/30 pl-3">
            {descripcion}
          </p>
        )}

        {/* Price + Deposit + Commission */}
        {(precioOrientativo > 0 || depositoPorcentaje > 0 || comisionPorcentaje > 0) && (
          <div className="space-y-3">
            {precioOrientativo > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Precio orientativo</span>
                <span className="text-xl font-bold text-accent">
                  {precioOrientativo.toLocaleString("es-ES")} €
                </span>
              </div>
            )}
            <div className="flex gap-3">
              {depositoPorcentaje > 0 && (
                <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Depósito</p>
                  <p className="text-sm font-bold text-foreground">{depositoPorcentaje.toLocaleString("es-ES", { minimumFractionDigits: 2 })}%</p>
                </div>
              )}
              {comisionPorcentaje > 0 && (
                <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Comisión</p>
                  <p className="text-sm font-bold text-foreground">{comisionPorcentaje.toLocaleString("es-ES", { minimumFractionDigits: 2 })}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-border" />

        {/* Representación */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">¿Quién hace la oferta?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRepresentacion("propio")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                representacion === "propio"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-secondary text-muted-foreground border-border hover:border-accent/50"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              En nombre propio
            </button>
            <button
              type="button"
              onClick={() => setRepresentacion("tercero")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                representacion === "tercero"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-secondary text-muted-foreground border-border hover:border-accent/50"
              }`}
            >
              <Users className="w-4 h-4" />
              Representación
            </button>
          </div>
        </div>

        {/* Persona tipo */}
        <div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPersonaTipo("fisica")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                personaTipo === "fisica"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-secondary text-muted-foreground border-border hover:border-accent/50"
              }`}
            >
              <User className="w-4 h-4" />
              Persona física
            </button>
            <button
              type="button"
              onClick={() => setPersonaTipo("juridica")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                personaTipo === "juridica"
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-secondary text-muted-foreground border-border hover:border-accent/50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Persona jurídica
            </button>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Nombre completo *"
            required
            maxLength={100}
          />
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email *"
            required
            maxLength={255}
          />
          <Input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Teléfono"
            maxLength={20}
          />

          {representacion === "tercero" && (
            <Input
              type="text"
              name="representedName"
              value={form.representedName}
              onChange={handleChange}
              placeholder="Nombre del representado *"
              required
              maxLength={100}
            />
          )}

          {personaTipo === "juridica" && (
            <>
              <Input
                type="text"
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                placeholder="Razón social *"
                required
                maxLength={200}
              />
              <Input
                type="text"
                name="cif"
                value={form.cif}
                onChange={handleChange}
                placeholder="CIF *"
                required
                maxLength={20}
              />
            </>
          )}

          {/* Offer amount */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">
              Importe de la oferta
            </label>
            <Input
              type="text"
              name="offerAmount"
              value={form.offerAmount}
              onChange={handleChange}
              placeholder={`Introduce tu oferta (€) *`}
              required
              maxLength={20}
            />
            {minOffer > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Introduce <span className="font-bold text-accent">{minOffer.toLocaleString("es-ES")} €</span> o más.
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Enviando..." : "Enviar oferta"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OfferForm;
