import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, CalendarDays, Building2, Users, Shield } from 'lucide-react';
import { useAuth } from '../context/AppContext';
import { showToast } from '../components/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(email, password);
    
    if (success) {
      showToast('success', 'Welcome back!');
      navigate('/dashboard');
    } else {
      showToast('error', 'Invalid email or password');
    }
    
    setIsLoading(false);
  };
  
  const demoAccounts = [
    { email: 'superadmin@venuescheduler.com', password: 'admin123', role: 'Super Admin', icon: Shield, color: 'from-rose-500 to-pink-600' },
    { email: 'admin@techcorp.com', password: 'admin123', role: 'Tenant Admin', icon: Building2, color: 'from-indigo-500 to-purple-600' },
    { email: 'staff@techcorp.com', password: 'staff123', role: 'Staff', icon: Users, color: 'from-emerald-500 to-teal-600' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">VenueFlow</h1>
              <p className="text-slate-400 text-sm">Scheduling Platform</p>
            </div>
          </div>
          
          {/* Welcome */}
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-slate-400 mb-8">Sign in to manage your venues and bookings</p>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50" />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </a>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          
          {/* Register Link */}
          <p className="mt-6 text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Register organization
            </Link>
            <span className="mx-2">or</span>
            <Link to="/register-staff" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign up as staff
            </Link>
          </p>
          
          {/* Demo Accounts */}
          <div className="mt-8 pt-8 border-t border-slate-700/50">
            <p className="text-sm text-slate-500 mb-4 text-center">Quick access with demo accounts:</p>
            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-xl transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center shadow-lg`}>
                    <account.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{account.role}</p>
                    <p className="text-xs text-slate-500">{account.email}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Streamline Your Venue Management
            </h2>
            <p className="text-xl text-white/80 max-w-lg mx-auto mb-12">
              The complete solution for scheduling venues, managing resources, and coordinating bookings across your organization.
            </p>
            
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold">100+</div>
                <div className="text-white/70 mt-1">Venues Managed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold">5k+</div>
                <div className="text-white/70 mt-1">Bookings/Month</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold">99%</div>
                <div className="text-white/70 mt-1">Uptime</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}