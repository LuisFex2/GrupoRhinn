// Vercel Serverless Function for Dynamic Social Previews (WhatsApp, Facebook, Twitter, Telegram)
// Accessible at /api/p?p=MODELO or via rewrite at /p/:model
import type { IncomingMessage, ServerResponse } from 'http';
import { Product } from '../src/types/product';
import { DEFAULT_SHEET_CSV_URL, parseProductsFromCsv } from '../src/services/sheetParser';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  send: (body: string | object | Buffer) => VercelResponse;
  json: (body: object) => VercelResponse;
}

const DEFAULT_LOGO = 'https://gruporhinn.vercel.app/assets/aistudio/logo-rhinn_0187ef6a.png';

let cachedProducts: Product[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute in-memory cache

async function getProducts(): Promise<Product[]> {
  const now = Date.now();
  if (cachedProducts && now - lastCacheTime < CACHE_TTL) {
    return cachedProducts;
  }

  try {
    const res = await fetch(DEFAULT_SHEET_CSV_URL, { cache: 'no-store' });
    if (!res.ok) return cachedProducts || [];
    const text = await res.text();
    const products = parseProductsFromCsv(text);

    if (products.length > 0) {
      cachedProducts = products;
      lastCacheTime = now;
      return products;
    }
    return cachedProducts || [];
  } catch (err) {
    console.error('Sheet fetch error:', err);
    return cachedProducts || [];
  }
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let queryParam = req.query?.p || req.query?.model || '';
  if (Array.isArray(queryParam)) queryParam = queryParam[0] || '';

  let searchKey = '';
  try {
    searchKey = decodeURIComponent(queryParam).trim().toLowerCase();
  } catch {
    searchKey = (queryParam || '').trim().toLowerCase();
  }

  const products = await getProducts();
  const product = products.find(
    p =>
      (p.modelo && p.modelo.toLowerCase() === searchKey) ||
      (p.nombre && p.nombre.toLowerCase() === searchKey) ||
      (p.modelo && searchKey && p.modelo.toLowerCase().includes(searchKey))
  );

  const title = product
    ? `${product.nombre} (${product.modelo}) | GRUPO RHINN`
    : 'GRUPO RHINN - Catálogo Oficial';
  const description = product
    ? `Precio: ${product.precioTexto || 'Consultar'} · Condición: ${product.condicion} · Disponible en GRUPO RHINN.`
    : 'Catálogo web oficial de GRUPO RHINN. Electrodomésticos y tecnología para el hogar.';
  const image = product?.thumbnailUrl || DEFAULT_LOGO;
  const targetUrl = product?.modelo
    ? `https://gruporhinn.vercel.app/?p=${encodeURIComponent(product.modelo)}`
    : 'https://gruporhinn.vercel.app/';

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeTargetUrl = escapeHtml(targetUrl);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  
  <!-- Open Graph / WhatsApp / Facebook Preview Tags -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="GRUPO RHINN">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:image:secure_url" content="${safeImage}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="800">
  <meta property="og:image:height" content="600">
  <meta property="og:image:alt" content="${safeTitle}">
  <meta property="og:url" content="${safeTargetUrl}">
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImage}">

  <!-- Instant Client Redirect -->
  <meta http-equiv="refresh" content="0;url=${safeTargetUrl}">
  <script>window.location.replace('${safeTargetUrl}');</script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; padding: 40px; background-color: #f8fafc; color: #1e293b;">
  <div style="max-width: 480px; margin: 40px auto; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <img src="${safeImage}" alt="${safeTitle}" style="max-width: 200px; max-height: 200px; object-fit: contain; margin-bottom: 16px;">
    <h2 style="font-size: 18px; margin: 0 0 8px 0;">${safeTitle}</h2>
    <p style="color: #64748b; font-size: 14px; margin: 0 0 16px 0;">Redirigiendo al catálogo de GRUPO RHINN...</p>
    <a href="${safeTargetUrl}" style="display: inline-block; background-color: #0d9488; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Abrir producto</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).send(html);
}
