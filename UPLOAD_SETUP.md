# إعداد رفع الملفات - شيل همي

## المشكلة
في بيئات serverless مثل Vercel، لا يمكن إنشاء مجلدات في runtime. لذلك يجب استخدام Vercel Blob Storage بدلاً من نظام الملفات المحلي.

## الحل
تم تحديث `src/app/api/upload/route.ts` لاستخدام Vercel Blob Storage تلقائياً في بيئة الإنتاج.

## الإعداد المطلوب

### 1. إضافة متغير البيئة في Vercel

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Settings** → **Environment Variables**
4. أضف متغير البيئة التالي:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. الحصول على Token

#### الطريقة الأولى: من Vercel Dashboard
1. اذهب إلى [Vercel Storage](https://vercel.com/storage)
2. أنشئ Blob Store جديد أو استخدم الموجود
3. انسخ الـ Token من الإعدادات

#### الطريقة الثانية: من Vercel CLI
```bash
vercel blob create
```

### 3. إضافة Token إلى Environment Variables

في Vercel Dashboard:
- **Name**: `BLOB_READ_WRITE_TOKEN`
- **Value**: `vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Environment**: Production, Preview, Development (أو حسب الحاجة)

## كيفية العمل

### في بيئة الإنتاج (Vercel)
- ✅ يستخدم Vercel Blob Storage تلقائياً
- ✅ الملفات تُحفظ في Blob Store
- ✅ روابط عامة (public URLs) تُرجع مباشرة

### في بيئة التطوير المحلية
- ✅ يستخدم نظام الملفات المحلي (`public/uploads`)
- ✅ يعمل بشكل طبيعي بدون إعدادات إضافية

## التحقق من الإعداد

بعد إضافة `BLOB_READ_WRITE_TOKEN`:
1. قم بإعادة نشر المشروع على Vercel
2. جرب رفع ملف من الواجهة
3. يجب أن يعمل بدون أخطاء

## استكشاف الأخطاء

### خطأ: "Failed to upload file"
- ✅ تأكد من إضافة `BLOB_READ_WRITE_TOKEN` في Vercel
- ✅ تأكد من إعادة نشر المشروع بعد إضافة المتغير

### خطأ: "BLOB_READ_WRITE_TOKEN is not set"
- ✅ تأكد من كتابة اسم المتغير بشكل صحيح
- ✅ تأكد من إضافة المتغير لجميع البيئات المطلوبة

## ملاحظات

- الملفات المرفوعة في Blob Storage تكون عامة (public) افتراضياً
- يمكن الوصول إليها عبر URL مباشر
- لا حاجة لإعدادات إضافية في Next.js

---

تم إصلاح المشكلة! 🎉
