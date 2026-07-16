"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Donut, Favorite, Order, Review } from "@dowgnut/types";
import { apiFetch, getSessionId, SESSION_KEY } from "@/lib/api";

export type ShopView =
  | "shop"
  | "slider"
  | "swipe"
  | "favorites"
  | "checkout"
  | "orders"
  | "tracking"
  | "admin";

interface CheckoutPayload {
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  zip: string;
  notes?: string;
}

interface ShopState {
  sessionId: string;
  view: ShopView;
  splashDone: boolean;

  // catalog
  donuts: Donut[];
  loadingDonuts: boolean;
  filterType: string;
  search: string;
  sort: string;

  // cart
  cart: CartItem[];
  cartOpen: boolean;
  cartLoading: boolean;

  // favorites
  favorites: Favorite[];

  // detail modal
  selectedDonut: Donut | null;
  detailOpen: boolean;
  detailReviews: Review[];
  detailLoading: boolean;

  // ai panels
  conciergeOpen: boolean;
  designerOpen: boolean;

  // tracking
  trackingOrderId: string | null;
  trackingCustomerName: string;

  // orders cache
  orders: Order[];

  initialised: boolean;

  // actions
  setView: (v: ShopView) => void;
  dismissSplash: () => void;
  setFilterType: (t: string) => void;
  setSearch: (s: string) => void;
  setSort: (s: string) => void;

  init: () => Promise<void>;
  loadDonuts: () => Promise<void>;

  openDetail: (donut: Donut) => Promise<void>;
  closeDetail: () => void;
  loadReviews: (donutId: string) => Promise<void>;
  addReview: (donutId: string, payload: { author: string; rating: number; comment: string }) => Promise<void>;

  loadCart: () => Promise<void>;
  addToCart: (donutId: string, quantity?: number) => Promise<void>;
  updateCartQty: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setCartOpen: (open: boolean) => void;

  loadFavorites: () => Promise<void>;
  toggleFavorite: (donutId: string) => Promise<void>;
  isFavorite: (donutId: string) => boolean;

  checkout: (payload: CheckoutPayload) => Promise<Order>;
  loadOrders: () => Promise<Order[]>;

  startTracking: (orderId: string, customerName: string) => void;
  stopTracking: () => void;

  setConciergeOpen: (open: boolean) => void;
  setDesignerOpen: (open: boolean) => void;

  aiConcierge: (messages: any[]) => Promise<{ reply: string; donuts: Donut[] }>;
  aiDesigner: (prompt: string) => Promise<{ imageUrl: string }>;
}

