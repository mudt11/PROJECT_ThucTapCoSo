"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Banner from "@/app/components/Banner";
import FeaturedPlaylists from "@/app/components/FeaturedPlaylists/FeaturedPlaylists";
import type { Playlist, DetailViewData } from "@/app/types/music";

import DetailView from "@/app/components/FeaturedPlaylists/DetailView";

export default function ExplorePage() {
  const [selected, setSelected] = useState<DetailViewData | null>(null);

  /* DETAIL VIEW */
  if (selected) {
    return <DetailView data={selected} onBack={() => setSelected(null)} />;
  }

  /* LIST VIEW */
  return (
    <div id="home" className="home-menu">
      <h2 className="main-title">Discovery</h2>

      {/* <Banner /> */}

      <FeaturedPlaylists onSelect={setSelected} />
    </div>
  );
}
