/**
 * useFavorites — Offline Favorites Hook
 *
 * Manages hotel favorites entirely offline via SQLite.
 * Uses a Jotai atom for instant (optimistic) UI updates,
 * with SQLite as the persistent backing store.
 *
 * Usage:
 *   const { isFavorite, toggle } = useFavorites(hotelId);
 */

import {useCallback} from 'react';
import {atom, useAtom} from 'jotai';
import {favoritesDao} from '../../../core/database/favoritesDao';

// ---------------------------------------------------------------------------
// Global atom — in-memory set of favorited hotel IDs
// ---------------------------------------------------------------------------

/**
 * Lazily initialised from SQLite on first access.
 * Using a Set for O(1) lookups.
 */
const _loadFavoritesFromDB = (): Set<string> => {
  try {
    const ids = favoritesDao.getAll();
    return new Set(ids);
  } catch {
    // DB might not be ready yet on very first render; return empty set safely
    return new Set();
  }
};

const favoritesSetAtom = atom<Set<string>>(_loadFavoritesFromDB());

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFavorites(hotelId?: string) {
  const [favorites, setFavorites] = useAtom(favoritesSetAtom);

  const isFavorite = hotelId ? favorites.has(hotelId) : false;

  /**
   * Toggle favorite status for a hotel.
   * Optimistically updates UI first, then persists to SQLite.
   */
  const toggle = useCallback(
    (id: string) => {
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          favoritesDao.remove(id); // Persist removal
        } else {
          next.add(id);
          favoritesDao.add(id); // Persist addition
        }
        return next;
      });
    },
    [setFavorites],
  );

  /**
   * Directly add a hotel as favorite.
   */
  const add = useCallback(
    (id: string) => {
      if (!favorites.has(id)) {
        setFavorites(prev => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        favoritesDao.add(id);
      }
    },
    [favorites, setFavorites],
  );

  /**
   * Directly remove a hotel from favorites.
   */
  const remove = useCallback(
    (id: string) => {
      if (favorites.has(id)) {
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        favoritesDao.remove(id);
      }
    },
    [favorites, setFavorites],
  );

  return {
    isFavorite,
    toggle,
    add,
    remove,
    favorites, // full set — use to render a full favorites list screen
    count: favorites.size,
  };
}
