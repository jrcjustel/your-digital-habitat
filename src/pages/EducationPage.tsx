import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Video, FileText, Clock, Star, ArrowRight, Award, Users } from "lucide-react";

const courses = [
  { title: "Introducción a la inversión en NPL", level: "Principiante", duration: "2h", lessons: 8, rating: 4.8, students: 234, free: true },
  { title: "Cesión de Remate: Guía completa", level: "Intermedio", duration: "4h", lessons: 12, rating: 4.9, students: 156, free: false },
  { title: "Due Diligence inmobiliaria", level: "Avanzado", duration: "3h", lessons: 10, rating: 4.7, students: 189, free: false },
  { title: "Marco legal de subastas judiciales", level: "Intermedio", duration: "3.5h", lessons: 14, rating: 4.6, students: 145, free: true },
  { title: "Análisis financiero de activos distressed", level: "Avanzado", duration: "5h", lessons: 16, rating: 4.8, students: 98, free: false },
  { title: "Estrategias de inversión inmobiliaria", level: "Principiante", duration: "2.5h", lessons: 9, rating: 4.5, students: 312, free: true },
];

const EducationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Centro Educativo | IKESA Academy" description="Aprende a invertir en inmuebles con nuestros cursos y recursos" canonical="/educacion" />
      <Navbar />

      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-12 text-center">
          <Badge className="mb-4">IKESA Academy</Badge>
          <h1 className="text-5xl font-bold font-heading mb-4">Centro Educativo</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Formación especializada en inversión inmobiliaria distressed</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Cursos", value: "24", icon: BookOpen },
            { label: "Estudiantes", value: "1.2K", icon: GraduationCap },
            { label: "Horas de contenido", value: "80+", icon: Clock },
            { label: "Certificaciones", value: "6", icon: Award },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-4"><s.icon className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></CardContent></Card>
          ))}
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-8">Cursos Disponibles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c => (
              <Card key={c.title} className="hover:shadow-lg transition-all cursor-pointer">
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  <Video className="h-12 w-12 text-muted-foreground/30" />
                  {c.free && <Badge className="absolute top-3 left-3 bg-primary">Gratis</Badge>}
                  <Badge variant="outline" className="absolute top-3 right-3">{c.level}</Badge>
                </div>
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold">{c.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration}</span>
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{c.lessons} lecciones</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.students}</span>
                  </div>
                  <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-medium">{c.rating}</span></div>
                  <Button className="w-full" variant={c.free ? "default" : "outline"} size="sm">{c.free ? "Empezar gratis" : "Ver curso"}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate("/academia")}>Ver todos los recursos en Academia <ArrowRight className="h-4 w-4 ml-2" /></Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EducationPage;
