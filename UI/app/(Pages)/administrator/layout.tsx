"use client";

import "@/app/styles/AdminPage/Admin.css";
import Header from "@/app/components/AdminPage/Header";
import { AdminUserProvider } from "@/app/context/AdminUserContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminUserProvider>
      <div className="main-page-admin">
        <Header />
        <div className="main_content">{children}</div>
      </div>
    </AdminUserProvider>
  );
}
