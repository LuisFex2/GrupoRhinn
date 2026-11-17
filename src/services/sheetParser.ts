import { Product } from '../types/product';
import { getDriveThumbnailUrl, parseDriveImages, consolidateProducts } from '../data/products';

export const DEFAULT_BRAND_FALLBACK = 'GENÉRICO';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxgWW6Td9zagqcWk-XanfvtusWN3_cmH-jN5_VhQfZ88UVQyM3ivSzl9jqSpcN2oOMZKeCurhJBTEj/pubhtml?gid=1440477270&single=true';

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

export const DEFAULT_SHEET_CSV_URL = normalizeSheetCsvUrl(DEFAULT_SHEET_URL);

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

export function normalizeHeader(h: string): string {
  return (h || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export interface SheetColumnMapping {
  img: number;
  cat: number;
  brand: number;
  name: number;
  model: number;
  condition: number;
  price: number;
  stock: number;
  desc: number;
}

/**
 * Detect column mapping by matching header keywords, with safe positional fallbacks.
 */
export function detectSheetColumns(headers: string[]): SheetColumnMapping {
  const normalized = headers.map(normalizeHeader);

  const colIndex: SheetColumnMapping = {
    img: normalized.findIndex(h => h.includes('imagen') || h.includes('url') || h.includes('foto')),
    cat: normalized.findIndex(h => h.includes('categor') || h.includes('linea')),
    brand: normalized.findIndex(h => h.includes('marca')),
    name: normalized.findIndex(h => h.includes('nombre') || h.includes('producto')),
    model: normalized.findIndex(h => h.includes('modelo') || h.includes('codigo')),
    condition: normalized.findIndex(h => h.includes('condici') || h.includes('estado')),
    price: normalized.findIndex(h => h.includes('precio') || h.includes('venta')),
    stock: normalized.findIndex(h => h.includes('stock') || h.includes('cant')),
    desc: normalized.findIndex(h => h.includes('descrip') || h.includes('detalle')),
  };

  // Safe fallback indices if headers could not be matched by keyword
  if (colIndex.name === -1) colIndex.name = 4;
  if (colIndex.model === -1) colIndex.model = 5;
  if (colIndex.brand === -1) colIndex.brand = 3;
  if (colIndex.cat === -1) colIndex.cat = 2;
  if (colIndex.img === -1) colIndex.img = 1;
  if (colIndex.condition === -1) colIndex.condition = 6;
  if (colIndex.price === -1) colIndex.price = 7;
  if (colIndex.stock === -1) colIndex.stock = 8;
  if (colIndex.desc === -1) colIndex.desc = 9;

  return colIndex;
}

/**
 * Parses raw CSV text downloaded from Google Sheets into typed Product objects.
 * Applies unified brand fallback ('GENÉRICO'), image extraction, and inventory consolidation.
 */
export function parseProductsFromCsv(csvText: string): Product[] {
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    return [];
  }

  const colIndex = detectSheetColumns(rows[0]);
  const rawProducts: Product[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = (row[colIndex.name] || '').trim();
    const model = (row[colIndex.model] || '').trim();

    // Skip blank or placeholder rows
    if (!name && !model) continue;

    const brand = (row[colIndex.brand] || DEFAULT_BRAND_FALLBACK).trim().toUpperCase();
    const cat = (row[colIndex.cat] || 'ELECTRO').trim().toUpperCase();
    const driveUrl = (row[colIndex.img] || '').trim();
    const rawCond = (row[colIndex.condition] || '').trim().toLowerCase();
    const condicion: 'Nuevo' | 'De Exhibición' = rawCond.includes('exhibic')
      ? 'De Exhibición'
      : 'Nuevo';

    // Parse standard formatted price from Google Sheet (e.g. S/.1,234.56 or S/.690.00)
    const rawPrice = (row[colIndex.price] || '').trim();
    const cleanPriceStr = rawPrice.replace('S/.', '').replace('S/', '').replace(/,/g, '').trim();
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

  return consolidateProducts(rawProducts);
}
