import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

let toastId = 0;
const toastListeners = new Set();
let toasts = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener([...toasts]));
}

export function showToast(type, message) {
  const id = `toast-${++toastId}`;
  toasts = [...toasts, { id, type, message }];
  notifyListeners();
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 4000);
}

export default function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState([]);
  
  useEffect(() => {
    toastListeners.add(setCurrentToasts);
    return () => {
      toastListeners.delete(setCurrentToasts);
    };
  }, []);
  
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };
  
  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-indigo-500'
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      <AnimatePresence>
        {currentToasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-lg ${colors[toast.type]}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => {
                  toasts = toasts.filter(t => t.id !== toast.id);
                  notifyListeners();
                }}
                className="ml-2 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}