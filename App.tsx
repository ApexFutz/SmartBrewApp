import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import ProductScreen from "./src/screens/ProductScreen";
import CartScreen from "./src/screens/CartScreen";
import CheckoutScreen from "./src/screens/CheckoutScreen";
import ConfirmationScreen from "./src/screens/ConfirmationScreen";
import { CartProvider } from "./src/state/CartContext";
import { ProductProvider } from "./src/state/ProductContext";
import { Product } from "./src/types/Product";
import { Order } from "./src/types/Order";

export type RootStackParamList = {
  Home: undefined;
  Product: { product: Product };
  Cart: undefined;
  Checkout: undefined;
  Confirmation: { order: Order };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "SmartBrew" }} />
            <Stack.Screen name="Product" component={ProductScreen} options={{ title: "Product" }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Cart" }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ title: "Confirmation", headerBackVisible: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </ProductProvider>
  );
}
