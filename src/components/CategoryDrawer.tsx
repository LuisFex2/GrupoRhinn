import React, { useEffect } from 'react';
import {
  X,
  Refrigerator,
  CookingPot,
  Shirt,
  Tv,
  Wind,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PRINCIPAL_CATEGORIES: CategoryItem[] = [
  { id: 'REFRIGERADORA', label: 'Refrigeradoras', icon: Refrigerator },
  { id: 'COCINA', label: 'Cocinas', icon: CookingPot },
  { id: 'LAVADORA', label: 'Lavadoras', icon: Shirt },
  { id: 'TV LED', label: 'Televisores', icon: Tv },
  { id: 'VENTILADORA', label: 'Ventiladoras', icon: Wind },
  { id: 'LICUADORA', label: 'Licuadoras', icon: Sparkles },
];

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categoryCounts?: Record<string, number>;
  totalProductsCount?: number;
  otherCategories?: string[];
}

export const CategoryDrawer: React.FC<CategoryDrawerProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  otherCategories = [],
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCategoryClick = (catId: string) => {
    // If clicking the already selected category, deselect back to ALL, else select
    if (selectedCategory === catId) {
      onSelectCategory('ALL');
    } else {
      onSelectCategory(catId);
    }
    onClose();
  };

  const principalIds = new Set(PRINCIPAL_CATEGORIES.map(c => c.id));
  const remainingCategories = otherCategories.filter(c => !principalIds.has(c) && c !== 'ALL');

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content panel */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-out">
        {/* Minimal Clean Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <span className="text-base font-bold text-slate-900 tracking-tight">
            Categorías
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Category List - ONLY Category name and icon, no phrases, no counts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {PRINCIPAL_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold truncate">
                    {cat.label}
                  </span>
                </div>

                <ChevronRight
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-white' : 'text-slate-400'
                  }`}
                />
              </button>
            );
          })}

          {/* Other Categories if present */}
          {remainingCategories.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                Otras Categorías
              </span>
              <div className="space-y-1.5">
                {remainingCategories.map(catName => {
                  const isSelected = selectedCategory === catName;
                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => handleCategoryClick(catName)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate">{catName}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
