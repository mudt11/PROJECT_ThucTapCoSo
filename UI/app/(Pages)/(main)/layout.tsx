"use client";

import "@/app/styles/globals.css";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import Player from "@/app/components/MusicContainer/Player";
import { useEffect } from "react";
import { useModal } from "@/app/context/ModalContext";
import { useUser } from "@/app/context/UserContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const { openModal } = useModal();

  useEffect(() => {
    if (loading) return;
    if (!user) openModal("signin");
  }, [user, loading]);

  return (
    <>
      <Sidebar />
      <div className="main">
        <Header />
        <div id="content" className="content">
          {children}
        </div>
      </div>
      <Player />
    </>
  );
}
