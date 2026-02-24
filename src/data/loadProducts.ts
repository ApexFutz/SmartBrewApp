import Papa from "papaparse";
import { readAsStringAsync } from "expo-file-system/legacy";
import { Asset } from "expo-asset";
import { Product } from "../types/Product";

export async function loadProductsFromCsv(): Promise<Product[]> {
  try {
    const asset = Asset.fromModule(require("../../assets/products.csv"));
    
    if (!asset.downloaded) {
      await asset.downloadAsync();
    }

    const uri = asset.localUri ?? asset.uri;
    console.log("CSV Asset URI:", uri);
    
    const csvText = await readAsStringAsync(uri);
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
