"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { searchSongs } from "@/app/utils/songApi";
import "./SearchBar.css";
import { Track } from "@/app/types/music";

interface SearchBarProps {
  setResults: (results: Track[]) => void;
  setSearchTerm: (searchTerm: string) => void;
}

const SearchBar = ({ setResults, setSearchTerm }: SearchBarProps) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const value = input.trim();

      if (!value) {
        setResults([]);
        setError(null);
        return;
      }

      try {
        setError(null);
        const tracks = await searchSongs(value, 10);
        
        if (!tracks || tracks.length === 0) {
          setError("Không tìm thấy bài hát nào");
        }
        
        setResults(tracks || []);
      } catch (err) {
        console.error("Search error:", err);
        const errorMessage = err instanceof Error ? err.message : "Lỗi tìm kiếm";
        setError(errorMessage);
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [input, setResults]);

  const handleChange = (value: string) => {
    setInput(value);
    setSearchTerm(value);
  };

  return (
    <div className="input-wrapper">
      <FaSearch id="search-icon" onClick={() => inputRef.current?.focus()} />
      <input
        ref={inputRef}
        placeholder="Bạn muốn phát nội dung gì?"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
