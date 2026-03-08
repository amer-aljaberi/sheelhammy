"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Suspense } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "962781858647";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

const ARAB_COUNTRIES = [
  { code: "MA", name: "المغرب", dial: "+212" },
  { code: "DZ", name: "الجزائر", dial: "+213" },
  { code: "TN", name: "تونس", dial: "+216" },
  { code: "LY", name: "ليبيا", dial: "+218" },
  { code: "EG", name: "مصر", dial: "+20" },

  { code: "PS", name: "فلسطين", dial: "+970" },
  { code: "JO", name: "الأردن", dial: "+962" },
  { code: "LB", name: "لبنان", dial: "+961" },
  { code: "SY", name: "سوريا", dial: "+963" },
  { code: "IQ", name: "العراق", dial: "+964" },

  { code: "SA", name: "السعودية", dial: "+966" },
  { code: "AE", name: "الإمارات", dial: "+971" },
  { code: "QA", name: "قطر", dial: "+974" },
  { code: "KW", name: "الكويت", dial: "+965" },
  { code: "BH", name: "البحرين", dial: "+973" },
  { code: "OM", name: "عُمان", dial: "+968" },
].filter((c) => c.dial);

type FormData = {
  name: string;
  email: string;
  phoneCountryDial: string;
  phoneLocal: string;

  service: string;
  message: string;

  academicLevel: string;
  subject: string;
  university: string;
  deadline: string;
  pagesOrWords: string;
  language: string;
  urgency: string;
  filesLink: string;
};

