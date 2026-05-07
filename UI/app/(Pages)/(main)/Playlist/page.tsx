// "use client";

// import "@/app/(Pages)/(main)/Playlist/Playlist.css";
// import MyPlaylistGrid from "../../../../features/song/components/MyPlaylistGrid/MyPlaylistGrid";
// import PlaylistSidebar from "@/app/features/playlist/components/PlaylistSidebar";

// export default function PlaylistsPage() {
//   return (
//     <PlaylistSidebar />
//     // <div id="playlist_menu">
//     //   <div className="main-header">
//     //     <h2 className="main-title">Your Playlist</h2>
//     //     <button className="new-playlist-btn">+ New Playlist</button>
//     //   </div>

//     //   <MyPlaylistGrid />
//     // </div>
//   );
// }

"use client";

import { usePlaylists } from "@/app/features/playlist/hooks/usePlaylists";

export default function PlaylistsPage() {
  const { playlists, loading, error } = usePlaylists();

  return (
    <div className="playlist-page">
      <div className="playlist-page-header">
        <h1>Danh sách Playlist</h1>
      </div>

      {loading ? (
        <div>Đang tải playlists...</div>
      ) : playlists.length === 0 ? (
        <div>Chưa có playlist nào. Hãy tạo một playlist mới.</div>
      ) : (
        <div className="playlist-grid">
          {playlists.map((playlist: any) => (
            <div key={playlist.playlist_id} className="playlist-card">
              <div className="playlist-card-cover">
                <img
                  src={playlist.cover_image_url || "/images/default-song.jpg"}
                  alt={playlist.name}
                />
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
