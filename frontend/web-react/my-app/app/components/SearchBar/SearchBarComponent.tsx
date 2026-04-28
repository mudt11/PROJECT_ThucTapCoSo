"use client";

import { useState } from "react";
import styles from "./search.module.css";
import SearchBar from "./SearchBar";
import SearchResultsList from "./SearchResultsList";
import { Track } from "@/app/types/music";

export default function SearchBarComponent() {
  const [results, setResults] = useState<Track[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  return (
    <div className={styles.container}>
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
