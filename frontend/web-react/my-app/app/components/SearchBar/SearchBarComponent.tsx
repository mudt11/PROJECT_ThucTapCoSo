"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import SearchResultsList from "./SearchResultsList";
import "./SearchBarComponent.css";
import { Track } from "@/app/types/music";

export default function SearchBarComponent() {
  const [results, setResults] = useState<Track[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  return (
    <div className="search-bar-container">
      <SearchBar
        setResults={setResults}
        setSearchTerm={setSearchTerm}
        setIsSearchFocused={setIsSearchFocused}
      />
      <SearchResultsList
        results={results}
        searchTerm={searchTerm}
        isSearchFocused={isSearchFocused}
      />
    </div>
  );
}
