import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Product } from "../types/Product";
import { loadProductsFromCsv } from "../data/loadProducts";

type ProductContextType = {
  products: Product[];
  loading: boolean;
  error: string | null;
  decrementInventory: (productId: string, quantity: number) => boolean;
  getProductById: (productId: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
};

const ProductContext = createContext<ProductContextType | null>(null);

function toNumber(n: string): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadProductsFromCsv();
      setProducts(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const getProductById = useCallback(
    (productId: string) => {
      return products.find((p) => p.id === productId);
    },
    [products]
  );

  const decrementInventory = useCallback(
    (productId: string, quantity: number): boolean => {
      let success = false;
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === productId);
        if (idx === -1) return prev;

        const product = prev[idx];
        const currentStock = toNumber(product.stock);

        if (currentStock < quantity) {
          return prev; // Cannot decrement - not enough stock
        }

        success = true;
        const next = [...prev];
        next[idx] = {
          ...product,
          stock: String(currentStock - quantity),
        };
        return next;
      });
      return success;
    },
    []
  );

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      decrementInventory,
      getProductById,
      refreshProducts: loadProducts,
    }),
    [products, loading, error, decrementInventory, getProductById, loadProducts]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
}
