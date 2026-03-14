import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import { useTenantData, uuidv4 } from '../context/AppContext';
import Modal from '../components/Modal';
import { showToast } from '../components/Toast';
import { format } from 'date-fns';

export default function Calendar() {
  const { bookings, venues, rooms, user, tenant, dispatch, isTenantAdmin, isSuperAdmin, addBooking, updateBookingStatus } = useTenantData();
  const calendarRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterVenue, setFilterVenue] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venueId: '',
    roomId: '',
    start: '',
    end: '',
    attendees: '1',
    isRecurring: false,
    recurringFrequency: 'weekly',
    recurringInterval: '1',
    recurringEndDate: ''
  });
  
  const filteredBookings = bookings.filter(b => {
    if (filterVenue !== 'all' && b.venueId !== filterVenue) return false;
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    return true;
  });
  
  const calendarEvents = filteredBookings.map(booking => {
    const room = rooms.find(r => r._id === booking.roomId);
    
    // Check ownership and permissions
    const bookingUserId = typeof booking.userId === 'object' ? booking.userId?._id : booking.userId;
    const isOwner = bookingUserId === user?._id;
    const canSeeDetails = isSuperAdmin || isTenantAdmin || isOwner;

    const statusColors = {
      approved: { bg: '#10b981', border: '#059669' },
      pending: { bg: '#f59e0b', border: '#d97706' },
      rejected: { bg: '#ef4444', border: '#dc2626' },
      cancelled: { bg: '#64748b', border: '#475569' }
    };
    const colors = statusColors[booking.status] || statusColors.pending;
    
    return {
      id: booking._id,
      title: canSeeDetails ? booking.title : 'Busy (Private Slot)',
      start: booking.start,
      end: booking.end,
      backgroundColor: canSeeDetails ? colors.bg : '#94a3b8', // Gray for private
      borderColor: canSeeDetails ? colors.border : '#64748b',
      extendedProps: {
        ...booking,
        roomName: room?.name,
        isPrivate: !canSeeDetails
      }
    };
  });
  
  const handleDateSelect = (selectInfo) => {
    if (!tenant && !isSuperAdmin) return;
    
    setFormData({
      ...formData,
      start: selectInfo.startStr.slice(0, 16),
      end: selectInfo.endStr.slice(0, 16)
    });
    setSelectedBooking(null);
    setIsModalOpen(true);
  };
  
  const handleEventClick = (clickInfo) => {
    const booking = bookings.find(b => b._id === clickInfo.event.id);
    if (booking) {
      // Check permission
      const bookingUserId = typeof booking.userId === 'object' ? booking.userId?._id : booking.userId;
      const isOwner = bookingUserId === user?._id;
      const canSeeDetails = isSuperAdmin || isTenantAdmin || isOwner;

      if (!canSeeDetails) {
        showToast('info', 'This is a private reservation. Details are hidden.');
        return;
      }

      setSelectedBooking(booking);
      setFormData({
        title: booking.title,
        description: booking.description,
        venueId: booking.venueId,
        roomId: booking.roomId,
        start: booking.start.slice(0, 16),
        end: booking.end.slice(0, 16),
        attendees: booking.attendees.toString(),
        isRecurring: booking.isRecurring,
        recurringFrequency: booking.recurringPattern?.frequency || 'weekly',
        recurringInterval: booking.recurringPattern?.interval.toString() || '1',
        recurringEndDate: booking.recurringPattern?.endDate || ''
      });
      setIsModalOpen(true);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!tenant || !user) return;

    // Capacity Check for Staff
    const selectedRoom = rooms.find(r => r._id === formData.roomId);
    if (user.role === 'staff' && selectedRoom && parseInt(formData.attendees) > selectedRoom.capacity) {
        setShowCapacityWarning(true);
        return;
    }
    
    submitBooking();
  };

  const submitBooking = () => {
    
    // Check for conflicts
    const newStart = new Date(formData.start);
    const newEnd = new Date(formData.end);
    
    const conflicts = bookings.filter(b => 
      b.roomId === formData.roomId && 
      b.status !== 'rejected' && 
      b.status !== 'cancelled' &&
      b._id !== selectedBooking?._id &&
      ((newStart >= new Date(b.start) && newStart < new Date(b.end)) ||
       (newEnd > new Date(b.start) && newEnd <= new Date(b.end)) ||
       (newStart <= new Date(b.start) && newEnd >= new Date(b.end)))
    );
    
    if (conflicts.length > 0) {
      showToast('error', 'This time slot conflicts with an existing booking');
      return;
    }
    
    if (selectedBooking) {
      updateBooking(selectedBooking._id, {
          title: formData.title,
          description: formData.description,
          venueId: formData.venueId,
          roomId: formData.roomId,
          start: formData.start,
          end: formData.end,
          attendees: parseInt(formData.attendees)
      }).then(success => {
          if (success) showToast('success', 'Booking updated successfully');
      });
    } else {
      addBooking({
          title: formData.title,
          description: formData.description,
          venueId: formData.venueId,
          roomId: formData.roomId,
          start: formData.start,
          end: formData.end,
          attendees: parseInt(formData.attendees)
      }).then(success => {
          if (success) showToast('success', isTenantAdmin ? 'Booking created successfully' : 'Booking request submitted for approval');
      });
    }
    
    setIsModalOpen(false);
  };
  
  const handleStatusChange = (status) => {
    if (!selectedBooking || !isTenantAdmin) return;
    
    updateBookingStatus(selectedBooking._id, status).then(success => {
        if (success) showToast('success', `Booking ${status}`);
    });
    setIsModalOpen(false);
  };

  const handleDeleteBooking = () => {
    if (!selectedBooking || !isTenantAdmin) return;
    
    if (confirm('Are you sure you want to delete this booking?')) {
      deleteBooking(selectedBooking._id).then(success => {
          if (success) showToast('success', 'Booking deleted successfully');
      });
      setIsModalOpen(false);
    }
  };
  
  const handleDelete = () => {
    if (!selectedBooking) return;
    
    if (confirm('Are you sure you want to delete this booking?')) {
      deleteBooking(selectedBooking._id).then(success => {
          if (success) showToast('success', 'Booking deleted successfully');
      });
      setIsModalOpen(false);
    }
  };
  
  const availableRooms = formData.venueId 
    ? rooms.filter(r => r.venueId === formData.venueId)
    : [];
  
  const statusConfig = {
    approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700', icon: XCircle },
    cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-700', icon: XCircle }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-500 mt-1">View and manage all your bookings</p>
        </div>
        <button
          onClick={() => {
            setSelectedBooking(null);
            setFormData({
              title: '', description: '', venueId: '', roomId: '',
              start: '', end: '', attendees: '1',
              isRecurring: false, recurringFrequency: 'weekly',
              recurringInterval: '1', recurringEndDate: ''
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
        >
          <Plus className="w-5 h-5" />
          New Booking
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Filters:</span>
        </div>
        <select
          value={filterVenue}
          onChange={(e) => setFilterVenue(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          <option value="all">All Venues</option>
          {venues.map(venue => (
            <option key={venue._id} value={venue._id}>{venue.name}</option>
          ))}
        </select>
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
      
      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={calendarEvents}
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          nowIndicator={true}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          eventClassNames="cursor-pointer"
        />
      </motion.div>
      
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBooking ? 'Booking Details' : 'Create New Booking'}
        size="lg"
      >
        {selectedBooking && (
          <div className="mb-4 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[selectedBooking.status].color}`}>
              {(() => {
                const Icon = statusConfig[selectedBooking.status].icon;
                return <Icon className="w-4 h-4" />;
              })()}
              {statusConfig[selectedBooking.status].label}
            </span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="Meeting title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              placeholder="Meeting description..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Venue *
              </label>
              <select
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value, roomId: '' })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              >
                <option value="">Select venue</option>
                {venues.map(venue => (
                  <option key={venue._id} value={venue._id}>{venue.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Room *
              </label>
              <select
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
                disabled={!formData.venueId}
              >
                <option value="">Select room</option>
                {availableRooms.map(room => (
                  <option key={room._id} value={room._id}>{room.name} (Capacity: {room.capacity})</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of Attendees
            </label>
            <input
              type="number"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              min="1"
            />
          </div>
          
          {/* Recurring Booking Options */}
          {tenant?.settings?.allowRecurring && (
            <div className="p-4 bg-slate-50 rounded-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-slate-700">Recurring Booking</span>
            </label>
            
            {formData.isRecurring && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <select
                  value={formData.recurringFrequency}
                  onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <input
                  type="number"
                  value={formData.recurringInterval}
                  onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
                  placeholder="Interval"
                  min="1"
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <input
                  type="date"
                  value={formData.recurringEndDate}
                  onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                  placeholder="End Date"
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            )}
          </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {selectedBooking && (
              <div className="flex items-center gap-2">
                {isTenantAdmin && selectedBooking.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('approved')}
                      className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('rejected')}
                      className="px-4 py-2 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
              >
                {selectedBooking ? 'Update Booking' : 'Create Booking'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Capacity Warning Modal */}
      <Modal 
        isOpen={showCapacityWarning} 
        onClose={() => setShowCapacityWarning(false)}
        title="Capacity Warning"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl flex items-start gap-3 border border-amber-200">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Room Capacity Exceeded</p>
              <p className="text-sm text-amber-700 mt-1">
                The room "{rooms.find(r => r._id === formData.roomId)?.name}" has a capacity of {rooms.find(r => r._id === formData.roomId)?.capacity} people. 
                You have {formData.attendees} attendees.
              </p>
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            This room might be too small for your group. We recommend booking a larger room instead. 
            Would you like to proceed with this booking or go back and choose another room?
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => setShowCapacityWarning(false)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Choose Another Room
            </button>
            <button
              onClick={() => {
                setShowCapacityWarning(false);
                submitBooking();
              }}
              className="w-full px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Proceed Anyway
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
