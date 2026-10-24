import React from 'react';
import { Product } from '../types/product';
import { Eye, Tv, Refrigerator, CookingPot, Shirt, Wind, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
}) => {
  const [imageFailed, setImageFailed] = React.useState(false);

  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p/${encodeURIComponent(product.modelo || product.id)}`
    : '';
  const linkText = productUrl ? `\n\n🔗 ${productUrl}` : '';

  const directMsg = encodeURIComponent(
    `Hola GRUPO RHINN me interesa comprar:\n\n` +
    `* Producto: ${product.nombre}\n` +
    `* Modelo: ${product.modelo}\n` +
    `* Condición: ${product.condicion}\n` +
    `* Precio: ${product.precioTexto}` +
    linkText
  );
  const whatsappNum = '51994516143';
  const whatsappUrl = `https://wa.me/${whatsappNum}?text=${directMsg}`;

  // Category Icon Fallback
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
    <article
      onClick={() => onOpenDetails(product)}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer relative"
    >
      {/* Visual Image Container */}
      <div className="relative aspect-4/3 bg-white overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
        {product.thumbnailUrl && !imageFailed ? (
          <img
            src={product.thumbnailUrl}
            alt={`${product.nombre} ${product.modelo}`}
            onError={() => setImageFailed(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-400 bg-linear-to-b from-slate-50 to-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 mb-2 group-hover:scale-110 transition-transform">
              <CategoryIcon className="w-7 h-7 text-indigo-600" />
            </div>
            <span className="text-[11px] font-semibold text-slate-600 tracking-wider uppercase">
              {product.marca}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {product.modelo}
            </span>
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {product.condicion === 'De Exhibición' ? (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
              De Exhibición
            </span>
          ) : (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
              Nuevo
            </span>
          )}
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4 pointer-events-none">
          <button
            onClick={e => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="pointer-events-auto px-3 py-1.5 bg-white/95 hover:bg-white text-slate-900 text-xs font-semibold rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 border border-slate-200/60"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ver detalle</span>
          </button>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand line */}
          <div className="text-[10px] sm:text-[11px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">
            {product.marca}
          </div>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[30px] sm:min-h-[34px]">
            {product.nombre}
          </h3>

          {/* Model code */}
          <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono mt-0.5 truncate">
            Mod: <span className="text-slate-700">{product.modelo}</span>
          </div>
        </div>

        {/* Price and Direct WhatsApp Order Button */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-dashed border-slate-200">
          <div className="text-sm sm:text-base font-black text-slate-900 font-mono tabular-nums mb-1.5 sm:mb-2">
            {product.precioTexto || `S/ ${product.precio.toFixed(2)}`}
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-98 rounded-lg transition-all shadow-xs"
          >
            <WhatsAppIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" />
            <span>Pedir</span>
          </a>
        </div>
      </div>
    </article>
  );
};
