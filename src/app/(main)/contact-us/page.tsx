import React from 'react'
import { ContactHero } from './_components/contact-hero'
import { ContactForm } from './_components/contact-form'
import { generateSEOMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return generateSEOMetadata({
    title: "تواصل معنا - شيل همّي",
    description: "تواصل مع فريق شيل همّي للخدمات الأكاديمية بسهولة عبر واتساب أو نموذج التواصل، واحصل على استشارة سريعة ودعم احترافي لجميع التخصصات في الوطن العربي.",
    keywords: [
      "تواصل معنا",
      "تواصل مع فريق أكاديمي",
      "استفسار أكاديمي",
      "طلب خدمة أكاديمية",
      "نموذج تواصل",
      "احجز خدمة الآن",
      "اطلب أسايمنت",
      "استشارة أكاديمية",
      "دعم طلابي سريع",
      "خدمات أكاديمية",
      "مساعدة طلاب",
      "منصة شيل همّي",
      "دعم أكاديمي أونلاين"
    ],
    url: "/contact-us",
  });
}

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactForm />
    </main>
  )
}
