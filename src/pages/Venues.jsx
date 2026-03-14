import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Building2, MapPin, DoorOpen, Edit, Trash2, CalendarDays } from 'lucide-react';
import { useTenantData, uuidv4 } from '../context/AppContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';

export default function Venues() {
  const { venues, rooms, tenant, isTenantAdmin, addVenue, updateVenue, deleteVenue } = useTenantData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: ''
  });
  
  const handleOpenModal = (venue) => {
    if (venue) {
      setEditingVenue(venue);
      setFormData({
        name: venue.name,
        description: venue.description,
        location: venue.location,
        address: venue.address
      });
    } else {
      setEditingVenue(null);
      setFormData({ name: '', description: '', location: '', address: '' });
    }
    setIsModalOpen(true);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!tenant) return;
    
    if (editingVenue) {
      updateVenue(editingVenue._id, formData).then(success => {
        if (success) showToast('success', 'Venue updated successfully');
      });
    } else {
      addVenue(formData).then(success => {
        if (success) showToast('success', 'Venue created successfully');
      });
    }
    
    setIsModalOpen(false);
  };
  
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this venue? All rooms in this venue will also be deleted.')) {
      deleteVenue(id).then(success => {
        if (success) showToast('success', 'Venue deleted successfully');
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Venues</h1>
          <p className="text-slate-500 mt-1">Manage your organization's venues and locations</p>
        </div>
        {isTenantAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Venue
          </button>
        )}
      </div>
      
      {/* Venues Grid */}
      {venues.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No venues yet"
          description="Create your first venue to start managing rooms and bookings"
          action={isTenantAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Venue
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue, index) => {
            const venueRooms = rooms.filter(r => r.venueId === venue._id);
            const totalCapacity = venueRooms.reduce((sum, r) => sum + r.capacity, 0);
            
            return (
              <motion.div
                key={venue._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{venue.name}</h3>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">{venue.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span>{venue.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <DoorOpen className="w-4 h-4" />
                      <span>{venueRooms.length} rooms - {totalCapacity} total capacity</span>
                    </div>
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
                          onClick={() => handleOpenModal(venue)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(venue._id)}
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
            );
          })}
        </div>
      )}
      
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVenue ? 'Edit Venue' : 'Create New Venue'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Venue Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="e.g., Main Office Building"
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
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              placeholder="Brief description of the venue..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g., Downtown"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Street, City, State"
              />
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
              {editingVenue ? 'Update Venue' : 'Create Venue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
