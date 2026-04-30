"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentAdminService } from "@/app/features/admin/service";

interface Admin {
  user_id: number;
  username: string;
  email: string;
  role: string;
}

interface AdminUserContextType {
  admin: Admin | null;
  setAdmin: React.Dispatch<React.SetStateAction<Admin | null>>;
  loading: boolean;
  checkAdmin: () => Promise<void>;
}

const AdminUserContext = createContext<AdminUserContextType | undefined>(
  undefined,
);

export const AdminUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAdmin = async () => {
    try {
      const data = await getCurrentAdminService();
      setAdmin(data.admin);
    } catch (err) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  return (
    <AdminUserContext.Provider value={{ admin, setAdmin, loading, checkAdmin }}>
      {children}
    </AdminUserContext.Provider>
  );
};

export const useAdminUser = (): AdminUserContextType => {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error("useAdminUser phải được dùng trong AdminUserProvider");
  }
  return context;
};
