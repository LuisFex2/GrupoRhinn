import React from 'react';
import { SortOption } from '../types/product';
import { Tag, Sparkles, X } from 'lucide-react';

interface ProductFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  brands: string[];
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  condition: 'ALL' | 'Nuevo' | 'De Exhibición';
  onSelectCondition: (cond: 'ALL' | 'Nuevo' | 'De Exhibición') => void;
  sortOption: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onResetFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  brands,
  selectedBrand,
  onSelectBrand,
  condition,
  onSelectCondition,
  sortOption,
  onSelectSort,
  onResetFilters,
}) => {
  const isFiltered =
    selectedCategory !== 'ALL' ||
    selectedBrand !== 'ALL' ||
    condition !== 'ALL';

  return (
    <div className="bg-white border-b border-slate-200 py-2 sm:py-2.5 sticky top-18 sm:top-20 z-30 shadow-2xs">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          
          {/* Condition Selector - Visible on ALL screens (mobile & desktop) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => onSelectCondition('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  condition === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => onSelectCondition('Nuevo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  condition === 'Nuevo'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nuevos</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectCondition('De Exhibición')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  condition === 'De Exhibición'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Exhibición</span>
              </button>
            </div>

            {/* Active category pill (if selected) */}
            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs shrink-0 animate-fade-in">
                <span>{selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => onSelectCategory('ALL')}
                  className="hover:text-indigo-950 p-0.5 rounded cursor-pointer"
                  title="Quitar filtro de categoría"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {/* Limpiar button - Placed immediately next to the condition options */}
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer shrink-0 ml-1.5"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Right: Brand and Sort dropdowns */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Brand Dropdown */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
              <select
                value={selectedBrand}
                onChange={e => onSelectBrand(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="ALL">Todas las Marcas</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
              <select
                value={sortOption}
                onChange={e => onSelectSort(e.target.value as SortOption)}
                className="w-full sm:w-auto bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer shadow-2xs"
              >
                <option value="destacados">Destacados</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre-asc">Nombre: A - Z</option>
                <option value="stock-desc">Mayor stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
