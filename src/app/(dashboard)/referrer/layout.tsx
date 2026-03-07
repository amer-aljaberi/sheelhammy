import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { DashboardSidebar } from "../dashboard/_components/DashboardSidebar";
import { DashboardHeader } from "../dashboard/_components/DashboardHeader";

export default async function ReferrerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session?.user.role as "ADMIN" | "EMPLOYEE";

  if (role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden lg:mr-64">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
