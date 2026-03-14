import { motion } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, Check } from 'lucide-react';
import { useTenantData } from '../context/AppContext';

export default function Notifications() {
  const { notifications, dispatch } = useTenantData();

  const handleMarkAsRead = (id) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-500" />
            Notifications
          </h1>
          <p className="text-slate-500 mt-1">Stay updated with your latest venue activities</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <Bell className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-700">All caught up!</p>
            <p className="text-sm mt-1">You have no new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 flex gap-4 transition-colors ${!notif.read ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {notif.title}
                  </h4>
                  <p className={`text-sm mt-1 ${!notif.read ? 'text-slate-600' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="flex-shrink-0 self-center p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors tooltip-trigger"
                    title="Mark as read"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
