"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { PageHero } from "@/components/common/page-hero";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateStructuredData } from "@/lib/seo/structured-data";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  author: string | null;
  publishedAt: string | null;
  views: number;
  category: string | null;
  tags: string[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [structuredData, setStructuredData] = useState<any>(null);

  // Helper function to parse tags
  const parseTags = (tags: string[] | string | null): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // If it's not valid JSON, try splitting by comma
        return tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }
    return [];
  };

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post && post.publishedAt) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sheelhammy.com";
      const image = post.image || `${siteUrl}/og-image.jpg`;
      
      const data = generateStructuredData({
        type: "Article",
        data: {
          headline: post.title,
          description: post.excerpt || "",
          image,
          datePublished: post.publishedAt,
          dateModified: post.publishedAt,
          author: post.author || "شيل همي",
        },
      });
      setStructuredData(data);
    }
  }, [post]);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blog/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }
      const data = await response.json();
      setPost(data);
      
      // Fetch related posts
      fetchRelatedPosts(data.id);
    } catch (error) {
      console.error("Error fetching blog post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedPosts = async (currentPostId: string) => {
    try {
      const response = await fetch(`/api/blog?limit=4`);
      if (response.ok) {
        const data = await response.json();
        const postsArray = data.posts || (Array.isArray(data) ? data : []);
        // Filter out current post and limit to 3
        const filtered = postsArray
          .filter((p: BlogPost) => p.id !== currentPostId)
          .slice(0, 3);
        setRelatedPosts(filtered);
      }
    } catch (error) {
      console.error("Error fetching related posts:", error);
    }
  };
 
  const tagsArray = useMemo(() => parseTags(post?.tags || null), [post?.tags]);

  // Share functionality
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post?.title || '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('تم نسخ الرابط بنجاح');
    } catch (error) {
      toast.error('فشل نسخ الرابط');
    }
  };

  const shareOnPlatform = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    
    const shareLinks: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    };

    const url = shareLinks[platform];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: post?.excerpt || '',
          url: shareUrl,
        });
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          toast.error('فشل المشاركة');
        }
      }
    } else {
      // Fallback to copy link
      copyLink();
    }
  };

  if (isLoading) {
    return (
      <main>
        <div className="container mt-40 mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main>
        <div className="container mx-auto px-4 py-20 text-center">
          <Icon
            icon="solar:document-text-bold"
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
          />
          <h1 className="text-2xl font-bold mb-4">المقال غير موجود</h1>
          <Link
            href="/blog"
            className="text-blue-600 hover:underline"
          >
            العودة إلى المدونة
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <main>
        <PageHero
          title={post.title}
          description={post.excerpt || undefined}
          badge={post.category || "المدونة"}
          badgeIcon="solar:document-text-bold"
        />

      <article dir="rtl" className="py-12 bg-gradient-to-b from-white to-gray-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
              {post.category && (
                <Badge 
                  variant="outline" 
                  className="px-3 py-1 text-xs font-semibold border-blue-200 text-blue-700 bg-blue-50"
                >
                  {post.category}
                </Badge>
              )}
              {post.author && (
                <span className="flex items-center gap-2 text-gray-600">
                  <Icon icon="solar:user-bold" className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{post.author}</span>
                </span>
              )}
              {post.publishedAt && (
                <span className="flex items-center gap-2 text-gray-600">
                  <Icon icon="solar:calendar-bold" className="w-4 h-4 text-gray-400" />
                  {formatDate(post.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-2 text-gray-600">
                <Icon icon="solar:eye-bold" className="w-4 h-4 text-gray-400" />
                {post.views} مشاهدة
              </span>
            </div>
 
            {tagsArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tagsArray.map((tag: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
 
          {post.image && (
            <div className="flex justify-center mb-12">
              <div className="relative w-[600px] h-[300px]  overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-contain p-2"
                  priority
                />
              </div>
            </div>
          )}
 
          <div
            className="prose prose-lg prose-slate max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-8 prose-headings:mb-4
              prose-h1:text-4xl prose-h1:leading-tight prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-4
              prose-h2:text-3xl prose-h2:leading-tight prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-2xl prose-h3:leading-tight prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:text-gray-700 prose-p:mb-6 prose-p:text-lg
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-ul:list-disc prose-ul:pr-6 prose-ul:mb-6
              prose-ol:list-decimal prose-ol:pr-6 prose-ol:mb-6
              prose-li:mb-2 prose-li:text-gray-700 prose-li:leading-relaxed
              prose-blockquote:border-r-4 prose-blockquote:border-blue-500 prose-blockquote:pr-6 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:bg-blue-50 prose-blockquote:rounded-lg prose-blockquote:italic prose-blockquote:text-gray-700
              prose-code:bg-gray-100 prose-code:text-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:shadow-lg
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:border prose-img:border-gray-200
              prose-hr:border-gray-200 prose-hr:my-8
              prose-table:w-full prose-table:my-6 prose-table:border-collapse
              prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:px-4 prose-th:py-2 prose-th:text-right
              prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2
              dark:prose-invert dark:prose-headings:text-gray-100 dark:prose-p:text-gray-300 dark:prose-strong:text-gray-100 dark:prose-li:text-gray-300 dark:prose-blockquote:text-gray-200 dark:prose-blockquote:bg-gray-800"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">مقالات ذات صلة</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-blue-200"
                  >
                    {relatedPost.image && (
                      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      {relatedPost.category && (
                        <Badge 
                          variant="outline" 
                          className="mb-3 w-fit text-xs"
                        >
                          {relatedPost.category}
                        </Badge>
                      )}
                      <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                          {relatedPost.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                        {relatedPost.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:calendar-bold" className="w-3.5 h-3.5" />
                            {formatDate(relatedPost.publishedAt)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Icon icon="solar:eye-bold" className="w-3.5 h-3.5" />
                          {relatedPost.views}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
                العودة إلى المدونة
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Icon icon="solar:share-bold" className="w-4 h-4" />
                    مشاركة المقال
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {typeof window !== 'undefined' && 'share' in navigator && (
                    <DropdownMenuItem
                      onClick={handleNativeShare}
                      className="cursor-pointer"
                    >
                      <Icon icon="solar:share-bold" className="w-4 h-4 ml-2" />
                      مشاركة...
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={copyLink}
                    className="cursor-pointer"
                  >
                    <Icon icon="solar:copy-bold" className="w-4 h-4 ml-2" />
                    نسخ الرابط
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => shareOnPlatform('facebook')}
                    className="cursor-pointer"
                  >
                    <Icon icon="mdi:facebook" className="w-4 h-4 ml-2 text-blue-600" />
                    فيسبوك
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => shareOnPlatform('twitter')}
                    className="cursor-pointer"
                  >
                    <Icon icon="simple-icons:x" className="w-4 h-4 ml-2" />
                    تويتر / X
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => shareOnPlatform('whatsapp')}
                    className="cursor-pointer"
                  >
                    <Icon icon="mdi:whatsapp" className="w-4 h-4 ml-2 text-green-600" />
                    واتساب
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => shareOnPlatform('telegram')}
                    className="cursor-pointer"
                  >
                    <Icon icon="mdi:telegram" className="w-4 h-4 ml-2 text-blue-500" />
                    تيليجرام
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => shareOnPlatform('linkedin')}
                    className="cursor-pointer"
                  >
                    <Icon icon="mdi:linkedin" className="w-4 h-4 ml-2 text-blue-700" />
                    لينكد إن
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </article>
      </main>
    </>
  );
}
