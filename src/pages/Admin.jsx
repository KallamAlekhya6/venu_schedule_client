import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, Building2, Users, CreditCard, TrendingUp, 
  Trash2, CheckCircle, AlertCircle
} from 'lucide-react';
import { useApp, useAuth, PLAN_LIMITS, PLAN_PRICES } from '../context/AppContext';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import { showToast } from '../components/Toast';
import { format } from 'date-fns';

export default function Admin() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');
  
  // Only super admin can access
  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  const stats = {
    totalTenants: state.tenants.length,
    totalUsers: state.users.length,
    totalVenues: state.venues.length,
    totalBookings: state.bookings.length,
  };
  
  const planStats = {
    free: state.tenants.filter(t => t.plan === 'free').length,
    basic: state.tenants.filter(t => t.plan === 'basic').length,
    premium: state.tenants.filter(t => t.plan === 'premium').length,
  };
  
  const handlePlanChange = (tenant) => {
    setSelectedTenant(tenant);
    setSelectedPlan(tenant.plan);
    setIsPlanModalOpen(true);
  };
  
  const confirmPlanChange = () => {
    if (!selectedTenant) return;
    
    dispatch({
      type: 'UPDATE_TENANT',
      payload: {
        ...selectedTenant,
        plan: selectedPlan,
        settings: PLAN_LIMITS[selectedPlan]
      }
    });
    
    showToast('success', `Plan updated to ${selectedPlan}`);
    setIsPlanModalOpen(false);
  };
  
  const handleDeleteTenant = (tenant) => {
    if (confirm(`Are you sure you want to delete ${tenant.name}? This will delete all associated data.`)) {
      // Delete all associated data
      state.venues.filter(v => v.tenantId === tenant._id).forEach(v => {
        dispatch({ type: 'DELETE_VENUE', payload: v._id });
      });
      state.rooms.filter(r => r.tenantId === tenant._id).forEach(r => {
        dispatch({ type: 'DELETE_ROOM', payload: r._id });
      });
      state.resources.filter(r => r.tenantId === tenant._id).forEach(r => {
        dispatch({ type: 'DELETE_RESOURCE', payload: r._id });
      });
      state.bookings.filter(b => b.tenantId === tenant._id).forEach(b => {
        dispatch({ type: 'DELETE_BOOKING', payload: b._id });
      });
      state.users.filter(u => u.tenantId === tenant._id).forEach(u => {
        dispatch({ type: 'DELETE_USER', payload: u._id });
      });
      
      dispatch({ type: 'DELETE_TENANT', payload: tenant._id });
      showToast('success', 'Tenant deleted successfully');
    }
  };
  
  const getTenantStats = (tenantId) => {
    return {
      venues: state.venues.filter(v => v.tenantId === tenantId).length,
      rooms: state.rooms.filter(r => r.tenantId === tenantId).length,
      users: state.users.filter(u => u.tenantId === tenantId).length,
      bookings: state.bookings.filter(b => b.tenantId === tenantId).length,
    };
  };
  
  const planColors = {
    free: 'bg-slate-100 text-slate-700',
    basic: 'bg-indigo-100 text-indigo-700',
    premium: 'bg-amber-100 text-amber-700'
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 mt-1">Manage all tenants and subscriptions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-medium">
          <Crown className="w-5 h-5" />
          Super Admin
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tenants"
          value={stats.totalTenants}
          icon={Building2}
          color="indigo"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Total Venues"
          value={stats.totalVenues}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={TrendingUp}
          color="amber"
        />
      </div>
      
      {/* Subscription Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Subscription Overview</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Free Plan</span>
              <span className="text-2xl font-bold text-slate-900">{planStats.free}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-500 rounded-full"
                style={{ width: `${stats.totalTenants > 0 ? (planStats.free / stats.totalTenants) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-600">Basic Plan</span>
              <span className="text-2xl font-bold text-indigo-900">{planStats.basic}</span>
            </div>
            <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${stats.totalTenants > 0 ? (planStats.basic / stats.totalTenants) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-600">Premium Plan</span>
              <span className="text-2xl font-bold text-amber-900">{planStats.premium}</span>
            </div>
            <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${stats.totalTenants > 0 ? (planStats.premium / stats.totalTenants) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Tenants Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">All Tenants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Organization</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Venues</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.tenants.map((tenant) => {
                const tenantStats = getTenantStats(tenant._id);
                const admin = state.users.find(u => u._id === tenant.adminId);
                
                return (
                  <tr key={tenant._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{tenant.name}</p>
                          <p className="text-xs text-slate-500">{admin?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${planColors[tenant.plan]}`}>
                        {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tenantStats.users}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tenantStats.venues}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tenantStats.bookings}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(new Date(tenant.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePlanChange(tenant)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Change Plan"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(tenant)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Tenant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* Plan Change Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Change Subscription Plan"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Select a new plan for <span className="font-semibold">{selectedTenant?.name}</span>
          </p>
          
          <div className="space-y-3">
            {['free', 'basic', 'premium'].map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedPlan === plan
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 capitalize">{plan}</p>
                    <p className="text-sm text-slate-500">
                      ${PLAN_PRICES[plan].monthly}/month
                    </p>
                  </div>
                  {selectedPlan === plan && (
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsPlanModalOpen(false)}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmPlanChange}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              Update Plan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
