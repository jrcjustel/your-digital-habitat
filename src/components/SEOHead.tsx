import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  type?: "website" | "article" | "product";
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
  keywords?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

const SITE_NAME = "IKESA";
const BASE_URL = "https://ikesa.es";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

const SEOHead = ({
  title,
  description,
  canonical,
  type = "website",
  image,
  noindex = false,
  jsonLd,
  keywords,
  publishedTime,
  modifiedTime,
  author = "IKESA",
}: SEOHeadProps) => {
  const fullTitle = title.includes("IKESA") ? title : `${title} | ${SITE_NAME}`;
  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : undefined;
  const ogImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="es_ES" />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

// ─── Predefined JSON-LD schemas ───

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "IKESA",
  "alternateName": "IKESA Real Estate",
  "url": "https://ikesa.es",
  "logo": "https://ikesa.es/ikesa-logo-color.png",
  "description": "Plataforma líder en inversión inmobiliaria alternativa en España. Especialistas en NPL, cesiones de remate, subastas BOE y activos ocupados.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ES",
  },
  "sameAs": [],
  "areaServed": {
    "@type": "Country",
    "name": "España",
  },
  "knowsAbout": [
    "Non-Performing Loans",
    "Cesiones de remate",
    "Subastas BOE",
    "Inversión inmobiliaria",
    "Activos ocupados",
    "Due diligence inmobiliaria",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "IKESA",
  "url": "https://ikesa.es",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ikesa.es/inmuebles?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export function createBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": `https://ikesa.es${item.url}`,
    })),
  };
}

export function createArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "url": `https://ikesa.es${article.url}`,
    "datePublished": article.datePublished,
    "author": { "@type": "Organization", "name": "IKESA" },
    "publisher": {
      "@type": "Organization",
      "name": "IKESA",
      "logo": { "@type": "ImageObject", "url": "https://ikesa.es/ikesa-logo-color.png" },
    },
    ...(article.image ? { "image": article.image } : {}),
  };
}

export function createProductSchema(property: {
  name: string;
  description: string;
  price: number;
  url: string;
  image?: string;
  location?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": property.name,
    "description": property.description,
    "url": `https://ikesa.es${property.url}`,
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
    },
    ...(property.image ? { "image": property.image } : {}),
    ...(property.location ? { "areaServed": property.location } : {}),
  };
}

export function createFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

export function createCourseSchema(course: {
  name: string;
  description: string;
  url: string;
  modules: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "url": `https://ikesa.es${course.url}`,
    "provider": { "@type": "Organization", "name": "IKESA" },
    "numberOfCredits": course.modules,
    "isAccessibleForFree": true,
    "inLanguage": "es",
  };
}

export default SEOHead;
