import React from 'react'
import { SamplesHero } from './_components/samples-hero'
import { SamplesGrid } from './_components/samples-grid'
import { generateSEOMetadata } from '@/lib/seo/metadata'

export async function generateMetadata() {
  return generateSEOMetadata({
    title: "نماذج الأعمال - شيل همي",
    description: "تصفح نماذج من أعمالنا السابقة في كتابة الأبحاث، التقارير، والمشاريع الجامعية. اكتشف جودة عملنا واحترافيتنا في تقديم الخدمات الأكاديمية.",
    keywords: [
      "نماذج أعمال",
      "نماذج أبحاث",
      "نماذج تقارير",
      "أمثلة مشاريع",
      "معرض أعمال",
      "نماذج أكاديمية"
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
