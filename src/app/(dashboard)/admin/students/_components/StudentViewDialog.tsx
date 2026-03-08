"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Student } from "./StudentTable";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StudentOrdersPaymentDialog } from "./StudentOrdersPaymentDialog";

type StudentDetail = {
  id: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    service: {
      title: string;
    };
    createdAt: string;
  }>;
};

interface StudentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function StudentViewDialog({
  open,
  onOpenChange,
  student,
}: StudentViewDialogProps) {
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    if (open && student) {
      fetchStudentDetail();
    } else {
      setStudentDetail(null);
    }
  }, [open, student]);

  const fetchStudentDetail = async () => {
    if (!student) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/students/${student.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch student details");
      }
      const data = await response.json();
      setStudentDetail(data);
    } catch (error) {
      console.error("Error fetching student detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!student) return null;

  const totalSpent = studentDetail?.orders.reduce((sum, order) => sum + order.totalPrice, 0) || 0;
  const completedOrders = studentDetail?.orders.filter((o) => o.status === "COMPLETED").length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" dir="rtl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>تفاصيل الطالب</DialogTitle>
          <DialogDescription>
            عرض جميع المعلومات المتعلقة بالطالب
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : studentDetail ? (
            <div className="space-y-4 py-4">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الطالب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{studentDetail.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">البريد الإلكتروني</p>
                    <p className="font-semibold">{studentDetail.email || "غير متوفر"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">واتساب</p>
                    <p className="font-semibold">{studentDetail.whatsapp || "غير متوفر"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">تاريخ الإنشاء</p>
                    <p className="font-semibold">{formatDateTime(studentDetail.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">آخر تحديث</p>
                    <p className="font-semibold">{formatDateTime(studentDetail.updatedAt)}</p>
                  </div>
                </div>
                {studentDetail.notes && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ملاحظات</p>
                    <p className="font-semibold whitespace-pre-wrap">{studentDetail.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>الإحصائيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold">{studentDetail.orders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الطلبات المكتملة</p>
                    <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الإنفاق</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSpent)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            {studentDetail.orders.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>الطلبات</CardTitle>
                      <CardDescription>
                        آخر {Math.min(10, studentDetail.orders.length)} طلب
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowPaymentDialog(true)}>
                      إدارة الدفعات
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {studentDetail.orders.slice(0, 10).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{order.orderNumber}</p>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {order.service.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateTime(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">السعر</p>
                          <p className="font-semibold">{formatCurrency(order.totalPrice)}</p>
                        </div>
                        <Link href={`/admin/orders?studentId=${studentDetail.id}`}>
                          <Button variant="outline" size="sm" className="mr-2">
                            عرض
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              فشل تحميل تفاصيل الطالب
            </div>
          )}
        </div>
      </DialogContent>

      <StudentOrdersPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        student={student}
        onSuccess={() => {
          fetchStudentDetail();
        }}
      />
    </Dialog>
  );
}
