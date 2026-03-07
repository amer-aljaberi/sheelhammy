# Database Scripts

سكربتات TypeScript لإدارة قاعدة البيانات باستخدام Prisma

## المتطلبات

- Node.js 18+
- Prisma CLI
- MySQL Client Tools (اختياري - للنسخ الاحتياطي السريع)

## السكربتات

### 1. Backup Script (`backup.ts`)

إنشاء نسخة احتياطية من قاعدة البيانات.

**الاستخدام:**
```bash
# نسخة احتياطية بتاريخ ووقت تلقائي
npm run db:backup

# أو مباشرة
npx tsx prisma/backup.ts

# نسخة احتياطية باسم مخصص
npx tsx prisma/backup.ts backup-before-migration
```

**المخرجات:**
- يتم حفظ النسخة الاحتياطية في مجلد `backups/`
- إذا كان `mysqldump` متاحاً: يتم حفظها كملف `.sql`
- إذا لم يكن متاحاً: يتم حفظها كملف `.json` باستخدام Prisma Client

### 2. Restore Script (`restore.ts`)

استعادة قاعدة البيانات من نسخة احتياطية.

**الاستخدام:**
```bash
# مع npm (استخدم -- لتمرير المعاملات)
npm run db:restore -- backups/backup-2024-01-15_10-30-00.sql

# أو مباشرة
npx tsx prisma/restore.ts backups/backup-2024-01-15_10-30-00.sql
```

**تحذير:**
- سيتم حذف قاعدة البيانات الحالية وإعادة إنشائها
- سيتم تطبيق جميع migrations بعد الاستعادة
- يطلب تأكيد قبل التنفيذ

### 3. Reset Script (`reset.ts`)

إعادة تعيين قاعدة البيانات باستخدام Prisma migrate reset.

**الاستخدام:**
```bash
# إعادة تعيين مع seed
npm run db:reset

# أو مباشرة
npx tsx prisma/reset.ts

# إعادة تعيين بدون seed
npx tsx prisma/reset.ts --skip-seed
```

**تحذير:**
- سيتم حذف جميع البيانات
- سيتم إعادة إنشاء قاعدة البيانات من الصفر

## أمثلة

### إنشاء نسخة احتياطية قبل التحديث
```bash
npm run db:backup backup-before-update
```

### استعادة نسخة احتياطية
```bash
npm run db:restore backups/backup-2024-01-15_10-30-00.sql
```

### إعادة تعيين قاعدة البيانات
```bash
npm run db:reset
```

## ملاحظات

- تأكد من وجود `DATABASE_URL` في ملف `.env`
- النسخ الاحتياطية محفوظة في مجلد `backups/`
- استخدم النسخ الاحتياطية بانتظام قبل التحديثات الكبيرة
- النسخ الاحتياطية JSON أبطأ لكنها تعمل بدون MySQL Client Tools
- النسخ الاحتياطية SQL أسرع وتتطلب MySQL Client Tools
