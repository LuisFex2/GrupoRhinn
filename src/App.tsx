import { useState, useMemo, useEffect, useCallback } from 'react';
import { catalogProducts } from './data/products';
import { fetchProductsFromGoogleSheet, getCachedProducts } from './services/sheetService';
import { Product, CartItem, SortOption } from './types/product';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductFilters } from './components/ProductFilters';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartDrawer } from './components/CartDrawer';
import { CategoryDrawer } from './components/CategoryDrawer';
import { Footer } from './components/Footer';
import { AlertCircle, ArrowUp } from 'lucide-react';
import {
  buildCatalogUrl,
  parseCatalogFilters,
  writeUrl,
  type CatalogCondition,
} from './utils/catalogUrl';

export default function App() {
  // Initialize with cached products if available, or bundled products as immediate fallback
  const [products, setProducts] = useState<Product[]>(() => {
    return getCachedProducts() || catalogProducts;
  });

  // Floating "Subir" (Scroll to Top) button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load latest live data from Google Sheets on initial load
  useEffect(() => {
    let isMounted = true;
    const syncWithSheet = async () => {
      try {
        const liveProducts = await fetchProductsFromGoogleSheet();
        if (isMounted && liveProducts.length > 0) {
          setProducts(liveProducts);
          // If a product is currently viewed in detail, keep it updated with live values
          setSelectedProduct(current => {
            if (!current) return null;
            return liveProducts.find(p => p.id === current.id || p.modelo === current.modelo) || current;
          });
        }
      } catch (err) {
        console.warn('Could not sync with Google Sheets, using cached/local data:', err);
      }
    };

    syncWithSheet();
    return () => {
      isMounted = false;
    };
  }, []);

  // Active full-page product (PDP view)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const initialKnownCategories = Array.from(
    new Set((getCachedProducts() || catalogProducts).map(p => p.categoria))
  );
  const initialUrlFilters = parseCatalogFilters(window.location.search, initialKnownCategories);

  // Filter States (seeded from the URL so a shared link opens already filtered)
  const [searchQuery, setSearchQuery] = useState(initialUrlFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialUrlFilters.category || 'ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialUrlFilters.brand || 'ALL');
  const [selectedCondition, setSelectedCondition] = useState<CatalogCondition>(
    initialUrlFilters.condition || 'ALL'
  );
  const [sortOption, setSortOption] = useState<SortOption>('destacados');
  // Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Unique categories & brands
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.categoria))).sort();
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.marca))).sort();
  }, [products]);


  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    const maxStock = Math.max(1, product.stock || 1);
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(maxStock, existing.quantity + quantity);
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: nextQty }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(maxStock, quantity) }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const maxStock = Math.max(1, item.product.stock || 1);
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.product.precio * item.quantity,
    0
  );

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const match =
            p.nombre.toLowerCase().includes(q) ||
            p.marca.toLowerCase().includes(q) ||
            p.modelo.toLowerCase().includes(q) ||
            p.categoria.toLowerCase().includes(q) ||
            p.descripcion.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Category filter with intelligent group matching
        if (selectedCategory !== 'ALL') {
          const s = selectedCategory.toUpperCase().trim();
          const c = (p.categoria || '').toUpperCase().trim();

          if (s === 'TV LED' || s === 'TELEVISORES' || s === 'TV') {
            const isTv = c === 'TV' || c.startsWith('TV ') || c.startsWith('TV-') || c.includes('TELEVISOR') || c.split(/[\s-]+/).includes('TV');
            if (!isTv) return false;
          } else if (s === 'LAVADORA' || s === 'LAVADORAS') {
            const isWasher = c.includes('LAVADORA') || c.includes('LAVA SECA') || c.includes('LAVASECA');
            if (!isWasher) return false;
          } else if (s.includes('CONGELADOR')) {
            if (!c.includes('CONGELADOR')) return false;
          } else if (s.includes('REFRIGERADOR')) {
            if (!c.includes('REFRIGERADOR')) return false;
          } else if (c !== s) {
            return false;
          }
        }

        // Brand filter
        if (selectedBrand !== 'ALL' && p.marca !== selectedBrand) {
          return false;
        }

        // Condition filter
        if (selectedCondition !== 'ALL' && p.condicion !== selectedCondition) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'destacados') {
          if (a.destacado && !b.destacado) return -1;
          if (!a.destacado && b.destacado) return 1;
          return a.precio - b.precio;
        }
        if (sortOption === 'precio-asc') return a.precio - b.precio;
        if (sortOption === 'precio-desc') return b.precio - a.precio;
        if (sortOption === 'nombre-asc') return a.nombre.localeCompare(b.nombre);
        if (sortOption === 'stock-desc') return b.stock - a.stock;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedCondition, sortOption]);

  const applyLocationToState = useCallback((productList: Product[]) => {
    const known = Array.from(new Set(productList.map(p => p.categoria)));
    const parsed = parseCatalogFilters(window.location.search, known);

    if (parsed.productSlug) {
      const decoded = decodeURIComponent(parsed.productSlug).trim().toLowerCase();
      const found = productList.find(
        p => (p.modelo && p.modelo.toLowerCase() === decoded) || p.id.toLowerCase() === decoded
      );
      setSelectedProduct(found || null);
      return;
    }

    setSelectedProduct(null);
    setSelectedCategory(parsed.category || 'ALL');
    setSelectedBrand(parsed.brand || 'ALL');
    setSelectedCondition(parsed.condition || 'ALL');
    setSearchQuery(parsed.search || '');
  }, []);

  const catalogUrlFrom = (
    category: string,
    brand: string,
    condition: CatalogCondition,
    search: string
  ) => buildCatalogUrl({ category, brand, condition, search });

  const handleSelectProduct = (prod: Product | null) => {
    setSelectedProduct(prod);
    if (prod) {
      const modelSlug = prod.modelo || prod.id;
      writeUrl(`/?p=${encodeURIComponent(modelSlug)}`, 'push');
      return;
    }
    writeUrl(catalogUrlFrom(selectedCategory, selectedBrand, selectedCondition, searchQuery), 'push');
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedProduct(null);
    writeUrl(catalogUrlFrom(cat, selectedBrand, selectedCondition, searchQuery), 'push');
  };

  const handleSelectBrand = (brand: string) => {
    setSelectedBrand(brand);
    writeUrl(catalogUrlFrom(selectedCategory, brand, selectedCondition, searchQuery), 'replace');
  };

  const handleSelectCondition = (condition: CatalogCondition) => {
    setSelectedCondition(condition);
    writeUrl(catalogUrlFrom(selectedCategory, selectedBrand, condition, searchQuery), 'replace');
  };

  const handleSearchChange = (q: string) => {
    setSelectedProduct(null);
    setSearchQuery(q);
    writeUrl(catalogUrlFrom(selectedCategory, selectedBrand, selectedCondition, q), 'replace');
  };

  // Open product or catalog filters from the URL when products load / refresh
  useEffect(() => {
    applyLocationToState(products);
  }, [products, applyLocationToState]);

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => applyLocationToState(products);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, applyLocationToState]);

  const handleResetFilters = () => {
    setSelectedProduct(null);
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedBrand('ALL');
    setSelectedCondition('ALL');
    setSortOption('destacados');
    writeUrl('/', 'push');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Ripley-style Navbar with Hamburger Menu beside Logo */}
      <Navbar
        cartItemCount={cartItemCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCategories={() => setIsCategoryDrawerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Main Content Router: Full Product Detail Page OR Catalog */}
      {selectedProduct ? (
        /* Full-Page Product Detail View ("Hoja Completa") */
        <ProductDetailPage
          product={selectedProduct}
          allProducts={products}
          cartItems={cartItems}
          onBackToCatalog={() => handleSelectProduct(null)}
          onAddToCart={handleAddToCart}
          onSelectProduct={handleSelectProduct}
        />
      ) : (
        /* Full Catalog View */
        <>
          {/* Hero Campaign Banner */}
          <HeroBanner />

          {/* Compact Filter Bar */}
          <ProductFilters
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            brands={brands}
            selectedBrand={selectedBrand}
            onSelectBrand={handleSelectBrand}
            condition={selectedCondition}
            onSelectCondition={handleSelectCondition}
            sortOption={sortOption}
            onSelectSort={setSortOption}
            onResetFilters={handleResetFilters}
          />

          {/* Main Catalog Viewport */}
          <main className="flex-1 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-6 space-y-4 sm:space-y-6">

            {/* Catalog Grid View */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-3">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-400" />
                <h3 className="text-base font-bold text-slate-900">
                  No se encontraron productos con estos filtros
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Intenta cambiar los términos de búsqueda o restablecer los filtros de categoría y condición.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  Ver todos los {products.length} productos
                </button>
              </div>
            ) : (
              /* Products Grid: 2 columns on mobile, scaling up to 5 on large screens */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={handleSelectProduct}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* Floating "Subir" (Scroll to Top) Action Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Subir a la parte superior"
        title="Subir a la parte superior"
        className={`fixed bottom-6 right-6 z-40 bg-slate-900/95 hover:bg-slate-900 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-slate-700/60 backdrop-blur-xs text-xs sm:text-sm font-bold ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
        <span>Subir</span>
      </button>

      {/* Categories Slide-Over Drawer (Hamburger Menu) */}
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        otherCategories={categories}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
