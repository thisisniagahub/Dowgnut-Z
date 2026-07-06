"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, ShoppingBag, Truck } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const FREE_DELIVERY_THRESHOLD = 25;
const DELIVERY_FLAT = 3.99;

export function CheckoutView() {
  const cart = useShop((s) => s.cart);
  const checkout = useShop((s) => s.checkout);
  const setView = useShop((s) => s.setView);
  const startTracking = useShop((s) => s.startTracking);
  const { toast } = useToast();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    address: "",
    city: "",
    zip: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, c) => sum + c.donut.price * c.quantity, 0);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FLAT;
  const total = subtotal + delivery;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const missing: string[] = [];
    if (!form.customerName.trim()) missing.push("name");
    if (!form.customerEmail.trim()) missing.push("email");
    if (!form.address.trim()) missing.push("address");
    if (!form.city.trim()) missing.push("city");
    if (!form.zip.trim()) missing.push("zip");
    return missing;
  };

  const onPlace = async () => {
    const missing = validate();
    if (missing.length > 0) {
      toast({
        title: "Mind the gaps",
        description: `Missing: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const order = await checkout(form);
      toast({
        title: "Order placed! 🍩",
        description: `Order ${order.id.slice(0, 8)} is on its way.`,
      });
      startTracking(order.id, form.customerName);
    } catch (err: any) {
      toast({
        title: "Couldn't place order",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <section className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12 pt-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-[var(--color-dowgnut-blue-dark)]/15 bg-[var(--color-dowgnut-cream)] p-10 text-center">
          <ShoppingBag className="size-10 text-[var(--color-dowgnut-pink)]" />
          <h2 className="graffiti-text text-2xl text-[var(--color-dowgnut-blue-dark)]">
            Your cart is empty
          </h2>
          <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/70">
            Add some dowgs before checking out!
          </p>
          <Button
            onClick={() => setView("shop")}
            className="rounded-full bg-[var(--color-dowgnut-pink)] px-6 text-white hover:bg-[var(--color-dowgnut-pink-dark)] hover:text-white"
          >
            Go shopping
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("shop")}
            aria-label="Back to shop"
            className="inline-flex size-11 items-center justify-center rounded-full bg-white text-[var(--color-dowgnut-blue)] shadow-sm hover:bg-[var(--color-dowgnut-blue)] hover:text-white"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-dowgnut-pink-dark)]">
              Almost there
            </p>
            <h1 className="graffiti-text text-3xl text-[var(--color-dowgnut-blue-dark)] sm:text-4xl">
              Checkout
            </h1>
          </div>
        </div>
        <img
          src="/brand/dowgnut-mascot.png"
          alt=""
          className="hidden size-16 animate-float object-contain sm:block"
        />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <Card className="gap-4 rounded-3xl border-2 border-[var(--color-dowgnut-blue-dark)]/10 bg-[var(--color-dowgnut-cream)] p-5 sm:p-6">
          <h2 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
            Delivery details
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.customerName}
                onChange={set("customerName")}
                placeholder="Jane Doe"
                className="h-11 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.customerEmail}
                onChange={set("customerEmail")}
                placeholder="jane@dowgnut.com"
                className="h-11 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={set("address")}
                placeholder="123 Sugar St"
                className="h-11 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={form.city}
                onChange={set("city")}
                placeholder="Sprinklesville"
                className="h-11 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="zip">ZIP *</Label>
              <Input
                id="zip"
                value={form.zip}
                onChange={set("zip")}
                placeholder="12345"
                className="h-11 bg-white"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={set("notes")}
                placeholder="Leave at door, ring bell, etc."
                className="min-h-16 bg-white"
              />
            </div>
          </div>
          <Button
            onClick={onPlace}
            disabled={submitting}
            className="mt-2 h-12 w-full rounded-full bg-[var(--color-dowgnut-pink)] text-base font-bold text-white hover:bg-[var(--color-dowgnut-pink-dark)] hover:text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Placing order…
              </>
            ) : (
              <>Place order • ${total.toFixed(2)}</>
            )}
          </Button>
        </Card>

        {/* Summary */}
        <Card className="h-fit gap-3 rounded-3xl border-2 border-[var(--color-dowgnut-blue-dark)]/10 bg-white p-5 sm:p-6">
          <h2 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
            Order summary
          </h2>
          <ul className="flex flex-col gap-2">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-2xl bg-[var(--color-dowgnut-cream)]/70 p-2"
              >
                <img
                  src={item.donut.imgUrl}
                  alt={item.donut.name}
                  className="size-12 object-contain"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="line-clamp-1 text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">
                    {item.donut.name}
                  </span>
                  <span className="text-xs text-[var(--color-dowgnut-blue-dark)]/60">
                    {item.quantity} × ${item.donut.price.toFixed(2)}
                  </span>
                </div>
                <span className="text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">
                  ${(item.donut.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-1 border-t border-[var(--color-dowgnut-blue-dark)]/10 pt-3 text-sm">
            <div className="flex justify-between text-[var(--color-dowgnut-blue-dark)]/80">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--color-dowgnut-blue-dark)]/80">
              <span className="inline-flex items-center gap-1">
                <Truck className="size-4" /> Delivery
              </span>
              <span className="font-semibold">
                {delivery === 0 ? "FREE" : `$${delivery.toFixed(2)}`}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-[var(--color-dowgnut-blue-dark)]/10 pt-2 text-base font-bold text-[var(--color-dowgnut-blue-dark)]">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
