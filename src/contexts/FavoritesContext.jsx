// src/contexts/FavoritesContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import favouriteService from "../services/apis/favouriteApi";
import { decodeToken } from "../utils/tokenUtils";

const FavoritesContext = createContext({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  clearFavorites: () => {},
});

// Normalize various listing/favourite shapes to UI-friendly item
const sanitizeItem = (item) => {
  if (!item || typeof item !== "object") return null;

  // Case 1: server favourite entry { id: favouriteId, listing: { ... } }
  if (item.listing && typeof item.listing === "object") {
    const l = item.listing;
    const id = l.id ?? l.listingId;
    if (!id && id !== 0) return null;
    const image = Array.isArray(l.listingImages) && l.listingImages.length > 0
      ? l.listingImages[0]?.imageUrl
      : l.image || l.thumbnail || l.images?.[0] || "https://placehold.co/200x140?text=Listing";
    return {
      id: String(id),
      title: l.title || "Tin dang",
      price: l.price ?? "",
      location: l.location || "",
      image,
      savedAt: item.savedAt || new Date().toISOString(),
    };
  }

  // Case 2: client listing object used by UI
  const baseId = item.id ?? item.listingId;
  if (!baseId && baseId !== 0) return null;
  return {
    id: String(baseId),
    title: item.title || "Tin dang",
    price: item.price || "",
    location: item.location || "",
    image:
      item.image ||
      item.thumbnail ||
      (Array.isArray(item.images) ? item.images[0] : undefined) ||
      "https://placehold.co/200x140?text=Listing",
    savedAt: item.savedAt || new Date().toISOString(),
  };
};

export const FavoritesProvider = ({ children }) => {
  const auth = useContext(AuthContext) || {};
  const currentUser = auth?.user || null;
  // Derive userId from context or JWT token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const tokenInfo = token ? decodeToken(token) : null;
  const userId = currentUser?.id || tokenInfo?.userId;

  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
    if (!userId) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const res = await favouriteService.getFavourites(userId);
      if (res?.success) {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        const mapped = list.map(sanitizeItem).filter(Boolean);
        setFavorites(mapped);
        setFavoriteIds(new Set(mapped.map((x) => String(x.id))));
      } else {
        setFavorites([]);
        setFavoriteIds(new Set());
      }
    } catch (e) {
      console.error("Failed to load favourites:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sync when user changes or logs in/out
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const toggleFavorite = async (item) => {
    const formatted = sanitizeItem(item);
    if (!formatted) return;
    if (!userId) { const current = (typeof window !== "undefined") ? (window.location.pathname + window.location.search + window.location.hash) : "/"; window.location.href = `/login?redirect=${encodeURIComponent(current)}`; return; }

    const listingId = formatted.id;
    const already = favoriteIds.has(String(listingId));

    try {
      if (already) {
        const res = await favouriteService.deleteFavourite({ userId, listingId });
        if (res?.success) {
          setFavorites((prev) => prev.filter((f) => String(f.id) !== String(listingId)));
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(String(listingId));
            return next;
          });
        }
      } else {
        const res = await favouriteService.addFavourite({ userId, listingId });
        if (res?.success) {
          // Optimistically add from available item data
          setFavorites((prev) => {
            const exists = prev.some((f) => String(f.id) === String(listingId));
            return exists ? prev : [...prev, formatted];
          });
          setFavoriteIds((prev) => new Set([...prev, String(listingId)]));
        }
      }
    } catch (e) {
      console.error("Toggle favourite failed:", e);
    }
  };

  const clearFavorites = async () => {
    if (!userId || favorites.length === 0) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }
    try {
      await Promise.all(
        favorites.map((fav) =>
          favouriteService.deleteFavourite({ userId, listingId: fav.id })
        )
      );
    } catch (e) {
      console.error("Clear favourites encountered errors:", e);
    } finally {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  };

  const memoizedValue = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite: (id) => favoriteIds.has(String(id)),
      clearFavorites,
      loading,
      reload: loadFavorites,
    }),
    [favorites, favoriteIds, loading]
  );

  return (
    <FavoritesContext.Provider value={memoizedValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);


