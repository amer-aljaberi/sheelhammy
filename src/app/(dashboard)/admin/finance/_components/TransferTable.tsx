"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Receipt, Edit, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export type Transfer = {
  id: string;
  employeeId: string;
  employeeName: string;
  orderId?: string | null;
  orderNumber?: string | null;
  service?: string | null;
  amount: number;
  status: string;
  receiptImage: string | null;
  description?: string | null;
  totalProfit?: number;
  totalTransferred?: number;
  remainingProfit?: number;
  createdAt: string;
};

export function getTransferColumns(
  onViewReceipt: (transfer: Transfer) => void,
  onEdit: (transfer: Transfer) => void,
  onDelete: (transfer: Transfer) => void
): ColumnDef<Transfer>[] {
  return [
    {
      accessorKey: "employeeName",
      header: "الموظف",
    },
    {
      accessorKey: "orderNumber",
      header: "الطلب",
      cell: ({ row }) => {
        const transfer = row.original;
        if (transfer.orderNumber) {
          return (
            <div>
              <div className="font-medium">{transfer.orderNumber}</div>
              {transfer.service && (
                <div className="text-xs text-gray-500">{transfer.service}</div>
              )}
            </div>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      accessorKey: "amount",
      header: "المبلغ المحول",
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      id: "profit",
      header: "إجمالي الربح",
      cell: ({ row }) => {
        const transfer = row.original;
        return transfer.totalProfit !== undefined ? (
          <span className="text-blue-600">{formatCurrency(transfer.totalProfit)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      id: "transferred",
      header: "المحول",
      cell: ({ row }) => {
        const transfer = row.original;
        return transfer.totalTransferred !== undefined ? (
          <span className="text-green-600">{formatCurrency(transfer.totalTransferred)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      id: "remaining",
      header: "المتبقي",
      cell: ({ row }) => {
        const transfer = row.original;
        return transfer.remainingProfit !== undefined ? (
          <span className="text-red-600 font-semibold">
            {formatCurrency(transfer.remainingProfit)}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => (
        <StatusBadge
          status={
            row.original.status === "COMPLETED" ? "COMPLETED" : "PENDING"
          }
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "التاريخ",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "receipt",
      header: "إثبات التحويل",
      cell: ({ row }) => {
        const transfer = row.original;
        return transfer.receiptImage ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewReceipt(transfer)}
          >
            <Receipt className="h-4 w-4 ml-1" />
            عرض
          </Button>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(transfer)}
              title="تعديل"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(transfer)}
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
