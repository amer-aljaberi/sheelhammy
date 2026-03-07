"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Referrer, getReferrerColumns } from "./_components/ReferrerTable";
import { ReferrerForm } from "./_components/ReferrerForm";
import { ReferrerPaymentForm } from "./_components/ReferrerPaymentForm";
import { ReferrerDeleteDialog } from "./_components/ReferrerDeleteDialog";
import { ReferralsDialog } from "./_components/ReferralsDialog";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/common/Skeletons";

export default function ReferrersPage() {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReferralsDialogOpen, setIsReferralsDialogOpen] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState<Referrer | null>(null);

  const fetchReferrers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/referrers");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch referrers");
      }
      const data = await response.json();
      setReferrers(data);
    } catch (error: any) {
      const errorMessage =
        error.message || "حدث خطأ أثناء تحميل المندوبين";
      toast.error(errorMessage);
      console.error("Error fetching referrers:", error);
      // Set empty array on error to prevent UI crash
      setReferrers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrers();
  }, []);

  const handleAdd = () => {
    setSelectedReferrer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (referrer: Referrer) => {
    setSelectedReferrer(referrer);
    setIsFormOpen(true);
  };

  const handlePayment = (referrer: Referrer) => {
    setSelectedReferrer(referrer);
    setIsPaymentFormOpen(true);
  };

  const handleReferrals = (referrer: Referrer) => {
    setSelectedReferrer(referrer);
    setIsReferralsDialogOpen(true);
  };

  const handleDelete = (referrer: Referrer) => {
    setSelectedReferrer(referrer);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReferrer) return;

    try {
      const response = await fetch(`/api/admin/referrers/${selectedReferrer.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ");
      }

      toast.success("تم حذف المندوب بنجاح");
      setIsDeleteDialogOpen(false);
      setSelectedReferrer(null);
      fetchReferrers();
    } catch (error: any) {
      toast.error(error.message || "فشل حذف المندوب");
    }
  };

  const handleSuccess = async () => {
    // Force refresh referrers to update pendingReferrals count
    await fetchReferrers();
  };

  const columns = getReferrerColumns(handleEdit, handleDelete, handlePayment, handleReferrals);

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader
          title="إدارة المندوبين"
          description="إضافة وإدارة المندوبين وروابطهم"
        />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="إدارة المندوبين"
        description="إضافة وإدارة المندوبين وروابطهم"
        actions={
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 ml-2" />
            مندوب جديد
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={referrers}
        searchKey="name"
        searchPlaceholder="البحث بالاسم أو الكود..."
        filterOptions={[
          {
            column: "isActive",
            title: "الحالة",
            options: [
              { label: "نشط", value: "true" },
              { label: "موقوف", value: "false" },
            ],
          },
          {
            column: "country",
            title: "الدولة",
            options: [
              { label: "الأردن", value: "الأردن" },
              { label: "السعودية", value: "السعودية" },
              { label: "مصر", value: "مصر" },
              { label: "الإمارات", value: "الإمارات" },
            ],
          },
        ]}
      />

      <ReferrerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        referrer={selectedReferrer}
        onSuccess={() => {
          setIsFormOpen(false);
          setSelectedReferrer(null);
          handleSuccess();
        }}
      />

      <ReferrerPaymentForm
        open={isPaymentFormOpen}
        onOpenChange={setIsPaymentFormOpen}
        referrer={selectedReferrer}
        onSuccess={() => {
          setIsPaymentFormOpen(false);
          setSelectedReferrer(null);
          handleSuccess();
        }}
      />

      <ReferrerDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        referrer={selectedReferrer}
        onConfirm={handleDeleteConfirm}
      />

      <ReferralsDialog
        open={isReferralsDialogOpen}
        onOpenChange={setIsReferralsDialogOpen}
        referrer={selectedReferrer}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
