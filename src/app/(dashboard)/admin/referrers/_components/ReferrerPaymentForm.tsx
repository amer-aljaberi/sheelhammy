"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Referrer } from "./ReferrerTable";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface ReferrerPaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referrer: Referrer | null;
  onSuccess: () => void;
}

export function ReferrerPaymentForm({
  open,
  onOpenChange,
  referrer,
  onSuccess,
}: ReferrerPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paymentType: "cash" as "cash" | "installments",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (open && referrer) {
      setFormData({
        amount: referrer.stats.remaining > 0 ? referrer.stats.remaining.toString() : "",
        paymentType: "cash",
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [open, referrer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referrer) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/referrers/${referrer.id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(formData.amount),
          paymentType: formData.paymentType,
          paymentDate: formData.paymentDate,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ");
      }

      toast.success("تم تسجيل الدفعة بنجاح");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsLoading(false);
    }
  };

  if (!referrer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>دفع للمندوب: {referrer.name}</DialogTitle>
          <DialogDescription>
            المتبقي: {formatCurrency(referrer.stats.remaining)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>المبلغ</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0"
              min={0}
              max={referrer.stats.remaining}
              required
            />
          </div>
          <div>
            <Label>نوع الدفع</Label>
            <Select
              value={formData.paymentType}
              onValueChange={(value) =>
                setFormData({ ...formData, paymentType: value as "cash" | "installments" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">كاش</SelectItem>
                <SelectItem value="installments">أقساط</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>تاريخ الدفع</Label>
            <Input
              type="date"
              value={formData.paymentDate}
              onChange={(e) =>
                setFormData({ ...formData, paymentDate: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label>ملاحظات</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="ملاحظات إضافية"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
