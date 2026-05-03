"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminUser } from "@/app/context/AdminUserContext";

export default function AdminPage() {
  const { admin, loading } = useAdminUser();
  const router = useRouter();

  console.log("🔥 RENDER ADMIN PAGE:", { admin, loading });

  useEffect(() => {
    console.log("⚡ EFFECT:", { admin, loading });

    if (loading) {
      console.log("➡️ STILL LOADING, WAITING...");
      return;
    }

    if (!admin) {
      console.log("➡️ REDIRECT LOGIN");
      router.replace("/administrator/login");
    } else {
      console.log("➡️ REDIRECT MANAGE USER");
      router.replace("/administrator/ManageUser");
    }
  }, [admin, loading, router]);

  return <div>Đang chuyển hướng...</div>;
}
