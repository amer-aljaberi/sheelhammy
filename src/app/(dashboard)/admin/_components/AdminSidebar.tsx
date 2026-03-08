"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Role } from "@prisma/client";
import { ADMIN_PAGES } from "@/lib/rbac/permissions";

import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  CreditCard,
  Star,
  Settings,
  Menu,
  X,
  UserCheck,
  Ticket,
  FileText,
  BarChart3,
  Tag,
  MessageSquare,
  Home,
  Book,
  UserCog,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/admin": LayoutDashboard,
  "/admin/orders": ShoppingCart,
  "/admin/employees": UserCheck,
  "/admin/students": Users,
  "/admin/referrers": UserCog,
  "/admin/content/categories": Tag,
  "/admin/content/services": Package,
  "/admin/content/testimonials": Star,
  "/admin/content/portfolio": FileText,
  "/admin/content/faqs": MessageSquare,
  "/admin/finance": DollarSign,
  "/admin/content/blog": Book,
  "/admin/notifications": Ticket,
  "/admin/settings": Settings,
};

interface AdminSidebarProps {
  userPermissions?: string[] | null;
  userRole: Role;
}

export function AdminSidebar({ userPermissions, userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
 
  const getVisibleNavItems = (): NavItem[] => {
    if (userRole === "ADMIN") { 
      return ADMIN_PAGES.map((page) => ({
        href: page.path,
        label: page.label,
        icon: iconMap[page.path] || LayoutDashboard,
        exact: page.path === "/admin",
      }));
    }

     if (userRole === "EMPLOYEE" && userPermissions && userPermissions.length > 0) {
      return ADMIN_PAGES.filter((page) => {
        return userPermissions.some((perm) => {
        
          if (perm === page.path) return true;
           if (page.path.startsWith(perm + "/")) return true;
          return false;
        });
      }).map((page) => ({
        href: page.path,
        label: page.label,
        icon: iconMap[page.path] || LayoutDashboard,
        exact: page.path === "/admin",
      }));
    }

    return [];
  };

  const visibleNavItems = getVisibleNavItems();

  return (
    <> 
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
 
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-700 px-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              لوحة الإدارة
            </h2>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {visibleNavItems.length > 0 ? (
              visibleNavItems.map((item) => {
                const Icon = item.icon; 
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-1.5 text-md font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">
                لا توجد صفحات متاحة
              </div>
            )}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <Link
                href="/"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-md font-medium transition-colors",
                  "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Home className="h-5 w-5" />
                العودة للموقع
              </Link>
            </div>
          </nav>
        </div>
      </aside>
 
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
