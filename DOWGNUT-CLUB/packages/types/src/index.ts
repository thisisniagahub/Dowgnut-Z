export interface User {
  id: string;
  phone: string;
  phoneVerified: boolean;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  birthDate?: Date;
  referralCode: string;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
  wallet?: Wallet;
  creatorProfile?: CreatorProfile;
}

export interface Wallet {
  id: string;
  userId: string;
  coinBalance: number;
  cashBalance: number;
  stampBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Donut {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  basePrice: number;
  imageUrl?: string;
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  type: 'CLASSIC' | 'SPRINKLED' | 'STUFFED' | 'SPECIALTY';
  flavours: Flavour[];
  variants: DonutVariant[];
  rating: number;
  reviewCount: number;
  calories?: number;
  tags: string[];
}

export interface DonutVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface Flavour {
  id: string;
  name: string;
  slug: string;
  description?: string;
  colorHex?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  price: number;
  donut: Donut;
  variant: DonutVariant;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  outletId?: string;
  type: 'REGULAR' | 'GROUP_ORDER' | 'BOX_PARTY' | 'PARTNER_PREORDER';
  status: 'PENDING_PAYMENT' | 'PAID' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'FAILED';
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  voucherId?: string;
  voucherCode?: string;
  notes?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupTime?: Date;
  address?: string;
  addressLat?: number;
  addressLng?: number;
  outletId?: string;
  groupOrderId?: string;
  items: OrderItem[];
  payments: Payment[];
  walletTransactions: WalletTransaction[];
  voucher?: UserVoucher;
  groupOrder?: GroupOrder;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: 'BILLPLZ' | 'TOYYIBPAY' | 'STRIPE' | 'MANUAL';
  providerRef?: string;
  amount: number;
  status: 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paidAt?: Date;
  metadata?: Record<string, any>;
  webhookPayload?: Record<string, any>;
  idempotencyKey: string;
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  discountType: string;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts: string[];
  applicableCategories: string[];
}

export interface UserVoucher {
  id: string;
  userId: string;
  voucherId: string;
  redeemed: boolean;
  redeemedAt?: Date;
  orderId?: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'COIN_EARN' | 'COIN_REDEEM' | 'VOUCHER_REWARD' | 'STAMP_EARN' | 'CASH_CREDIT' | 'ADJUSTMENT' | 'REVERSAL';
  amount: number;
  balanceAfter: number;
  sourceType: string;
  sourceId: string;
  idempotencyKey: string;
  status: 'PENDING' | 'POSTED' | 'REVERSED';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ReferralEvent {
  id: string;
  codeId: string;
  referrerId: string;
  referredId?: string;
  orderId?: string;
  status: 'PENDING' | 'ATTRIBUTED' | 'REWARDED' | 'EXPIRED' | 'FRAUD_FLAGGED';
  attributedAt?: Date;
  rewardedAt?: Date;
  expiresAt?: Date;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  appliedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'FIRST_PURCHASE' | 'REFERRAL' | 'WEEKLY_DROP' | 'SEASONAL' | 'CREATOR_CAMPAIGN' | 'SECRET_DROP' | 'BOX_PARTY';
  startDate: Date;
  endDate?: Date;
  budget?: number;
  spent: number;
  isActive: boolean;
  rules: Record<string, any>;
}

export interface CreatorCampaignAssignment {
  id: string;
  creatorId: string;
  campaignId: string;
  assignedAt: Date;
  assignedBy?: string;
  isActive: boolean;
}

export interface CreatorCommission {
  id: string;
  creatorId: string;
  orderId: string;
  productId?: string;
  amount: number;
  rateType: string;
  rateValue: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'PAID' | 'FAILED';
  attributedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
}

export interface CreatorPayout {
  id: string;
  creatorId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'PAID' | 'FAILED';
  periodStart: Date;
  periodEnd: Date;
  requestedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
  paidBy?: string;
  notes?: string;
}

export interface PartnerProfile {
  id: string;
  userId: string;
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  status: string;
  appliedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface FraudFlag {
  id: string;
  userId: string;
  type: string;
  severity: string;
  description: string;
  evidence?: Record<string, any>;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
}

export interface AiConversation {
  id: string;
  userId: string;
  role: string;
  sessionId: string;
  title?: string;
  status: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
}

export interface AiToolCall {
  id: string;
  conversationId: string;
  toolName: string;
  role: string;
  status: string;
  inputRedacted: Record<string, any>;
  outputRedacted: Record<string, any>;
}

export interface CreatorCampaignAssignment {
  id: string;
  creatorId: string;
  campaignId: string;
  assignedAt: Date;
  assignedBy?: string;
  isActive: boolean;
}

export interface CreatorCommission {
  id: string;
  creatorId: string;
  orderId: string;
  productId?: string;
  amount: number;
  rateType: string;
  rateValue: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'PAID' | 'FAILED';
  attributedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
}

export interface CreatorPayout {
  id: string;
  creatorId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'PAID' | 'FAILED';
  periodStart: Date;
  periodEnd: Date;
  requestedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
  paidBy?: string;
  notes?: string;
}

export interface ContentSubmission {
  id: string;
  creatorId: string;
  campaignId?: string;
  type: string;
  url: string;
  title?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  reward?: Record<string, any>;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface GroupOrder {
  id: string;
  code: string;
  initiatorId: string;
  status: 'collecting' | 'ready' | 'completed' | 'cancelled';
  targetQty: number;
  currentQty: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface GroupOrderParticipant {
  id: string;
  groupOrderId: string;
  userId: string;
  quantity: number;
  notes?: string;
}

export interface UGCSubmission {
  id: string;
  userId: string;
  campaignId?: string;
  type: string;
  url: string;
  title?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  reward?: Record<string, any>;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface FraudFlag {
  id: string;
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: Record<string, any>;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  role: string;
  sessionId: string;
  title?: string;
  status: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
}

export interface AiToolCall {
  id: string;
  conversationId: string;
  toolName: string;
  role: string;
  status: string;
  inputRedacted: Record<string, any>;
  outputRedacted: Record<string, any>;
}

export interface AiApproval {
  id: string;
  conversationId: string;
  actionType: string;
  requestedById: string;
  payloadJson: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  approvedById?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
}

export interface AiRateLimit {
  id: string;
  userId: string;
  role: string;
  windowStart: Date;
  requestCount: number;
}

export interface Drop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  startDate: Date;
  endDate?: Date;
  maxPerCustomer: number;
  isActive: boolean;
  isSecret: boolean;
  waitlistEnabled: boolean;
}

export interface DropProduct {
  id: string;
  dropId: string;
  productId: string;
  variantId?: string;
  stock: number;
  maxPerCustomer: number;
  sortOrder: number;
}

export interface DropWaitlist {
  id: string;
  dropId: string;
  userId: string;
  position: number;
  notified: boolean;
}

export interface GroupOrder {
  id: string;
  code: string;
  initiatorId: string;
  status: 'collecting' | 'ready' | 'completed' | 'cancelled';
  targetQty: number;
  currentQty: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface GroupOrderParticipant {
  id: string;
  groupOrderId: string;
  userId: string;
  quantity: number;
  notes?: string;
}

export interface UGCSubmission {
  id: string;
  userId: string;
  campaignId?: string;
  type: string;
  url: string;
  title?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  reward?: Record<string, any>;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface FraudFlag {
  id: string;
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: Record<string, any>;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  role: string;
  sessionId: string;
  title?: string;
  status: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
}

export interface AiToolCall {
  id: string;
  conversationId: string;
  toolName: string;
  role: string;
  status: string;
  inputRedacted: Record<string, any>;
  outputRedacted: Record<string, any>;
}

export interface AiApproval {
  id: string;
  conversationId: string;
  actionType: string;
  requestedById: string;
  payloadJson: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  approvedById?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
}

export interface AiRateLimit {
  id: string;
  userId: string;
  role: string;
  windowStart: Date;
  requestCount: number;
}

export interface Drop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  startDate: Date;
  endDate?: Date;
  maxPerCustomer: number;
  isActive: boolean;
  isSecret: boolean;
  waitlistEnabled: boolean;
}

export interface DropProduct {
  id: string;
  dropId: string;
  productId: string;
  variantId?: string;
  stock: number;
  maxPerCustomer: number;
  sortOrder: number;
}

export interface DropWaitlist {
  id: string;
  dropId: string;
  userId: string;
  position: number;
  notified: boolean;
}

export interface GroupOrder {
  id: string;
  code: string;
  initiatorId: string;
  status: 'collecting' | 'ready' | 'completed' | 'cancelled';
  targetQty: number;
  currentQty: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface GroupOrderParticipant {
  id: string;
  groupOrderId: string;
  userId: string;
  quantity: number;
  notes?: string;
}

export interface UGCSubmission {
  id: string;
  userId: string;
  campaignId?: string;
  type: string;
  url: string;
  title?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  reward?: Record<string, any>;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface FraudFlag {
  id: string;
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: Record<string, any>;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  role: string;
  sessionId: string;
  title?: string;
  status: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
}

export interface AiToolCall {
  id: string;
  conversationId: string;
  toolName: string;
  role: string;
  status: string;
  inputRedacted: Record<string, any>;
  outputRedacted: Record<string, any>;
}

export interface AiApproval {
  id: string;
  conversationId: string;
  actionType: string;
  requestedById: string;
  payloadJson: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  approvedById?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
}

export interface AiRateLimit {
  id: string;
  userId: string;
  role: string;
  windowStart: Date;
  requestCount: number;
}

export interface Drop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  startDate: Date;
  endDate?: Date;
  maxPerCustomer: number;
  isActive: boolean;
  isSecret: boolean;
  waitlistEnabled: boolean;
}

export interface DropProduct {
  id: string;
  dropId: string;
  productId: string;
  variantId?: string;
  stock: number;
  maxPerCustomer: number;
  sortOrder: number;
}

export interface DropWaitlist {
  id: string;
  dropId: string;
  userId: string;
  position: number;
  notified: boolean;
}

export interface GroupOrder {
  id: string;
  code: string;
  initiatorId: string;
  status: 'collecting' | 'ready' | 'completed' | 'cancelled';
  targetQty: number;
  currentQty: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface GroupOrderParticipant {
  id: string;
  groupOrderId: string;
  userId: string;
  quantity: number;
  notes?: string;
}

export interface UGCSubmission {
  id: string;
  userId: string;
  campaignId?: string;
  type: string;
  url: string;
  title?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  reward?: Record<string, any>;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface FraudFlag {
  id: string;
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: Record<string, any>;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  role: string;
  sessionId: string;
  title?: string;
  status: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
}

export interface AiToolCall {
  id: string;
  conversationId: string;
  toolName: string;
  role: string;
  status: string;
  inputRedacted: Record<string, any>;
  outputRedacted: Record<string, any>;
}

export interface AiApproval {
  id: string;
  conversationId: string;
  actionType: string;
  requestedById: string;
  payloadJson: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  approvedById?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
}

export interface AiRateLimit {
  id: string;
  userId: string;
  role: string;
  windowStart: Date;
  requestCount: number;
}