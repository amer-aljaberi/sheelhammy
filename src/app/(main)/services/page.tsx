import React from 'react'
import { ServicesHero } from './_components/services-hero'
import { ServicesList } from './_components/services-list'
import { generateSEOMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return generateSEOMetadata({
    title: "خدماتنا - شيل همّي",
    description: "استكشف خدمات شيل همّي الأكاديمية: حل الأسايمنت، إعداد الأبحاث، مشاريع التخرج، التقارير والتدقيق اللغوي لجميع التخصصات في الوطن العربي بجودة عالية.",
    keywords: [
      "خدمات أكاديمية",
      "حل أسايمنت",
      "إعداد أبحاث جامعية",
      "مشاريع تخرج",
      "تقارير جامعية",
      "تدقيق لغوي أكاديمي",
      "إعادة صياغة أكاديمية",
      "اطلب خدمة أكاديمية",
      "أفضل منصة خدمات طلابية",
      "مساعدة جامعية أونلاين",
      "دعم أكاديمي احترافي",
      "خدمات طلابية",
      "كتابة بحث علمي",
      "دعم طلاب الجامعات",
      "منصة أكاديمية عربية"
    ],
    url: "/services",
  });
}

export default function ServicesPage() {
  return (
    <main>
      <ServicesHero />
      <ServicesList />

    </main>
  )
}
