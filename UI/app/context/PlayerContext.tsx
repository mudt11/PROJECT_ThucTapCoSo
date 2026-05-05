"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { useAudioEngine } from "@/app/features/player/useAudioEngine";
import { PlayerService } from "@/app/features/player/playerService";
import type { Track } from "@/app/types/music";
import { fetchDailySongs } from "@/app/features/song/song.api";

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setPlaylist: (tracks: Track[], index: number) => void;
  next: () => void;
  prev: () => void;

  audioState: {
    currentTime: number;
    duration: number;
  };
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const playerServiceRef = useRef(new PlayerService());
  const audio = useAudioEngine();

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ===== RESTORE PLAYER STATE =====
  useEffect(() => {
    const raw = localStorage.getItem("player_state_v2");
    if (!raw) return;

    try {
      const data = JSON.parse(raw);

      if (!data.playlist?.length) return;

      playerServiceRef.current.setPlaylist(data.playlist, data.index);

      const track = playerServiceRef.current.getCurrentTrack();
      if (track?.audioUrl) {
        audio.load(track.audioUrl);

        setTimeout(() => {
          audio.seek(data.currentTime || 0);

          if (data.isPlaying) {
            audio.play();
          }
        }, 200);
      }

      setCurrentTrack(track);
    } catch (e) {
      console.error("restore failed", e);
    }
  }, []);

  // ===== SAVE PLAYER STATE =====
  useEffect(() => {
    const interval = setInterval(() => {
      const data = {
        playlist: playerServiceRef.current.getPlaylist(),
        index: playerServiceRef.current.getIndex(),
        currentTime: audio.state.currentTime,
        isPlaying: audio.state.isPlaying,
      };

      localStorage.setItem("player_state_v2", JSON.stringify(data));
    }, 2000);

    return () => clearInterval(interval);
  }, [audio.state]);

  // ===== AUTO NEXT =====
  useEffect(() => {
    const audioEl = audio.audioRef.current;
    if (!audioEl) return;

    const handleEnded = () => {
      const track = playerServiceRef.current.next();

      if (!track) {
        loadMore();
        return;
      }

      loadTrack(track);
    };

    audioEl.addEventListener("ended", handleEnded);

    return () => {
      audioEl.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const remaining = playerServiceRef.current.remaining();

    // nếu còn <= 2 bài → load thêm
    if (remaining <= 2) {
      loadMore();
    }
  }, [currentTrack]);

  const loadTrack = (track: Track | null) => {
    if (!track?.audioUrl) return;
    audio.load(track.audioUrl);
    audio.play();
    setCurrentTrack(track);
  };

  const setPlaylist = (tracks: Track[], index: number) => {
    playerServiceRef.current.setPlaylist(tracks, index);
    loadTrack(playerServiceRef.current.getCurrentTrack());
  };

  const loadMore = async () => {
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
      console.error("loadMore failed", e);
    } finally {
      setLoadingMore(false);
    }
  };

  const next = async () => {
    let track = playerServiceRef.current.next();

    if (!track && hasMore) {
      await loadMore();
      track = playerServiceRef.current.next();
    }

    if (track) {
      loadTrack(track);
    }
  };

  const prev = () => {
    const track = playerServiceRef.current.prev();
    loadTrack(track);
  };

  const play = () => audio.play();
  const pause = () => audio.pause();
  const togglePlay = () => {
    audio.state.isPlaying ? pause() : play();
  };

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
        setVolume: (v) => {
          if (audio.audioRef.current) {
            audio.audioRef.current.volume = v;
          }
        },
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
