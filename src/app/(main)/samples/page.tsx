import React from 'react'
import { SamplesHero } from './_components/samples-hero'
import { SamplesGrid } from './_components/samples-grid'
import { generateSEOMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return generateSEOMetadata({
    title: "نماذج الأعمال - شيل همّي",
    description: "اطلع على نماذج أعمال شيل همّي في الأبحاث، الأسايمنت ومشاريع التخرج لمختلف التخصصات، واكتشف جودة التنظيم والدقة الأكاديمية في أعمالنا السابقة.",
    keywords: [
      "نماذج أعمال أكاديمية",
      "أعمال سابقة أكاديمية",
      "نماذج أبحاث جامعية",
      "نماذج أسايمنت",
      "مشاريع تخرج جاهزة",
      "أمثلة تقارير جامعية",
      "جودة أكاديمية عالية",
      "تنظيم أكاديمي احترافي",
      "أعمال طلابية متميزة",
      "نماذج مشاريع جامعية",
      "خدمات أكاديمية",
      "منصة مساعدة طلاب",
      "دعم أكاديمي احترافي",
      "كتابة بحث علمي"
    ],
    url: "/samples",
  });
}

export default function SamplesPage() {
  return (
    <main>
      <SamplesHero />
      <SamplesGrid />
 
    </main>
  )
}
