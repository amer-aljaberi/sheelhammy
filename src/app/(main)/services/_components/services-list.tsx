"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import DetailsMoldals from "./detailsMoldals";

type Service = {
  id: string;
  title: string;
  description: string;
  shortDescription?: string | null;
  detailedDescription?: string | null;
  image: string | null;
  features?: string[];
  category: {
    id: string;
    name: string;
  };
};

type Category = {
  id: string;
  name: string;
};

const DEFAULT_IMAGE = "https://i.ibb.co/7Q8KJ9x/assignment.png";
const PRIMARY = "#0056d2";

function cleanText(s: string) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function extractFeatures(service: Service): string[] {
  if (service.features && Array.isArray(service.features) && service.features.length > 0) {
    return service.features.slice(0, 4); // نخليها 4 عشان 2x2
  }
  const sentences = service.description.split(/[،,.]/).filter((s) => s.trim().length > 6);
  const features = sentences.slice(0, 4).map((s) => s.trim());
  const fallbacks = ["تنفيذ دقيق ومتقن", "التزام بالمواعيد", "دعم حتى التسليم", "تنسيق احترافي"];
  while (features.length < 4) features.push(fallbacks[features.length]);
  return features;
}

function buildModalBlocks(service: Service) {
  const shortDesc = service.shortDescription ? cleanText(service.shortDescription) : cleanText(service.description);
  const detailedDesc = service.detailedDescription ? cleanText(service.detailedDescription) : cleanText(service.description);
  const includes =
    service.features && Array.isArray(service.features) && service.features.length > 0
      ? service.features
      : [
        "تنسيق احترافي حسب متطلبات المادة/الدكتور",
        "مراجعة سريعة وتحسين صياغة عند الحاجة",
        "تسليم منظم + تعديلات بسيطة حسب الملاحظات",
      ];
  const required = ["اسم المادة + نوع المهمة", "التعليمات / Rubric (إن وُجد)", "الموعد النهائي + المطلوب (صفحات/نقاط)"];
  const workflow = [
    { title: "استلام", desc: "نراجع المطلوب ونحدد النواقص." },
    { title: "تنفيذ", desc: "تنفيذ منظم مع تدقيق." },
    { title: "تسليم", desc: "تسليم + تعديل بسيط عند الحاجة." },
  ];
  const note = "كلما كانت التفاصيل أوضح، كانت النتيجة أدق وأسرع.";
  const summary = shortDesc.length > 220 ? `${shortDesc.slice(0, 220).trim()}...` : shortDesc;
  return { summary, detailedDescription: detailedDesc, includes, required, workflow, note };
}

