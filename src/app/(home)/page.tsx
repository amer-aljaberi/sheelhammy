import React from 'react'
import type { Metadata } from 'next'
import { HeroSection } from './_components/hero'
import { Stats } from './_components/stats'
import { AboutSection } from './_components/about'
import { WhyUsSection } from './_components/why-us'
import { ServicesSection } from './_components/services'
import { ProcessSection } from './_components/process'
import { FAQSection } from './_components/faq'
import { ScopeSection } from './_components/scope'
import { TestimonialsSection } from './_components/testimonials'
import Benfits from './_components/benfits'
import { generateStructuredData } from '@/lib/seo/metadata'
import { getSettings } from '@/lib/settings'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const { generateSEOMetadata } = await import('@/lib/seo/metadata');
  
  return generateSEOMetadata({
    title: "شيل همّي - منصة خدمات أكاديمية وطلابية احترافية",
    description: "شيل همّي منصة عربية للخدمات الأكاديمية والطلابية، نقدم حل الأسايمنت، إعداد الأبحاث، مشاريع التخرج والتدقيق اللغوي لجميع التخصصات في الوطن العربي بجودة وسرية تامة.",
    keywords: [
      "خدمات أكاديمية",
      "مساعدة طلاب",
      "حل أسايمنت",
      "إعداد أبحاث جامعية",
      "مشاريع تخرج",
      "تقارير جامعية",
      "خدمات طلابية أونلاين",
      "دعم أكاديمي احترافي",
      "كتابة بحث علمي",
      "منصة خدمات أكاديمية",
      "خدمات أكاديمية في الأردن",
      "خدمات أكاديمية في السعودية",
      "خدمات أكاديمية في الإمارات",
      "خدمات أكاديمية في الخليج",
      "خدمات أكاديمية في الوطن العربي",
      "اطلب حل أسايمنت",
      "كتابة مشروع تخرج",
      "مساعدة بحث جامعي",
      "أفضل منصة خدمات أكاديمية",
      "دعم طلاب جامعيين"
    ],
  });
}

export default async function page() {
  const settings = await getSettings();
  const siteUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://sheelhammy.com";
 
  const organizationData = generateStructuredData({
    type: "Organization",
    data: {
      name: settings.platformName || "شيل همي",
      description: settings.siteDescription || ("platformDescription" in settings ? settings.platformDescription : null) || "منصة خدمات أكاديمية وطلابية متخصصة",
      phone: ("contactPhone" in settings ? settings.contactPhone : null) || "+962-7-8185-8647",
      email: ("contactEmail" in settings ? settings.contactEmail : null) || "info@sheelhammy.com",
    },
  });

  // WebSite Structured Data
  const websiteData = generateStructuredData({
    type: "WebSite",
    data: {
      name: settings.platformName || "شيل همي",
      description: settings.siteDescription || ("platformDescription" in settings ? settings.platformDescription : null) || "منصة خدمات أكاديمية وطلابية متخصصة",
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <main>
        <HeroSection />
        <Benfits />
        <AboutSection />
        <Stats />
        <WhyUsSection />
        <ServicesSection />
        <ProcessSection />
        <ScopeSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
    </>
  )
}
