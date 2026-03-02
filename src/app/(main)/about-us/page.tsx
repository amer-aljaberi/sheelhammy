import React from 'react'
import { AboutHero } from './_components/about-hero'
import { OurStory } from './_components/our-story'
import { OurValues } from './_components/our-values'
import { Stats } from './_components/stats' 
import { FAQSection } from '@/app/(home)/_components/faq'
import { About } from './_components/about'
import { generateSEOMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return generateSEOMetadata({
    title: "من نحن - شيل همّي",
    description: "تعرف على منصة شيل همّي للخدمات الأكاديمية والطلابية، فريق متخصص يقدم دعمًا احترافيًا للطلاب في الأبحاث، الأسايمنت ومشاريع التخرج في الوطن العربي.",
    keywords: [
      "من نحن شيل همّي",
      "عن منصة شيل همّي",
      "فريق شيل همّي",
      "منصة خدمات أكاديمية عربية",
      "شركة خدمات طلابية",
      "فريق أكاديمي متخصص",
      "دعم أكاديمي احترافي",
      "خدمات أكاديمية موثوقة",
      "سرية تامة",
      "التزام بالمواعيد",
      "خدمات أكاديمية",
      "مساعدة طلاب",
      "مشاريع تخرج",
      "إعداد أبحاث",
      "حل أسايمنت"
    ],
    url: "/about-us",
  });
}

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <About />
      <OurStory />
      <OurValues />
      <Stats /> 
      <FAQSection />

    </main>
  )
}
