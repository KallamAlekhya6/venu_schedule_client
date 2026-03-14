import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Package, Monitor, Mic, Presentation, PenTool, Computer, Edit, Trash2, CheckCircle, Wrench, CalendarDays } from 'lucide-react';
import { useTenantData, uuidv4 } from '../context/AppContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { showToast } from '../components/Toast';

const resourceTypeConfig = {
  projector: { label: 'Projector', icon: Monitor, color: 'from-blue-500 to-indigo-600' },
  sound_system: { label: 'Sound System', icon: Mic, color: 'from-purple-500 to-pink-600' },
  screen: { label: 'Screen', icon: Presentation, color: 'from-emerald-500 to-teal-600' },
  microphone: { label: 'Microphone', icon: Mic, color: 'from-amber-500 to-orange-600' },
  whiteboard: { label: 'Whiteboard', icon: PenTool, color: 'from-cyan-500 to-blue-600' },
  computer: { label: 'Computer', icon: Computer, color: 'from-rose-500 to-pink-600' },
  chairs: { label: 'Chairs', icon: Package, color: 'from-slate-500 to-slate-600' },
  other: { label: 'Other', icon: Package, color: 'from-slate-500 to-slate-600' }
};

export default function Resources() {
  const { resources, rooms, venues, tenant, isTenantAdmin, addResource, updateResource, deleteResource } = useTenantData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'projector',
    description: '',
    roomId: '',
    status: 'available',
    quantity: '1'
  });
  
  const filteredResources = resources.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });
  
  const handleOpenModal = (resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        name: resource.name,
        type: resource.type,
        description: resource.description,
        roomId: resource.roomId || '',
        status: resource.status,
        quantity: resource.quantity.toString()
      });
    } else {
      setEditingResource(null);
      setFormData({
        name: '',
        type: 'projector',
        description: '',
        roomId: '',
        status: 'available',
        quantity: '1'
      });
    }
    setIsModalOpen(true);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!tenant) return;
    
    if (editingResource) {
      updateResource(editingResource._id, {
          name: formData.name,
          type: formData.type,
          description: formData.description,
          roomId: formData.roomId || null,
          status: formData.status,
          quantity: parseInt(formData.quantity)
      }).then(success => {
          if (success) showToast('success', 'Resource updated successfully');
      });
    } else {
      addResource({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          roomId: formData.roomId || null,
          status: formData.status,
          quantity: parseInt(formData.quantity)
      }).then(success => {
          if (success) showToast('success', 'Resource created successfully');
      });
    }
    
    setIsModalOpen(false);
  };
  
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      deleteResource(id).then(success => {
          if (success) showToast('success', 'Resource deleted successfully');
      });
    }
  };
  
  const getRoomName = (roomId) => {
    if (!roomId) return 'Unassigned';
    const room = rooms.find(r => r._id === roomId);
    if (!room) return 'Unknown Room';
    const venue = venues.find(v => v._id === room.venueId);
    return venue ? `${room.name} (${venue.name})` : room.name;
  };
  
  const statusConfig = {
    available: { label: 'Available', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    in_use: { label: 'In Use', color: 'bg-amber-100 text-amber-700', icon: Mic },
    maintenance: { label: 'Maintenance', color: 'bg-rose-100 text-rose-700', icon: Wrench }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resources</h1>
          <p className="text-slate-500 mt-1">Manage equipment and resources across your venues</p>
        </div>
        {isTenantAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          <option value="all">All Types</option>
          {Object.entries(resourceTypeConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="maintenance">Maintenance</option>
        </select>
        
        <span className="text-sm text-slate-500">
          {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Resources Grid */}
      {resources.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No resources yet"
          description="Add resources like projectors, screens, and sound systems to manage your equipment"
          action={isTenantAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Resource
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredResources.map((resource, index) => {
            const typeConfig = resourceTypeConfig[resource.type];
            const statusConf = statusConfig[resource.status];
            const TypeIcon = typeConfig.icon;
            
            return (
              <motion.div
                key={resource._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Header */}
                <div className={`h-20 bg-gradient-to-r ${typeConfig.color} relative p-4 flex items-center justify-center`}>
                  <TypeIcon className="w-10 h-10 text-white/90" />
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 truncate">{resource.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}>
                      {statusConf.label}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{resource.description || 'No description'}</p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Qty: {resource.quantity}</span>
                    <span className="truncate max-w-[120px]">{getRoomName(resource.roomId)}</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                    <Link
                      to="/calendar"
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium border border-indigo-100"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      Book
                    </Link>
                    {isTenantAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenModal(resource)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(resource._id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        title={editingResource ? 'Edit Resource' : 'Create New Resource'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resource Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="e.g., Epson Projector Pro"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                {Object.entries(resourceTypeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                min="1"
                required
              />
            </div>
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
              placeholder="Brief description..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assign to Room
              </label>
              <select
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="">Unassigned</option>
                {rooms.map(room => {
                  const venue = venues.find(v => v._id === room.venueId);
                  return (
                    <option key={room._id} value={room._id}>
                      {room.name} {venue ? `(${venue.name})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
              </select>
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
              {editingResource ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
