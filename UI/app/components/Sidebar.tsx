"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/styles/Sidebar.module.css";

import Footer from "./Footer";

import { RiHome5Fill } from "react-icons/ri";
import { BsHeart } from "react-icons/bs";
import { PiPlaylist } from "react-icons/pi";
import { HiOutlineUser } from "react-icons/hi2";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className={styles.menu}>
      <nav className={styles.nav}>
        <Link
          href="/explore"
          className={`${styles.link} ${
            pathname === "/explore" ? styles.active : ""
          }`}
        >
          <RiHome5Fill className={styles.icon} /> Home
        </Link>

        <Link
          href="/library"
          className={`${styles.link} ${
            pathname.startsWith("/library") ? styles.active : ""
          }`}
        >
          <BsHeart className={styles.icon} /> Likes
        </Link>

        <Link
          href="/myplaylists"
          className={`${styles.link} ${
            pathname.startsWith("/myplaylists") ? styles.active : ""
          }`}
        >
          <PiPlaylist className={styles.icon} /> Playlist
        </Link>

        <Link
          href="#"
          className={`${styles.link} ${
            pathname.startsWith("/following") ? styles.active : ""
          }`}
        >
          <HiOutlineUser className={styles.icon} /> Following
        </Link>
      </nav>

      <Footer />
    </div>
  );
}
