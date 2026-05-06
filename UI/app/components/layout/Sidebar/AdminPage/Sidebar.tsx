"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/app/components/layout/Sidebar/AdminPage/Sidebar.css";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="sidebar">
      <nav>
        <Link
          href="/administrator/Statistics"
          className={pathname === "/administrator/Statistics" ? "active" : ""}
        >
          <i className="fa-solid fa-chart-line"></i> Statistics
        </Link>
        <Link
          href="/administrator/ManageUser"
          className={pathname === "/administrator/ManageUser" ? "active" : ""}
        >
          <i className="fa-solid fa-users"></i> Manage User
        </Link>
        <Link
          href="/administrator/ManageAdmin"
          className={pathname === "/administrator/ManageAdmin" ? "active" : ""}
        >
          <i className="fa-solid fa-user-shield"></i> Manage Admin
        </Link>
        <Link
          href="/administrator/ManageSong"
          className={pathname === "/administrator/ManageSong" ? "active" : ""}
        >
          <i className="fa-solid fa-list"></i> Manage Song
        </Link>
      </nav>
    </div>
  );
}
