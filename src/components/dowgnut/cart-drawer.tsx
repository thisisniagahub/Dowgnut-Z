"use client";

import { Minus, Plus, ShoppingCart, Trash2, Truck, X } from "lucide-react";
import { useShop } from "@/store/use-shop";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FREE_DELIVERY_THRESHOLD = 25;
const DELIVERY_FLAT = 3.99;

export function CartDrawer() {
  const open = useShop((s) => s.cartOpen);
  const setOpen = useShop((s) => s.setCartOpen);
  const cart = useShop((s) => s.cart);
  const loading = useShop((s) => s.cartLoading);
  const updateCartQty = useShop((s) => s.updateCartQty);
  const removeFromCart = useShop((s) => s.removeFromCart);
  const clearCart = useShop((s) => s.clearCart);
  const setView = useShop((s) => s.setView);
  const { toast } = useToast();

  const subtotal = cart.reduce((sum, c) => sum + c.donut.price * c.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FLAT;
  const total = subtotal + delivery;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progressPct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  const onCheckout = () => {
    if (cart.length === 0) return;
    setOpen(false);
    setView("checkout");
  };

  const onClear = async () => {
    await clearCart();
    toast({ title: "Cart cleared" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-[var(--color-dowgnut-cream)] p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b-4 border-[var(--color-dowgnut-pink)] bg-[var(--color-dowgnut-blue)] p-4 text-white">
          <SheetTitle className="graffiti-text flex items-center gap-2 text-2xl text-white">
            <ShoppingCart className="size-5" />
            Your Dowgs
          </SheetTitle>
          <p className="text-xs text-white/70">
            {cart.length} item{cart.length === 1 ? "" : "s"} in the box
          </p>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto scrollbar-dowgnut p-4">
          {loading && cart.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[var(--color-dowgnut-blue)]">
              <p className="text-sm">Loading your dowgs…</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <img
                src="/brand/dowgnut-mascot.png"
                alt=""
                className="h-28 w-28 animate-float object-contain"
              />
              <div>
                <h3 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
                  Empty box?
                </h3>
                <p className="mt-1 text-sm text-[var(--color-dowgnut-blue-dark)]/70">
                  Go shop some dowgs, friend.
                </p>
              </div>
              <Button
                onClick={() => {
                  setOpen(false);
                  setView("shop");
                }}
                className="rounded-full bg-[var(--color-dowgnut-pink)] px-6 text-white hover:bg-[var(--color-dowgnut-pink-dark)] hover:text-white"
              >
                Browse flavors
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-[var(--color-dowgnut-blue-dark)]/10 bg-white/80 p-3"
                >
                  <img
                    src={item.donut.imgUrl}
                    alt={item.donut.name}
                    className="size-16 shrink-0 object-contain"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">
                        {item.donut.name}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove RM{item.donut.name}`}
                        className="text-[var(--color-dowgnut-blue-dark)]/40 hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <p className="text-xs text-[var(--color-dowgnut-blue)]/70">
                      RM{item.donut.price.toFixed(2)} each
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-full border border-[var(--color-dowgnut-blue-dark)]/15 bg-white">
                        <button
                          onClick={() =>
                            updateCartQty(item.id, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="inline-flex size-8 items-center justify-center text-[var(--color-dowgnut-blue)] hover:text-[var(--color-dowgnut-pink)]"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-7 text-center text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQty(item.id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="inline-flex size-8 items-center justify-center text-[var(--color-dowgnut-blue)] hover:text-[var(--color-dowgnut-pink)]"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">
                        RM{(item.donut.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-[var(--color-dowgnut-blue-dark)]/10 bg-[var(--color-dowgnut-cream)] p-4">
            {/* Free delivery progress */}
            <div className="mb-3 rounded-2xl bg-white/70 p-3">
              <div className="flex items-center gap-2 text-xs">
                <Truck className="size-4 text-[var(--color-dowgnut-blue)]" />
                {remaining > 0 ? (
                  <span className="text-[var(--color-dowgnut-blue-dark)]">
                    Add <strong>RM{remaining.toFixed(2)}</strong> for free delivery
                  </span>
                ) : (
                  <span className="font-bold text-[var(--color-dowgnut-pink-dark)]">
                    You&apos;ve unlocked free delivery! 🎉
                  </span>
                )}
              </div>
              <Progress
                value={progressPct}
                className="mt-2 h-2 bg-[var(--color-dowgnut-blue-dark)]/10"
              />
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-[var(--color-dowgnut-blue-dark)]/80">
                <span>Subtotal</span>
                <span className="font-semibold">RM{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-dowgnut-blue-dark)]/80">
                <span>Delivery</span>
                <span className="font-semibold">
                  {delivery === 0 ? "FREE" : `RMRM{delivery.toFixed(2)}`}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-[var(--color-dowgnut-blue-dark)]/10 pt-2 text-base font-bold text-[var(--color-dowgnut-blue-dark)]">
                <span>Total</span>
                <span>RM{total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={onCheckout}
              className="mt-4 h-12 w-full rounded-full bg-[var(--color-dowgnut-pink)] text-base font-bold text-white hover:bg-[var(--color-dowgnut-pink-dark)] hover:text-white"
            >
              Checkout • RM{total.toFixed(2)}
            </Button>
            <button
              onClick={onClear}
              className={cn(
                "mt-2 inline-flex w-full items-center justify-center gap-1.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-dowgnut-blue-dark)]/50 hover:text-destructive"
              )}
            >
              <Trash2 className="size-3.5" /> Clear cart
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
