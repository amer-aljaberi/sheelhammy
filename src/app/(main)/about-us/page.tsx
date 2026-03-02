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
    title: "من نحن - شيل همي",
    description: "تعرف على منصة شيل همي، منصة خدمات أكاديمية وطلابية متخصصة في دعم طلاب الجامعات. نقدم خدمات احترافية في إعداد الأبحاث، التقارير، والمشاريع مع الالتزام بالجودة والسرية التامة.",
    keywords: [
      "من نحن",
      "شيل همي",
      "خدمات أكاديمية",
      "منصة طلابية",
      "مساعدة طلاب",
      "خدمات تعليمية"
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
