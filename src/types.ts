// All money is integer cents. Never floats.
export type Cents = number;

export interface Customer {
  id: number;
  name: string;
  email: string; // stored lowercase
  passwordHash: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  priceCents: Cents;
  stock: number;
}

export interface DiscountCode {
  code: string; // stored uppercase
  type: "percent" | "fixed";
  value: number; // percent (0-100) or cents
  singleUsePerCustomer: boolean;
  minSubtotalCents?: Cents;
  expiresAt?: Date;
}

export interface Redemption {
  code: string;
  customerId: number;
  orderId: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  qty: number;
  unitPriceCents: Cents;
}

export interface Order {
  id: number;
  customerId: number;
  items: OrderItem[];
  subtotalCents: Cents;
  discountCents: Cents;
  discountCode: string | null;
  shippingCents: Cents;
  totalCents: Cents;
  createdAt: Date;
}

export interface Payment {
  id: number;
  orderId: number;
  amountCents: Cents;
  idempotencyKey: string;
  status: "succeeded";
}

export interface Refund {
  id: number;
  orderId: number;
  orderItemId: number;
  amountCents: Cents;
  reason: string;
}
