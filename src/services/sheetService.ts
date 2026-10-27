import { Product } from '../types/product';
import { getDriveThumbnailUrl, parseDriveImages, consolidateProducts } from '../data/products';

export const DEFAULT_SHEET_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_SHEET_URL) ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxgWW6Td9zagqcWk-XanfvtusWN3_cmH-jN5_VhQfZ88UVQyM3ivSzl9jqSpcN2oOMZKeCurhJBTEj/pubhtml?gid=1440477270&single=true';

const CACHE_KEY = 'rhinn_products_cache_v1';
const CACHE_TIME_KEY = 'rhinn_products_cache_time';

/**
 * Normalizes any Google Sheet published URL into a CSV download URL.
 */
export function normalizeSheetCsvUrl(url: string): string {
  let clean = url.trim();
  if (clean.includes('/pubhtml')) {
    clean = clean.replace('/pubhtml', '/pub');
  }
  if (!clean.includes('output=csv')) {
    clean += (clean.includes('?') ? '&' : '?') + 'output=csv';
  }
  return clean;
}

/**
 * Robust CSV parser that correctly handles quoted strings, escaped quotes,
 * commas inside values, and multiple newline styles.
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some(col => col !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(col => col !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

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
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    throw new Error('El archivo de Google Sheets no contiene datos válidos.');
  }

  // Detect column mapping by matching header keywords
  const rawHeaders = rows[0];
  const headers = rawHeaders.map(normalizeHeader);

  const colIndex = {
    img: headers.findIndex(h => h.includes('imagen') || h.includes('url') || h.includes('foto')),
    cat: headers.findIndex(h => h.includes('categor') || h.includes('linea')),
    brand: headers.findIndex(h => h.includes('marca')),
    name: headers.findIndex(h => h.includes('nombre') || h.includes('producto')),
    model: headers.findIndex(h => h.includes('modelo') || h.includes('codigo')),
    condition: headers.findIndex(h => h.includes('condici') || h.includes('estado')),
    price: headers.findIndex(h => h.includes('precio') || h.includes('venta')),
    stock: headers.findIndex(h => h.includes('stock') || h.includes('cant')),
    desc: headers.findIndex(h => h.includes('descrip') || h.includes('detalle')),
  };

  // Safe fallback if headers couldn't be detected
  if (colIndex.name === -1) colIndex.name = 4;
  if (colIndex.model === -1) colIndex.model = 5;
  if (colIndex.brand === -1) colIndex.brand = 3;
  if (colIndex.cat === -1) colIndex.cat = 2;
  if (colIndex.img === -1) colIndex.img = 1;
  if (colIndex.condition === -1) colIndex.condition = 6;
  if (colIndex.price === -1) colIndex.price = 7;
  if (colIndex.stock === -1) colIndex.stock = 8;
  if (colIndex.desc === -1) colIndex.desc = 9;

  const rawProducts: Product[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = (row[colIndex.name] || '').trim();
    const model = (row[colIndex.model] || '').trim();

    // Skip blank or placeholder rows
    if (!name && !model) continue;

    const brand = (row[colIndex.brand] || 'GENÉRICO').trim().toUpperCase();
    const cat = (row[colIndex.cat] || 'ELECTRO').trim().toUpperCase();
    const driveUrl = (row[colIndex.img] || '').trim();
    const rawCond = (row[colIndex.condition] || '').trim().toLowerCase();
    const condicion: 'Nuevo' | 'De Exhibición' = rawCond.includes('exhibic')
      ? 'De Exhibición'
      : 'Nuevo';

    // Parse price safely (handling "S/.690", "S/.1,050", "S/ 390.00", etc.)
    const rawPrice = (row[colIndex.price] || '').trim();
    let cleanPriceStr = rawPrice.replace(/^(S\/\.?|PEN|\$)\s*/i, '');
    if (/^\d{1,3}\.\d{3}$/.test(cleanPriceStr)) {
      cleanPriceStr = cleanPriceStr.replace('.', '');
    } else {
      cleanPriceStr = cleanPriceStr.replace(/,/g, '');
    }
    cleanPriceStr = cleanPriceStr.replace(/[^0-9.]/g, '');
    const priceNum = parseFloat(cleanPriceStr) || 0;
    const precioTexto =
      priceNum > 0
        ? `S/ ${priceNum.toLocaleString('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : rawPrice || 'Consultar precio';

    // Stock
    const rawStock = (row[colIndex.stock] || '1').trim();
    const stock = Math.max(1, parseInt(rawStock, 10) || 1);

    // Description
    const descripcion = (
      row[colIndex.desc] ||
      `${name} modelo ${model} en condición ${condicion.toLowerCase()}. Disponible en tienda.`
    ).trim();

    const images = parseDriveImages(driveUrl);
    const thumbnailUrl = images.length > 0 ? images[0] : (getDriveThumbnailUrl(driveUrl) || undefined);

    rawProducts.push({
      id: `gs-${i}-${model || name}`,
      nombre: name || `${cat} ${brand} ${model}`,
      categoria: cat,
      marca: brand,
      modelo: model,
      condicion,
      precio: priceNum,
      precioTexto,
      stock,
      descripcion,
      driveUrl: driveUrl || undefined,
      thumbnailUrl,
      images: images.length > 0 ? images : (thumbnailUrl ? [thumbnailUrl] : undefined),
      destacado: stock > 5 || priceNum > 1000,
    });
  }

  // Consolidate duplicate inventory records (e.g., serials of same model)
  const consolidated = consolidateProducts(rawProducts);

  // Save to localStorage as backup
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(consolidated));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
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
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }
  return null;
}
