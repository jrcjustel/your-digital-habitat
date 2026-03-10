import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, Search, ArrowRight, Scale } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const mockPosts = [
  { id: '1', title: 'Derecho de tanteo y retracto en Cataluña: Lo que hay que saber en 2025', excerpt: 'Análisis completo de las nuevas medidas urgentes en materia de vivienda y urbanismo.', author: 'Departamento Legal IKESA', category: 'Legal', tags: ['Cataluña', 'Tanteo'], readTime: 8, featured: true },
  { id: '2', title: 'Nueva Ley de Eficiencia Procesal: Cambios clave en ejecuciones y subastas', excerpt: 'Descubre cómo la nueva ley agilizará los procesos judiciales.', author: 'Equipo Jurídico IKESA', category: 'Legal', tags: ['Subastas', 'BOE'], readTime: 12, featured: true },
];

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Actualidad IKESA</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Mantente informado sobre las últimas novedades en inversión inmobiliaria</p>
          <div className="max-w-md mx-auto mt-8 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar artículos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 border-0">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="rounded-full"><Scale className="h-3 w-3 mr-1" />{post.category}</Badge>
                  {post.featured && <Badge variant="outline" className="text-xs">Destacado</Badge>}
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</div>
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime} min</div>
                  </div>
                </div>
                <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">Leer artículo<ArrowRight className="ml-2 h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;
