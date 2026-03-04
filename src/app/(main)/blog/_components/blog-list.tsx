"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  author: string | null;
  publishedAt: string | null;
  views: number;
  category: string | null;
  tags: string[] | null;
};

export function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const url = selectedCategory
        ? `/api/blog?category=${encodeURIComponent(selectedCategory)}`
        : "/api/blog";

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.details || "Failed to fetch posts"
        );
      }

      const data = await response.json();
      const postsArray = data.posts || (Array.isArray(data) ? data : []);
      setPosts(postsArray);

      const uniqueCategories = Array.from(
        new Set(postsArray.map((p: BlogPost) => p.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error("Error fetching blog posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasCategories = categories.length > 0;

  const skeletonCards = useMemo(() => [1, 2, 3, 4, 5, 6], []);

  if (isLoading) {
    return (
      <section dir="rtl" className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:w-7xl w-full">
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            <div className="h-10 w-20 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {skeletonCards.map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full"
              >
                <div className="w-full aspect-[16/10] bg-gray-200 dark:bg-gray-800 animate-pulse" />
                <div className="p-5 flex flex-col flex-1 min-h-[280px]">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                  <div className="flex gap-1.5 mb-4">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section dir="rtl" className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:w-7xl w-full">

        {/* Empty */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-5">
              <Icon
                icon="solar:document-text-bold"
                className="w-10 h-10 text-gray-400"
              />
            </div>
            <p className="text-gray-700 text-lg font-semibold">
              لا توجد مقالات متاحة
            </p>
            <p className="text-gray-500 mt-2">
              جرّب تغيير التصنيف أو عُد لاحقًا.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
              > 
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-fill transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <div className="w-20 h-20 rounded-2xl bg-white/80 dark:bg-gray-900/80 border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center shadow-lg">
                        <Icon
                          icon="solar:document-text-bold"
                          className="w-10 h-10 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                  {/* Category Badge */}
                  {post.category && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-blue-600/90 hover:bg-blue-600 text-white border-0 backdrop-blur-sm shadow-lg">
                        <Icon icon="solar:bookmark-bold" className="w-3.5 h-3.5 ml-1" />
                        {post.category}
                      </Badge>
                    </div>
                  )}

                  {/* Views Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-black/40 backdrop-blur-md border border-white/20 shadow-lg">
                      <Icon icon="solar:eye-bold" className="w-3.5 h-3.5" />
                      {post.views}
                    </span>
                  </div>
                </div>

                {/* Content Section - Fixed Height */}
                <div className="flex flex-col flex-1 p-5 min-h-[280px]">
                  {/* Title */}
                  <div className="mb-3">
                    <h3 className="text-gray-900 dark:text-white text-lg font-extrabold leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                  </div>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Tags */}
                  {!!post.tags?.length && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="rounded-full text-xs px-2 py-0.5 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        >
                          {t}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Information */}
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-3">
                      {/* Author & Date */}
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        {post.author && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <Icon icon="solar:user-bold" className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="font-medium truncate">{post.author}</span>
                          </div>
                        )}
                        {post.publishedAt && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                            <Icon icon="solar:calendar-bold" className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Read More Button */}
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 flex-shrink-0">
                        اقرأ
                        <Icon
                          icon="solar:arrow-left-bold"
                          className="w-3.5 h-3.5"
                        />
                      </span>
                    </div>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}