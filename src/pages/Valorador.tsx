import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, TrendingUp, TrendingDown, MapPin, Loader2, CheckCircle, AlertTriangle, Search, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { createBreadcrumbSchema } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  direccion: z.string().min(3, "Introduce una dirección válida").max(200),
  municipio: z.string().min(2, "Introduce el municipio").max(100),
  provincia: z.string().min(2, "Selecciona una provincia").max(100),
  codigo_postal: z.string().regex(/^\d{5}$/, "Código postal de 5 dígitos").optional().or(z.literal("")),
  tipo_inmueble: z.string().min(1, "Selecciona el tipo"),
  superficie_m2: z.coerce.number().min(10, "Mín. 10 m²").max(10000),
  habitaciones: z.coerce.number().min(0).max(20).optional(),
  banos: z.coerce.number().min(0).max(10).optional(),
  anio_construccion: z.coerce.number().min(1800).max(2026).optional(),
  estado: z.string().optional(),
  planta: z.coerce.number().min(-2).max(50).optional(),
  tiene_garaje: z.boolean().default(false),
  tiene_trastero: z.boolean().default(false),
  tiene_ascensor: z.boolean().default(false),
  nombre: z.string().min(2, "Introduce tu nombre").max(100),
  email: z.string().email("Email no válido").max(255),
  telefono: z.string().max(20).optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

type Valuation = {
  valor_min: number;
  valor_max: number;
  valor_medio: number;
  precio_m2: number;
  confianza: string;
  factores_positivos: string[];
  factores_negativos: string[];
  comentario: string;
};

const provincias = [
  "A Coruña","Álava","Albacete","Alicante","Almería","Asturias","Ávila","Badajoz","Barcelona","Burgos",
  "Cáceres","Cádiz","Cantabria","Castellón","Ciudad Real","Córdoba","Cuenca","Girona","Granada",
  "Guadalajara","Gipuzkoa","Huelva","Huesca","Illes Balears","Jaén","La Rioja","Las Palmas",
  "León","Lleida","Lugo","Madrid","Málaga","Murcia","Navarra","Ourense","Palencia","Pontevedra",
  "Salamanca","Santa Cruz de Tenerife","Segovia","Sevilla","Soria","Tarragona","Teruel","Toledo",
  "Valencia","Valladolid","Vizcaya","Zamora","Zaragoza",
];

const tiposInmueble = [
  { value: "piso", label: "Piso / Apartamento" },
  { value: "casa", label: "Casa / Chalet" },
  { value: "adosado", label: "Adosado / Pareado" },
  { value: "atico", label: "Ático" },
  { value: "duplex", label: "Dúplex" },
  { value: "estudio", label: "Estudio" },
  { value: "local", label: "Local comercial" },
  { value: "oficina", label: "Oficina" },
  { value: "terreno", label: "Terreno" },
  { value: "garaje", label: "Garaje" },
  { value: "trastero", label: "Trastero" },
  { value: "nave", label: "Nave industrial" },
];

