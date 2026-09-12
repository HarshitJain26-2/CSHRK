import React, { useState, useEffect } from 'react';
import { useWorkforce } from '../context/WorkforceContext';
import { BookingStatus } from '@cshrk/types';

interface MarketplaceBooking {
  id: string;
  serviceCategory: string;
  serviceTitle: string;
  customerName: string;
  workerName: string;
  cooperativeName: string;
  status: BookingStatus;
  scheduledTime: string;
  estimatedCost: number;
}

const INITIAL_MARKETPLACE_BOOKINGS: MarketplaceBooking[] = [
  {
    id: 'BK-DEL-101',
    serviceCategory: 'Plumbing',
    serviceTitle: 'Plumbing & Pipe Leakage Repair',
    customerName: 'Rajesh Kumar (Connaught Place)',
    workerName: 'Amit Sharma',
    cooperativeName: 'New Delhi Artisan Society',
    status: BookingStatus.PENDING_ACCEPTANCE,
    scheduledTime: new Date(Date.now() + 3600000).toLocaleString(),
    estimatedCost: 900,
  },
  {
    id: 'BK-DEL-102',
    serviceCategory: 'Electrical',
    serviceTitle: 'Electrical Wiring & Breaker Maintenance',
    customerName: 'Sunita Mehra (Saket)',
    workerName: 'Vikram Singh',
    cooperativeName: 'South Delhi Skilled Labour Co-op',
    status: BookingStatus.CONFIRMED,
    scheduledTime: new Date(Date.now() + 7200000).toLocaleString(),
    estimatedCost: 1000,
  },
  {
    id: 'BK-DEL-103',
    serviceCategory: 'Carpentry',
    serviceTitle: 'Carpentry & Furniture Assembly',
    customerName: 'Anil Verma (Rohini)',
    workerName: 'Ramesh Lal',
    cooperativeName: 'North West Craftsmen Co-op',
    status: BookingStatus.IN_PROGRESS,
    scheduledTime: new Date(Date.now() - 1800000).toLocaleString(),
    estimatedCost: 1200,
  },
  {
    id: 'BK-DEL-104',
    serviceCategory: 'Appliance',
    serviceTitle: 'Air Conditioner Inspection & Filter Service',
    customerName: 'Priya Sharma (Dwarka)',
    workerName: 'Amit Sharma',
    cooperativeName: 'New Delhi Artisan Society',
    status: BookingStatus.COMPLETED,
    scheduledTime: new Date(Date.now() - 86400000).toLocaleString(),
    estimatedCost: 750,
  },
];

export const MarketplaceMonitoringView: React.FC = () => {
  const { addToast } = useWorkforce();
  const [bookings, setBookings] = useState<MarketplaceBooking[]>(INITIAL_MARKETPLACE_BOOKINGS);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchLiveBookings();
  }, []);

  const fetchLiveBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('cshrk_admin_token') || sessionStorage.getItem('cshrk_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:3000/api/v1/bookings/admin/all', { credentials: 'omit', headers });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: MarketplaceBooking[] = json.data.map((b: any) => ({
            id: b.id.substring(0, 8).toUpperCase(),
            serviceCategory: b.serviceRequest?.service?.category || 'General',
            serviceTitle: b.serviceRequest?.service?.name || 'On-Demand Service',
            customerName: b.customer?.fullName || 'Registered Customer',
            workerName: b.worker?.fullName || 'Assigned Worker',
            cooperativeName: b.worker?.cooperative?.name || 'Labour Co-op',
            status: b.status as BookingStatus,
            scheduledTime: b.startTime ? new Date(b.startTime).toLocaleString() : 'Scheduled',
            estimatedCost: Number(b.totalAmount) || 500,
          }));
          setBookings(mapped);
        }
      }
    } catch {
      // Retain seeded mock items for resilient dev preview
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING_ACCEPTANCE:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case BookingStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case BookingStatus.SCHEDULED:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case BookingStatus.IN_PROGRESS:
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case BookingStatus.COMPLETED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case BookingStatus.CANCELLED:
      case BookingStatus.REJECTED:
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case BookingStatus.DISPUTED:
        return 'bg-red-100 text-red-900 border-red-400 font-bold';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="flex flex-col w-full px-space-md py-space-sm space-y-space-md pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Marketplace & Bookings
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Monitor real-time customer demand orders, worker dispatches, and cooperative service delivery.
          </p>
        </div>
        <button
          onClick={() => {
            fetchLiveBookings();
            addToast('info', 'Refreshed', 'Marketplace demand orders updated.');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition text-sm self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Refresh Live Data
        </button>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-surface-container-high rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase text-secondary tracking-wider">Total Demands</span>
          <p className="text-2xl font-bold text-on-surface mt-1">{bookings.length}</p>
          <span className="text-xs text-on-surface-variant mt-0.5 block">Marketplace orders</span>
        </div>
        <div className="bg-surface border border-surface-container-high rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase text-amber-600 tracking-wider">Pending Acceptance</span>
          <p className="text-2xl font-bold text-on-surface mt-1">
            {bookings.filter((b) => b.status === BookingStatus.PENDING_ACCEPTANCE).length}
          </p>
          <span className="text-xs text-on-surface-variant mt-0.5 block">Dispatched to worker</span>
        </div>
        <div className="bg-surface border border-surface-container-high rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase text-blue-600 tracking-wider">Active / In Progress</span>
          <p className="text-2xl font-bold text-on-surface mt-1">
            {
              bookings.filter(
                (b) =>
                  b.status === BookingStatus.CONFIRMED ||
                  b.status === BookingStatus.SCHEDULED ||
                  b.status === BookingStatus.IN_PROGRESS,
              ).length
            }
          </p>
          <span className="text-xs text-on-surface-variant mt-0.5 block">Under service</span>
        </div>
        <div className="bg-surface border border-surface-container-high rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">Completed Jobs</span>
          <p className="text-2xl font-bold text-on-surface mt-1">
            {bookings.filter((b) => b.status === BookingStatus.COMPLETED).length}
          </p>
          <span className="text-xs text-on-surface-variant mt-0.5 block">Delivered successfully</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-surface-container-high rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by customer, worker, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'PENDING_ACCEPTANCE', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                filterStatus === st
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-surface border border-surface-container-high rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-on-surface">
            <thead className="bg-surface-container-low border-b border-surface-container-high text-xs uppercase font-semibold text-secondary">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Worker & Society</th>
                <th className="px-4 py-3">Scheduled Time</th>
                <th className="px-4 py-3">Est. Service Cost</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant text-sm">
                    No marketplace bookings match current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-lowest transition">
                    <td className="px-4 py-3 font-mono font-medium text-xs text-primary">{b.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-on-surface">{b.serviceTitle}</div>
                      <div className="text-xs text-on-surface-variant">{b.serviceCategory}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{b.customerName}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-on-surface">{b.workerName}</div>
                      <div className="text-xs text-on-surface-variant">{b.cooperativeName}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{b.scheduledTime}</td>
                    <td className="px-4 py-3 font-semibold text-on-surface">₹{b.estimatedCost}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadge(
                          b.status,
                        )}`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
