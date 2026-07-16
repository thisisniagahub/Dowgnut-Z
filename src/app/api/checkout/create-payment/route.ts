import { NextResponse } from "next/server";
import { createPaymentForm, getSenangPayConfig } from "@/lib/payments/senangpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customerName, customerEmail, customerPhone, amount, items, returnUrl } = body;

    if (!orderId || !customerName || !customerEmail || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, customerName, customerEmail, amount" },
        { status: 400 }
      );
    }

    const config = getSenangPayConfig();

    if (!config.merchantId || !config.secretKey) {
      console.error("[api/checkout/create-payment] SenangPay not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const payment = createPaymentForm(config, {
      orderId,
      customerName,
      customerEmail,
      customerPhone: customerPhone || "",
      amount,
      items: items || [],
      returnUrl: returnUrl || `${process.env.NEXTAUTH_URL}/order/${orderId}`,
    });

    return NextResponse.json({
      paymentFormHtml: payment.paymentFormHtml,
      paymentUrl: payment.paymentUrl,
      transactionId: payment.transactionId,
    });
  } catch (err: any) {
    console.error("[api/checkout/create-payment POST]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "senangpay" });
}