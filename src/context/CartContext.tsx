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

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  addItem: (
    product: {
      _id: string;
      name: string;
      price: number;
      images?: string[];
      image?: string;
    },
    quantity?: number,
    size?: string,
    color?: string
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08;
const STORAGE_KEY = 'zaam_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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
      // Silently fail if localStorage is full
    }
  }, [items]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);

  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const addItem = useCallback(
    (
      product: {
        _id: string;
        name: string;
        price: number;
        images?: (string | { secure_url?: string; url?: string })[];
        image?: string;
      },
      quantity: number = 1,
      size?: string,
      color?: string
    ) => {
      setItems((prev) => {
        const firstImage = product.images?.[0];
        const imageSrc = firstImage
          ? (typeof firstImage === 'string' ? firstImage : firstImage.secure_url || firstImage.url || '')
          : product.image || '';
        const existingIndex = prev.findIndex(
          (item) =>
            item.productId === product._id &&
            item.size === size &&
            item.color === color
        );

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }

        return [
          ...prev,
          {
            id: `${product._id}_${size || ''}_${color || ''}_${Date.now()}`,
            productId: product._id,
            name: product.name,
            price: product.price,
            image: imageSrc,
            quantity,
            size,
            color,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        tax,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
