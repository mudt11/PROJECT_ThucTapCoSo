"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "../styles/SideBar.css";

import { RiHome5Fill } from "react-icons/ri";
import { BsHeart } from "react-icons/bs";
import { PiPlaylist } from "react-icons/pi";
import { HiOutlineUser } from "react-icons/hi2";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="menu">
      <nav>
        <Link
          href="/explore"
          className={pathname === "/explore" ? "active" : ""}
        >
          <RiHome5Fill className="icon" /> Home
        </Link>
        <Link
          href="/library"
          className={pathname.startsWith("/library") ? "active" : ""}
        >
          <BsHeart className="icon" /> Likes
        </Link>
        <Link
          href="/myplaylists"
          className={pathname.startsWith("/myplaylists") ? "active" : ""}
        >
          <PiPlaylist className="icon" /> Playlist
        </Link>

        <Link
          href="#"
          className={pathname.startsWith("/following") ? "active" : ""}
        >
          <HiOutlineUser className="icon" /> Following
        </Link>
      </nav>
    </div>
  );
}
