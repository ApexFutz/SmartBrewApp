import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { useCart } from "../state/CartContext";

export default function CartScreen() {
  const { items, removeFromCart, setQty, subtotal } = useCart();

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Cart</Text>

      {items.length === 0 ? (
        <Text style={{ marginTop: 20 }}>Your cart is empty.</Text>
      ) : (
        <View style={{ marginTop: 12, gap: 10 }}>
          {items.map((item) => {
            const price = Number(item.product.price_usd) || 0;
            const lineTotal = price * item.qty;
            return (
              <View key={item.product.id} style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.product.name}</Text>
                <Text>${price.toFixed(2)} • Stock: {item.product.stock}</Text>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 10, alignItems: "center" }}>
                  <Pressable
                    onPress={() => setQty(item.product.id, item.qty - 1)}
                    style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10 }}
                  >
                    <Text>-</Text>
                  </Pressable>

                  <Text>Qty: {item.qty}</Text>

                  <Pressable
                    onPress={() => setQty(item.product.id, item.qty + 1)}
                    style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10 }}
                  >
                    <Text>+</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => removeFromCart(item.product.id)}
                    style={{ marginLeft: "auto", paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10 }}
                  >
                    <Text>Remove</Text>
                  </Pressable>
                </View>

                <Text style={{ marginTop: 10 }}>Line total: ${lineTotal.toFixed(2)}</Text>
              </View>
            );
          })}

          <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              Subtotal: ${subtotal.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}