import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { generateSEOMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await prisma.blog.findUnique({
      where: { slug },
      select: {
        title: true,
        excerpt: true,
        seoTitle: true,
        seoDescription: true,
        image: true,
        publishedAt: true,
        updatedAt: true,
        author: true,
        category: true,
      },
    });

    if (!post || !post.publishedAt) {
      return generateSEOMetadata({
        title: "المقال غير موجود",
        noindex: true,
      });
    }

    const siteUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "https://sheelhammy.com";
    const image = post.image || `${siteUrl}/og-image.jpg`;
    const url = `${siteUrl}/blog/${slug}`;

    return generateSEOMetadata({
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "مقال من مدونة شيل همي",
      keywords: [
        "مقال",
        "مدونة",
        "شيل همي",
        post.category || "",
      ].filter(Boolean),
      image,
      url,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt?.toISOString() || post.publishedAt.toISOString(),
      author: post.author || "شيل همي",
    });
  } catch (error) {
    console.error("Error generating metadata for blog post:", error);
    return generateSEOMetadata({
      title: "المقال",
    });
  }
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
