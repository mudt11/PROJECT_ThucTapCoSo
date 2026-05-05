"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
// import styles from "@/app/styles/PlayerBar.module.css";
import "@/app/styles/PlayerBar.css";
import { usePlayer } from "@/app/context/PlayerContext";
import { useLikeContext } from "@/app/context/LikeContext";
import PopUp from "../PopUp";
import { increaseSongView } from "@/app/utils/songApi";

const mockQueue = [
  {
    id: 1,
    title: "Nếu Biết Đó Là Lần Cuối",
    artist: "Đức Trường",
    cover: "https://i.scdn.co/image/ab67616d00001e02b667917dd1a458f91d15b146",
  },
  {
    id: 2,
    title: "Waiting For You",
    artist: "MONO",
    cover: "https://picsum.photos/100?random=2",
  },
  {
    id: 3,
    title: "Lạc Trôi",
    artist: "Sơn Tùng",
    cover: "https://picsum.photos/100?random=3",
  },
];

const PlayerContent: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    next,
    prev,
    togglePlay,
    audioState,
    seek,
    setVolume,
  } = usePlayer();

  const { likedMap, toggleLike, fetchLikeStatus } = useLikeContext();

  // UI state (không chạm trực tiếp audio)
  const [volumeUI, setVolumeUI] = useState(50); // 0..100
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // %
  const [showUserMenu, setShowUserMenu] = useState(false);

  // tracking view
  const viewedRef = useRef(false);
  const trackIdRef = useRef<number | null>(null);
  const listenedTimeRef = useRef(0);
  const lastTimeRef = useRef(0);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lấy bài hiện tại
  const currentSong = currentTrack;

  // Lấy trạng thái like của bài hát hiện tại
  const liked = currentSong ? likedMap[currentSong.trackId] || false : false;

  // ===== Like status =====
  useEffect(() => {
    if (currentSong?.trackId) {
      fetchLikeStatus(currentSong.trackId);
    }
  }, [currentSong?.trackId, fetchLikeStatus]);

  // ===== Sync URL + reset tracking =====
  useEffect(() => {
    if (!currentSong?.trackId) return;

    const currentTrackParam = searchParams.get("track");
    if (currentTrackParam === String(currentSong.trackId)) return;

    viewedRef.current = false;
    listenedTimeRef.current = 0;
    lastTimeRef.current = 0;
    trackIdRef.current = currentSong.trackId;

    const params = new URLSearchParams(searchParams.toString());
    params.set("track", String(currentSong.trackId));

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentSong?.trackId, pathname, router]);

  // ===== Progress + view tracking (dựa trên audioState từ context) =====
  useEffect(() => {
    const { currentTime, duration } = audioState;
    if (!duration) return;

    // progress UI
    setProgress((currentTime / duration) * 100);

    // tính thời gian nghe thực (loại trừ seek lớn)
    const delta = currentTime - lastTimeRef.current;
    if (delta > 0 && delta < 2) {
      listenedTimeRef.current += delta;
    }
    lastTimeRef.current = currentTime;

    // tăng view khi nghe >= 20s
    if (
      listenedTimeRef.current >= 20 &&
      !viewedRef.current &&
      trackIdRef.current
    ) {
      increaseSongView(trackIdRef.current);
      viewedRef.current = true;
    }
  }, [audioState]);

  // ===== Seek =====
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prog = Number(e.target.value); // 0..100
    const { duration } = audioState;
    if (!duration) return;

    const newTime = (prog / 100) * duration;

    setProgress(prog);
    seek(newTime);
  };

  // ===== Volume =====
  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolumeUI(newVolume);

    const vol = newVolume / 100;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  // Khi click icon volume
  const toggleMute = () => {
    if (isMuted) {
      // Bật lại âm thanh
      const vol = volumeUI / 100 || 0.5;
      setVolume(vol);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  // Xử lý next / prev
  const handleNext = () => next();
  const handlePrev = () => prev();

  // format theo thời gian
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // icon thay đổi theo trạng thái âm lượng
  const getVolumeIcon = () => {
    if (isMuted || volumeUI === 0) return "fa-volume-xmark";
    if (volumeUI < 50) return "fa-volume-low";
    return "fa-volume-high";
  };

  const currentTime = audioState.currentTime || 0;
  const duration = audioState.duration || 0;

  return (
    <footer className="info">
      <div className="info-player">
        <Link
          className="background-singer"
          scroll={false}
          href={`/DetailSong?track=${currentSong?.trackId ?? ""}`}
        >
          <img
            src={currentSong?.imageUrl || "/images/default-song.jpg"}
            alt="cover"
          />
        </Link>

        <div className="song-row">
          <div className="info-song">
            <a className="song-tittle">{currentSong?.title || "—"}</a>
            <a className="artist-name">{currentSong?.artistName || "—"}</a>
          </div>

          <div className="song-actions">
            <button
              className={`icon-btn like-icon ${liked ? "liked" : ""}`}
              onClick={() => currentSong && toggleLike(currentSong.trackId)}
              disabled={!currentSong}
            >
              <i
                className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
              />
            </button>

            <button
              className="icon-btn expand-icon"
              onClick={() => setShowUserMenu((v) => !v)}
            >
              <i className="fa-solid fa-ellipsis"></i>
            </button>
          </div>
        </div>
        {showUserMenu && (
          <PopUp show={showUserMenu} onClose={() => setShowUserMenu(false)}>
            <div className="Other-options-popup">
              <button>
                <i className="fa-regular fa-heart"></i>
                <span>Thêm vào yêu thích</span>
              </button>

              <button>
                <i className="fa-solid fa-circle-plus"></i>
                <span>Thêm vào playlist</span>
              </button>

              <button>
                <i className="fa-regular fa-flag"></i>
                <span>Báo cáo</span>
              </button>
            </div>
          </PopUp>
        )}
      </div>

      <div className="player-center">
        <div className="control">
          <button className="play">
            <i className="fa-solid fa-shuffle"></i>
          </button>

          <button id="prevBtn" className="play" onClick={handlePrev}>
            <i className="fa-solid fa-backward-step"></i>
          </button>
          <button id="playBtn" className="play-btn" onClick={togglePlay}>
            <i className={isPlaying ? "fas fa-pause" : "fas fa-play"}></i>
          </button>
          <button id="nextBtn" className="play" onClick={handleNext}>
            <i className="fa-solid fa-forward-step"></i>
          </button>
          <button className="play">
            <i className="fa-solid fa-repeat"></i>
          </button>
        </div>

        <div className="run">
          <span className="current-time">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="seek-bar"
            value={progress}
            min={0}
            max={100}
            onChange={handleSeek}
          />
          <span className="music-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="vol">
        <button className="volume" onClick={toggleMute}>
          <i className={`fa-solid ${getVolumeIcon()}`}></i>
        </button>
        <input
          className="seek-volume"
          type="range"
          value={volumeUI}
          min={0}
          max={100}
          onChange={handleVolumeChange}
        />
      </div>

      <div className="queue">
        <div className="queue-header">
          <p>Next in queue</p>
        </div>

        <div className="queue-list">
          {mockQueue.map((song, index) => (
            <div
              key={song.id}
              className={`queue-item ${index === 0 ? "next" : ""}`}
            >
              <img src={song.cover} alt={song.title} />

              <div className="queue-info">
                <p className="queue-title">{song.title}</p>
                <p className="queue-artist">{song.artist}</p>
              </div>

              {index === 0 && <span className="playing-dot"></span>}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

// --- PHẦN BỌC SUSPENSE ---
const Player: React.FC = () => {
  return (
    <Suspense fallback={<div className="hidden">Loading Player...</div>}>
      <PlayerContent />
    </Suspense>
  );
};

export default Player;
