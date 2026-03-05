"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Image from "next/image";
import hero1 from "@/assets/sliderone.webp";
import hero2 from "@/assets/slidertwo.webp";
import hero3 from "@/assets/sliderthree.webp";

const SLIDES = [
  {
    image: hero1,
    badge: "معايير أكاديمية يعتمد عليها الطلاب",
    title: (
      <>
        نقدّم لك <span className="text-[#0056d2]">تنفيذًا</span> أكاديميًا{" "}
        <span className="text-[#0056d2]">احترافيًا</span> بمعايير دقيقة
      </>
    ),
    description:
      "إعداد الأبحاث والتقارير ومشاريع التخرج وفق ضوابط علمية واضحة وإشراف متخصص.",
    features: ["فريق أكاديمي متخصص", "محتوى أصلي موثق", "دعم احترافي متواصل"],
  },
  {
    image: hero2,
    badge: "إنجاز أكاديمي بثقة واستحقاق",
    title: (
      <>
        نحو <span className="text-[#0056d2]">نتائج</span> أكاديمية مشرّفة{" "}
        <span className="text-[#0056d2]">تعكس تميزك</span>
      </>
    ),
    description:
      "تنفيذ أكاديمي دقيق يواكب متطلبات جامعتك، ويمنحك الثقة لتسلّم أعمالك بأعلى مستوى من الاحتراف.",
    features: ["التزام صارم بالمواعيد", "مراجعة وتدقيق احترافي", "تنسيق أكاديمي معتمد"],
  },
  {
    image: hero3,
    badge: "التزام دقيق بالمواعيد",
    title: (
      <>
        جاهز <span className="text-[#0056d2]">في الوقت المحدد</span> دون تنازل عن
        الجودة
      </>
    ),
    description:
      "تنفيذ أكاديمي منظم يضمن تسليم أعمالك ضمن الإطار الزمني المطلوب، مع مراجعة دقيقة وخصوصية كاملة.",
    features: ["تسليم قبل الموعد النهائي", "مراجعة وتدقيق شامل", "خصوصية وسرية تامة"],
  },
];

const AUTOPLAY_INTERVAL = 5500;

export function HeroSection() {
  const slides = useMemo(() => SLIDES, []);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const handleDotClick = (index: number) => {
    setCurrent(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <section
      dir="rtl"
      className="relative min-h-[100vh] flex items-center overflow-hidden pt-10 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900"
    >
     
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0056d2]/10 via-[#0056d2]/5 to-transparent" />


      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
        
          <div className="relative hidden lg:block order-2">
            <div className="relative w-full h-[475px] overflow-hidden">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${current === index ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                >
                  <Image
                    src={slide.image}
                    alt={`Hero ${index + 1}`}
                    fill
                    className="object-contain object-center select-none pointer-events-none"
                    priority={index === 0}
                    draggable={false}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Text */}
          <div className="text-right order-1 relative">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${current === index
                    ? "opacity-100 relative z-10"
                    : "opacity-0 absolute inset-0 z-0 pointer-events-none"
                  }`}
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-1 mb-5 rounded-lg border border-[#0056d2]/10 bg-white/70 backdrop-blur-xl shadow-sm"
                >
                  <Icon
                    icon="solar:medal-ribbons-star-bold"
                    className="w-4 h-4"
                    style={{ color: "#0056d2" }}
                  />
                  <span className="text-sm font-bold" style={{ color: "#0056d2" }}>
                    {slide.badge}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                  {slide.title}
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
                  {slide.description}
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  {slide.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Icon icon="solar:stars-line-duotone" className="w-4 h-4 text-[#0056d2]" />
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/contact-us"
                      className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                        bg-[#0056d2] text-white text-sm font-semibold 
                        shadow-lg shadow-[#0056d2]/25 
                        transition-all duration-300 
                        hover:shadow-xl hover:shadow-[#0056d2]/35 
                        hover:-translate-y-0.5"
                    >
                      قدّم طلبك الآن
                      <Icon
                        icon="solar:arrow-left-linear"
                        className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
                      />
                    </Link>

                    <Link
                      href="/services"
                      className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                        bg-white/65 backdrop-blur-xl 
                        border border-[#0056d2]/20
                        text-[#0056d2] text-sm font-medium
                        transition-all duration-300 
                        hover:bg-white hover:border-[#0056d2]/40 
                        hover:-translate-y-0.5"
                    >
                      <Icon
                        icon="solar:book-2-outline"
                        className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
                      />
                      استكشف الخدمات
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
         
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleDotClick(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${current === i ? "w-8 bg-[#0056d2]" : "w-2 bg-[#0056d2]/30"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}