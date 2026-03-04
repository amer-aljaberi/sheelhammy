"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { Order, getOrderColumns } from "./_components/OrderTable";
import { OrderForm } from "./_components/OrderForm";
import { MultiServiceOrderForm } from "./_components/MultiServiceOrderForm";
import { RevisionDialog } from "./_components/RevisionDialog";
import { OrderViewDialog } from "./_components/OrderViewDialog";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/common/Skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMultiServiceDialogOpen, setIsMultiServiceDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error: any) {
      const errorMessage =
        error.message || "حدث خطأ أثناء تحميل الطلبات";
      toast.error(errorMessage);
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/students");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/admin/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data.map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        isReferrer: emp.isReferrer || false,
        referrerCode: emp.referrerCode || null,
      })));
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStudents();
    fetchServices();
    fetchEmployees();
  }, []);

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleRequestRevision = (order: Order) => {
    setSelectedOrder(order);
    setIsRevisionDialogOpen(true);
  };

  const handleMarkCompleted = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to mark as completed");
      }

      toast.success("تم تحديث الطلب إلى مكتمل");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الطلب");
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete order");
      }

      toast.success("تم حذف الطلب بنجاح");
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حذف الطلب");
    }
  };

  const handleSuccess = () => {
    fetchOrders();
  };

  const exportToCSV = () => {
    try {
      if (orders.length === 0) {
        toast.error("لا توجد طلبات للتصدير");
        return;
      }

      // Convert orders to CSV
      const headers = [
        "رقم_الطلب",
        "اسم_الطالب",
        "اسم_الخدمة",
        "الحالة",
        "السعر_الإجمالي",
        "الخصم",
        "السعر_بعد_الخصم",
        "نوع_الدفع",
        "مدفوع",
        "متبقي",
        "الأولوية",
        "الدرجة",
        "اسم_المادة",
        "نوع_الطلب",
        "تاريخ_الإنشاء",
      ];

      const csvRows = [
        headers.join(","),
        ...orders.map((order) => {
          const orderAny = order as any;
          const row = [
            order.orderNumber || "",
            order.studentName || "",
            order.service || "",
            order.status === "PENDING" ? "قيد الانتظار" :
            order.status === "QUOTED" ? "بانتظار السعر" :
            order.status === "PAID" ? "مدفوع" :
            order.status === "ASSIGNED" ? "تم الإسناد" :
            order.status === "IN_PROGRESS" ? "قيد التنفيذ" :
            order.status === "DELIVERED" ? "تم التسليم" :
            order.status === "REVISION" ? "تعديل" :
            order.status === "COMPLETED" ? "مكتمل" :
            order.status === "OVERDUE" ? "متأخر" : order.status || "",
            order.totalPrice || 0,
            orderAny.discount || 0,
            (order.totalPrice || 0) - (orderAny.discount || 0),
            orderAny.paymentType === "cash" ? "كاش" : orderAny.paymentType === "installments" ? "أقساط" : "",
            orderAny.paidAmount || 0,
            orderAny.remainingAmount || 0,
            orderAny.priority || "",
            orderAny.grade || "",
            orderAny.subjectName || "",
            orderAny.orderType || "",
            order.createdAt ? (typeof order.createdAt === "string" ? order.createdAt.split("T")[0] : new Date(order.createdAt).toISOString().split("T")[0]) : "",
          ];
          return row
            .map((cell) => {
              const value = String(cell);
              return value.includes(",") ? `"${value}"` : value;
            })
            .join(",");
        }),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `الطلبات_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("تم تصدير الطلبات بنجاح");
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تصدير الطلبات");
      console.error("Error exporting CSV:", error);
    }
  };

  const columns = getOrderColumns(
    handleEdit,
    handleRequestRevision,
    handleMarkCompleted,
    handleView,
    handleDelete,
    router
  );

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader
          title="إدارة الطلبات"
          description="التحكم في دورة حياة الطلب"
        />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="إدارة الطلبات"
        description="التحكم في دورة حياة الطلب"
        actions={
          <>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              طلب واحد
            </Button>
            <Button onClick={() => setIsMultiServiceDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              طلبات متعددة
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={orders}
        searchKey="orderNumber"
        searchPlaceholder="البحث برقم الطلب أو اسم الطالب..."
        filterOptions={[
          {
            column: "status",
            title: "حالة الطلب",
            options: [
              { label: "قيد الانتظار", value: "PENDING" },
              { label: "بانتظار السعر", value: "QUOTED" },
              { label: "مدفوع", value: "PAID" },
              { label: "تم الإسناد", value: "ASSIGNED" },
              { label: "قيد التنفيذ", value: "IN_PROGRESS" },
              { label: "تم التسليم", value: "DELIVERED" },
              { label: "تعديل", value: "REVISION" },
              { label: "مكتمل", value: "COMPLETED" },
              { label: "متأخر", value: "OVERDUE" },
            ],
          },
        ]}
      />

      <OrderForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        students={students}
        services={services}
        employees={employees}
        onSuccess={handleSuccess}
      />

      <MultiServiceOrderForm
        open={isMultiServiceDialogOpen}
        onOpenChange={setIsMultiServiceDialogOpen}
        students={students}
        services={services}
        employees={employees}
        onSuccess={handleSuccess}
      />

      <OrderForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        order={selectedOrder}
        students={students}
        services={services}
        employees={employees}
        onSuccess={handleSuccess}
      />

      <RevisionDialog
        open={isRevisionDialogOpen}
        onOpenChange={setIsRevisionDialogOpen}
        order={selectedOrder}
        onSuccess={handleSuccess}
      />

      <OrderViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        order={selectedOrder}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToDelete(null)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
