"use client";

import { useState } from "react";
import { usePlaylists } from "@/app/features/playlist/hooks/usePlaylists";
import { usePlaylistDetail } from "@/app/features/playlist/hooks/usePlaylistDetail";
import DetailView from "@/app/features/playlist/components/DetailView";
import PlaylistCover from "@/app/components/FeaturedPlaylists/PlaylistCover";
import type { DetailViewData } from "@/app/types/music";
import "./Playlist.css";

export default function PlaylistsPage() {
  const { playlists, loading: playlistsLoading, error } = usePlaylists();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

  const { playlist: playlistDetail, loading: detailLoading } = usePlaylistDetail(selectedPlaylistId);

  if (selectedPlaylistId) {
    if (detailLoading) return <div>Đang tải chi tiết playlist...</div>;
    if (!playlistDetail) return <div>Không tìm thấy chi tiết playlist. <button onClick={() => setSelectedPlaylistId(null)}>Quay lại</button></div>;

    const detailData: DetailViewData = {
      type: "playlist",
      title: playlistDetail.name,
      coverImages: playlistDetail.songs?.map((s: any) => s.imageUrl).filter(Boolean) || [],
      tracks: (playlistDetail.songs || []).map((song: any) => ({
        trackId: song.songId || song.id,
        title: song.title,
        duration: song.duration || 0,
        imageUrl: song.imageUrl || "/images/default-song.jpg",
        audioUrl: song.audioUrl,
        artistName: song.artistName || "Unknown",
        genre: "",
        viewCount: 0,
        isVisible: true
      }))
    };

    return <DetailView data={detailData} onBack={() => setSelectedPlaylistId(null)} />;
  }

  return (
    <div className="playlist-page">
      <div className="playlist-page-header">
        <h1> Danh sách Playlist</h1>
      </div>

      {playlistsLoading ? (
        <div>Đang tải playlists...</div>
      ) : playlists.length === 0 ? (
        <div>Chưa có playlist nào. Hãy tạo một playlist mới.</div>
      ) : (
        <div className="playlist-grid">
          {playlists.map((playlist: any) => (
            <div key={playlist.playlistId} className="playlist-card">
              <div 
                className="playlist-card-cover"
                onClick={() => setSelectedPlaylistId(playlist.playlistId)}
                style={{ cursor: "pointer" }}
              >
                <PlaylistCover 
                  images={playlist.songs?.map((s: any) => s.imageUrl).filter(Boolean) || []} 
                  size={"100%" as any} 
                />
                <button
                  className="playlist-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <i className="fa-solid fa-play" />
                </button>
              </div>
              <div className="playlist-card-info">
                <h2>{playlist.name}</h2>
                {playlist.description && <p>{playlist.description}</p>}
                <span>{playlist.songs?.length ?? 0} bài hát</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
