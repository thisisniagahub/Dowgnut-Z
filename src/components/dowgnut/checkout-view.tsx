"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, ShoppingBag, Truck, Check, ShieldCheck } from "lucide-react";
import { useShop } from "@/store/use-shop";
import { useGamification } from "@/store/use-gamification";
import { celebrateOrderComplete } from "@/lib/celebrations";
import { playOrderComplete } from "@/lib/sounds";
import { DuitNowQRBurst } from "./DuitNowQRBurst";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FREE_DELIVERY_THRESHOLD = 25;
const DELIVERY_FLAT = 3.99;

type PaymentMethod = "tng" | "duitnow" | "card" | "senangpay";

const PAYMENTS: {
  id: PaymentMethod;
  name: string;
  desc: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
}[] = [
  {
    id: "senangpay",
    name: "SenangPay",
    desc: "FPX, Cards, eWallets",
    badge: "SP",
    badgeBg: "bg-[#FF6B35]",
    badgeColor: "text-white",
  },
  {
    id: "tng",
    name: "Touch 'n Go",
    desc: "Pay with TNG eWallet",
    badge: "TNG",
    badgeBg: "bg-[#005EB8]",
    badgeColor: "text-white",
  },
  {
    id: "duitnow",
    name: "DuitNow",
    desc: "Instant bank transfer",
    badge: "DN",
    badgeBg: "bg-[var(--color-dowgnut-blue-dark)]",
    badgeColor: "text-white",
  },
  {
    id: "card",
    name: "Card",
    desc: "Visa / Mastercard",
    badge: "💳",
    badgeBg: "bg-white",
    badgeColor: "text-[var(--color-dowgnut-blue-dark)]",
  },
];

