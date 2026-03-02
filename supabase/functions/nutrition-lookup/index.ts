/**
 * Domain 2.2: Nutrition Lookup via OpenFoodFacts API
 * Free API, no key required.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const { barcode, query } = await req.json();

    let url: string;
    if (barcode) {
      url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
    } else if (query) {
      url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=5`;
    } else {
      return errorResponse("Provide 'barcode' or 'query'", 400);
    }

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return errorResponse("OpenFoodFacts API error", 502);
    }

    const data = await response.json();

    if (barcode) {
      if (data.status !== 1 || !data.product) {
        return jsonResponse({ found: false, products: [] });
      }
      const p = data.product;
      return jsonResponse({
        found: true,
        products: [{
          name: p.product_name || "Unknown",
          barcode: p.code,
          carbs: p.nutriments?.carbohydrates_100g ?? null,
          fat: p.nutriments?.fat_100g ?? null,
          protein: p.nutriments?.proteins_100g ?? null,
          fiber: p.nutriments?.fiber_100g ?? null,
          servingSize: p.serving_size || null,
          imageUrl: p.image_front_small_url || null,
        }],
      });
    }

    // Search results
    const products = (data.products || []).slice(0, 5).map((p: any) => ({
      name: p.product_name || "Unknown",
      barcode: p.code,
      carbs: p.nutriments?.carbohydrates_100g ?? null,
      fat: p.nutriments?.fat_100g ?? null,
      protein: p.nutriments?.proteins_100g ?? null,
      fiber: p.nutriments?.fiber_100g ?? null,
      servingSize: p.serving_size || null,
      imageUrl: p.image_front_small_url || null,
    }));

    return jsonResponse({ found: products.length > 0, products });
  } catch (error) {
    return errorResponse("Nutrition lookup failed", 500);
  }
});
