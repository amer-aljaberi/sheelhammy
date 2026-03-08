"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Referrer } from "./ReferrerTable";
import { toast } from "sonner";
import { X, Check, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ReferrerPaymentForm } from "./ReferrerPaymentForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Referral = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  service: string;
  message: string;
  academicLevel: string | null;
  subject: string | null;
  university: string | null;
  deadline: Date | null;
  pagesOrWords: string | null;
  language: string | null;
  urgency: string | null;
  filesLink: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  order?: {
    id: string;
    orderNumber: string;
    totalPrice: number;
    referrerCommission: number | null;
    status: string;
  } | null;
};

interface ReferralsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referrer: Referrer | null;
  onSuccess: () => void;
}

export function ReferralsDialog({
  open,
  onOpenChange,
  referrer,
  onSuccess,
}: ReferralsDialogProps) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [orders, setOrders] = useState<Array<{ id: string; totalPrice: number; referrerCommission: number | null }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (open && referrer) {
      fetchReferrals();
      fetchOrders();
    }
  }, [open, referrer, filterStatus]);

  const fetchReferrals = async () => {
    if (!referrer) return;
    setIsLoading(true);
    try {
      const url = filterStatus
        ? `/api/admin/referrers/${referrer.id}/referrals?status=${filterStatus}`
        : `/api/admin/referrers/${referrer.id}/referrals`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch referrals");
      const data = await response.json();
      setReferrals(data);
    } catch (error: any) {
      toast.error(error.message || "فشل تحميل الإحالات");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!referrer) return;
    try {
      const response = await fetch(`/api/admin/orders?referrerId=${referrer.id}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data.map((order: any) => ({
        id: order.id,
        totalPrice: order.totalPrice,
        referrerCommission: order.referrerCommission,
      })));
    } catch (error: any) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleStatusChange = async (referralId: string, newStatus: string) => {
    if (!referrer) return;
    try {
      const response = await fetch(
        `/api/admin/referrers/${referrer.id}/referrals/${referralId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update status");
      }
      toast.success("تم تحديث الحالة بنجاح");
      // Refresh referrals list first
      await fetchReferrals();
      // Then notify parent to refresh referrers table (this will update pendingReferrals count)
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error: any) {
      toast.error(error.message || "فشل تحديث الحالة");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 ml-1" />
            قيد الانتظار
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 ml-1" />
            تمت
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="h-3 w-3 ml-1" />
            ملغاة
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const [paymentAmount, setPaymentAmount] = useState<number | undefined>(undefined);

  const handlePayment = async (orderId: string | null) => {
    if (!referrer) return;
    if (orderId) {
      const referral = referrals.find((r) => r.order?.id === orderId);
      if (referral?.order?.referrerCommission) {
        setPaymentAmount(referral.order.referrerCommission);
      }
    }
    setSelectedOrderId(orderId);
    setIsPaymentDialogOpen(true);
  };

  const handleBulkPayment = async () => {
    if (!referrer) return;
    // Calculate total commission for all completed orders
    const completedOrders = referrals
      .filter((r) => r.order && r.order.referrerCommission && r.order.referrerCommission > 0)
      .map((r) => r.order!.referrerCommission!);
    
    const totalAmount = completedOrders.reduce((sum, commission) => sum + commission, 0);
    
    if (totalAmount <= 0) {
      toast.error("لا توجد مبالغ مستحقة للدفع");
      return;
    }

    setPaymentAmount(totalAmount);
    setSelectedOrderId(null);
    setIsPaymentDialogOpen(true);
  };

  // Calculate totals - من orders مباشرة (مثل ReferrerTable)
  const totalOrders = orders.length;
  const totalEarnings = orders.reduce((sum, order) => {
    const commission = order.referrerCommission;
    return sum + (commission ? Number(commission) : 0);
  }, 0);
  
  // حساب الأرباح للطلبات المكتملة فقط (من referrals التي لديها order مكتمل)
  const completedReferrals = referrals.filter((r) => r.order && r.status === "COMPLETED");
  const completedEarnings = completedReferrals.reduce((sum, r) => {
    return sum + (r.order?.referrerCommission || 0);
  }, 0);

  if (!referrer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent  className="!max-w-[95vw] !w-full !max-h-[95vh] !overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex mx-6 items-center justify-between">
            <div>
              <DialogTitle>
                إحالات المندوب: {referrer.name} ({referrer.code})
              </DialogTitle>
              <DialogDescription>
                عرض وإدارة جميع الإحالات المرتبطة بهذا المندوب
              </DialogDescription>
            </div>
            {completedEarnings > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleBulkPayment}
                className="bg-green-600 hover:bg-green-700"
                title="دفع جميع الطلبات المكتملة"
              >
                <DollarSign className="h-4 w-4 ml-1" />
                دفع ({formatCurrency(completedEarnings)})
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters and Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant={filterStatus === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("")}
              >
                الكل
              </Button>
              <Button
                variant={filterStatus === "PENDING" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("PENDING")}
              >
                قيد الانتظار
              </Button>
              <Button
                variant={filterStatus === "COMPLETED" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("COMPLETED")}
              >
                تمت
              </Button>
              <Button
                variant={filterStatus === "CANCELLED" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("CANCELLED")}
              >
                ملغاة
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد إحالات
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">البريد</TableHead>
                      <TableHead className="text-right">الخدمة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الدفع</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">{referral.name}</TableCell>
                        <TableCell>{referral.phone}</TableCell>
                        <TableCell>{referral.email || "-"}</TableCell>
                        <TableCell>{referral.service}</TableCell>
                      
                        <TableCell>
                          {new Date(referral.createdAt).toLocaleDateString("ar-JO", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                        <TableCell>
                          {referral.status === "COMPLETED" && 
                           referral.order?.referrerCommission && 
                           referral.order.referrerCommission > 0 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePayment(referral.order!.id)}
                              className="text-green-600 hover:bg-green-50"
                              title="دفع ربح هذا الطلب"
                            >
                              <DollarSign className="h-4 w-4 ml-1" />
                              دفع ({formatCurrency(referral.order.referrerCommission)})
                            </Button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {referral.status === "PENDING" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(referral.id, "COMPLETED")}
                                  className="text-green-600"
                                >
                                  <Check className="h-4 w-4 ml-1" />
                                  تمت
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(referral.id, "CANCELLED")}
                                  className="text-red-600"
                                >
                                  <X className="h-4 w-4 ml-1" />
                                  إلغاء
                                </Button>
                              </>
                            )}
                            {referral.status === "COMPLETED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(referral.id, "PENDING")}
                              >
                                إرجاع للانتظار
                              </Button>
                            )}
                            {referral.status === "CANCELLED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(referral.id, "PENDING")}
                              >
                                إرجاع للانتظار
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Summary */}
              {referrals.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الإحالات</p>
                      <p className="text-2xl font-bold">{referrals.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">الطلبات المرتبطة</p>
                      <p className="text-2xl font-bold">{totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأرباح</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">متوسط الربح للطلب</p>
                      <p className="text-2xl font-bold">
                        {totalOrders > 0 ? formatCurrency(totalEarnings / totalOrders) : formatCurrency(0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
      
      {/* Payment Dialog */}
      {referrer && (
        <ReferrerPaymentForm
          open={isPaymentDialogOpen}
          onOpenChange={(open) => {
            setIsPaymentDialogOpen(open);
            if (!open) {
              setSelectedOrderId(null);
              setPaymentAmount(undefined);
            }
          }}
          referrer={referrer}
          initialAmount={paymentAmount}
          onSuccess={() => {
            setIsPaymentDialogOpen(false);
            setSelectedOrderId(null);
            setPaymentAmount(undefined);
            onSuccess();
          }}
        />
      )}
    </Dialog>
  );
}
