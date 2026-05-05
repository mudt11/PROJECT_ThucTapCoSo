import { useEffect, useRef, useState } from "react";

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [state, setState] = useState<{
    isPlaying: boolean;
    currentTime: number;
    duration: number;
  }>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.5;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const onPlay = () => {
      setState((prev) => ({ ...prev, isPlaying: true }));
    };

    const onPause = () => {
      setState((prev) => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const load = (url: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = url;
    audio.load();
  };

  const play = async () => {
    try {
      await audioRef.current?.play();
    } catch {}
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return {
    audioRef,
    state,
    load,
    play,
    pause,
    seek,
  };
}
