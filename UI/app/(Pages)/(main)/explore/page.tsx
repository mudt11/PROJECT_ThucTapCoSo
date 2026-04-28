"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Banner from "@/app/components/Banner";
import FeaturedPlaylists from "@/app/components/FeaturedPlaylists/FeaturedPlaylists";
import type { Playlist, DetailViewData } from "@/app/types/music";

import DetailView from "@/app/components/FeaturedPlaylists/DetailView";

export default function ExplorePage() {
  const [greeting, setGreeting] = useState("");
  const [selected, setSelected] = useState<DetailViewData | null>(null);

  const router = useRouter();

  // const handleClick = async () => {
  // setLoading(true);
  // Cho hiệu ứng có thời gian hiển thị nhẹ
  // await new Promise((resolve) => setTimeout(resolve, 600));
  // router.push("/explore");
  // };

  // useEffect(() => {
  //   function update() {
  //     const hour = new Date().getHours();
  //     const text =
  //       hour >= 5 && hour < 11
  //         ? "Chào buổi sáng!"
  //         : hour >= 11 && hour < 14
  //           ? "Chào buổi trưa!"
  //           : hour >= 14 && hour < 18
  //             ? "Chào buổi chiều!"
  //             : hour >= 18 && hour < 23
  //               ? "Chào buổi tối!"
  //               : "Chúc bạn ngủ ngon";
  //     setGreeting(text);
  //   }
  //   update();
  //   const t = setInterval(update, 60000);
  //   return () => clearInterval(t);
  // }, []);

  /* DETAIL VIEW */
  if (selected) {
    return <DetailView data={selected} onBack={() => setSelected(null)} />;
  }

  /* LIST VIEW */
  return (
    <div id="home" className="home-menu">
      {/* <div id="greeting" className="greeting-text">
        {greeting}
      </div> */}
      <h2 className="main-title">Discovery</h2>

      {/* <Banner /> */}

      <FeaturedPlaylists onSelect={setSelected} />
    </div>
  );
}