function ContactFormContent() {
  const searchParams = useSearchParams();
  const [referrerCode, setReferrerCode] = useState<string | null>(null);
  const [referrerInfo, setReferrerInfo] = useState<{ name: string; code: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phoneCountryDial: "+962",
    phoneLocal: "",

    service: "",
    message: "",

    academicLevel: "",
    subject: "",
    university: "",
    deadline: "",
    pagesOrWords: "",
    language: "ar",
    urgency: "normal",
    filesLink: "",
  });

  
  useEffect(() => {
    const ref = searchParams?.get("ref");
    if (ref) {
   
      if (typeof window !== "undefined") {
        localStorage.setItem("referrerCode", ref);
      }
      setReferrerCode(ref);
      // Fetch referrer info
      fetch(`/api/referrer/${ref}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.name && data.referrerCode) {
            setReferrerInfo({ name: data.name, code: data.referrerCode });
          }
        })
        .catch((err) => {
          console.error("Error fetching referrer info:", err);
        });
    } else {
      // Check localStorage for saved referrer code
      if (typeof window !== "undefined") {
        const savedRef = localStorage.getItem("referrerCode");
        if (savedRef) {
          setReferrerCode(savedRef);
          // Fetch referrer info
          fetch(`/api/referrer/${savedRef}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.name && data.referrerCode) {
                setReferrerInfo({ name: data.name, code: data.referrerCode });
              }
            })
            .catch((err) => {
              console.error("Error fetching referrer info:", err);
            });
        }
      }
    }
  }, [searchParams]);

  const fullPhone = useMemo(() => {
    const local = (formData.phoneLocal || "").trim().replace(/\s+/g, "");
    return `${formData.phoneCountryDial}${local ? " " + local : ""}`.trim();
  }, [formData.phoneCountryDial, formData.phoneLocal]);

  const serviceLabel = useMemo(() => {
    const map: Record<string, string> = {
      assignment: "إعداد الأسايمنت",
      research: "إعداد الأبحاث",
      writing: "الكتابة الأكاديمية",
      homework: "مساعدة الواجبات",
      editing: "التدقيق اللغوي",
      tutoring: "شرح/خصوصي",
      presentation: "عروض تقديمية (PPT)",
      other: "أخرى",
    };
    return map[formData.service] ?? formData.service;
  }, [formData.service]);

  const academicLevelLabel = useMemo(() => {
    const map: Record<string, string> = {
      school: "مدرسة",
      diploma: "دبلوم",
      bachelor: "بكالوريوس",
      master: "ماجستير",
      phd: "دكتوراه",
      other: "أخرى",
    };
    return map[formData.academicLevel] ?? formData.academicLevel;
  }, [formData.academicLevel]);

  const languageLabel = useMemo(() => {
    const map: Record<string, string> = {
      ar: "العربية",
      en: "الإنجليزية",
      both: "عربي + إنجليزي",
    };
    return map[formData.language] ?? formData.language;
  }, [formData.language]);

  const urgencyLabel = useMemo(() => {
    const map: Record<string, string> = {
      normal: "عادي",
      urgent: "مستعجل",
      very_urgent: "مستعجل جداً",
    };
    return map[formData.urgency] ?? formData.urgency;
  }, [formData.urgency]);

  const formatDeadlineForWhatsApp = (value: string) => {
    if (!value) return "غير محدد";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("ar-JO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save contact request and send WhatsApp to referrer if exists
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: fullPhone,
          service: formData.service,
          message: formData.message,
          academicLevel: formData.academicLevel,
          subject: formData.subject,
          university: formData.university,
          deadline: formData.deadline,
          pagesOrWords: formData.pagesOrWords,
          language: formData.language,
          urgency: formData.urgency,
          filesLink: formData.filesLink,
          referrerCode: referrerCode,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("استجابة غير صحيحة من الخادم");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "فشل في حفظ الطلب" }));
        throw new Error(errorData.error || "فشل في حفظ الطلب");
      }

      const data = await response.json();
      
      // رسالة منظمة ومنسقة للواتساب
      const message = `🎓 *طلب خدمة أكاديمية*\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *معلومات التواصل*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `الاسم: ${formData.name}\n` +
        `${formData.email ? `البريد الإلكتروني: ${formData.email}\n` : ''}` +
        `رقم الهاتف: ${fullPhone}\n` +
        `${referrerInfo ? `المندوب: ${referrerInfo.name} (${referrerInfo.code})\n` : ''}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📋 *تفاصيل الطلب*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `نوع الخدمة: ${serviceLabel}\n` +
        `المرحلة الدراسية: ${academicLevelLabel}\n` +
        `${formData.university ? `الجامعة/المدرسة: ${formData.university}\n` : ''}` +
        `${formData.subject ? `المادة/التخصص: ${formData.subject}\n` : ''}` +
        `${formData.deadline ? `موعد التسليم: ${formatDeadlineForWhatsApp(formData.deadline)}\n` : ''}` +
        `${formData.pagesOrWords ? `نوع المخرجات: ${formData.pagesOrWords === 'word' ? 'ملف Word' : formData.pagesOrWords === 'pdf' ? 'ملف PDF' : formData.pagesOrWords === 'ppt' ? 'PowerPoint' : formData.pagesOrWords === 'both_word_pdf' ? 'Word + PDF' : formData.pagesOrWords}\n` : ''}` +
        `اللغة: ${languageLabel}\n` +
        `الاستعجال: ${urgencyLabel === 'normal' ? 'عادي' : urgencyLabel === 'urgent' ? '🚨 مستعجل' : '⚡ مستعجل جداً'}\n` +
        `${formData.filesLink ? `رابط الملفات: ${formData.filesLink}\n` : ''}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💬 *الرسالة*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `${formData.message}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ تم إرسال الطلب عبر الموقع`;

      const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, "_blank");

      // Send WhatsApp to referrer if exists
      if (data.referrer && data.referrer.whatsappLink) {
        setTimeout(() => {
          window.open(data.referrer.whatsappLink, "_blank"); 
        }, 500);
      }
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast.error(error.message || "حدث خطأ أثناء إرسال الطلب");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const ContactItem = ({
    icon,
    title,
    value,
    href,
    external,
    badge,
  }: {
    icon: string;
    title: string;
    value: string;
    href: string;
    external?: boolean;
    badge?: string;
  }) => (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-start gap-4 rounded-3xl border border-black/10 dark:border-gray-700 bg-white dark:bg-gray-800 p-4
                 shadow-[0_10px_28px_rgba(0,0,0,0.06)] dark:shadow-gray-900/50
                 hover:shadow-[0_14px_36px_rgba(0,0,0,0.10)] dark:hover:shadow-gray-900/70
                 hover:border-black/15 dark:hover:border-gray-600 transition-all"
    >
      <div className="w-11 h-11 rounded-2xl bg-[#E1EFFF] dark:bg-blue-900/30 border border-black/10 dark:border-gray-700 flex items-center justify-center shrink-0">
        <Icon icon={icon} className="w-6 h-6 text-[#0056D2] dark:text-blue-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-extrabold text-black dark:text-white">{title}</div>
          {badge ? (
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#E1EFFF] dark:bg-blue-900/30 text-[#0056D2] dark:text-blue-300 border border-black/10 dark:border-gray-700">
              {badge}
            </span>
          ) : null}
        </div>

        <div className="text-sm text-black/70 dark:text-gray-300 mt-1 break-words">{value}</div>
        <div className="mt-2 text-xs font-bold text-[#0056D2] dark:text-blue-400 opacity-0 group-hover:opacity-100 transition">
          اضغط للتواصل
        </div>
      </div>
    </a>
  );

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-extrabold text-black dark:text-white mb-2.5">{children}</label>
  );

  const inputBase =
    "w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base " +
    "focus:border-[#0056D2] dark:focus:border-blue-500 focus:ring-4 focus:ring-[#0056D2]/10 dark:focus:ring-blue-500/20 focus:outline-none transition-all duration-300 " +
    "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const selectBase =
    "w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base appearance-none cursor-pointer " +
    "focus:border-[#0056D2] dark:focus:border-blue-500 focus:ring-4 focus:ring-[#0056D2]/10 dark:focus:ring-blue-500/20 focus:outline-none transition-all duration-300 " +
    "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const container = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, staggerChildren: 0.07 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <section
      dir="rtl"
      className="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-white dark:bg-gray-900"
    > 
      <div className="pointer-events-none absolute inset-0">
 
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#E1EFFF40,transparent_55%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(30,58,138,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,#E1EFFF30,transparent_55%)] dark:bg-[radial-gradient(circle_at_80%_60%,rgba(30,64,175,0.1),transparent_55%)]" />
 
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-[#E1EFFF]/5 dark:bg-blue-900/10 rounded-full blur-1xl" />
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] bg-[#E1EFFF]/30 dark:bg-blue-800/20 rounded-full blur-3xl" />
      </div>


      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl w-full"
      > 
        <motion.div variants={item} className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
         
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-800/50 bg-white dark:bg-gray-800 p-4 hover:shadow-md hover:border-green-300 dark:hover:border-green-700 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                <Icon icon="logos:whatsapp-icon" className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">واتساب</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    الأفضل
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">رسالة جاهزة</p>
              </div>
            </a>

            {/* Phone Card */}
            <a
              href="tel:+962781858647"
              className="group flex items-center gap-3 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-gray-800 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                <Icon icon="solar:phone-calling-bold" className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">اتصال مباشر</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">+962 781 858 647</p>
              </div>
            </a>

            {/* Email Card */}
            <a
              href="mailto:info@sheelhammy.com"
              className="group flex items-center gap-3 rounded-xl border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-gray-800 p-4 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center shrink-0">
                <Icon icon="solar:letter-bold" className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">البريد الإلكتروني</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">info@sheelhammy.com</p>
              </div>
            </a>
          </div>

          {/* Working Hours & Info - Compact Row */}
          <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Working Hours */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Icon icon="solar:clock-circle-bold" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">أوقات الدوام</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">توقيت الأردن</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">السبت–الخميس:</span>{" "}
                  <span className="font-bold text-gray-900 dark:text-white">10 ص–10 م</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">الجمعة:</span>{" "}
                  <span className="font-bold text-gray-900 dark:text-white">2 م–10 م</span>
                </div>
              </div>
            </div>

            {/* After Hours Note */}
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <Icon icon="solar:chat-round-dots-bold" className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">خارج الدوام</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">متاح 24/7</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  استقبل رسالتك بأي وقت — ونرجع نرد عليك بأول وقت دوام.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div variants={item} className="w-full md:w-6xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative bg-white dark:bg-gray-800 rounded-3xl p-3 sm:p-6 md:p-10 lg:p-12 border border-gray-200 dark:border-gray-700
             shadow-xl dark:shadow-gray-900/50"
          >
            {/* Card Title */}
            <div className="mb-6 sm:mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4">
                <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                <span>إرسال سريع وآمن</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                نموذج الطلب
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2">
                املأ المعلومات أدناه — وسيفتح واتساب برسالة جاهزة ومنظمة بكل التفاصيل
              </p>
             
            </div>

            {/* name/email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <FieldLabel>الاسم الكامل</FieldLabel>
                  <div className="relative group">
                    <Icon
                      icon="solar:user-bold"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none transition-colors"
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={inputBase}
                      placeholder="مثال: أحمد محمد"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>
                    البريد الإلكتروني <span className="text-xs font-bold text-black/40 dark:text-gray-500">(اختياري)</span>
                  </FieldLabel>
                  <div className="relative group">
                    <Icon
                      icon="solar:letter-bold"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none transition-colors"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputBase}
                      placeholder="example@email.com"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                </div>
              </div>

            {/* phone/service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <FieldLabel>رقم الهاتف (إجباري)</FieldLabel>

                  <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-3 sm:gap-3">
                    <div className="relative group">
                      <Icon
                        icon="solar:flag-bold"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none"
                      />
                      <select
                        name="phoneCountryDial"
                        value={formData.phoneCountryDial}
                        onChange={handleChange}
                        className={selectBase}
                        required
                      >
                        {ARAB_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.dial}>
                            {c.name} ({c.dial})
                          </option>
                        ))}
                      </select>
                      <Icon
                        icon="solar:alt-arrow-down-bold"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      />
                    </div>

                    <div className="relative group">
                      <Icon
                        icon="solar:phone-bold"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none"
                      />
                      <input
                        type="tel"
                        name="phoneLocal"
                        value={formData.phoneLocal}
                        onChange={handleChange}
                        required
                        className={inputBase}
                        placeholder="مثال: 7XXXXXXXX"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-black/60 dark:text-gray-400">
                    سيتم إرسال الرقم بصيغة:{" "}
                    <span className="font-extrabold text-black dark:text-white">{fullPhone || "+962 ..."}</span>
                  </p>
                </div>

                <div>
                  <FieldLabel>نوع الخدمة</FieldLabel>
                  <div className="relative group">
                    <Icon
                      icon="solar:book-2-bold"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none"
                    />
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className={selectBase}
                    >
                      <option value="">اختر الخدمة</option>
                      <option value="assignment">إعداد الأسايمنت</option>
                      <option value="research">إعداد الأبحاث</option>
                      <option value="writing">الكتابة الأكاديمية</option>
                      <option value="homework">مساعدة الواجبات</option>
                      <option value="editing">التدقيق اللغوي</option>
                      <option value="tutoring">شرح/خصوصي</option>
                      <option value="presentation">عروض تقديمية (PPT)</option>
                      <option value="other">أخرى</option>
                    </select>
                    <Icon
                      icon="solar:alt-arrow-down-bold"
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

            {/* Student fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <FieldLabel>المرحلة الدراسية</FieldLabel>
                  <div className="relative group">
                    <Icon
                      icon="solar:graduation-cap-bold"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none"
                    />
                    <select
                      name="academicLevel"
                      value={formData.academicLevel}
                      onChange={handleChange}
                      required
                      className={selectBase}
                    >
                      <option value="">اختر المرحلة</option>
                      <option value="school">مدرسة</option>
                      <option value="diploma">دبلوم</option>
                      <option value="bachelor">بكالوريوس</option>
                      <option value="master">ماجستير</option>
                      <option value="phd">دكتوراه</option>
                      <option value="other">أخرى</option>
                    </select>
                    <Icon
                      icon="solar:alt-arrow-down-bold"
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>المادة / التخصص</FieldLabel>
                  <div className="relative group">
                    <Icon
                      icon="solar:book-bold"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none"
                    />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={inputBase}
                      placeholder="مثال: برمجة، محاسبة، إحصاء..."
                    />
                  </div>
                </div>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <FieldLabel>الجامعة / المدرسة</FieldLabel>
                  <div className="relative group">
                    <Icon
                      icon="solar:buildings-2-bold"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none"
                    />
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      className={inputBase}
                      placeholder="مثال: الجامعة الأردنية..."
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>موعد التسليم (تاريخ فقط)</FieldLabel>
                  <div className="relative group">
                    <Icon
                      icon="solar:calendar-date-bold"
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none"
                    />
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className={inputBase + " [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"}
                    />
                  </div>
                </div>
              </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                   <div>
                    <FieldLabel>اللغة</FieldLabel>
                    <div className="relative group">
                      <Icon
                        icon="solar:translation-bold"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none"
                      />
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className={selectBase}
                      >
                        <option value="ar">العربية</option>
                        <option value="en">الإنجليزية</option>
                        <option value="both">عربي + إنجليزي</option>
                      </select>
                      <Icon
                        icon="solar:alt-arrow-down-bold"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>الاستعجال</FieldLabel>
                    <div className="relative group">
                      <Icon
                        icon="solar:bolt-bold"
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none"
                      />
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        className={selectBase}
                      >
                        <option value="normal">عادي</option>
                        <option value="urgent">مستعجل</option>
                        <option value="very_urgent">مستعجل جداً</option>
                      </select>
                      <Icon
                        icon="solar:alt-arrow-down-bold"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div> 
              </div>

            {/* Details */}
            <div className="mb-6 sm:mb-8">
              <FieldLabel>تفاصيل الطلب</FieldLabel>
              <div className="relative group">
                <Icon
                  icon="solar:chat-round-dots-bold"
                  className="absolute right-4 top-4 w-5 h-5 text-[#0056D2] dark:text-blue-400 z-10 pointer-events-none"
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required={false}
                  rows={5}
                  className={
                    "w-full pr-12 pl-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base " +
                    "focus:border-[#0056D2] dark:focus:border-blue-500 focus:ring-4 focus:ring-[#0056D2]/10 dark:focus:ring-blue-500/20 focus:outline-none transition-all duration-300 resize-none " +
                    "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                  }
                  placeholder="اكتب المطلوب بالتفصيل + تعليمات الدكتور + تنسيق APA/MLA..."
                />
              </div>
            </div>

            <Button
                type="submit"
                size="lg"
              className="group relative w-full overflow-hidden rounded-2xl
           bg-gradient-to-r from-green-500 to-green-600
           text-white font-bold text-base sm:text-lg
           flex items-center justify-center gap-3
           px-6 sm:px-8 py-4 sm:py-5
           transition-all duration-300
           shadow-lg shadow-green-500/30
           hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02]
           active:scale-[0.98]"
            >
              <Icon icon="logos:whatsapp-icon" className="w-6 h-6 relative z-10" />
              <span className="relative z-10">
                إرسال عبر واتساب
              </span>
              <Icon
                icon="solar:arrow-left-bold"
                className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1"
              />
            </Button>

            <div className="mt-4 sm:mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <Icon icon="solar:shield-check-bold" className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  بالضغط على إرسال، سيتم فتح واتساب مع رسالة منظمة بكل المعلومات
                </p>
              </div>
            </div>
            </form>
          </motion.div>
        </motion.div>
      </section>
  );
}

export function ContactForm() {
  return (
    <Suspense fallback={
      <section dir="rtl" className="py-20 relative overflow-hidden bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </section>
    }>
      <ContactFormContent />
    </Suspense>
  );
}
