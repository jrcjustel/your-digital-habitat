export interface AcademyArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: "NPL" | "CDR" | "VSP" | "Fiscal" | "Legal" | "Mercado";
  date: string;
  readTime: string;
  featured?: boolean;
  image?: string;
  content: string;
}

export const academyCategories = [
  { id: "all", label: "Todos", color: "bg-primary/10 text-primary" },
  { id: "NPL", label: "NPL", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { id: "CDR", label: "Cesiones de Remate", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  { id: "VSP", label: "Sin Posesión", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { id: "Fiscal", label: "Fiscal", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  { id: "Legal", label: "Legal", color: "bg-red-500/10 text-red-700 dark:text-red-400" },
  { id: "Mercado", label: "Mercado", color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" },
];

export const academyArticles: AcademyArticle[] = [
  {
    slug: "que-es-un-npl-inmobiliario",
    title: "¿Qué es un NPL inmobiliario y cómo analizarlo?",
    excerpt: "Guía completa sobre Non-Performing Loans: qué son, cómo funcionan, qué analizar antes de invertir y cómo calcular la rentabilidad real.",
    category: "NPL",
    date: "2026-03-05",
    readTime: "12 min",
    featured: true,
    content: `## ¿Qué es un NPL?

Un **NPL (Non-Performing Loan)** es un préstamo hipotecario cuyo deudor ha dejado de pagar durante al menos 90 días. Los bancos y fondos venden estos créditos con descuento para sanear sus balances.

## ¿Por qué invertir en NPL?

La inversión en NPL permite adquirir deuda hipotecaria a **descuentos del 40-70%** sobre el valor de mercado del inmueble subyacente. Al comprar el crédito, el inversor se subroga en la posición del acreedor y tiene varias opciones:

1. **Negociar con el deudor**: Acuerdo de pago, dación en pago o quita parcial
2. **Ejecutar la garantía**: Proceso judicial para obtener el inmueble
3. **Revender el crédito**: A otro inversor o fondo

## ¿Qué analizar antes de invertir?

### 1. Ratio Deuda / Valor de Mercado (LTV)
El indicador más importante. Un LTV bajo (< 60%) indica mayor margen de seguridad.

### 2. Estado judicial del procedimiento
- **Pre-judicial**: Aún no hay demanda. Mayor margen de negociación.
- **En ejecución**: Demanda interpuesta. Plazos más predecibles.
- **Con subasta señalada**: Cerca de la resolución.

### 3. Estado ocupacional
- **Vacío**: Ideal, posesión inmediata.
- **Ocupado por deudor**: Negociación más factible.
- **Ocupado por terceros**: Mayor complejidad legal.

### 4. Cargas registrales
Verificar embargos, servidumbres y cargas anteriores a la hipoteca que NO se cancelan con la ejecución.

### 5. Valoración del inmueble
Comparar con precios de mercado actuales en la zona, no con tasaciones antiguas.

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

> ⚠️ **Disclaimer**: Los cálculos son orientativos. La rentabilidad real depende de múltiples factores (plazos judiciales, estado del inmueble, evolución del mercado).

## Errores comunes

- No verificar las cargas registrales anteriores
- Subestimar los plazos judiciales (12-36 meses)
- No contemplar los costes de reforma
- Ignorar el estado de ocupación
- Basarse en tasaciones desactualizadas`,
  },
  {
    slug: "cesion-de-remate-guia-completa",
    title: "Cesiones de remate (CDR): guía práctica para inversores",
    excerpt: "Cómo funciona una cesión de remate, qué revisar antes de invertir, fases del proceso y nuevas oportunidades con la Ley de Eficiencia Procesal.",
    category: "CDR",
    date: "2026-03-03",
    readTime: "10 min",
    featured: true,
    content: `## ¿Qué es una cesión de remate?

Una **cesión de remate** es la transferencia de los derechos de adjudicación de un inmueble subastado. El adjudicatario original cede su posición a un tercero (el inversor), que adquiere el inmueble en las mismas condiciones de la subasta.

## Ventajas de la cesión de remate

- **Precio inferior al mercado**: el inmueble fue adjudicado en subasta judicial
- **Sin riesgo de subasta**: no participas en la puja, adquieres un resultado ya cerrado
- **Adjudicación judicial firme**: el decreto de adjudicación es un título ejecutivo

## Proceso paso a paso

### 1. Identificación
Localiza oportunidades con cesión de remate disponible en el marketplace de IKESA.

### 2. Análisis documental
- Decreto de adjudicación
- Nota simple actualizada
- Cargas registrales (especialmente las anteriores a la hipoteca)
- Estado posesorio del inmueble

### 3. Negociación
Acuerda con el adjudicatario el precio de la cesión. Normalmente incluye:
- Importe de la adjudicación
- Prima del adjudicatario (su beneficio)
- Gastos de formalización

### 4. Aprobación judicial
El juzgado debe aprobar la cesión. El plazo varía según el partido judicial.

### 5. Inscripción registral
Una vez aprobada, se inscribe la titularidad en el Registro de la Propiedad.

## Ley de Eficiencia Procesal 2025

La nueva ley introduce cambios importantes:
- **Depósito del 20%** para licitar inmuebles (antes 5%)
- **Pujas secretas** hasta el cierre de la subasta
- Mayor actividad **pre-subasta** (cesiones de crédito y remate)

Esto ha disparado el interés en las cesiones de remate como alternativa más segura a la participación directa en subastas.

## Riesgos a considerar

1. **Cargas anteriores**: Las cargas registrales anteriores a la hipoteca ejecutada NO se cancelan
2. **Ocupación**: El inmueble puede estar ocupado, requiriendo desahucio
3. **Plazos judiciales**: La aprobación de la cesión puede demorar varios meses
4. **ITP**: El Impuesto de Transmisiones Patrimoniales varía por CCAA`,
  },
  {
    slug: "activos-sin-posesion-vsp",
    title: "Activos sin posesión (VSP): oportunidades y riesgos",
    excerpt: "Escenarios reales de inmuebles ocupados, cómo evaluar el coste total de recuperación y estrategias de salida rentables.",
    category: "VSP",
    date: "2026-02-28",
    readTime: "9 min",
    content: `## ¿Qué es un activo sin posesión?

Un **activo sin posesión (VSP)** es un inmueble cuya titularidad pertenece al vendedor pero que está ocupado por terceros (inquilinos, precaristas u ocupantes sin título). Se venden con descuentos significativos del **30-60%** respecto al valor de mercado libre.

## Tipos de ocupación

### Ocupación con título
- Contrato de alquiler vigente (LAU)
- Derecho de uso y habitación
- Usufructo

### Ocupación sin título
- Precaristas (ocupantes tolerados sin contrato)
- Ocupación ilegal (okupas)
- Ex-propietarios tras ejecución hipotecaria

## Costes de recuperación

| Concepto | Rango estimado |
|----------|---------------|
| Procedimiento judicial de desahucio | 3.000 – 8.000 € |
| Plazo de desahucio | 6 – 18 meses |
| Posibles daños al inmueble | 5.000 – 25.000 € |
| Reforma / puesta a punto | 10.000 – 40.000 € |

## Estrategias de salida

1. **Venta tras desocupación**: Máximo beneficio, mayor plazo
2. **Negociación con el ocupante**: Acuerdo de salida voluntaria (cash for keys)
3. **Alquiler social**: Acuerdo con el ocupante para regularizar la situación
4. **Venta a otro inversor**: Transferir la oportunidad con margen

## Caso práctico

| Detalle | Importe |
|---------|---------|
| Precio de compra (ocupado) | 55.000 € |
| Gastos legales desahucio | 5.000 € |
| Reforma | 20.000 € |
| **Total invertido** | **80.000 € |
| Valor libre de cargas | 140.000 € |
| **Beneficio potencial** | **60.000 €** |

> ⚠️ Los plazos y costes son estimativos y varían según la jurisdicción y las circunstancias específicas de cada caso.`,
  },
  {
    slug: "fiscalidad-inmobiliaria-por-ccaa",
    title: "Fiscalidad inmobiliaria en España por Comunidad Autónoma (2026)",
    excerpt: "ITP, AJD, plusvalía municipal y otros impuestos clave por CCAA. Diferencias entre persona física y jurídica.",
    category: "Fiscal",
    date: "2026-02-25",
    readTime: "15 min",
    content: `## Impuestos en la compraventa inmobiliaria

### ITP (Impuesto de Transmisiones Patrimoniales)

Se aplica a la compra de inmuebles de segunda mano. Los tipos varían significativamente por CCAA:

| CCAA | Tipo general | Tipo reducido (vivienda habitual) |
|------|-------------|----------------------------------|
| Madrid | 6% | 6% |
| Cataluña | 10-11% | 5% (< 300.000 €) |
| Andalucía | 7% | 3,5% (menores 35 años) |
| C. Valenciana | 10% | 8% |
| País Vasco | 4-7% | 4% |
| Navarra | 6% | 5% |
| Galicia | 9-10% | 7% |

### AJD (Actos Jurídicos Documentados)

Se aplica junto al IVA en obra nueva. Rango del **0,5% al 2%** según CCAA.

### IVA

- **10%** para vivienda nueva
- **21%** para locales, oficinas y garajes (no anejos a vivienda)

## Persona física vs. jurídica

### Persona física
- IRPF: Ganancias patrimoniales del 19% al 28% según tramo
- No deducción de gastos de financiación
- Exención por reinversión en vivienda habitual

### Persona jurídica (Sociedad)
- IS: 25% general, 15% nuevas empresas
- Deducción de gastos e intereses
- SOCIMI: tributación al 0% si se cumplen requisitos

## Plusvalía municipal

Impuesto local sobre el incremento de valor de terrenos urbanos. Se calcula sobre el valor catastral del suelo y el número de años de tenencia. Desde la sentencia del TC, solo se paga si hay ganancia real.

## Recomendaciones

1. **Consulta siempre con un asesor fiscal** especializado en inmobiliario
2. **Analiza la CCAA** donde se ubica el inmueble antes de calcular rentabilidad
3. **Evalúa la estructura** (persona física vs sociedad) según el volumen de operaciones
4. **Ten en cuenta los gastos notariales y registrales** (1-2% adicional)`,
  },
  {
    slug: "due-diligence-legal-activos",
    title: "Due diligence legal: qué revisar antes de comprar un activo",
    excerpt: "Checklist completo de verificación legal para inversores inmobiliarios: registro, catastro, cargas, urbanismo y más.",
    category: "Legal",
    date: "2026-02-20",
    readTime: "11 min",
    content: `## ¿Qué es la due diligence legal?

La **due diligence legal** es el proceso de verificación exhaustiva del estado jurídico de un inmueble antes de su adquisición. Es un paso imprescindible para detectar riesgos ocultos y evitar sorpresas.

## Checklist de due diligence

### 1. Nota simple del Registro de la Propiedad
- ✅ Titularidad actual
- ✅ Descripción del inmueble (superficie, linderos)
- ✅ Cargas vigentes (hipotecas, embargos, anotaciones)
- ✅ Servidumbres
- ✅ Afecciones urbanísticas

### 2. Referencia catastral
- ✅ Coincidencia entre Registro y Catastro
- ✅ Superficie catastral vs. registral
- ✅ Valor catastral (base para impuestos)
- ✅ Uso catastral (residencial, comercial, industrial)

### 3. Urbanismo
- ✅ Clasificación del suelo (urbano, urbanizable, rústico)
- ✅ Licencias de obra y primera ocupación
- ✅ Afectaciones urbanísticas (alineaciones, expropiaciones)
- ✅ Cumplimiento normativa de edificación

### 4. Estado posesorio
- ✅ Contratos de alquiler vigentes
- ✅ Tipo de ocupación (legal, precario, sin título)
- ✅ Demandas de desahucio en curso

### 5. Situación jurídica del procedimiento
- ✅ Fase del procedimiento judicial
- ✅ Decreto de adjudicación (en cesiones de remate)
- ✅ Posibles reclamaciones de terceros

### 6. Comunidad de propietarios
- ✅ Derramas pendientes
- ✅ Cuotas impagadas
- ✅ Acuerdos de la comunidad que afecten al inmueble

## Documentos clave a solicitar

1. Nota simple actualizada (< 15 días)
2. Certificado catastral
3. Certificado de deuda de la comunidad
4. Último recibo del IBI
5. Cédula de habitabilidad / licencia de primera ocupación
6. Certificado energético

## Errores frecuentes

- No verificar cargas **anteriores** a la hipoteca ejecutada
- Dar por válidas tasaciones bancarias antiguas
- No comprobar el estado urbanístico
- Ignorar las deudas con la comunidad de propietarios`,
  },
  {
    slug: "mercado-npl-espana-2026",
    title: "Mercado NPL en España 2026: tendencias y oportunidades",
    excerpt: "Análisis del mercado de deuda distressed en España: volumen, principales players, zonas con mejor rentabilidad y previsiones.",
    category: "Mercado",
    date: "2026-02-15",
    readTime: "8 min",
    content: `## Estado del mercado NPL en España

El mercado español de deuda distressed se encuentra en un momento de **madurez selectiva**. Tras años de operaciones masivas de carteras, el valor ahora está en la **selección granular** de activos individuales.

## Tendencias clave 2026

### 1. Del volumen a la calidad
Los grandes fondos han digerido las carteras masivas. Ahora la oportunidad está en activos individuales con buen ratio LTV y ubicación estratégica.

### 2. Incremento de operaciones minoristas
Family offices e inversores particulares acceden cada vez más a este mercado gracias a plataformas como IKESA.

### 3. Digitalización del proceso
Las subastas electrónicas y las plataformas de distribución online han democratizado el acceso a estos activos.

### 4. Nuevas regulaciones
La Ley de Eficiencia Procesal ha modificado las dinámicas de subasta, incentivando las operaciones pre-subasta.

## Zonas con mayor oportunidad

| Zona | Descuento medio | Liquidez | Scoring |
|------|-----------------|----------|---------|
| Madrid capital | 35-45% | Alta | ⭐⭐⭐⭐⭐ |
| Costa del Sol | 40-55% | Alta | ⭐⭐⭐⭐ |
| Valencia ciudad | 45-60% | Media | ⭐⭐⭐⭐ |
| Sevilla capital | 40-55% | Media | ⭐⭐⭐⭐ |
| Interior peninsular | 55-75% | Baja | ⭐⭐⭐ |

## Principales players

- **Servicers**: Haya, Servihabitat, Altamira, Aliseda
- **Fondos**: Cerberus, Lone Star, Blackstone, Bain Capital
- **Bancos**: CaixaBank, BBVA, Santander, Sabadell
- **Plataformas**: IKESA, Inmubi, NPL Markets

## Previsiones

Se espera un **incremento del 15-20%** en operaciones minoristas durante 2026, impulsado por:
- Mayor accesibilidad vía plataformas digitales
- Nuevos vencimientos de carteras de fondos
- Incremento de morosidad en segmentos específicos`,
  },
];
