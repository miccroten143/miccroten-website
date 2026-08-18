import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from './types';

interface CartState {
  items: { product: Product; quantity: number }[];
  coupon: { code: string; discount: number; type: 'percent' | 'fixed'; value: number } | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number, type: 'percent' | 'fixed', value: number) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getGst: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getCount: () => number;
}

const GST_RATE = 0.18;
const FREE_SHIPPING_THRESHOLD = 2000;
const SHIPPING_FLAT = 99;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        })),
      clearCart: () => set({ items: [], coupon: null }),
      applyCoupon: (code, discount, type, value) =>
        set({ coupon: { code, discount, type, value } }),
      removeCoupon: () => set({ coupon: null }),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      getDiscount: () => {
        const { coupon, getSubtotal } = get();
        if (!coupon) return 0;
        const subtotal = getSubtotal();
        if (coupon.type === 'fixed') return Math.min(coupon.value, subtotal);
        const pct = Math.min(coupon.value, 100);
        return Math.round((subtotal * pct) / 100);
      },
      getGst: () => {
        const { getSubtotal, getDiscount } = get();
        return Math.round((getSubtotal() - getDiscount()) * GST_RATE);
      },
      getShipping: () => {
        const { getSubtotal, getDiscount } = get();
        const afterDiscount = getSubtotal() - getDiscount();
        if (afterDiscount >= FREE_SHIPPING_THRESHOLD || afterDiscount === 0) return 0;
        return SHIPPING_FLAT;
      },
      getTotal: () => {
        const { getSubtotal, getDiscount, getGst, getShipping } = get();
        return getSubtotal() - getDiscount() + getGst() + getShipping();
      },
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'mct-cart' }
  )
);

interface WishlistState {
  productIds: number[];
  setIds: (ids: number[]) => void;
  toggle: (productId: number) => void;
  has: (productId: number) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      setIds: (ids) => set({ productIds: ids }),
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      has: (productId) => get().productIds.includes(productId),
      clear: () => set({ productIds: [] }),
    }),
    { name: 'mct-wishlist' }
  )
);

interface RecentlyViewedState {
  productIds: number[];
  add: (productId: number) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      productIds: [],
      add: (productId) =>
        set((state) => ({
          productIds: [
            productId,
            ...state.productIds.filter((id) => id !== productId),
          ].slice(0, 10),
        })),
      clear: () => set({ productIds: [] }),
    }),
    { name: 'mct-recently-viewed' }
  )
);
