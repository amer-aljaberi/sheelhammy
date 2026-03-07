"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/common/Skeletons";
import { DataTable } from "@/components/common/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

type ReferrerStats = {
  referrer: {
    id: string;
    name: string;
    code: string;
    commissionRate: number | null;
    isActive: boolean;
  };
  stats: {
    totalOrders: number;
    completedOrders: number;
    activeOrders: number;
    uniqueStudents: number;
    totalEarnings: number;
    totalPaid: number;
    remainingEarnings: number;
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    cancelledReferrals: number;
  };
};

type Order = {
  id: string;
  orderNumber: string;
  studentName: string;
  studentId: string;
  service: string;
  employeeName: string;
  status: string;
  totalPrice: number;
  referrerCommission: number;
  deadline: string | null;
  createdAt: string;
};

export default function ReferrerDashboardPage() {
  const [stats, setStats] = useState<ReferrerStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsResponse, ordersResponse] = await Promise.all([
          fetch("/api/referrer/dashboard/stats"),
          fetch("/api/referrer/dashboard/orders?limit=10"),
        ]);

        if (!statsResponse.ok) {
          const error = await statsResponse.json();
          throw new Error(error.error || "Failed to fetch stats");
        }

        if (!ordersResponse.ok) {
          const error = await ordersResponse.json();
          throw new Error(error.error || "Failed to fetch orders");
        }

        const statsData = await statsResponse.json();
        const ordersData = await ordersResponse.json();

        setStats(statsData);
        setOrders(ordersData.orders || []);
      } catch (error: any) {
        if (error.message.includes("404") || error.message.includes("not found")) {
          toast.error("لم يتم العثور على حساب مندوب نشط");
        } else {
          toast.error(error.message || "حدث خطأ أثناء تحميل البيانات");
        }
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchOrders = async (status?: string) => {
    setIsLoadingOrders(true);
    try {
      const url = status
        ? `/api/referrer/dashboard/orders?status=${status}&limit=50`
        : `/api/referrer/dashboard/orders?limit=50`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحميل الطلبات");
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const orderColumns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "رقم الطلب",
    },
    {
      accessorKey: "studentName",
      header: "الطالب",
    },
    {
      accessorKey: "service",
      header: "الخدمة",
    },
    {
      accessorKey: "employeeName",
      header: "الموظف",
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        return <StatusBadge status={row.original.status} />;
      },
    },
    {
      accessorKey: "referrerCommission",
      header: "العمولة",
      cell: ({ row }) => {
        return formatCurrency(row.original.referrerCommission);
      },
    },
    {
      accessorKey: "totalPrice",
      header: "إجمالي السعر",
      cell: ({ row }) => {
        return formatCurrency(row.original.totalPrice);
      },
    },
    {
      accessorKey: "deadline",
      header: "الموعد النهائي",
      cell: ({ row }) => {
        const deadline = row.original.deadline;
        return deadline ? formatDate(deadline) : "-";
      },
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الإنشاء",
      cell: ({ row }) => {
        return formatDate(row.original.createdAt);
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader
          title="لوحة تحكم المندوب"
          description="ملخص أداءك وإحصائيات الإحالات"
        />
        <TableSkeleton rows={3} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader
          title="لوحة تحكم المندوب"
          description="ملخص أداءك وإحصائيات الإحالات"
        />
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              لم يتم العثور على حساب مندوب نشط. يرجى التواصل مع الإدارة.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="لوحة تحكم المندوب"
        description={`مرحباً ${stats.referrer.name} - كود المندوب: ${stats.referrer.code}`}
      />

      {/* Referrer Info Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-500" />
            معلومات المندوب
            <Badge variant="outline" className="mr-2">
              {stats.referrer.code}
            </Badge>
            {stats.referrer.isActive ? (
              <Badge variant="default" className="bg-green-500">
                نشط
              </Badge>
            ) : (
              <Badge variant="destructive">موقوف</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {stats.referrer.commissionRate
              ? `نسبة العمولة: ${stats.referrer.commissionRate}%`
              : "نسبة العمولة غير محددة"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الطلبات"
          value={stats.stats.totalOrders}
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="الطلاب الفريدين"
          value={stats.stats.uniqueStudents}
          icon={Users}
          variant="info"
        />
        <StatCard
          title="إجمالي الأرباح"
          value={formatCurrency(stats.stats.totalEarnings)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="المتبقي"
          value={formatCurrency(stats.stats.remainingEarnings)}
          icon={DollarSign}
          variant="warning"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              إحصائيات الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  الطلبات المكتملة
                </span>
                <span className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {stats.stats.completedOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  الطلبات النشطة
                </span>
                <span className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  {stats.stats.activeOrders}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              إحصائيات المدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  إجمالي المدفوع
                </span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(stats.stats.totalPaid)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  المتبقي
                </span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(stats.stats.remainingEarnings)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            إحصائيات الإحالات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                إجمالي الإحالات
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.stats.totalReferrals}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                المكتملة
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.stats.completedReferrals}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                قيد الانتظار
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.stats.pendingReferrals}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                الملغاة
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.stats.cancelledReferrals}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                طلباتي
              </CardTitle>
              <CardDescription>
                جميع الطلبات المرتبطة بك كمندوب
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders()}
              >
                الكل
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders("IN_PROGRESS")}
              >
                قيد التنفيذ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders("COMPLETED")}
              >
                المكتملة
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
            <TableSkeleton rows={5} />
          ) : (
            <DataTable
              columns={orderColumns}
              data={orders}
              searchKey="orderNumber"
              searchPlaceholder="البحث برقم الطلب..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
