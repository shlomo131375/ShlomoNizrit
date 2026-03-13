"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Script } from "@/data/scripts";
import { supabase } from "./supabase";
import { useAuth } from "./authContext";

export interface CartItem {
  script: Script;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  script_id: string | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (script: Script) => void;
  removeFromCart: (scriptId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  isInCart: (scriptId: string) => boolean;
  isOrdered: (scriptId: string) => boolean;
  coupon: AppliedCoupon | null;
  couponLoading: boolean;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderedScriptIds, setOrderedScriptIds] = useState<Set<string>>(new Set());
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Fetch user's ordered script IDs
  useEffect(() => {
    if (!user) {
      setOrderedScriptIds(new Set());
      return;
    }
    supabase
      .from("orders")
      .select("items")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) {
          const ids = new Set<string>();
          for (const order of data) {
            const orderItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
            for (const item of orderItems) {
              ids.add(item.script_id);
            }
          }
          setOrderedScriptIds(ids);
        }
      });
  }, [user]);

  const addToCart = useCallback((script: Script) => {
    if (script.price === "free") return;
    if (orderedScriptIds.has(script.id)) return;
    setItems((prev) => {
      if (prev.find((item) => item.script.id === script.id)) return prev;
      return [...prev, { script, quantity: 1 }];
    });
  }, [orderedScriptIds]);

  const removeFromCart = useCallback((scriptId: string) => {
    setItems((prev) => prev.filter((item) => item.script.id !== scriptId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    setCouponError(null);
  }, []);

  const totalItems = items.length;

  const totalPrice = items.reduce((sum, item) => {
    if (item.script.price === "free") return sum;
    return sum + item.script.price;
  }, 0);

  const discountAmount = (() => {
    if (!coupon) return 0;
    if (coupon.script_id) {
      // Per-product coupon: apply only to the matching item
      const item = items.find((i) => i.script.id === coupon.script_id);
      if (!item || item.script.price === "free") return 0;
      const itemPrice = item.script.price;
      return coupon.discount_type === "percent"
        ? Math.round(itemPrice * coupon.discount_value / 100)
        : Math.min(coupon.discount_value, itemPrice);
    }
    // Global coupon: apply to entire cart
    return coupon.discount_type === "percent"
      ? Math.round(totalPrice * coupon.discount_value / 100)
      : Math.min(coupon.discount_value, totalPrice);
  })();

  const finalPrice = Math.max(0, totalPrice - discountAmount);

  const applyCoupon = useCallback(async (code: string) => {
    setCouponLoading(true);
    setCouponError(null);

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("active", true)
      .single();

    if (error || !data) {
      setCouponError("קוד קופון לא תקין");
      setCouponLoading(false);
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError("קופון פג תוקף");
      setCouponLoading(false);
      return;
    }

    if (data.max_uses && data.used_count >= data.max_uses) {
      setCouponError("קופון מוצה");
      setCouponLoading(false);
      return;
    }

    if (data.min_order && totalPrice < data.min_order) {
      setCouponError(`מינימום הזמנה ₪${data.min_order}`);
      setCouponLoading(false);
      return;
    }

    if (data.script_id) {
      const hasProduct = items.some((i) => i.script.id === data.script_id);
      if (!hasProduct) {
        setCouponError("הקופון תקף למוצר שלא נמצא בעגלה");
        setCouponLoading(false);
        return;
      }
    }

    setCoupon({
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      script_id: data.script_id || null,
    });
    setCouponLoading(false);
  }, [totalPrice]);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponError(null);
  }, []);

  const isInCart = useCallback(
    (scriptId: string) => items.some((item) => item.script.id === scriptId),
    [items]
  );

  const isOrdered = useCallback(
    (scriptId: string) => orderedScriptIds.has(scriptId),
    [orderedScriptIds]
  );

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, totalItems, totalPrice, discountAmount, finalPrice, isInCart, isOrdered, coupon, couponLoading, couponError, applyCoupon, removeCoupon }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
