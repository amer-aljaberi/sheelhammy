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
import { FileUploader } from "@/components/common/FileUploader";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

type Employee = {
  id: string;
  name: string;
};

type Order = {
  id: string;
  orderNumber: string;
  service: string;
  employeeProfit: number;
};

interface TransferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  transfer?: Transfer | null;
  onSuccess: () => void;
}

type Transfer = {
  id: string;
  employeeId: string;
  orderId?: string | null;
  amount: number;
  description?: string | null;
  receiptImage?: string | null;
};

export function TransferForm({
  open,
  onOpenChange,
  employees,
  transfer,
  onSuccess,
}: TransferFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [employeeOrders, setEmployeeOrders] = useState<Order[]>([]);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [totalTransferred, setTotalTransferred] = useState<number>(0);
  const [remainingProfit, setRemainingProfit] = useState<number>(0);
  const [formData, setFormData] = useState({
    employeeId: "",
    orderId: "",
    amount: "",
    receiptImage: "",
    description: "",
  });

  useEffect(() => {
    if (open && transfer) {
      fetchTransferData();
    } else if (open && !transfer) {
      setFormData({
        employeeId: "",
        orderId: "",
        amount: "",
        receiptImage: "",
        description: "",
      });
      setEmployeeOrders([]);
      setTotalProfit(0);
      setTotalTransferred(0);
      setRemainingProfit(0);
    }
  }, [open, transfer]);

  useEffect(() => {
    if (formData.employeeId) {
      fetchEmployeeOrders();
      calculateEmployeeStats();
    } else {
      setEmployeeOrders([]);
      setTotalProfit(0);
      setTotalTransferred(0);
      setRemainingProfit(0);
    }
  }, [formData.employeeId]);

  const fetchTransferData = async () => {
    if (!transfer) return;
    setIsLoadingData(true);
    try {
      const response = await fetch(`/api/admin/transfers/${transfer.id}`);
      if (!response.ok) throw new Error("Failed to fetch transfer");
      const data = await response.json();
      
      setFormData({
        employeeId: data.employeeId || "",
        orderId: data.orderId || "",
        amount: data.amount?.toString() || "",
        receiptImage: data.receiptImage || "",
        description: data.description || "",
      });
      
      if (data.employeeId) {
        await fetchEmployeeOrders(data.employeeId);
        await calculateEmployeeStats(data.employeeId);
      }
    } catch (error) {
      console.error("Error fetching transfer data:", error);
      toast.error("فشل تحميل بيانات التحويل");
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchEmployeeOrders = async (employeeId?: string) => {
    const empId = employeeId || formData.employeeId;
    if (!empId) return;
    
    try {
      const response = await fetch(`/api/admin/orders?employeeId=${empId}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      
      // Filter only completed orders with profit
      const completedOrders = data.filter(
        (order: any) => order.status === "COMPLETED" && order.employeeProfit > 0
      );
      setEmployeeOrders(completedOrders);
    } catch (error) {
      console.error("Error fetching employee orders:", error);
    }
  };

  const calculateEmployeeStats = async (employeeId?: string) => {
    const empId = employeeId || formData.employeeId;
    if (!empId) return;
    
    try {
      // Get total profit from completed orders
      const ordersResponse = await fetch(`/api/admin/orders?employeeId=${empId}`);
      if (!ordersResponse.ok) return;
      const orders = await ordersResponse.json();
      
      const total = orders
        .filter((o: any) => o.status === "COMPLETED")
        .reduce((sum: number, o: any) => sum + (o.employeeProfit || 0), 0);
      setTotalProfit(total);
      
      // Get total transferred (filter by employeeId on client side)
      const transfersResponse = await fetch(`/api/admin/transfers`);
      if (!transfersResponse.ok) return;
      const allTransfers = await transfersResponse.json();
      
      const transferred = allTransfers
        .filter((t: any) => t.employeeId === empId && t.status === "COMPLETED")
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      setTotalTransferred(transferred);
      
      // Calculate remaining
      const remaining = total - transferred;
      setRemainingProfit(remaining);
      
      // Auto-fill amount with remaining if creating new transfer
      if (!transfer && remaining > 0) {
        setFormData((prev) => ({
          ...prev,
          amount: remaining.toString(),
        }));
      }
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.amount) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    setIsLoading(true);

    try {
      const url = transfer 
        ? `/api/admin/transfers/${transfer.id}`
        : "/api/admin/transfers";
      const method = transfer ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          orderId: formData.orderId || null,
          amount: amount,
          receiptImage: formData.receiptImage || null,
          description: formData.description || null,
          status: "COMPLETED",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "حدث خطأ");
      }

      toast.success(transfer ? "تم تحديث التحويل بنجاح" : "تم تسجيل التحويل بنجاح");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تسجيل التحويل");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col" dir="rtl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {transfer ? "تعديل تحويل" : "تسجيل تحويل للموظف"}
          </DialogTitle>
          <DialogDescription>
            {transfer 
              ? "تعديل تفاصيل التحويل"
              : "تسجيل عملية تحويل أرباح لموظف"}
          </DialogDescription>
        </DialogHeader>
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-gray-500">جاري تحميل البيانات...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="space-y-4 py-4 overflow-y-auto flex-1">
              <div>
                <Label>الموظف</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employeeId: value, orderId: "" })
                  }
                  required
                  disabled={!!transfer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employee Stats */}
              {formData.employeeId && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">إجمالي الربح:</span>
                      <span className="font-semibold mr-2 text-blue-600">
                        {totalProfit.toFixed(2)} د.أ
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">المحول:</span>
                      <span className="font-semibold mr-2 text-green-600">
                        {totalTransferred.toFixed(2)} د.أ
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">المتبقي:</span>
                      <span className="font-semibold mr-2 text-red-600">
                        {remainingProfit.toFixed(2)} د.أ
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label>الطلب المرتبط (اختياري)</Label>
                <Select
                  value={formData.orderId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, orderId: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطلب (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">لا يوجد طلب مرتبط</SelectItem>
                    {employeeOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.orderNumber} - {order.service} (ربح: {order.employeeProfit.toFixed(2)} د.أ)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  يمكنك ربط التحويل بطلب محدد أو تركه فارغاً
                </p>
              </div>

              <div>
                <Label>المبلغ</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                  step="0.01"
                />
                {formData.employeeId && remainingProfit > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    المتبقي: {remainingProfit.toFixed(2)} د.أ
                  </p>
                )}
              </div>

              <div>
                <Label>الوصف (اختياري)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="وصف التحويل..."
                  rows={3}
                />
              </div>
              <div>
                <Label>صورة إثبات التحويل (اختياري)</Label>
                <FileUploader
                  value={formData.receiptImage || undefined}
                  onChange={(url) =>
                    setFormData({
                      ...formData,
                      receiptImage: typeof url === "string" ? url : url?.[0] || "",
                    })
                  }
                  accept="image/*"
                  multiple={false}
                  maxFiles={1}
                  maxSize={10}
                  label="رفع صورة إثبات التحويل"
                  description="يمكنك رفع صورة لإثبات التحويل (PNG, JPG, GIF - حد أقصى 10MB)"
                  type="image"
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
                {isLoading ? "جاري الحفظ..." : transfer ? "حفظ" : "تسجيل"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
