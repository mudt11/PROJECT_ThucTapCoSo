"use client";

import Header from "@/app/components/AdminPage/Header";
import { AdminUserProvider } from "@/app/context/AdminUserContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminUserProvider>
      <Header />
      <div className="main_content">{children}</div>
    </AdminUserProvider>
  );
}
