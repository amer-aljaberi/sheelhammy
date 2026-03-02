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

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    description: "منصة خدمات أكاديمية وطلابية متخصصة في دعم طلاب الجامعات في إعداد الأبحاث، التقارير، والمشاريع باحترافية عالية. نلتزم بالجودة، السرية التامة، وتسليم الأعمال في الوقت المحدد.",
    keywords: [
      "خدمات أكاديمية",
      "كتابة أبحاث",
      "كتابة تقارير",
      "مشاريع جامعية",
      "مساعدة طلاب",
      "خدمات تعليمية",
      "كتابة علمية",
      "تحرير أكاديمي",
      "ترجمة أكاديمية",
      "مراجعة أبحاث",
      "شيل همي",
      "خدمات طلابية",
      "أبحاث جامعية",
      "تقارير أكاديمية"
    ],
  });
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
