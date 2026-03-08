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
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Student } from "./StudentTable";

interface Order {
  id: string;
  orderNumber: string;
  service: {
    title: string;
  };
  status: string;
  createdAt: string;
}

interface StudentOrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function StudentOrdersDialog({
  open,
  onOpenChange,
  student,
}: StudentOrdersDialogProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && student) {
      fetchStudentOrders();
    }
  }, [open, student]);

  const fetchStudentOrders = async () => {
    if (!student) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/students/${student.id}`);
      if (!response.ok) throw new Error("Failed to fetch student orders");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error: any) {
      toast.error("حدث خطأ أثناء تحميل طلبات الطالب");
      console.error("Error fetching student orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col" dir="rtl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>سجل طلبات {student.name}</DialogTitle>
          <DialogDescription>عرض جميع طلبات الطالب</DialogDescription>
        </DialogHeader>
        <div className="py-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">جاري التحميل...</p>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              لا توجد طلبات لهذا الطالب
            </p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.service.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.status} />
                    <span className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
