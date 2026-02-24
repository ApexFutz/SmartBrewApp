import React, { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Product } from "../types/Product";
import { useCart } from "../state/CartContext";

type RootStackParamList = {
  Home: undefined;
  Product: { product: Product };
  Cart: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Product">;

export default function ProductScreen({ route, navigation }: Props) {
  const { product } = route.params;
  const { items, addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const inCartQty = useMemo(() => {
    return items.find((i) => i.product.id === product.id)?.qty ?? 0;
  }, [items, product.id]);

  const stock = Number(product.stock) || 0;
  const canAdd = stock > 0 && inCartQty < stock;

  const onAdd = async () => {
    setAdding(true);
    try {
      const res = addToCart(product);
      if (!res.ok) Alert.alert("Notice", res.message ?? "Unable to add");
    } finally {
      setAdding(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{product.name}</Text>
      <Text style={{ marginTop: 6 }}>{product.category} • {product.roast} • {product.grind}</Text>
      <Text style={{ marginTop: 6 }}>{product.size_oz}oz</Text>
      <Text style={{ marginTop: 10 }}>${Number(product.price_usd).toFixed(2)}</Text>
      <Text style={{ marginTop: 10 }}>Stock: {product.stock}</Text>
      <Text style={{ marginTop: 10 }}>{product.description}</Text>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        <Pressable
          onPress={onAdd}
          disabled={!canAdd || adding}
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 12,
            opacity: canAdd ? 1 : 0.5,
            flex: 1,
            alignItems: "center",
          }}
        >
          <Text>{canAdd ? "Add to Cart" : stock <= 0 ? "Out of Stock" : "Max in Cart"}</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Cart")}
          style={{ padding: 12, borderWidth: 1, borderRadius: 12, alignItems: "center" }}
        >
          <Text>Go to Cart</Text>
        </Pressable>
      </View>

      <Text style={{ marginTop: 12 }}>In cart: {inCartQty}</Text>
    </SafeAreaView>
  );
}