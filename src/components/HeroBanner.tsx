import React from 'react';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    /* Desktop / Tablet Hero Banner only (Hidden on mobile so products are visible immediately) */
    <section className="hidden md:block bg-gradient-to-b from-slate-100 to-slate-50 border-b border-slate-200">
      <div className="w-full max-w-[1720px] mx-auto px-6 lg:px-8 xl:px-12 py-5 sm:py-6">
        <div className="max-w-4xl">
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Electrodomésticos y Tecnología para tu Hogar
          </h1>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-2xl">
            Precios directos de inventario en soles (S/). Productos nuevos sellados y de exhibición con garantía verificada. Retiro en tienda en Villa El Salvador, Lima.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[11px] text-slate-600">
            <div className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Garantía de funcionamiento verificada</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>Envíos y Delivery</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded">
                Próximamente
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div className="flex items-center gap-1 font-medium">
              <CreditCard className="w-3.5 h-3.5 text-slate-700" />
              <span>Pago seguro (Yape, Plin, Transferencia o Efectivo)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
