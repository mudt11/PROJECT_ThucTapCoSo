import { useState } from "react";
import { toggleLikeSong, getLikeStatus } from "./like.api";

export const useLike = () => {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchLikeStatus = async (songId: number) => {
    setLoading(true);
    try {
      const res = await getLikeStatus(songId);
      setLiked(res.liked);
    } catch (error) {
      console.error("Error fetching like status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (songId: number) => {
    setLiked((prev) => !prev);
    try {
      await toggleLikeSong(songId);
    } catch (error) {
      console.error("Error toggling like:", error);
      setLiked((prev) => !prev);
    }
  };

  return { liked, handleLike, setLiked, fetchLikeStatus, loading };
};
