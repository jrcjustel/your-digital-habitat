import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Brain, Upload, BookOpen, Building2, RefreshCw, CheckCircle, AlertCircle, Sparkles, Scale } from "lucide-react";

const mockAssistants = [
  { name: "INÉS", specialization: "Asistente comercial IA", active: true, docs: 24, code: "ines_commercial" },
  { name: "PELAYO", specialization: "Asistente legal IA", active: true, docs: 18, code: "pelayo_legal" },
];

const mockKnowledge = [
  { id: "1", title: "Manual de Marca IKESA v3", category: "marca_corporativa", priority: 9, created_at: "2024-03-01", assistant: "INÉS" },
  { id: "2", title: "Procedimiento Cesión Remate", category: "documentacion_tecnica", priority: 8, created_at: "2024-02-15", assistant: "PELAYO" },
  { id: "3", title: "FAQ Inversores", category: "general", priority: 7, created_at: "2024-02-10", assistant: "INÉS" },
  { id: "4", title: "Marco Legal NPL España", category: "documentacion_tecnica", priority: 9, created_at: "2024-01-20", assistant: "PELAYO" },
];

const DocumentManagementPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Gestión de Documentos IA | IKESA Admin" description="Gestión de documentos y entrenamiento de asistentes IA" canonical="/admin/documentos-ia" />
      <Navbar />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-heading mb-2">Gestión de Documentos IA</h1>
            <p className="text-xl text-muted-foreground">Sube y gestiona documentos para entrenar a los asistentes IA</p>
          </div>
          <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Actualizar</Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {mockAssistants.map(a => (
            <Card key={a.name}><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg">
              {a.code === "ines_commercial" ? <Sparkles className="h-4 w-4 text-accent" /> : <Scale className="h-4 w-4 text-primary" />}
              {a.name}
            </CardTitle></CardHeader><CardContent>
              <p className="text-sm text-muted-foreground mb-3">{a.specialization}</p>
              <div className="flex gap-2">
                <Badge variant={a.active ? "default" : "destructive"} className="flex items-center gap-1">{a.active ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}{a.active ? "Activo" : "Inactivo"}</Badge>
                <Badge variant="outline">{a.docs} docs</Badge>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <Tabs defaultValue="knowledge">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="knowledge">Base de Conocimiento</TabsTrigger>
            <TabsTrigger value="upload">Subir Documentos</TabsTrigger>
            <TabsTrigger value="brand">Manual de Marca</TabsTrigger>
            <TabsTrigger value="training">Entrenamiento</TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge" className="mt-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />Base de Conocimiento</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {mockKnowledge.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.assistant} • {item.category.replace("_", " ")}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={item.priority >= 8 ? "default" : "secondary"}>P{item.priority}</Badge>
                      <Badge variant="outline">{new Date(item.created_at).toLocaleDateString("es-ES")}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upload"><Card><CardContent className="py-12 text-center"><Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p className="text-muted-foreground mb-4">Arrastra documentos aquí o haz clic para seleccionar</p><Button>Seleccionar archivos</Button></CardContent></Card></TabsContent>
          <TabsContent value="brand"><Card><CardContent className="py-12 text-center"><Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p className="text-muted-foreground">Sube el manual de marca para mantener coherencia en la comunicación IA</p></CardContent></Card></TabsContent>
          <TabsContent value="training"><Card><CardContent className="py-12 text-center"><BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" /><p className="text-muted-foreground">Documentos de entrenamiento especializado</p></CardContent></Card></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default DocumentManagementPage;
