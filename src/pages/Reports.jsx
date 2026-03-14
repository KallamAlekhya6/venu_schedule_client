import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, CalendarDays, Users, Building2, Package, Download } from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { useTenantData } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, isWithinInterval, getDay } from 'date-fns';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, 
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

export default function Reports() {
  const { venues, rooms, resources, bookings } = useTenantData();
  
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    const lastMonth = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    
    const currentMonthBookings = bookings.filter(b => {
      const bookingDate = new Date(b.start);
      return isWithinInterval(bookingDate, currentMonth);
    });
    
    const lastMonthBookings = bookings.filter(b => {
      const bookingDate = new Date(b.start);
      return isWithinInterval(bookingDate, lastMonth);
    });
    
    const totalHours = currentMonthBookings.reduce((sum, b) => {
      const start = new Date(b.start);
      const end = new Date(b.end);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    
    const avgBookingSize = currentMonthBookings.length > 0 
      ? currentMonthBookings.reduce((sum, b) => sum + b.attendees, 0) / currentMonthBookings.length 
      : 0;
    
    return {
      totalBookings: currentMonthBookings.length,
      totalHours: Math.round(totalHours),
      avgBookingSize: Math.round(avgBookingSize),
      approvalRate: currentMonthBookings.length > 0 
        ? Math.round((currentMonthBookings.filter(b => b.status === 'approved').length / currentMonthBookings.length) * 100) 
        : 0,
      growthRate: lastMonthBookings.length > 0 
        ? Math.round(((currentMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length) * 100) 
        : 0
    };
  }, [bookings]);
  
  // Bookings by day of week
  const bookingsByDayData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    
    bookings.forEach(b => {
      const day = getDay(new Date(b.start));
      counts[day]++;
    });
    
    return {
      labels: days,
      datasets: [{
        label: 'Bookings',
        data: counts,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      }]
    };
  }, [bookings]);
  
  // Bookings by hour
  const bookingsByHourData = useMemo(() => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
    const counts = hours.map(() => 0);
    
    bookings.forEach(b => {
      const hour = new Date(b.start).getHours();
      if (hour >= 7 && hour <= 20) {
        counts[hour - 7]++;
      }
    });
    
    return {
      labels: hours.map(h => `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`),
      datasets: [{
        label: 'Bookings',
        data: counts,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  }, [bookings]);
  
  // Venue utilization
  const venueUtilizationData = useMemo(() => {
    return {
      labels: venues.map(v => v.name),
      datasets: [{
        label: 'Utilization %',
        data: venues.map(v => {
          const venueRooms = rooms.filter(r => r.venueId === v._id);
          const totalCapacity = venueRooms.reduce((sum, r) => sum + r.capacity, 0);
          const venueBookings = bookings.filter(b => b.venueId === v._id);
          const avgAttendees = venueBookings.length > 0 
            ? venueBookings.reduce((sum, b) => sum + b.attendees, 0) / venueBookings.length 
            : 0;
          return totalCapacity > 0 ? Math.min(Math.round((avgAttendees / totalCapacity) * 100), 100) : 0;
        }),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 211, 238, 0.8)',
        ],
        borderWidth: 0,
      }]
    };
  }, [venues, rooms, bookings]);
  
  // Resource usage
  const resourceUsageData = useMemo(() => {
    const resourceTypes = ['projector', 'sound_system', 'screen', 'microphone', 'whiteboard', 'computer'];
    const counts = resourceTypes.map(() => 0);
    
    resources.forEach(r => {
      const index = resourceTypes.indexOf(r.type);
      if (index !== -1) {
        counts[index] += r.quantity;
      }
    });
    
    return {
      labels: resourceTypes.map(t => t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
      datasets: [{
        label: 'Resources',
        data: counts,
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 0,
      }]
    };
  }, [resources]);
  
  // Room popularity
  const roomPopularity = useMemo(() => {
    return rooms.map(room => {
      const roomBookings = bookings.filter(b => b.roomId === room._id);
      const venue = venues.find(v => v._id === room.venueId);
      return {
        name: room.name,
        venue: venue?.name || 'Unknown',
        bookings: roomBookings.length,
        capacity: room.capacity
      };
    }).sort((a, b) => b.bookings - a.bookings).slice(0, 5);
  }, [rooms, bookings, venues]);
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Insights and statistics for your venues</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={CalendarDays}
          color="indigo"
          trend={{ value: Math.abs(stats.growthRate), isPositive: stats.growthRate >= 0 }}
        />
        <StatCard
          title="Hours Booked"
          value={`${stats.totalHours}h`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Avg. Attendance"
          value={stats.avgBookingSize}
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Approval Rate"
          value={`${stats.approvalRate}%`}
          icon={BarChart3}
          color="purple"
        />
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Bookings by Day of Week</h3>
          <Bar 
            data={bookingsByDayData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748b' } },
                x: { grid: { display: false }, ticks: { color: '#64748b' } }
              }
            }}
            height={250}
          />
        </motion.div>
        
        {/* Bookings by Hour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Peak Booking Hours</h3>
          <Line 
            data={bookingsByHourData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748b' } },
                x: { grid: { display: false }, ticks: { color: '#64748b', maxRotation: 45 } }
              }
            }}
            height={250}
          />
        </motion.div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Venue Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Venue Utilization</h3>
          <Doughnut 
            data={venueUtilizationData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
              cutout: '60%'
            }}
            height={200}
          />
        </motion.div>
        
        {/* Resource Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Resource Distribution</h3>
          <Pie 
            data={resourceUsageData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } }
            }}
            height={200}
          />
        </motion.div>
        
        {/* Top Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Most Popular Rooms</h3>
          <div className="space-y-4">
            {roomPopularity.map((room, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{room.name}</p>
                  <p className="text-xs text-slate-500">{room.venue}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{room.bookings}</p>
                  <p className="text-xs text-slate-500">bookings</p>
                </div>
              </div>
            ))}
            {roomPopularity.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No booking data yet
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}