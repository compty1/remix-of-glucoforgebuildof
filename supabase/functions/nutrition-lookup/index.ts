/**
 * Domain 2.2: Nutrition Lookup via OpenFoodFacts API
 * Free API, no key required.
 * Gaps 819, 820: caching + serving size parameter
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

// Simple in-memory cache (gap 819) — TTL 10 minutes
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 10 * 60 * 1000;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  // Cap cache size to prevent memory issues
  if (cache.size > 500) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

function scaleNutrients(value: number | null, servingGrams: number): number | null {
  if (value === null) return null;
  return Math.round((value * servingGrams / 100) * 10) / 10;
}

serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const { barcode, query, serving_grams } = await req.json();
    const servingSize = typeof serving_grams === 'number' && serving_grams > 0 ? serving_grams : null;

    if (!barcode && !query) {
      return errorResponse("Provide 'barcode' or 'query'", 400);
    }

    // Validate inputs
    if (barcode && typeof barcode !== 'string') {
      return errorResponse("'barcode' must be a string", 400);
    }
    if (query && typeof query !== 'string') {
      return errorResponse("'query' must be a string", 400);
    }
    if (query && query.length > 200) {
      return errorResponse("'query' too long (max 200 chars)", 400);
    }

    const cacheKey = barcode ? `barcode:${barcode}` : `query:${query}`;
    const cached = getCached(cacheKey);
    if (cached && !servingSize) {
      return jsonResponse(cached);
    }

    let url: string;
    if (barcode) {
      url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
    } else {
      url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=5`;
    }

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return errorResponse("OpenFoodFacts API error", 502);
    }

    const data = await response.json();

    const mapProduct = (p: any) => {
      const carbs = p.nutriments?.carbohydrates_100g ?? null;
      const fat = p.nutriments?.fat_100g ?? null;
      const protein = p.nutriments?.proteins_100g ?? null;
      const fiber = p.nutriments?.fiber_100g ?? null;

      return {
        name: p.product_name || "Unknown",
        barcode: p.code,
        carbs_per_100g: carbs,
        fat_per_100g: fat,
        protein_per_100g: protein,
        fiber_per_100g: fiber,
        // Gap 820: scaled to serving size if provided
        carbs: servingSize ? scaleNutrients(carbs, servingSize) : carbs,
        fat: servingSize ? scaleNutrients(fat, servingSize) : fat,
        protein: servingSize ? scaleNutrients(protein, servingSize) : protein,
        fiber: servingSize ? scaleNutrients(fiber, servingSize) : fiber,
        serving_grams: servingSize,
        servingSize: p.serving_size || null,
        imageUrl: p.image_front_small_url || null,
      };
    };

    let result: unknown;

    if (barcode) {
      if (data.status !== 1 || !data.product) {
        result = { found: false, products: [] };
      } else {
        result = { found: true, products: [mapProduct(data.product)] };
      }
    } else {
      const products = (data.products || []).slice(0, 5).map(mapProduct);
      result = { found: products.length > 0, products };
    }

    setCache(cacheKey, result);
    return jsonResponse(result);
  } catch (error) {
    return errorResponse("Nutrition lookup failed", 500);
  }
});
