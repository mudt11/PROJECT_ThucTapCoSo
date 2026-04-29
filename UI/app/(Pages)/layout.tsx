"use client";

import { UserProvider } from "@/app/context/UserContext";
import { ModalProvider } from "@/app/context/ModalContext";
import { PlayerProvider } from "@/app/context/PlayerContext";
import { LikeProvider } from "@/app/context/LikeContext";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ModalProvider>
        <PlayerProvider>
          <LikeProvider>{children}</LikeProvider>
        </PlayerProvider>
      </ModalProvider>
    </UserProvider>
  );
}
