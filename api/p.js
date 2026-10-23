// Vercel Serverless Function for Dynamic Social Previews (WhatsApp, Facebook, Twitter, Telegram)
// Accessible at /api/p?p=MODELO or via rewrite at /p/:model

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxgWW6Td9zagqcWk-XanfvtusWN3_cmH-jN5_VhQfZ88UVQyM3ivSzl9jqSpcN2oOMZKeCurhJBTEj/pub?gid=1440477270&single=true&output=csv';

const DEFAULT_LOGO = 'https://gruporhinn.vercel.app/assets/aistudio/logo-rhinn_0187ef6a.png';

let cachedProducts = null;
let lastCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute in-memory cache

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
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
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentVal.trim());
      if (currentRow.some(c => c !== '')) rows.push(currentRow);
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(c => c !== '')) rows.push(currentRow);
  }
  return rows;
}

function getThumbnail(driveUrl) {
  if (!driveUrl) return null;
  const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=w800`;
  }
  return driveUrl;
}

function normalizeHeader(h) {
  return (h || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

async function getProducts() {
  const now = Date.now();
  if (cachedProducts && now - lastCacheTime < CACHE_TTL) {
    return cachedProducts;
  }

  try {
    const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
    if (!res.ok) return cachedProducts || [];
    const text = await res.text();
    const rows = parseCSV(text);

    if (rows.length < 2) return cachedProducts || [];

    const headers = rows[0].map(normalizeHeader);
    let colName = headers.findIndex(h => h.includes('nombre') || h.includes('producto'));
    let colModel = headers.findIndex(h => h.includes('modelo') || h.includes('codigo'));
    let colBrand = headers.findIndex(h => h.includes('marca'));
    let colCat = headers.findIndex(h => h.includes('categor') || h.includes('linea'));
    let colImg = headers.findIndex(h => h.includes('imagen') || h.includes('url') || h.includes('foto'));
    let colCond = headers.findIndex(h => h.includes('condici') || h.includes('estado'));
    let colPrice = headers.findIndex(h => h.includes('precio') || h.includes('venta'));

    if (colName === -1) colName = 4;
    if (colModel === -1) colModel = 5;
    if (colBrand === -1) colBrand = 3;
    if (colCat === -1) colCat = 2;
    if (colImg === -1) colImg = 1;
    if (colCond === -1) colCond = 6;
    if (colPrice === -1) colPrice = 7;

    const prods = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const name = (row[colName] || '').trim();
      const model = (row[colModel] || '').trim();
      if (!name && !model) continue;

      prods.push({
        name,
        model,
        brand: (row[colBrand] || 'GRUPO RHINN').trim(),
        category: (row[colCat] || '').trim(),
        condition: (row[colCond] || '').toLowerCase().includes('exhibic') ? 'De Exhibición' : 'Nuevo',
        price: (row[colPrice] || '').trim(),
        imageUrl: getThumbnail(row[colImg]) || DEFAULT_LOGO,
      });
    }

    cachedProducts = prods;
    lastCacheTime = now;
    return prods;
  } catch (err) {
    console.error('Sheet fetch error:', err);
    return cachedProducts || [];
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  let queryParam = req.query?.p || req.query?.model || '';
  if (Array.isArray(queryParam)) queryParam = queryParam[0];

  let searchKey = '';
  try {
    searchKey = decodeURIComponent(queryParam).trim().toLowerCase();
  } catch {
    searchKey = (queryParam || '').trim().toLowerCase();
  }

  const products = await getProducts();
  const product = products.find(
    p =>
      (p.model && p.model.toLowerCase() === searchKey) ||
      (p.name && p.name.toLowerCase() === searchKey) ||
      (p.model && searchKey && p.model.toLowerCase().includes(searchKey))
  );

  const title = product
    ? `${product.name} (${product.model}) | GRUPO RHINN`
    : 'GRUPO RHINN - Catálogo Oficial';
  const description = product
    ? `Precio: ${product.price || 'Consultar'} · Condición: ${product.condition} · Disponible en GRUPO RHINN.`
    : 'Catálogo web oficial de GRUPO RHINN. Electrodomésticos y tecnología para el hogar.';
  const image = product?.imageUrl || DEFAULT_LOGO;
  const targetUrl = product?.model
    ? `https://gruporhinn.vercel.app/?p=${encodeURIComponent(product.model)}`
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
