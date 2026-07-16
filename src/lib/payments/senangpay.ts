// SenangPay Payment Gateway Integration for DowgNut-Z
// Documentation: https://docs.senangpay.my/

import crypto from "crypto";

export interface SenangPayConfig {
  merchantId: string;
  secretKey: string;
  verifyKey: string;
  isSandbox: boolean;
}

export interface PaymentRequest {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number; // in MYR
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  returnUrl: string;
  callbackUrl?: string;
}

export interface PaymentResponse {
  paymentFormHtml: string;
  paymentUrl: string;
  transactionId: string;
}

export interface CallbackPayload {
  order_id: string;
  merchant_id: string;
  transaction_id: string;
  amount: string;
  payment_status: "SUCCESS" | "FAILED" | "PENDING";
  payment_method: string;
  payment_date: string;
  signature: string;
}

const DEFAULT_BASE_URL = "https://app.senangpay.my/payment";
const SANDBOX_BASE_URL = "https://sandbox.senangpay.my/payment";

/**
 * Generate signature for payment request
 * Signature = SHA256(merchant_id + order_id + amount + currency + secret_key)
 */
export function generateSignature(
  merchantId: string,
  orderId: string,
  amount: number,
  currency: string,
  secretKey: string
): string {
  const signatureString = `${merchantId}${orderId}${amount}${currency}${secretKey}`;
  return crypto.createHmac("sha256", secretKey).update(signatureString).digest("hex");
}

/**
 * Verify SenangPay callback signature
 * Expected signature = SHA256(merchant_id + order_id + transaction_id + amount + payment_status + verify_key)
 */
export function verifyCallback(config: SenangPayConfig, payload: CallbackPayload): boolean {
  const { signature, ...data } = payload;
  // Order matters: merchant_id + order_id + transaction_id + amount + payment_status + verify_key
  const expectedString = `${data.merchant_id}${data.order_id}${data.transaction_id}${data.amount}${data.payment_status}${config.verifyKey}`;
  const expectedSignature = crypto.createHmac("sha256", config.verifyKey).update(expectedString).digest("hex");
  return timingSafeEqual(signature, expectedSignature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

/**
 * Create payment form HTML that auto-submits to SenangPay
 */
export function createPaymentForm(config: SenangPayConfig, request: PaymentRequest): PaymentResponse {
  const {
    orderId,
    customerName,
    customerEmail,
    customerPhone,
    amount,
    items,
    returnUrl,
    callbackUrl,
  } = request;

  const baseUrl = config.isSandbox ? SANDBOX_BASE_URL : DEFAULT_BASE_URL;

  // Prepare item details for description
  const itemNames = items.map((item) => `${item.name} x${item.quantity}`).join(", ");

  // Amount in cents (SenangPay expects amount in smallest currency unit)
  const amountInCents = Math.round(amount * 100);

  // Generate signature
  const signature = generateSignature(config.merchantId, orderId, amountInCents, "MYR", config.secretKey);

  const formData = {
    merchant_id: config.merchantId,
    order_id: orderId,
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    amount: amountInCents.toString(),
    currency: "MYR",
    description: `DowgNut Order: ${itemNames}`,
    return_url: returnUrl,
    callback_url: callbackUrl || `${returnUrl}/callback`,
    signature,
  };

  // Build form fields
  const formFields = Object.entries(formData)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${escapeHtml(value)}" />`)
    .join("\n");

  // Build form HTML
  const paymentFormHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to SenangPay...</title>
  <style>
    body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f7ffd6; }
    .loader { width: 48px; height: 48px; border: 4px solid #e8f866; border-top: 4px solid #f05a9b; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body onload="document.getElementById('senangpay-form').submit()">
  <div class="loader"></div>
  <form id="senangpay-form" action="${baseUrl}" method="POST" target="_blank">
    ${formFields}
    <noscript><button type="submit">Continue to Payment</button></noscript>
  </form>
</body>
</html>
  `.trim();

  return {
    paymentFormHtml,
    paymentUrl: baseUrl,
    transactionId: `${orderId}-${Date.now()}`,
  };
}
// Default configuration from environment variables
export function getSenangPayConfig(): SenangPayConfig {
  return {
    merchantId: process.env.SENANGPAY_MERCHANT_ID || "",
    secretKey: process.env.SENANGPAY_SECRET_KEY || "",
    verifyKey: process.env.SENANGPAY_VERIFY_KEY || "",
    isSandbox: process.env.SENANGPAY_SANDBOX === "true",
  };
}
