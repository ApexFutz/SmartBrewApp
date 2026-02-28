import { Product } from "./Product";

export type OrderItem = {
  product: Product;
  qty: number;
  lineTotal: number;
};

export type ShippingInfo = {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

export type PaymentInfo = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

export type Order = {
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  createdAt: Date;
};
