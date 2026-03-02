import { Metadata } from "next";
import { getSettings } from "../settings";

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
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
      type: (config.type === "article" ? "article" : "website") as "website" | "article",
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

// Re-export from structured-data for backward compatibility
export { generateStructuredData } from "./structured-data";
