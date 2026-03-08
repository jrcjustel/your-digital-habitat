import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { FileSearch, Scale, Building2, BarChart3, ShieldCheck, CheckCircle2, Mail, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    icon: FileSearch,
    title: "Análisis documental",
    description: "Revisamos y estructuramos la información y documentación de la oportunidad. Tras realizar una oferta, solicitamos la documentación necesaria para presentarla siguiendo los protocolos del fondo.",
  },
  {
    icon: Scale,
    title: "Análisis jurídico",
    description: "Analizamos la situación legal de la oportunidad para ayudarte a entender la operación con claridad: qué posición estás adquiriendo y qué implicaciones puede tener el proceso.",
  },
  {
    icon: Building2,
    title: "Análisis inmobiliario",
    description: "Evaluamos el activo inmobiliario vinculado a la oportunidad como parte del análisis previo, para aportar una visión más completa antes de avanzar.",
  },
  {
    icon: BarChart3,
    title: "Análisis financiero",
    description: "Analizamos la oportunidad desde una perspectiva financiera, calculando rentabilidades esperadas, costes asociados y escenarios de salida para que tomes decisiones informadas.",
  },
  {
    icon: ShieldCheck,
    title: "Proceso de PBC",
    description: "Te guiamos en el proceso de Prevención de Blanqueo de Capitales, requisito indispensable para formalizar cualquier operación con entidades financieras y fondos.",
  },
  {
    icon: CheckCircle2,
    title: "Cierre de la operación",
    description: "Te acompañamos durante todo el proceso de cierre, desde la negociación final hasta la firma ante notario, asegurando que cada paso se ejecute correctamente.",
  },
];

const professionals = [
  {
    category: "Abogados",
    description: "Despachos de abogados especializados en el análisis y asesoramiento en la inversión de NPLs, cesiones de remate e inmuebles ocupados. Especialistas en procedimientos recuperatorios.",
    items: [
      { name: "M&P Ledesma Abogados", specialty: "Gestión de deuda secured & unsecured. Asesoramiento inmobiliario integral.", zone: "Nacional" },
      { name: "FILS Legal", specialty: "Asesoramiento y llevanza de asuntos de gran envergadura.", zone: "Cataluña y Madrid" },
      { name: "Colomer Ventalló Abogados", specialty: "Más de 20 años asesorando a inversores en gestión de activos inmobiliarios.", zone: "Nacional" },
    ],
  },
  {
    category: "Procuradores",
    description: "Despachos especializados en la llevanza de procedimientos recuperatorios (NPL), destacando por su agilidad y conocimiento en la gestión de expedientes.",
    items: [
      { name: "Gordillo Procuradores", specialty: "Gestión judicial de litigios para entidades financieras y fondos de inversión.", zone: "Sevilla y Madrid" },
      { name: "Barbero Procuradores", specialty: "Más de 20 años en el sector hipotecario.", zone: "C. Valenciana y Murcia" },
    ],
  },
  {
    category: "Gestorías",
    description: "Profesionales en la gestión de trámites administrativos: inscripciones registrales, liquidación de impuestos, preparación documental para demandas.",
    items: [
      { name: "Egara Optiminn", specialty: "Back office documental y gestión integral de carteras NPL.", zone: "Nacional" },
      { name: "Diagonal Company", specialty: "Inscripciones registrales, liquidación de impuestos y preparación documental.", zone: "Nacional" },
    ],
  },
  {
    category: "Agencias de negociación",
    description: "Profesionales en la gestión recuperatoria del NPL y recuperación de la posesión del inmueble mediante negociación amistosa.",
    items: [
      { name: "Area Gestió", specialty: "+7.000 inmuebles recuperados de forma amistosa. Informes ocupacionales y negociación.", zone: "Cataluña, C. Valenciana, Murcia, Andalucía" },
      { name: "Grupo ADGEST", specialty: "Negociación de posiciones crediticias y activos inmobiliarios.", zone: "Nacional" },
    ],
  },
];

const Servicios = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Servicios y Acompañamiento | IKESA"
        description="Todo lo que necesitas para invertir con claridad, criterio y acompañamiento experto. Análisis documental, jurídico, financiero e inmobiliario en cada operación."
        canonical="/servicios"
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Servicios & Acompañamiento
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Todo lo que necesitas para invertir con claridad, criterio y acompañamiento experto.
          </p>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto mt-2">
            En IKESA te damos el análisis y el soporte necesarios para tomar decisiones informadas y ejecutar cada operación con seguridad, desde el primer paso hasta la formalización.
          </p>
        </div>
      </section>

      {/* Servicios incluidos */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Servicios incluidos en cada operación
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Los honorarios contemplados en cada producto incluyen acompañamiento y análisis experto. De la oferta a la firma, y el seguimiento.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <Link to="/valorar">
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                Solicitar presupuesto personalizado
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-card rounded-2xl border border-border p-6 hover:border-accent/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <service.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red de profesionales */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Red de profesionales colaboradores
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Selecciona al profesional que necesites y te ponemos en contacto con él. Todos son especialistas verificados en inversión inmobiliaria alternativa.
            </p>
          </div>

          <div className="space-y-10">
            {professionals.map((group) => (
              <div key={group.category}>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  {group.category}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-3xl">
                  {group.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className="bg-card rounded-xl border border-border p-5 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-heading font-bold text-foreground mb-1.5">{item.name}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          {item.specialty}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                          📍 {item.zone}
                        </span>
                        <Button size="sm" variant="outline" className="text-xs gap-1 h-8">
                          <Phone className="w-3 h-3" />
                          Contactar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
            ¿Necesitas asesoramiento personalizado?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Nuestro equipo está disponible para resolver tus dudas y acompañarte en todo el proceso de inversión.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/inmuebles">
              <Button size="lg" className="gap-2">
                Ver oportunidades <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/como-funciona">
              <Button size="lg" variant="outline">
                Cómo funciona
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Servicios;