const estados = [
  { value: "nuevo", label: "Obra nueva" },
  { value: "buen_estado", label: "Buen estado" },
  { value: "reformado", label: "Reformado" },
  { value: "a_reformar", label: "A reformar" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

type InputMode = "direccion" | "catastral";

const Valorador = () => {
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("direccion");
  const [refCatastral, setRefCatastral] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [catastroFilled, setCatastroFilled] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { tiene_garaje: false, tiene_trastero: false, tiene_ascensor: false },
  });

  const handleCatastroLookup = async () => {
    if (!refCatastral.trim()) {
      toast.error("Introduce una referencia catastral");
      return;
    }

    setLookingUp(true);
    setCatastroFilled(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("catastro-lookup", {
        body: { ref_catastral: refCatastral.trim() },
      });

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "No se encontraron datos");

      const d = data.data;

      if (d.direccion) setValue("direccion", d.direccion);
      if (d.municipio) setValue("municipio", d.municipio);
      if (d.provincia) {
        // Try to match province name
        const match = provincias.find(
          (p) => p.toLowerCase() === d.provincia.toLowerCase() ||
            d.provincia.toLowerCase().includes(p.toLowerCase()) ||
            p.toLowerCase().includes(d.provincia.toLowerCase())
        );
        if (match) setValue("provincia", match);
      }
      if (d.codigo_postal) setValue("codigo_postal", d.codigo_postal);
      if (d.tipo_inmueble) setValue("tipo_inmueble", d.tipo_inmueble);
      if (d.superficie_m2 && d.superficie_m2 > 0) setValue("superficie_m2", d.superficie_m2);
      if (d.anio_construccion) setValue("anio_construccion", d.anio_construccion);
      if (d.planta !== null && d.planta !== undefined) setValue("planta", d.planta);

      setCatastroFilled(true);
      toast.success("Datos del Catastro cargados correctamente");
    } catch (e: any) {
      toast.error(e.message || "Error consultando el Catastro");
    } finally {
      setLookingUp(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setValuation(null);

    try {
      const { data: res, error: fnError } = await supabase.functions.invoke("valorar-inmueble", { body: data });
      if (fnError) throw fnError;
      if (!res?.success) throw new Error(res?.error || "Error en la valoración");
      setValuation(res.valuation);
    } catch (e: any) {
      setError(e.message || "Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode: InputMode) => {
    setInputMode(mode);
    setCatastroFilled(false);
    setRefCatastral("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Valorar mi Inmueble Gratis — Tasación Online con IA | IKESA"
        description="Obtén una valoración gratuita e instantánea de tu inmueble con inteligencia artificial. Estimación de mercado basada en datos reales de transacciones en España."
        canonical="/valorar"
        keywords="valorar inmueble gratis, tasación online, cuánto vale mi casa, valoración vivienda, precio metro cuadrado, tasación IA"
        jsonLd={createBreadcrumbSchema([
          { name: "Inicio", url: "/" },
          { name: "Valorar Inmueble", url: "/valorar" },
        ])}
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Home className="w-4 h-4" />
            Valoración gratuita
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            ¿Cuánto vale tu inmueble?
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Obtén una estimación profesional del valor de mercado de tu propiedad en segundos. Gratis y sin compromiso.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {!valuation ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Input mode toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-accent" /> Identificación del inmueble
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Mode selector */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={inputMode === "direccion" ? "default" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => switchMode("direccion")}
                  >
                    <MapPin className="w-4 h-4" />
                    Por dirección
                  </Button>
                  <Button
                    type="button"
                    variant={inputMode === "catastral" ? "default" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => switchMode("catastral")}
                  >
                    <FileText className="w-4 h-4" />
                    Por referencia catastral
                  </Button>
                </div>

                {/* Catastral lookup */}
                {inputMode === "catastral" && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="ref_catastral">Referencia catastral</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="ref_catastral"
                          placeholder="Ej: 9872023VH5797S0001WX"
                          value={refCatastral}
                          onChange={(e) => setRefCatastral(e.target.value.toUpperCase())}
                          className="flex-1 font-mono"
                          maxLength={20}
                        />
                        <Button
                          type="button"
                          onClick={handleCatastroLookup}
                          disabled={lookingUp || !refCatastral.trim()}
                          className="gap-2 shrink-0"
                        >
                          {lookingUp ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                          {lookingUp ? "Consultando…" : "Consultar Catastro"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Puedes encontrarla en tu escritura, recibo del IBI o en{" "}
                        <a href="https://www.sedecatastro.gob.es" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                          sedecatastro.gob.es
                        </a>
                      </p>
                    </div>

                    {catastroFilled && (
                      <div className="flex items-center gap-2 text-sm text-accent bg-accent/10 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        Datos cargados del Catastro. Revisa y completa los campos necesarios.
                      </div>
                    )}
                  </div>
                )}

                {/* Address fields — always visible (filled manually or from Catastro) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input id="direccion" placeholder="Calle, número, piso…" {...register("direccion")} />
                    {errors.direccion && <p className="text-sm text-destructive mt-1">{errors.direccion.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="municipio">Municipio *</Label>
                    <Input id="municipio" placeholder="Ej: Madrid" {...register("municipio")} />
                    {errors.municipio && <p className="text-sm text-destructive mt-1">{errors.municipio.message}</p>}
                  </div>
                  <div>
                    <Label>Provincia *</Label>
                    <Select value={watch("provincia") || ""} onValueChange={(v) => setValue("provincia", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecciona provincia" /></SelectTrigger>
                      <SelectContent>
                        {provincias.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.provincia && <p className="text-sm text-destructive mt-1">{errors.provincia.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="codigo_postal">Código postal</Label>
                    <Input id="codigo_postal" placeholder="28001" {...register("codigo_postal")} />
                    {errors.codigo_postal && <p className="text-sm text-destructive mt-1">{errors.codigo_postal.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Características */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="w-5 h-5 text-accent" /> Características
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Tipo de inmueble *</Label>
                  <Select value={watch("tipo_inmueble") || ""} onValueChange={(v) => setValue("tipo_inmueble", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona tipo" /></SelectTrigger>
                    <SelectContent>
                      {tiposInmueble.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.tipo_inmueble && <p className="text-sm text-destructive mt-1">{errors.tipo_inmueble.message}</p>}
                </div>
                <div>
                  <Label htmlFor="superficie_m2">Superficie (m²) *</Label>
                  <Input id="superficie_m2" type="number" placeholder="80" {...register("superficie_m2")} />
                  {errors.superficie_m2 && <p className="text-sm text-destructive mt-1">{errors.superficie_m2.message}</p>}
                </div>
                <div>
                  <Label htmlFor="habitaciones">Habitaciones</Label>
                  <Input id="habitaciones" type="number" placeholder="3" {...register("habitaciones")} />
                </div>
                <div>
                  <Label htmlFor="banos">Baños</Label>
                  <Input id="banos" type="number" placeholder="2" {...register("banos")} />
                </div>
                <div>
                  <Label htmlFor="anio_construccion">Año construcción</Label>
                  <Input id="anio_construccion" type="number" placeholder="2005" {...register("anio_construccion")} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select onValueChange={(v) => setValue("estado", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona estado" /></SelectTrigger>
                    <SelectContent>
                      {estados.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="planta">Planta</Label>
                  <Input id="planta" type="number" placeholder="3" {...register("planta")} />
                </div>
                <div className="flex items-center gap-6 md:col-span-2 lg:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={watch("tiene_garaje")} onCheckedChange={(v) => setValue("tiene_garaje", !!v)} />
                    <span className="text-sm">Garaje</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={watch("tiene_trastero")} onCheckedChange={(v) => setValue("tiene_trastero", !!v)} />
                    <span className="text-sm">Trastero</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={watch("tiene_ascensor")} onCheckedChange={(v) => setValue("tiene_ascensor", !!v)} />
                    <span className="text-sm">Ascensor</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Datos de contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tus datos de contacto</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input id="nombre" placeholder="Tu nombre" {...register("nombre")} />
                  {errors.nombre && <p className="text-sm text-destructive mt-1">{errors.nombre.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" placeholder="600 000 000" {...register("telefono")} />
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculando valoración…
                </>
              ) : (
                "Obtener valoración gratuita"
              )}
            </Button>
          </form>
        ) : (
          /* Resultado */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-accent border-2">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-8">
                  <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Valor estimado de tu inmueble
                  </h2>
                  <p className="text-muted-foreground">Estimación basada en datos del mercado inmobiliario español</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Valor mínimo</p>
                    <p className="text-2xl font-bold text-foreground">{fmt(valuation.valor_min)}</p>
                  </div>
                  <div className="text-center p-6 bg-accent/10 rounded-xl border-2 border-accent">
                    <p className="text-sm text-accent font-semibold mb-1">Valor estimado</p>
                    <p className="text-3xl font-bold text-foreground">{fmt(valuation.valor_medio)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{fmt(valuation.precio_m2)}/m²</p>
                  </div>
                  <div className="text-center p-6 bg-secondary rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Valor máximo</p>
                    <p className="text-2xl font-bold text-foreground">{fmt(valuation.valor_max)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {valuation.factores_positivos?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-accent" /> Factores positivos
                      </h3>
                      <ul className="space-y-1">
                        {valuation.factores_positivos.map((f, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-accent mt-0.5">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {valuation.factores_negativos?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                        <TrendingDown className="w-4 h-4 text-destructive" /> Factores a considerar
                      </h3>
                      <ul className="space-y-1">
                        {valuation.factores_negativos.map((f, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-destructive mt-0.5">•</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {valuation.comentario && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-foreground italic">"{valuation.comentario}"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground text-sm">
                ¿Quieres una tasación más precisa? Nuestros expertos pueden ayudarte.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => { setValuation(null); setCatastroFilled(false); }}>
                  Valorar otro inmueble
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:info@ikesa.es">Contactar con un experto</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Valorador;
