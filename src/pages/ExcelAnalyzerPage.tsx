import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ColumnMapping { sourceColumn: string; targetField: string; dataType: string; confidence: 'high' | 'medium' | 'low'; notes: string; }
interface AnalysisResult { mappings: ColumnMapping[]; summary: { totalColumns: number; mappedColumns: number; unmappedColumns: number; primaryLanguage: string; suggestedActions: string[]; }; }

const ExcelAnalyzerPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [columns, setColumns] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (!f.name.match(/\.(xlsx|xls|csv)$/i)) { toast.error('Formato no válido. Usa .xlsx, .xls o .csv'); return; }
      setFile(f); setAnalysis(null); setColumns([]); setSampleData([]);
    }
  };

  const processCSV = async (file: File): Promise<{ columns: string[]; sampleData: any[] }> => {
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (!lines.length) throw new Error('Archivo vacío');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const samples = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });
      return row;
    });
    return { columns: headers, sampleData: samples };
  };

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true); setProgress(10);
    try {
      if (!file.name.endsWith('.csv')) { toast.error('Por ahora solo CSV. Convierte tu Excel a CSV primero.'); setAnalyzing(false); return; }
      setProgress(30);
      const { columns: cols, sampleData: samples } = await processCSV(file);
      setColumns(cols); setSampleData(samples); setProgress(60);

      const { data, error } = await supabase.functions.invoke('excel-analyzer', { body: { columns: cols, sampleData: samples.slice(0, 3) } });
      setProgress(90);
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Error en análisis');
      setAnalysis(data.analysis); setProgress(100);
      toast.success(`Mapeadas ${data.analysis.summary.mappedColumns} de ${data.analysis.summary.totalColumns} columnas`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error desconocido');
    } finally { setAnalyzing(false); setProgress(0); }
  };

  const confColor = (c: string) => c === 'high' ? 'bg-green-100 text-green-800' : c === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  const confIcon = (c: string) => c === 'high' ? <CheckCircle className="h-4 w-4" /> : c === 'medium' ? <AlertTriangle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Analizador Excel | IKESA" description="Analiza y mapea archivos Excel de activos con IA" canonical="/excel-analyzer" />
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div><h1 className="text-3xl font-bold font-heading">Analizador Universal de Excel</h1><p className="text-muted-foreground">Sube cualquier archivo Excel/CSV de activos y la IA mapeará las columnas automáticamente</p></div>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Subir Archivo</CardTitle><CardDescription>Formatos: .xlsx, .xls, .csv</CardDescription></CardHeader><CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">Arrastra tu archivo o haz clic</p>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" id="file-upload" />
            <label htmlFor="file-upload"><Button variant="outline" className="cursor-pointer" asChild><span>Seleccionar archivo</span></Button></label>
          </div>
          {file && <div className="flex items-center justify-between p-4 bg-muted rounded-lg"><div className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" /><span className="font-medium">{file.name}</span><Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge></div><Button onClick={analyze} disabled={analyzing}>{analyzing ? 'Analizando...' : 'Analizar'}</Button></div>}
          {analyzing && <div className="space-y-2"><div className="flex justify-between text-sm"><span>Analizando...</span><span>{progress}%</span></div><Progress value={progress} /></div>}
        </CardContent></Card>

        {analysis && <>
          <Card><CardHeader><CardTitle>Resumen</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center"><div className="text-2xl font-bold">{analysis.summary.totalColumns}</div><div className="text-sm text-muted-foreground">Columnas</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-green-600">{analysis.summary.mappedColumns}</div><div className="text-sm text-muted-foreground">Mapeadas</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-orange-600">{analysis.summary.unmappedColumns}</div><div className="text-sm text-muted-foreground">Sin mapear</div></div>
            <div className="text-center"><Badge variant="outline">{analysis.summary.primaryLanguage === 'spanish' ? 'Español' : 'Inglés'}</Badge><div className="text-sm text-muted-foreground mt-1">Idioma</div></div>
          </div>
          {analysis.summary.suggestedActions.length > 0 && <Alert className="mt-4"><AlertTriangle className="h-4 w-4" /><AlertDescription><strong>Acciones sugeridas:</strong><ul className="list-disc list-inside mt-2">{analysis.summary.suggestedActions.map((a, i) => <li key={i}>{a}</li>)}</ul></AlertDescription></Alert>}
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="flex items-center justify-between">Mapeo de Columnas<Button variant="outline"><Shield className="h-4 w-4 mr-2" />Generar Plan Seguro</Button></CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>Original</TableHead><TableHead>Destino</TableHead><TableHead>Tipo</TableHead><TableHead>Confianza</TableHead><TableHead>Notas</TableHead></TableRow></TableHeader>
              <TableBody>{analysis.mappings.map((m, i) => (
                <TableRow key={i}><TableCell className="font-medium">{m.sourceColumn}</TableCell><TableCell>{m.targetField}</TableCell><TableCell><Badge variant="outline">{m.dataType}</Badge></TableCell><TableCell><Badge className={confColor(m.confidence)}>{confIcon(m.confidence)} {m.confidence}</Badge></TableCell><TableCell className="text-sm text-muted-foreground">{m.notes}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </>}
      </main>
      <Footer />
    </div>
  );
};

export default ExcelAnalyzerPage;
