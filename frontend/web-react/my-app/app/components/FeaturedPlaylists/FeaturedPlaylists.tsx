"use client";

import { useState } from "react";
import "@/app/styles/feature-playlists.css";
import "@/app/styles/library.css";
import { useUser } from "@/app/context/UserContext";

import DetailView from "./DetailView";
import TrackSection from "./TrackSection";
import PlaylistSection from "./PlaylistSection";
import ArtistSection from "./ArtistSection";
import MyPlaylistGrid from "../MusicContainer/MyPlaylistGrid";
import { SelectedItem } from "@/app/types/music";

import { RiResetRightLine } from "react-icons/ri";

interface Props {
  onSelect: (item: SelectedItem) => void;
}

const FeaturedPlaylists: React.FC<Props> = ({ onSelect }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("tracks");

  return (
    <div className="explore-container">
      <div className="make-for">
        <h2 className="title">Đề xuất cho {user ? user.username : "Guest"}</h2>
        <button id="refresh-recommendList">
          <RiResetRightLine /> Làm mới{" "}
        </button>
      </div>

      {/* <h2 className="title">Mới cập nhật</h2>
      <TrackSection />

      <h2 className="title">Daily Mix</h2>
      <PlaylistSection onSelect={onSelect} />

      <h2 className="title">Top Artists</h2>
      <ArtistSection onSelect={onSelect} /> */}

      {/* TAB */}
      <div className="explore-tabs">
        <div className="tabs">
          <button
            className={activeTab === "tracks" ? "active" : ""}
            onClick={() => setActiveTab("tracks")}
          >
            Mới cập nhật
          </button>

          <button
            className={activeTab === "playlist" ? "active" : ""}
            onClick={() => setActiveTab("playlist")}
          >
            Daily Mix
          </button>

          <button
            className={activeTab === "artist" ? "active" : ""}
            onClick={() => setActiveTab("artist")}
          >
            Top Artists
          </button>
        </div>

        {/* CONTENT */}
        <div className="tab-content">
          {activeTab === "tracks" && <TrackSection />}
          {activeTab === "playlist" && <PlaylistSection onSelect={onSelect} />}
          {activeTab === "artist" && <ArtistSection onSelect={onSelect} />}
        </div>
      </div>
    </div>
  );
};

export default FeaturedPlaylists;
