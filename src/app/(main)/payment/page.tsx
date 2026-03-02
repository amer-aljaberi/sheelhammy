import React from 'react'
import { PaymentHero } from './_components/payment-hero'
import { PaymentMethods } from './_components/payment-methods'
import { PaymentInfo } from './_components/payment-info'
import { generateSEOMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return generateSEOMetadata({
    title: "طرق الدفع - شيل همّي",
    description: "تعرف على طرق الدفع المتاحة في شيل همّي، نوفر وسائل دفع آمنة وسريعة لتحويل رسوم الخدمات الأكاديمية مع تأكيد فوري وسرية تامة في جميع العمليات.",
    keywords: [
      "طرق الدفع",
      "وسائل دفع آمنة",
      "الدفع للخدمات الأكاديمية",
      "تحويل رسوم خدمة",
      "دفع أونلاين",
      "دفع آمن",
      "حماية البيانات المالية",
      "تأكيد الدفع",
      "سرية العمليات المالية",
      "خدمات أكاديمية",
      "منصة خدمات طلابية",
      "طلب خدمة أكاديمية",
      "دعم طلاب أونلاين"
    ],
    url: "/payment",
  });
}

export default function PaymentPage() {
  return (
    <main>
      <PaymentHero />
      <PaymentMethods />
      <PaymentInfo />

    </main>
  )
}
