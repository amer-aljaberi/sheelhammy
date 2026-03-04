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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_TYPES, ORDER_PRIORITIES, GRADE_TYPES, BTEC_GRADES } from "@/lib/countries";
import { Icon } from "@iconify/react";
import { Trash2, Plus } from "lucide-react";

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

type ServiceItem = {
  id: string;
  serviceId: string;
  customServiceName: string;
  isCustom: boolean;
  price: string;
  employeeId: string;
  employeeProfit: string;
  subjectName: string;
  grade: string;
  gradeType: string;
  orderType: string;
  description: string;
  paymentType: string;
  paidAmount: string;
  installmentAmount: string;
  paymentInstallments: number[];
  discount: string;
};

interface MultiServiceOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  services: Service[];
  employees: Employee[];
  onSuccess: () => void;
}

export function MultiServiceOrderForm({
  open,
  onOpenChange,
  students,
  services,
  employees,
  onSuccess,
}: MultiServiceOrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [referrerId, setReferrerId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("normal");
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
    {
      id: "1",
      serviceId: "",
      customServiceName: "",
      isCustom: false,
      price: "",
      employeeId: "",
      employeeProfit: "",
      subjectName: "",
      grade: "",
      gradeType: "",
      orderType: "",
      description: "",
      paymentType: "cash",
      paidAmount: "",
      installmentAmount: "",
      paymentInstallments: [],
      discount: "",
    },
  ]);

  useEffect(() => {
    if (open) {
      const savedReferrerId = typeof window !== "undefined" ? localStorage.getItem("referrerId") : null;
      if (savedReferrerId) {
        setReferrerId(savedReferrerId);
      }
    } else {
      // Reset form when closed
      setStudentId("");
      setReferrerId("");
      setDeadline("");
      setPriority("normal");
      setServiceItems([
        {
          id: "1",
          serviceId: "",
          customServiceName: "",
          isCustom: false,
          price: "",
          employeeId: "",
          employeeProfit: "",
          subjectName: "",
          grade: "",
          gradeType: "",
          orderType: "",
          description: "",
          paymentType: "cash",
          paidAmount: "",
          installmentAmount: "",
          paymentInstallments: [],
          discount: "",
        },
      ]);
    }
  }, [open]);

  const addServiceItem = () => {
    setServiceItems([
      ...serviceItems,
      {
        id: Date.now().toString(),
        serviceId: "",
        customServiceName: "",
        isCustom: false,
        price: "",
        employeeId: "",
        employeeProfit: "",
        subjectName: "",
        grade: "",
        gradeType: "",
        orderType: "",
        description: "",
        paymentType: "cash",
        paidAmount: "",
        installmentAmount: "",
        paymentInstallments: [],
        discount: "",
      },
    ]);
  };

  const removeServiceItem = (id: string) => {
    if (serviceItems.length > 1) {
      setServiceItems(serviceItems.filter((item) => item.id !== id));
    } else {
      toast.error("يجب أن يكون هناك خدمة واحدة على الأقل");
    }
  };

  const updateServiceItem = (id: string, updates: Partial<ServiceItem>) => {
    setServiceItems(
      serviceItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const calculateTotalPrice = () => {
    return serviceItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      return total + (price - discount);
    }, 0);
  };

  const calculateTotalPaid = () => {
    return serviceItems.reduce((total, item) => {
      const paid = parseFloat(item.paidAmount) || 0;
      return total + paid;
    }, 0);
  };

  const calculateTotalRemaining = () => {
    return calculateTotalPrice() - calculateTotalPaid();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId) {
      toast.error("يرجى اختيار الطالب");
      return;
    }

    if (serviceItems.length === 0) {
      toast.error("يرجى إضافة خدمة واحدة على الأقل");
      return;
    }

    // Validate all service items
    for (const item of serviceItems) {
      if (!item.isCustom && !item.serviceId && !item.customServiceName) {
        toast.error("يرجى اختيار خدمة أو إدخال اسم خدمة مخصصة");
        return;
      }
      if (!item.price || parseFloat(item.price) <= 0) {
        toast.error("يرجى إدخال سعر صحيح لكل خدمة");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create orders for each service
      const orderPromises = serviceItems.map(async (item) => {
        // Calculate installments if needed
        let installments: number[] = [];
        if (item.paymentType === "installments" && item.installmentAmount) {
          const total = parseFloat(item.price) || 0;
          const discount = parseFloat(item.discount) || 0;
          const paid = parseFloat(item.paidAmount) || 0;
          const remaining = total - discount - paid;
          const installmentAmount = parseFloat(item.installmentAmount) || 0;

          if (installmentAmount > 0 && remaining > 0) {
            const numberOfInstallments = Math.ceil(remaining / installmentAmount);
            for (let i = 0; i < numberOfInstallments; i++) {
              if (i === numberOfInstallments - 1) {
                installments.push(remaining - (numberOfInstallments - 1) * installmentAmount);
              } else {
                installments.push(installmentAmount);
              }
            }
          }
        }

        // For custom services, we need to create a service first or use a placeholder
        // For now, we'll use a special handling in the API
        const serviceId = item.isCustom ? "custom" : item.serviceId;

        const orderData = {
          studentId,
          serviceId,
          customServiceName: item.isCustom ? item.customServiceName : null,
            employeeId: item.employeeId && item.employeeId !== "none" ? item.employeeId : null,
            referrerId: referrerId && referrerId !== "none" ? referrerId : null,
          totalPrice: parseFloat(item.price),
          employeeProfit: item.employeeProfit ? parseFloat(item.employeeProfit) : 0,
          deadline: deadline || null,
          isPaid: parseFloat(item.paidAmount) > 0,
          paymentType: item.paymentType || "cash",
          paymentInstallments: installments.length > 0 ? installments : null,
          discount: item.discount ? parseFloat(item.discount) : 0,
          priority: priority || "normal",
          grade: item.grade || null,
          gradeType: item.gradeType || null,
          subjectName: item.subjectName || null,
          orderType: item.orderType || null,
          description: item.description || null,
        };

        const response = await fetch("/api/admin/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create order");
        }

        return response.json();
      });

      await Promise.all(orderPromises);

      toast.success(`تم إنشاء ${serviceItems.length} طلب بنجاح`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء الطلبات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" dir="rtl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>إنشاء طلبات متعددة</DialogTitle>
          <DialogDescription>
            إضافة خدمات متعددة للطالب في طلب واحد
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-6 py-4 overflow-y-auto flex-1">
            {/* Student Selection */}
            <div>
              <Label>الطالب *</Label>
              <Combobox
                options={students.map((student) => ({
                  value: student.id,
                  label: student.name,
                }))}
                value={studentId}
                onValueChange={setStudentId}
                placeholder="اختر الطالب"
                searchPlaceholder="ابحث عن طالب..."
                emptyText="لا يوجد طلاب"
                required
              />
            </div>

            {/* Referrer Selection */}
            <div>
              <Label>المندوب (اختياري)</Label>
              <Select value={referrerId} onValueChange={setReferrerId}>
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
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>موعد التسليم</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div>
                <Label>أولوية الطلب</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Service Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">الخدمات</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addServiceItem}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة خدمة
                </Button>
              </div>

              {serviceItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg space-y-4 bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">الخدمة {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeServiceItem(item.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Service Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الخدمة</Label>
                      <Select
                        value={item.isCustom ? "custom" : item.serviceId}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            updateServiceItem(item.id, {
                              isCustom: true,
                              serviceId: "",
                              customServiceName: "",
                            });
                          } else {
                            updateServiceItem(item.id, {
                              isCustom: false,
                              serviceId: value,
                              customServiceName: "",
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الخدمة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">خدمة مخصصة</SelectItem>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {item.isCustom && (
                      <div>
                        <Label>اسم الخدمة المخصصة *</Label>
                        <Input
                          value={item.customServiceName}
                          onChange={(e) =>
                            updateServiceItem(item.id, {
                              customServiceName: e.target.value,
                            })
                          }
                          placeholder="أدخل اسم الخدمة"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Price and Employee */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>السعر *</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(e) =>
                          updateServiceItem(item.id, { price: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>الموظف</Label>
                      <Select
                        value={item.employeeId}
                        onValueChange={(value) =>
                          updateServiceItem(item.id, { employeeId: value })
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
                      <Label>ربح الموظف</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.employeeProfit}
                        onChange={(e) =>
                          updateServiceItem(item.id, {
                            employeeProfit: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Payment Type */}
                  <div>
                    <Label>نوع الدفع</Label>
                    <Select
                      value={item.paymentType}
                      onValueChange={(value) =>
                        updateServiceItem(item.id, { paymentType: value })
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

                  {/* Installments */}
                  {item.paymentType === "installments" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>المبلغ المدفوع</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.paidAmount}
                          onChange={(e) => {
                            const paid = parseFloat(e.target.value) || 0;
                            const total = parseFloat(item.price) || 0;
                            const discount = parseFloat(item.discount) || 0;
                            const remaining = total - discount - paid;
                            const installmentAmount =
                              parseFloat(item.installmentAmount) || 0;

                            let newInstallments: number[] = [];
                            if (installmentAmount > 0 && remaining > 0) {
                              const numberOfInstallments = Math.ceil(
                                remaining / installmentAmount
                              );
                              for (let i = 0; i < numberOfInstallments; i++) {
                                if (i === numberOfInstallments - 1) {
                                  newInstallments.push(
                                    remaining -
                                      (numberOfInstallments - 1) *
                                        installmentAmount
                                  );
                                } else {
                                  newInstallments.push(installmentAmount);
                                }
                              }
                            }

                            updateServiceItem(item.id, {
                              paidAmount: e.target.value,
                              paymentInstallments: newInstallments,
                            });
                          }}
                        />
                        {item.paidAmount && (
                          <p className="text-xs text-gray-500 mt-1">
                            المتبقي:{" "}
                            {(
                              (parseFloat(item.price) || 0) -
                              (parseFloat(item.discount) || 0) -
                              (parseFloat(item.paidAmount) || 0)
                            ).toFixed(2)}{" "}
                            د.أ
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>قيمة القسط الواحد</Label>
                        <Input
                          type="number"
                          placeholder="100.00"
                          value={item.installmentAmount}
                          onChange={(e) => {
                            const installmentAmount =
                              parseFloat(e.target.value) || 0;
                            const total = parseFloat(item.price) || 0;
                            const discount = parseFloat(item.discount) || 0;
                            const paid = parseFloat(item.paidAmount) || 0;
                            const remaining = total - discount - paid;

                            let newInstallments: number[] = [];
                            if (installmentAmount > 0 && remaining > 0) {
                              const numberOfInstallments = Math.ceil(
                                remaining / installmentAmount
                              );
                              for (let i = 0; i < numberOfInstallments; i++) {
                                if (i === numberOfInstallments - 1) {
                                  newInstallments.push(
                                    remaining -
                                      (numberOfInstallments - 1) *
                                        installmentAmount
                                  );
                                } else {
                                  newInstallments.push(installmentAmount);
                                }
                              }
                            }

                            updateServiceItem(item.id, {
                              installmentAmount: e.target.value,
                              paymentInstallments: newInstallments,
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الخصم</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.discount}
                        onChange={(e) =>
                          updateServiceItem(item.id, { discount: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>اسم المادة</Label>
                      <Input
                        value={item.subjectName}
                        onChange={(e) =>
                          updateServiceItem(item.id, {
                            subjectName: e.target.value,
                          })
                        }
                        placeholder="اسم المادة"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>نوع الطلب</Label>
                      <Input
                        value={item.orderType}
                        onChange={(e) =>
                          updateServiceItem(item.id, { orderType: e.target.value })
                        }
                        placeholder="نوع الطلب"
                      />
                    </div>
                    <div>
                      <Label>نوع العلامة</Label>
                      <Select
                        value={item.gradeType}
                        onValueChange={(value) =>
                          updateServiceItem(item.id, {
                            gradeType: value,
                            grade: value === "normal" ? "" : item.grade,
                          })
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
                  </div>

                  {item.gradeType === "BTEC" && (
                    <div>
                      <Label>العلامة</Label>
                      <Select
                        value={item.grade}
                        onValueChange={(value) =>
                          updateServiceItem(item.id, { grade: value })
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
                    <Label>وصف الخدمة</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        updateServiceItem(item.id, { description: e.target.value })
                      }
                      placeholder="وصف تفصيلي للخدمة..."
                      rows={2}
                    />
                  </div>

                  {/* Installments Display */}
                  {item.paymentInstallments.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <Label className="text-sm font-semibold mb-2 block">
                        الأقساط المولدة تلقائياً
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.paymentInstallments.map((amount, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                          >
                            قسط {idx + 1}: {amount.toFixed(2)} د.أ
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        عدد الأقساط: {item.paymentInstallments.length} | المجموع:{" "}
                        {item.paymentInstallments
                          .reduce((a, b) => a + b, 0)
                          .toFixed(2)}{" "}
                        د.أ
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-3">الملخص</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>عدد الخدمات:</span>
                  <span className="font-semibold">{serviceItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>المجموع الكلي:</span>
                  <span className="font-semibold text-lg">
                    {calculateTotalPrice().toFixed(2)} د.أ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>المدفوع:</span>
                  <span className="font-semibold text-green-600">
                    {calculateTotalPaid().toFixed(2)} د.أ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>المتبقي:</span>
                  <span className="font-semibold text-red-600">
                    {calculateTotalRemaining().toFixed(2)} د.أ
                  </span>
                </div>
              </div>
            </div>
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
              {isLoading ? "جاري الحفظ..." : "إنشاء الطلبات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
