import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Car,
  ChevronRight,
  X,
  FileCheck2,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { VehicleOrder } from '../../types';
import { api } from '../../lib/api';

export const AdminOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Update Status Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [vinInput, setVinInput] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [forceAccept, setForceAccept] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Delete Order Confirmation Modal
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminGetOrders();
      setOrders(res.orders || []);
    } catch (err: any) {
      console.error('[FETCH ORDERS ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenUpdateModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setVinInput(order.vin || '');
    setStatusNote('');
    setForceAccept(false);
    setUpdateError(null);
  };

  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    setUpdateError(null);
    try {
      await api.adminUpdateOrderStatus(selectedOrder.id, {
        status: newStatus,
        note: statusNote,
        vin: vinInput,
        forceAccept,
      });
      setUpdateSuccess(`Order #${selectedOrder.orderNumber} status updated to "${newStatus}".`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    try {
      await api.adminDeleteOrder(orderToDelete.id);
      setUpdateSuccess(`Order #${orderToDelete.orderNumber} has been permanently deleted.`);
      setOrderToDelete(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to delete order.');
    } finally {
      setIsDeleting(false);
    }
  };

  const ORDER_STATUS_LIST = [
    'Order Received',
    'Under Review',
    'Documents Verified',
    'Payment Processing',
    'Preparing Vehicle',
    'Ready for Delivery',
    'Completed',
    'Cancelled',
  ];

  const filteredOrders = orders.filter((ord) => {
    const matchesFilter = statusFilter === 'ALL' || ord.status === statusFilter;
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.customer && ord.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.vin && ord.vin.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div id="admin-orders-view" className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-white tracking-wide">
            Vehicle Orders & Delivery Pipeline
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Process custom import orders through 6 verified milestone stages, enforce document compliance, and manage VIN assignments.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, vehicle, buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Success notification */}
      {updateSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {updateSuccess}
          </span>
          <button onClick={() => setUpdateSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {['ALL', ...ORDER_STATUS_LIST].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders List / Cards */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading orders pipeline...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
          No vehicle orders found matching current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const hasVerifiedDocs = order.documentsStatus?.allDocsVerified;
            const hasUploadedDocs = order.documentsStatus?.allDocsUploaded;
            const isCancelled = order.status === 'Cancelled';
            const isCompleted = order.status === 'Completed';

            return (
              <div
                key={order.id}
                className={`p-5 rounded-2xl border transition-all shadow-xl space-y-4 ${
                  isCancelled
                    ? 'bg-slate-950/70 border-rose-950/50 opacity-80'
                    : isCompleted
                    ? 'bg-slate-900/90 border-emerald-900/50'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isCancelled
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : isCompleted
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      #{order.orderNumber}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {order.vehicleName}
                        <span className="text-xs font-normal text-slate-400">({order.selectedColor})</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Buyer:{' '}
                        <span className="text-slate-200 font-semibold">{order.customer?.fullName || 'Customer'}</span>{' '}
                        · Ordered: {order.orderDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Compliance Indicator */}
                    <div className="text-right">
                      {hasVerifiedDocs ? (
                        <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Docs Verified
                        </span>
                      ) : hasUploadedDocs ? (
                        <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Docs In Review
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Incomplete Docs
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-lg font-bold text-xs font-mono ${
                        isCancelled
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {order.status}
                    </span>

                    <button
                      id={`admin-update-ord-${order.id}`}
                      onClick={() => handleOpenUpdateModal(order)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      {isCancelled ? 'Re-open Order' : 'Update Stage'}
                    </button>

                    {/* Trash Delete Order Button */}
                    <button
                      id={`admin-delete-ord-${order.id}`}
                      onClick={() => setOrderToDelete(order)}
                      title="Permanently Delete Order"
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mid Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pricing & Duty</span>
                    <span className="text-white font-mono font-bold">{order.priceFormattedETB || order.priceFormatted || (order.priceETB ? `ETB ${order.priceETB.toLocaleString()}` : 'Official Showroom Quotation')}</span>
                    <span className="text-[10px] text-emerald-400 block font-semibold">0% Customs Duty</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Assigned VIN</span>
                    <span className="text-amber-300 font-mono font-bold">{order.vin || 'Pending Assignment'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Est. Delivery Window</span>
                    <span className="text-slate-300">{order.estimatedDelivery}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Milestone Progress</span>
                    <span className="text-white font-mono font-bold">
                      {isCancelled ? 'Cancelled' : `Stage ${order.stepProgress || 1} of 6`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {!isCancelled && (
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-amber-500 to-amber-400'
                      }`}
                      style={{ width: `${((order.stepProgress || 1) / 6) * 100}%` }}
                    />
                  </div>
                )}

                {/* Latest History Note */}
                {order.history && order.history.length > 0 && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-amber-400 font-semibold">Latest Update ({order.history[0].date}):</span>{' '}
                    {order.history[0].note}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Update Order Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white font-serif">
                  Update Order #{selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-slate-400">{selectedOrder.vehicleName}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Status Update Blocked</p>
                  <p>{updateError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveStatusUpdate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Milestone Stage Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-semibold"
                >
                  {ORDER_STATUS_LIST.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Vehicle VIN / Chassis Number</label>
                <input
                  type="text"
                  placeholder="e.g. LBYEA6409S0089241"
                  value={vinInput}
                  onChange={(e) => setVinInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Customer Status Note (Delivered to Client Portal)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Ethiopian Customs clearance completed at Modjo Dry Port. Vehicle dispatched to Bole showroom."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Force accept override checkbox if docs missing */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="forceAcceptCheck"
                  checked={forceAccept}
                  onChange={(e) => setForceAccept(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="forceAcceptCheck" className="text-slate-400 cursor-pointer">
                  Admin Override: Advance milestone even if documents pending
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setOrderToDelete(selectedOrder);
                  }}
                  className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Order
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdating ? 'Updating...' : 'Save & Notify Customer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Dialog */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Permanently Delete Order?</h3>
                <p className="text-xs text-slate-400 font-mono">Order #{orderToDelete.orderNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete order <span className="font-bold text-white">#{orderToDelete.orderNumber}</span> for <span className="text-amber-300 font-semibold">{orderToDelete.vehicleName}</span>? This will remove all associated milestone history. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteOrder}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
