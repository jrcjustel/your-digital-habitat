import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().email("Email no válido").max(255),
  telefono: z.string().trim().max(20).optional(),
  mensaje: z.string().trim().min(1, "El mensaje es obligatorio").max(2000),
  servicio: z.string().default("general"),
});

const Contacto = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
    servicio: "general",
  });

  useEffect(() => {
    const srv = searchParams.get("servicio");
    if (srv) {
      // Map known service names to select values, fallback to presupuesto
      const map: Record<string, string> = {
        "Escrituras": "gestoria", "Catastro": "gestoria", "VPO / VPP": "gestoria",
        "Certificados": "gestoria", "Deudas IBI y CCPP": "gestoria", "Fiscalidad": "gestoria", "Plusvalía": "gestoria",
        "Informes Ocupacionales": "mediacion", "Mediación (Cash for Keys)": "mediacion",
        "Door Knocking": "mediacion", "Procedimientos Judiciales": "mediacion",
        "Comercialización Real Estate": "mediacion",
      };
      setForm(f => ({
        ...f,
        servicio: map[srv] || "presupuesto",
        mensaje: f.mensaje || `Me interesa el servicio: ${srv}`,
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("contact_requests" as any).insert(parsed.data as any);
    setLoading(false);

    if (error) {
      toast.error("Error al enviar. Inténtalo de nuevo.");
      return;
    }

    toast.success("Mensaje enviado correctamente. Te contactaremos pronto.");
    setForm({ nombre: "", email: "", telefono: "", mensaje: "", servicio: "general" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contacto | IKESA"
        description="Contacta con el equipo de IKESA para solicitar presupuesto personalizado o resolver cualquier duda sobre nuestros servicios."
        canonical="/contacto"
      />
      <Navbar />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
            {/* Left — Info */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-1 rounded-full bg-accent" />
                <p className="text-accent font-semibold text-sm tracking-widest uppercase">Contacto</p>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Hablemos de tu próxima operación
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                Cuéntanos qué necesitas y nuestro equipo te responderá con un presupuesto personalizado en menos de 24 horas.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Email</p>
                    <p className="text-muted-foreground text-sm">info@ikesa.es</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Teléfono</p>
                    <p className="text-muted-foreground text-sm">+34 900 000 000</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Oficina</p>
                    <p className="text-muted-foreground text-sm">Madrid, España</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servicio">Servicio de interés</Label>
                    <Select value={form.servicio} onValueChange={(v) => setForm({ ...form, servicio: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Consulta general</SelectItem>
                        <SelectItem value="gestoria">Gestoría</SelectItem>
                        <SelectItem value="mediacion">Mediación Legal</SelectItem>
                        <SelectItem value="presupuesto">Presupuesto personalizado</SelectItem>
                        <SelectItem value="inversion">Asesoría de inversión</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje">Mensaje *</Label>
                  <Textarea
                    id="mensaje"
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
                  <Send className="w-4 h-4" />
                  {loading ? "Enviando..." : "Enviar mensaje"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Al enviar aceptas nuestra{" "}
                  <a href="/politica-privacidad" className="underline">política de privacidad</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contacto;
