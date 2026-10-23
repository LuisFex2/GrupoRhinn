import React, { useState, useMemo, useEffect } from 'react';
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

  // Synchronize browser URL with active product (?p=MODELO)
  const handleSelectProduct = (prod: Product | null) => {
    setSelectedProduct(prod);
    if (prod) {
      const modelSlug = prod.modelo || prod.id;
      const newUrl = `/?p=${encodeURIComponent(modelSlug)}`;
      window.history.pushState({ productId: prod.id }, '', newUrl);
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  // Open product from URL query or path on initial load (?p=MODEL or /p/MODEL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathMatch = window.location.pathname.match(/\/p\/([^/]+)/);
    const pathModel = pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    const pParam = params.get('p') || pathModel;

    if (pParam && products.length > 0) {
      const decoded = decodeURIComponent(pParam).trim().toLowerCase();
      const found = products.find(
        p => (p.modelo && p.modelo.toLowerCase() === decoded) || p.id.toLowerCase() === decoded
      );
      if (found) {
        setSelectedProduct(found);
      }
    }
  }, [products]);

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const pathMatch = window.location.pathname.match(/\/p\/([^/]+)/);
      const pathModel = pathMatch ? decodeURIComponent(pathMatch[1]) : null;
      const pParam = params.get('p') || pathModel;

      if (pParam && products.length > 0) {
        const decoded = decodeURIComponent(pParam).trim().toLowerCase();
        const found = products.find(
          p => (p.modelo && p.modelo.toLowerCase() === decoded) || p.id.toLowerCase() === decoded
        );
        if (found) {
          setSelectedProduct(found);
          return;
        }
      }
      setSelectedProduct(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<'ALL' | 'Nuevo' | 'De Exhibición'>('ALL');
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

        // Category filter
        if (selectedCategory !== 'ALL') {
          if (selectedCategory === 'TV LED' && (p.categoria === 'TV LED' || p.categoria === 'TV QLED')) {
            // Include all TVs
          } else if (p.categoria !== selectedCategory) {
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

  const handleResetFilters = () => {
    handleSelectProduct(null);
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedBrand('ALL');
    setSelectedCondition('ALL');
    setSortOption('destacados');
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
        onSearchChange={q => {
          handleSelectProduct(null); // Return to catalog on search
          setSearchQuery(q);
        }}
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
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            brands={brands}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            condition={selectedCondition}
            onSelectCondition={setSelectedCondition}
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
        className={`fixed bottom-6 right-6 z-40 bg-slate-900/95 hover:bg-slate-900 text-white px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-slate-700/60 backdrop-blur-xs text-xs font-bold ${
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
        onSelectCategory={cat => {
          setSelectedCategory(cat);
          handleSelectProduct(null);
        }}
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
