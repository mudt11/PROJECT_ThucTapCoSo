"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { searchSongs } from "@/app/utils/songApi";
import "./SearchBar.css";
import { Track } from "@/app/types/music";

interface SearchBarProps {
  setResults: (results: Track[]) => void;
  setSearchTerm: (searchTerm: string) => void;
  setIsSearchFocused: (focused: boolean) => void;
}

const SearchBar = ({
  setResults,
  setSearchTerm,
  setIsSearchFocused,
}: SearchBarProps) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const value = input.trim();

      if (!value) {
        setResults([]);
        return;
      }

      try {
        const tracks = await searchSongs(value, 10);

        setResults(tracks || []);
      } catch (err) {
        console.error("Search error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Lỗi tìm kiếm";
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [input, setResults]);

  const handleChange = (value: string) => {
    setInput(value);
    setSearchTerm(value);
  };

  const clearInput = () => {
    setInput("");
    setSearchTerm("");
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div className="input-wrapper">
      <FaSearch id="search-icon" onClick={() => inputRef.current?.focus()} />
      <div className="input-container">
        <input
          ref={inputRef}
          placeholder="Bạn muốn phát nội dung gì?"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => {
            // Delay để cho phép click vào kết quả
            setTimeout(() => setIsSearchFocused(false), 150);
          }}
        />
        {input && (
          <FaTimes
            id="clear-icon"
            onClick={clearInput}
            onMouseDown={(e) => e.preventDefault()} // Ngăn onBlur trigger
          />
        )}
      </div>
    </div>
  );
};

export default SearchBar;
