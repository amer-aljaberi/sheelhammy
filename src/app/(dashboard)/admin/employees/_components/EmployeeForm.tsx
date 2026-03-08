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
import { Employee } from "./EmployeeTable";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { ARAB_COUNTRIES, ACADEMIC_LEVELS, getWhatsAppLink } from "@/lib/countries";
import { Role } from "@prisma/client";
import { ADMIN_PAGES, getPagesByCategory } from "@/lib/rbac/permissions";

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export function EmployeeForm({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Array<{ id: string; title: string }>>([]);
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    phoneCountryCode: (employee as any)?.phoneCountryCode || "+962",
    password: "",
    role: (employee as any)?.role || ("EMPLOYEE" as Role),
    country: (employee as any)?.country || "",
    specialization: (employee as any)?.specialization || "",
    services: [] as string[],
    academicLevels: [] as string[],
    permissions: [] as string[],
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/admin/services");
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (open) {
      if (employee) {
        const emp = employee as any;
        // Parse JSON fields if they are strings
        let servicesArray: string[] = [];
        if (emp.services) {
          if (Array.isArray(emp.services)) {
            servicesArray = emp.services;
          } else if (typeof emp.services === 'string') {
            try {
              const parsed = JSON.parse(emp.services);
              servicesArray = Array.isArray(parsed) ? parsed : [];
            } catch {
              // If JSON parse fails, treat as comma-separated string
              servicesArray = emp.services.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            }
          }
        }

        let academicLevelsArray: string[] = [];
        if (emp.academicLevels) {
          if (Array.isArray(emp.academicLevels)) {
            academicLevelsArray = emp.academicLevels;
          } else if (typeof emp.academicLevels === 'string') {
            try {
              academicLevelsArray = JSON.parse(emp.academicLevels);
            } catch {
              academicLevelsArray = [];
            }
          }
        }

        let permissionsArray: string[] = [];
        if (emp.permissions) {
          if (Array.isArray(emp.permissions)) {
            permissionsArray = emp.permissions;
          } else if (typeof emp.permissions === 'string') {
            try {
              const parsed = JSON.parse(emp.permissions);
              permissionsArray = Array.isArray(parsed) ? parsed : [];
            } catch {
              permissionsArray = [];
            }
          }
        }

        setFormData({
          name: employee.name || "",
          email: employee.email || "",
          phone: employee.phone || "",
          phoneCountryCode: emp.phoneCountryCode || "+962",
          password: "",
          role: emp.role || ("EMPLOYEE" as Role),
          country: emp.country || "",
          specialization: emp.specialization || "",
          services: servicesArray,
          academicLevels: academicLevelsArray,
          permissions: permissionsArray,
        });
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          phoneCountryCode: "+962",
          password: "",
          role: "EMPLOYEE" as Role,
          country: "",
          specialization: "",
          services: [],
          academicLevels: [],
          permissions: [],
        });
      }
    }
  }, [employee, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = employee
        ? `/api/admin/employees/${employee.id}`
        : "/api/admin/employees";
      const method = employee ? "PATCH" : "POST";

      const body: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        phoneCountryCode: formData.phoneCountryCode,
        role: formData.role,
        country: formData.country || null,
        specialization: formData.specialization || null,
        services: formData.services.length > 0 ? formData.services : null,
        academicLevels: formData.academicLevels.length > 0 ? formData.academicLevels : null,
        permissions: formData.role === "ADMIN" && formData.permissions.length > 0 ? formData.permissions : null,
      };

      if (!employee && !formData.password) {
        toast.error("كلمة المرور مطلوبة");
        setIsLoading(false);
        return;
      }

      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ");
      }

      toast.success(
        employee ? "تم تحديث بيانات الموظف بنجاح" : "تم إضافة الموظف بنجاح"
      );
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
      <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {employee ? "تعديل الموظف" : "إضافة موظف جديد"}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? `تعديل بيانات الموظف ${employee.name}`
              : "إضافة حساب جديد للموظف"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <div>
              <Label>الاسم</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="اسم الموظف"
                required
              />
            </div>
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@example.com"
                required
                disabled={!!employee}
              />
              {employee && (
                <p className="text-sm text-gray-500 mt-1">
                  لا يمكن تغيير البريد الإلكتروني
                </p>
              )}
            </div>
            <div>
              <Label>الهاتف</Label>
              <div className="grid grid-cols-[150px_1fr_auto] gap-2">
                <Select
                  value={formData.phoneCountryCode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, phoneCountryCode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ARAB_COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.dial}>
                        {country.name} ({country.dial})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="7XXXXXXXX"
                />
                {formData.phone && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const link = getWhatsAppLink(
                        formData.phoneCountryCode,
                        formData.phone
                      );
                      window.open(link, "_blank");
                    }}
                    title="فتح واتساب"
                  >
                    <Icon icon="mdi:whatsapp" className="w-5 h-5 text-green-600" />
                  </Button>
                )}
              </div>
            </div>
            {!employee && (
              <div>
                <Label>كلمة المرور</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                />
              </div>
            )}
            <div>
              <Label>الدور</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ 
                    ...formData, 
                    role: value as Role,
                    // إذا تم تغيير الدور إلى EMPLOYEE، امسح الصلاحيات
                    permissions: value === "EMPLOYEE" ? [] : formData.permissions,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">موظف</SelectItem>
                  <SelectItem value="ADMIN">مدير</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === "EMPLOYEE" 
                  ? "الموظف يفتح له dashboard الموظف فقط"
                  : "يمكنك تحديد الصفحات التي يمكن للمدير الوصول إليها أدناه (إذا تركت فارغاً، سيكون لديه صلاحيات كاملة)"}
              </p>
            </div>
            {formData.role === "ADMIN" && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">الصلاحيات</h3>
                <p className="text-sm text-gray-600 mb-4">
                  اختر الصفحات التي يمكن للموظف الوصول إليها:
                </p>
                <div className="space-y-4">
                  {Object.entries(getPagesByCategory()).map(([category, pages]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                        {category}
                      </h4>
                      <div className="space-y-2 pr-4">
                        {pages.map((page) => (
                          <div key={page.path} className="flex items-center space-x-2 space-x-reverse">
                            <input
                              type="checkbox"
                              id={`permission-${page.path}`}
                              checked={formData.permissions.includes(page.path)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    permissions: [...formData.permissions, page.path],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    permissions: formData.permissions.filter(
                                      (p) => p !== page.path
                                    ),
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`permission-${page.path}`} className="cursor-pointer text-sm">
                              {page.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {formData.permissions.length > 0 && (
                  <p className="text-xs text-gray-500 mt-3">
                    عدد الصفحات المحددة: {formData.permissions.length} من {ADMIN_PAGES.length}
                  </p>
                )}
              </div>
            )}
            <div>
              <Label>الدولة</Label>
              <Select
                value={formData.country}
                onValueChange={(value) =>
                  setFormData({ ...formData, country: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدولة" />
                </SelectTrigger>
                <SelectContent>
                  {ARAB_COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>التخصص</Label>
              <Input
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                placeholder="مثال: هندسة البرمجيات"
              />
            </div>
            <div>
              <Label>الخدمات التي يشتغلها</Label>
              <Textarea
                value={Array.isArray(formData.services) ? formData.services.filter(s => s).join(", ") : ""}
                onChange={(e) => {
                  const value = e.target.value; 
                  const servicesList = value
                    .split(/[,\n]/)
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
                  setFormData({
                    ...formData,
                    services: servicesList,
                  });
                }}
                placeholder="أدخل الخدمات مفصولة بفواصل أو أسطر، مثال: حل أسايمنت، إعداد أبحاث، مشاريع تخرج"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                يمكنك إدخال عدة خدمات مفصولة بفواصل (،) أو أسطر جديدة
              </p>
              {Array.isArray(formData.services) && formData.services.filter(s => s).length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    عدد الخدمات: {formData.services.filter(s => s).length}
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label>المستويات التي يغطيها</Label>
              <div className="space-y-2">
                {ACADEMIC_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id={`level-${level.value}`}
                      checked={formData.academicLevels.includes(level.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            academicLevels: [...formData.academicLevels, level.value],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            academicLevels: formData.academicLevels.filter(
                              (l) => l !== level.value
                            ),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`level-${level.value}`} className="cursor-pointer">
                      {level.label}
                    </Label>
                  </div>
                ))}
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
              {isLoading ? "جاري الحفظ..." : employee ? "حفظ" : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
