import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPropertyTypeLabel, getPropertyStatusLabel, PropertyType, PropertyStatus } from "@/types/property";
import { ArrowLeft, Save, Camera, Upload } from "lucide-react";
import { toast } from "sonner";

const propertyTypes: PropertyType[] = ['apartment', 'house', 'penthouse', 'studio', 'duplex', 'commercial', 'office', 'warehouse', 'land', 'garage', 'industrial', 'rural'];
const propertyStatuses: PropertyStatus[] = ['available', 'reserved', 'sold', 'rented', 'off-market', 'judicial', 'npl', 'auction', 'renovation', 'pending-documentation'];

const CrmPropertyNew = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', reference: '', type: 'apartment' as PropertyType, status: 'available' as PropertyStatus,
    price: '', originalPrice: '', street: '', city: '', province: '', postalCode: '',
    surface: '', bedrooms: '', bathrooms: '',
    elevator: false, parking: false, terrace: false, garden: false, pool: false, airConditioning: false, heating: false, storage: false,
    yearBuilt: '', energyRating: '', orientation: '', condition: '',
    ownerName: '', ownerPhone: '', ownerEmail: '', ownerType: 'individual',
    featured: false, publishOnWeb: true, communityFees: '', propertyTax: '', cadastralReference: '', registryNumber: '',
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.street || !form.city) { toast.error("Rellena los campos obligatorios"); return; }
    toast.success("Propiedad creada correctamente");
    navigate('/inmuebles');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Nueva Propiedad | IKESA" description="Alta de nueva propiedad" canonical="/crm/propiedad-nueva" />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button>
              <h1 className="text-2xl font-bold font-heading">Nueva Propiedad</h1>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
              <Button type="submit"><Save className="h-4 w-4 mr-2" />Guardar</Button>
            </div>
          </div>

          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Datos básicos</TabsTrigger>
              <TabsTrigger value="characteristics">Características</TabsTrigger>
              <TabsTrigger value="location">Ubicación</TabsTrigger>
              <TabsTrigger value="media">Imágenes</TabsTrigger>
              <TabsTrigger value="extra">Adicional</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="mt-6 space-y-6">
              <Card><CardHeader><CardTitle>Información principal</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Título *</Label><Input placeholder="Ej: Piso reformado en Salamanca" value={form.title} onChange={e => update('title', e.target.value)} /></div>
                  <div><Label>Referencia</Label><Input placeholder="VIV-XXX" value={form.reference} onChange={e => update('reference', e.target.value)} /></div>
                </div>
                <div><Label>Descripción</Label><Textarea placeholder="Descripción detallada..." value={form.description} onChange={e => update('description', e.target.value)} rows={4} /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label>Tipo</Label><Select value={form.type} onValueChange={v => update('type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{propertyTypes.map(t => <SelectItem key={t} value={t}>{getPropertyTypeLabel(t)}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Estado</Label><Select value={form.status} onValueChange={v => update('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{propertyStatuses.map(s => <SelectItem key={s} value={s}>{getPropertyStatusLabel(s)}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Precio (€) *</Label><Input type="number" placeholder="450000" value={form.price} onChange={e => update('price', e.target.value)} /></div>
                  <div><Label>Precio original (€)</Label><Input type="number" placeholder="500000" value={form.originalPrice} onChange={e => update('originalPrice', e.target.value)} /></div>
                </div>
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="characteristics" className="mt-6 space-y-6">
              <Card><CardHeader><CardTitle>Superficie y distribución</CardTitle></CardHeader><CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div><Label>Superficie (m²)</Label><Input type="number" value={form.surface} onChange={e => update('surface', e.target.value)} /></div>
                  <div><Label>Dormitorios</Label><Input type="number" value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} /></div>
                  <div><Label>Baños</Label><Input type="number" value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label>Año construcción</Label><Input type="number" value={form.yearBuilt} onChange={e => update('yearBuilt', e.target.value)} /></div>
                  <div><Label>Cert. energética</Label><Select value={form.energyRating} onValueChange={v => update('energyRating', v)}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{['A','B','C','D','E','F','G'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Orientación</Label><Input placeholder="Sur, Norte..." value={form.orientation} onChange={e => update('orientation', e.target.value)} /></div>
                </div>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Extras</CardTitle></CardHeader><CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[{ key: 'elevator', label: 'Ascensor' }, { key: 'parking', label: 'Parking' }, { key: 'terrace', label: 'Terraza' }, { key: 'garden', label: 'Jardín' }, { key: 'pool', label: 'Piscina' }, { key: 'airConditioning', label: 'Aire acondicionado' }, { key: 'heating', label: 'Calefacción' }, { key: 'storage', label: 'Trastero' }].map(f => (
                    <div key={f.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><Label className="cursor-pointer">{f.label}</Label><Switch checked={form[f.key as keyof typeof form] as boolean} onCheckedChange={v => update(f.key, v)} /></div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="location" className="mt-6">
              <Card><CardHeader><CardTitle>Dirección</CardTitle></CardHeader><CardContent className="space-y-4">
                <div><Label>Calle y número *</Label><Input placeholder="Calle Serrano, 45" value={form.street} onChange={e => update('street', e.target.value)} /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><Label>Ciudad *</Label><Input placeholder="Madrid" value={form.city} onChange={e => update('city', e.target.value)} /></div>
                  <div><Label>Provincia</Label><Input placeholder="Madrid" value={form.province} onChange={e => update('province', e.target.value)} /></div>
                  <div><Label>Código postal</Label><Input placeholder="28001" value={form.postalCode} onChange={e => update('postalCode', e.target.value)} /></div>
                </div>
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="media" className="mt-6">
              <Card><CardHeader><CardTitle>Imágenes</CardTitle></CardHeader><CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Arrastra imágenes aquí</h3>
                  <p className="text-sm text-muted-foreground mb-4">o haz clic para seleccionar archivos</p>
                  <Button type="button" variant="outline"><Upload className="h-4 w-4 mr-2" />Seleccionar archivos</Button>
                </div>
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="extra" className="mt-6 space-y-6">
              <Card><CardHeader><CardTitle>Propietario</CardTitle></CardHeader><CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Nombre</Label><Input value={form.ownerName} onChange={e => update('ownerName', e.target.value)} /></div>
                  <div><Label>Teléfono</Label><Input value={form.ownerPhone} onChange={e => update('ownerPhone', e.target.value)} /></div>
                  <div><Label>Email</Label><Input type="email" value={form.ownerEmail} onChange={e => update('ownerEmail', e.target.value)} /></div>
                  <div><Label>Tipo</Label><Select value={form.ownerType} onValueChange={v => update('ownerType', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="individual">Particular</SelectItem><SelectItem value="company">Empresa</SelectItem><SelectItem value="bank">Banco</SelectItem><SelectItem value="judicial">Judicial</SelectItem></SelectContent></Select></div>
                </div>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Marketing</CardTitle></CardHeader><CardContent>
                <div className="flex gap-6">
                  <div className="flex items-center gap-3"><Switch checked={form.publishOnWeb} onCheckedChange={v => update('publishOnWeb', v)} /><Label>Publicar en web</Label></div>
                  <div className="flex items-center gap-3"><Switch checked={form.featured} onCheckedChange={v => update('featured', v)} /><Label>Destacar</Label></div>
                </div>
              </CardContent></Card>
              <Card><CardHeader><CardTitle>Información financiera y legal</CardTitle></CardHeader><CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Comunidad (€/mes)</Label><Input type="number" value={form.communityFees} onChange={e => update('communityFees', e.target.value)} /></div>
                  <div><Label>IBI (€/año)</Label><Input type="number" value={form.propertyTax} onChange={e => update('propertyTax', e.target.value)} /></div>
                  <div><Label>Ref. catastral</Label><Input value={form.cadastralReference} onChange={e => update('cadastralReference', e.target.value)} /></div>
                  <div><Label>Nº registro</Label><Input value={form.registryNumber} onChange={e => update('registryNumber', e.target.value)} /></div>
                </div>
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CrmPropertyNew;
