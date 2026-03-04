"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

type PortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  link: string | null;
  createdAt: string;
};

function getCategoryFromItem(item: PortfolioItem): string {
  const title = item.title.toLowerCase();
  const desc = (item.description || "").toLowerCase();

  if (
    title.includes("بحث") ||
    title.includes("أكاديمي") ||
    title.includes("أسايمنت") ||
    title.includes("تقرير")
  ) {
    return "academic";
  }
  if (
    title.includes("موقع") ||
    title.includes("ويب") ||
    title.includes("تطبيق") ||
    title.includes("برمجة")
  ) {
    return "web";
  }
  if (title.includes("تصميم") || title.includes("شعار") || title.includes("هوية")) {
    return "design";
  }
  if (title.includes("محتوى") || title.includes("مقال") || title.includes("تسويق")) {
    return "content";
  }
  return "all";
}

/** ─────────────────────────────────────────
 *  THEME (موحّد) — كل الألوان من نفس العائلة
 *  ───────────────────────────────────────── */
const BRAND = "#0056D2";
const BRAND_SOFT_BG = "bg-blue-50/60 dark:bg-blue-900/20";
const BRAND_BORDER = "border-blue-100 dark:border-blue-800/30";
const BRAND_TEXT = "text-[#0056d2] dark:text-blue-400";

const CATEGORY_INFO: Record<
  string,
  { name: string; icon: string; color: string; bg: string; gradient: string }
> = {
  academic: {
    name: "أكاديمية",
    icon: "solar:book-bold",
    color: BRAND,
    bg: BRAND_SOFT_BG,
    gradient: "from-blue-500/14 to-sky-500/6",
  },
  web: {
    name: "مواقع إلكترونية",
    icon: "solar:global-bold",
    color: BRAND,
    bg: BRAND_SOFT_BG,
    gradient: "from-blue-500/14 to-sky-500/6",
  },
  design: {
    name: "تصميم",
    icon: "solar:palette-bold",
    color: BRAND,
    bg: BRAND_SOFT_BG,
    gradient: "from-blue-500/14 to-sky-500/6",
  },
  content: {
    name: "محتوى",
    icon: "solar:document-text-bold",
    color: BRAND,
    bg: BRAND_SOFT_BG,
    gradient: "from-blue-500/14 to-sky-500/6",
  },
  all: {
    name: "الكل",
    icon: "solar:widget-5-bold",
    color: BRAND,
    bg: BRAND_SOFT_BG,
    gradient: "from-blue-500/14 to-sky-500/6",
  },
};

/* ── فيك ستاتس لكل كارد – تولّد من الـ id بشكل ثابت ── */
function getCardMeta(id: string) {
  const seed = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const ratings = [4.7, 4.8, 4.9, 5.0];
  const reviews = [12, 18, 24, 31, 45, 57, 63];
  const deliveries = ["يوم واحد", "يومان", "3 أيام", "5 أيام"];
  const levels = ["مبتدئ", "متوسط", "متقدم"];
  const pages = [4, 6, 8, 10, 15, 20];
  return {
    rating: ratings[seed % ratings.length],
    reviews: reviews[seed % reviews.length],
    delivery: deliveries[seed % deliveries.length],
    level: levels[seed % levels.length],
    pages: pages[seed % pages.length],
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          icon={
            star <= Math.floor(rating)
              ? "solar:star-bold"
              : star - 0.5 <= rating
                ? "solar:star-half-bold"
                : "solar:star-linear"
          }
          className="w-3.5 h-3.5 text-blue-400"
        />
      ))}
    </div>
  );
}

