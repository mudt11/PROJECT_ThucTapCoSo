import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

import { fetchDailySongs } from "@/app/utils/songApi";
import type { Track } from "@/app/types/music";
import { usePlayer } from "@/app/context/PlayerContext";
import HorizontalScroll from "@/app/components/HorizontalScroll";

const TrackSection = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { setPlaylist, currentIndex, isPlaying, togglePlay } = usePlayer();
  const [hasMore, setHasMore] = useState(true);

  const loadSongs = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await fetchDailySongs(20, page);

      const newSongs = res.songs;
      const total = res.total;

      setTracks((prev) => {
        const merged = [...prev, ...newSongs];

        const unique = Array.from(
          new Map(merged.map((s) => [s.trackId, s])).values(),
        );

        if (unique.length >= total) {
          setHasMore(false);
        }

        return unique;
      });

      setPage((p) => p + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);


  if (!tracks.length && loading) return <div>Loading...</div>;
  if (!tracks.length) return <div>No songs found</div>;

  return (
    <div
      className="list-container"
      onScroll={(e) => {
        const target = e.currentTarget;

        if (
          target.scrollTop + target.clientHeight >=
          target.scrollHeight - 100
        ) {
          loadSongs();
        }
      }}
    >
      {tracks.map((song: Track, index) => (
        <div
          key={song.trackId}
          className={`list-item ${currentIndex === index ? "playing" : ""}`}
          onClick={() => {
            if (currentIndex === index) {
              // Nếu đang là bài hiện tại → toggle play/pause
              togglePlay();
            } else {
              // Nếu là bài khác → play bài mới
              setPlaylist(tracks, index);
            }
          }}
        >
          <p>{index + 1}</p>
          <img src={song.imageUrl} alt={song.title} />

          <div className="track-info">
            <h3>{song.title}</h3>
            <p>{song.artistName}</p>
          </div>

          <div
            className="play-icon"
            onClick={(e) => {
              e.stopPropagation();

              if (currentIndex === index) {
                togglePlay();
              } else {
                setPlaylist(tracks, index);
              }
            }}
          >
            {currentIndex === index && isPlaying ? <FaPause /> : <FaPlay />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackSection;
