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
  return process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://www.sheelhammy.com";
};

const getDefaultImage = () => {
 
  return `${getSiteUrl()}/logo.svg`;
};

export async function generateSEOMetadata(config: SEOConfig = {}): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = getSiteUrl();
  
  const title = config.title 
    ? `${config.title} | ${settings.platformName || "شيل همي"}`
    : settings.siteTitle || settings.platformName || "شيل همي";
  
  const description = config.description || settings.siteDescription || 
    "شيل همّي منصة عربية متخصصة في الخدمات الأكاديمية والطلابية، نقدم حل الأسايمنت، إعداد الأبحاث، مشاريع التخرج، والتدقيق اللغوي لكافة التخصصات في الوطن العربي بجودة عالية وسرية تامة";
  
  const keywords = config.keywords || 
    (settings.siteKeywords ? settings.siteKeywords.split(",").map(k => k.trim()) : [
      "خدمات أكاديمية",
      "مساعدة طلاب",
      "حل أسايمنت",
      "إعداد أبحاث جامعية",
      "مشاريع تخرج",
      "تقارير جامعية",
      "كتابة بحث علمي",
      "تدقيق لغوي",
      "تنسيق أبحاث",
      "خدمات طلابية",
      "دعم أكاديمي",
      "بحوث جامعية",
      "كتابة رسائل جامعية",
      "حل واجبات جامعية",
      "منصة خدمات طلابية",
      "مساعدة جامعية أونلاين",
      "خدمات أكاديمية في الأردن",
      "خدمات أكاديمية في السعودية",
      "خدمات أكاديمية في الخليج",
      "خدمات أكاديمية في الوطن العربي",
      "Academic Services",
      "Student Support Services",
      "Assignment Help",
      "Graduation Projects",
      "Research Writing",
      "Academic Writing Services",
      "Online Student Assistance",
      "University Assignment Help",
      "Thesis Support",
      "Academic Editing"
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
          type: "image/svg+xml",
        },
      ],
      ...(config.publishedTime && { publishedTime: config.publishedTime }),
      ...(config.modifiedTime && { modifiedTime: config.modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: image,
          alt: title,
        },
      ],
      creator: "@sheelhammy",
      site: "@sheelhammy",
    },
    icons: {
      icon: "/logo.svg",
      apple: "/logo.svg",
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
