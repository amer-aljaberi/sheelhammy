import { Metadata } from "next";
import { getSettings } from "../settings";

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

const getSiteUrl = () => {
  return process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://sheelhammy.com";
};

const getDefaultImage = () => {
  return `${getSiteUrl()}/og-image.jpg`;
};

export async function generateSEOMetadata(config: SEOConfig = {}): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = getSiteUrl();
  
  const title = config.title 
    ? `${config.title} | ${settings.platformName || "شيل همي"}`
    : settings.siteTitle || settings.platformName || "شيل همي";
  
  const description = config.description || settings.siteDescription || 
    "منصة خدمات أكاديمية وطلابية متخصصة في دعم طلاب الجامعات في إعداد الأبحاث، التقارير، والمشاريع باحترافية عالية";
  
  const keywords = config.keywords || 
    (settings.siteKeywords ? settings.siteKeywords.split(",").map(k => k.trim()) : [
      "خدمات أكاديمية",
      "كتابة أبحاث",
      "كتابة تقارير",
      "مشاريع جامعية",
      "مساعدة طلاب",
      "خدمات تعليمية",
      "كتابة علمية",
      "تحرير أكاديمي",
      "ترجمة أكاديمية",
      "مراجعة أبحاث"
    ]);
  
  const image = config.image || getDefaultImage();
  const url = config.url || siteUrl;
  
  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: settings.platformName || "شيل همي" }],
    creator: settings.platformName || "شيل همي",
    publisher: settings.platformName || "شيل همي",
    robots: {
      index: !config.noindex,
      follow: !config.nofollow,
      googleBot: {
        index: !config.noindex,
        follow: !config.nofollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: config.type || "website",
      locale: "ar_JO",
      url,
      title,
      description,
      siteName: settings.platformName || "شيل همي",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(config.publishedTime && { publishedTime: config.publishedTime }),
      ...(config.modifiedTime && { modifiedTime: config.modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@sheelhammy",
      site: "@sheelhammy",
    },
    alternates: {
      canonical: url,
    },
    metadataBase: new URL(siteUrl),
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
  };
  
  return metadata;
}

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
