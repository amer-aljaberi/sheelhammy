"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// Role type
type Role = "ADMIN" | "EMPLOYEE";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User, 
  Menu,
  X,
  FileText,
  Calendar, 
  DollarSign,
  CalendarDays,
  Bell,
  Home,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface DashboardSidebarProps {
  role: Role;
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const employeeNavItems: NavItem[] = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "طلباتي", icon: FileText },
  { href: "/dashboard/calendar", label: "التقويم", icon: CalendarDays },
  { href: "/dashboard/deadlines", label: "المواعيد", icon: Calendar },
  { href: "/dashboard/earnings", label: "الأرباح", icon: DollarSign },
  { href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
  { href: "/dashboard/profile", label: "ملفي", icon: User },
];

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isReferrer, setIsReferrer] = useState(false);
  
  // Check if user is a referrer
  useEffect(() => {
    if (role === "EMPLOYEE") {
      fetch("/api/referrer/dashboard/stats")
        .then((res) => {
          if (res.ok) {
            setIsReferrer(true);
          }
        })
        .catch(() => {
          setIsReferrer(false);
        });
    }
  }, [role]);

  const navItems = [
    ...employeeNavItems,
    ...(isReferrer
      ? [{ href: "/referrer", label: "لوحة تحكم المندوب", icon: Award, exact: true }]
      : []),
  ];

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
              لوحة التحكم
            </h2>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Fix active state: exact match for dashboard home, or starts with for others
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <Link
                href="/"
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
