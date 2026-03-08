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
import { Student } from "./StudentTable";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { ARAB_COUNTRIES, ACADEMIC_LEVELS, getWhatsAppLink } from "@/lib/countries";

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSuccess: () => void;
}

export function StudentForm({
  open,
  onOpenChange,
  student,
  onSuccess,
}: StudentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    phoneCountryCode: "+962",
    email: "",
    country: "",
    academicLevel: "",
    specialization: "",
    university: "",
    notes: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        whatsapp: student.whatsapp || "",
        phoneCountryCode: (student as any).phoneCountryCode || "+962",
        email: student.email || "",
        country: (student as any).country || "",
        academicLevel: (student as any).academicLevel || "",
        specialization: (student as any).specialization || "",
        university: (student as any).university || "",
        notes: student.notes || "",
      });
    } else {
      setFormData({
        name: "",
        whatsapp: "",
        phoneCountryCode: "+962",
        email: "",
        country: "",
        academicLevel: "",
        specialization: "",
        university: "",
        notes: "",
      });
    }
  }, [student, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = student
        ? `/api/admin/students/${student.id}`
        : "/api/admin/students";
      const method = student ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formData.whatsapp || null,
          phoneCountryCode: formData.phoneCountryCode,
          email: formData.email || null,
          country: formData.country || null,
          academicLevel: formData.academicLevel || null,
          specialization: formData.specialization || null,
          university: formData.university || null,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ");
      }

      toast.success(
        student ? "تم تحديث بيانات الطالب بنجاح" : "تم إضافة الطالب بنجاح"
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
      <DialogContent className="max-h-[90vh] flex flex-col" dir="rtl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {student ? "تعديل الطالب" : "إضافة طالب جديد"}
          </DialogTitle>
          <DialogDescription>
            {student
              ? `تعديل بيانات الطالب ${student.name}`
              : "إضافة طالب جديد إلى النظام"}
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
                placeholder="اسم الطالب"
                required
              />
            </div>
            <div>
              <Label>رقم الواتساب</Label>
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
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  placeholder="7XXXXXXXX"
                  required
                />
                {formData.whatsapp && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const link = getWhatsAppLink(
                        formData.phoneCountryCode,
                        formData.whatsapp
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
            <div>
              <Label>البريد الإلكتروني (اختياري)</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@example.com"
              />
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
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المستوى الدراسي</Label>
              <Select
                value={formData.academicLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, academicLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المستوى الدراسي" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
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
              <Label>اسم الجامعة</Label>
              <Input
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
                placeholder="اسم الجامعة"
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
                rows={3}
              />
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
              {isLoading ? "جاري الحفظ..." : student ? "حفظ" : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
