"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/app/styles/AdminPage/ManageSong.module.css";
import pendingStyles from "./PendingSongs.module.css";
import {
  fetchPendingSongs,
  approveSongApi,
  rejectSongApi,
} from "@/app/features/song/song.api";
import Pagination from "@/app/components/ui/Pagination";
import { formatDuration, formatDate } from "@/app/utils/dateHelper";
import SongDetailModal from "./SongDetailModal";

function PendingSongsContent() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [songs, setSongs] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingSongs({
        page: currentPage,
        limit: 20,
      });
      setSongs(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      console.error("Fetch pending songs failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleApprove = async (songId: number) => {
    if (!confirm("Bạn có chắc muốn duyệt bài hát này?")) return;
    try {
      setLoading(true);
      await approveSongApi(songId);
      setSongs((prev) => prev.filter((s) => s.song_id !== songId));
      if (selectedSong?.song_id === songId) setSelectedSong(null);
    } catch (error: any) {
      alert(error.message || "Duyệt thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (songId: number) => {
    if (!confirm("Bạn có chắc muốn từ chối bài hát này?")) return;
    try {
      setLoading(true);
      await rejectSongApi(songId);
      setSongs((prev) => prev.filter((s) => s.song_id !== songId));
      if (selectedSong?.song_id === songId) setSelectedSong(null);
    } catch (error: any) {
      alert(error.message || "Từ chối thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Duyệt bài hát</h2>

      {songs.length === 0 && !loading ? (
        <div className={pendingStyles.emptyState}>
          <span className={pendingStyles.emptyIcon}>✅</span>
          <h3>Không có bài hát nào đang chờ duyệt</h3>
          <p>Tất cả bài hát đã được xử lý.</p>
        </div>
      ) : (
        <table className={styles.songTable}>
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Tên bài hát</th>
              <th>Nghệ sĩ</th>
              <th>Người gửi</th>
              <th>Thể loại</th>
              <th>Ngày gửi</th>
              <th>Thời lượng</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {songs.map((song) => (
              <tr key={song.song_id}>
                <td>
                  <div className={pendingStyles.songTitle}>
                    {song.image_url && (
                      <img
                        src={song.image_url}
                        alt=""
                        className={pendingStyles.songThumb}
                      />
                    )}
                    <span>{song.title}</span>
                  </div>
                </td>
                <td>
                  {song.artists?.map((a: any) => a.name).join(", ") ||
                    "Unknown"}
                </td>
                <td>
                  <span className={pendingStyles.uploaderName}>
                    {song.uploader?.username || "—"}
                  </span>
                </td>
                <td>{song.genres?.map((g: any) => g.name).join(", ") || "—"}</td>
                <td>{formatDate(song.created_at)}</td>
                <td>{formatDuration(song.duration)}</td>
                <td>
                  <div className={pendingStyles.actionGroup}>
                    <button
                      className={pendingStyles.viewBtn}
                      onClick={() => setSelectedSong(song)}
                    >
                      👁 Xem
                    </button>
                    <button
                      className={pendingStyles.approveBtn}
                      onClick={() => handleApprove(song.song_id)}
                      disabled={loading}
                    >
                      ✓ Duyệt
                    </button>
                    <button
                      className={pendingStyles.rejectBtn}
                      onClick={() => handleReject(song.song_id)}
                      disabled={loading}
                    >
                      ✕ Từ chối
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />

      {selectedSong && (
        <SongDetailModal
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading}
        />
      )}
    </div>
  );
}

export default function PendingSongsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingSongsContent />
    </Suspense>
  );
}
