import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: "المدونة العلمية - شيل همّي",
    description: "تابع المدونة العلمية في شيل همّي لقراءة مقالات أكاديمية ونصائح جامعية تساعدك في إعداد الأبحاث، الأسايمنت ومشاريع التخرج باحترافية.",
    keywords: [
      "مدونة علمية",
      "مقالات أكاديمية",
      "نصائح جامعية",
      "كتابة بحث علمي",
      "طريقة إعداد مشروع تخرج",
      "شرح الأسايمنت الجامعي",
      "مهارات البحث العلمي",
      "تنسيق أبحاث جامعية",
      "كتابة تقارير جامعية",
      "تطوير مهارات أكاديمية",
      "خدمات أكاديمية",
      "مساعدة طلاب",
      "دعم أكاديمي",
      "منصة تعليمية عربية"
    ],
    url: "/blog",
  });
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
