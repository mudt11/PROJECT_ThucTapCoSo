"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import "@/app/styles/auth.css";
import { useAdminUser } from "@/app/context/AdminUserContext";
import { loginAdminService } from "@/app/features/admin/service";

export default function SignInAdminPage() {
  const router = useRouter();
  const { checkAdmin } = useAdminUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginAdminService(username, password);

      alert(data.message);
      await checkAdmin();
      router.replace("/administrator/ManageUser");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Đăng nhập thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="auth-container sign-in-page">
      <header>
        <div className="logo">
          <a>
            <img src="/images/Logo/logo.png" alt="logo" />
          </a>
        </div>
      </header>

      <h1>Welcome, administrator</h1>
      <form onSubmit={handleSignIn}>
        <label htmlFor="email" className="form_label">
          Username
        </label>
        <input
          id="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="password" className="form_label">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="options">
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
          <label style={{ fontSize: "13px" }}>Remember me</label>
        </div>
        <button type="submit" className="submit">
          Sign In
        </button>
      </form>
      <div className="fogot-password">
        <a href="#">Forgot your password?</a>
      </div>
    </div>
  );
}
