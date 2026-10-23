import React from 'react';
import { MapPin, Clock, ShieldCheck, Truck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16 border-t border-slate-800">
      {/* 3 Pillars strip matching user reference */}
      <div className="border-b border-slate-800 py-8">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Recojo en Almacén</div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Retiro disponible en Villa El Salvador, Lima. Previa coordinación por WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Delivery y Envíos</span>
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded">
                  Próximamente
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Preparando servicio de delivery. Por ahora retiro en tienda en Villa El Salvador, Lima.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Garantía Operativa</div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Productos revisados y probados. Garantía en todos los electrodomésticos y equipos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links and info */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
          <div className="space-y-3 md:col-span-7 lg:col-span-8">
            <div className="inline-flex items-center bg-white px-3 py-1.5 rounded-lg shadow-xs">
              <img
                src="/assets/aistudio/logo-rhinn_0187ef6a.png"
                alt="GRUPO RHINN"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Venta y liquidación oficial de electrodomésticos, televisores y línea blanca. Atención personalizada y pedidos directos por WhatsApp para entrega inmediata en Lima y provincias.
            </p>
            <div className="text-xs text-slate-500 font-mono">
              RUC: 20563169061 &bull; Lima - Perú
            </div>
          </div>

          <div className="md:col-span-5 lg:col-span-4">
            <div className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Atención Directa por WhatsApp
            </div>
            <div className="space-y-2.5 text-xs text-slate-400">
              <a
                href="https://wa.me/51994516143"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current" />
                <span>Chat de Ventas por WhatsApp</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Villa El Salvador, Lima - Perú</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Lunes a Sábado: 8:30 AM - 7:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
