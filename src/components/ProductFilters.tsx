import React from 'react';
import { SortOption } from '../types/product';
import { Tag, Sparkles, X, ArrowUpDown, ChevronDown } from 'lucide-react';

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
    <div className="bg-white border-b border-slate-200 py-2.5 sm:py-3 sticky top-18 sm:top-20 z-30 shadow-2xs">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          
          {/* Left: Condition Filter Pill Buttons, Active Category & Limpiar Filtros Button */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Condition: "Todos" */}
            <button
              type="button"
              onClick={() => onSelectCondition('ALL')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0 ${
                condition === 'ALL'
                  ? 'bg-slate-900 text-white border border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }`}
            >
              <span>Todos</span>
            </button>

            {/* Condition: "Nuevos" */}
            <button
              type="button"
              onClick={() => onSelectCondition('Nuevo')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0 ${
                condition === 'Nuevo'
                  ? 'bg-emerald-600 text-white border border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${condition === 'Nuevo' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Nuevos</span>
            </button>

            {/* Condition: "Exhibición" */}
            <button
              type="button"
              onClick={() => onSelectCondition('De Exhibición')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0 ${
                condition === 'De Exhibición'
                  ? 'bg-amber-600 text-white border border-amber-600 shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
              }`}
            >
              <Tag className={`w-3.5 h-3.5 ${condition === 'De Exhibición' ? 'text-white' : 'text-amber-600'}`} />
              <span>Exhibición</span>
            </button>

            {/* Active category pill (if selected from drawer) */}
            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-900 text-white text-xs font-semibold shadow-xs shrink-0 animate-fade-in border border-blue-900">
                <span>{selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => onSelectCategory('ALL')}
                  className="hover:bg-white/20 p-0.5 rounded-full cursor-pointer transition-colors"
                  title="Quitar filtro de categoría"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </span>
            )}

            {/* Prominent "Limpiar filtros" Button matching user reference */}
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
                title="Restablecer todos los filtros"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>

          {/* Right: Brand and Sort dropdowns with matching pill style */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* Brand Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedBrand}
                onChange={e => onSelectBrand(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 rounded-full pl-3.5 pr-8 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer shadow-2xs appearance-none transition-all"
              >
                <option value="ALL">Todas las Marcas</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Sort selector matching [ ≡↑ Ordenar ] style */}
            <div className="relative flex-1 sm:flex-initial">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
              <select
                value={sortOption}
                onChange={e => onSelectSort(e.target.value as SortOption)}
                className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 rounded-full pl-8 pr-8 py-1.5 text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer shadow-2xs appearance-none transition-all"
              >
                <option value="destacados">Ordenar: Destacados</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre-asc">Nombre: A - Z</option>
                <option value="stock-desc">Mayor stock</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
