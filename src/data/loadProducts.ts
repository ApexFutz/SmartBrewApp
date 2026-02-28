import Papa from "papaparse";
import { Asset } from "expo-asset";
import { Product } from "../types/Product";

// Platform-agnostic CSV loading
export async function loadProductsFromCsv(): Promise<Product[]> {
  try {
    // Use Asset for both platforms
    const asset = Asset.fromModule(require("../../assets/products.csv"));
    
    if (!asset.downloaded) {
      await asset.downloadAsync();
    }

    const uri = asset.localUri ?? asset.uri;
    console.log("CSV Asset URI:", uri);
    
    let csvText: string;
    
    // Check if we're on web
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      // For web, use fetch
      const response = await fetch(uri);
      csvText = await response.text();
    } else {
      // For native, use expo-file-system
      const { readAsStringAsync } = require("expo-file-system/legacy");
      csvText = await readAsStringAsync(uri);
    }
    
    console.log("CSV Content (first 100 chars):", csvText.substring(0, 100));

    const parsed = Papa.parse<Product>(csvText, { header: true, skipEmptyLines: true });
    
    if (parsed.errors.length) {
      console.warn("CSV Parse Errors:", parsed.errors);
      throw new Error(parsed.errors[0].message);
    }
    
    console.log("Parsed products count:", parsed.data.length);
    return parsed.data;
  } catch (error) {
    console.error("Error loading products:", error);
    throw error;
  }
}
