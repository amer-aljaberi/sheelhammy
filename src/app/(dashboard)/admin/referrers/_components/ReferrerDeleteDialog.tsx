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
 
  const hasOrders = referrer.stats.totalOrders > 0;
  // Allow deletion even if there are referrals - they will remain with null referrerId
  const cannotDelete = hasOrders;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="حذف المندوب"
      description={
        <>
          <span className="block mb-2">هل أنت متأكد من حذف المندوب {referrer.name}؟</span>
          {cannotDelete && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                لا يمكن حذف هذا المندوب لأنه يحتوي على:
              </p>
              <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 space-y-1">
                {hasOrders && (
                  <li>{referrer.stats.totalOrders} طلب مرتبط</li>
                )}
              </ul>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                يجب حذف أو نقل جميع السجلات المرتبطة أولاً
              </p>
            </div>
          )}
          {referrer.stats.pendingReferrals > 0 && !cannotDelete && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                ملاحظة: سيتم حذف المندوب ولكن الإحالات ({referrer.stats.pendingReferrals} إحالة) ستبقى كما هي.
              </p>
            </div>
          )}
        </>
      }
      confirmLabel="حذف"
      cancelLabel="إلغاء"
      onConfirm={onConfirm}
      variant="destructive"
      disabled={cannotDelete}
    />
  );
}
