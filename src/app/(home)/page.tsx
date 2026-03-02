import React from 'react'
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

export async function generateMetadata() {
  const settings = await getSettings();
  const { generateSEOMetadata } = await import('@/lib/seo/metadata');
  
  return generateSEOMetadata({
    title: "شيل همي - خدمات أكاديمية وطلابية احترافية",
    description: "منصة خدمات أكاديمية وطلابية متخصصة في دعم طلاب الجامعات في إعداد الأبحاث، التقارير، والمشاريع باحترافية عالية. نلتزم بالجودة، السرية التامة، وتسليم الأعمال في الوقت المحدد لخدمة الطلاب في مختلف الدول العربية والعالم.",
    keywords: [
      "خدمات أكاديمية",
      "كتابة أبحاث",
      "كتابة تقارير",
      "مشاريع جامعية",
      "مساعدة طلاب",
      "خدمات تعليمية",
      "شيل همي",
      "أبحاث جامعية",
      "تقارير أكاديمية"
    ],
  });
}

export default async function page() {
  const settings = await getSettings();
  const siteUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://sheelhammy.com";
  
  // Organization Structured Data
  const organizationData = generateStructuredData({
    type: "Organization",
    data: {
      name: settings.platformName || "شيل همي",
      description: settings.siteDescription || settings.platformDescription || "منصة خدمات أكاديمية وطلابية متخصصة",
      phone: settings.contactPhone || "+962-7-8185-8647",
      email: settings.contactEmail || "info@sheelhammy.com",
    },
  });

  // WebSite Structured Data
  const websiteData = generateStructuredData({
    type: "WebSite",
    data: {
      name: settings.platformName || "شيل همي",
      description: settings.siteDescription || settings.platformDescription || "منصة خدمات أكاديمية وطلابية متخصصة",
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
