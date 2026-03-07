import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PoliticaPrivacidad = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Política de Privacidad y RGPD</h1>
      <p className="text-sm text-muted-foreground mb-8">Última actualización: 7 de marzo de 2026</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Responsable del tratamiento</h2>
          <p className="text-muted-foreground leading-relaxed">IKESA INMOBILIARIA S.L. (CIF: B-XXXXXXXX). Domicilio: [Dirección]. Contacto DPD: privacidad@ikesa.es</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Datos que recopilamos</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 leading-relaxed">
            <li><strong className="text-foreground">Registro de usuario:</strong> nombre, email, teléfono.</li>
            <li><strong className="text-foreground">Ofertas de compra:</strong> datos identificativos, importe de la oferta, referencia del activo.</li>
            <li><strong className="text-foreground">NDA firmados:</strong> fecha, identidad del firmante.</li>
            <li><strong className="text-foreground">Navegación:</strong> cookies técnicas, dirección IP, dispositivo y navegador (ver Política de Cookies).</li>
            <li><strong className="text-foreground">Alertas y favoritos:</strong> preferencias de búsqueda y activos guardados.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Finalidad y base legal</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-3 text-foreground font-semibold">Finalidad</th>
                  <th className="text-left p-3 text-foreground font-semibold">Base legal (RGPD art. 6)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-t border-border"><td className="p-3">Gestión de cuenta de usuario</td><td className="p-3">Ejecución de contrato</td></tr>
                <tr className="border-t border-border"><td className="p-3">Tramitación de ofertas de compra</td><td className="p-3">Ejecución de contrato</td></tr>
                <tr className="border-t border-border"><td className="p-3">Envío de alertas e información comercial</td><td className="p-3">Consentimiento del interesado</td></tr>
                <tr className="border-t border-border"><td className="p-3">Cumplimiento de obligaciones legales (PBC/FT)</td><td className="p-3">Obligación legal</td></tr>
                <tr className="border-t border-border"><td className="p-3">Análisis estadístico y mejora del servicio</td><td className="p-3">Interés legítimo</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Plazo de conservación</h2>
          <p className="text-muted-foreground leading-relaxed">Los datos se conservan mientras se mantenga la relación contractual y, una vez finalizada, durante los plazos legales de prescripción aplicables (mínimo 5 años para obligaciones mercantiles, 10 años para prevención de blanqueo).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Destinatarios</h2>
          <p className="text-muted-foreground leading-relaxed">Sus datos podrán ser comunicados a: servicers y entidades financieras propietarias de los activos (en caso de presentar oferta), notarías y registros de la propiedad, administraciones públicas cuando exista obligación legal, y proveedores tecnológicos que actúan como encargados del tratamiento con acuerdos de confidencialidad vigentes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Derechos del interesado</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">Puede ejercer los siguientes derechos conforme al Reglamento (UE) 2016/679:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Acceso, rectificación y supresión de sus datos.</li>
            <li>Limitación y oposición al tratamiento.</li>
            <li>Portabilidad de los datos.</li>
            <li>Retirada del consentimiento en cualquier momento.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">Contacte con nuestro DPD en privacidad@ikesa.es o presente una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Transferencias internacionales</h2>
          <p className="text-muted-foreground leading-relaxed">Nuestros servidores se encuentran en la UE. En caso de transferencias a terceros países, se aplicarán las garantías adecuadas (cláusulas contractuales tipo de la Comisión Europea).</p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default PoliticaPrivacidad;
