"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAudioEngine } from "@/app/features/player/hook/useAudioEngine";
import { PlayerService } from "@/app/features/player/playerService";
import type { Track } from "@/app/types/music";
import { fetchDailySongs } from "@/app/features/song/song.api";
import { useActivityLogger } from "@/app/features/player/hook/useActivityLogger";

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setPlaylist: (tracks: Track[], index: number) => void;
  next: () => Promise<void>;
  prev: () => void;
  audioState: { currentTime: number; duration: number };
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const playerServiceRef = useRef(new PlayerService());

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreRef = useRef<(() => Promise<void>) | null>(null);
  const nextRef = useRef<(() => Promise<void>) | null>(null);
  const loadTrackRef = useRef<
    ((track: Track | null, autoPlay?: boolean) => void) | null
  >(null);

  const [isShuffle, setIsShuffle] = useState(false);
  const isShuffleRef = useRef(isShuffle); // Dùng ref để xài trong useCallback không bị stale data

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  // Khởi tạo Logger độc lập với Context State
  const logger = useActivityLogger("playlist");

  // Kết nối Audio Engine với Logger qua Native Events
  const audio = useAudioEngine({
    onEndedNative: (time) => {
      logger.handleEnded(); // Tracking
      nextRef.current?.(); // Gọi bài tiếp theo (fix lỗi Auto-Play)
    },
    onPlayNative: logger.handlePlay,
    onPauseNative: logger.handlePause,
    onTimeUpdateNative: logger.handleTimeUpdate,
    onSeekedNative: logger.handleSeek,
  });

  const loadTrack = useCallback(
    (track: Track | null, autoPlay = true) => {
      if (!track?.audioUrl) return;

      // Báo cho Logger biết đã có track mới
      logger.initTrack(track.trackId, track.duration || 0);

      audio.load(track.audioUrl);
      setCurrentTrack(track);
      if (autoPlay) {
        setTimeout(() => audio.play(), 50);
      }
    },
    [audio, logger],
  );

  useEffect(() => {
    loadTrackRef.current = loadTrack;
  }, [loadTrack]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchDailySongs(20, page + 1);
      playerServiceRef.current.appendTracks(res.songs);
      setPage(res.page);
      if (playerServiceRef.current.getPlaylist().length >= res.total) {
        setHasMore(false);
      }
    } catch (e) {
      console.error("[PlayerContext] loadMore failed:", e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page]);

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  const next = useCallback(async () => {
    const playlist = playerServiceRef.current.getPlaylist();
    const currentIndex = playerServiceRef.current.getIndex();

    // NẾU BẬT SHUFFLE VÀ CÓ NHIỀU HƠN 1 BÀI HÁT
    if (isShuffleRef.current && playlist.length > 1) {
      let randomIndex;
      // Random một số mới, đảm bảo không trùng với bài hiện tại
      do {
        randomIndex = Math.floor(Math.random() * playlist.length);
      } while (randomIndex === currentIndex);

      // Cập nhật lại index trong PlayerService
      playerServiceRef.current.setPlaylist(playlist, randomIndex);
      const track = playerServiceRef.current.getCurrentTrack();

      if (track) {
        loadTrackRef.current?.(track, true);
      }
      return; // Dừng tại đây, không chạy logic next bình thường nữa
    }

    // LOGIC NEXT BÌNH THƯỜNG (khi tắt shuffle)
    let track = playerServiceRef.current.next();
    if (!track && hasMore) {
      await loadMoreRef.current?.();
      track = playerServiceRef.current.next();
    }
    if (track) {
      loadTrackRef.current?.(track, true);
    }
  }, [hasMore]);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const prev = useCallback(() => {
    const track = playerServiceRef.current.prev();
    loadTrack(track, true);
  }, [loadTrack]);

  useEffect(() => {
    if (playerServiceRef.current.remaining() <= 2) {
      loadMore();
    }
  }, [currentTrack, loadMore]);

  useEffect(() => {
    const raw = localStorage.getItem("player_state_v2");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!data.playlist?.length) return;

      playerServiceRef.current.setPlaylist(data.playlist, data.index);
      const track = playerServiceRef.current.getCurrentTrack();

      if (track?.audioUrl) {
        logger.initTrack(track.trackId, track.duration || 0);
        audio.load(track.audioUrl);
        setTimeout(() => {
          audio.seek(data.currentTime || 0);
          if (data.isPlaying) audio.play();
        }, 200);
      }
      setCurrentTrack(track);
    } catch (e) {
      console.error("[PlayerContext] restore failed:", e);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(
        "player_state_v2",
        JSON.stringify({
          playlist: playerServiceRef.current.getPlaylist(),
          index: playerServiceRef.current.getIndex(),
          currentTime: audio.state.currentTime,
          isPlaying: audio.state.isPlaying,
          isShuffle: isShuffleRef.current,
        }),
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [audio.state]);

  const setPlaylist = useCallback(
    (tracks: Track[], index: number) => {
      playerServiceRef.current.setPlaylist(tracks, index);
      loadTrack(playerServiceRef.current.getCurrentTrack(), true);
    },
    [loadTrack],
  );

  const play = useCallback(() => audio.play(), [audio]);
  const pause = useCallback(() => audio.pause(), [audio]);
  const togglePlay = useCallback(() => {
    audio.state.isPlaying ? audio.pause() : audio.play();
  }, [audio]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying: audio.state.isPlaying,
        play,
        pause,
        togglePlay,
        setPlaylist,
        next,
        prev,
        audioState: {
          currentTime: audio.state.currentTime,
          duration: audio.state.duration,
        },
        seek: audio.seek,
        setVolume: audio.setVolume,
        isShuffle,
        toggleShuffle,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
