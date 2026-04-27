"use client";
import { createContext, useContext, useState } from "react";
import { toggleLikeSong, getLikeStatus } from "../features/like/like.api";

const LikeContext = createContext<any>(null);

export const LikeProvider = ({ children }: any) => {
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});

  const fetchLikeStatus = async (songId: number) => {
    if (likedMap[songId] !== undefined) return;

    const res = await getLikeStatus(songId);

    setLikedMap((prev) => ({
      ...prev,
      [songId]: res.liked,
    }));
  };

  const toggleLike = async (songId: number) => {
    setLikedMap((prev) => ({
      ...prev,
      [songId]: !prev[songId],
    }));

    try {
      await toggleLikeSong(songId);
    } catch (err) {
      // rollback nếu fail
      setLikedMap((prev) => ({
        ...prev,
        [songId]: !prev[songId],
      }));
    }
  };

  return (
    <LikeContext.Provider value={{ likedMap, fetchLikeStatus, toggleLike }}>
      {children}
    </LikeContext.Provider>
  );
};

export const useLikeContext = () => useContext(LikeContext);
