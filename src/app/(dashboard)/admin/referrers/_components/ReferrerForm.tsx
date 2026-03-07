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
import { Icon } from "@iconify/react";
import { ARAB_COUNTRIES } from "@/lib/countries";

interface ReferrerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referrer?: Referrer | null;
  onSuccess: () => void;
}

export function ReferrerForm({
  open,
  onOpenChange,
  referrer,
  onSuccess,
}: ReferrerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; phone: string | null }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string; whatsapp: string | null }>>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    phoneCountryCode: "+962",
    code: "",
    commissionRate: null as number | null,
    isActive: true,
    country: "",
    university: "",
    academicYear: "",
    grade: "",
    importantNotes: "",
    notes: "",
    sourceType: "none" as "none" | "employee" | "student",
    sourceId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const empResponse = await fetch("/api/admin/employees");
        if (empResponse.ok) {
          const empData = await empResponse.json();
          setEmployees(empData.map((e: any) => ({ id: e.id, name: e.name, phone: e.phone })));
        }

        // Fetch students
        const stuResponse = await fetch("/api/admin/students");
        if (stuResponse.ok) {
          const stuData = await stuResponse.json();
          setStudents(stuData.map((s: any) => ({ id: s.id, name: s.name, whatsapp: s.whatsapp })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (open) {
      if (referrer) {
        setFormData({
          name: referrer.name || "",
          phone: referrer.phone || "",
          phoneCountryCode: referrer.phoneCountryCode || "+962",
          code: referrer.code || "",
          commissionRate: referrer.commissionRate ?? null,
          isActive: referrer.isActive,
          country: referrer.country || "",
          university: referrer.university || "",
          academicYear: referrer.academicYear || "",
          grade: referrer.grade || "",
          importantNotes: referrer.importantNotes || "",
          notes: referrer.notes || "",
          sourceType: "none",
          sourceId: "",
        });
      } else {
        setFormData({
          name: "",
          phone: "",
          phoneCountryCode: "+962",
          code: "",
          commissionRate: null,
          isActive: true,
          country: "",
          university: "",
          academicYear: "",
          grade: "",
          importantNotes: "",
          notes: "",
          sourceType: "none",
          sourceId: "",
        });
      }
    }
  }, [referrer, open]);

  const handleSourceChange = (sourceType: "none" | "employee" | "student", sourceId: string) => {
    if (sourceType === "employee" && sourceId) {
      const employee = employees.find((e) => e.id === sourceId);
      if (employee) {
        setFormData({
          ...formData,
          sourceType,
          sourceId,
          name: employee.name,
          phone: employee.phone || formData.phone,
        });
      }
    } else if (sourceType === "student" && sourceId) {
      const student = students.find((s) => s.id === sourceId);
      if (student) {
        setFormData({
          ...formData,
          sourceType,
          sourceId,
          name: student.name,
          phone: student.whatsapp || formData.phone,
        });
      }
    } else {
      setFormData({
        ...formData,
        sourceType,
        sourceId: "",
      });
    }
  };

  const generateCode = () => {
    const namePart = formData.name.replace(/\s/g, "").substring(0, 3).toUpperCase();
    const randomPart = Math.floor(10 + Math.random() * 90);
    return `${namePart}${randomPart}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalCode = formData.code;
      if (!finalCode) {
        finalCode = generateCode();
      }

      const url = referrer
        ? `/api/admin/referrers/${referrer.id}`
        : "/api/admin/referrers";
      const method = referrer ? "PATCH" : "POST";

      const body: any = {
        name: formData.name,
        phone: formData.phone || null,
        phoneCountryCode: formData.phoneCountryCode,
        code: finalCode.toUpperCase(),
        commissionRate: formData.commissionRate || null,
        isActive: formData.isActive,
        country: formData.country || null,
        university: formData.university || null,
        academicYear: formData.academicYear || null,
        grade: formData.grade || null,
        importantNotes: formData.importantNotes || null,
        notes: formData.notes || null,
        sourceType: formData.sourceType !== "none" ? formData.sourceType : null,
        sourceId: formData.sourceId || null,
      };

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
        referrer ? "تم تحديث بيانات المندوب بنجاح" : "تم إضافة المندوب بنجاح"
      );
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsLoading(false);
    }
  };

  const formLink = `https://www.sheelhammy.com/contact-us?ref=${formData.code || "CODE"}`;
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {referrer ? "تعديل المندوب" : "إضافة مندوب جديد"}
          </DialogTitle>
          <DialogDescription>
            {referrer
              ? `تعديل بيانات المندوب ${referrer.name}`
              : "إضافة مندوب جديد"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <div>
              <Label>المصدر (اختياري)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={formData.sourceType}
                  onValueChange={(value) =>
                    handleSourceChange(value as "none" | "employee" | "student", formData.sourceId)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون مصدر</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="student">طالب</SelectItem>
                  </SelectContent>
                </Select>
                {formData.sourceType === "employee" && (
                  <Select
                    value={formData.sourceId}
                    onValueChange={(value) => handleSourceChange("employee", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {formData.sourceType === "student" && (
                  <Select
                    value={formData.sourceId}
                    onValueChange={(value) => handleSourceChange("student", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الطالب" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((stu) => (
                        <SelectItem key={stu.id} value={stu.id}>
                          {stu.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div>
              <Label>الاسم</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="اسم المندوب"
                required
              />
            </div>
            <div>
              <Label>الهاتف</Label>
              <div className="grid grid-cols-[150px_1fr] gap-2">
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
              </div>
            </div>
            <div>
              <Label>كود المندوب</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="amer01"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, code: generateCode() })}
                >
                  توليد تلقائي
                </Button>
              </div>
            </div>
            <div>
              <Label>نسبة العمولة (%)</Label>
              <Input
                type="number"
                value={formData.commissionRate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commissionRate: e.target.value ? Number(e.target.value) : null,
                  })
                }
                min={0}
                max={100}
                placeholder="10"
              />
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                نشط
              </Label>
            </div>
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
              <Label>الجامعة</Label>
              <Input
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
                placeholder="اسم الجامعة"
              />
            </div>
            <div>
              <Label>السنة الجامعية</Label>
              <Input
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
                placeholder="السنة الجامعية"
              />
            </div>
            <div>
              <Label>الصف الدراسي</Label>
              <Input
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                placeholder="الصف الدراسي"
              />
            </div>
            <div>
              <Label>الأشياء الهامة</Label>
              <Textarea
                value={formData.importantNotes}
                onChange={(e) =>
                  setFormData({ ...formData, importantNotes: e.target.value })
                }
                placeholder="ملاحظات هامة"
                rows={3}
              />
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="ملاحظات عامة"
                rows={3}
              />
            </div>
            {formData.code && (
              <div className="border-t pt-4 space-y-3">
                <h3 className="font-semibold">روابط المندوب</h3>
                <div>
                  <Label>رابط الفورم</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm break-all">
                      {formLink}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(formLink);
                        toast.success("تم نسخ الرابط");
                      }}
                    >
                      <Icon icon="solar:copy-bold" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
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
              {isLoading ? "جاري الحفظ..." : referrer ? "حفظ" : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
