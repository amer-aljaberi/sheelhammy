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
import { PortfolioItem } from "./PortfolioTable";
import { toast } from "sonner";
import { FileUploader } from "@/components/common/FileUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACADEMIC_LEVELS, ARAB_COUNTRIES } from "@/lib/countries";

interface PortfolioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioItem?: PortfolioItem | null;
  onSuccess: () => void;
}

export function PortfolioForm({
  open,
  onOpenChange,
  portfolioItem,
  onSuccess,
}: PortfolioFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
    file: "",
    academicLevel: "",
    date: "",
  });

  useEffect(() => {
    if (open) {
      if (portfolioItem) {
        const item = portfolioItem as any;
        setFormData({
          title: portfolioItem.title || "",
          description: portfolioItem.description || "",
          image: portfolioItem.image || "",
          link: portfolioItem.link || "",
          file: item.file || "",
          academicLevel: item.academicLevel || "",
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
        });
        // Parse countries if it's a JSON string
        let countriesArray: string[] = [];
        if (item.countries) {
          if (Array.isArray(item.countries)) {
            countriesArray = item.countries;
          } else if (typeof item.countries === 'string') {
            try {
              countriesArray = JSON.parse(item.countries);
            } catch {
              countriesArray = [];
            }
          }
        }
        setCountries(countriesArray);
      } else {
        setFormData({
          title: "",
          description: "",
          image: "",
          link: "",
          file: "",
          academicLevel: "",
          date: "",
        });
        setCountries([]);
      }
    }
  }, [portfolioItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = portfolioItem
        ? `/api/admin/portfolio/${portfolioItem.id}`
        : "/api/admin/portfolio";
      const method = portfolioItem ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description?.trim() || null,
          image: formData.image?.trim() || null,
          link: formData.link?.trim() || null,
          file: formData.file?.trim() || null,
          academicLevel: formData.academicLevel || null,
          date: formData.date || null,
          countries: countries.length > 0 ? countries : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ");
      }

      toast.success(
        portfolioItem
          ? "تم تحديث النموذج بنجاح"
          : "تم إضافة النموذج بنجاح"
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col" dir="rtl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {portfolioItem ? "تعديل النموذج" : "إضافة نموذج جديد"}
          </DialogTitle>
          <DialogDescription>
            {portfolioItem
              ? `تعديل بيانات النموذج ${portfolioItem.title}`
              : "إضافة نموذج عمل سابق"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <div>
              <Label>العنوان</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="عنوان النموذج"
                required
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="وصف النموذج..."
                rows={4}
              />
            </div>
            <div>
              <FileUploader
                value={formData.image || undefined}
                onChange={(url) => {
                  const imageUrl = Array.isArray(url) ? url[0] : url;
                  setFormData({ ...formData, image: imageUrl || "" });
                }}
                accept="image/*"
                multiple={false}
                maxSize={5}
                label="صورة النموذج (اختياري)"
                description="يمكنك رفع صورة للنموذج (حد أقصى 5 ميجابايت)"
                disabled={isLoading}
                type="image"
              />
              {formData.image && (
                <p className="text-xs text-gray-500 mt-1">
                  الصورة الحالية: {formData.image}
                </p>
              )}
            </div>
            <div>
              <Label>رابط خارجي (اختياري)</Label>
              <Input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label>تصنيف المرحلة الدراسية</Label>
              <Select
                value={formData.academicLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, academicLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المرحلة الدراسية" />
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
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div>
              <FileUploader
                value={formData.file || undefined}
                onChange={(url) => {
                  const fileUrl = Array.isArray(url) ? url[0] : url;
                  setFormData({ ...formData, file: fileUrl || "" });
                }}
                accept="*/*"
                multiple={false}
                maxSize={10}
                label="رفع ملف (اختياري)"
                description="يمكنك رفع ملف للنموذج (حد أقصى 10 ميجابايت)"
                disabled={isLoading}
                type="file"
              />
              {formData.file && (
                <p className="text-xs text-gray-500 mt-1">
                  الملف الحالي: {formData.file}
                </p>
              )}
            </div>
            <div>
              <Label>الدول المتاحة (اختياري)</Label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {ARAB_COUNTRIES.map((country) => (
                    <div key={country.code} className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id={`portfolio-country-${country.code}`}
                        checked={countries.includes(country.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCountries([...countries, country.code]);
                          } else {
                            setCountries(countries.filter((c) => c !== country.code));
                          }
                        }}
                        className="rounded"
                        disabled={isLoading}
                      />
                      <Label htmlFor={`portfolio-country-${country.code}`} className="cursor-pointer text-sm">
                        {country.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {countries.length > 0 && (
                  <p className="text-xs text-gray-500">
                    تم اختيار {countries.length} دولة
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : portfolioItem ? "حفظ" : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
