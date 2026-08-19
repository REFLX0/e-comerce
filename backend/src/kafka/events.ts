export interface OrderCreatedEvent {
  orderId: string;
  userId?: string;
  totalAmount: number;
  customerName: string;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  newStatus: string;
}

export interface ProductUpdatedEvent {
  productId: string;
  slug: string;
}
