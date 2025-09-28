// src/contexts/FavoritesContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "voltx_favorites";

const FavoritesContext = createContext({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  clearFavorites: () => {},
});

const sanitizeItem = (item) => {
  if (!item || typeof item !== "object") return null;
  const baseId = item.id ?? item.listingId;
  if (!baseId && baseId !== 0) return null;
  return {
    id: String(baseId),
    title: item.title || "Tin dang",
    price: item.price || "",
    location: item.location || "",
    image: item.image || item.thumbnail || item.images?.[0] || "https://placehold.co/200x140?text=Listing",
    savedAt: item.savedAt || new Date().toISOString(),
  };
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(sanitizeItem)
        .filter(Boolean);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (item) => {
    const formatted = sanitizeItem(item);
    if (!formatted) return;
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === formatted.id);
      if (exists) {
        return prev.filter((fav) => fav.id !== formatted.id);
      }
      return [...prev, formatted];
    });
  };

  const memoizedValue = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite: (id) => favorites.some((fav) => fav.id === String(id)),
      clearFavorites: () => setFavorites([]),
    }),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={memoizedValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
