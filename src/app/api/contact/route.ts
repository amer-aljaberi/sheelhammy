import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWhatsAppLink } from "@/lib/countries";

// Ensure this route runs in Node.js runtime (not Edge)
export const runtime = "nodejs";

// POST - Save contact request and notify referrer
export async function POST(request: NextRequest) {
  try {
    // Ensure we return JSON even on errors
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "طلب غير صحيح - يرجى التحقق من البيانات المرسلة" },
        { status: 400 }
      );
    }
    const {
      name,
      email,
      phone,
      service,
      message,
      academicLevel,
      subject,
      university,
      deadline,
      pagesOrWords,
      language,
      urgency,
      filesLink,
      referrerCode,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "الاسم والهاتف مطلوبان" },
        { status: 400 }
      );
    }

    // Find referrer if code provided
    let referrer = null;
    if (referrerCode) {
      referrer = await prisma.referrer.findFirst({
        where: {
          code: referrerCode.toUpperCase(),
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          phoneCountryCode: true,
          code: true,
        },
      });

      // Save referral if referrer found
      if (referrer) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            name,
            email: email || null,
            phone,
            service: service || "other",
            message: message || "",
            academicLevel: academicLevel || null,
            subject: subject || null,
            university: university || null,
            deadline: deadline ? new Date(deadline) : null,
            pagesOrWords: pagesOrWords || null,
            language: language || null,
            urgency: urgency || null,
            filesLink: filesLink || null,
            status: "PENDING",
          },
        });
      }
    }

    // Prepare WhatsApp message for referrer
    if (referrer && referrer.phone) {
      const referrerMessage = `🎯 *طلب جديد من مندوبك*\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 *معلومات الطالب*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `الاسم: ${name}\n` +
        `${email ? `البريد: ${email}\n` : ''}` +
        `الهاتف: ${phone}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📋 *تفاصيل الطلب*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `${service ? `نوع الخدمة: ${service}\n` : ''}` +
        `${academicLevel ? `المرحلة: ${academicLevel}\n` : ''}` +
        `${university ? `الجامعة: ${university}\n` : ''}` +
        `${subject ? `المادة: ${subject}\n` : ''}` +
        `${deadline ? `موعد التسليم: ${deadline}\n` : ''}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💬 *الرسالة*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `${message || 'لا توجد رسالة'}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `✅ تم إرسال الطلب عبر رابطك الخاص`;

      const referrerPhone = referrer.phoneCountryCode 
        ? `${referrer.phoneCountryCode.replace('+', '')}${referrer.phone.replace(/\D/g, '')}`
        : referrer.phone.replace(/\D/g, '');
      
      const referrerWhatsAppLink = `https://wa.me/${referrerPhone}?text=${encodeURIComponent(referrerMessage)}`;
      
      // Return the WhatsApp link for the referrer (you can also send it server-side if needed)
      return NextResponse.json({
        success: true,
        referrer: {
          name: referrer.name,
          whatsappLink: referrerWhatsAppLink,
        },
        referrerCode: referrer.code, // Return referrer code for saving
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing contact request:", error);
    return NextResponse.json(
      { error: error.message || "فشل في معالجة الطلب" },
      { status: 500 }
    );
  }
}
