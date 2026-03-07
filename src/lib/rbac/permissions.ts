export interface PagePermission {
  path: string;
  label: string;
  category?: string;
}

export const ADMIN_PAGES: PagePermission[] = [
  { path: "/admin", label: "لوحة التحكم", category: "عام" },
  { path: "/admin/orders", label: "إدارة الطلبات", category: "إدارة" },
  { path: "/admin/employees", label: "الموظفين", category: "إدارة" },
  { path: "/admin/students", label: "الطلاب", category: "إدارة" },
  { path: "/admin/referrers", label: "المندوبين", category: "إدارة" },
  { path: "/admin/finance", label: "النظام المالي", category: "مالي" },
  { path: "/admin/content/services", label: "الخدمات", category: "المحتوى" },
  { path: "/admin/content/categories", label: "الفئات", category: "المحتوى" },
  { path: "/admin/content/portfolio", label: "النماذج", category: "المحتوى" },
  { path: "/admin/content/blog", label: "المقالات", category: "المحتوى" },
  { path: "/admin/content/faqs", label: "الأسئلة الشائعة", category: "المحتوى" },
  { path: "/admin/content/testimonials", label: "آراء العملاء", category: "المحتوى" },
  { path: "/admin/notifications", label: "الإشعارات", category: "عام" },
  { path: "/admin/settings", label: "الإعدادات", category: "عام" },
];

export function getPagesByCategory(): Record<string, PagePermission[]> {
  const grouped: Record<string, PagePermission[]> = {};
  ADMIN_PAGES.forEach((page) => {
    const category = page.category || "أخرى";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(page);
  });
  return grouped;
}
