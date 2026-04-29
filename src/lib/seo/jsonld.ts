import { SITE, absoluteUrl } from "./site";

type JsonLdNode = Record<string, unknown> & { "@context"?: string; "@type": string };

export function organization(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/logo.svg"),
    sameAs: [SITE.telegram],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SITE.email,
        availableLanguage: ["ru"],
      },
    ],
  };
}

export function website(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: SITE.language,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/services?q={query}`,
      "query-input": "required name=query",
    },
  };
}

export function breadcrumb(items: ReadonlyArray<{ name: string; url: string }>): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export type ProductOffer = {
  price: number;
  priceCurrency?: "RUB";
  availability?:
    | "https://schema.org/InStock"
    | "https://schema.org/OutOfStock"
    | "https://schema.org/PreOrder";
  url: string;
  name?: string;
};

export type ProductRating = { ratingValue: number; reviewCount: number };

export type ProductReview = {
  authorName: string;
  rating: number;
  reviewBody: string;
  datePublished?: string;
};

export function product(args: {
  name: string;
  slug: string;
  description: string;
  brand?: string;
  imageUrl?: string;
  offers: ProductOffer[];
  rating?: ProductRating;
  reviews?: ProductReview[];
}): JsonLdNode {
  const offerNodes = args.offers.map((o) => ({
    "@type": "Offer",
    price: o.price,
    priceCurrency: o.priceCurrency ?? "RUB",
    availability: o.availability ?? "https://schema.org/InStock",
    url: absoluteUrl(o.url),
    ...(o.name ? { name: o.name } : {}),
  }));

  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: args.name,
    description: args.description,
    brand: { "@type": "Brand", name: args.brand ?? args.name },
    url: absoluteUrl(`/services/${args.slug}`),
    offers:
      args.offers.length === 1
        ? offerNodes[0]
        : {
            "@type": "AggregateOffer",
            priceCurrency: "RUB",
            lowPrice: Math.min(...args.offers.map((o) => o.price)),
            highPrice: Math.max(...args.offers.map((o) => o.price)),
            offerCount: args.offers.length,
            offers: offerNodes,
          },
  };

  if (args.imageUrl) node.image = absoluteUrl(args.imageUrl);

  if (args.rating && args.rating.reviewCount > 0) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: args.rating.ratingValue.toFixed(1),
      reviewCount: args.rating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (args.reviews?.length) {
    node.review = args.reviews.map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      author: { "@type": "Person", name: r.authorName },
      reviewBody: r.reviewBody,
      ...(r.datePublished ? { datePublished: r.datePublished } : {}),
    }));
  }

  return node;
}

export function faqPage(items: ReadonlyArray<{ question: string; answer: string }>): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function article(args: {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    image: args.imageUrl ? absoluteUrl(args.imageUrl) : undefined,
    datePublished: args.datePublished,
    dateModified: args.dateModified ?? args.datePublished,
    author: { "@type": "Organization", name: args.authorName ?? SITE.authorName },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.svg") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${args.slug}`) },
  };
}
