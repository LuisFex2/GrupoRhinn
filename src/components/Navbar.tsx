import React from 'react';
import { Search, ShoppingCart, MapPin, X, Menu, RefreshCw } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface NavbarProps {
  cartItemCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenCategories: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount,
  cartTotal,
  onOpenCart,
  onOpenCategories,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
}) => {
  const whatsappUrl = `https://wa.me/51994516143?text=${encodeURIComponent(
    'Hola GRUPO RHINN, quisiera consultar por su catálogo de electrodomésticos.'
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Main Navigation Row (Ripley-style layout) */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between gap-3 sm:gap-4 md:gap-8 h-18 sm:h-20">
          
          {/* Left: Hamburger Menu Button & Brand Logo (Ripley-style) */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <button
              type="button"
              onClick={onOpenCategories}
              aria-label="Abrir menú de categorías"
              className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 rounded-lg text-slate-800 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              title="Menú de Categorías"
            >
              <Menu className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
              <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider text-slate-700">
                Categorías
              </span>
            </button>

            <a
              href="/"
              className="flex items-center group py-1"
              title="GRUPO RHINN - Electrodomésticos y Tecnología"
            >
              <img
                src="/assets/aistudio/logo-rhinn_0187ef6a.png"
                alt="GRUPO RHINN"
                className="h-9 sm:h-11 md:h-12 w-auto object-contain group-hover:opacity-95 transition-opacity"
              />
            </a>
          </div>

          {/* Center: Ripley-style Rounded Pill Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto hidden sm:block">
            <div className="relative w-full">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Buscar en Grupo Rhinn (marca, modelo, televisor...)"
                className="w-full pl-11 pr-10 py-2.5 sm:py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-slate-800 rounded-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions (Location info, WhatsApp assistance, Cart) */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            {/* Store Location */}
            <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 cursor-default select-none border-r border-slate-200 pr-5">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="leading-tight text-left">
                <span className="block text-[10px] text-slate-400 font-medium">Tienda física</span>
                <span className="font-semibold text-slate-800">Villa El Salvador, Lima</span>
              </div>
            </div>

            {/* WhatsApp Direct Help */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors border border-emerald-200/80 cursor-pointer"
              title="Consultar con asesor por WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>Atención WhatsApp</span>
            </a>

            {/* Live Google Sheets Refresh Button */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Actualizar datos desde Google Sheets"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                title="Actualizar catálogo en vivo desde Google Sheet"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                <span className="hidden md:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
            )}

            {/* Shopping Cart button with Badge */}
            <button
              onClick={onOpenCart}
              aria-label="Ver bolsa de compras"
              className="relative inline-flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-sm group"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center font-mono ring-2 ring-white">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-semibold">
                {cartItemCount > 0 ? (
                  <span className="hidden xs:inline font-mono">
                    S/ {cartTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                ) : (
                  <span>Mi Pedido</span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Row (for small screens when center bar is hidden) */}
        <div className="sm:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar en Grupo Rhinn..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
