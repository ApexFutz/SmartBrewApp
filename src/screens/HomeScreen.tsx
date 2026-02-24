import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { loadProductsFromCsv } from "../data/loadProducts";
import { Product } from "../types/Product";

type RootStackParamList = {
  Home: undefined;
  Product: { product: Product };
  Cart: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await loadProductsFromCsv();
        if (alive) setProducts(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn("Load error:", msg);
        if (alive) setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const hay = `${p.name} ${p.category} ${p.roast} ${p.grind}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, query]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "700", flex: 1 }}>SmartBrew Coffee</Text>
        <Pressable onPress={() => navigation.navigate("Cart")} style={{ padding: 10, borderWidth: 1, borderRadius: 10 }}>
          <Text>Cart</Text>
        </Pressable>
      </View>

      <TextInput
        placeholder="Search (e.g., dark, espresso, ground)…"
        value={query}
        onChangeText={setQuery}
        style={{ marginTop: 12, padding: 12, borderWidth: 1, borderRadius: 12 }}
      />

      {loading ? (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={{ marginTop: 20, padding: 12, backgroundColor: '#ffcccc', borderRadius: 8 }}>
          <Text style={{ color: '#cc0000' }}>Error: {error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <Text style={{ marginTop: 20 }}>No products found.</Text>
      ) : (
        <FlatList
          style={{ marginTop: 12 }}
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("Product", { product: item })}
              style={{ padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 10 }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
              <Text>{item.roast} • {item.grind} • {item.size_oz}oz</Text>
              <Text style={{ marginTop: 6 }}>${Number(item.price_usd).toFixed(2)} • Stock: {item.stock}</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}