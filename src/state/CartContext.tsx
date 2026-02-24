import React, { createContext, useContext, useMemo, useState } from "react";
import { Product } from "../types/Product";

export type CartItem = {
  product: Product;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product) => { ok: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => { ok: boolean; message?: string };
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

function toNumber(n: string): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    const stock = toNumber(product.stock);

    if (stock <= 0) return { ok: false, message: "Out of stock" };

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx === -1) return [...prev, { product, qty: 1 }];

      const existing = prev[idx];
      if (existing.qty + 1 > stock) return prev; // do nothing if exceeds stock

      const next = [...prev];
      next[idx] = { ...existing, qty: existing.qty + 1 };
      return next;
    });

    // If user already at max stock, we can report it
    const existing = items.find((i) => i.product.id === product.id);
    if (existing && existing.qty >= stock) {
      return { ok: false, message: "Cannot add more than available stock" };
    }

    return { ok: true };
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const setQty = (productId: string, qty: number) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === productId);
      if (idx === -1) return prev;

      const stock = toNumber(prev[idx].product.stock);
      const clamped = Math.max(1, Math.min(qty, stock || 1));

      const next = [...prev];
      next[idx] = { ...next[idx], qty: clamped };
      return next;
    });

    const found = items.find((i) => i.product.id === productId);
    if (found) {
      const stock = toNumber(found.product.stock);
      if (qty > stock) return { ok: false, message: "Cannot exceed stock" };
    }
    return { ok: true };
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + toNumber(item.product.price_usd) * item.qty, 0);
  }, [items]);

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, setQty, subtotal }),
    [items, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
