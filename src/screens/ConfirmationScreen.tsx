import React from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Order } from "../types/Order";

type RootStackParamList = {
  Home: undefined;
  Product: { product: import("../types/Product").Product };
  Cart: undefined;
  Checkout: undefined;
  Confirmation: { order: Order };
};

type Props = NativeStackScreenProps<RootStackParamList, "Confirmation">;

function toNumber(n: string): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export default function ConfirmationScreen({ route, navigation }: Props) {
  const { order } = route.params;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Success Header */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Text style={{ fontSize: 48 }}>✓</Text>
          <Text style={{ fontSize: 24, fontWeight: "700", marginTop: 8 }}>
            Order Confirmed!
          </Text>
          <Text style={{ fontSize: 16, color: "#666", marginTop: 4 }}>
            Thank you for your purchase
          </Text>
        </View>

        {/* Order Number */}
        <View
          style={{
            backgroundColor: "#f0f0f0",
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 14, color: "#666" }}>Order Number</Text>
          <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 4 }}>
            {order.orderNumber}
          </Text>
          <Text style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
            {formatDate(order.createdAt)}
          </Text>
        </View>

        {/* Order Items */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            Order Details
          </Text>
          {order.items.map((item) => (
            <View
              key={item.product.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14 }}>{item.product.name}</Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  Qty: {item.qty}
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: "500" }}>
                ${item.lineTotal.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Total */}
        <View
          style={{
            marginBottom: 24,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#ccc",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text>Subtotal:</Text>
            <Text>
              $
              {(
                order.subtotal -
                (order.subtotal > 50 ? 0 : 5.99)
              ).toFixed(2)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text>Shipping:</Text>
            <Text>{order.subtotal > 50 ? "FREE" : "$5.99"}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: "#ccc",
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 16 }}>Total:</Text>
            <Text style={{ fontWeight: "700", fontSize: 16 }}>
              ${order.subtotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Shipping Information */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            Shipping To
          </Text>
          <View
            style={{
              backgroundColor: "#f9f9f9",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontWeight: "500" }}>{order.shippingInfo.fullName}</Text>
            <Text style={{ color: "#666", marginTop: 4 }}>
              {order.shippingInfo.address}
            </Text>
            <Text style={{ color: "#666" }}>
              {order.shippingInfo.city}, {order.shippingInfo.state}{" "}
              {order.shippingInfo.zipCode}
            </Text>
          </View>
        </View>

        {/* Payment Information (Last 4 digits only for security) */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            Payment
          </Text>
          <View
            style={{
              backgroundColor: "#f9f9f9",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text>Card ending in •••• {order.paymentInfo.cardNumber.slice(-4)}</Text>
            <Text style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
              Expires {order.paymentInfo.expiryDate}
            </Text>
          </View>
        </View>

        {/* Continue Shopping Button */}
        <Pressable
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          }
          style={{
            backgroundColor: "#007AFF",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Continue Shopping
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
