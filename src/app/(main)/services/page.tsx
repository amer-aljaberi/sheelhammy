import React from 'react'
import { ServicesHero } from './_components/services-hero'
import { ServicesList } from './_components/services-list'
import { generateSEOMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return generateSEOMetadata({
    title: "خدماتنا - شيل همي",
    description: "اكتشف خدماتنا الأكاديمية الشاملة: كتابة الأبحاث، التقارير، المشاريع الجامعية، التحرير الأكاديمي، الترجمة، والمراجعة. خدمات احترافية لطلاب الجامعات في جميع أنحاء العالم.",
    keywords: [
      "خدمات أكاديمية",
      "كتابة أبحاث",
      "كتابة تقارير",
      "مشاريع جامعية",
      "تحرير أكاديمي",
      "ترجمة أكاديمية",
      "مراجعة أبحاث",
      "خدمات طلابية"
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
