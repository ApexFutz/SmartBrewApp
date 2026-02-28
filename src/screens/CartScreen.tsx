import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCart } from "../state/CartContext";
import { Product } from "../types/Product";

type RootStackParamList = {
  Home: undefined;
  Product: { product: Product };
  Cart: undefined;
  Checkout: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

export default function CartScreen({ navigation }: Props) {
  const { items, removeFromCart, setQty, subtotal } = useCart();

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Cart</Text>

      {items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#666" }}>Your cart is empty.</Text>
          <Pressable
            onPress={() => navigation.navigate("Home")}
            style={{
              marginTop: 16,
              paddingVertical: 12,
              paddingHorizontal: 24,
              backgroundColor: "#007AFF",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Browse Products</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ marginTop: 12, gap: 10, flex: 1 }}>
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
          </View>

          <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              Subtotal: ${subtotal.toFixed(2)}
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Checkout")}
            style={{
              marginTop: 16,
              padding: 16,
              backgroundColor: "#007AFF",
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              Proceed to Checkout
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
