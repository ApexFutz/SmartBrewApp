import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import ProductScreen from "./src/screens/ProductScreen";
import CartScreen from "./src/screens/CartScreen";
import { CartProvider } from "./src/state/CartContext";
import { Product } from "./src/types/Product";

export type RootStackParamList = {
  Home: undefined;
  Product: { product: Product };
  Cart: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "SmartBrew" }} />
          <Stack.Screen name="Product" component={ProductScreen} options={{ title: "Product" }} />
          <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Cart" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}