function buildDonutsUrl(state: ShopState): string {
  const params = new URLSearchParams();
  params.set("type", state.filterType || "all");
  if (state.search) params.set("search", state.search);
  params.set("sort", state.sort || "featured");
  return `/api/donuts?${params.toString()}`;
}

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      sessionId: "",
      view: "shop",
      splashDone: false,

      donuts: [],
      loadingDonuts: false,
      filterType: "all",
      search: "",
      sort: "featured",

      cart: [],
      cartOpen: false,
      cartLoading: false,

      favorites: [],

      selectedDonut: null,
      detailOpen: false,
      detailReviews: [],
      detailLoading: false,

      conciergeOpen: false,
      designerOpen: false,

      trackingOrderId: null,
      trackingCustomerName: "",

      orders: [],

      initialised: false,

      setView: (v) => set({ view: v }),
      dismissSplash: () => set({ splashDone: true }),
      setFilterType: (t) => set({ filterType: t }),
      setSearch: (s) => set({ search: s }),
      setSort: (s) => set({ sort: s }),

      init: async () => {
        if (get().initialised) return;
        const sid = getSessionId();
        set({ sessionId: sid, initialised: true });
        await Promise.all([get().loadDonuts(), get().loadCart(), get().loadFavorites()]);
      },

      loadDonuts: async () => {
        set({ loadingDonuts: true });
        try {
          const url = buildDonutsUrl(get());
          const data = await apiFetch<Donut[]>(url);
          set({ donuts: data || [], loadingDonuts: false });
        } catch {
          set({ donuts: [], loadingDonuts: false });
        }
      },

      openDetail: async (donut) => {
        set({ selectedDonut: donut, detailOpen: true, detailReviews: [], detailLoading: true });
        try {
          const data = await apiFetch<{ donut: Donut; reviews: Review[] }>(`/api/donuts/${donut.id}`);
          set({ selectedDonut: data.donut, detailReviews: data.reviews || [], detailLoading: false });
        } catch {
          set({ detailLoading: false });
        }
      },

      closeDetail: () => set({ detailOpen: false, selectedDonut: null }),

      loadReviews: async (donutId) => {
        try {
          const data = await apiFetch<Review[]>(`/api/donuts/${donutId}/reviews`);
          set({ detailReviews: data || [] });
        } catch {
          set({ detailReviews: [] });
        }
      },

      addReview: async (donutId, payload) => {
        await apiFetch(`/api/donuts/${donutId}/reviews`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        get().loadReviews(donutId);
      },

      loadCart: async () => {
        set({ cartLoading: true });
        try {
          const data = await apiFetch<CartItem[]>("/api/cart");
          set({ cart: data || [], cartLoading: false });
        } catch {
          set({ cart: [], cartLoading: false });
        }
      },

      addToCart: async (donutId, quantity = 1) => {
        try {
          const data = await apiFetch<CartItem[]>("/api/cart", {
            method: "POST",
            body: JSON.stringify({ donutId, quantity }),
          });
          set({ cart: data || [] });
        } catch {
          // toast handled elsewhere
        }
      },

      updateCartQty: async (cartItemId, quantity) => {
        try {
          const data = await apiFetch<CartItem[]>(`/api/cart/${cartItemId}`, {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
          });
          set({ cart: data || [] });
        } catch { /* toast handled elsewhere */ }
      },

      removeFromCart: async (cartItemId) => {
        try {
          const data = await apiFetch<CartItem[]>(`/api/cart/${cartItemId}`, { method: "DELETE" });
          set({ cart: data || [] });
        } catch { /* toast handled elsewhere */ }
      },

      clearCart: async () => {
        try {
          await apiFetch("/api/cart", { method: "DELETE" });
          set({ cart: [] });
        } catch { /* toast handled elsewhere */ }
      },

      setCartOpen: (open) => set({ cartOpen: open }),

      loadFavorites: async () => {
        try {
          const data = await apiFetch<Favorite[]>("/api/favorites");
          set({ favorites: data || [] });
        } catch {
          set({ favorites: [] });
        }
      },

      toggleFavorite: async (donutId) => {
        const wasFav = get().isFavorite(donutId);
        try {
          if (wasFav) {
            await apiFetch(`/api/favorites/${donutId}`, { method: "DELETE" });
          } else {
            await apiFetch("/api/favorites", { method: "POST", body: JSON.stringify({ donutId }) });
          }
          get().loadFavorites();
        } catch {
          // toast handled elsewhere
        }
      },

      isFavorite: (donutId) => get().favorites.some((f) => f.donutId === donutId),

      checkout: async (payload) => {
        const order = await apiFetch<Order>("/api/orders", {
          method: "POST",
          body: JSON.stringify({ ...payload, sessionId: get().sessionId }),
        });
        set({ cart: [] });
        return order;
      },

      loadOrders: async () => {
        const sid = get().sessionId;
        if (!sid) return [];
        try {
          const data = await apiFetch<Order[]>(`/api/orders?sessionId=${sid}`);
          set({ orders: data || [] });
          return data || [];
        } catch {
          return [];
        }
      },

      startTracking: (orderId, customerName) =>
        set({ trackingOrderId: orderId, trackingCustomerName: customerName, view: "tracking" }),
      stopTracking: () => set({ trackingOrderId: null, trackingCustomerName: "" }),

      setConciergeOpen: (open) => set({ conciergeOpen: open }),
      setDesignerOpen: (open) => set({ designerOpen: open }),

      aiConcierge: async (messages) => {
        return apiFetch<{ reply: string; donuts: any[] }>("/api/ai/concierge", {
          method: "POST",
          body: JSON.stringify({ messages }),
        });
      },

      aiDesigner: async (prompt) => {
        return apiFetch<{ imageUrl: string }>("/api/ai/designer", {
          method: "POST",
          body: JSON.stringify({ prompt }),
        }),
    }),
    {
      name: "dowgnut-shop",
      partialize: (s) => ({ sessionId: s.sessionId, splashDone: s.splashDone }),
      onRehydrateStorage: () => (state) => {
        if (state?.sessionId) {
          localStorage.setItem(SESSION_KEY, state.sessionId);
        }
      },
    }
  )
);