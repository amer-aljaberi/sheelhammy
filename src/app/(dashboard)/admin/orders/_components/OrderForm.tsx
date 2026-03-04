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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Order } from "./OrderTable";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_TYPES, ORDER_PRIORITIES, GRADE_TYPES, BTEC_GRADES } from "@/lib/countries";

type Student = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  title: string;
};

type Employee = {
  id: string;
  name: string;
  isReferrer?: boolean;
  referrerCode?: string | null;
};

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  students: Student[];
  services: Service[];
  employees: Employee[];
  onSuccess: () => void;
}

export function OrderForm({
  open,
  onOpenChange,
  order,
  students,
  services,
  employees,
  onSuccess,
}: OrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    serviceId: "",
    customServiceName: "", // اسم الخدمة المخصصة
    employeeId: "",
    referrerId: "",
    totalPrice: "",
    employeeProfit: "",
    deadline: "",
    status: "",
    isPaid: false,
    paymentType: "cash",
    paymentInstallments: [] as number[],
    discount: "",
    priority: "normal",
    grade: "",
    gradeType: "",
    subjectName: "",
    orderType: "",
    description: "",
    paidAmount: "", // المبلغ المدفوع
    installmentAmount: "", // قيمة القسط الواحد
  });

  useEffect(() => {
    if (open && order) {
      // Fetch full order data when editing
      fetchOrderData();
    } else if (open && !order) {
      // Create mode - reset form
      // Check for referrer in localStorage (if student came from referrer link)
      const savedReferrerId = typeof window !== "undefined" ? localStorage.getItem("referrerId") : null;
      
      setFormData({
        studentId: "",
        serviceId: "",
        customServiceName: "",
        employeeId: "",
        referrerId: savedReferrerId || "",
        totalPrice: "",
        employeeProfit: "",
        deadline: "",
        status: "",
        isPaid: false,
        paymentType: "cash",
        paymentInstallments: [],
        discount: "",
        priority: "normal",
        grade: "",
        gradeType: "",
        subjectName: "",
        orderType: "",
        description: "",
        paidAmount: "",
        installmentAmount: "",
      });
    }
  }, [order, open]);

  const fetchOrderData = async () => {
    if (!order) return;
    
    setIsLoadingData(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order data");
      }
      const orderData = await response.json();
      
      // Parse paymentInstallments if it's a JSON string
      let installments: number[] = [];
      if (orderData.paymentInstallments) {
        if (typeof orderData.paymentInstallments === 'string') {
          try {
            installments = JSON.parse(orderData.paymentInstallments);
          } catch {
            installments = [];
          }
        } else if (Array.isArray(orderData.paymentInstallments)) {
          installments = orderData.paymentInstallments;
        }
      }

      // Calculate paid amount from installments if available
      const totalPaid = installments.length > 0 ? installments.reduce((a, b) => a + b, 0) : 0;
      const originalTotal = orderData.totalPrice || 0;

      setFormData({
        studentId: orderData.studentId || "",
        serviceId: orderData.serviceId || "",
        customServiceName: orderData.customServiceName || "",
        employeeId: orderData.employeeId || "",
        referrerId: orderData.referrerId || "",
        totalPrice: orderData.totalPrice?.toString() || "",
        employeeProfit: orderData.employeeProfit?.toString() || "",
        deadline: orderData.deadline ? new Date(orderData.deadline).toISOString().split('T')[0] : "",
        status: orderData.status || "",
        isPaid: orderData.isPaid || false,
        paymentType: orderData.paymentType || "cash",
        paymentInstallments: installments,
        discount: orderData.discount?.toString() || "",
        priority: orderData.priority || "normal",
        grade: orderData.grade || "",
        gradeType: orderData.gradeType || "",
        subjectName: orderData.subjectName || "",
        orderType: orderData.orderType || "",
        description: orderData.description || "",
        paidAmount: totalPaid > 0 ? totalPaid.toString() : "",
        installmentAmount: installments.length > 0 && installments[0] > 0 ? installments[0].toString() : "",
      });
    } catch (error) {
      console.error("Error fetching order data:", error);
      toast.error("فشل تحميل بيانات الطلب");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (order) {
        // Update order
        const response = await fetch(`/api/admin/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            employeeId: formData.employeeId === "none" || formData.employeeId === "" ? null : formData.employeeId,
            referrerId: formData.referrerId === "none" || formData.referrerId === "" ? null : formData.referrerId,
            status: formData.status || undefined,
            deadline: formData.deadline || null,
            isPaid: formData.isPaid,
            paymentType: formData.paymentType || null,
            paymentInstallments: formData.paymentInstallments.length > 0 ? formData.paymentInstallments : null,
            discount: formData.discount ? parseFloat(formData.discount) : 0,
            priority: formData.priority || "normal",
            grade: formData.grade || null,
            gradeType: formData.gradeType || null,
            subjectName: formData.subjectName || null,
            orderType: formData.orderType || null,
            description: formData.description || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update order");
        }

        toast.success("تم تحديث الطلب بنجاح");
      } else {
        // Create order
        if (!formData.studentId || !formData.serviceId || !formData.totalPrice) {
          toast.error("يرجى ملء جميع الحقول المطلوبة");
          setIsLoading(false);
          return;
        }

        // Validate custom service name if custom service is selected
        if (formData.serviceId === "custom" && !formData.customServiceName) {
          toast.error("يرجى إدخال اسم الخدمة المخصصة");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/admin/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            studentId: formData.studentId,
            serviceId: formData.serviceId === "custom" ? "custom" : formData.serviceId,
            customServiceName: formData.serviceId === "custom" ? formData.customServiceName : null,
            employeeId: formData.employeeId === "none" || formData.employeeId === "" ? null : formData.employeeId,
            referrerId: formData.referrerId === "none" || formData.referrerId === "" ? null : formData.referrerId,
            totalPrice: parseFloat(formData.totalPrice),
            employeeProfit: formData.employeeProfit
              ? parseFloat(formData.employeeProfit)
              : null,
            deadline: formData.deadline || null,
            isPaid: formData.isPaid,
            paymentType: formData.paymentType || "cash",
            paymentInstallments: formData.paymentInstallments.length > 0 ? formData.paymentInstallments : null,
            discount: formData.discount ? parseFloat(formData.discount) : 0,
            priority: formData.priority || "normal",
            grade: formData.grade || null,
            gradeType: formData.gradeType || null,
            subjectName: formData.subjectName || null,
            orderType: formData.orderType || null,
            description: formData.description || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create order");
        }

        toast.success("تم إنشاء الطلب بنجاح");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col" dir="rtl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {order ? "تعديل الطلب" : "إنشاء طلب جديد"}
          </DialogTitle>
          <DialogDescription>
            {order
              ? `تعديل تفاصيل الطلب ${order.orderNumber}`
              : "إضافة طلب جديد للطالب واختيار الخدمة والموظف"}
          </DialogDescription>
        </DialogHeader>
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-gray-500">جاري تحميل البيانات...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="space-y-4 py-4 overflow-y-auto flex-1">
            {!order && (
              <>
                <div>
                  <Label>الطالب</Label>
                  <Combobox
                    options={students.map((student) => ({
                      value: student.id,
                      label: student.name,
                    }))}
                    value={formData.studentId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, studentId: value })
                    }
                    placeholder="اختر الطالب"
                    searchPlaceholder="ابحث عن طالب..."
                    emptyText="لا يوجد طلاب"
                    required
                  />
                </div>
                <div>
                  <Label>الخدمة</Label>
                  <Combobox
                    options={[
                      { value: "custom", label: "خدمة مخصصة" },
                      ...services.map((service) => ({
                        value: service.id,
                        label: service.title,
                      })),
                    ]}
                    value={formData.serviceId}
                    onValueChange={(value) =>
                      setFormData({ 
                        ...formData, 
                        serviceId: value,
                        customServiceName: value === "custom" ? formData.customServiceName : ""
                      })
                    }
                    placeholder="اختر الخدمة"
                    searchPlaceholder="ابحث عن خدمة..."
                    emptyText="لا توجد خدمات"
                    required
                  />
                  {formData.serviceId === "custom" && (
                    <div className="mt-2">
                      <Label>اسم الخدمة المخصصة</Label>
                      <Input
                        value={formData.customServiceName}
                        onChange={(e) =>
                          setFormData({ ...formData, customServiceName: e.target.value })
                        }
                        placeholder="أدخل اسم الخدمة المخصصة"
                        required={formData.serviceId === "custom"}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>سعر العميل</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.totalPrice}
                      onChange={(e) => {
                        const total = parseFloat(e.target.value) || 0;
                        const discount = parseFloat(formData.discount) || 0;
                        const profit = parseFloat(formData.employeeProfit) || 0;
                        const finalTotal = total - discount;
                        setFormData({ ...formData, totalPrice: e.target.value });
                        // Auto calculate: totalPrice - employeeProfit = remaining
                        if (profit > 0) {
                          // Keep employee profit, update remaining
                        }
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label>ربح الموظف (اختياري)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.employeeProfit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employeeProfit: e.target.value,
                        })
                      }
                    />
                    {formData.totalPrice && formData.employeeProfit && (
                      <p className="text-xs text-gray-500 mt-1">
                        المتبقي: {(
                          parseFloat(formData.totalPrice) - parseFloat(formData.employeeProfit)
                        ).toFixed(2)} د.أ
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>الخصم</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
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
                {formData.paymentType === "installments" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                  <div>
                        <Label>المبلغ المدفوع</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={formData.paidAmount}
                          onChange={(e) => {
                            const paid = parseFloat(e.target.value) || 0;
                            const total = parseFloat(formData.totalPrice) || 0;
                            const discount = parseFloat(formData.discount) || 0;
                            const remaining = total - discount - paid;
                            const installmentAmount = parseFloat(formData.installmentAmount) || 0;
                            
                            let newInstallments: number[] = [];
                            if (installmentAmount > 0 && remaining > 0) {
                              const numberOfInstallments = Math.ceil(remaining / installmentAmount);
                              for (let i = 0; i < numberOfInstallments; i++) {
                                if (i === numberOfInstallments - 1) {
                                  // Last installment gets the remainder
                                  newInstallments.push(remaining - (numberOfInstallments - 1) * installmentAmount);
                                } else {
                                  newInstallments.push(installmentAmount);
                                }
                              }
                            }
                            
                            setFormData({ 
                              ...formData, 
                              paidAmount: e.target.value,
                              paymentInstallments: newInstallments,
                            });
                          }}
                        />
                        {formData.paidAmount && (
                          <p className="text-xs text-gray-500 mt-1">
                            المتبقي: {(
                              (parseFloat(formData.totalPrice) || 0) - 
                              (parseFloat(formData.discount) || 0) - 
                              (parseFloat(formData.paidAmount) || 0)
                            ).toFixed(2)} د.أ
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>قيمة القسط الواحد</Label>
                        <Input
                          type="number"
                          placeholder="100.00"
                          value={formData.installmentAmount}
                          onChange={(e) => {
                            const installmentAmount = parseFloat(e.target.value) || 0;
                            const total = parseFloat(formData.totalPrice) || 0;
                            const discount = parseFloat(formData.discount) || 0;
                            const paid = parseFloat(formData.paidAmount) || 0;
                            const remaining = total - discount - paid;
                            
                            let newInstallments: number[] = [];
                            if (installmentAmount > 0 && remaining > 0) {
                              const numberOfInstallments = Math.ceil(remaining / installmentAmount);
                              for (let i = 0; i < numberOfInstallments; i++) {
                                if (i === numberOfInstallments - 1) {
                                  // Last installment gets the remainder
                                  newInstallments.push(remaining - (numberOfInstallments - 1) * installmentAmount);
                                } else {
                                  newInstallments.push(installmentAmount);
                                }
                              }
                            }
                            
                            setFormData({ 
                              ...formData, 
                              installmentAmount: e.target.value,
                              paymentInstallments: newInstallments,
                            });
                          }}
                        />
                      </div>
                    </div>
                    {formData.paymentInstallments.length > 0 && (
                      <div>
                        <Label>الأقساط المولدة تلقائياً</Label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {formData.paymentInstallments.map((amount, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                              >
                                قسط {index + 1}: {amount.toFixed(2)} د.أ
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            عدد الأقساط: {formData.paymentInstallments.length} | 
                            المجموع: {formData.paymentInstallments.reduce((a, b) => a + b, 0).toFixed(2)} د.أ
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <Label>الأقساط (يدوي - مثال: 500, 100, 400)</Label>
                    <Input
                      placeholder="500, 100, 400"
                      value={formData.paymentInstallments.join(", ")}
                      onChange={(e) => {
                        const values = e.target.value
                          .split(",")
                          .map((v) => parseFloat(v.trim()))
                          .filter((v) => !isNaN(v));
                        setFormData({ ...formData, paymentInstallments: values });
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      المجموع: {formData.paymentInstallments.reduce((a, b) => a + b, 0).toFixed(2)} د.أ
                    </p>
                  </div>
                  </>
                )}
                <div>
                  <Label>أولوية الطلب</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>اسم المادة</Label>
                  <Input
                    value={formData.subjectName}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectName: e.target.value })
                    }
                    placeholder="اسم المادة"
                  />
                </div>
                <div>
                  <Label>نوع الطلب</Label>
                  <Input
                    value={formData.orderType}
                    onChange={(e) =>
                      setFormData({ ...formData, orderType: e.target.value })
                    }
                    placeholder="نوع الطلب"
                  />
                </div>
                <div>
                  <Label>نوع العلامة</Label>
                  <Select
                    value={formData.gradeType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gradeType: value, grade: value === "normal" ? "" : formData.grade })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع العلامة" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.gradeType === "BTEC" && (
                  <div>
                    <Label>العلامة</Label>
                    <Select
                      value={formData.grade}
                      onValueChange={(value) =>
                        setFormData({ ...formData, grade: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العلامة" />
                      </SelectTrigger>
                      <SelectContent>
                        {BTEC_GRADES.map((grade) => (
                          <SelectItem key={grade.value} value={grade.value}>
                            {grade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>وصف الطلب</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="وصف تفصيلي للطلب..."
                    rows={3}
                  />
                </div>
              </>
            )}

            <div>
              <Label>الموظف {order ? "" : "(اختياري)"}</Label>
              <Select
                value={formData.employeeId || undefined}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    employeeId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">غير معين</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المندوب {order ? "" : "(اختياري)"}</Label>
              <Select
                value={formData.referrerId || undefined}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    referrerId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المندوب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">لا يوجد مندوب</SelectItem>
                  {employees
                    .filter((emp) => emp.isReferrer)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} {employee.referrerCode && `(${employee.referrerCode})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formData.referrerId && (
                <p className="text-xs text-gray-500 mt-1">
                  سيتم حساب عمولة المندوب تلقائياً عند حفظ الطلب
                </p>
              )}
            </div>

            <div>
              <Label>موعد التسليم</Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
              />
            </div>

            {order && (
              <>
                <div>
                  <Label>الحالة</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                      <SelectItem value="QUOTED">بانتظار السعر</SelectItem>
                      <SelectItem value="PAID">مدفوع</SelectItem>
                      <SelectItem value="ASSIGNED">تم الإسناد</SelectItem>
                      <SelectItem value="IN_PROGRESS">قيد التنفيذ</SelectItem>
                      <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                      <SelectItem value="REVISION">تعديل</SelectItem>
                      <SelectItem value="COMPLETED">مكتمل</SelectItem>
                      <SelectItem value="CANCELLED">ملغي</SelectItem>
                      <SelectItem value="OVERDUE">متأخر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="isPaid"
                    checked={formData.isPaid}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isPaid: checked as boolean })
                    }
                  />
                  <Label htmlFor="isPaid" className="cursor-pointer">
                    تم الدفع
                  </Label>
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
                {formData.paymentType === "installments" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                  <div>
                        <Label>المبلغ المدفوع</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={formData.paidAmount}
                          onChange={(e) => {
                            const paid = parseFloat(e.target.value) || 0;
                            const total = parseFloat(formData.totalPrice) || 0;
                            const discount = parseFloat(formData.discount) || 0;
                            const remaining = total - discount - paid;
                            const installmentAmount = parseFloat(formData.installmentAmount) || 0;
                            
                            let newInstallments: number[] = [];
                            if (installmentAmount > 0 && remaining > 0) {
                              const numberOfInstallments = Math.ceil(remaining / installmentAmount);
                              for (let i = 0; i < numberOfInstallments; i++) {
                                if (i === numberOfInstallments - 1) {
                                  // Last installment gets the remainder
                                  newInstallments.push(remaining - (numberOfInstallments - 1) * installmentAmount);
                                } else {
                                  newInstallments.push(installmentAmount);
                                }
                              }
                            }
                            
                            setFormData({ 
                              ...formData, 
                              paidAmount: e.target.value,
                              paymentInstallments: newInstallments,
                            });
                          }}
                        />
                        {formData.paidAmount && (
                          <p className="text-xs text-gray-500 mt-1">
                            المتبقي: {(
                              (parseFloat(formData.totalPrice) || 0) - 
                              (parseFloat(formData.discount) || 0) - 
                              (parseFloat(formData.paidAmount) || 0)
                            ).toFixed(2)} د.أ
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>قيمة القسط الواحد</Label>
                        <Input
                          type="number"
                          placeholder="100.00"
                          value={formData.installmentAmount}
                          onChange={(e) => {
                            const installmentAmount = parseFloat(e.target.value) || 0;
                            const total = parseFloat(formData.totalPrice) || 0;
                            const discount = parseFloat(formData.discount) || 0;
                            const paid = parseFloat(formData.paidAmount) || 0;
                            const remaining = total - discount - paid;
                            
                            let newInstallments: number[] = [];
                            if (installmentAmount > 0 && remaining > 0) {
                              const numberOfInstallments = Math.ceil(remaining / installmentAmount);
                              for (let i = 0; i < numberOfInstallments; i++) {
                                if (i === numberOfInstallments - 1) {
                                  // Last installment gets the remainder
                                  newInstallments.push(remaining - (numberOfInstallments - 1) * installmentAmount);
                                } else {
                                  newInstallments.push(installmentAmount);
                                }
                              }
                            }
                            
                            setFormData({ 
                              ...formData, 
                              installmentAmount: e.target.value,
                              paymentInstallments: newInstallments,
                            });
                          }}
                        />
                      </div>
                    </div>
                    {formData.paymentInstallments.length > 0 && (
                      <div>
                        <Label>الأقساط المولدة تلقائياً</Label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {formData.paymentInstallments.map((amount, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                              >
                                قسط {index + 1}: {amount.toFixed(2)} د.أ
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            عدد الأقساط: {formData.paymentInstallments.length} | 
                            المجموع: {formData.paymentInstallments.reduce((a, b) => a + b, 0).toFixed(2)} د.أ
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <Label>الأقساط (يدوي - مثال: 500, 100, 400)</Label>
                    <Input
                      placeholder="500, 100, 400"
                      value={formData.paymentInstallments.join(", ")}
                      onChange={(e) => {
                        const values = e.target.value
                          .split(",")
                          .map((v) => parseFloat(v.trim()))
                          .filter((v) => !isNaN(v));
                        setFormData({ ...formData, paymentInstallments: values });
                      }}
                    />
                      <p className="text-xs text-gray-500 mt-1">
                        المجموع: {formData.paymentInstallments.reduce((a, b) => a + b, 0).toFixed(2)} د.أ
                      </p>
                  </div>
                  </>
                )}
                <div>
                  <Label>الخصم</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>أولوية الطلب</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>اسم المادة</Label>
                  <Input
                    value={formData.subjectName}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectName: e.target.value })
                    }
                    placeholder="اسم المادة"
                  />
                </div>
                <div>
                  <Label>نوع الطلب</Label>
                  <Input
                    value={formData.orderType}
                    onChange={(e) =>
                      setFormData({ ...formData, orderType: e.target.value })
                    }
                    placeholder="نوع الطلب"
                  />
                </div>
                <div>
                  <Label>نوع العلامة</Label>
                  <Select
                    value={formData.gradeType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gradeType: value, grade: value === "normal" ? "" : formData.grade })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع العلامة" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.gradeType === "BTEC" && (
                  <div>
                    <Label>العلامة</Label>
                    <Select
                      value={formData.grade}
                      onValueChange={(value) =>
                        setFormData({ ...formData, grade: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العلامة" />
                      </SelectTrigger>
                      <SelectContent>
                        {BTEC_GRADES.map((grade) => (
                          <SelectItem key={grade.value} value={grade.value}>
                            {grade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>وصف الطلب</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="وصف تفصيلي للطلب..."
                    rows={3}
                  />
                </div>
              </>
            )}
            </div>
            <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "جاري الحفظ..." : order ? "حفظ" : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
