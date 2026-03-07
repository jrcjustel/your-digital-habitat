import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AvisoLegal = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-sm prose-headings:text-foreground prose-p:text-muted-foreground">
      <h1 className="text-3xl font-bold text-foreground">Aviso Legal</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: 7 de marzo de 2026</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Datos identificativos</h2>
      <p className="text-muted-foreground leading-relaxed">En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se informa que el presente sitio web es titularidad de IKESA INMOBILIARIA S.L. (en adelante, «IKESA»), con CIF B-XXXXXXXX, domicilio social en [Dirección], inscrita en el Registro Mercantil de [Provincia], Tomo XXX, Folio XXX, Hoja XX-XXXXX.</p>
      <p className="text-muted-foreground leading-relaxed">Contacto: info@ikesa.es</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Objeto</h2>
      <p className="text-muted-foreground leading-relaxed">IKESA facilita el acceso a información sobre activos inmobiliarios, incluyendo inmuebles de compraventa directa, activos NPL (Non-Performing Loans), cesiones de remate judiciales e inmuebles con ocupación. La información publicada tiene carácter meramente informativo y no constituye una oferta vinculante.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Propiedad intelectual e industrial</h2>
      <p className="text-muted-foreground leading-relaxed">Todos los contenidos del sitio web (textos, imágenes, marcas, logotipos, software, bases de datos) son propiedad de IKESA o de sus licenciantes y están protegidos por las leyes de propiedad intelectual e industrial vigentes. Queda prohibida su reproducción, distribución o modificación sin autorización expresa por escrito.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Limitación de responsabilidad</h2>
      <p className="text-muted-foreground leading-relaxed">IKESA no garantiza la disponibilidad ni la continuidad del servicio. La información sobre activos se obtiene de fuentes consideradas fiables (servicers, juzgados, registros), pero IKESA no se responsabiliza de posibles inexactitudes. El usuario debe realizar su propia due diligence antes de tomar cualquier decisión de inversión.</p>

      <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Legislación aplicable y jurisdicción</h2>
      <p className="text-muted-foreground leading-relaxed">Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales de la ciudad del domicilio social de IKESA, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.</p>
    </div>
    <Footer />
  </div>
);

export default AvisoLegal;
