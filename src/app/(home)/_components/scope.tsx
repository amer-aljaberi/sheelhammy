"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import scope from "@/assets/scope.svg";
import CountriesGlobeModal from "@/components/common/CountriesGlobeModal";

export function ScopeSection() {
  const [openCountries, setOpenCountries] = useState(false);

  return (
    <section dir="rtl" className="relative py-18 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="text-right mb-12">
              <div
                className="inline-flex items-center gap-2 px-4 py-1 mb-5 rounded-lg border"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "#0056d2",
                  borderWidth: "2px",
                }}
              >
                <Icon
                  icon="solar:global-bold"
                  className="w-4 h-4"
                  style={{ color: "#0056d2" }}
                />
                <span className="text-sm font-bold" style={{ color: "#0056d2" }}>
                  خدمات احترافية بلا حدود
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-4xl font-extrabold mb-6 leading-tight">
                <span className="text-black">نخدمك في </span>
                <span
                  className="relative inline-block"
                  style={{ color: "#0056d2" }}
                >
                  أي مكان
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="12"
                    viewBox="0 0 200 12"
                    fill="none"
                  >
                    <path
                      d="M2 10C60 3 140 3 198 10"
                      stroke="#0056d2"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="text-black"> وفي </span>
                <span
                  className="relative inline-block"
                  style={{ color: "#0056d2" }}
                >
                  أي وقت
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="12"
                    viewBox="0 0 200 12"
                    fill="none"
                  >
                    <path
                      d="M2 10C60 3 140 3 198 10"
                      stroke="#0056d2"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h2>

              <p className="text-lg md:text-ms text-gray-600 max-w-3xl leading-relaxed">
                نقدم خدماتنا باحترافية لكافة الدول العربية، دون قيود مكان أو زمان
              </p>
            </div>

            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>
                سواء كنت{" "}
                <span className="font-bold text-gray-900">طالبًا</span> تحتاج إلى
                دعم منظم في{" "}
                <span className="font-bold text-gray-900">
                  الأبحاث، التقارير، المشاريع، العروض
                </span>{" "}
                أو التدقيق والتنسيق، فإن فريق{" "}
                <span className="font-bold text-[#0056D2]">
                  شيل همي
                </span>{" "}
                يقدّم لك تنفيذًا أكاديميًا احترافيًا يلبي متطلبات جامعتك.
              </p>

              <p>
                نعمل بمنهجية واضحة تشمل تحليل احتياجك، تحديد المتطلبات والموعد،
                ثم تنفيذ دقيق مع{" "}
                <span className="font-bold text-gray-900">
                  تسليم منظم
                </span>{" "}
                ضمن الإطار الزمني المتفق عليه.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="default"
                size="default"
                asChild
                className="group shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link
                  href="/contact-us"
                  className="flex items-center gap-2 !bg-[#0056D2] hover:!bg-[#0047B0] !text-white"
                >
                  <Icon
                    icon="solar:chat-round-call-bold"
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                  />
                  قدّم طلبك الآن
                  <Icon
                    icon="solar:arrow-left-bold"
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </Button>
            </div>
          </div>
 
          <div className="relative order-first lg:order-last flex justify-center">
            <div className="relative">
              <Image
                src={scope}
                alt="نطاق الخدمة - شيل همي"
                width={600}
                height={600}
                className="w-full max-w-md lg:max-w-lg h-auto drop-shadow-2xl"
              />

              <button
                type="button"
                onClick={() => setOpenCountries(true)}
                className="absolute -top-2 -right-2 bg-[#0056D2] text-white px-3 py-1.5 rounded-full shadow-md shadow-blue-500/30 text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all duration-300 border border-white/20 cursor-pointer"
                aria-label="عرض الدول التي نخدمها"
              >
                <Icon
                  icon="solar:global-bold-duotone"
                  className="w-5 h-5"
                />
                <span>الدول التي نخدمها</span>
                <Icon
                  icon="solar:star-circle-bold"
                  className="w-4 h-4"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <CountriesGlobeModal
        open={openCountries}
        onClose={() => setOpenCountries(false)}
      />
    </section>
  );
}