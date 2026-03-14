import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, Lock, User, Building2, ArrowRight, CalendarDays,
  Check, Zap, Star, Crown
} from 'lucide-react';
import { useAuth } from '../context/AppContext';
import { showToast } from '../components/Toast';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    organizationName: '',
    adminName: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'basic'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { registerTenant } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    registerTenant({
      organizationName: formData.organizationName,
      adminName: formData.adminName,
      email: formData.email,
      password: formData.password,
      plan: formData.plan
    }).then((success) => {
      if (success) {
        showToast('success', 'Organization created successfully!');
        navigate('/dashboard');
      } else {
        showToast('error', 'Email already exists');
      }
    });
    
    setIsLoading(false);
  };
  
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Perfect for small teams getting started',
      features: ['2 Venues', '5 Rooms', '10 Resources', '20 Bookings/month', 'Basic Calendar'],
      icon: Zap,
      color: 'from-slate-500 to-slate-600'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 49,
      description: 'Great for growing organizations',
      features: ['10 Venues', '25 Rooms', '50 Resources', '100 Bookings/month', 'Recurring Bookings', 'Reports & Analytics'],
      icon: Star,
      color: 'from-indigo-500 to-purple-600',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 149,
      description: 'For large organizations with advanced needs',
      features: ['Unlimited Venues', 'Unlimited Rooms', 'Unlimited Resources', 'Unlimited Bookings', 'Priority Support', 'API Access', 'Custom Branding'],
      icon: Crown,
      color: 'from-amber-500 to-orange-600'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">VenueFlow</h1>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                step >= s 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-20 h-1 mx-2 rounded transition-all ${
                  step > s ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-800'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Organization Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">Organization Details</h2>
                <p className="text-slate-400 mb-6">Tell us about your organization</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                       Organization Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        placeholder="Acme Corporation"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Administrator Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.adminName}
                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        placeholder="John Smith"
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step 2: Account Info */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">Account Details</h2>
                <p className="text-slate-400 mb-6">Create your admin account</p>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        placeholder="admin@company.com"
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
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step 3: Plan Selection */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
                <p className="text-slate-400 mb-6">Select a subscription plan for your organization</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, plan: plan.id })}
                      className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                        formData.plan === plan.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-full">
                          Popular
                        </span>
                      )}
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                        <plan.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-bold text-white">${plan.price}</span>
                        <span className="text-slate-400 text-sm">/month</span>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {plan.features.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                            <Check className="w-4 h-4 text-emerald-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <Link to="/login" className="px-6 py-3 text-slate-400 hover:text-white transition-colors">
                  ← Login
                </Link>
              )}
              
              {step === 1 && (
                <Link to="/register-staff" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Are you a staff member? Signup here
                </Link>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : step === 3 ? (
                  <>
                    Create Organization
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
