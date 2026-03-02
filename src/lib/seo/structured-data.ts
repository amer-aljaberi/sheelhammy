/**
 * Client-safe structured data generator
 * This file doesn't import any server-only dependencies
 */

const getSiteUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://sheelhammy.com";
};

export function generateStructuredData(config: {
  type: "Organization" | "WebSite" | "Service" | "Article" | "BreadcrumbList";
  data: any;
}) {
  const siteUrl = getSiteUrl();
  
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": config.type,
  };
  
  switch (config.type) {
    case "Organization":
      return {
        ...baseStructuredData,
        name: config.data.name || "شيل همي",
        url: siteUrl,
        logo: `${siteUrl}/logo.svg`,
        description: config.data.description,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: config.data.phone || "+962-7-8185-8647",
          contactType: "customer service",
          email: config.data.email || "info@sheelhammy.com",
          availableLanguage: ["Arabic", "English"],
        },
        sameAs: [
          "https://www.facebook.com/sheelhammy",
          "https://www.instagram.com/sheelhammy",
          "https://x.com/sheelhammy",
        ],
        address: {
          "@type": "PostalAddress",
          addressCountry: "JO",
        },
      };
    
    case "WebSite":
      return {
        ...baseStructuredData,
        name: config.data.name || "شيل همي",
        url: siteUrl,
        description: config.data.description,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      };
    
    case "Service":
      return {
        ...baseStructuredData,
        name: config.data.name,
        description: config.data.description,
        provider: {
          "@type": "Organization",
          name: "شيل همي",
          url: siteUrl,
        },
        areaServed: config.data.areaServed || "Worldwide",
        serviceType: config.data.serviceType || "Academic Services",
      };
    
    case "Article":
      return {
        ...baseStructuredData,
        headline: config.data.headline,
        description: config.data.description,
        image: config.data.image,
        datePublished: config.data.datePublished,
        dateModified: config.data.dateModified || config.data.datePublished,
        author: {
          "@type": "Person",
          name: config.data.author || "شيل همي",
        },
        publisher: {
          "@type": "Organization",
          name: "شيل همي",
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/logo.svg`,
          },
        },
      };
    
    case "BreadcrumbList":
      return {
        ...baseStructuredData,
        itemListElement: config.data.items.map((item: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };
    
    default:
      return baseStructuredData;
  }
}
