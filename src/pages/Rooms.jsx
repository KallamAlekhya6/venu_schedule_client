import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, DoorOpen, Users, Edit, Trash2, X, CalendarDays } from 'lucide-react';
import { useTenantData, uuidv4 } from '../context/AppContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';

export default function Rooms() {
  const { rooms, venues, tenant, isTenantAdmin, addRoom, updateRoom, deleteRoom } = useTenantData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    venueId: '',
    capacity: '',
    floor: '',
    facilities: [],
    newFacility: ''
  });
  
  const filteredRooms = selectedVenue === 'all' 
    ? rooms 
    : rooms.filter(r => r.venueId === selectedVenue);
  
  const handleOpenModal = (room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        venueId: room.venueId,
        capacity: room.capacity.toString(),
        floor: room.floor,
        facilities: [...room.facilities],
        newFacility: ''
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        venueId: venues[0]?._id || '',
        capacity: '',
        floor: '',
        facilities: [],
        newFacility: ''
      });
    }
    setIsModalOpen(true);
  };
  
  const handleAddFacility = () => {
    if (formData.newFacility.trim()) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, formData.newFacility.trim()],
        newFacility: ''
      });
    }
  };
  
  const handleRemoveFacility = (index) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((_, i) => i !== index)
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!tenant) return;
    
    if (editingRoom) {
      updateRoom(editingRoom._id, {
          name: formData.name,
          venueId: formData.venueId,
          capacity: parseInt(formData.capacity),
          floor: formData.floor,
          facilities: formData.facilities
      }).then(success => {
        if (success) showToast('success', 'Room updated successfully');
      });
    } else {
      addRoom({
          name: formData.name,
          venueId: formData.venueId,
          capacity: parseInt(formData.capacity),
          floor: formData.floor,
          facilities: formData.facilities
      }).then(success => {
        if (success) showToast('success', 'Room created successfully');
      });
    }
    
    setIsModalOpen(false);
  };
  
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this room?')) {
      deleteRoom(id).then(success => {
          if (success) showToast('success', 'Room deleted successfully');
      });
    }
  };
  
  const getVenueName = (venueId) => {
    return venues.find(v => v._id === venueId)?.name || 'Unknown Venue';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rooms</h1>
          <p className="text-slate-500 mt-1">Manage rooms across all your venues</p>
        </div>
        {isTenantAdmin && venues.length > 0 && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Room
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={selectedVenue}
          onChange={(e) => setSelectedVenue(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          <option value="all">All Venues</option>
          {venues.map(venue => (
            <option key={venue._id} value={venue._id}>{venue.name}</option>
          ))}
        </select>
        
        <span className="text-sm text-slate-500">
          {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No rooms yet"
          description={venues.length === 0 ? "Create a venue first before adding rooms" : "Add rooms to your venues to start booking"}
          action={isTenantAdmin && venues.length > 0 && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Room
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Header */}
              <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 relative p-5">
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                  {room.floor}
                </div>
                <div className="absolute bottom-3 left-5">
                  <h3 className="text-lg font-bold text-white">{room.name}</h3>
                  <p className="text-emerald-100 text-sm">{getVenueName(room.venueId)}</p>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{room.capacity} people</span>
                  </div>
                </div>
                
                {/* Facilities */}
                <div className="flex flex-wrap gap-2">
                  {room.facilities.slice(0, 4).map((facility, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg"
                    >
                      {facility}
                    </span>
                  ))}
                  {room.facilities.length > 4 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">
                      +{room.facilities.length - 4} more
                    </span>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Link
                    to="/calendar"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Book Now
                  </Link>
                  {isTenantAdmin && (
                    <>
                      <button
                        onClick={() => handleOpenModal(room)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? 'Edit Room' : 'Create New Room'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Room Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g., Conference Room A"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Venue *
              </label>
              <select
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              >
                <option value="">Select a venue</option>
                {venues.map(venue => (
                  <option key={venue._id} value={venue._id}>{venue.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Capacity *
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g., 20"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Floor
              </label>
              <input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g., 3rd Floor"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Facilities
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={formData.newFacility}
                onChange={(e) => setFormData({ ...formData, newFacility: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFacility())}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Add a facility (e.g., Projector)"
              />
              <button
                type="button"
                onClick={handleAddFacility}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.facilities.map((facility, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm rounded-lg"
                >
                  {facility}
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(i)}
                    className="hover:text-indigo-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4">
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
              {editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
