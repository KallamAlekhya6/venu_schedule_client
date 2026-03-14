import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Building2, Bell, Shield, CreditCard,
  Save, Camera
} from 'lucide-react';
import { useAuth, useTenantData } from '../context/AppContext';
import { showToast } from '../components/Toast';

export default function Settings() {
  const { user, tenant } = useAuth();
  const { dispatch } = useTenantData();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [notifications, setNotifications] = useState({
    emailBookingConfirmation: true,
    emailBookingReminder: true,
    emailNewBooking: true,
    pushBookingConfirmation: true,
    pushBookingReminder: false
  });
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];
  
  const handleSaveProfile = () => {
    showToast('success', 'Profile updated successfully');
  };
  
  const handleSaveNotifications = () => {
    showToast('success', 'Notification preferences saved');
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and preferences</p>
      </div>
      
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Profile Information</h3>
                
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {user?.name?.charAt(0)}
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors shadow-sm">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{user?.name}</h4>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 mt-2">
                      {user?.role?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
                
                {/* Form */}
                <div className="space-y-5 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {/* Organization Tab */}
            {activeTab === 'organization' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Organization Details</h3>
                
                {tenant ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                        {tenant?.name?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{tenant.name}</h4>
                        <p className="text-sm text-slate-500">Tenant ID: {tenant._id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 max-w-lg">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          value={tenant.name || ''}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="text"
                          value={tenant.email || 'N/A'}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={tenant.phone || 'N/A'}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Joined Date
                        </label>
                        <input
                          type="text"
                          value={new Date(tenant.createdAt).toLocaleDateString()}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                          disabled
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Address
                        </label>
                        <textarea
                          value={tenant.address || 'N/A'}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                          disabled
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <h4 className="font-medium text-indigo-900 mb-2">Plan Limits</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Max Venues:</span>
                          <span className="font-medium text-indigo-900">
                            {tenant.settings?.maxVenues === -1 ? 'Unlimited' : (tenant.settings?.maxVenues || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Max Rooms:</span>
                          <span className="font-medium text-indigo-900">
                            {tenant.settings?.maxRooms === -1 ? 'Unlimited' : (tenant.settings?.maxRooms || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Max Resources:</span>
                          <span className="font-medium text-indigo-900">
                            {tenant.settings?.maxResources === -1 ? 'Unlimited' : (tenant.settings?.maxResources || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-700">Monthly Bookings:</span>
                          <span className="font-medium text-indigo-900">
                            {tenant.settings?.maxBookingsPerMonth === -1 ? 'Unlimited' : (tenant.settings?.maxBookingsPerMonth || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No organization associated with your account</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'emailBookingConfirmation', label: 'Booking confirmations', desc: 'Receive email when your booking is confirmed' },
                        { key: 'emailBookingReminder', label: 'Booking reminders', desc: 'Get reminded 24 hours before your booking' },
                        { key: 'emailNewBooking', label: 'New booking requests', desc: 'Receive notifications for new booking requests (Admin)' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                          <div>
                            <p className="font-medium text-slate-900">{item.label}</p>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications[item.key]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSaveNotifications}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Security Settings</h3>
                
                <div className="space-y-6 max-w-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-4">Change Password</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Billing & Subscription</h3>
                
                {tenant && (
                  <div className="space-y-8">
                    <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-indigo-100 uppercase tracking-wider text-xs font-bold">Current Subscription</span>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-md border border-white/20">
                            {tenant.plan?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">
                            ${tenant.plan === 'premium' ? '149' : tenant.plan === 'basic' ? '49' : '20'}
                          </span>
                          <span className="text-indigo-200">/month</span>
                        </div>
                        <p className="mt-4 text-indigo-100 text-sm">
                          Your next billing date is {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-4">Available Plans</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { name: 'basic', price: 20, users: 10, rooms: 5, color: 'slate' },
                          { name: 'pro', price: 50, users: 50, rooms: 20, color: 'indigo' },
                          { name: 'enterprise', price: 100, users: 'Unlimited', rooms: 'Unlimited', color: 'purple' }
                        ].map((plan) => (
                          <div
                            key={plan.name}
                            className={`p-6 rounded-2xl border-2 transition-all ${
                              tenant.plan === plan.name 
                                ? 'border-indigo-500 bg-indigo-50 shadow-md ring-4 ring-indigo-500/10' 
                                : 'border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <h5 className="font-bold text-slate-900 uppercase tracking-tight">{plan.name}</h5>
                            <div className="mt-2 flex items-baseline gap-1">
                              <span className="text-3xl font-extrabold text-slate-900">${plan.price}</span>
                              <span className="text-slate-500 text-sm">/mo</span>
                            </div>
                            
                            <ul className="mt-6 space-y-4">
                              <li className="flex items-center gap-2 text-sm text-slate-600">
                                <User className="w-4 h-4 text-slate-400" />
                                {plan.users} Users
                              </li>
                              <li className="flex items-center gap-2 text-sm text-slate-600">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                {plan.rooms} Rooms
                              </li>
                            </ul>

                            <button
                              className={`w-full mt-8 py-2.5 rounded-xl font-semibold transition-all ${
                                tenant.plan === plan.name
                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                              disabled={tenant.plan === plan.name}
                            >
                              {tenant.plan === plan.name ? 'Active Plan' : 'Select Plan'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
