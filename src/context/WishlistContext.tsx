'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    image?: string;
  }) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'zaam_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Silently fail
    }
  }, [items]);

  const wishlistCount = useMemo(() => items.length, [items]);

  const addToWishlist = useCallback(
    (product: {
      _id: string;
      name: string;
      price: number;
      images?: (string | { secure_url?: string; url?: string })[];
      image?: string;
    }) => {
      setItems((prev) => {
        const exists = prev.some(
          (item) => item.productId === product._id
        );
        if (exists) return prev;

        const firstImage = product.images?.[0];
        const imageSrc = firstImage
          ? (typeof firstImage === 'string' ? firstImage : firstImage.secure_url || firstImage.url || '')
          : product.image || '';
        return [
          ...prev,
          {
            id: `wl_${product._id}`,
            productId: product._id,
            name: product.name,
            price: product.price,
            image: imageSrc,
            addedAt: new Date().toISOString(),
          },
        ];
      });
    },
    []
  );

  const removeFromWishlist = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
