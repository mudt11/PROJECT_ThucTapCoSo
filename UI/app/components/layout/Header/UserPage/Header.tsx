"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/app/components/layout/Header/UserPage/Header.module.css";
import PopUp from "../../../ui/PopUp";
import SearchBarComponent from "../../../ui/SearchBar/SearchBarComponent";
import { useModal } from "@/app/context/ModalContext";
import { useUser } from "@/app/features/user/context/UserContext";
import { useLogout } from "../../../../features/auth/useLogout";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { openModal } = useModal();
  const { user, loading } = useUser();
  const { logout } = useLogout();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <Link href="/Home">
            <span className={styles.logoText}>BTM</span>
          </Link>
        </div>

        <SearchBarComponent />
      </div>

      <div className={styles.right}>
        <div className={styles.userArea}>
          {loading ? null : user ? (
            <div className={styles.userGreeting}>
              <button
                className={styles.profileBtn}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img
                  src="/images/Avatar/avt01.png"
                  alt="Avatar"
                  className={styles.avatar}
                />

                <div className={styles.userMeta}>
                  <span className={styles.username}>{user?.username}</span>
                  <span className={styles.plan}>Premium</span>
                </div>

                <i
                  className={`${styles.arrow} ${
                    showUserMenu ? styles.arrowActive : ""
                  }`}
                ></i>
              </button>

              {showUserMenu && (
                <PopUp
                  show={showUserMenu}
                  onClose={() => setShowUserMenu(false)}
                >
                  <div className={styles.userPopup}>
                    <button
                      className={styles.logoutBtn}
                      onClick={() => openModal("profile")}
                    >
                      Xem hồ sơ
                    </button>

                    <button
                      className={styles.logoutBtn}
                      onClick={() => openModal("change-password")}
                    >
                      Thay đổi mật khẩu
                    </button>

                    <button className={styles.logoutBtn} onClick={logout}>
                      Đăng xuất
                    </button>
                  </div>
                </PopUp>
              )}
            </div>
          ) : (
            <div className={styles.authBox}>
              <button
                className={styles.signIn}
                onClick={() => openModal("signin")}
              >
                Sign in
              </button>

              <button
                className={styles.register}
                onClick={() => openModal("register")}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
