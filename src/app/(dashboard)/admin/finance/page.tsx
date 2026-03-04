"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Download, DollarSign, CreditCard, Receipt } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/common/StatCard";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/common/Skeletons";
import { Payment, getPaymentColumns } from "./_components/PaymentTable";
import { Expense, getExpenseColumns } from "./_components/ExpenseTable";
import { Transfer, getTransferColumns } from "./_components/TransferTable";
import { EmployeeService, getEmployeeServiceColumns } from "./_components/EmployeeServiceTable";
import { PaymentForm } from "./_components/PaymentForm";
import { ExpenseForm } from "./_components/ExpenseForm";
import { ExpenseModel } from "./_components/ExpenseModel";
import { TransferForm } from "./_components/TransferForm";
import { TransferReceiptDialog } from "./_components/TransferReceiptDialog";
import { TransferDeleteDialog } from "./_components/TransferDeleteDialog";

type Employee = {
  id: string;
  name: string;
};

type Order = {
  id: string;
  orderNumber: string;
  studentName: string;
  totalPrice: number;
  isPaid: boolean;
  paymentType?: string;
  paymentInstallments?: number[];
  discount?: number;
  paidAmount?: number;
};

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [employeeServices, setEmployeeServices] = useState<EmployeeService[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payments");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalTransfers: 0,
    netProfit: 0,
  });

  // Dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false);
  const [isDeleteExpenseDialogOpen, setIsDeleteExpenseDialogOpen] = useState(false);
  const [isDeleteTransferDialogOpen, setIsDeleteTransferDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [transferToDelete, setTransferToDelete] = useState<Transfer | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/finance/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/finance/payments");
      if (!response.ok) throw new Error("Failed to fetch payments");
      const data = await response.json();
      setPayments(data);
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحميل المدفوعات");
      console.error("Error fetching payments:", error);
      setPayments([]);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/admin/expenses");
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحميل المصاريف");
      console.error("Error fetching expenses:", error);
      setExpenses([]);
    }
  };

  const fetchTransfers = async () => {
    try {
      const response = await fetch("/api/admin/transfers");
      if (!response.ok) throw new Error("Failed to fetch transfers");
      const data = await response.json();
      setTransfers(data);
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحميل التحويلات");
      console.error("Error fetching transfers:", error);
      setTransfers([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/admin/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data.map((emp: any) => ({ id: emp.id, name: emp.name })));
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchEmployeeServices = async () => {
    try {
      const response = await fetch("/api/admin/finance/employee-services");
      if (!response.ok) throw new Error("Failed to fetch employee services");
      const data = await response.json();
      setEmployeeServices(data);
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحميل بيانات الموظفين");
      console.error("Error fetching employee services:", error);
      setEmployeeServices([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchStats(),
        fetchPayments(),
        fetchExpenses(),
        fetchTransfers(),
        fetchEmployeeServices(),
        fetchOrders(),
        fetchEmployees(),
      ]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleSuccess = () => {
    fetchStats();
    fetchPayments();
    fetchExpenses();
    fetchTransfers();
    fetchEmployeeServices();
    fetchOrders(); // إعادة جلب بيانات الطلبات بعد تسجيل الدفع
  };

  const handleMarkAsPaid = (paymentId: string) => {
    // Open payment form with selected order
    const order = orders.find((o) => o.id === paymentId);
    if (order) {
      setOrders(orders.map((o) => (o.id === paymentId ? { ...o, ...order } : o)));
      setIsPaymentDialogOpen(true);
      // Set the order in PaymentForm will be handled by the form itself
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditExpenseDialogOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteExpenseDialogOpen(true);
  };

  const handleViewReceipt = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setIsReceiptDialogOpen(true);
  };

  const handleEditTransfer = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setIsTransferDialogOpen(true);
  };

  const handleDeleteTransfer = (transfer: Transfer) => {
    setTransferToDelete(transfer);
    setIsDeleteTransferDialogOpen(true);
  };

  const exportToCSV = () => {
    try {
      const allData: any[] = [];
      
      // Add payments
      payments.forEach((payment) => {
        allData.push({
          النوع: "دفع",
          رقم_الطلب: payment.orderNumber || "",
          اسم_الطالب: payment.studentName || "",
          المبلغ: payment.totalAmount || 0,
          المدفوع: payment.paidAmount || 0,
          المتبقي: payment.remainingAmount || 0,
          نوع_الدفع: payment.paymentType === "cash" ? "كاش" : payment.paymentType === "installments" ? "أقساط" : "",
          الحالة: payment.isPaid ? "مدفوع" : "غير مدفوع",
        });
      });

      // Add expenses
      expenses.forEach((expense) => {
        allData.push({
          النوع: "مصروف",
          العنوان: expense.title || "",
          الفئة: expense.category || "",
          المبلغ: expense.amount || 0,
          التاريخ: typeof expense.date === "string" ? expense.date : expense.date.toISOString().split("T")[0],
          الوصف: expense.description || "",
        });
      });

      // Add transfers
      transfers.forEach((transfer) => {
        allData.push({
          النوع: "تحويل",
          اسم_الموظف: transfer.employeeName || "",
          المبلغ: transfer.amount || 0,
          التاريخ: transfer.createdAt ? (typeof transfer.createdAt === "string" ? transfer.createdAt.split("T")[0] : new Date(transfer.createdAt).toISOString().split("T")[0]) : "",
          الحالة: transfer.status === "COMPLETED" ? "مكتمل" : "قيد الانتظار",
        });
      });

      if (allData.length === 0) {
        toast.error("لا توجد بيانات للتصدير");
        return;
      }

      // Convert to CSV
      const headers = Object.keys(allData[0]);
      const csvRows = [
        headers.join(","),
        ...allData.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              return typeof value === "string" && value.includes(",")
                ? `"${value}"`
                : value;
            })
            .join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `تقرير_مالي_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("تم تصدير التقرير بنجاح");
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تصدير التقرير");
      console.error("Error exporting CSV:", error);
    }
  };

  const paymentColumns = getPaymentColumns(handleMarkAsPaid);
  const expenseColumns = getExpenseColumns(handleEditExpense, handleDeleteExpense);
  const transferColumns = getTransferColumns(
    handleViewReceipt,
    handleEditTransfer,
    handleDeleteTransfer
  );
  const employeeServiceColumns = getEmployeeServiceColumns();

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader
          title="النظام المالي"
          description="إدارة المدفوعات والمصاريف وتحويلات الموظفين"
        />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="النظام المالي"
        description="إدارة المدفوعات والمصاريف وتحويلات الموظفين"
        actions={
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 ml-2" />
            تصدير تقرير
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4" >
        <StatCard
          title="إجمالي المقبوضات"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="إجمالي المصاريف"
          value={formatCurrency(stats.totalExpenses)}
          icon={CreditCard}
          variant="warning"
        />
        <StatCard
          title="تحويلات الموظفين"
          value={formatCurrency(stats.totalTransfers)}
          icon={Receipt}
          variant="info"
        />
        <StatCard
          title="صافي الربح"
          value={formatCurrency(stats.netProfit)}
          icon={DollarSign}
          variant="success"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="expenses">المصاريف</TabsTrigger>
          <TabsTrigger value="transfers">تحويلات الموظفين</TabsTrigger>
          <TabsTrigger value="employee-services">الموظفين والخدمات</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsPaymentDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              تسجيل دفع
            </Button>
          </div>
          <DataTable
            columns={paymentColumns}
            data={payments}
            searchKey="orderNumber"
            searchPlaceholder="البحث برقم الطلب..."
            filterOptions={[
              {
                column: "isPaid",
                title: "حالة الدفع",
                options: [
                  { label: "مدفوع", value: "true" },
                  { label: "غير مدفوع", value: "false" },
                ],
              },
              {
                column: "paymentType",
                title: "نوع الدفع",
                options: [
                  { label: "كاش", value: "cash" },
                  { label: "أقساط", value: "installments" },
                ],
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsExpenseDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              مصروف جديد
            </Button>
          </div>
          <DataTable
            columns={expenseColumns}
            data={expenses}
            searchKey="title"
            searchPlaceholder="البحث بالمصروف..."
          />
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsTransferDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              تحويل جديد
            </Button>
          </div>
          <DataTable
            columns={transferColumns}
            data={transfers}
            searchKey="employeeName"
            searchPlaceholder="البحث باسم الموظف..."
            filterOptions={[
              {
                column: "status",
                title: "الحالة",
                options: [
                  { label: "مكتمل", value: "COMPLETED" },
                  { label: "قيد الانتظار", value: "PENDING" },
                ],
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="employee-services" className="space-y-4">
          <DataTable
            columns={employeeServiceColumns}
            data={employeeServices}
            searchKey="employeeName"
            searchPlaceholder="البحث باسم الموظف أو الخدمة..."
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PaymentForm
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        orders={orders}
        onSuccess={handleSuccess}
      />

      <ExpenseForm
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        onSuccess={handleSuccess}
      />

      <ExpenseForm
        open={isEditExpenseDialogOpen}
        onOpenChange={setIsEditExpenseDialogOpen}
        expense={selectedExpense}
        onSuccess={handleSuccess}
      />

      <ExpenseModel
        open={isDeleteExpenseDialogOpen}
        onOpenChange={setIsDeleteExpenseDialogOpen}
        expense={selectedExpense}
        onSuccess={handleSuccess}
      />

      <TransferForm
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        employees={employees}
        onSuccess={handleSuccess}
      />

      <TransferReceiptDialog
        open={isReceiptDialogOpen}
        onOpenChange={setIsReceiptDialogOpen}
        transfer={selectedTransfer}
      />

      <TransferDeleteDialog
        open={isDeleteTransferDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteTransferDialogOpen(open);
          if (!open) {
            setTransferToDelete(null);
          }
        }}
        transfer={transferToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