export function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try { 
        const [categoriesRes, servicesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/services"),
        ]);

        if (!categoriesRes.ok || !servicesRes.ok) {
          const categoriesError = categoriesRes.ok ? null : await categoriesRes.json().catch(() => ({}));
          const servicesError = servicesRes.ok ? null : await servicesRes.json().catch(() => ({}));
          throw new Error(
            categoriesError?.error || servicesError?.error || "Failed to fetch data"
          );
        }

        const categoriesData = await categoriesRes.json();
        const servicesData = await servicesRes.json();
         
        if (!Array.isArray(categoriesData) || !Array.isArray(servicesData)) {
          throw new Error("Invalid data format");
        }
 
        setCategories(categoriesData);
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
        setCategories([]);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
 
  const filteredServices = selectedCategoryId === "all" 
    ? services 
    : services.filter(service => service.category.id === selectedCategoryId);

  const activeService = useMemo(() => {
    if (openIndex === null) return null;
    return filteredServices[openIndex] ?? null;
  }, [openIndex, filteredServices]);

  const modalData = useMemo(() => (activeService ? buildModalBlocks(activeService) : null), [activeService]);

  const categoryTabs = [
    { 
      id: "all", 
      name: "الكل", 
      icon: "solar:widget-5-bold", 
      count: services.length 
    },
    ...categories.map((category) => {
      const count = services.filter(s => s.category.id === category.id).length;
      return {
        id: category.id,
        name: category.name,
        icon: "solar:book-bold", 
        count,
      };
    }),
  ].filter(tab => tab.count > 0 || tab.id === "all");

  return (
    <section dir="rtl" className="relative py-20 overflow-hidden bg-white">
      {/* خلفية زخرفية خفيفة */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.035]"
          style={{ background: `radial-gradient(circle, ${PRIMARY}, transparent)`, transform: "translate(30%,-30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: `radial-gradient(circle, ${PRIMARY}, transparent)`, transform: "translate(-30%,30%)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, #0056d20f 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Category Tabs */}
        {!isLoading && categoryTabs.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {categoryTabs.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                  selectedCategoryId === category.id
                    ? "bg-[#0056d2] text-white shadow-lg"
                    : "bg-white text-gray-700 border-2 border-gray-100 hover:border-[#0056d2]/40"
                }`}
              >
                <Icon icon={category.icon} className="w-4 h-4" />
                <span>{category.name}</span>
                {category.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategoryId === category.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* سكيليتون */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-14">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[460px] bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Icon icon="solar:folder-off-bold" className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-400 text-lg">لا توجد خدمات في هذا التصنيف</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-14 items-stretch">
            {filteredServices.map((service, index) => {
              const features = extractFeatures(service);
              const isHovered = hoveredIndex === index;

              return (
                <div
                key={service.id ?? index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative flex flex-col bg-white rounded-3xl overflow-hidden
                  border border-gray-100
                  shadow-[0_4px_24px_rgba(0,0,0,0.06)]
                  hover:shadow-[0_16px_48px_rgba(0,86,210,0.14)]
                  transition-all duration-500 hover:-translate-y-1"
              >
             
                <div className="relative h-44 w-full overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                  <Image
                    src={service.image || DEFAULT_IMAGE}
                    alt={service.title}
                    fill
                    className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width:768px)100vw,(max-width:1200px)50vw,33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/25 to-transparent pointer-events-none" />

               
                  {service.category?.name && (
                    <div
                      className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm"
                      style={{
                        background: "rgba(255,255,255,0.88)",
                        borderColor: `${PRIMARY}22`,
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIMARY }} />
                      <span className="text-xs font-extrabold text-gray-900">{service.category.name}</span>
                    </div>
                  )} 
            
       
                </div>

                <div className="flex-1 flex flex-col px-2 py-2 gap-4">
               
                    <p className="text-xs font-extrabold " style={{ color: PRIMARY }}>
                      {service.category?.name ?? "خدمة أكاديمية"}
                    </p>
                    <h3 className="text-xl font-extrabold text-black leading-tight line-clamp-2">{service.title}</h3>
                 
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{service.description}</p>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {features.slice(0, 4).map((feat, fi) => (
                      <div key={fi} className="flex items-start gap-2">
                        <span
                          className="mt-[2px] w-4.5 h-4.5 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{ background: `${PRIMARY}18` }}
                        >
                          <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                        </span>
                        <span className="text-[12.5px] text-gray-600 leading-snug line-clamp-2">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 mt-auto" />

                  <div className="flex items-center gap-2.5">
                    <Link
                      href="/contact-us"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white
                        transition-all duration-200 hover:opacity-95 hover:shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${PRIMARY}, #0047b3)`,
                        boxShadow: `0 6px 18px ${PRIMARY}35`,
                      }}
                    >
                      <Icon icon="solar:phone-calling-bold" className="w-4 h-4" />
                      اطلب الخدمة
                    </Link>

                    <button
                      type="button"
                      onClick={() => setOpenIndex(index)}
                      className="flex cursor-pointer items-center justify-center w-11 h-11 rounded-xl border-2 transition-all duration-200 flex-shrink-0"
                      style={{
                        borderColor: `${PRIMARY}30`,
                        color: PRIMARY,
                        background: `${PRIMARY}08`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = PRIMARY;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = PRIMARY;
                        (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = `${PRIMARY}08`;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${PRIMARY}30`;
                        (e.currentTarget as HTMLButtonElement).style.color = PRIMARY;
                      }}
                      aria-label="التفاصيل"
                    >
                      <Icon icon="solar:eye-bold" className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* خط سفلي موحد */}
                <div
                  className="absolute bottom-0 inset-x-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl"
                  style={{ background: `linear-gradient(to left, transparent, ${PRIMARY}, transparent)` }}
                />
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {openIndex !== null && activeService && modalData && (
        <DetailsMoldals open={true} title={activeService.title} onClose={() => setOpenIndex(null)}>
          <div dir="rtl" className="space-y-4 py-1">
            {activeService.shortDescription && (
              <ModalBlock icon="solar:stars-bold" label="ملخّص سريع">
                <p className="text-gray-600 text-sm leading-relaxed">{modalData.summary}</p>
              </ModalBlock>
            )}

            <ModalBlock icon="solar:document-text-bold" label="الوصف التفصيلي">
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{modalData.detailedDescription}</p>
            </ModalBlock>

            <ModalBlock icon="solar:shield-check-bold" label="ماذا ستحصل عليه">
              <div className="grid grid-cols-1 gap-2">
                {modalData.includes.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100/80">
                    <span className="mt-0.5 w-5 h-5 rounded-md bg-[#0056d2] flex items-center justify-center flex-shrink-0">
                      <Icon icon="solar:check-bold" className="w-3 h-3 text-white" />
                    </span>
                    <span className="text-sm text-gray-700 leading-relaxed">{t}</span>
                  </div>
                ))}
              </div>
            </ModalBlock>

            <ModalBlock icon="solar:document-add-bold" label="المطلوب منك">
              <div className="flex flex-col gap-2">
                {modalData.required.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-gray-100 bg-gray-50/80">
                    <span className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-black text-gray-500">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-600">{t}</span>
                  </div>
                ))}
              </div>
            </ModalBlock>

            <ModalBlock icon="solar:clipboard-list-bold" label="خطوات التنفيذ">
              <div className="flex flex-col gap-0">
                {modalData.workflow.map((s, i) => (
                  <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < modalData.workflow.length - 1 && (
                      <div className="absolute top-8 right-[18px] w-[2px] h-full bg-gradient-to-b from-blue-200 to-transparent" />
                    )}
                    <div
                      className="relative z-10 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm text-white shadow-md"
                      style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY}bb)` }}
                    >
                      {i + 1}
                    </div>
                    <div className="pt-1.5">
                      <h4 className="text-sm font-bold text-gray-800 mb-0.5">{s.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ModalBlock>

            <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ background: `${PRIMARY}08`, borderColor: `${PRIMARY}20` }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${PRIMARY}18` }}>
                <Icon icon="solar:info-circle-bold" className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
              </span>
              <p className="text-sm text-gray-600 leading-relaxed pt-1">{modalData.note}</p>
            </div>
          </div>
        </DetailsMoldals>
      )}
    </section>
  );
}

/* Block مساعد للـ Modal */
function ModalBlock({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#0056d215" }}>
          <Icon icon={icon} className="w-4 h-4" style={{ color: "#0056d2" }} />
        </span>
        <span className="text-sm font-bold text-gray-800">{label}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
