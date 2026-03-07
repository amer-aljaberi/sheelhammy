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
import { X, Check, Clock } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    if (open && referrer) {
      fetchReferrals();
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

  if (!referrer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent  className="!max-w-[95vw] !w-full !max-h-[95vh] !overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            إحالات المندوب: {referrer.name} ({referrer.code})
          </DialogTitle>
          <DialogDescription>
            عرض وإدارة جميع الإحالات المرتبطة بهذا المندوب
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
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

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد إحالات
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">البريد</TableHead>
                  <TableHead className="text-right">الخدمة</TableHead>
                  <TableHead className="text-right">المرحلة</TableHead>
                  <TableHead className="text-right">الجامعة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
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
                    <TableCell>{referral.academicLevel || "-"}</TableCell>
                    <TableCell>{referral.university || "-"}</TableCell>
                    <TableCell>
                      {new Date(referral.createdAt).toLocaleDateString("ar-JO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(referral.status)}</TableCell>
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
