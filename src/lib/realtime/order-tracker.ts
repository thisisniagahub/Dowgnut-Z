// DowgNut — real-time order tracking server.
//
// Singleton socket.io server that:
//   • broadcasts order lifecycle events to subscribed clients
//   • exposes a small pub/sub helper that the API routes use to push updates
//
// Lifecycle
//   1. POST /api/orders creates an order  →  tracker.emitOrderCreated(order)
//      → server emits 'order:created' { orderId, status, updatedAt }
//   2. PATCH /api/orders/[id] { status } advances the flow
//      → tracker.emitStatus(orderId, status)
//      → server emits 'order:status' { orderId, status, updatedAt }
//
// Status flow:  preparing → baking → out_for_delivery → delivered
//
// Client subscribe:  socket.emit('track-order', { orderId, customerName })
// Client unsubscribe: socket.emit('stop-tracking', { orderId })
// The client joins room `order:<orderId>` on subscribe.

import { EventEmitter } from "node:events";
import type { Server as IoServer, Socket } from "socket.io";
import type { Order, OrderStatus } from "@/lib/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "preparing",
  "baking",
  "out_for_delivery",
  "delivered",
];

export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  preparing: "baking",
  baking: "out_for_delivery",
  out_for_delivery: "delivered",
  delivered: null,
};

export interface OrderCreatedPayload {
  orderId: string;
  status: OrderStatus;
  updatedAt: string;
}

export interface OrderStatusPayload {
  orderId: string;
  status: OrderStatus;
  updatedAt: string;
}

const ROOM = (orderId: string) => `order:${orderId}`;
const TRACK_EVENT = "track-order";
const STOP_EVENT = "stop-tracking";
const CREATED_EVENT = "order:created";
const STATUS_EVENT = "order:status";

/**
 * OrderTracker
 *
 * Holds a reference to the socket.io server (if attached) and an internal
 * pub/sub EventEmitter so that server modules (Next.js API route handlers)
 * can fire events even before the io server has booted, or when running in
 * an environment where the io server is unavailable (e.g. serverless).
 *
 * The `socket.io` module is only required lazily inside
 * `initOrderTrackerServer()` — importing this module alone on the client
 * bundle pulls only the lightweight type-only import from `socket.io`, which
 * webpack tree-shakes out.
 */
class OrderTracker {
  /** The live socket.io server — null until attachIo() is called. */
  private io: IoServer | null = null;

  /**
   * In-memory cache of the latest known status per orderId. Lets late
   * subscribers get the current status immediately on `track-order`.
   */
  private lastStatus = new Map<string, OrderStatus>();

  /** Local pub/sub bus so API routes can fire updates without the io ref. */
  private bus = new EventEmitter();

  /** Pending events queued before attachIo so nothing is lost on boot. */
  private pending: (() => void)[] = [];

  constructor() {
    this.bus.setMaxListeners(50);
  }

  /** Attach a socket.io server. Called once from src/instrumentation.ts. */
  attachIo(io: IoServer): void {
    if (this.io) {
      // Already attached — ignore duplicate init.
      return;
    }
    this.io = io;

    io.on("connection", (socket: Socket) => this.handleConnection(socket));

    // Drain any events that arrived before the server was ready.
    const queue = this.pending;
    this.pending = [];
    queue.forEach((f) => f());
  }

  /** Returns true if a socket.io server is attached. */
  isReady(): boolean {
    return this.io !== null;
  }

  /** Get the attached io server if any (server-only). */
  getIoServer(): IoServer | null {
    return this.io;
  }

  /**
   * Fire `order:created` for a newly-created order. Safe to call from
   * anywhere (API routes, instrumentation, tests). Caches the status; if
   * the io server is attached, broadcasts to the order room + globally.
   * If not yet attached, the event is queued and replayed on attach.
   */
  emitOrderCreated(order: Pick<Order, "id" | "status">): void {
    const orderId = order.id;
    const payload: OrderCreatedPayload = {
      orderId,
      status: order.status,
      updatedAt: new Date().toISOString(),
    };
    this.lastStatus.set(orderId, order.status);

    const deliver = () => {
      this.bus.emit(CREATED_EVENT, payload);
      if (this.io) {
        this.io.to(ROOM(orderId)).emit(CREATED_EVENT, payload);
        this.io.emit(CREATED_EVENT, payload);
      }
    };

    if (!this.io) {
      this.pending.push(deliver);
    } else {
      deliver();
    }
  }

