import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldAlert, Lock, UserCheck, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: Lock, title: "Confidencialidad", description: "Garantizamos la protección de la identidad del denunciante conforme a la Ley 2/2023." },
  { icon: UserCheck, title: "No represalias", description: "Queda prohibida cualquier forma de represalia contra el denunciante de buena fe." },
  { icon: ShieldAlert, title: "Investigación independiente", description: "Las denuncias son gestionadas por un responsable designado, independiente de la dirección." },
  { icon: Mail, title: "Seguimiento", description: "Recibirá acuse de recibo en 7 días y respuesta sobre las actuaciones en un máximo de 3 meses." },
];

const CanalDenuncias = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <section className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <ShieldAlert className="w-12 h-12 text-accent mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Canal de Denuncias</h1>
        <p className="text-primary-foreground/70 leading-relaxed">
          En cumplimiento de la Ley 2/2023, de 20 de febrero, reguladora de la protección de las personas que
          informen sobre infracciones normativas y de lucha contra la corrupción, IKESA pone a disposición
          de empleados, colaboradores, proveedores y terceros este canal interno de información.
        </p>
      </div>
    </section>

    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {features.map((f) => (
          <Card key={f.title} className="border-border">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">¿Qué se puede denunciar?</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 leading-relaxed">
            <li>Infracciones del Derecho de la Unión Europea en las materias del art. 2 de la Directiva (UE) 2019/1937.</li>
            <li>Acciones u omisiones que puedan constituir infracción penal o administrativa grave o muy grave.</li>
            <li>Incumplimientos de normativa interna de la empresa (código ético, políticas de compliance).</li>
            <li>Indicios de blanqueo de capitales o financiación del terrorismo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Cómo presentar una denuncia</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Las comunicaciones pueden realizarse de forma identificada o anónima, por escrito o verbalmente, a través de los siguientes medios:
          </p>
          <div className="bg-secondary rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-accent shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm">Correo electrónico</p>
                <p className="text-sm text-muted-foreground">canaldenuncias@ikesa.es</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-accent shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm">Correo postal</p>
                <p className="text-sm text-muted-foreground">Canal de Denuncias — IKESA INMOBILIARIA S.L., [Dirección], con la mención «CONFIDENCIAL».</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Protección de datos</h2>
          <p className="text-muted-foreground leading-relaxed">
            Los datos personales contenidos en las denuncias serán tratados conforme al RGPD y la LOPDGDD.
            Solo tendrán acceso las personas autorizadas para la gestión del canal. Los datos se conservarán
            durante el tiempo imprescindible para la investigación y, en todo caso, no más de 10 años.
            Puede ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y
            oposición dirigiéndose a privacidad@ikesa.es.
          </p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
);

export default CanalDenuncias;
