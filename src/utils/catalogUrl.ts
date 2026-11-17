export type CatalogCondition = 'ALL' | 'Nuevo' | 'De Exhibición';

export interface CatalogFilters {
  category: string;
  brand: string;
  condition: CatalogCondition;
  search: string;
}

const CATEGORY_ALIASES: Record<string, string> = {
  refrigeradora: 'REFRIGERADORA',
  refrigeradoras: 'REFRIGERADORA',
  congeladora: 'CONGELADORA',
  congeladoras: 'CONGELADORA',
  cocina: 'COCINA',
  cocinas: 'COCINA',
  lavadora: 'LAVADORA',
  lavadoras: 'LAVADORA',
  lavaseca: 'LAVADORA',
  'lava-seca': 'LAVADORA',
  tv: 'TV LED',
  'tv-led': 'TV LED',
  televisores: 'TV LED',
  televisor: 'TV LED',
  ventiladora: 'VENTILADORA',
  ventiladoras: 'VENTILADORA',
  licuadora: 'LICUADORA',
  licuadoras: 'LICUADORA',
};

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function resolveCategory(raw: string, knownCategories: string[]): string | null {
  const slug = slugify(raw);
  if (!slug) return null;

  const alias = CATEGORY_ALIASES[slug];
  if (alias) return alias;

  const known = knownCategories.find(cat => slugify(cat) === slug);
  if (known) return known;

  const singular = slug.endsWith('s') ? slug.slice(0, -1) : `${slug}s`;
  return knownCategories.find(cat => slugify(cat) === singular) || null;
}

export function buildCatalogUrl(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  if (filters.category && filters.category !== 'ALL') {
    params.set('cat', slugify(filters.category));
  }
  if (filters.brand && filters.brand !== 'ALL') {
    params.set('marca', filters.brand);
  }
  if (filters.condition === 'Nuevo') {
    params.set('cond', 'nuevo');
  } else if (filters.condition === 'De Exhibición') {
    params.set('cond', 'exhibicion');
  }
  if (filters.search.trim()) {
    params.set('q', filters.search.trim());
  }

  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

export function parseCatalogFilters(
  search: string,
  knownCategories: string[]
): Partial<CatalogFilters> & { productSlug: string | null } {
  const params = new URLSearchParams(search);
  const pathMatch = window.location.pathname.match(/\/p\/([^/]+)/);
  const productSlug = params.get('p') || (pathMatch ? decodeURIComponent(pathMatch[1]) : null);

  const catRaw = params.get('cat') || params.get('categoria');
  const category = catRaw ? resolveCategory(catRaw, knownCategories) : null;

  const brand = params.get('marca');
  const condRaw = (params.get('cond') || '').toLowerCase();
  let condition: CatalogCondition | undefined;
  if (condRaw === 'nuevo') condition = 'Nuevo';
  else if (condRaw === 'exhibicion' || condRaw === 'exhibición') condition = 'De Exhibición';

  const q = params.get('q');

  return {
    productSlug,
    ...(category ? { category } : {}),
    ...(brand ? { brand } : {}),
    ...(condition ? { condition } : {}),
    ...(q ? { search: q } : {}),
  };
}

export function currentLocationKey(): string {
  return `${window.location.pathname}${window.location.search}` || '/';
}

export function writeUrl(url: string, mode: 'push' | 'replace' = 'push'): void {
  const normalized = url || '/';
  const current = currentLocationKey();
  const currentNorm = current === '' ? '/' : current;
  if (currentNorm === normalized) return;

  if (mode === 'replace') {
    window.history.replaceState({ catalog: true }, '', normalized);
  } else {
    window.history.pushState({ catalog: true }, '', normalized);
  }
}
