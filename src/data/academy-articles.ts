export interface AcademyArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: "Ocupados" | "CDR" | "Subastas" | "NPL" | "Fiscal" | "Legal" | "Mercado";
  date: string;
  readTime: string;
  featured?: boolean;
  image?: string;
  content: string;
}

export interface AcademyRoute {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  priority: number;
  color: string;
  intro: string;
  modules: AcademyModule[];
  cta: { label: string; href: string };
}

export interface AcademyModule {
  title: string;
  lessons: string[];
}

export const academyCategories = [
  { id: "all", label: "Todos", color: "bg-primary/10 text-primary" },
  { id: "Ocupados", label: "Inmuebles Ocupados", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
  { id: "CDR", label: "Cesiones de Remate", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  { id: "Subastas", label: "Subastas BOE", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { id: "NPL", label: "Deuda / NPL", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { id: "Fiscal", label: "Fiscal", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  { id: "Legal", label: "Legal", color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" },
  { id: "Mercado", label: "Mercado", color: "bg-slate-500/10 text-slate-700 dark:text-slate-400" },
];

export const academyRoutes: AcademyRoute[] = [
  {
    id: "ocupados",
    slug: "ruta-inmuebles-ocupados",
    title: "Ruta Inmuebles Ocupados",
    shortTitle: "Ocupados",
    icon: "🏚️",
    priority: 1,
    color: "from-red-500/20 to-red-600/10 border-red-500/30",
    intro: "Los inmuebles ocupados (inquilinos morosos, okupas, desalojos pendientes) son la mayor oportunidad de descuento en España. Ikesa explica cómo analizarlos, calcular rentabilidad real y ejecutarlos.",
    modules: [
      {
        title: "Tipos de ocupación y descuentos reales",
        lessons: [
          "Ocupado legal (moroso) vs okupa vs desahucio en marcha",
          "Descuentos típicos: 30-70% según estado ocupacional",
          "Perfil de inversor ideal para activos ocupados",
          "Marco legal vigente: LAU, LEC y ley anti-okupas",
        ],
      },
      {
        title: "Análisis coste-beneficio con Ikesa",
        lessons: [
          "Coste legal de desocupación por CCAA (45-180 días)",
          "TIR real incluyendo tiempo de desocupación",
          "Escenarios: negociar salida voluntaria vs juicio exprés",
          "Calculadora de rentabilidad neta para ocupados",
        ],
      },
      {
        title: "Estrategias Ikesa con ocupados",
        lessons: [
          "Compra con descuento + gestión de desocupación integral",
          "Timing perfecto: comprar + desalojar + alquilar/vender",
          "Cash for keys: cuándo y cómo negociar la salida",
          "Casos reales simplificados de operaciones Ikesa",
        ],
      },
      {
        title: "Checklists y señales de alerta",
        lessons: [
          "15 documentos imprescindibles antes de firmar",
          "7 señales ROJAS que te harán salir corriendo",
          "Plan B si la desocupación se eterniza",
          "Seguros y garantías para el inversor en ocupados",
        ],
      },
    ],
    cta: { label: "Quiero que Ikesa analice mis ocupados", href: "/inmuebles?saleType=ocupado" },
  },
  {
    id: "cesiones-remate",
    slug: "ruta-cesiones-remate",
    title: "Ruta Cesiones de Remate Judicial",
    shortTitle: "Cesiones de Remate",
    icon: "⚖️",
    priority: 2,
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
    intro: "Cesiones de remate judicial: adquiere inmuebles ya rematados en juicio por el ejecutante (banco/fondo) con descuento adicional del 10-25%. Ikesa domina este nicho poco conocido pero muy rentable.",
    modules: [
      {
        title: "Qué es una cesión de remate",
        lessons: [
          "Diferencia entre remate BOE y cesión de remate judicial",
          "Quién vende: banco que ganó el remate pero no quiere gestionar",
          "Descuento adicional vs precio de remate (casos 15-30%)",
          "Marco legal: artículos 647 y 672 LEC",
        ],
      },
      {
        title: "Cómo encontrar cesiones de remate",
        lessons: [
          "Fuentes: bancos, servicers, fondos tras remate BOE",
          "Timing perfecto: 30-90 días post-remate",
          "Señales que indican cesión de remate inminente",
          "Red de contactos y plataformas especializadas",
        ],
      },
      {
        title: "Análisis de cesión de remate con Ikesa",
        lessons: [
          "Estado ocupacional post-remate (factor crítico)",
          "Cargas ocultas que sobreviven al remate judicial",
          "Negociación del precio final + condiciones de pago",
          "Due diligence express para cesiones de remate",
        ],
      },
      {
        title: "Estrategias y riesgos específicos",
        lessons: [
          "Cesiones ocupadas vs cesiones libres: valoración",
          "Cláusulas trampa en contratos de cesión de remate",
          "Plan B si la cesión se complica legalmente",
          "Fiscalidad específica de las cesiones de remate",
        ],
      },
    ],
    cta: { label: "Buscar cesiones de remate con Ikesa", href: "/inmuebles?saleType=cesion-remate" },
  },
  {
    id: "subastas-boe",
    slug: "ruta-subastas-boe",
    title: "Ruta Subastas BOE",
    shortTitle: "Subastas BOE",
    icon: "🔨",
    priority: 3,
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    intro: "Las subastas judiciales del BOE son el origen de las grandes oportunidades de inversión inmobiliaria. Aprende a analizar, pujar y adjudicarte inmuebles con seguridad jurídica.",
    modules: [
      {
        title: "Fundamentos de subastas judiciales",
        lessons: [
          "Tipos de subastas: judicial, notarial, administrativa",
          "Portal de subastas BOE: cómo funciona paso a paso",
          "Requisitos para participar: depósitos y acreditación",
          "Cambios con la Ley de Eficiencia Procesal 2025",
        ],
      },
      {
        title: "Due diligence para subastas (énfasis ocupados)",
        lessons: [
          "Estado ocupacional: factor CRÍTICO para fijar puja máxima",
          "Ocupado legal vs okupa vs desahucio → impacto -40% valor",
          "Checklist Ikesa: 12 puntos antes de pujar",
          "Nota simple, catastro y cargas anteriores",
        ],
      },
      {
        title: "Estrategias de puja",
        lessons: [
          "Cálculo del precio máximo de puja rentable",
          "Pujas secretas y nuevas dinámicas post-reforma",
          "Cuándo NO pujar: señales de riesgo excesivo",
          "Gestión del depósito y financiación de la adjudicación",
        ],
      },
      {
        title: "Post-adjudicación",
        lessons: [
          "Del decreto de adjudicación a la inscripción registral",
          "Toma de posesión: inmueble libre vs ocupado",
          "Cancelación de cargas posteriores",
          "Cesión de remate como alternativa a la gestión directa",
        ],
      },
    ],
    cta: { label: "Ver subastas analizadas por Ikesa", href: "/inmuebles?saleType=subasta" },
  },
  {
    id: "deuda-npl",
    slug: "ruta-deuda-npl",
    title: "Ruta Deuda / NPL",
    shortTitle: "Deuda / NPL",
    icon: "📊",
    priority: 4,
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
    intro: "La inversión en deuda hipotecaria impagada (NPL) permite adquirir créditos con descuentos del 40-70% sobre el valor del inmueble subyacente. Domina el análisis de carteras y activos individuales.",
    modules: [
      {
        title: "Fundamentos de inversión en NPL",
        lessons: [
          "Qué es un NPL y por qué los bancos los venden con descuento",
          "Diferencia entre NPL secured y unsecured",
          "Ratio deuda/valor (LTV) como indicador clave",
          "Mercado NPL en España: volumen y principales actores",
        ],
      },
      {
        title: "Colaterales post-remate y ocupación",
        lessons: [
          "Deuda con inmueble YA rematado pero con ocupante",
          "Impacto de la ocupación en valoración del colateral (-25-50%)",
          "Estrategias de salida cuando hay ocupantes",
          "Valoración de colaterales: tasación vs mercado real",
        ],
      },
      {
        title: "Análisis y due diligence de NPL",
        lessons: [
          "Estado judicial del procedimiento hipotecario",
          "Cargas registrales y prelación de créditos",
          "Análisis del deudor: persona física vs jurídica",
          "Cálculo de rentabilidad: escenarios y TIR esperada",
        ],
      },
      {
        title: "Estrategias de gestión y salida",
        lessons: [
          "Negociación con el deudor: quita, dación en pago",
          "Ejecución hipotecaria y subasta judicial",
          "Cesión del crédito a terceros",
          "Portfolio management: gestión de carteras NPL",
        ],
      },
    ],
    cta: { label: "Explorar oportunidades NPL con Ikesa", href: "/inmuebles?saleType=npl" },
  },
];

// ─── Articles ───────────────────────────────────────────────────────────

export const academyArticles: AcademyArticle[] = [
  // ── OCUPADOS (12 artículos) ──
  {
    slug: "calculadora-coste-desalojar-por-ccaa",
    title: "Calculadora real: cuánto cuesta desalojar por Comunidad Autónoma",
    excerpt: "Desglose completo de costes legales, plazos medios y gastos asociados al desalojo por CCAA. Con datos actualizados a 2026.",
    category: "Ocupados",
    date: "2026-03-06",
    readTime: "14 min",
    featured: true,
    content: `## ¿Cuánto cuesta realmente desalojar un inmueble ocupado?

El coste de desalojar un inmueble varía drásticamente según la Comunidad Autónoma, el tipo de ocupación y la vía legal elegida. Este artículo desglosa los números reales.

## Costes por Comunidad Autónoma

| CCAA | Plazo medio | Coste legal | Coste total estimado |
|------|------------|-------------|---------------------|
| Madrid | 4-8 meses | 3.000-6.000 € | 5.000-10.000 € |
| Cataluña | 8-14 meses | 4.000-8.000 € | 7.000-15.000 € |
| Andalucía | 6-12 meses | 3.500-7.000 € | 6.000-12.000 € |
| C. Valenciana | 5-10 meses | 3.000-6.000 € | 5.000-11.000 € |
| País Vasco | 6-10 meses | 4.000-7.000 € | 6.000-12.000 € |
| Galicia | 4-8 meses | 2.500-5.000 € | 4.000-9.000 € |

## Factores que encarecen el desalojo

### 1. Tipo de ocupante
- **Inquilino moroso con contrato**: Vía LAU, plazos más cortos
- **Ocupante sin título (okupa)**: Vía penal o civil, plazos variables
- **Ex-propietario tras ejecución**: Lanzamiento judicial, el más predecible

### 2. Vulnerabilidad del ocupante
Si el ocupante acredita vulnerabilidad social, los plazos se alargan significativamente (hasta 24 meses en algunos casos).

### 3. Partido judicial
La saturación del juzgado local afecta enormemente. Juzgados de grandes ciudades pueden duplicar los plazos medios.

## Cómo calcular el descuento necesario

Para que la inversión en un ocupado sea rentable:

| Concepto | Cálculo |
|----------|---------|
| Valor libre de cargas | 150.000 € |
| Coste estimado desalojo | -10.000 € |
| Coste reforma estimado | -20.000 € |
| Margen mínimo (20%) | -30.000 € |
| **Precio máximo de compra** | **90.000 €** |
| **Descuento necesario** | **40%** |

## Vías legales disponibles

### Vía civil (desahucio por precario)
- Plazo: 6-12 meses
- Coste: 3.000-6.000 €
- Certeza: Alta

### Vía penal (usurpación art. 245.2 CP)
- Plazo: Variable (3-18 meses)
- Coste: 2.000-5.000 €
- Certeza: Media-baja

### Negociación directa (cash for keys)
- Plazo: 15-60 días
- Coste: 3.000-15.000 € (compensación)
- Certeza: Alta si se ejecuta bien

> ⚠️ **Disclaimer**: Los datos son orientativos y varían según las circunstancias de cada caso. Consulta siempre con un abogado especializado.`,
  },
  {
    slug: "tipos-ocupacion-descuentos",
    title: "Tipos de ocupación y descuentos reales en el mercado español",
    excerpt: "Ocupado legal vs okupa vs desahucio en marcha: qué descuentos puedes esperar según el tipo de ocupación del inmueble.",
    category: "Ocupados",
    date: "2026-03-04",
    readTime: "10 min",
    featured: true,
    content: `## Los tres tipos de ocupación

### 1. Ocupación legal (inquilino moroso)
El ocupante tiene o tuvo un contrato de alquiler válido pero ha dejado de pagar. Es el escenario más predecible legalmente.

**Descuento típico: 25-40%** sobre valor de mercado libre.

**Ventajas para el inversor:**
- Procedimiento de desahucio claro y regulado (LAU)
- Plazos relativamente predecibles
- Menor desgaste del inmueble habitualmente

### 2. Ocupación ilegal (okupas)
Personas que han accedido al inmueble sin ningún título habilitante. La complejidad legal ha disminuido con las últimas reformas pero sigue siendo el escenario más impredecible.

**Descuento típico: 40-65%** sobre valor de mercado libre.

**Riesgos principales:**
- Daños potenciales al inmueble
- Plazos más impredecibles
- Posible necesidad de vía penal

### 3. Desahucio en marcha
El procedimiento judicial ya está iniciado. El inversor compra sabiendo que hay un desalojo en curso con fecha previsible.

**Descuento típico: 20-35%** sobre valor de mercado libre.

**Ventajas:**
- Plazo más acotado
- Menor incertidumbre
- Posibilidad de calcular ROI con mayor precisión

## Tabla resumen de descuentos

| Tipo ocupación | Descuento | Plazo desocupación | Riesgo |
|---------------|-----------|-------------------|--------|
| Moroso LAU | 25-40% | 3-8 meses | Bajo-Medio |
| Okupa | 40-65% | 6-18 meses | Alto |
| Desahucio en marcha | 20-35% | 2-6 meses | Bajo |
| Ex-propietario | 30-50% | 4-12 meses | Medio |

## ¿Qué perfil de inversor eres?

- **Conservador**: Busca desahucios en marcha o morosos con contrato
- **Moderado**: Acepta okupas con descuento >50% y plan legal claro
- **Agresivo**: Busca máximo descuento asumiendo incertidumbre y plazos largos

> ⚠️ **Contenido formativo, no constituye asesoramiento profesional.** Consulta siempre con un especialista.`,
  },
  {
    slug: "ocupado-45-descuento-compras-o-esperas",
    title: "Ocupado con 45% descuento: ¿lo compras o esperas a que esté libre?",
    excerpt: "Análisis comparativo entre comprar un inmueble ocupado con descuento o esperar a que salga libre al mercado. Números reales.",
    category: "Ocupados",
    date: "2026-03-01",
    readTime: "11 min",
    content: `## El dilema del inversor

Imagina un piso en Madrid valorado en 180.000 € que se vende ocupado por 99.000 € (45% de descuento). ¿Merece la pena comprarlo o es mejor esperar a que salga libre?

## Escenario A: Comprar ocupado

| Concepto | Importe |
|----------|---------|
| Precio de compra | 99.000 € |
| ITP (6% Madrid) | 5.940 € |
| Gastos notaría/registro | 2.500 € |
| Costes desalojo | 6.000 € |
| Reforma post-desalojo | 18.000 € |
| **Inversión total** | **131.440 €** |
| Valor de mercado libre | 180.000 € |
| **Beneficio bruto** | **48.560 €** |
| **ROI** | **37%** |

**Tiempo estimado**: 10-14 meses (desalojo + reforma + venta)

## Escenario B: Comprar libre en mercado

| Concepto | Importe |
|----------|---------|
| Precio de compra | 175.000 € |
| ITP (6% Madrid) | 10.500 € |
| Gastos notaría/registro | 3.000 € |
| Reforma ligera | 8.000 € |
| **Inversión total** | **196.500 €** |
| Valor de mercado (reformado) | 210.000 € |
| **Beneficio bruto** | **13.500 €** |
| **ROI** | **6,9%** |

## Veredicto

El ocupado genera **5,4x más rentabilidad** pero requiere:
- Tolerancia a la incertidumbre de plazos
- Capital para aguantar sin ingresos durante el desalojo
- Conocimiento legal o asesoramiento profesional

> ⚠️ **Contenido formativo. Los números son ilustrativos y varían según localización y circunstancias.**`,
  },
  {
    slug: "checklist-15-docs-antes-firmar-ocupado",
    title: "Checklist Ikesa: 15 documentos imprescindibles antes de firmar un ocupado",
    excerpt: "La lista definitiva de documentación que debes revisar antes de comprar un inmueble ocupado. No firmes sin verificar estos 15 puntos.",
    category: "Ocupados",
    date: "2026-02-27",
    readTime: "9 min",
    content: `## Checklist de 15 documentos

Antes de firmar la compra de un inmueble ocupado, verifica TODOS estos documentos:

### Documentación registral
1. ✅ **Nota simple actualizada** (< 15 días) – Titularidad, cargas y descripción
2. ✅ **Certificación de cargas** – Detalle completo de gravámenes
3. ✅ **Referencia catastral** – Coincidencia con el Registro

### Documentación ocupacional
4. ✅ **Informe de ocupación** – Tipo de ocupante, antigüedad estimada
5. ✅ **Contrato de alquiler** (si existe) – Condiciones, vigencia, renta
6. ✅ **Demandas en curso** – Procedimientos judiciales activos
7. ✅ **Certificado de empadronamiento** – Quién está empadronado

### Documentación urbanística
8. ✅ **Cédula de habitabilidad** – Vigente o posibilidad de obtenerla
9. ✅ **Licencia de primera ocupación** – Estado y validez
10. ✅ **Certificado de no infracción urbanística** – Expedientes abiertos

### Documentación económica
11. ✅ **Certificado de deuda de comunidad** – Cuotas y derramas pendientes
12. ✅ **Último recibo IBI** – Importe y titularidad
13. ✅ **Certificado energético** – Obligatorio para transmisión
14. ✅ **Tasación o valoración actualizada** – Valor real de mercado

### Documentación fiscal
15. ✅ **Informe fiscal de la operación** – ITP aplicable, plusvalía estimada

## 7 señales ROJAS

🚩 Cargas anteriores a la hipoteca ejecutada que NO se cancelan
🚩 Ocupante con menores o personas vulnerables declaradas
🚩 Procedimiento judicial paralizado sin causa aparente
🚩 Discrepancias entre Registro y Catastro en superficie
🚩 Derramas pendientes superiores a 5.000 €
🚩 Zona con precios a la baja sostenida (> 2 años)
🚩 Vendedor que presiona para cerrar sin plazo de due diligence

> ⚠️ **Disclaimer**: Este contenido es formativo. Consulta siempre con profesionales antes de tomar decisiones de inversión.`,
  },
  {
    slug: "cash-for-keys-negociar-salida-ocupante",
    title: "Cash for keys: cómo negociar la salida voluntaria del ocupante",
    excerpt: "Guía práctica sobre la estrategia de compensación económica al ocupante para evitar procedimientos judiciales largos y costosos.",
    category: "Ocupados",
    date: "2026-02-24",
    readTime: "8 min",
    content: `## ¿Qué es el cash for keys?

El **cash for keys** es una estrategia donde el propietario ofrece una compensación económica al ocupante a cambio de que abandone el inmueble voluntariamente. Es una alternativa al desahucio judicial que puede ahorrar meses y miles de euros.

## ¿Cuándo tiene sentido?

- Coste estimado del desahucio judicial > 5.000 €
- Plazo judicial estimado > 6 meses
- El ocupante muestra disposición al diálogo
- El inmueble sufre deterioro progresivo

## Importes habituales

| Tipo de ocupante | Compensación típica | Plazo de salida |
|-----------------|--------------------|-----------------| 
| Inquilino moroso | 1.500-4.000 € | 15-30 días |
| Okupa reciente (< 6 meses) | 2.000-5.000 € | 15-45 días |
| Okupa consolidado (> 1 año) | 4.000-10.000 € | 30-60 días |
| Familia con menores | 5.000-15.000 € | 30-90 días |

## Cómo estructurar el acuerdo

1. **Contacto inicial** a través de mediador profesional
2. **Propuesta escrita** con importe y condiciones
3. **Acuerdo notarial** con entrega de llaves y firma
4. **Pago** el día de la entrega efectiva del inmueble
5. **Acta de entrega** documentando el estado

## Cláusulas imprescindibles

- Fecha límite de abandono
- Estado en que debe entregarse el inmueble
- Renuncia a reclamaciones futuras
- Penalización por incumplimiento
- Pago condicionado a entrega efectiva

> ⚠️ **Contenido formativo. Consulta con un abogado para redactar el acuerdo.**`,
  },
  {
    slug: "estrategias-inversion-ocupados-2026",
    title: "5 estrategias de inversión en inmuebles ocupados para 2026",
    excerpt: "Las estrategias más rentables para operar con activos ocupados en el mercado actual, con análisis de riesgo-rentabilidad para cada una.",
    category: "Ocupados",
    date: "2026-02-20",
    readTime: "12 min",
    content: `## Estrategia 1: Compra con descuento + desocupación

La estrategia clásica: adquirir con descuento del 40-60%, gestionar el desalojo y vender libre.

**TIR esperada**: 25-50% anual
**Riesgo**: Medio-Alto
**Capital mínimo**: 50.000-80.000 €

## Estrategia 2: Compra + reforma + alquiler

Comprar ocupado, desalojar, reformar y poner en alquiler. Estrategia de renta a largo plazo.

**Yield bruto**: 8-12% anual
**Riesgo**: Medio
**Capital mínimo**: 70.000-120.000 €

## Estrategia 3: Flip rápido pre-desocupación

Comprar a gran descuento y revender a otro inversor con descuento menor, sin esperar al desalojo.

**Margen típico**: 10-20% en 30-90 días
**Riesgo**: Bajo
**Capital mínimo**: 30.000-60.000 €

## Estrategia 4: Regularización del ocupante

Negociar un contrato de alquiler con el ocupante actual, legalizando la situación sin desalojar.

**Yield bruto**: 6-9% anual
**Riesgo**: Bajo-Medio
**Capital mínimo**: 40.000-80.000 €

## Estrategia 5: Portfolio de ocupados

Construir una cartera diversificada de 5-10 activos ocupados para diluir riesgos individuales.

**TIR esperada portfolio**: 20-35% anual
**Riesgo**: Medio (diversificado)
**Capital mínimo**: 200.000-500.000 €

> ⚠️ **Disclaimer**: Las rentabilidades son estimativas. Resultados pasados no garantizan resultados futuros.`,
  },
  {
    slug: "marco-legal-ocupados-espana-2026",
    title: "Marco legal de inmuebles ocupados en España: guía actualizada 2026",
    excerpt: "Legislación vigente sobre desahucios, ocupación ilegal y derechos del propietario. LAU, LEC y reformas recientes.",
    category: "Ocupados",
    date: "2026-02-17",
    readTime: "13 min",
    content: `## Legislación aplicable

### Ley de Arrendamientos Urbanos (LAU)
Regula la relación arrendaticia y los procedimientos de desahucio por impago de alquiler.

- **Art. 27.2.a**: Falta de pago como causa de resolución
- **Plazo de enervación**: El inquilino puede evitar el desahucio pagando todo lo adeudado (solo primera vez)
- **Desahucio exprés**: Procedimiento monitorio para impago de rentas

### Ley de Enjuiciamiento Civil (LEC)
Regula los procedimientos de desahucio y los lanzamientos judiciales.

- **Art. 250.1.4º**: Juicio verbal de desahucio por falta de pago
- **Art. 440.3**: Requerimiento de pago o desalojo en 10 días
- **Art. 549**: Ejecución del lanzamiento

### Código Penal
- **Art. 245.1**: Usurpación con violencia o intimidación (pena de prisión)
- **Art. 245.2**: Usurpación sin violencia (pena de multa)
- **Art. 202**: Allanamiento de morada

## Reformas recientes

### Ley de Eficiencia Procesal (2025)
- Agilización de los procedimientos de desahucio
- Nuevos plazos para la ejecución de lanzamientos
- Mediación obligatoria previa en determinados supuestos

### Protección de vulnerables
- Suspensión de lanzamientos para hogares vulnerables
- Alternativa habitacional como requisito en algunos casos
- Servicios sociales deben intervenir antes del desalojo

## Derechos del propietario

1. **Derecho a la posesión** pacífica de sus bienes
2. **Acción de desahucio** por las vías legales establecidas
3. **Indemnización** por daños causados al inmueble
4. **Cobro de rentas** devengadas durante la ocupación

> ⚠️ **Este contenido es informativo y no constituye asesoramiento legal.**`,
  },
  {
    slug: "plan-b-desocupacion-se-eterniza",
    title: "Plan B cuando la desocupación se eterniza: opciones para el inversor",
    excerpt: "Qué hacer cuando el proceso de desalojo se alarga más de lo previsto. Alternativas rentables mientras esperas.",
    category: "Ocupados",
    date: "2026-02-14",
    readTime: "7 min",
    content: `## Cuando los plazos no se cumplen

Es habitual que un desalojo que se estimaba en 6 meses acabe durando 12 o más. ¿Qué opciones tienes?

## Opción 1: Negociación tardía (cash for keys)
Incluso con un procedimiento judicial avanzado, puede merecer la pena ofrecer una compensación para acelerar la salida.

## Opción 2: Venta del activo a otro inversor
Vender el inmueble con el procedimiento en curso a otro inversor que asuma la gestión. Perderás margen pero recuperarás capital.

## Opción 3: Refinanciación
Si has financiado la compra, negocia con tu entidad una extensión de carencia o de plazo.

## Opción 4: Regularización con el ocupante
Si el ocupante tiene capacidad de pago, convertirlo en inquilino legal puede ser la solución más rápida y menos costosa.

## Opción 5: Ampliación del portfolio
Utiliza el tiempo de espera para adquirir nuevos activos que generen flujo de caja mientras el primero se desocupa.

## Lecciones aprendidas

- Siempre contempla un **50% más de plazo** del estimado
- Reserva un **colchón del 15-20%** sobre el presupuesto
- Diversifica: nunca tengas un solo activo ocupado

> ⚠️ **Contenido formativo, no asesoramiento profesional.**`,
  },

  // ── CESIONES DE REMATE (8 artículos) ──
  {
    slug: "que-es-cesion-remate-judicial",
    title: "¿Qué es una cesión de remate judicial y cómo funciona?",
    excerpt: "Guía completa sobre cesiones de remate: qué son, marco legal, diferencias con la subasta BOE y por qué son tan rentables para inversores.",
    category: "CDR",
    date: "2026-03-05",
    readTime: "12 min",
    featured: true,
    content: `## ¿Qué es una cesión de remate?

Una **cesión de remate judicial** es la transferencia de los derechos de adjudicación de un inmueble subastado judicialmente. El ejecutante (normalmente un banco o fondo) que se adjudicó el inmueble en subasta, cede su derecho a un tercero (el inversor) antes de inscribir la propiedad a su nombre.

## ¿Por qué los bancos ceden remates?

Los bancos no quieren ser propietarios inmobiliarios. Cuando se adjudican un inmueble en subasta:
- Deben provisionar el activo en balance
- Asumen costes de mantenimiento y gestión
- Pierden flexibilidad regulatoria

Por eso, ceden el remate con un **descuento adicional del 10-25%** sobre el precio de adjudicación.

## Diferencia con la subasta BOE

| Concepto | Subasta BOE | Cesión de remate |
|----------|-------------|-----------------|
| Participas en puja | Sí | No |
| Riesgo de sobrepujar | Alto | Nulo |
| Precio | Variable | Negociado |
| Competencia | Alta (pública) | Baja (privado) |
| Depósito | 5-20% | Según acuerdo |

## Marco legal

La cesión de remate está regulada en la **Ley de Enjuiciamiento Civil**:
- **Art. 647**: Posibilidad de cesión por el ejecutante
- **Art. 672**: Condiciones y plazos

El juzgado debe aprobar la cesión mediante decreto.

## Proceso paso a paso

1. **Identificación**: El banco se adjudica un inmueble en subasta
2. **Oferta de cesión**: El banco busca cesionarios (inversores)
3. **Negociación**: Precio, condiciones y plazos
4. **Solicitud al juzgado**: Petición de aprobación de la cesión
5. **Decreto de aprobación**: El juez autoriza la cesión
6. **Inscripción registral**: A nombre del cesionario final

## Ventajas para el inversor

- ✅ Sin riesgo de subasta (resultado ya cerrado)
- ✅ Precio negociado (no competitivo)
- ✅ Título ejecutivo judicial
- ✅ Cancelación de cargas posteriores
- ✅ Menor competencia que en subastas públicas

> ⚠️ **Contenido formativo. Consulta con profesionales antes de invertir.**`,
  },
  {
    slug: "diferencias-precio-adjudicacion-cesion",
    title: "Diferencias clave entre precio de adjudicación y precio de cesión",
    excerpt: "Entiende la diferencia entre lo que costó el remate y lo que pagarás por la cesión. Análisis del margen real del inversor.",
    category: "CDR",
    date: "2026-03-02",
    readTime: "8 min",
    content: `## Precio de adjudicación vs. precio de cesión

### Precio de adjudicación
Es el importe por el que el ejecutante (banco) se adjudicó el inmueble en la subasta judicial. Puede ser:
- El 50% del valor de tasación (subasta sin postores, vivienda habitual)
- El 70% del valor de tasación (mejor postor por encima del mínimo)
- Otro porcentaje según las circunstancias

### Precio de cesión
Es el importe que el cesionario (inversor) pagará al cedente (banco). Incluye:
- Importe de la adjudicación
- Prima del cedente (puede ser negativa si el banco cede con descuento)
- Gastos de formalización

## ¿Por qué el precio de cesión suele ser menor?

El banco busca desprenderse del activo rápidamente:
- **Provisiones regulatorias**: Mantener el activo en balance tiene coste
- **Gestión del ocupante**: Si está ocupado, el banco no quiere gestionar el desalojo
- **Velocidad**: Prefieren liquidez inmediata a margen futuro

## Ejemplo práctico

| Concepto | Importe |
|----------|---------|
| Valor de tasación | 200.000 € |
| Precio adjudicación (subasta desierta, 50%) | 100.000 € |
| Precio de cesión (descuento 20%) | 80.000 € |
| **Descuento total sobre tasación** | **60%** |
| **Descuento sobre valor mercado real** | **45-55%** |

> ⚠️ **Contenido formativo, no asesoramiento.**`,
  },
  {
    slug: "como-encontrar-cesiones-remate",
    title: "Cómo encontrar cesiones de remate: fuentes y timing perfecto",
    excerpt: "Dónde buscar cesiones de remate, qué señales indican oportunidad inminente y cómo posicionarse antes que la competencia.",
    category: "CDR",
    date: "2026-02-28",
    readTime: "10 min",
    content: `## Fuentes de cesiones de remate

### 1. Servicers bancarios
Los principales servicers en España gestionan los activos adjudicados de los bancos:
- Haya Real Estate (CaixaBank)
- Servihabitat (CaixaBank)
- Altamira (Santander)
- Aliseda (Banco Popular/Santander)

### 2. Fondos de inversión
Los fondos que compraron carteras masivas ahora venden activos individuales:
- Cerberus, Lone Star, Blackstone
- Carteras en fase de liquidación

### 3. Plataformas especializadas
Plataformas como **Ikesa** que agregan y analizan cesiones de remate disponibles.

### 4. Contacto directo con procuradores
Los procuradores que gestionan ejecuciones hipotecarias conocen qué bancos ceden y cuándo.

## Timing perfecto

El momento óptimo para comprar una cesión de remate es:
- **30-90 días post-adjudicación**: El banco aún no ha inscrito y busca cesionario
- **Fin de trimestre/año**: Los bancos aceleran ventas para cumplir objetivos
- **Post-provisión regulatoria**: Cuando el BCE exige reducir exposición NPE

## Señales de cesión inminente

🔍 Subasta desierta reciente → el banco se adjudicó por debajo del 50%
🔍 El inmueble NO aparece en portales del servicer → no lo quieren gestionar
🔍 Decreto de adjudicación firme pero sin inscripción registral
🔍 Banco en proceso de fusión o reestructuración

> ⚠️ **Contenido formativo. No constituye asesoramiento de inversión.**`,
  },
  {
    slug: "cesiones-remate-ocupadas-vs-libres",
    title: "Cesiones de remate: ocupadas vs libres. Diferencias en valoración y riesgo",
    excerpt: "Análisis detallado de cómo el estado ocupacional del inmueble afecta al precio de la cesión, al riesgo y a la estrategia de salida.",
    category: "CDR",
    date: "2026-02-25",
    readTime: "9 min",
    content: `## El factor ocupacional en las cesiones

El estado de ocupación del inmueble es el factor que más impacta en el precio de la cesión de remate.

## Cesión libre (inmueble vacío)

| Aspecto | Detalle |
|---------|---------|
| Descuento típico | 15-30% sobre mercado |
| Plazo hasta venta/alquiler | 1-3 meses |
| Riesgo | Bajo |
| Competencia | Alta |

## Cesión ocupada

| Aspecto | Detalle |
|---------|---------|
| Descuento típico | 35-60% sobre mercado |
| Plazo hasta venta libre | 6-18 meses |
| Riesgo | Medio-Alto |
| Competencia | Baja |

## ¿Cuál es más rentable?

Paradójicamente, las cesiones ocupadas suelen ofrecer mayor rentabilidad absoluta, pero requieren:
- Mayor capital de reserva
- Conocimiento legal o asesoramiento especializado
- Tolerancia a plazos más largos

## Caso comparativo

### Cesión libre
- Precio cesión: 85.000 € | Valor mercado: 120.000 € | **ROI: 41%** en 3 meses

### Cesión ocupada
- Precio cesión: 55.000 € | Gastos desalojo: 8.000 € | Reforma: 15.000 € | Valor mercado: 120.000 € | **ROI: 54%** en 12 meses

> ⚠️ **Los cálculos son orientativos. Consulta con profesionales.**`,
  },
  {
    slug: "clausulas-trampa-cesiones-remate",
    title: "Cláusulas trampa en cesiones de remate: qué vigilar antes de firmar",
    excerpt: "Las 8 cláusulas más peligrosas en contratos de cesión de remate y cómo protegerte como inversor.",
    category: "CDR",
    date: "2026-02-21",
    readTime: "7 min",
    content: `## 8 cláusulas trampa habituales

### 1. Cesión "en el estado en que se encuentre"
El cedente se desentiende de cualquier problema no visible. Exige siempre una due diligence previa.

### 2. Plazo de pago irreal
Algunas cesiones exigen el pago total en 15-30 días. Negocia plazos razonables o pagos escalonados.

### 3. Sin garantía de inscripción
El cedente no garantiza que la cesión sea aprobada por el juzgado. Incluye cláusula de devolución del depósito.

### 4. Cargas no declaradas
Verifica SIEMPRE las cargas anteriores a la hipoteca ejecutada. Estas NO se cancelan con el remate.

### 5. Gastos de comunidad ocultos
Las deudas con la comunidad de propietarios son legalmente del inmueble, no del propietario anterior.

### 6. Cesión parcial
A veces se cede solo una parte de la finca o una cuota indivisa. Lee la descripción registral con lupa.

### 7. Reserva de precio
El cedente puede incluir una cláusula que le permita revocar la cesión si recibe una oferta mejor.

### 8. ITP a cargo del cesionario
Aclara quién paga los impuestos de transmisión. En muchas cesiones, el ITP recae sobre el cesionario.

## Cómo protegerte

- ✅ Abogado especializado revise el contrato ANTES de firmar
- ✅ Nota simple actualizada del Registro
- ✅ Certificado de deuda de la comunidad
- ✅ Cláusula de resolución si no se aprueba judicialmente
- ✅ Depósito en cuenta de tercero (escrow) hasta aprobación

> ⚠️ **Contenido formativo. Consulta siempre con un abogado.**`,
  },
  {
    slug: "ley-eficiencia-procesal-cesiones-remate",
    title: "Ley de Eficiencia Procesal: por qué se disparan las cesiones de remate",
    excerpt: "Cómo la nueva ley ha cambiado las reglas del juego en subastas judiciales y por qué las cesiones de remate son ahora más atractivas.",
    category: "CDR",
    date: "2026-02-18",
    readTime: "10 min",
    content: `## Cambios clave de la Ley de Eficiencia Procesal

### 1. Depósito del 20% para licitar
Antes se exigía un 5%. Ahora el depósito para participar en subastas es del 20% del valor de tasación. Esto **reduce drásticamente la competencia** en subastas.

### 2. Pujas secretas
Las pujas ahora son secretas hasta el cierre de la subasta. Esto introduce más incertidumbre para los licitadores.

### 3. Mayor actividad pre-subasta
Ante la mayor barrera de entrada, muchos inversores prefieren las **cesiones de remate** y **cesiones de crédito** como alternativas más seguras.

## Impacto en el mercado de cesiones

| Indicador | Antes de la ley | Después de la ley |
|-----------|----------------|-------------------|
| Subastas con postores | 35-45% | 20-30% |
| Subastas desiertas | 55-65% | 70-80% |
| Cesiones de remate | Nicho | En crecimiento |
| Precio medio cesiones | -15% sobre adjudicación | -20% sobre adjudicación |

## ¿Por qué los bancos ceden más?

Con más subastas desiertas, los bancos se adjudican más inmuebles que no quieren gestionar. Resultado: **más cesiones disponibles y con mejores descuentos**.

## Oportunidad para inversores

- Menos competencia en subastas → más subastas desiertas → más adjudicaciones bancarias → más cesiones de remate
- Los inversores con capital y conocimiento están en posición privilegiada

> ⚠️ **Contenido formativo, no asesoramiento legal o de inversión.**`,
  },
  {
    slug: "fiscalidad-cesiones-remate",
    title: "Fiscalidad de las cesiones de remate: ITP, AJD y plusvalía",
    excerpt: "Qué impuestos se aplican en una cesión de remate judicial y cómo optimizar la carga fiscal según tu estructura de inversión.",
    category: "CDR",
    date: "2026-02-15",
    readTime: "8 min",
    content: `## Tributación de la cesión de remate

### ITP (Impuesto de Transmisiones Patrimoniales)
La cesión de remate tributa por ITP al tipo vigente en cada CCAA, calculado sobre el **valor real del inmueble** (no sobre el precio de cesión si este es inferior).

| CCAA | Tipo ITP |
|------|---------|
| Madrid | 6% |
| Cataluña | 10-11% |
| Andalucía | 7% |
| C. Valenciana | 10% |
| País Vasco | 4-7% |

### ¿ITP o AJD?
- **Cesión de remate**: ITP (transmisión patrimonial onerosa)
- **Adjudicación directa de subasta**: AJD en algunos supuestos

### Plusvalía municipal
Se aplica si hay incremento de valor del terreno urbano. Base: valor catastral del suelo × coeficientes según años de tenencia.

## Persona física vs jurídica

### Persona física
- Ganancia patrimonial en IRPF: 19-28%
- Sin deducción de intereses de financiación

### Sociedad
- IS: 25% (15% nuevas empresas)
- Deducción de gastos e intereses
- Más eficiente para operaciones recurrentes

## Recomendaciones

1. Si haces >2 operaciones/año → constituye sociedad
2. Consulta el ITP de la CCAA ANTES de calcular rentabilidad
3. Incluye SIEMPRE los gastos fiscales en tu modelo financiero

> ⚠️ **Consulta con un asesor fiscal especializado en inmobiliario.**`,
  },
  {
    slug: "due-diligence-express-cesion-remate",
    title: "Due diligence express para cesiones de remate: los 10 puntos críticos",
    excerpt: "Checklist rápido para analizar una cesión de remate en 48 horas. Los 10 puntos que no puedes saltarte.",
    category: "CDR",
    date: "2026-02-12",
    readTime: "7 min",
    content: `## 10 puntos críticos en 48 horas

### 1. Decreto de adjudicación
Verifica que existe y es firme. Sin decreto firme, no hay cesión posible.

### 2. Nota simple actualizada
Comprueba titularidad, descripción y cargas actuales.

### 3. Cargas anteriores
⚠️ Las cargas anteriores a la hipoteca ejecutada NO se cancelan. Si las hay, recalcula tu precio máximo.

### 4. Estado ocupacional
Visita el inmueble o contrata una inspección. ¿Está vacío, ocupado legalmente o por okupa?

### 5. Referencia catastral
Verifica coincidencia entre Registro y Catastro (superficie, uso, localización).

### 6. Deuda de comunidad
Solicita certificado de deuda. Las cuotas impagadas son del inmueble.

### 7. IBI
Verifica el último recibo y la titularidad catastral.

### 8. Estado urbanístico
Consulta al ayuntamiento: ¿hay expedientes, afectaciones o licencias pendientes?

### 9. Valoración de mercado
Compara con inmuebles similares en la zona. No te fíes de tasaciones bancarias antiguas.

### 10. Viabilidad financiera
Modelo completo: precio cesión + ITP + gastos + reforma + desalojo = inversión total vs. valor de mercado libre.

> ⚠️ **Si alguno de estos 10 puntos falla, NO avances sin resolverlo primero.**`,
  },

  // ── SUBASTAS BOE (10 artículos) ──
  {
    slug: "guia-subastas-boe-principiantes",
    title: "Guía de subastas BOE para principiantes: todo lo que necesitas saber",
    excerpt: "Cómo funcionan las subastas judiciales en España, requisitos para participar, tipos de subastas y claves para tu primera puja.",
    category: "Subastas",
    date: "2026-03-04",
    readTime: "15 min",
    featured: true,
    content: `## ¿Qué son las subastas judiciales BOE?

Las subastas judiciales son procedimientos públicos donde se venden bienes embargados o ejecutados para satisfacer deudas. En España se realizan a través del **Portal de Subastas del BOE** (Boletín Oficial del Estado).

## Tipos de subastas

### Subastas judiciales
Ordenadas por un juzgado en procedimientos de ejecución (hipotecaria, laboral, fiscal).

### Subastas notariales
Realizadas ante notario, generalmente para ejecuciones extrajudiciales de hipotecas.

### Subastas administrativas
Convocadas por la administración pública (Hacienda, Seguridad Social, ayuntamientos).

## Cómo participar

### Requisitos
1. DNI/NIE vigente
2. Certificado digital o cl@ve
3. Cuenta bancaria para el depósito
4. Alta en el Portal de Subastas BOE

### Depósito
- **20% del valor de tasación** (reforma 2025)
- Se retiene durante la subasta
- Se devuelve si no resultas adjudicatario

## Proceso de la subasta

1. **Publicación en BOE** (20 días de antelación)
2. **Constitución del depósito** (antes del cierre)
3. **Periodo de pujas** (20 días hábiles desde la apertura)
4. **Cierre y adjudicación**
5. **Pago del remate** (40 días desde aprobación)
6. **Decreto de adjudicación**
7. **Inscripción registral**

## Claves para principiantes

- ✅ **Nunca pujes sin due diligence completa**
- ✅ **Visita el inmueble** (o encarga informe de ocupación)
- ✅ **Calcula tu precio máximo** incluyendo TODOS los gastos
- ✅ **Incluye margen para imprevistos** (15-20% adicional)
- ❌ **No pujes por emociones** – es una inversión, no una compra impulsiva

> ⚠️ **Contenido formativo. Consulta con profesionales antes de participar.**`,
  },
  {
    slug: "12-puntos-checklist-antes-pujar",
    title: "Checklist Ikesa: 12 puntos antes de pujar en una subasta BOE",
    excerpt: "La lista definitiva que revisamos en Ikesa antes de recomendar una puja. El estado ocupacional es el factor más crítico.",
    category: "Subastas",
    date: "2026-02-26",
    readTime: "9 min",
    content: `## Los 12 puntos Ikesa antes de pujar

### Bloque A: Documentación legal
1. ✅ **Nota simple actualizada** – Titularidad y cargas
2. ✅ **Edicto de subasta** – Condiciones y valor de tasación
3. ✅ **Cargas anteriores** – ⚠️ NO se cancelan con el remate

### Bloque B: Estado ocupacional (CRÍTICO)
4. ✅ **Tipo de ocupación** – Libre / moroso / okupa / ex-propietario
5. ✅ **Antigüedad de la ocupación** – Impacta plazos y costes
6. ✅ **Vulnerabilidad del ocupante** – Puede paralizar el lanzamiento
7. ✅ **Coste estimado de desocupación** – Incluir en el cálculo de puja

### Bloque C: Valoración
8. ✅ **Valor de mercado actual** – No usar la tasación del edicto
9. ✅ **Estado de conservación** – Estimación de reforma necesaria
10. ✅ **Liquidez de la zona** – ¿Se vende rápido o tarda?

### Bloque D: Viabilidad financiera
11. ✅ **Modelo financiero completo** – Inversión total vs. valor de salida
12. ✅ **Precio máximo de puja** – Con margen de seguridad del 20%

## Impacto del estado ocupacional en la puja

| Estado | Descuento sobre puja máxima |
|--------|---------------------------|
| Libre/vacío | 0% |
| Moroso con contrato | -15% |
| Okupa reciente | -25% |
| Okupa consolidado | -35% |
| Familia vulnerable | -40% o NO pujar |

> ⚠️ **Si cualquier punto del checklist falla, NO pujes.**`,
  },
  {
    slug: "cancelacion-cargas-posteriores-subasta",
    title: "Cancelación de cargas posteriores en subasta judicial: cómo funciona",
    excerpt: "Qué cargas se cancelan automáticamente con el decreto de adjudicación y cuáles sobreviven. Guía práctica para inversores.",
    category: "Subastas",
    date: "2026-02-22",
    readTime: "8 min",
    content: `## Principio general

En una ejecución hipotecaria, el decreto de adjudicación ordena la **cancelación de todas las cargas posteriores** a la hipoteca ejecutada. Las cargas **anteriores** a la hipoteca ejecutada **NO se cancelan**.

## ¿Qué se cancela?

- ✅ Hipotecas posteriores
- ✅ Embargos posteriores
- ✅ Anotaciones preventivas posteriores
- ✅ La propia hipoteca ejecutada

## ¿Qué NO se cancela?

- ❌ Cargas anteriores a la hipoteca ejecutada
- ❌ Servidumbres (generalmente)
- ❌ Afecciones urbanísticas
- ❌ Derechos reales inscritos con anterioridad

## Ejemplo práctico

Un inmueble con las siguientes cargas (por fecha de inscripción):
1. Servidumbre de paso (2005) → **NO se cancela**
2. Hipoteca Banco A (2008) → **SE EJECUTA y cancela**
3. Embargo AEAT (2015) → **SE CANCELA** (posterior)
4. Hipoteca Banco B (2018) → **SE CANCELA** (posterior)

## Procedimiento de cancelación

1. Decreto de adjudicación firme
2. Mandamiento de cancelación al Registro
3. El Registrador cancela las cargas posteriores
4. Nueva nota simple limpia (solo cargas anteriores)

> ⚠️ **Verifica SIEMPRE las cargas anteriores antes de pujar. Son tu responsabilidad.**`,
  },
  {
    slug: "subastas-desiertas-oportunidad-inversor",
    title: "Subastas desiertas: la gran oportunidad que nadie ve",
    excerpt: "Por qué las subastas sin postores son una fuente de oportunidades y cómo aprovecharlas a través de cesiones de remate.",
    category: "Subastas",
    date: "2026-02-19",
    readTime: "7 min",
    content: `## ¿Qué pasa cuando una subasta queda desierta?

Cuando nadie puja en una subasta judicial, el ejecutante (banco) puede:
1. **Adjudicarse el inmueble** por el 50-70% del valor de tasación
2. **Solicitar nueva subasta** (poco habitual)

## Por qué quedan desiertas

- Depósito del 20% disuade a muchos inversores
- Inmueble ocupado con desalojo complejo
- Cargas anteriores elevadas
- Ubicación con poca demanda

## La oportunidad

Cuando el banco se adjudica un inmueble que no quiere, busca:
- **Ceder el remate** a un inversor con descuento adicional
- **Vender a través de servicer** (más lento, precio similar)

## Cifras del mercado

- El **70-80% de las subastas** quedan desiertas post-reforma 2025
- Los bancos ceden con descuentos del **15-25% adicional**
- Hay más oportunidades que nunca para inversores con capital y conocimiento

> ⚠️ **Contenido formativo. Los datos son estimativos.**`,
  },

  // ── NPL ──
  {
    slug: "que-es-npl-inmobiliario",
    title: "¿Qué es un NPL inmobiliario y cómo analizarlo?",
    excerpt: "Guía completa sobre Non-Performing Loans: qué son, cómo funcionan, qué analizar antes de invertir y cómo calcular la rentabilidad real.",
    category: "NPL",
    date: "2026-02-28",
    readTime: "12 min",
    content: `## ¿Qué es un NPL?

Un **NPL (Non-Performing Loan)** es un préstamo hipotecario cuyo deudor ha dejado de pagar durante al menos 90 días. Los bancos venden estos créditos con descuento para sanear sus balances.

## ¿Por qué invertir en NPL?

La inversión en NPL permite adquirir deuda hipotecaria a **descuentos del 40-70%** sobre el valor de mercado del inmueble subyacente.

## Opciones del inversor tras comprar el crédito

1. **Negociar con el deudor**: Quita, dación en pago o acuerdo de pago
2. **Ejecutar la garantía**: Proceso judicial para obtener el inmueble
3. **Revender el crédito**: A otro inversor o fondo

## ¿Qué analizar?

### 1. Ratio Deuda / Valor de Mercado (LTV)
LTV bajo (< 60%) = mayor margen de seguridad.

### 2. Estado judicial del procedimiento
- Pre-judicial: Mayor margen de negociación
- En ejecución: Plazos más predecibles
- Con subasta señalada: Cerca de resolución

### 3. Estado ocupacional
- Vacío: Posesión inmediata tras ejecución
- Ocupado por deudor: Negociación más factible
- Ocupado por terceros: Mayor complejidad

### 4. Cargas registrales
Verificar cargas anteriores a la hipoteca.

## Cálculo de rentabilidad

| Concepto | Importe |
|----------|---------|
| Precio de compra del crédito | 45.000 € |
| Gastos judiciales estimados | 8.000 € |
| Gastos de reforma | 15.000 € |
| **Inversión total** | **68.000 €** |
| Valor de mercado del inmueble | 120.000 € |
| **Beneficio bruto** | **52.000 €** |
| **ROI** | **76%** |

> ⚠️ **Los cálculos son orientativos. Consulta con profesionales.**`,
  },
  {
    slug: "colaterales-post-remate-ocupantes",
    title: "Colaterales post-remate con ocupantes: valoración e impacto",
    excerpt: "Cómo valorar un crédito NPL cuando el inmueble colateral ya ha sido rematado pero sigue ocupado. Impacto del -25 al -50% en el valor.",
    category: "NPL",
    date: "2026-02-22",
    readTime: "9 min",
    content: `## El problema del colateral ocupado

Cuando un banco ejecuta una hipoteca y se adjudica el inmueble en subasta, pero este está ocupado, el valor real del colateral puede ser **un 25-50% inferior** al valor libre.

## Impacto en la valoración

| Estado | Descuento sobre valor libre |
|--------|---------------------------|
| Libre/vacío | 0% |
| Ocupado con contrato LAU | -15 a -25% |
| Ocupado sin título (okupa) | -30 a -50% |
| Ocupado con vulnerables | -40 a -60% |

## Estrategias de salida

### 1. Cesión de remate + gestión desocupación
Ceder el remate a precio de ocupado y dejar que el cesionario gestione.

### 2. Negociación con ocupante
Cash for keys antes de vender o ceder.

### 3. Venta como activo ocupado
Vender a un inversor especializado en desocupaciones.

### 4. Portfolio approach
Incluir el activo ocupado en una cartera mixta (ocupados + libres) para diluir riesgo.

## Lección clave

Al analizar NPLs, **siempre** ajusta el valor del colateral por el estado ocupacional. Un NPL con colateral "libre" a 60.000 € puede ser mejor inversión que uno a 40.000 € con colateral ocupado.

> ⚠️ **Contenido formativo, no asesoramiento profesional.**`,
  },
  {
    slug: "mercado-npl-espana-2026-tendencias",
    title: "Mercado NPL en España 2026: tendencias y oportunidades",
    excerpt: "Análisis del mercado de deuda distressed en España: volumen, principales players, zonas con mejor rentabilidad y previsiones.",
    category: "NPL",
    date: "2026-02-15",
    readTime: "8 min",
    content: `## Estado del mercado NPL

El mercado español de deuda distressed se encuentra en un momento de **madurez selectiva**. El valor está ahora en la **selección granular** de activos individuales.

## Tendencias clave 2026

### 1. Del volumen a la calidad
Los grandes fondos han digerido las carteras masivas. La oportunidad está en activos individuales con buen ratio LTV.

### 2. Inversores particulares
Family offices e inversores particulares acceden cada vez más gracias a plataformas como Ikesa.

### 3. Digitalización
Las subastas electrónicas y plataformas online han democratizado el acceso.

### 4. Nuevas regulaciones
La Ley de Eficiencia Procesal incentiva operaciones pre-subasta.

## Zonas con mayor oportunidad

| Zona | Descuento medio | Liquidez | Scoring |
|------|-----------------|----------|---------|
| Madrid capital | 35-45% | Alta | ⭐⭐⭐⭐⭐ |
| Costa del Sol | 40-55% | Alta | ⭐⭐⭐⭐ |
| Valencia ciudad | 45-60% | Media | ⭐⭐⭐⭐ |
| Sevilla capital | 40-55% | Media | ⭐⭐⭐⭐ |
| Interior peninsular | 55-75% | Baja | ⭐⭐⭐ |

## Previsiones

Se espera un **incremento del 15-20%** en operaciones minoristas durante 2026.

> ⚠️ **Contenido formativo. Las previsiones no garantizan resultados.**`,
  },

  // ── FISCAL & LEGAL ──
  {
    slug: "fiscalidad-inmobiliaria-por-ccaa",
    title: "Fiscalidad inmobiliaria en España por Comunidad Autónoma (2026)",
    excerpt: "ITP, AJD, plusvalía municipal y otros impuestos clave por CCAA. Diferencias entre persona física y jurídica.",
    category: "Fiscal",
    date: "2026-02-10",
    readTime: "15 min",
    content: `## ITP por Comunidad Autónoma

| CCAA | Tipo general | Tipo reducido |
|------|-------------|--------------|
| Madrid | 6% | 6% |
| Cataluña | 10-11% | 5% (< 300.000 €) |
| Andalucía | 7% | 3,5% (menores 35) |
| C. Valenciana | 10% | 8% |
| País Vasco | 4-7% | 4% |
| Galicia | 9-10% | 7% |

## Persona física vs jurídica

### Persona física
- IRPF: 19-28% ganancia patrimonial
- No deduce gastos de financiación
- Exención por reinversión en vivienda habitual

### Sociedad
- IS: 25% (15% nuevas empresas)
- Deducción de gastos e intereses
- SOCIMI: 0% si cumple requisitos

## Recomendaciones

1. Consulta asesor fiscal especializado
2. Analiza la CCAA antes de calcular rentabilidad
3. Evalúa persona física vs sociedad según volumen
4. Incluye gastos notariales y registrales (1-2%)

> ⚠️ **Consulta con un asesor fiscal antes de operar.**`,
  },
  {
    slug: "due-diligence-legal-activos",
    title: "Due diligence legal: qué revisar antes de comprar un activo",
    excerpt: "Checklist completo de verificación legal para inversores: registro, catastro, cargas, urbanismo y más.",
    category: "Legal",
    date: "2026-02-05",
    readTime: "11 min",
    content: `## Checklist de due diligence

### 1. Nota simple del Registro de la Propiedad
- ✅ Titularidad actual
- ✅ Descripción (superficie, linderos)
- ✅ Cargas vigentes
- ✅ Servidumbres
- ✅ Afecciones urbanísticas

### 2. Referencia catastral
- ✅ Coincidencia Registro-Catastro
- ✅ Superficie catastral vs registral
- ✅ Valor catastral
- ✅ Uso catastral

### 3. Urbanismo
- ✅ Clasificación del suelo
- ✅ Licencias de obra y primera ocupación
- ✅ Afectaciones urbanísticas

### 4. Estado posesorio
- ✅ Contratos de alquiler vigentes
- ✅ Tipo de ocupación
- ✅ Demandas en curso

### 5. Comunidad de propietarios
- ✅ Derramas pendientes
- ✅ Cuotas impagadas

## Documentos clave

1. Nota simple actualizada (< 15 días)
2. Certificado catastral
3. Certificado de deuda de la comunidad
4. Último recibo del IBI
5. Cédula de habitabilidad
6. Certificado energético

> ⚠️ **Contenido formativo. Consulta con profesionales.**`,
  },
];
