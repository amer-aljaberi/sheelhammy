"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, FileText, Eye, Trash2, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter as useNextRouter } from "next/navigation";

export type Order = {
  id: string;
  orderNumber: string;
  studentName: string;
  studentId?: string; // إضافة studentId للوصول إلى صفحة الطالب
  service: string;
  employeeName: string;
  referrerName?: string | null;
  referrerCode?: string | null;
  referrerCommission?: number | null;
  status: string;
  totalPrice: number;
  employeeProfit: number;
  isPaid: boolean;
  deadline: string | null;
  createdAt: string;
  employeeId?: string | null;
};

interface OrderTableProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onRequestRevision: (order: Order) => void;
  onMarkCompleted: (orderId: string) => void;
  onView: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

export function getOrderColumns(
  onEdit: (order: Order) => void,
  onRequestRevision: (order: Order) => void,
  onMarkCompleted: (orderId: string) => void,
  onView: (order: Order) => void,
  onDelete: (orderId: string) => void,
  router?: ReturnType<typeof useNextRouter>
): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: "رقم الطلب",
    },
    {
      accessorKey: "studentName",
      header: "الطالب",
      cell: ({ row }) => {
        const order = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <span>{order.studentName}</span>
            {order.studentId && router && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/students/${order.studentId}/orders`);
                }}
                title="عرض جميع طلبات الطالب"
                className="h-6 w-6 p-0"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      },
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
      accessorKey: "referrerName",
      header: "المندوب",
      cell: ({ row }) => {
        const order = row.original;
        if (!order.referrerName) return "-";
        return (
          <div className="space-y-1">
            <span className="font-medium">{order.referrerName}</span>
            {order.referrerCode && (
              <div className="text-xs text-gray-500">{order.referrerCode}</div>
            )}
            {order.referrerCommission && (
              <div className="text-xs text-blue-600">
                عمولة: {order.referrerCommission.toFixed(2)} د.أ
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "totalPrice",
      header: "السعر",
      cell: ({ row }) => formatCurrency(row.original.totalPrice),
    },
    {
      accessorKey: "isPaid",
      header: "الدفع",
      cell: ({ row }) => (
        <StatusBadge status={row.original.isPaid ? "PAID" : "PENDING"} />
      ),
    },
    {
      accessorKey: "deadline",
      header: "موعد التسليم",
      cell: ({ row }) =>
        row.original.deadline ? formatDate(row.original.deadline) : "-",
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(order)}
              title="عرض التفاصيل"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(order)}
              title="تعديل"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {order.status === "DELIVERED" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestRevision(order)}
                >
                  <FileText className="h-4 w-4" />
                  طلب تعديل
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onMarkCompleted(order.id)}
                >
                  إكمال
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(order.id)}
              title="حذف"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
