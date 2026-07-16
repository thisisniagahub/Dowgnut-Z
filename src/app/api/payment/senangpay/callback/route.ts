import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyCallback } from "@/lib/payments/senangpay";

const senangPayConfig = {
  merchantId: process.env.SENANGPAY_MERCHANT_ID || "",
  secretKey: process.env.SENANGPAY_SECRET_KEY || "",
  verifyKey: process.env.SENANGPAY_VERIFY_KEY || "",
  isSandbox: process.env.SENANGPAY_SANDBOX === "true",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = Object.fromEntries(formData.entries());

    // Verify callback signature
    if (!verifyCallback(senangPayConfig, payload as any)) {
      console.error("[senangpay/callback] Invalid signature");
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/payment/failed?reason=invalid_signature`
      );
    }

    const { order_id, status, trans_id, paid_amount } = payload;

    // Update order status
    if (status === "success") {
      await db.order.update({
        where: { id: order_id },
        data: {
          status: "preparing",
          // You could add a paymentTransaction field here
        },
      });

      // Redirect to success page
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/order/${order_id}?payment=success&trans_id=${trans_id}`
      );
    } else {
      await db.order.update({
        where: { id: order_id },
        data: {
          status: "failed",
        },
      });

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/order/${order_id}?payment=failed&reason=${status}`
      );
    }
  } catch (err) {
    console.error("[senangpay/callback POST]", err);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/payment/failed?reason=server_error`
    );
  }
}

// Also handle GET (some gateways redirect via GET)
export async function GET(request: Request) {
  return POST(request);
}
