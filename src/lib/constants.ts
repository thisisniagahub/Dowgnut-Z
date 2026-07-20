// DowgNut — App-wide constants for consistency and maintainability

// Pricing constants
export const TAX_RATE = 0.06; // 6% sales tax
export const DELIVERY_FEE = 3.99;
export const FREE_DELIVERY_THRESHOLD = 25;

// UI constants
export const ANIMATION_DURATIONS = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  extraSlow: 0.8,
} as const;

export const SWIPE_THRESHOLDS = {
  love: 110, // pixels to trigger love
  cart: -110, // pixels up to trigger cart
  skip: -110, // pixels left to trigger skip
  velocity: 600, // velocity threshold
} as const;

export const CARD_STACK = [
  { scale: 1, y: 0 },
  { scale: 0.94, y: 22 },
  { scale: 0.88, y: 44 },
] as const;

export const FLY_OUT = {
  left: { x: -700, y: 80, rotate: -22 },
  right: { x: 700, y: 80, rotate: 22 },
  up: { x: 0, y: -700, rotate: 0 },
} as const;

// Pagination & limits
export const PAGINATION = {
  donutsPerPage: 12,
  reviewsPerPage: 10,
  maxReviewsPreview: 5,
} as const;

// Search & filtering
export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SEARCH_LENGTH = 2;

// Stock warnings
export const LOW_STOCK_THRESHOLD = 5;

// Accessibility
export const FOCUS_VISIBLE_STYLE = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)] focus-visible:ring-offset-2";

// Error messages
export const ERROR_MESSAGES = {
  network: "Oops! Connection issue. Please check your internet.",
  server: "Something went wrong on our end. Please try again.",
  notFound: "Item not found. It might have been removed.",
  validation: "Please check your input and try again.",
  sessionExpired: "Your session expired. Please refresh the page.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  addToCart: "Added to your dowgs! 🛒",
  removeFromCart: "Removed from cart",
  favorite: "Saved to favorites 💗",
  unfavorite: "Removed from favorites",
  reviewPosted: "Thanks for the review!",
  orderPlaced: "Order placed successfully! 🎉",
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  donuts: "Loading delicious dowgs…",
  cart: "Checking your box…",
  favorites: "Finding your loved ones…",
  checkout: "Processing your order…",
  ai: "AI is thinking…",
} as const;

// Empty state messages
export const EMPTY_MESSAGES = {
  cart: {
    title: "Empty box?",
    description: "Go shop some dowgs, friend.",
    action: "Browse flavors",
  },
  favorites: {
    title: "No favorites yet",
    description: "Start swiping to find your loved ones!",
    action: "Start swiping",
  },
  orders: {
    title: "No orders yet",
    description: "Your first delicious order awaits!",
    action: "Shop now",
  },
  search: {
    title: "No results found",
    description: "Try a different flavor or keyword.",
    action: "Clear search",
  },
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  openCart: "c",
  toggleSearch: "/",
  closeDialog: "Escape",
  confirmAction: "Enter",
} as const;
