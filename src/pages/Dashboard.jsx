import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, DoorOpen, Package, CalendarDays, Clock, 
  TrendingUp, Users, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useTenantData, useAuth } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, isWithinInterval } from 'date-fns';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, 
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const { venues, rooms, resources, bookings: allBookings, user } = useTenantData();
  const { tenant } = useAuth();

  const bookings = useMemo(() => {
    if (user?.role === 'staff') {
      return allBookings.filter(b => {
        const bookingUserId = typeof b.userId === 'object' ? b.userId?._id : b.userId;
        return bookingUserId === user?._id;
      });
    }
    return allBookings;
  }, [allBookings, user]);
  
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    
    const currentMonthBookings = bookings.filter(b => {
      if (!b.start) return false;
      const bookingDate = new Date(b.start);
      if (isNaN(bookingDate.getTime())) return false;
      return isWithinInterval(bookingDate, currentMonth);
    });
    
    return {
      totalVenues: venues.length,
      totalRooms: rooms.length,
      totalResources: resources.length,
      totalBookings: currentMonthBookings.length,
      pendingBookings: currentMonthBookings.filter(b => b.status === 'pending').length,
      approvedBookings: currentMonthBookings.filter(b => b.status === 'approved').length,
      rejectedBookings: currentMonthBookings.filter(b => b.status === 'rejected').length,
    };
  }, [venues, rooms, resources, bookings]);
  
  // Bookings by month chart data
  const bookingsByMonthData = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const count = bookings.filter(b => {
        if (!b.start) return false;
        const bookingDate = new Date(b.start);
        if (isNaN(bookingDate.getTime())) return false;
        return isWithinInterval(bookingDate, { start: monthStart, end: monthEnd });
      }).length;
      
      months.push({
        month: format(date, 'MMM'),
        count
      });
    }
    
    return months;
  }, [bookings]);
  
  const chartData = {
    bookingsByMonth: {
      labels: bookingsByMonthData.map(d => d.month),
      datasets: [{
        label: 'Bookings',
        data: bookingsByMonthData.map(d => d.count),
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }]
    },
    bookingStatus: {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{
        data: [stats.approvedBookings, stats.pendingBookings, stats.rejectedBookings],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0,
      }]
    },
    venueUsage: {
      labels: venues.map(v => v.name),
      datasets: [{
        label: 'Bookings',
        data: venues.map(v => bookings.filter(b => b.venueId === v._id).length),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 211, 238, 0.8)',
        ],
        borderRadius: 8,
      }]
    }
  };
  
  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [bookings]);
  
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return [...bookings]
      .filter(b => new Date(b.start) >= now && b.status === 'approved')
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  }, [bookings]);
  
  const statusColors = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-rose-100 text-rose-700',
    cancelled: 'bg-slate-100 text-slate-700'
  };
  
  const statusIcons = {
    approved: CheckCircle,
    pending: Clock,
    rejected: XCircle,
    cancelled: XCircle
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.name}! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-slate-500">Current Plan</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              tenant?.plan === 'premium' ? 'bg-amber-100 text-amber-700' :
              tenant?.plan === 'basic' ? 'bg-indigo-100 text-indigo-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {tenant?.plan ? (tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)) : 'Free'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Venues"
          value={stats.totalVenues}
          icon={Building2}
          color="indigo"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon={DoorOpen}
          color="emerald"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Resources"
          value={stats.totalResources}
          icon={Package}
          color="amber"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Bookings This Month"
          value={stats.totalBookings}
          icon={CalendarDays}
          color="purple"
          trend={{ value: 23, isPositive: true }}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Booking Trends</h3>
              <p className="text-sm text-slate-500">Monthly booking overview</p>
            </div>
            <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <Line 
            data={chartData.bookingsByMonth}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0,0,0,0.05)' },
                  ticks: { color: '#64748b' }
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#64748b' }
                }
              }
            }}
            height={250}
          />
        </motion.div>
        
        {/* Booking Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Booking Status</h3>
          <div className="flex items-center justify-center">
            <Doughnut 
              data={chartData.bookingStatus}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' }
                },
                cutout: '60%'
              }}
              height={200}
            />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Approved</span>
              </div>
              <span className="font-medium text-slate-900">{stats.approvedBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-slate-600">Pending</span>
              </div>
              <span className="font-medium text-slate-900">{stats.pendingBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-sm text-slate-600">Rejected</span>
              </div>
              <span className="font-medium text-slate-900">{stats.rejectedBookings}</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Upcoming Bookings</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming bookings</p>
              </div>
            ) : (
              upcomingBookings.map((booking) => {
                const venue = venues.find(v => v._id === booking.venueId);
                const room = rooms.find(r => r._id === booking.roomId);
                const StatusIcon = statusIcons[booking.status];
                
                return (
                  <div key={booking._id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{booking.title}</p>
                        <p className="text-sm text-slate-500">{venue?.name} • {room?.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {format(new Date(booking.start), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
        
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              recentBookings.map((booking) => {
                const venue = venues.find(v => v._id === booking.venueId);
                const StatusIcon = statusIcons[booking.status];
                
                return (
                  <div key={booking._id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        booking.status === 'approved' ? 'bg-emerald-100' :
                        booking.status === 'pending' ? 'bg-amber-100' : 'bg-rose-100'
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${
                          booking.status === 'approved' ? 'text-emerald-600' :
                          booking.status === 'pending' ? 'text-amber-600' : 'text-rose-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{booking.title}</p>
                        <p className="text-sm text-slate-500">{venue?.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {format(new Date(booking.createdAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Venue Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Venue Usage</h3>
            <p className="text-sm text-slate-500">Total bookings per venue</p>
          </div>
        </div>
        <Bar 
          data={chartData.venueUsage}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#64748b' }
              },
              x: {
                grid: { display: false },
                ticks: { color: '#64748b' }
              }
            }
          }}
          height={200}
        />
      </motion.div>
    </div>
  );
}