'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';

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

const STORAGE_KEYS = {
  cart: 'zaam_cart',
  checkoutCoupon: 'zaam_checkout_coupon',
  checkoutDiscount: 'zaam_checkout_discount',
  checkoutCouponId: 'zaam_checkout_coupon_id',
  checkoutCouponType: 'zaam_checkout_coupon_type',
  checkoutCouponValue: 'zaam_checkout_coupon_value',
  checkoutCouponMaxDiscount: 'zaam_checkout_coupon_max_discount',
  checkoutCouponMinPurchase: 'zaam_checkout_coupon_min_purchase',
  couponId: 'zaam_coupon_id',
  couponCode: 'zaam_coupon_code',
  couponType: 'zaam_coupon_type',
  couponValue: 'zaam_coupon_value',
  couponMaxDiscount: 'zaam_coupon_max_discount',
  couponMinPurchase: 'zaam_coupon_min_purchase',
} as const;

const CART_SESSION_KEYS: string[] = [
  STORAGE_KEYS.checkoutCoupon,
  STORAGE_KEYS.checkoutDiscount,
  STORAGE_KEYS.checkoutCouponId,
  STORAGE_KEYS.checkoutCouponType,
  STORAGE_KEYS.checkoutCouponValue,
  STORAGE_KEYS.checkoutCouponMaxDiscount,
  STORAGE_KEYS.checkoutCouponMinPurchase,
  STORAGE_KEYS.couponId,
  STORAGE_KEYS.couponCode,
  STORAGE_KEYS.couponType,
  STORAGE_KEYS.couponValue,
  STORAGE_KEYS.couponMaxDiscount,
  STORAGE_KEYS.couponMinPurchase,
];

function clearCartStorage() {
  localStorage.removeItem(STORAGE_KEYS.cart);
  for (const key of CART_SESSION_KEYS) {
    sessionStorage.removeItem(key);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const ready = useRef(false);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (user) {
        try {
          const stored = localStorage.getItem(STORAGE_KEYS.cart);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setItems(parsed);
              ready.current = true;
              return;
            }
          }
        } catch {
          localStorage.removeItem(STORAGE_KEYS.cart);
        }
      } else {
        clearCartStorage();
      }

      setItems([]);
    }, 0);

    return () => clearTimeout(timer);
    ready.current = true;
  }, [user, loading]);

  useEffect(() => {
    if (ready.current && user) {
      try {
        localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
      } catch {
        // Silently fail if localStorage is full
      }
    }
  }, [items, user]);

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
    clearCartStorage();
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
