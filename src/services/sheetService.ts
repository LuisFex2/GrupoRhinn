import { Product } from '../types/product';
import {
  DEFAULT_SHEET_URL as CANONICAL_SHEET_URL,
  normalizeSheetCsvUrl,
  parseCSV,
  parseProductsFromCsv,
} from './sheetParser';

// Re-export shared CSV parser utilities so any consumers keep full compatibility
export { normalizeSheetCsvUrl, parseCSV };

export const DEFAULT_SHEET_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_SHEET_URL) ||
  CANONICAL_SHEET_URL;

const CACHE_KEY = 'rhinn_products_cache_v1';
const CACHE_TIME_KEY = 'rhinn_products_cache_time';

/**
 * Fetches dynamic product inventory directly from the live Google Sheet.
 */
export async function fetchProductsFromGoogleSheet(customUrl?: string): Promise<Product[]> {
  const targetUrl = normalizeSheetCsvUrl(customUrl || DEFAULT_SHEET_URL);

  // Add timestamp query param to completely bypass any intermediate HTTP caching
  const cacheBusterUrl = `${targetUrl}&_cb=${Date.now()}`;

  const response = await fetch(cacheBusterUrl, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status} al obtener datos de Google Sheets`);
  }

  const csvText = await response.text();
  const consolidated = parseProductsFromCsv(csvText);

  if (consolidated.length === 0) {
    throw new Error('El archivo de Google Sheets no contiene datos válidos.');
  }

  // Save to localStorage as backup
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(consolidated));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    }
  } catch {
    // Ignore storage quota errors
  }

  return consolidated;
}

/**
 * Gets cached products from localStorage if available, for instant initial render.
 */
export function getCachedProducts(): Product[] | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore parse error
  }
  return null;
}
