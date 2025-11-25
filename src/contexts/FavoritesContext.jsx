// src/contexts/FavoritesContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

import { AuthContext } from "./AuthContext";
import favouriteService from "../services/apis/favouriteApi";
import { decodeToken } from "../utils/tokenUtils";

const FavoritesContext = createContext({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  clearFavorites: () => {},
  reload: () => {},
  loading: false,
});

/* ---------------- Helper: sanitize listing/favourite object ---------------- */
const sanitizeItem = (item) => {
  if (!item || typeof item !== "object") return null;

  // Case from server: { id, listing: {...} }
  if (item.listing && typeof item.listing === "object") {
    const l = item.listing;
    const id = l.id ?? l.listingId;
    if (!id) return null;

    const status = (l.status ?? l.Status ?? l.listingStatus ?? "")
      .toString()
      .toLowerCase();

    const image =
      l.listingImages?.[0]?.imageUrl ||
      l.image ||
      l.thumbnail ||
      l.images?.[0] ||
      "https://placehold.co/200x140?text=Listing";

    return {
      id: String(id),
      title: l.title || "Tin đăng",
      price: l.price ?? "",
      status,
      image,
      savedAt: item.savedAt || new Date().toISOString(),
    };
  }

  // Case from UI (Home)
  const baseId = item.id ?? item.listingId;
  if (!baseId) return null;

  const status = (
    item.status ??
    item.Status ??
    item.listingStatus ??
    item.listing?.status ??
    ""
  )
    .toString()
    .toLowerCase();

  return {
    id: String(baseId),
    title: item.title || "Tin đăng",
    price: item.price || "",
    status,
    image:
      item.image ||
      item.thumbnail ||
      (Array.isArray(item.images) ? item.images[0] : undefined) ||
      "https://placehold.co/200x140?text=Listing",
    savedAt: item.savedAt || new Date().toISOString(),
  };
};

/* ---------------- Provider ---------------- */
export const FavoritesProvider = ({ children }) => {
  const auth = useContext(AuthContext);
  const currentUser = auth?.user || null;

  const token = localStorage.getItem("token");
  const tokenInfo = token ? decodeToken(token) : null;

  const userId = currentUser?.id || tokenInfo?.userId;

  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  /* ---------------- Load API ---------------- */
  const loadFavorites = useCallback(async () => {
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
    } catch (err) {
      console.error("Load favourites failed:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  /* ---------------- Toggle Favorite ---------------- */
  const toggleFavorite = async (item) => {
    const formatted = sanitizeItem(item);
    if (!formatted) return;

    if (!userId) {
      const url =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      window.location.href = `/login?redirect=${encodeURIComponent(url)}`;
      return;
    }

    const listingId = formatted.id;
    const already = favoriteIds.has(String(listingId));

    try {
      if (already) {
        const res = await favouriteService.deleteFavourite({
          userId,
          listingId,
        });

        if (res?.success) {
          setFavorites((prev) =>
            prev.filter((f) => String(f.id) !== String(listingId))
          );
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(String(listingId));
            return next;
          });
        }
      } else {
        const res = await favouriteService.addFavourite({ userId, listingId });

        if (res?.success) {
          setFavorites((prev) => {
            const exists = prev.some((f) => String(f.id) === String(listingId));
            return exists ? prev : [...prev, formatted];
          });
          setFavoriteIds((prev) => new Set([...prev, String(listingId)]));
        }
      }
    } catch (err) {
      console.error("Toggle favourite failed:", err);
    }
  };

  /* ---------------- Clear Favorites ---------------- */
  const clearFavorites = async () => {
    if (!userId || favorites.length === 0) return;

    try {
      await Promise.all(
        favorites.map((fav) =>
          favouriteService.deleteFavourite({
            userId,
            listingId: fav.id,
          })
        )
      );
    } catch (err) {
      console.error("Clear favourite failed:", err);
    }

    setFavorites([]);
    setFavoriteIds(new Set());
  };

  /* ---------------- Context Value ---------------- */
  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite: (id) => favoriteIds.has(String(id)),
      clearFavorites,
      reload: loadFavorites,
      loading,
    }),
    [favorites, favoriteIds, loading, loadFavorites]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
