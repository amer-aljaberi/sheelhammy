import React from 'react'
import { PaymentHero } from './_components/payment-hero'
import { PaymentMethods } from './_components/payment-methods'
import { PaymentInfo } from './_components/payment-info'
import { generateSEOMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return generateSEOMetadata({
    title: "طرق الدفع - شيل همي",
    description: "اكتشف طرق الدفع المتاحة في منصة شيل همي. نقبل الدفع عبر Arab Bank، CliQ، MoneyGram، U-Wallet، Western Union، و Zain Cash. طرق دفع آمنة ومتعددة لراحتك.",
    keywords: [
      "طرق الدفع",
      "Arab Bank",
      "CliQ",
      "MoneyGram",
      "U-Wallet",
      "Western Union",
      "Zain Cash",
      "دفع آمن"
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
