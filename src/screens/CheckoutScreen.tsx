import React, { useState, useMemo } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCart, CartItem } from "../state/CartContext";
import { useProducts } from "../state/ProductContext";
import { Order, ShippingInfo, PaymentInfo, OrderItem } from "../types/Order";

type RootStackParamList = {
  Home: undefined;
  Product: { product: import("../types/Product").Product };
  Cart: undefined;
  Checkout: undefined;
  Confirmation: { order: Order };
};

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SB-${timestamp}-${random}`;
}

function toNumber(n: string): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export default function CheckoutScreen({ navigation }: Props) {
  const { items, subtotal, clearCart } = useCart();
  const { decrementInventory, getProductById } = useProducts();

  // Form state
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shippingCost = useMemo(() => (subtotal > 50 ? 0 : 5.99), [subtotal]);
  const total = subtotal + shippingCost;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";
    if (!zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    else if (!/^\d{5}(-\d{4})?$/.test(zipCode.trim())) {
      newErrors.zipCode = "Invalid ZIP code format";
    }
    if (!cardNumber.trim()) newErrors.cardNumber = "Card number is required";
    else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    if (!expiryDate.trim()) newErrors.expiryDate = "Expiry date is required";
    else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = "Format must be MM/YY";
    }
    if (!cvv.trim()) newErrors.cvv = "CVV is required";
    else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "CVV must be 3-4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    setSubmitting(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Build shipping and payment info
      const shippingInfo: ShippingInfo = {
        fullName: fullName.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
      };

      const paymentInfo: PaymentInfo = {
        cardNumber: cardNumber.trim(),
        expiryDate: expiryDate.trim(),
        cvv: cvv.trim(),
      };

      // Build order items
      const orderItems: OrderItem[] = items.map((item: CartItem) => ({
        product: item.product,
        qty: item.qty,
        lineTotal: toNumber(item.product.price_usd) * item.qty,
      }));

      // Decrement inventory for each item
      for (const item of items) {
        const success = decrementInventory(item.product.id, item.qty);
        if (!success) {
          Alert.alert(
            "Inventory Error",
            `Not enough stock for ${item.product.name}. Please contact support.`
          );
          setSubmitting(false);
          return;
        }
      }

      // Create order
      const order: Order = {
        orderNumber: generateOrderNumber(),
        items: orderItems,
        subtotal: total,
        shippingInfo,
        paymentInfo,
        createdAt: new Date(),
      };

      // Clear cart and navigate to confirmation
      clearCart();
      navigation.reset({
        index: 1,
        routes: [
          { name: "Home" },
          { name: "Confirmation", params: { order } },
        ],
      });
    } catch (e) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    fullName.trim() &&
    address.trim() &&
    city.trim() &&
    state.trim() &&
    zipCode.trim() &&
    cardNumber.trim() &&
    expiryDate.trim() &&
    cvv.trim();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
            Checkout
          </Text>

          {/* Order Summary */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              Order Summary
            </Text>
            {items.map((item: CartItem) => (
              <View
                key={item.product.id}
                style={{ flexDirection: "row", justifyContent: "space-between" }}
              >
                <Text>
                  {item.product.name} x{item.qty}
                </Text>
                <Text>
                  ${(toNumber(item.product.price_usd) * item.qty).toFixed(2)}
                </Text>
              </View>
            ))}
            <View
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: "#ccc",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text>Subtotal:</Text>
                <Text>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text>Shipping:</Text>
                <Text>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</Text>
              </View>
              {shippingCost > 0 && (
                <Text style={{ fontSize: 12, color: "#666" }}>
                  Free shipping on orders over $50
                </Text>
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Total:</Text>
                <Text style={{ fontWeight: "700" }}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Shipping Information */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              Shipping Information
            </Text>

            <Text style={{ marginBottom: 4 }}>Full Name *</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              style={{
                borderWidth: 1,
                borderColor: errors.fullName ? "red" : "#ccc",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            />
            {errors.fullName && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                {errors.fullName}
              </Text>
            )}

            <Text style={{ marginBottom: 4 }}>Address *</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="123 Coffee Lane"
              style={{
                borderWidth: 1,
                borderColor: errors.address ? "red" : "#ccc",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            />
            {errors.address && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                {errors.address}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ marginBottom: 4 }}>City *</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="Seattle"
                  style={{
                    borderWidth: 1,
                    borderColor: errors.city ? "red" : "#ccc",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                />
                {errors.city && (
                  <Text style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                    {errors.city}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ marginBottom: 4 }}>State *</Text>
                <TextInput
                  value={state}
                  onChangeText={setState}
                  placeholder="WA"
                  style={{
                    borderWidth: 1,
                    borderColor: errors.state ? "red" : "#ccc",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                />
                {errors.state && (
                  <Text style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                    {errors.state}
                  </Text>
                )}
              </View>
            </View>

            <Text style={{ marginBottom: 4 }}>ZIP Code *</Text>
            <TextInput
              value={zipCode}
              onChangeText={setZipCode}
              placeholder="98101"
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: errors.zipCode ? "red" : "#ccc",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            />
            {errors.zipCode && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                {errors.zipCode}
              </Text>
            )}
          </View>

          {/* Payment Information */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              Payment Information
            </Text>

            <Text style={{ marginBottom: 4 }}>Card Number *</Text>
            <TextInput
              value={cardNumber}
              onChangeText={(text) => setCardNumber(text.replace(/\D/g, ""))}
              placeholder="1234567890123456"
              keyboardType="numeric"
              maxLength={16}
              style={{
                borderWidth: 1,
                borderColor: errors.cardNumber ? "red" : "#ccc",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            />
            {errors.cardNumber && (
              <Text style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                {errors.cardNumber}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ marginBottom: 4 }}>Expiry Date *</Text>
                <TextInput
                  value={expiryDate}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, "");
                    if (cleaned.length >= 2) {
                      setExpiryDate(
                        cleaned.substring(0, 2) +
                          "/" +
                          cleaned.substring(2, 4)
                      );
                    } else {
                      setExpiryDate(cleaned);
                    }
                  }}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                  style={{
                    borderWidth: 1,
                    borderColor: errors.expiryDate ? "red" : "#ccc",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                />
                {errors.expiryDate && (
                  <Text style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                    {errors.expiryDate}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ marginBottom: 4 }}>CVV *</Text>
                <TextInput
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/\D/g, ""))}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  style={{
                    borderWidth: 1,
                    borderColor: errors.cvv ? "red" : "#ccc",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                />
                {errors.cvv && (
                  <Text style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                    {errors.cvv}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid || submitting}
            style={{
              backgroundColor: isFormValid && !submitting ? "#007AFF" : "#ccc",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              {submitting ? "Processing..." : `Pay $${total.toFixed(2)}`}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
