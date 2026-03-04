"use client";

import React, { useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Transfer } from "./TransferTable";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface TransferDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transfer | null;
  onSuccess: () => void;
}

export function TransferDeleteDialog({
  open,
  onOpenChange,
  transfer,
  onSuccess,
}: TransferDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!transfer) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/transfers/${transfer.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ");
      }

      toast.success("تم حذف التحويل بنجاح");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حذف التحويل");
    } finally {
      setIsLoading(false);
    }
  };

  if (!transfer) return null;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="حذف التحويل"
      description={
        <div className="space-y-2">
          <p>هل أنت متأكد من حذف هذا التحويل؟</p>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>
              <span className="font-medium">الموظف:</span> {transfer.employeeName}
            </p>
            <p>
              <span className="font-medium">المبلغ:</span> {formatCurrency(transfer.amount)}
            </p>
            {transfer.orderNumber && (
              <p>
                <span className="font-medium">الطلب:</span> {transfer.orderNumber}
              </p>
            )}
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium mt-2">
            لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>
      }
      confirmLabel="حذف"
      onConfirm={handleDelete}
      variant="destructive"
      isLoading={isLoading}
    />
  );
}
