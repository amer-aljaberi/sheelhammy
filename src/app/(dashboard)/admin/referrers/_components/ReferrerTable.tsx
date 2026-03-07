"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, DollarSign, Copy, Users } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Icon } from "@iconify/react";

export type Referrer = {
  id: string;
  name: string;
  phone: string | null;
  phoneCountryCode: string | null;
  code: string;
  commissionRate: number | null;
  isActive: boolean;
  country: string | null;
  university: string | null;
  academicYear: string | null;
  grade: string | null;
  importantNotes: string | null;
  notes: string | null;
  stats: {
    totalOrders: number;
    totalEarnings: number;
    totalPaid: number;
    remaining: number;
    pendingReferrals: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

interface ReferrerTableProps {
  referrers: Referrer[];
  onEdit: (referrer: Referrer) => void;
  onDelete: (referrer: Referrer) => void;
  onPayment: (referrer: Referrer) => void;
}

export function getReferrerColumns(
  onEdit: (referrer: Referrer) => void,
  onDelete: (referrer: Referrer) => void,
  onPayment: (referrer: Referrer) => void,
  onReferrals: (referrer: Referrer) => void
): ColumnDef<Referrer>[] {
  return [
    {
      accessorKey: "name",
      header: "الاسم",
      filterFn: (row, id, value) => {
        const name = row.original.name?.toLowerCase() || "";
        const code = row.original.code?.toLowerCase() || "";
        const searchValue = (value as string)?.toLowerCase() || "";
        return name.includes(searchValue) || code.includes(searchValue);
      },
      cell: ({ row }) => {
        const referrer = row.original;
        return (
          <div>
            <p className="font-medium">{referrer.name}</p>
            {referrer.code && (
              <p className="text-sm text-gray-500">كود: {referrer.code}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "رقم الهاتف",
      cell: ({ row }) => {
        const referrer = row.original;
        if (!referrer.phone) return "-";
        const code = referrer.phoneCountryCode || "+962";
        return `${code} ${referrer.phone}`;
      },
    },
    {
      accessorKey: "code",
      header: "كود المندوب",
      cell: ({ row }) => {
        const referrer = row.original;
        return (
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
              {referrer.code}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                navigator.clipboard.writeText(referrer.code);
              }}
              title="نسخ الكود"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "commissionRate",
      header: "نسبة العمولة %",
      cell: ({ row }) => {
        const referrer = row.original;
        return referrer.commissionRate ? `${referrer.commissionRate}%` : "-";
      },
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => {
        const referrer = row.original;
        return (
          <StatusBadge
            status={referrer.isActive ? "ACTIVE" : "INACTIVE"}
          />
        );
      },
    },
    {
      accessorKey: "country",
      header: "الدولة",
      cell: ({ row }) => {
        const referrer = row.original;
        return referrer.country || "-";
      },
    },
    {
      accessorKey: "stats",
      header: "الإحصائيات",
      cell: ({ row }) => {
        const referrer = row.original;
        return (
          <div className="text-sm">
            <div>إجمالي: {formatCurrency(referrer.stats.totalEarnings)}</div>
            <div>مدفوع: {formatCurrency(referrer.stats.totalPaid)}</div>
            <div className="font-semibold">
              متبقي: {formatCurrency(referrer.stats.remaining)}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const referrer = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onReferrals(referrer)}
              title={`إحالات (${referrer.stats.pendingReferrals} قيد الانتظار)`}
              className="text-blue-600 hover:text-blue-700 relative"
            >
              <Users className="h-4 w-4" />
              {referrer.stats.pendingReferrals > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {referrer.stats.pendingReferrals}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(referrer)}
              title="تعديل"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPayment(referrer)}
              title="دفع"
              className="text-green-600 hover:text-green-700"
            >
              <DollarSign className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(referrer)}
              title="حذف"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
