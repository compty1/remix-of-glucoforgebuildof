/**
 * JSON-LD structured data helpers for SEO.
 * Gaps 963-966: Article, Organization, FAQ, MedicalEntity schemas.
 */

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GlucoForge',
    url: 'https://glucoforge.org',
    logo: 'https://glucoforge.org/src/assets/glucoforge-logo.svg',
    description: 'An emerging 501(c)(3) nonprofit forging tools, fueling hope, and fighting diabetes together.',
    foundingDate: '2024',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://glucoforge.org/contact',
    },
    nonprofitStatus: '501(c)(3)',
  };
}

export function getArticleJsonLd(article: {
  title: string;
  description: string;
  url: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  imageUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: article.url,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Organization',
      name: article.author || 'GlucoForge',
    },
    publisher: {
      '@type': 'Organization',
      name: 'GlucoForge',
      logo: {
        '@type': 'ImageObject',
        url: 'https://glucoforge.org/src/assets/glucoforge-logo.svg',
      },
    },
    image: article.imageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

export function getMedicalEntityJsonLd(entity: {
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: entity.name,
    description: entity.description,
    url: entity.url,
    associatedAnatomy: {
      '@type': 'AnatomicalStructure',
      name: 'Pancreas',
    },
    possibleTreatment: {
      '@type': 'MedicalTherapy',
      name: 'Insulin therapy',
    },
  };
}

export function getFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Inject JSON-LD into the document head.
 */
export function injectJsonLd(data: Record<string, unknown>, id: string) {
  // Remove existing script with same id
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Remove JSON-LD from document head.
 */
export function removeJsonLd(id: string) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
}
