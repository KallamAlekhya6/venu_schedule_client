import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, DoorOpen, Package, CalendarDays,
  FileBarChart, Settings, Users, Crown, X, ChevronLeft, CalendarRange, Bell
} from 'lucide-react';
import { useAuth } from '../context/AppContext';

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { user, tenant } = useAuth();
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/bookings', icon: CalendarRange, label: 'Bookings' },
    { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { path: '/venues', icon: Building2, label: 'Venues' },
    { path: '/rooms', icon: DoorOpen, label: 'Rooms', isChild: true },
    { path: '/resources', icon: Package, label: 'Resources', isChild: true },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/reports', icon: FileBarChart, label: 'Reports' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];
  
  const adminItems = [
    { path: '/admin', icon: Crown, label: 'Super Admin', roles: ['super_admin'] },
  ];
  
  const filteredAdminItems = adminItems.filter(item => 
    user && item.roles.includes(user.role)
  );
  
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 
          border-r border-slate-700/50 z-50 transition-all duration-300
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="font-bold text-white text-lg">VenueFlow</h1>
                <p className="text-xs text-slate-400">Scheduling Platform</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Collapse button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${item.isChild ? 'ml-6 border-l-2 border-slate-700/50 rounded-l-none' : ''}
                  ${isActive 
                    ? `bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white ${item.isChild ? 'border-indigo-500' : 'border border-indigo-500/30'}`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
          
          {filteredAdminItems.length > 0 && (
            <div className="mt-8">
              {!isCollapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Administration
                </p>
              )}
              <nav className="space-y-1">
                {filteredAdminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
        
        {/* Tenant info */}
        {!isCollapsed && tenant && (
          <div className="p-4 border-t border-slate-700/50">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                  {tenant.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{tenant.name}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    tenant.plan === 'premium' ? 'bg-amber-500/20 text-amber-400' :
                    tenant.plan === 'basic' ? 'bg-indigo-500/20 text-indigo-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {tenant.plan ? (tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)) : 'Free'} Plan
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
