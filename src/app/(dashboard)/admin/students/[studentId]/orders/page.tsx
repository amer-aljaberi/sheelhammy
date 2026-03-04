"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { TableSkeleton } from "@/components/common/Skeletons";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Order = {
  id: string;
  orderNumber: string;
  service: string;
  employeeName: string;
  status: string;
  totalPrice: number;
  discount: number;
  employeeProfit: number;
  isPaid: boolean;
  paymentType: string | null;
  paymentInstallments: number[] | null;
  paidAmount: number;
  deadline: string | null;
  subjectName: string | null;
  grade: string | null;
  gradeType: string | null;
  orderType: string | null;
  description: string | null;
  createdAt: string;
};

type Student = {
  id: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
};

export default function StudentOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
      fetchOrders();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/admin/students/${studentId}`);
      if (!response.ok) throw new Error("Failed to fetch student");
      const data = await response.json();
      setStudent(data);
    } catch (error) {
      console.error("Error fetching student:", error);
      toast.error("فشل تحميل بيانات الطالب");
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/orders?studentId=${studentId}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      
      // Parse paymentInstallments
      const formattedOrders = data.map((order: any) => {
        let installments: number[] = [];
        if (order.paymentInstallments) {
          if (typeof order.paymentInstallments === 'string') {
            try {
              installments = JSON.parse(order.paymentInstallments);
            } catch {
              installments = [];
            }
          } else if (Array.isArray(order.paymentInstallments)) {
            installments = order.paymentInstallments;
          }
        }
        
        return {
          ...order,
          paymentInstallments: installments,
        };
      });
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("فشل تحميل الطلبات");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return orders.reduce((total, order) => {
      return total + (order.totalPrice - (order.discount || 0));
    }, 0);
  };

  const calculateTotalPaid = () => {
    return orders.reduce((total, order) => {
      return total + (order.paidAmount || 0);
    }, 0);
  };

  const calculateTotalRemaining = () => {
    return calculateTotalPrice() - calculateTotalPaid();
  };

  const calculateTotalEmployeeProfit = () => {
    return orders.reduce((total, order) => {
      return total + (order.employeeProfit || 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader title="طلبات الطالب" description="عرض جميع طلبات الطالب" />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader title="طلبات الطالب" description="عرض جميع طلبات الطالب" />
        <div className="text-center py-12 text-gray-500">
          الطالب غير موجود
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title={`طلبات ${student.name}`}
        description="عرض جميع الطلبات والتفاصيل المالية"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4 ml-2" />
            رجوع
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              عدد الخدمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              المجموع الكلي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(calculateTotalPrice())}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              المدفوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(calculateTotalPaid())}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              المتبقي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(calculateTotalRemaining())}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            لا توجد طلبات لهذا الطالب
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الطلبات</CardTitle>
            <CardDescription>
              جميع الخدمات والتفاصيل المالية للطالب
            </CardDescription>
          </CardHeader>
          <CardContent className="text-right">
            <Table dir="rtl" className="text-right">
              <TableHeader>
                <TableRow >
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">الخدمة</TableHead>
                  <TableHead className="text-right">اسم المادة</TableHead>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">الخصم</TableHead>
                  <TableHead className="text-right">السعر بعد الخصم</TableHead>
                  <TableHead className="text-right">المدفوع</TableHead>
                  <TableHead className="text-right">المتبقي</TableHead>
                  <TableHead className="text-right">ربح الموظف</TableHead>
                  <TableHead className="text-right">نوع الدفع</TableHead>
                  <TableHead className="text-right">الأقساط</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">موعد التسليم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const finalPrice = order.totalPrice - (order.discount || 0);
                  const remaining = finalPrice - (order.paidAmount || 0);
                  const installmentsTotal = order.paymentInstallments
                    ? order.paymentInstallments.reduce((a, b) => a + b, 0)
                    : 0;

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.service}</TableCell>
                      <TableCell>{order.subjectName || "-"}</TableCell>
                      <TableCell>{order.employeeName || "غير معين"}</TableCell>
                      <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                      <TableCell>
                        {order.discount > 0 ? (
                          <span className="text-red-600">
                            -{formatCurrency(order.discount)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(finalPrice)}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {formatCurrency(order.paidAmount || 0)}
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        {formatCurrency(remaining)}
                      </TableCell>
                      <TableCell className="text-blue-600">
                        {formatCurrency(order.employeeProfit || 0)}
                      </TableCell>
                      <TableCell>
                        {order.paymentType === "cash"
                          ? "كاش"
                          : order.paymentType === "installments"
                          ? "أقساط"
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {order.paymentInstallments &&
                        order.paymentInstallments.length > 0 ? (
                          <div className="space-y-1">
                            <div className="text-xs">
                              {order.paymentInstallments.length} قسط
                            </div>
                            <div className="text-xs text-gray-500">
                              المجموع: {formatCurrency(installmentsTotal)}
                            </div>
                            {order.paymentInstallments.length <= 3 && (
                              <div className="text-xs">
                                {order.paymentInstallments
                                  .map((amt, idx) => `${idx + 1}: ${formatCurrency(amt)}`)
                                  .join(", ")}
                              </div>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        {order.deadline ? formatDate(order.deadline) : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Total Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <h4 className="font-semibold mb-3">الملخص الإجمالي</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">المجموع الكلي</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(calculateTotalPrice())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">المدفوع</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(calculateTotalPaid())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">المتبقي</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(calculateTotalRemaining())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ربح الموظفين</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatCurrency(calculateTotalEmployeeProfit())}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
