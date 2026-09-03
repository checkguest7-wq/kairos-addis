import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Car,
  Clock,
  CheckCircle2,
  Truck,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Package,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { VehicleOrder } from '../../types';

interface PortalOrdersViewProps {
  orders: VehicleOrder[];
  onNavigateToVehicles: () => void;
  onNavigateToMessages: (context?: string) => void;
}

export const PortalOrdersView: React.FC<PortalOrdersViewProps> = ({
  orders,
  onNavigateToVehicles,
  onNavigateToMessages,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const isCompleted = (status: string) => {
    const s = (status || '').toUpperCase();
    return s === 'COMPLETED' || s === 'DELIVERED' || s === 'READY FOR DELIVERY';
  };

  const isCancelled = (status: string) => {
    const s = (status || '').toUpperCase();
    return s === 'CANCELLED';
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'ACTIVE') return !isCompleted(order.status) && !isCancelled(order.status);
    if (filter === 'COMPLETED') return isCompleted(order.status);
    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();

    if (s.includes('REVIEW') || s.includes('RECEIVED')) {
      return (
        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }

    if (s.includes('PROCESSING') || s.includes('VERIFIED') || s.includes('PREPARING')) {
      return (
        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }

    if (s.includes('TRANSIT') || s.includes('PORT') || s.includes('CUSTOMS')) {
      return (
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }

    if (isCompleted(status)) {
      return (
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }

    if (isCancelled(status)) {
      return (
        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider">
          Cancelled
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold uppercase tracking-wider">
        {status}
      </span>
    );
  };

  const getStepProgress = (order: VehicleOrder) => {
    if (order.stepProgress) return order.stepProgress;
    const s = (order.status || '').toUpperCase();
    if (s.includes('RECEIVED') || s.includes('REVIEW')) return 1;
    if (s.includes('VERIFIED') || s.includes('PROCESSING') || s.includes('PAYMENT')) return 2;
    if (s.includes('TRANSIT') || s.includes('PREPARING')) return 3;
    if (isCompleted(s)) return 4;
    return 1;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            VEHICLE ACQUISITION TRACKER
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Vehicle Orders
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of your custom import reservations, customs clearance, and delivery schedules.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Orders' : tab === 'ACTIVE' ? 'Active' : 'Delivered'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Car className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Orders Placed Yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Explore our current stock of electric vehicles and place an order using your verified customer account.
            </p>
          </div>
          <div className="pt-2">
            <button
              id="btn-orders-browse-vehicles"
              onClick={onNavigateToVehicles}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Car className="w-4 h-4" />
              <span>Browse EV Catalog</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const currentStep = getStepProgress(order);

            return (
              <div
                key={order.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-cyan-500/30 transition-all space-y-6 p-6 sm:p-8"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Ordered on {order.orderDate || (order as any).createdAt}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white">{order.vehicleName}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Vehicle & Specs Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="relative h-36 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                    <img
                      src={order.vehicleImage || '/images/hero_byd_tang_1788207021341.jpg'}
                      alt={order.vehicleName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/90 text-[10px] font-bold text-cyan-400 uppercase">
                      {order.vehicleBrand}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block">Selected Color</span>
                        <strong className="text-white">{order.selectedColor}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block">Estimated Price</span>
                        <strong className="text-cyan-300">{order.priceFormattedETB || order.priceFormatted || (order.priceETB ? `ETB ${order.priceETB.toLocaleString()}` : 'Official Showroom Quotation')}</strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-500 uppercase block">Handover Location</span>
                        <strong className="text-white">{order.deliveryLocation || 'Bole Wollo Sefer Flagship'}</strong>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                        <strong className="text-slate-300">Custom Notes:</strong> {order.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Acquisition & Delivery Milestones
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {[
                      { step: 1, label: 'Order & Docs Verified', desc: 'Fayda ID & Licence checked' },
                      { step: 2, label: 'Import Processing', desc: 'LC allocation & factory dispatch' },
                      { step: 3, label: 'Customs & Transit', desc: 'Modjo Port & Bole clearance' },
                      { step: 4, label: 'PDI & Handover', desc: 'Bole Wollo Sefer Flagship' },
                    ].map((item) => {
                      const isComplete = currentStep >= item.step;

                      return (
                        <div
                          key={item.step}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isComplete
                              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
                              : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isComplete
                                  ? 'bg-cyan-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isComplete ? '✓' : item.step}
                            </span>
                            <span className={`text-xs font-bold ${isComplete ? 'text-white' : 'text-slate-400'}`}>
                              {item.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-snug">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => onNavigateToMessages(`Inquiry regarding Order ${order.orderNumber}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Contact Sales Concierge</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
