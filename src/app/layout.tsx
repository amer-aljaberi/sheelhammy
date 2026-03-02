import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css"; 
import Providers from "./providers";
import { Toaster } from "sonner"; 
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { BackToTop } from "@/components/common/back-to-top";
import { ConditionalLayout } from "@/components/Layout/conditional-layout";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await generateSEOMetadata({
    description: "شيل همّي منصة عربية متخصصة في الخدمات الأكاديمية والطلابية، نقدم حل الأسايمنت، إعداد الأبحاث، مشاريع التخرج، والتدقيق اللغوي لكافة التخصصات في الوطن العربي بجودة عالية وسرية تامة.",
    keywords: [
      "خدمات أكاديمية",
      "مساعدة طلاب",
      "حل أسايمنت",
      "إعداد أبحاث جامعية",
      "مشاريع تخرج",
      "تقارير جامعية",
      "كتابة بحث علمي",
      "تدقيق لغوي",
      "تنسيق أبحاث",
      "خدمات طلابية",
      "دعم أكاديمي",
      "بحوث جامعية",
      "كتابة رسائل جامعية",
      "حل واجبات جامعية",
      "منصة خدمات طلابية",
      "مساعدة جامعية أونلاين",
      "خدمات أكاديمية في الأردن",
      "خدمات أكاديمية في السعودية",
      "خدمات أكاديمية في الخليج",
      "خدمات أكاديمية في الوطن العربي",
      "Academic Services",
      "Student Support Services",
      "Assignment Help",
      "Graduation Projects",
      "Research Writing",
      "Academic Writing Services",
      "Online Student Assistance",
      "University Assignment Help",
      "Thesis Support",
      "Academic Editing"
    ],
  }); 
  return {
    ...metadata,
    verification: {
      ...metadata.verification,
      google: "kiHL19cBzEx2LEsLajkDSp1vZcBbLvUH7T6gg9F63JE",
    },
  };
}

 

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;  
}>) {
   
  return (
    
      <html
        lang={"ar"}
        dir="rtl"
        className={tajawal.variable}
        suppressHydrationWarning
      >
        <body className={`${tajawal.className} antialiased`}>
          <Providers>
            <Analytics />
            <SpeedInsights />
            <SettingsProvider>
              <Toaster richColors position="top-right" />
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
              <FloatingWhatsApp />
              <BackToTop />
            </SettingsProvider>
          </Providers>
        </body>
      </html> 
  );
}
