"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CartItem,
  ChatMessage,
  Donut,
  Favorite,
  Order,
  Review,
} from "@/lib/types";
import { apiFetch, getSessionId, SESSION_KEY } from "@/lib/api";

export type ShopView =
  | "shop"
  | "slider"
  | "swipe"
  | "favorites"
  | "checkout"
  | "orders"
  | "tracking"
  | "admin"
  | "duitnow-qr";

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

    // tapau physics
    tapauTrigger: { donut: Donut; resolve: () => void } | null;

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

  aiConcierge: (messages: ChatMessage[]) => Promise<{ reply: string; donuts: Donut[] }>;
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
      setFilterType: (t) => {
        set({ filterType: t });
        get().loadDonuts();
      },
      setSearch: (s) => {
        set({ search: s });
        get().loadDonuts();
      },
      setSort: (s) => {
        set({ sort: s });
        get().loadDonuts();
      },

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
          set({ donuts: data || [] });
        } catch {
          set({ donuts: [] });
        } finally {
          set({ loadingDonuts: false });
        }
      },

      openDetail: async (donut) => {
        set({ selectedDonut: donut, detailOpen: true, detailReviews: [], detailLoading: true });
        try {
          const data = await apiFetch<{ donut: Donut; reviews: Review[] }>(
            `/api/donuts/${donut.id}`
          );
          set({ selectedDonut: data.donut, detailReviews: data.reviews || [] });
        } catch {
          // keep the originally passed donut
        } finally {
          set({ detailLoading: false });
        }
      },
      closeDetail: () => set({ detailOpen: false, selectedDonut: null, detailReviews: [] }),
      loadReviews: async (donutId) => {
        try {
          const data = await apiFetch<{ donut: Donut; reviews: Review[] }>(
            `/api/donuts/${donutId}`
          );
          set({ detailReviews: data.reviews || [], selectedDonut: data.donut });
        } catch {
          /* noop */
        }
      },
      addReview: async (donutId, payload) => {
        await apiFetch<Review>(`/api/donuts/${donutId}/reviews`, {
          method: "POST",
          body: JSON.stringify({ ...payload, sessionId: get().sessionId }),
        });
        await get().loadReviews(donutId);
      },

      loadCart: async () => {
        set({ cartLoading: true });
        try {
          const data = await apiFetch<CartItem[]>(`/api/cart`);
          set({ cart: data || [] });
        } catch {
          set({ cart: [] });
        } finally {
          set({ cartLoading: false });
        }
      },
      addToCart: async (donutId, quantity = 1) => {
        try {
          const data = await apiFetch<CartItem[]>(`/api/cart`, {
            method: "POST",
            body: JSON.stringify({ donutId, quantity }),
          });
          set({ cart: data || [] });
        } catch {
          /* toast handled by caller */
          throw new Error("Failed to add to cart");
        }
      },
      updateCartQty: async (cartItemId, quantity) => {
        try {
          const data = await apiFetch<CartItem[]>(`/api/cart/${cartItemId}`, {
            method: "PATCH",
            body: JSON.stringify({ quantity }),
          });
          set({ cart: data || [] });
        } catch {
          /* noop */
        }
      },
      removeFromCart: async (cartItemId) => {
        try {
          const data = await apiFetch<CartItem[]>(`/api/cart/${cartItemId}`, {
            method: "DELETE",
          });
          set({ cart: data || [] });
        } catch {
          /* noop */
        }
      },
      clearCart: async () => {
        const cart = get().cart;
        await Promise.all(cart.map((c) => get().removeFromCart(c.id)));
        set({ cart: [] });
      },
      setCartOpen: (open) => set({ cartOpen: open }),

            // Tapau physics trigger
            tapauTrigger: null as { donut: Donut; resolve: () => void } | null,
            setTapauTrigger: (trigger: { donut: Donut; resolve: () => void } | null) => 
              set({ tapauTrigger: trigger }),

            loadFavorites: async () => {
        try {
          const data = await apiFetch<Favorite[]>(`/api/favorites`);
          set({ favorites: data || [] });
        } catch {
          set({ favorites: [] });
        }
      },
      toggleFavorite: async (donutId) => {
        const isFav = get().isFavorite(donutId);
        try {
          if (isFav) {
            const data = await apiFetch<Favorite[]>(`/api/favorites/${donutId}`, {
              method: "DELETE",
            });
            set({ favorites: data || [] });
          } else {
            const data = await apiFetch<Favorite[]>(`/api/favorites`, {
              method: "POST",
              body: JSON.stringify({ donutId }),
            });
            set({ favorites: data || [] });
          }
        } catch {
          /* noop */
        }
      },
      isFavorite: (donutId) =>
              get().favorites.some((f) => f.donutId === donutId),

            // Trigger tapau physics animation
            triggerTapau: (donut: Donut) =>
              new Promise<void>((resolve) => {
                set({ tapauTrigger: { donut, resolve } });
              }),

            checkout: async (payload) => {
        const order = await apiFetch<Order>(`/api/orders`, {
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
          const data = await apiFetch<Order[]>(`/api/orders?sessionId=${encodeURIComponent(sid)}`);
          set({ orders: data || [] });
          return data || [];
        } catch {
          return [];
        }
      },

      startTracking: (orderId, customerName) =>
        set({ trackingOrderId: orderId, trackingCustomerName: customerName, view: "tracking" }),
      stopTracking: () => set({ trackingOrderId: null }),

      setConciergeOpen: (open) => set({ conciergeOpen: open }),
            setDesignerOpen: (open) => set({ designerOpen: open }),

            // Clear tapau trigger after animation
            clearTapauTrigger: () => set({ tapauTrigger: null }),

            aiConcierge: async (messages) => {
        return apiFetch<{ reply: string; donuts: Donut[] }>(`/api/ai/concierge`, {
          method: "POST",
          body: JSON.stringify({ messages, sessionId: get().sessionId }),
        });
      },
      aiDesigner: async (prompt) => {
        return apiFetch<{ imageUrl: string }>(`/api/ai/designer`, {
          method: "POST",
          body: JSON.stringify({ prompt }),
        });
      },
    }),
    {
      name: "dowgnut-shop",
      partialize: (s) => ({
        sessionId: s.sessionId,
        // keep splashDone so it doesn't replay on every refresh
        splashDone: s.splashDone,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore sessionId into localStorage so apiFetch can read it
        if (state?.sessionId) {
          try {
            localStorage.setItem(SESSION_KEY, state.sessionId);
          } catch {
            /* ignore */
          }
        }
      },
    }
  )
);
