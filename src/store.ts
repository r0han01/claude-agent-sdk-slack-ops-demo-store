import type { Customer, DiscountCode, Order, Payment, Product, Redemption, Refund } from "./types.js";

/** In-memory data store. Stands in for the database so the service and its tests stay fast. */
export class Store {
  customers: Customer[] = [];
  products: Product[] = [];
  discountCodes: DiscountCode[] = [];
  redemptions: Redemption[] = [];
  orders: Order[] = [];
  payments: Payment[] = [];
  refunds: Refund[] = [];

  private counters = new Map<string, number>();

  nextId(kind: string): number {
    const next = (this.counters.get(kind) ?? 0) + 1;
    this.counters.set(kind, next);
    return next;
  }

  getOrder(orderId: number): Order {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    return order;
  }

  getProduct(productId: number): Product {
    const product = this.products.find((p) => p.id === productId);
    if (!product) throw new Error(`Product ${productId} not found`);
    return product;
  }
}