  /**
   * Fire `order:status` for a status change. Safe to call from anywhere.
   * Validates that the new status is a known value within the lifecycle.
   */
  emitStatus(orderId: string, status: OrderStatus): void {
    if (!ORDER_STATUSES.includes(status)) {
      console.warn(`[order-tracker] unknown status "${status}", ignoring.`);
      return;
    }
    const payload: OrderStatusPayload = {
      orderId,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.lastStatus.set(orderId, status);

    const deliver = () => {
      this.bus.emit(STATUS_EVENT, payload);
      if (this.io) {
        this.io.to(ROOM(orderId)).emit(STATUS_EVENT, payload);
        this.io.emit(STATUS_EVENT, payload);
      }
    };

    if (!this.io) {
      this.pending.push(deliver);
    } else {
      deliver();
    }
  }

  /** Get cached latest status for an order (or null). */
  getCachedStatus(orderId: string): OrderStatus | null {
    return this.lastStatus.get(orderId) ?? null;
  }

  /** Clear the cached status for an order (e.g. after delivered/cleanup). */
  clearStatus(orderId: string): void {
    this.lastStatus.delete(orderId);
  }

  // ─────────────────────────  internal  ─────────────────────────

  private handleConnection(socket: Socket): void {
    let joinedOrderId: string | null = null;

    const handleTrack = (data: unknown) => {
      const orderId =
        data && typeof data === "object" && "orderId" in data
          ? String((data as { orderId: unknown }).orderId)
          : "";
      if (!orderId) return;
      joinedOrderId = orderId;
      void socket.join(ROOM(orderId));

      // Late joiners immediately receive the cached latest status.
      const cached = this.lastStatus.get(orderId);
      if (cached) {
        socket.emit(STATUS_EVENT, {
          orderId,
          status: cached,
          updatedAt: new Date().toISOString(),
        });
      }
    };

    const handleStop = (data: unknown) => {
      const orderId =
        data && typeof data === "object" && "orderId" in data
          ? String((data as { orderId: unknown }).orderId)
          : "";
      if (!orderId) return;
      void socket.leave(ROOM(orderId));
      if (joinedOrderId === orderId) joinedOrderId = null;
    };

    socket.on(TRACK_EVENT, handleTrack);
    socket.on(STOP_EVENT, handleStop);

    socket.on("disconnect", () => {
      if (joinedOrderId) {
        void socket.leave(ROOM(joinedOrderId));
        joinedOrderId = null;
      }
      socket.removeAllListeners(TRACK_EVENT);
      socket.removeAllListeners(STOP_EVENT);
    });
  }
}

/**
 * Singleton tracker instance. Importing this file from anywhere in the app
 * (client or server) resolves to the same module — but the io server itself
 * is only attached on the Node.js side (via instrumentation.ts).
 */
export const tracker = new OrderTracker();

/**
 * Start a standalone socket.io server listening on a fixed port (default
 * 3004). Intended to be called ONCE from src/instrumentation.ts so that it
 * is bootstrapped before any request handler runs.
 *
 * Returns the started io server so the caller can keep a reference, or null
 * if running in a non-Node/browser context.
 */
export function initOrderTrackerServer(port: number = 3004): IoServer | null {
  // Guard: do nothing on the browser bundle.
  if (typeof window !== "undefined") return null;
  if (tracker.isReady()) return tracker.getIoServer();

  try {
    // Lazy require so client bundles won't pull socket.io at module load.
    const http = require("node:http") as typeof import("node:http");
    const { Server } = require("socket.io") as typeof import("socket.io");

    const httpServer = http.createServer();
    const io = new Server(httpServer, {
      cors: { origin: "*", methods: ["GET", "POST"] },
      transports: ["websocket", "polling"],
      serveClient: false,
    });

    tracker.attachIo(io);

    httpServer.listen(port, () => {
      console.log(`[order-tracker] socket.io listening on :${port}`);
    });

    // Graceful shutdown.
    process.on("SIGTERM", () => {
      try {
        io.close();
        httpServer.close();
      } catch {
        /* ignore */
      }
    });

    return io;
  } catch (err) {
    console.error("[order-tracker] failed to start socket.io server:", err);
    return null;
  }
}
