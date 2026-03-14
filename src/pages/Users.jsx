import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Plus, Mail, Shield, Search, Building2, X, Lock, CheckCircle, XCircle } from 'lucide-react';
import { useTenantData } from '../context/AppContext';
import { showToast } from '../components/Toast';
import Modal from '../components/Modal';

export default function Users() {
  const { users, isTenantAdmin, isSuperAdmin, user, tenants, addUser, updateUserStatus, deleteUser } = useTenantData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    tenantId: ''
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (userId, status) => {
    const success = await updateUserStatus(userId, status);
    if (success) {
      showToast('success', `User ${status === 'active' ? 'approved' : 'updated'} successfully`);
    } else {
      showToast('error', 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const success = await deleteUser(userId);
      if (success) {
        showToast('success', 'User removed successfully');
      } else {
        showToast('error', 'Failed to remove user');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await addUser(formData);
    if (success) {
      showToast('success', 'User created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'staff', tenantId: '' });
    } else {
      showToast('error', 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-indigo-500" />
            Users
          </h1>
          <p className="text-slate-500 mt-1">Manage external and internal members</p>
        </div>
        {(isTenantAdmin || isSuperAdmin) && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="pending">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Name</th>
              {isSuperAdmin && <th className="px-6 py-4">Organization</th>}
              <th className="px-6 py-4">Role & Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              const userTenant = tenants.find(t => t._id === u.tenantId);
              return (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{u.name || 'Unknown User'}{u._id === user?._id ? ' (You)' : ''}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{u.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4">
                      {userTenant ? (
                        <span className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {userTenant.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">System</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 w-fit">
                        <Shield className="w-3.5 h-3.5" />
                        {u.role?.split('_').map(w => (w?.charAt(0)?.toUpperCase() || '') + (w?.slice(1) || '')).join(' ')}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        u.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {u.status?.charAt(0).toUpperCase() + u.status?.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(u._id, 'active')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve User"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      {u._id !== user?._id && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={isSuperAdmin ? 4 : 3} className="px-6 py-12 text-center text-slate-500">
                  <p>No users found matching your criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Add New User</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="staff">Staff</option>
                      {isSuperAdmin && <option value="tenant_admin">Tenant Admin</option>}
                      {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                    </select>
                  </div>

                  {isSuperAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
                      <select
                        value={formData.tenantId}
                        onChange={e => setFormData({ ...formData, tenantId: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        <option value="">System (No Org)</option>
                        {tenants.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
