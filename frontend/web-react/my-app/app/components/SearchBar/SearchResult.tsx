"use client";

import React from "react";
import { useState } from "react";
import styles from "./search.module.css";
import { Track } from "@/app/types/music";
import { usePlayer } from "@/app/context/PlayerContext";

interface SearchResultProps {
  result: Track;
  searchTerm: string;
}

const SearchResult = ({ result, searchTerm }: SearchResultProps) => {
  const { setPlaylist } = usePlayer();

  const highlight = (text: string, term: string) => {
    if (!term) return text;

    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span className={styles.highlight}>{part}</span>
      ) : (
        part
      ),
    );
  };
  return (
    <div className={styles.resultItem} onClick={() => setPlaylist([result], 0)}>
      <img
        src={result.imageUrl || "/images/default-song.jpg"}
        className={styles.resultImg}
      />

      <div className={styles.resultInfo}>
        <div className={styles.resultTitle}>
          {highlight(result.title, searchTerm)}
        </div>
        <div className={styles.resultArtist}>{result.artistName}</div>
      </div>
    </div>
  );
};

export default SearchResult;
