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
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Employee } from "./EmployeeTable";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

type EmployeeDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  phoneCountryCode?: string | null;
  role: string;
  avatar: string | null;
  isActive: boolean;
  defaultProfitRate: number | null;
  country?: string | null;
  specialization?: string | null;
  services?: any;
  academicLevels?: any;
  complaintsCount?: number;
  createdAt: string;
  updatedAt: string;
  assignedJobs: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    employeeProfit: number;
  }>;
  transfers: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
};

interface EmployeeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeViewDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeViewDialogProps) {
  const [employeeDetail, setEmployeeDetail] = useState<EmployeeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && employee) {
      fetchEmployeeDetail();
    } else {
      setEmployeeDetail(null);
    }
  }, [open, employee]);

  const fetchEmployeeDetail = async () => {
    if (!employee) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/employees/${employee.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch employee details");
      }
      const data = await response.json();
      
      // Format the data
      const formattedData: EmployeeDetail = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        phoneCountryCode: data.phoneCountryCode,
        role: data.role,
        avatar: data.avatar,
        isActive: data.isActive,
        defaultProfitRate: data.defaultProfitRate,
        country: data.country,
        specialization: data.specialization,
        services: data.services,
        academicLevels: data.academicLevels,
        complaintsCount: data.complaintsCount || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        assignedJobs: data.assignedJobs?.map((job: any) => ({
          id: job.id,
          orderNumber: job.orderNumber,
          status: job.status,
          totalPrice: job.totalPrice,
          employeeProfit: job.employeeProfit,
        })) || [],
        transfers: data.transfers?.map((t: any) => ({
          id: t.id,
          amount: t.amount,
          status: t.status,
          createdAt: t.createdAt,
        })) || [],
      };
      
      setEmployeeDetail(formattedData);
    } catch (error) {
      console.error("Error fetching employee detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!employee) return null;

  const totalEarnings = employeeDetail?.assignedJobs
    .filter((job) => job.status === "COMPLETED")
    .reduce((sum, job) => sum + job.employeeProfit, 0) || 0;

  const totalTransferred = employeeDetail?.transfers
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const pendingEarnings = totalEarnings - totalTransferred;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل الموظف</DialogTitle>
          <DialogDescription>
            عرض جميع المعلومات المتعلقة بالموظف
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : employeeDetail ? (
          <div className="space-y-4 py-4">
            {/* Employee Info */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الموظف</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={employeeDetail.avatar || undefined} />
                    <AvatarFallback className="text-lg">
                      {employeeDetail.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{employeeDetail.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{employeeDetail.email}</p>
                    <StatusBadge status={employeeDetail.isActive ? "ACTIVE" : "INACTIVE"} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">رقم الهاتف</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {employeeDetail.phoneCountryCode || "+962"} {employeeDetail.phone || "غير متوفر"}
                      </p>
                      {employeeDetail.phone && (
                        <a
                          href={`https://wa.me/${(employeeDetail.phoneCountryCode || "+962").replace(/\D/g, "")}${employeeDetail.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700"
                          title="فتح واتساب"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.652a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الدور</p>
                    <p className="font-semibold">{employeeDetail.role === "ADMIN" ? "مدير" : "موظف"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الدولة</p>
                    <p className="font-semibold">{employeeDetail.country || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">التخصص</p>
                    <p className="font-semibold">{employeeDetail.specialization || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">المستويات الأكاديمية</p>
                    <p className="font-semibold">
                      {employeeDetail.academicLevels && Array.isArray(employeeDetail.academicLevels) && employeeDetail.academicLevels.length > 0
                        ? employeeDetail.academicLevels.map((l: string) => {
                            const levelMap: Record<string, string> = {
                              school: "مدرسة",
                              diploma: "دبلوم",
                              bachelor: "بكالوريوس",
                              master: "ماجستير",
                              phd: "دكتوراه",
                            };
                            return levelMap[l] || l;
                          }).join(", ")
                        : "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الخدمات</p>
                    <p className="font-semibold">
                      {employeeDetail.services && Array.isArray(employeeDetail.services) && employeeDetail.services.length > 0
                        ? employeeDetail.services.join(", ")
                        : "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">عدد الشكاوى</p>
                    <p className={`font-semibold ${employeeDetail.complaintsCount && employeeDetail.complaintsCount > 0 ? "text-red-600" : ""}`}>
                      {employeeDetail.complaintsCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">نسبة الربح الافتراضية</p>
                    <p className="font-semibold">{employeeDetail.defaultProfitRate || 40}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">تاريخ الإنشاء</p>
                    <p className="font-semibold">{formatDateTime(employeeDetail.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">آخر تحديث</p>
                    <p className="font-semibold">{formatDateTime(employeeDetail.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>الإحصائيات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold">{employeeDetail.assignedJobs.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الطلبات المكتملة</p>
                    <p className="text-2xl font-bold text-green-600">
                      {employeeDetail.assignedJobs.filter((j) => j.status === "COMPLETED").length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأرباح</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الأرباح المستحقة</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingEarnings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            {employeeDetail.assignedJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>الطلبات المكلف بها</CardTitle>
                  <CardDescription>
                    آخر {Math.min(5, employeeDetail.assignedJobs.length)} طلبات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {employeeDetail.assignedJobs.slice(0, 5).map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{job.orderNumber}</p>
                          <StatusBadge status={job.status} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-600 dark:text-gray-400">ربح الموظف</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(job.employeeProfit)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transfers */}
            {employeeDetail.transfers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>التحويلات المالية</CardTitle>
                  <CardDescription>
                    آخر {Math.min(5, employeeDetail.transfers.length)} تحويلات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {employeeDetail.transfers.slice(0, 5).map((transfer) => (
                      <div
                        key={transfer.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{formatCurrency(transfer.amount)}</p>
                          <StatusBadge status={transfer.status === "COMPLETED" ? "COMPLETED" : "PENDING"} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-600 dark:text-gray-400">التاريخ</p>
                          <p className="font-semibold">{formatDateTime(transfer.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            فشل تحميل تفاصيل الموظف
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
