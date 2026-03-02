import React from 'react'
import { ContactHero } from './_components/contact-hero'
import { ContactForm } from './_components/contact-form'
import { generateSEOMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return generateSEOMetadata({
    title: "تواصل معنا - شيل همي",
    description: "تواصل مع فريق شيل همي للحصول على المساعدة والدعم. نحن هنا للإجابة على جميع استفساراتك حول خدماتنا الأكاديمية والطلابية. دعم 24/7 لجميع الدول العربية.",
    keywords: [
      "تواصل معنا",
      "اتصل بنا",
      "دعم فني",
      "خدمة العملاء",
      "شيل همي",
      "مساعدة طلاب"
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