export function SamplesGrid() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/portfolio");
        if (!response.ok) throw new Error("Failed to fetch portfolio");
        const data = await response.json();
        console.log(data);
        setPortfolioItems(data);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        setPortfolioItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const itemsWithCategory = portfolioItems.map((item) => ({
    ...item,
    category: getCategoryFromItem(item),
  }));

  const availableCategories = Array.from(new Set(itemsWithCategory.map((item) => item.category))).filter(
    (cat) => cat !== "all"
  );

  const SAMPLE_CATEGORIES = [
    { id: "all", name: "الكل", icon: "solar:widget-5-bold", count: itemsWithCategory.length },
    ...availableCategories.map((catId) => ({
      id: catId,
      name: CATEGORY_INFO[catId]?.name || catId,
      icon: CATEGORY_INFO[catId]?.icon || "solar:widget-5-bold",
      count: itemsWithCategory.filter((item) => item.category === catId).length,
    })),
  ];

  const filteredSamples =
    activeCategory === "all"
      ? itemsWithCategory
      : itemsWithCategory.filter((item) => item.category === activeCategory);

  const defaultImage = "https://i.ibb.co/5K8X9J2/website.png";

  return (
    <section
      dir="rtl"
      className="py-20 bg-gradient-to-b from-white dark:from-gray-900 via-blue-50/20 dark:via-blue-900/20 to-white dark:to-gray-900"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:w-7xl w-full">
   

        {/* ── سكيليتون ── */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[520px] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSamples.map((sample) => {
                const meta = getCardMeta(sample.id);
                const catInfo = CATEGORY_INFO[sample.category] || CATEGORY_INFO["all"];
                const isHovered = hoveredId === sample.id;

                return (
                  <div
                    key={sample.id}
                    onMouseEnter={() => setHoveredId(sample.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group relative bg-white dark:bg-gray-800/90 rounded-2xl overflow-hidden flex flex-col
                      shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]
                      hover:shadow-[0_8px_40px_rgba(0,86,210,0.18)] dark:hover:shadow-[0_8px_40px_rgba(0,86,210,0.25)]
                      border border-gray-100 dark:border-gray-700/60
                      hover:border-[#0056d2]/30 dark:hover:border-[#0056d2]/40
                      transition-all duration-500 hover:-translate-y-1.5"
                  >
                    {/* ══ صورة الكارد ══ */}
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={sample.image || defaultImage}
                        alt={sample.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* ✅ لا يوجد ظل/تغميق فوق الصورة (تم حذف overlay الأسود بالكامل) */}
                      {/* ✅ تدرج هوية خفيف جداً بدون ما يغمّق الصورة */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${catInfo.gradient} opacity-30`} />

                      {/* شارة الفئة – أعلى اليمين */}
                      <div
                        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                        bg-white/92 dark:bg-gray-900/85 backdrop-blur-sm shadow-sm border border-blue-100/70 dark:border-blue-800/30"
                      >
                        <Icon icon={catInfo.icon} className="w-3.5 h-3.5" style={{ color: BRAND }} />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{catInfo.name}</span>
                      </div>

                      {/* شارة المستوى – أعلى اليسار */}
                      <div
                        className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg
                        bg-white/85 dark:bg-gray-900/70 backdrop-blur-sm border border-blue-100/60 dark:border-blue-800/30"
                      >
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{meta.level}</span>
                      </div>



                      {/* أيقونة عرض عند hover */}

                    </div>

                    {/* ══ محتوى الكارد ══ */}
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      <h3
                        className="text-base font-extrabold text-gray-900 dark:text-white leading-snug
                        group-hover:text-[#0056d2] dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2"
                      >
                        {sample.title}
                      </h3>

                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 min-h-[40px]">
                        {sample.description || "لا يوجد وصف متاح"}
                      </p>



                      {/* ── شارة + تاريخ ── */}
                      <div className="flex items-center justify-between">


                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <Icon icon="solar:calendar-linear" className="w-3.5 h-3.5" />
                          <span>
                            {new Date(sample.createdAt).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>

             {/* ── أزرار الأكشن ── */}
<div className="flex gap-2 mt-auto pt-1">
  <a
    href={sample.link || "#"}
    target="_blank"
    rel="noopener noreferrer"
    className="flex-1 bg-[#0056d2] hover:bg-[#0047b3] dark:bg-blue-600 dark:hover:bg-blue-700
      text-white px-4 py-2.5 rounded-xl font-semibold text-sm
      transition-all duration-200 flex items-center justify-center gap-2
      shadow-[0_4px_12px_rgba(0,86,210,0.28)] hover:shadow-[0_6px_18px_rgba(0,86,210,0.38)]"
  >
    <Icon icon="solar:eye-bold" className="w-4 h-4" />
    عرض النموذج
  </a>

  <Link
    href="/contact-us"
    className="flex items-center justify-center w-11 h-11 rounded-xl
      border-2 border-[#0056d2]/25 dark:border-blue-500/35
      bg-blue-50/60 dark:bg-blue-900/20
      text-[#0056d2] dark:text-blue-400
      hover:bg-[#0056d2] hover:text-white hover:border-[#0056d2]
      dark:hover:bg-blue-600 dark:hover:text-white
      transition-all duration-200 shrink-0"
    title="تواصل معنا"
  >
    <Icon icon="solar:chat-round-dots-bold" className="w-5 h-5" />
  </Link>
</div>
                    </div>

                    {/* خط تدرج سفلي للكارد عند hover (موحّد) */}
                    <div
                      className="absolute bottom-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(to left, transparent, ${BRAND}, transparent)` }}
                    />
                  </div>
                );
              })}
            </div>

            {filteredSamples.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Icon icon="solar:folder-off-bold" className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-base font-medium">لا توجد نماذج في هذه الفئة</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}