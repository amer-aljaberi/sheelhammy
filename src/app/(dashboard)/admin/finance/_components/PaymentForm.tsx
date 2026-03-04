"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { toast } from "sonner";
import { PAYMENT_TYPES } from "@/lib/countries";

type Order = {
  id: string;
  orderNumber: string;
  studentName: string;
  totalPrice: number;
  isPaid: boolean;
  paymentType?: string;
  paymentInstallments?: number[];
  discount?: number;
  paidAmount?: number; // المبلغ المدفوع حتى الآن
};

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  onSuccess: () => void;
}

export function PaymentForm({
  open,
  onOpenChange,
  orders,
  onSuccess,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPaidAmount, setCurrentPaidAmount] = useState<number>(0); // تتبع المبلغ المدفوع الحالي
  const lastOrderIdRef = useRef<string>(""); // تتبع آخر orderId الذي تم تحديث currentPaidAmount له
  const [formData, setFormData] = useState({
    orderId: "",
    amount: "",
    paymentType: "cash",
    paidBy: "",
    paidDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (open && !formData.orderId) {
      // إعادة تعيين فقط عند فتح النافذة لأول مرة (بدون orderId محدد)
      setFormData({
        orderId: "",
        amount: "",
        paymentType: "cash",
        paidBy: "",
        paidDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setSelectedOrder(null);
      setCurrentPaidAmount(0);
      lastOrderIdRef.current = "";
    }
  }, [open]); // إزالة orders من dependency

  useEffect(() => {
    if (formData.orderId) {
      const order = orders.find((o) => o.id === formData.orderId);
      if (order) {
        setSelectedOrder(order);
        // إذا تغير orderId، نعيد تعيين currentPaidAmount من order
        if (lastOrderIdRef.current !== formData.orderId) {
          setCurrentPaidAmount(order.paidAmount || 0);
          lastOrderIdRef.current = formData.orderId;
        }
        
        // استخدام currentPaidAmount المحدث أو paidAmount من order
        const paid = currentPaidAmount > 0 ? currentPaidAmount : (order.paidAmount || 0);
        const total = order.totalPrice - (order.discount || 0);
        const remaining = total - paid;
        setFormData((prev) => ({
          ...prev,
          amount: remaining > 0 ? remaining.toString() : "0",
          paymentType: order.paymentType || "cash",
        }));
      } else {
        setSelectedOrder(null);
        setCurrentPaidAmount(0);
        lastOrderIdRef.current = "";
      }
    } else {
      setSelectedOrder(null);
      setCurrentPaidAmount(0);
      lastOrderIdRef.current = "";
    }
  }, [formData.orderId, orders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId || !formData.amount) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    setIsLoading(true);
    try {
      // إنشاء سجل دفع جديد
      const response = await fetch("/api/admin/finance/payment-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: formData.orderId,
          amount: amount,
          paymentType: formData.paymentType,
          paidBy: formData.paidBy || null,
          paymentDate: formData.paidDate,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ");
      }

      // تحديث المبلغ المدفوع محلياً
      const order = orders.find((o) => o.id === formData.orderId);
      if (order) {
        const currentPaid = currentPaidAmount > 0 ? currentPaidAmount : (order.paidAmount || 0);
        const newPaid = currentPaid + amount;
        setCurrentPaidAmount(newPaid);
        
        // تحديث selectedOrder محلياً
        const total = order.totalPrice - (order.discount || 0);
        setSelectedOrder({
          ...order,
          paidAmount: newPaid,
          isPaid: newPaid >= total,
        });
        
        // تحديث المبلغ المتبقي في النموذج
        const remaining = total - newPaid;
        setFormData((prev) => ({
          ...prev,
          amount: remaining > 0 ? remaining.toString() : "0",
        }));
        
        // تحديث حالة الطلب إذا كان الدفع كامل
        if (newPaid >= total) {
          await fetch(`/api/admin/orders/${formData.orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              isPaid: true,
            }),
          });
        }
      }

      toast.success("تم تسجيل الدفع بنجاح");
      onSuccess(); // هذا سيحدث orders array في الصفحة الأم
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تسجيل الدفع");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>تسجيل دفع</DialogTitle>
          <DialogDescription>تسجيل دفع طلب من الطالب</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label>رقم الطلب</Label>
              <Select
                value={formData.orderId}
                onValueChange={(value) =>
                  setFormData({ ...formData, orderId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الطلب" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => {
                    const total = order.totalPrice - (order.discount || 0);
                    const paid = order.paidAmount || 0;
                    const remaining = total - paid;
                    return (
                      <SelectItem key={order.id} value={order.id}>
                        {order.orderNumber} - {order.studentName} (المجموع: {total.toFixed(2)} د.أ، المتبقي: {remaining.toFixed(2)} د.أ)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {selectedOrder && (() => {
              const total = selectedOrder.totalPrice - (selectedOrder.discount || 0);
              const paid = currentPaidAmount > 0 ? currentPaidAmount : (selectedOrder.paidAmount || 0);
              const remaining = total - paid;
              
              return (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">المجموع:</span>
                      <span className="font-semibold mr-2">
                        {total.toFixed(2)} د.أ
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">المدفوع:</span>
                      <span className="font-semibold mr-2 text-green-600">
                        {paid.toFixed(2)} د.أ
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">المتبقي:</span>
                      <span className="font-semibold mr-2 text-red-600">
                        {remaining.toFixed(2)} د.أ
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
            <div>
              <Label>المبلغ المدفوع</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                required
                step="0.01"
              />
            </div>
            <div>
              <Label>نوع الدفع</Label>
              <Select
                value={formData.paymentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, paymentType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>من دفع (اختياري)</Label>
              <Input
                value={formData.paidBy}
                onChange={(e) =>
                  setFormData({ ...formData, paidBy: e.target.value })
                }
                placeholder="اسم من دفع"
              />
            </div>
            <div>
              <Label>تاريخ الدفع</Label>
              <Input
                type="date"
                value={formData.paidDate}
                onChange={(e) =>
                  setFormData({ ...formData, paidDate: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>ملاحظات (اختياري)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="ملاحظات إضافية..."
                rows={2}
              />
            </div>
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
              {isLoading ? "جاري التسجيل..." : "تسجيل"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
