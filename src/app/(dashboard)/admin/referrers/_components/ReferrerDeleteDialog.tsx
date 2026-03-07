"use client";

import React from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Referrer } from "./ReferrerTable";

interface ReferrerDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referrer: Referrer | null;
  onConfirm: () => void;
}

export function ReferrerDeleteDialog({
  open,
  onOpenChange,
  referrer,
  onConfirm,
}: ReferrerDeleteDialogProps) {
  if (!referrer) return null;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="حذف المندوب"
      description={
        <>
          <span className="block mb-2">هل أنت متأكد من حذف المندوب {referrer.name}؟</span>
          {referrer.stats.totalOrders > 0 && (
            <span className="block text-sm text-red-600">
              تحذير: هذا المندوب لديه {referrer.stats.totalOrders} طلب. لا يمكن حذفه.
            </span>
          )}
        </>
      }
      confirmLabel="حذف"
      cancelLabel="إلغاء"
      onConfirm={onConfirm}
      variant="destructive"
      disabled={referrer.stats.totalOrders > 0}
    />
  );
}