export function CheckoutView() {
  const cart = useShop((s) => s.cart);
  const checkout = useShop((s) => s.checkout);
  const setView = useShop((s) => s.setView);
  const startTracking = useShop((s) => s.startTracking);
  const recordOrder = useGamification((s) => s.recordOrder);
  const { toast } = useToast();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    notes: "",
  });
  const [payment, setPayment] = useState<PaymentMethod>("senangpay");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const subtotal = cart.reduce((sum, c) => sum + c.donut.price * c.quantity, 0);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FLAT;
  const total = subtotal + delivery;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors.length > 0) {
      const fieldName = k === "customerName" ? "name" : k === "customerEmail" ? "email" : k;
      setErrors((prev) => prev.filter((err) => err !== fieldName));
    }
  };

  const validate = () => {
    const missing: string[] = [];
    if (!form.customerName.trim()) missing.push("name");
    if (!form.customerEmail.trim()) missing.push("email");
    if (!form.phone.trim()) missing.push("phone");
    if (!form.address.trim()) missing.push("address");
    if (!form.city.trim()) missing.push("city");
    if (!form.zip.trim()) missing.push("zip");
    return missing;
  };

  const onPlace = async () => {
    const missing = validate();
    setErrors(missing);
    if (missing.length > 0) {
      toast({
        title: "Mind the gaps",
        description: `Please fill in all required fields: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      // First create the order
      const order = await checkout(form);
      
      toast({
        title: "Order created! 🍩",
        description: `Order ${order.id.slice(0, 8)} created. Redirecting to payment...`,
      });

      // Celebrate + gamification
      celebrateOrderComplete();
      playOrderComplete();
      const donutNames = order.items.map((i: any) => i.name);
      const types = cart.map((c) => c.donut.type);
      recordOrder(donutNames, types);
      startTracking(order.id, form.customerName);

      // Redirect to payment gateway
      if (payment === "senangpay") {
        const res = await fetch("/api/checkout/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            customerName: form.customerName,
            customerEmail: form.customerEmail,
            customerPhone: form.phone,
            amount: total,
            items: order.items,
            returnUrl: `${window.location.origin}/order/${order.id}`,
          }),
        });

        const data = await res.json();
        
        if (data.paymentFormHtml) {
          // Render the payment form in an iframe or new window
          const paymentWindow = window.open("", "_blank");
          if (paymentWindow) {
            paymentWindow.document.write(data.paymentFormHtml);
            paymentWindow.document.close();
          } else {
            // Fallback: create a form and submit
            const div = document.createElement("div");
            div.innerHTML = data.paymentFormHtml;
            const formEl = div.querySelector("form");
            if (formEl) {
              document.body.appendChild(formEl);
              formEl.submit();
            }
          }
        }
      } else if (payment === "duitnow") {
        // For DuitNow, show QR burst
        setView("duitnow-qr");
      }
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
            className="inline-flex size-11 items-center justify-center rounded-full bg-white text-[var(--color-dowgnut-blue)] shadow-sm hover:bg-[var(--color-dowgnut-blue)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)] focus-visible:ring-offset-2"
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
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left: delivery + payment */}
        <div className="flex flex-col gap-6">
          {/* Delivery details */}
          <Card className="gap-4 rounded-3xl border-2 border-[var(--color-dowgnut-blue-dark)]/10 bg-[var(--color-dowgnut-cream)] p-5 sm:p-6">
            <h2 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
              Delivery details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className={cn(errors.includes("name") && "text-destructive")}>
                  Name *
                </Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={form.customerName}
                  onChange={set("customerName")}
                  placeholder="Jane Doe"
                  className={cn("h-11 bg-white", errors.includes("name") && "border-destructive ring-destructive focus-visible:ring-destructive")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className={cn(errors.includes("email") && "text-destructive")}>
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.customerEmail}
                  onChange={set("customerEmail")}
                  placeholder="jane@dowgnut.com"
                  className={cn("h-11 bg-white", errors.includes("email") && "border-destructive ring-destructive focus-visible:ring-destructive")}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="phone" className={cn(errors.includes("phone") && "text-destructive")}>
                  Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+60 12-345 6789"
                  className={cn("h-11 bg-white", errors.includes("phone") && "border-destructive ring-destructive focus-visible:ring-destructive")}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="address" className={cn(errors.includes("address") && "text-destructive")}>
                  Address *
                </Label>
                <Input
                  id="address"
                  autoComplete="street-address"
                  value={form.address}
                  onChange={set("address")}
                  placeholder="123 Jalan Sugar"
                  className={cn("h-11 bg-white", errors.includes("address") && "border-destructive ring-destructive focus-visible:ring-destructive")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city" className={cn(errors.includes("city") && "text-destructive")}>
                  City *
                </Label>
                <Input
                  id="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={set("city")}
                  placeholder="Kuala Lumpur"
                  className={cn("h-11 bg-white", errors.includes("city") && "border-destructive ring-destructive focus-visible:ring-destructive")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="zip" className={cn(errors.includes("zip") && "text-destructive")}>
                  Postcode *
                </Label>
                <Input
                  id="zip"
                  autoComplete="postal-code"
                  value={form.zip}
                  onChange={set("zip")}
                  placeholder="50000"
                  className={cn("h-11 bg-white", errors.includes("zip") && "border-destructive ring-destructive focus-visible:ring-destructive")}
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
          </Card>

          {/* Payment method — Malaysia gateways */}
          <Card className="gap-4 rounded-3xl border-2 border-[var(--color-dowgnut-blue-dark)]/10 bg-[var(--color-dowgnut-cream)] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[var(--color-dowgnut-blue)]" />
              <h2 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
                Payment method
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PAYMENTS.map((p) => {
                const selected = payment === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPayment(p.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all",
                      selected
                        ? "border-[var(--color-dowgnut-pink)] bg-white shadow-md"
                        : "border-[var(--color-dowgnut-blue-dark)]/10 bg-white/60 hover:border-[var(--color-dowgnut-blue-dark)]/30",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-dowgnut-pink)] focus-visible:ring-offset-2"
                    )}
                  >
                    {selected && (
                      <span className="absolute right-2 top-2 inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                    <span className={cn("inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-black", p.badgeBg, p.badgeColor)}>
                      {p.badge}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">{p.name}</p>
                      <p className="text-[11px] text-[var(--color-dowgnut-blue-dark)]/60">{p.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[var(--color-dowgnut-blue-dark)]/50">
              🔒 Secured by FPX / SenangPay. You'll be redirected to complete payment.
            </p>
          </Card>
        </div>

        {/* Right: order summary */}
        <Card className="h-fit gap-3 rounded-3xl border-2 border-[var(--color-dowgnut-blue-dark)]/10 bg-white p-5 sm:p-6">
          <h2 className="graffiti-text text-xl text-[var(--color-dowgnut-blue-dark)]">
            Order summary
          </h2>
          <ul className="flex flex-col gap-2">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-[var(--color-dowgnut-cream)]/70 p-2">
                <img src={item.donut.imgUrl} alt={item.donut.name} width={48} height={48} className="size-12 object-contain" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="line-clamp-1 text-sm font-bold text-[var(--color-dowgnut-blue-dark)]">{item.donut.name}</span>
                  <span className="text-xs tabular-nums text-[var(--color-dowgnut-blue-dark)]/60">{item.quantity} × RM{item.donut.price.toFixed(2)}</span>
                </div>
                <span className="text-sm font-bold tabular-nums text-[var(--color-dowgnut-blue-dark)]">RM{(item.donut.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-1 border-t border-[var(--color-dowgnut-blue-dark)]/10 pt-3 text-sm">
            <div className="flex justify-between text-[var(--color-dowgnut-blue-dark)]/80">
              <span>Subtotal</span>
              <span className="font-semibold tabular-nums">RM{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[var(--color-dowgnut-blue-dark)]/80">
              <span className="inline-flex items-center gap-1"><Truck className="size-4" /> Delivery</span>
              <span className="font-semibold tabular-nums">{delivery === 0 ? "FREE" : `RM${delivery.toFixed(2)}`}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-[var(--color-dowgnut-blue-dark)]/10 pt-2 text-base font-bold text-[var(--color-dowgnut-blue-dark)]">
              <span>Total</span>
              <span className="tabular-nums">RM{total.toFixed(2)}</span>
            </div>
          </div>
          <Button
            onClick={onPlace}
            disabled={submitting}
            className="mt-2 h-12 w-full rounded-full bg-[var(--color-dowgnut-pink)] text-base font-bold text-white hover:bg-[var(--color-dowgnut-pink-dark)] hover:text-white"
          >
            {submitting ? (
              <><Loader2 className="size-5 animate-spin" /> Processing payment…</>
            ) : (
              <>Pay RM{total.toFixed(2)} with {PAYMENTS.find((p) => p.id === payment)?.name}</>
            )}
          </Button>
        </Card>
      </div>
    </section>
  );
}