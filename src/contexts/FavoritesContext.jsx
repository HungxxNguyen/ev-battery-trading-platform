// src/contexts/FavoritesContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import favouriteService from "../services/apis/favouriteApi";
import listingService from "../services/apis/listingApi";
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
    // Try to extract sellerId if present on listing
    const sellerObj = l.user || l.owner || l.seller || l.account || l.author || null;
    const sellerId = sellerObj
      ? sellerObj.id ??
        sellerObj.userId ??
        sellerObj.accountId ??
        sellerObj.userID ??
        sellerObj.user_id
      : l.userId ?? l.ownerId ?? l.accountId ?? l.sellerId ?? null;
    const image =
      Array.isArray(l.listingImages) && l.listingImages.length > 0
        ? l.listingImages[0]?.imageUrl
        : l.image ||
          l.thumbnail ||
          l.images?.[0] ||
          "https://placehold.co/200x140?text=Listing";
    // Prefer area like ListingDetail; mirror to location for compatibility
    const area =
      l.area ??
      l.Area ??
      l.location ??
      l.address ??
      l.Address ??
      l.addressLine ??
      l.city ??
      "";
    const location = area;
    return {
      id: String(id),
      title: l.title || "Tin dang",
      price: l.price ?? "",
      location,
      area,
      image,
      // Persist sellerId when available to enable direct chat from favourites
      sellerId: sellerId != null ? String(sellerId) : undefined,
      savedAt: item.savedAt || new Date().toISOString(),
    };
  }

  // Case 2: client listing object used by UI
  const baseId = item.id ?? item.listingId;
  if (!baseId && baseId !== 0) return null;
  // Client item: normalize area like ListingDetail, mirror to location
  const area =
    item.area ??
    item.Area ??
    item.location ??
    item.address ??
    item.Address ??
    item.addressLine ??
    item.city ??
    "";
  const sellerObj = item.user || item.owner || item.seller || item.account || item.author || null;
  const sellerId = sellerObj
    ? sellerObj.id ??
      sellerObj.userId ??
      sellerObj.accountId ??
      sellerObj.userID ??
      sellerObj.user_id
    : item.userId ?? item.ownerId ?? item.accountId ?? item.sellerId ?? null;
  return {
    id: String(baseId),
    title: item.title || "Tin dang",
    price: item.price || "",
    location: area,
    area,
    image:
      item.image ||
      item.thumbnail ||
      (Array.isArray(item.images) ? item.images[0] : undefined) ||
      "https://placehold.co/200x140?text=Listing",
    sellerId: sellerId != null ? String(sellerId) : undefined,
    savedAt: item.savedAt || new Date().toISOString(),
  };
};

export const FavoritesProvider = ({ children }) => {
  const auth = useContext(AuthContext) || {};
  const currentUser = auth?.user || null;
  // Derive userId from context or JWT token
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const tokenInfo = token ? decodeToken(token) : null;
  const userId = currentUser?.id || tokenInfo?.userId;

  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const extractArea = (obj) =>
    obj?.area ??
    obj?.Area ??
    obj?.location ??
    obj?.address ??
    obj?.Address ??
    obj?.addressLine ??
    obj?.city ??
    "";

  const extractSellerId = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    const sellerObj = obj.user || obj.owner || obj.seller || obj.account || obj.author;
    const fromNested = sellerObj
      ? sellerObj.id ?? sellerObj.userId ?? sellerObj.accountId ?? sellerObj.userID ?? sellerObj.user_id
      : null;
    return fromNested ?? obj.userId ?? obj.ownerId ?? obj.accountId ?? obj.sellerId ?? null;
  };

  const enrichMissingLocations = async (items) => {
    const missing = items.filter(
      (it) => (!it?.area && !it?.location) || !it?.sellerId
    );
    if (missing.length === 0) return items;
    try {
      const pairs = await Promise.all(
        missing.map(async (it) => {
          try {
            let resp = await listingService.getById(it.id);
            if (!resp?.success || resp?.status === 404) {
              resp = await listingService.getListingDetail(it.id);
            }
            if (resp?.success) {
              const payload = resp.data;
              const detail =
                payload?.data &&
                typeof payload.data === "object" &&
                !Array.isArray(payload.data)
                  ? payload.data
                  : Array.isArray(payload)
                  ? payload[0] ?? null
                  : payload && typeof payload === "object"
                  ? payload
                  : null;
              const area = extractArea(detail);
              const sellerId = extractSellerId(detail);
              return [String(it.id), { area, sellerId }];
            }
          } catch {
            // ignore individual failure
          }
          return [String(it.id), { area: "", sellerId: null }];
        })
      );
      const byId = Object.fromEntries(pairs);
      return items.map((it) => {
        const enriched = byId[String(it.id)] || {};
        const area = enriched.area || it.area || it.location || "";
        const sellerId = enriched.sellerId || it.sellerId;
        const needsArea = area && (!it.area || !it.location);
        const needsSeller = sellerId && !it.sellerId;
        return needsArea || needsSeller
          ? { ...it, area, location: area, sellerId: sellerId ? String(sellerId) : it.sellerId }
          : it;
      });
    } catch {
      return items;
    }
  };

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
        const enriched = await enrichMissingLocations(mapped);
        setFavorites(enriched);
        setFavoriteIds(new Set(enriched.map((x) => String(x.id))));
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
    if (!userId) {
      const current =
        typeof window !== "undefined"
          ? window.location.pathname +
            window.location.search +
            window.location.hash
          : "/";
      window.location.href = `/login?redirect=${encodeURIComponent(current)}`;
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
