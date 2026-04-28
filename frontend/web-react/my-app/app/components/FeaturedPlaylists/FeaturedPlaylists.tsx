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
import HorizontalScroll from "../HorizontalScroll";

const mockTracks = [
  {
    id: 1,
    title: "Anh Đã Ổn Hơn",
    artist: "RPT MCK",
    cover: "https://picsum.photos/300?random=1",
  },
  {
    id: 2,
    title: "Waiting For You",
    artist: "MONO",
    cover: "https://picsum.photos/300?random=2",
  },
  {
    id: 3,
    title: "Em Là",
    artist: "Orange",
    cover: "https://picsum.photos/300?random=3",
  },
  {
    id: 4,
    title: "Lạc Trôi",
    artist: "Sơn Tùng",
    cover: "https://picsum.photos/300?random=4",
  },
  {
    id: 5,
    title: "Nàng Thơ",
    artist: "Hoàng Dũng",
    cover: "https://picsum.photos/300?random=5",
  },
  {
    id: 6,
    title: "Chạy Ngay Đi",
    artist: "Sơn Tùng",
    cover: "https://picsum.photos/300?random=6",
  },
];

interface Props {
  onSelect: (item: SelectedItem) => void;
}

const FeaturedPlaylists: React.FC<Props> = ({ onSelect }) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("tracks");
  const [recType, setRecType] = useState<"NCF" | "MF">("NCF");

  // Render data theo mode
  const dataToRender =
    recType === "NCF" ? mockTracks : mockTracks.slice().reverse();

  return (
    <div className="explore-container">
      <div className="make-for">
        <div className="make-for-header">
          <div className="left">
            <h2 className="title">Recommendation</h2>

            {/* SWITCH */}
            <div className="rec-switch">
              <button
                className={recType === "NCF" ? "active" : ""}
                onClick={() => setRecType("NCF")}
              >
                NCF
              </button>
              <button
                className={recType === "MF" ? "active" : ""}
                onClick={() => setRecType("MF")}
              >
                MF
              </button>
            </div>
          </div>

          <button id="refresh-recommendList">
            <RiResetRightLine /> Làm mới
          </button>
        </div>

        <HorizontalScroll>
          {dataToRender.map((track) => (
            <div key={track.id} className="card">
              <img src={track.cover} alt={track.title} />
              <h3>{track.title}</h3>
              <p>{track.artist}</p>
            </div>
          ))}
        </HorizontalScroll>
      </div>

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
