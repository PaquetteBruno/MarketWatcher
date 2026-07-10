import { useState } from "react";

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");

  const clear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchMessage("");
  };

  return {
    searchQuery,
    searchResults,
    searchMessage,
    setSearchQuery,
    setSearchResults,
    setSearchMessage,
    clear,
  };
}

export default useSearch;
