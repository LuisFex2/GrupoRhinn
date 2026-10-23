import React, { useState } from 'react';
import { CartItem } from '../types/product';
import { X, Trash2, ShoppingBag, Send, Phone, MapPin, User } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Yape / Plin');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.precio * item.quantity,
    0
  );

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    let message = `🛒 *PEDIDO WEB - GRUPO RHINN*\n`;
    message += `--------------------------------\n`;
    items.forEach((item, idx) => {
      message += `${idx + 1}. *${item.product.nombre}* (${item.product.modelo})\n`;
      message += `   Cant: ${item.quantity} x S/ ${item.product.precio.toFixed(2)} = S/ ${(item.quantity * item.product.precio).toFixed(2)}\n`;
      message += `   Condición: ${item.product.condicion}\n`;
    });
    message += `--------------------------------\n`;
    message += `*TOTAL A PAGAR: S/ ${totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*\n\n`;

    message += `👤 *DATOS DEL CLIENTE:*\n`;
    message += `Nombre: ${customerName || 'No especificado'}\n`;
    message += `Teléfono: ${customerPhone || 'No especificado'}\n`;
    message += `📍 *Recojo / Ubicación:* ${customerAddress || 'Retiro en almacén / tienda'}\n`;
    message += `💳 *Método de Pago:* ${paymentMethod}\n`;
    if (notes.trim()) {
      message += `💬 *Notas:* ${notes}\n`;
    }
    message += `\n¿Me confirman la disponibilidad para coordinar el pedido?`;

    const whatsappNumber = '51994516143';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Tu Pedido / Cotización</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <h3 className="text-sm font-semibold text-slate-700">Tu carrito está vacío</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Agrega productos del catálogo para armar tu cotización o solicitar pedido inmediato por WhatsApp.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                    <span>{items.length} productos seleccionados</span>
                    <button
                      onClick={onClearCart}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-medium cursor-pointer"
                    >
                      Vaciar lista
                    </button>
                  </div>

                  {items.map(item => (
                    <div
                      key={item.product.id}
                      className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-md bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                        {item.product.thumbnailUrl ? (
                          <img
                            src={item.product.thumbnailUrl}
                            alt={item.product.nombre}
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            {item.product.marca.slice(0, 3)}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.product.nombre}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.product.modelo} · {item.product.condicion}
                        </div>
                        <div className="text-xs font-mono tabular-nums font-semibold text-indigo-700 mt-1">
                          S/ {(item.product.precio * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center border border-slate-300 rounded bg-white">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="px-1.5 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                            aria-label="Disminuir cantidad"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-slate-900 select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.product.stock || 1)}
                            className="px-1.5 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Aumentar cantidad"
                            title={item.quantity >= (item.product.stock || 1) ? 'Límite máximo disponible alcanzado' : 'Aumentar cantidad'}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal preview */}
                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Subtotal de productos</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                      S/ {totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    * Despacho y flete a cotizar según distrito o provincia de envío.
                  </div>
                </div>

                {/* Checkout / Contact Form */}
                <form onSubmit={handleSendWhatsAppOrder} className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Datos para la entrega y pedido
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Nombre completo *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="Ej. Carlos Mendoza"
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="Ej. 987 654 321"
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Modalidad / Punto de recojo
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={e => setCustomerAddress(e.target.value)}
                        placeholder="Retiro en almacén / tienda (o consultar disponibilidad)"
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded mt-1 inline-block">
                      * Delivery próximamente. Por ahora retiro en tienda en Villa El Salvador, Lima.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Método de pago preferido
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Yape / Plin">Yape / Plin</option>
                      <option value="Transferencia BCP / BBVA">Transferencia BCP / BBVA</option>
                      <option value="Efectivo en Tienda / Almacén">Efectivo en Tienda / Almacén</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Comentarios o requerimientos especiales
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Ej. Entregar en la tarde o enviar con agencia Shalom..."
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md cursor-pointer mt-2"
                  >
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                    <span>Finalizar Pedido por WhatsApp</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
