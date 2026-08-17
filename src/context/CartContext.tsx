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
  originalPrice?: number;
  discount?: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  shippingFee?: number;
  taxAmount?: number;
}

interface CartContextType {
  items: CartItem[];
  isHydrated: boolean;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  unreadCount: number;
  addItem: (
    product: {
      _id: string;
      name: string;
      price: number;
      originalPrice?: number;
      discount?: number;
      images?: string[];
      image?: string;
      shippingFee?: number;
    },
    quantity?: number,
    size?: string,
    color?: string
  ) => void;
  removeItem: (id: string) => void;
  removeItems: (ids: string[]) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  markCartNotificationsSeen: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SEEN_KEY = 'zaam_cart_seen_notification';

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
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [seenQuantities, setSeenQuantities] = useState<Record<string, number>>({});
  const [seenHydrated, setSeenHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      let restored: CartItem[] = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.cart);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) restored = parsed;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.cart);
      }
      setItems((prev) => (restored.length > 0 ? restored : prev));
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
    } catch {
      // Silently fail if localStorage is full
    }
  }, [items, isHydrated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let restored: Record<string, number> = {};
      try {
        const stored = localStorage.getItem(SEEN_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            restored = parsed as Record<string, number>;
          }
        }
      } catch {
        restored = {};
      }
      setSeenQuantities(restored);
      setSeenHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!seenHydrated) return;
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(seenQuantities));
    } catch {
      // Persistence is best-effort; the in-memory value still works for this session.
    }
  }, [seenQuantities, seenHydrated]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const tax = useMemo(() => 0, []);

  const total = useMemo(() => subtotal, [subtotal]);

  const unreadCount = useMemo(() => {
    if (!isHydrated || !seenHydrated) return 0;
    let count = 0;
    for (const item of items) {
      const key = `${item.productId}::${item.size || ''}::${item.color || ''}`;
      const seen = seenQuantities[key] ?? 0;
      if (item.quantity > seen) count += item.quantity - seen;
    }
    return count;
  }, [items, seenQuantities, isHydrated, seenHydrated]);

  const addItem = useCallback(
    (
      product: {
        _id: string;
        name: string;
        price: number;
        originalPrice?: number;
        discount?: number;
        images?: (string | { secure_url?: string; url?: string })[];
        image?: string;
        shippingFee?: number;
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
            (item.size || '') === (size || '') &&
            (item.color || '') === (color || '')
        );

        if (existingIndex > -1) {
          return prev.map((item, i) =>
            i === existingIndex
              ? {
                  ...item,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  discount: product.discount,
                  image: imageSrc,
                  shippingFee: Number(product.shippingFee) || 0,
                }
              : item
          );
        }

        return [
          ...prev,
          {
            id: `${product._id}_${size || ''}_${color || ''}_${Date.now()}`,
            productId: product._id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            image: imageSrc,
            quantity,
            size,
            color,
            shippingFee: Number(product.shippingFee) || 0,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const removeItems = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    setItems((prev) => prev.filter((item) => !idSet.has(item.id)));
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

  const markCartNotificationsSeen = useCallback(() => {
    const snapshot: Record<string, number> = {};
    for (const item of items) {
      const key = `${item.productId}::${item.size || ''}::${item.color || ''}`;
      snapshot[key] = item.quantity;
    }
    setSeenQuantities(snapshot);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isHydrated,
        totalItems,
        subtotal,
        tax,
        total,
        unreadCount,
        addItem,
        removeItem,
        removeItems,
        updateQuantity,
        clearCart,
        markCartNotificationsSeen,
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
