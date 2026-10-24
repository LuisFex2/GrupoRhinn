import React, { useState, useEffect } from 'react';
import { Product, CartItem } from '../types/product';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Tv,
  Refrigerator,
  CookingPot,
  Shirt,
  Wind,
  Sparkles,
  CreditCard,
  ChevronRight,
  Share2,
  ShoppingBag,
  CheckCircle2,
  ZoomIn,
  X,
  Info,
  ChevronDown,
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  cartItems?: CartItem[];
  onBackToCatalog: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  cartItems,
  onBackToCatalog,
  onAddToCart,
  onSelectProduct,
}) => {
  const maxStock = Math.max(1, product.stock || 1);
  const [quantity, setQuantity] = useState(1);
  const [comments, setComments] = useState('');
  const [imageError, setImageError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Lightbox modal state: isLightboxOpen opens the modal, isZoomed enlarges it even more on click
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(true);

  // Scroll to top on mount or product change, and reset state
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setImageError(false);
    setIsLightboxOpen(false);
    setIsZoomed(false);
    setIsSpecsOpen(true);
    setQuantity(1);
    setComments('');
  }, [product.id, product.stock]);

  // Handle ESC key and body scroll lock for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
        setIsZoomed(false);
      }
    };
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen]);

  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${encodeURIComponent(product.modelo || product.id)}`
    : '';

  const handleShare = async () => {
    // 1. Try Native Web Share API (Mobile, Chrome, Safari, Edge)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.nombre} | GRUPO RHINN`,
          text: `Mira ${product.nombre} (${product.modelo}) - ${product.condicion} a ${product.precioTexto} en GRUPO RHINN`,
          url: productUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // 2. Fallback: Copy direct product URL to clipboard
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(productUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  const existingInCart = cartItems?.find(i => i.product.id === product.id)?.quantity || 0;
  const isCartAtMax = existingInCart >= maxStock;

  const handleAddToCartClick = () => {
    if (isCartAtMax) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
      return;
    }
    const allowedToAdd = Math.min(quantity, Math.max(0, maxStock - existingInCart));
    onAddToCart(product, allowedToAdd > 0 ? allowedToAdd : 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // WhatsApp Calculation
  const whatsappNum = '51994516143';
  const totalAmount = product.precio * quantity;
  const totalFormatted = `S/ ${totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const referenceOldPrice = Math.round(product.precio * 1.30);
  const oldPriceFormatted = `S/ ${referenceOldPrice.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const commentText = comments.trim() ? `\n* Comentarios: ${comments.trim()}` : '';

  const linkText = productUrl ? `\n\n🔗 ${productUrl}` : '';

  const whatsappMessage = encodeURIComponent(
    `Hola GRUPO RHINN, me interesa comprar:\n\n` +
    `* Producto: ${product.nombre}\n` +
    `* Modelo: ${product.modelo}\n` +
    `* Condición: ${product.condicion}\n` +
    `* Cantidad: ${quantity} unidad(es)\n` +
    `* Total a pagar: ${totalFormatted}` +
    commentText +
    linkText
  );

  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${whatsappMessage}`;

  // Related products
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.categoria === product.categoria || p.marca === product.marca))
    .slice(0, 4);

  const getCategoryIcon = () => {
    const cat = product.categoria.toUpperCase();
    if (cat.includes('TV')) return Tv;
    if (cat.includes('REFRIGERADOR')) return Refrigerator;
    if (cat.includes('COCINA')) return CookingPot;
    if (cat.includes('LAV')) return Shirt;
    if (cat.includes('VENTILADOR')) return Wind;
    return Sparkles;
  };
  const CategoryIcon = getCategoryIcon();

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumb & Navigation Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3 flex items-center justify-between gap-4">
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <button onClick={onBackToCatalog} className="hover:text-slate-900 cursor-pointer">
              Catálogo
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span>{product.categoria}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-semibold text-slate-800 truncate max-w-xs">{product.nombre}</span>
          </nav>

          {/* Share */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
            title="Copiar enlace"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? '¡Enlace copiado!' : 'Compartir'}</span>
          </button>
        </div>
      </div>

      {/* Main Full-Page Product Viewport */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            
            {/* Left Column: Direct Image Showcase (No restricting inner border box) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[400px] sm:min-h-[520px] lg:min-h-[600px]">
              {/* Condition Kicker Badge */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-lg shadow-xs ${
                    product.condicion === 'De Exhibición'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {product.condicion === 'De Exhibición' ? 'De Exhibición' : 'Nuevo'}
                </span>
              </div>

              {/* Main Product Image Container - Uses full available space */}
              <div
                onClick={() => {
                  if (product.thumbnailUrl && !imageError) {
                    setIsLightboxOpen(true);
                    setIsZoomed(false);
                  }
                }}
                className={`w-full h-full flex items-center justify-center relative group p-2 ${
                  product.thumbnailUrl && !imageError ? 'cursor-zoom-in' : ''
                }`}
                title="Clic para ampliar"
              >
                {product.thumbnailUrl && !imageError ? (
                  <img
                    src={product.thumbnailUrl}
                    alt={product.nombre}
                    onError={() => setImageError(true)}
                    referrerPolicy="no-referrer"
                    className="max-h-[540px] sm:max-h-[620px] w-auto max-w-full object-contain select-none transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="text-center p-12">
                    <div className="w-28 h-28 rounded-3xl bg-slate-50 border border-slate-200 shadow-xs mx-auto mb-4 flex items-center justify-center">
                      <CategoryIcon className="w-14 h-14 text-indigo-600" />
                    </div>
                    <div className="text-base font-bold uppercase text-slate-800 tracking-wider">
                      {product.marca}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-1">{product.modelo}</div>
                  </div>
                )}

                {product.thumbnailUrl && !imageError && (
                  <div className="absolute bottom-2 right-2 bg-slate-900/85 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm transition-opacity opacity-85 group-hover:opacity-100">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-medium">Clic para ampliar</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Specifications & WhatsApp Order Module */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                {/* Brand tag */}
                <div className="text-[10px] sm:text-xs font-bold text-sky-600 uppercase tracking-wider leading-none">
                  {product.marca}
                </div>

                {/* Product Full Headline */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {product.nombre}
                </h1>

                {/* Subtitle with Model and Condition - Single Line on Mobile */}
                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 font-sans leading-none pt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  <span>Mod: <strong className="font-semibold text-slate-800 font-mono">{product.modelo}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Condición: <strong className="font-semibold text-slate-800 font-sans">{product.condicion}</strong></span>
                </div>

              {/* Order & WhatsApp Module */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                  {/* Price & Quantity Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-sm sm:text-base text-slate-400 line-through font-sans font-normal">
                          {oldPriceFormatted}
                        </span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
                          {product.precioTexto || `S/ ${product.precio.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        * Precio final liquidación inc. IGV con boleta o factura.
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 self-start sm:self-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 px-2 select-none">
                        Cant.
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                        title="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-xs font-mono text-slate-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.min(maxStock, q + 1))}
                        disabled={quantity >= maxStock}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                        title="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Comments Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="pComments" className="block text-xs font-semibold text-slate-700">
                      Indicación o consulta adicional <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      id="pComments"
                      type="text"
                      value={comments}
                      onChange={e => setComments(e.target.value)}
                      placeholder="Ej. Deseo retiro en tienda, coordinar visita..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm sm:text-base font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white transition-all shadow-md cursor-pointer"
                    >
                      <WhatsAppIcon className="w-5 h-5 fill-current" />
                      <span>Pedir por WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleAddToCartClick}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {addedToCart ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">
                            {isCartAtMax
                              ? '¡Ya alcanzaste el máximo disponible en tu carrito!'
                              : '¡Agregado al Carrito de Compras!'}
                          </span>
                        </>
                      ) : isCartAtMax ? (
                        <>
                          <ShoppingBag className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-500 font-medium">
                            Máximo en carrito ({existingInCart} unid.)
                          </span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-slate-600" />
                          <span>Agregar al Carrito de Pedido</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Garantía Operativa</div>
                      <div className="text-[11px] text-slate-500">Productos revisados y probados.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">Delivery y Envíos</span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded">
                          Próximamente
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">Por ahora retiro en tienda en Villa El Salvador, Lima.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CreditCard className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">Medios de Pago</div>
                      <div className="text-[11px] text-slate-500">Yape, Plin, Transferencia BCP / BBVA.</div>
                    </div>

                  </div>
                </div>

                {/* Specifications Accordion Box matching reference design */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                    className="w-full flex items-center justify-between text-left cursor-pointer group"
                    aria-expanded={isSpecsOpen}
                  >
                    <div className="flex items-center gap-2.5">
                      <Info className="w-5 h-5 text-slate-800 shrink-0 stroke-[2.2]" />
                      <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        Especificaciones
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-transform duration-200 ${
                        isSpecsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isSpecsOpen && (
                    <div className="mt-3.5 pt-3.5 border-t border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                      {(product.descripcion || '').replace(/\\n/g, '\n')}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 sm:mt-12 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Productos Relacionados ({product.categoria})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Otros modelos de la misma línea o marca disponibles en catálogo
                </p>
              </div>
              <button
                onClick={onBackToCatalog}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Ver todo el catálogo →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {relatedProducts.map(rel => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onOpenDetails={onSelectProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clean Lightbox Modal - Pure image with close X, no titles covering image */}
      {isLightboxOpen && product.thumbnailUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setIsLightboxOpen(false);
            setIsZoomed(false);
          }}
        >
          {/* Modal Container */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] p-3 sm:p-6 flex items-center justify-center overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Top-Right Close Button - Prominent red-bordered circle for maximum visibility on all backgrounds */}
            <button
              type="button"
              onClick={() => {
                setIsLightboxOpen(false);
                setIsZoomed(false);
              }}
              aria-label="Cerrar ampliación"
              title="Cerrar (Esc)"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-rose-500 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Scrollable / Zoomable image viewport (Takes 100% of height, nothing covering top) */}
            <div className="w-full h-full max-h-[86vh] overflow-auto flex items-center justify-center p-1 sm:p-2">
              <img
                src={product.thumbnailUrl}
                alt={product.nombre}
                referrerPolicy="no-referrer"
                onClick={() => setIsZoomed(!isZoomed)}
                className={`max-h-[82vh] max-w-full object-contain select-none transition-transform duration-200 ${
                  isZoomed ? 'scale-[1.7] cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                title={isZoomed ? 'Clic para reducir' : 'Clic para agrandar más'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
