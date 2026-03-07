import { useState } from "react";
import { Phone, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface OfferFormProps {
  propertyId: string;
  propertyReference: string;
}

const OfferForm = ({ propertyId, propertyReference }: OfferFormProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    offerAmount: "",
  });

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
      setForm({ fullName: "", email: "", phone: "", offerAmount: "" });
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Error al enviar la oferta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary rounded-2xl p-6 text-primary-foreground sticky top-24">
      <h3 className="font-heading text-xl font-bold mb-2">¡Haz tu oferta!</h3>
      <p className="text-sm text-primary-foreground/70 mb-5">
        Contacta con nuestro equipo para realizar una oferta por este activo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Nombre completo *"
          required
          maxLength={100}
          className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email *"
          required
          maxLength={255}
          className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Teléfono"
          maxLength={20}
          className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="text"
          name="offerAmount"
          value={form.offerAmount}
          onChange={handleChange}
          placeholder="Importe de tu oferta (€) *"
          required
          maxLength={20}
          className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-search rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Enviando..." : "Enviar oferta"}
        </button>
      </form>
      <div className="mt-5 pt-5 border-t border-primary-foreground/20 space-y-3">
        <a href="tel:+34956000000" className="flex items-center gap-3 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          <Phone className="w-4 h-4" /> +34 956 000 000
        </a>
        <a href="mailto:info@ikesa.net" className="flex items-center gap-3 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          <Mail className="w-4 h-4" /> info@ikesa.net
        </a>
      </div>
    </div>
  );
};

export default OfferForm;
