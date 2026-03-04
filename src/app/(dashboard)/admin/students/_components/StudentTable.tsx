"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export type Student = {
  id: string;
  name: string;
  whatsapp: string | null;
  phoneCountryCode?: string | null;
  email: string | null;
  country?: string | null;
  academicLevel?: string | null;
  specialization?: string | null;
  university?: string | null;
  notes: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
};

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onViewOrders: (student: Student) => void;
  onView: (student: Student) => void;
  onDelete: (studentId: string) => void;
}

export function getStudentColumns(
  onEdit: (student: Student) => void,
  onViewOrders: (student: Student) => void,
  onView: (student: Student) => void,
  onDelete: (studentId: string) => void
): ColumnDef<Student>[] {
  return [
    {
      accessorKey: "name",
      header: "الاسم",
    },
    {
      accessorKey: "whatsapp",
      header: "واتساب",
      cell: ({ row }) => {
        const student = row.original;
        const phone = student.whatsapp;
        if (!phone) return "-";
        const code = student.phoneCountryCode || "+962";
        const fullPhone = `${code} ${phone}`;
        const whatsappLink = `https://wa.me/${code.replace(/\D/g, "")}${phone.replace(/\D/g, "")}`;
        return (
          <div className="flex items-center gap-2">
            <span>{fullPhone}</span>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700"
              title="فتح واتساب"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.652a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "البريد الإلكتروني",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "country",
      header: "الدولة",
      cell: ({ row }) => row.original.country || "-",
    },
    {
      accessorKey: "academicLevel",
      header: "المستوى الدراسي",
      cell: ({ row }) => {
        const level = row.original.academicLevel;
        if (!level) return "-";
        const levelMap: Record<string, string> = {
          school: "مدرسة",
          diploma: "دبلوم",
          bachelor: "بكالوريوس",
          master: "ماجستير",
          phd: "دكتوراه",
        };
        return levelMap[level] || level;
      },
    },
    {
      accessorKey: "specialization",
      header: "التخصص",
      cell: ({ row }) => row.original.specialization || "-",
    },
    {
      accessorKey: "university",
      header: "الجامعة",
      cell: ({ row }) => row.original.university || "-",
    },
    {
      accessorKey: "totalOrders",
      header: "عدد الطلبات",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.totalOrders}</span>
      ),
    },
    {
      accessorKey: "totalSpent",
      header: "إجمالي الإنفاق",
      cell: ({ row }) =>
        `${row.original.totalSpent.toLocaleString()} د.أ`,
    },
    {
      accessorKey: "lastOrderDate",
      header: "آخر طلب",
      cell: ({ row }) =>
        row.original.lastOrderDate
          ? formatDate(row.original.lastOrderDate)
          : "-",
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = `/admin/students/${student.id}/orders`}
              title="عرض جميع الطلبات"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewOrders(student)}
              title="عرض الطلبات"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(student)}
              title="تعديل"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(student.id)}
              title="حذف"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
