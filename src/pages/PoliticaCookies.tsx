import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PoliticaCookies = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Política de Cookies</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: 7 de marzo de 2026</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. ¿Qué son las cookies?</h2>
          <p className="text-muted-foreground leading-relaxed">Las cookies son pequeños ficheros de texto que se almacenan en su dispositivo cuando visita un sitio web. Permiten que el sitio recuerde sus acciones y preferencias durante un periodo de tiempo.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Cookies que utilizamos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-3 text-foreground font-semibold">Cookie</th>
                  <th className="text-left p-3 text-foreground font-semibold">Tipo</th>
                  <th className="text-left p-3 text-foreground font-semibold">Finalidad</th>
                  <th className="text-left p-3 text-foreground font-semibold">Duración</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-t border-border"><td className="p-3">sb-*-auth-token</td><td className="p-3">Técnica</td><td className="p-3">Autenticación del usuario</td><td className="p-3">Sesión</td></tr>
                <tr className="border-t border-border"><td className="p-3">cookie_consent</td><td className="p-3">Técnica</td><td className="p-3">Registro de consentimiento</td><td className="p-3">1 año</td></tr>
                <tr className="border-t border-border"><td className="p-3">_ga, _gid</td><td className="p-3">Analítica</td><td className="p-3">Google Analytics</td><td className="p-3">2 años / 24h</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Gestión de cookies</h2>
          <p className="text-muted-foreground leading-relaxed">Puede configurar su navegador para rechazar cookies o para que le avise cuando se instale una. Si desactiva las cookies técnicas, algunas funcionalidades del sitio podrían no funcionar correctamente.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Base legal</h2>
          <p className="text-muted-foreground leading-relaxed">Las cookies técnicas se instalan en virtud de nuestro interés legítimo para el correcto funcionamiento del sitio (art. 6.1.f RGPD). Las cookies analíticas y publicitarias requieren su consentimiento previo (art. 6.1.a RGPD), gestionado a través del banner de cookies.</p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default PoliticaCookies;
