"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/utils";
import {
  Briefcase,
  DollarSign,
  Bell,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/common/Skeletons";

type DashboardStats = {
  inProgressOrders: number;
  pendingEarnings: number;
  totalEarnings: number;
  completedOrders: number;
  referrerStats: {
    referrerId: string;
    referrerCode: string;
    totalReferrers: number;
    totalReferrerOrders: number;
    totalReferrerEarnings: number;
    totalReferrerPaid: number;
    remainingReferrerEarnings: number;
    activeReferrerOrders: number;
    commissionRate: number | null;
  } | null;
};

type Notification = {
  id: string;
  message: string;
  type: "assignment" | "revision" | "transfer" | "info";
  isRead: boolean;
  createdAt: string;
  orderNumber: string | null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch stats and notifications in parallel
        const [statsResponse, notificationsResponse] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/notifications?limit=5"),
        ]);

        if (!statsResponse.ok) {
          const error = await statsResponse.json();
          throw new Error(error.error || "Failed to fetch stats");
        }

        if (!notificationsResponse.ok) {
          const error = await notificationsResponse.json();
          throw new Error(error.error || "Failed to fetch notifications");
        }

        const statsData = await statsResponse.json();
        const notificationsData = await notificationsResponse.json();

        setStats(statsData);
        setNotifications(notificationsData);
      } catch (error: any) {
        toast.error(error.message || "حدث خطأ أثناء تحميل البيانات");
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader
          title="الرئيسية"
          description="ملخص سريع لحالتك الحالية"
        />
        <TableSkeleton rows={3} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader
          title="الرئيسية"
          description="ملخص سريع لحالتك الحالية"
        />
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">فشل تحميل البيانات</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="الرئيسية"
        description="ملخص سريع لحالتك الحالية"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="المهام قيد التنفيذ"
          value={stats.inProgressOrders}
          icon={Briefcase}
          variant="primary"
        />
        <StatCard
          title="الأرباح المستحقة"
          value={formatCurrency(stats.pendingEarnings)}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="إجمالي الأرباح"
          value={formatCurrency(stats.totalEarnings)}
          icon={DollarSign}
          variant="info"
        />
      </div>

      {/* Referrer Stats Section */}
      {stats.referrerStats && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              إحصائيات الإحالة
              <Badge variant="outline" className="mr-2">
                {stats.referrerStats.referrerCode}
              </Badge>
            </CardTitle>
            <CardDescription>
              ملخص أداءك كمندوب وإحصائيات الإحالات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    إجمالي الطلبات
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.referrerStats.totalReferrerOrders}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-800">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    إجمالي الأرباح
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(stats.referrerStats.totalReferrerEarnings)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-800">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    المدفوع
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(stats.referrerStats.totalReferrerPaid)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-800">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    المتبقي
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(stats.referrerStats.remainingReferrerEarnings)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    نسبة العمولة
                  </p>
                  <p className="text-xl font-bold">
                    {stats.referrerStats.commissionRate
                      ? `${stats.referrerStats.commissionRate}%`
                      : "غير محدد"}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    الطلبات النشطة
                  </p>
                  <p className="text-xl font-bold">
                    {stats.referrerStats.activeReferrerOrders}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    كود المندوب
                  </p>
                  <p className="text-xl font-bold font-mono">
                    {stats.referrerStats.referrerCode}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            آخر الإشعارات
          </CardTitle>
          <CardDescription>
            الإشعارات والتنبيهات المهمة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد إشعارات</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border ${
                    !notification.isRead
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : "bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="mt-1">
                    {notification.type === "assignment" && (
                      <Briefcase className="h-5 w-5 text-blue-500" />
                    )}
                    {notification.type === "revision" && (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                    {notification.type === "transfer" && (
                      <DollarSign className="h-5 w-5 text-green-500" />
                    )}
                    {notification.type === "info" && (
                      <Bell className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString("ar-JO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Badge variant="default" className="bg-blue-500">
                      جديد
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link href="/dashboard/notifications">
              <Button variant="outline" className="w-full">
                عرض جميع الإشعارات
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/orders?status=IN_PROGRESS">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="ml-2 h-4 w-4" />
                عرض المهام قيد التنفيذ
              </Button>
            </Link>
            <Link href="/dashboard/deadlines">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="ml-2 h-4 w-4" />
                المواعيد القادمة
              </Button>
            </Link>
            <Link href="/dashboard/earnings">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="ml-2 h-4 w-4" />
                الأرباح والتحويلات
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ملخص الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  الطلبات المكتملة
                </span>
                <span className="font-semibold">{stats.completedOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  المهام قيد التنفيذ
                </span>
                <span className="font-semibold">{stats.inProgressOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  الأرباح المستحقة
                </span>
                <span className="font-semibold">{formatCurrency(stats.pendingEarnings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
