import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Filter, ChevronDown, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useTenantData } from '../context/AppContext';
import { format } from 'date-fns';

export default function Bookings() {
  const { bookings, venues, rooms, tenants, isSuperAdmin, isTenantAdmin, user } = useTenantData();
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredBookings = bookings.filter(booking => {
    // Basic filters
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    if (!matchesStatus) return false;

    // Staff visibility filter
    if (!isSuperAdmin && !isTenantAdmin) {
      const bookingUserId = typeof booking.userId === 'object' ? booking.userId?._id : booking.userId;
      return bookingUserId === user?._id;
    }
    
    return true;
  }).sort((a, b) => {
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const statusIcons = {
    approved: CheckCircle,
    pending: AlertCircle,
    rejected: XCircle,
    cancelled: XCircle
  };

  const statusColors = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-rose-100 text-rose-700',
    cancelled: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 mt-1">Manage and view all reservations</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Filters:</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Booking Name</th>
                {isSuperAdmin && <th className="px-6 py-4">Organization</th>}
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Venue & Room</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Attendees</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="px-6 py-12 text-center text-slate-500">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No bookings found</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const venue = venues.find(v => v._id === booking.venueId) || booking.venueId;
                  const room = rooms.find(r => r._id === booking.roomId) || booking.roomId;
                  const tenant = tenants.find(t => t._id === booking.tenantId);
                  const Icon = statusIcons[booking.status];
                  
                  return (
                    <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                            {booking.userId?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{booking.userId?.name || 'Unknown User'}</p>
                            <p className="text-xs text-slate-500">{booking.userId?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {tenant?.name || 'Unknown Org'}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 truncate max-w-[150px]">{booking.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{venue?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{room?.name || 'Unknown'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <p>{format(new Date(booking.start), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(booking.start), 'h:mm a')} - {format(new Date(booking.end), 'h:mm a')}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {booking.attendees}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-slate-100 text-slate-700'}`}>
                          {Icon && <Icon className="w-3.5 h-3.5" />}
                          {booking.status ? (booking.status.charAt(0).toUpperCase() + booking.status.slice(1)) : 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
