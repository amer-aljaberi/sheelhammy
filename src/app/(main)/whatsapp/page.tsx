"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "962781858647";

export default function WhatsAppPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams?.get("ref");

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        let referrerCode = ref;
        
        // If ref is in URL, save it
        if (ref) {
          if (typeof window !== "undefined") {
            localStorage.setItem("referrerCode", ref);
          }
        } else {
          // Check localStorage
          if (typeof window !== "undefined") {
            referrerCode = localStorage.getItem("referrerCode");
          }
        }

        // Fetch referrer info
        if (referrerCode) {
          const response = await fetch(`/api/referrer/${referrerCode}`);
          if (response.ok) {
            const data = await response.json();
            const message = `مرحبا أريد خدمة أكاديمية كود المندوب ${data.referrerCode || referrerCode}`;
            const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            window.location.href = whatsappLink;
            return;
          }
        }

        // If no referrer, just open WhatsApp
        const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}`;
        window.location.href = whatsappLink;
      } catch (error) {
        console.error("Error redirecting to WhatsApp:", error);
        toast.error("حدث خطأ أثناء التوجيه إلى واتساب");
        router.push("/contact-us");
      }
    };

    handleRedirect();
  }, [ref, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">جاري التوجيه إلى واتساب...</p>
      </div>
    </div>
  );
}
