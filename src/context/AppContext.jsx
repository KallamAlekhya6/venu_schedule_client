import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import api from '../utils/api';

// Simple constants
const PLAN_LIMITS = {
  free: {
    maxVenues: 2,
    maxRooms: 5,
    maxResources: 10,
    maxBookingsPerMonth: 20,
    features: ['basic_calendar', 'email_notifications']
  },
  basic: {
    maxVenues: 10,
    maxRooms: 25,
    maxResources: 50,
    maxBookingsPerMonth: 100,
    features: ['basic_calendar', 'email_notifications', 'recurring_bookings', 'reports']
  },
  premium: {
    maxVenues: -1,
    maxRooms: -1,
    maxResources: -1,
    maxBookingsPerMonth: -1,
    features: ['basic_calendar', 'email_notifications', 'recurring_bookings', 'reports', 'priority_support', 'api_access', 'custom_branding']
  }
};

const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  basic: { monthly: 49, yearly: 470 },
  premium: { monthly: 149, yearly: 1430 }
};

// Initial mock data
const createMockData = () => {
  const superAdminId = uuidv4();
  const tenant1Id = uuidv4();
  const tenant2Id = uuidv4();
  const tenantAdmin1Id = uuidv4();
  const tenantAdmin2Id = uuidv4();
  const staff1Id = uuidv4();
  const staff2Id = uuidv4();
  
  const venue1Id = uuidv4();
  const venue2Id = uuidv4();
  const room1Id = uuidv4();
  const room2Id = uuidv4();
  const room3Id = uuidv4();
  
  const users = [
    {
      id: superAdminId,
      email: 'superadmin@venuescheduler.com',
      password: 'admin123',
      name: 'Super Admin',
      role: 'super_admin',
      tenantId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: tenantAdmin1Id,
      email: 'admin@techcorp.com',
      password: 'admin123',
      name: 'John Smith',
      role: 'tenant_admin',
      tenantId: tenant1Id,
      createdAt: new Date().toISOString()
    },
    {
      id: tenantAdmin2Id,
      email: 'admin@creative.io',
      password: 'admin123',
      name: 'Sarah Johnson',
      role: 'tenant_admin',
      tenantId: tenant2Id,
      createdAt: new Date().toISOString()
    },
    {
      id: staff1Id,
      email: 'staff@techcorp.com',
      password: 'staff123',
      name: 'Mike Wilson',
      role: 'staff',
      tenantId: tenant1Id,
      createdAt: new Date().toISOString()
    },
    {
      id: staff2Id,
      email: 'staff@creative.io',
      password: 'staff123',
      name: 'Emily Davis',
      role: 'staff',
      tenantId: tenant2Id,
      createdAt: new Date().toISOString()
    }
  ];
  
  const tenants = [
    {
      id: tenant1Id,
      name: 'TechCorp Solutions',
      slug: 'techcorp',
      plan: 'premium',
      adminId: tenantAdmin1Id,
      createdAt: new Date().toISOString(),
      settings: PLAN_LIMITS.premium
    },
    {
      id: tenant2Id,
      name: 'Creative Studios Inc',
      slug: 'creative',
      plan: 'basic',
      adminId: tenantAdmin2Id,
      createdAt: new Date().toISOString(),
      settings: PLAN_LIMITS.basic
    }
  ];
  
  const venues = [
    {
      id: venue1Id,
      tenantId: tenant1Id,
      name: 'TechCorp HQ',
      description: 'Main headquarters building with modern facilities',
      location: 'Downtown Tech District',
      address: '123 Innovation Street, Tech City, TC 10001',
      createdAt: new Date().toISOString()
    },
    {
      id: venue2Id,
      tenantId: tenant1Id,
      name: 'TechCorp Innovation Center',
      description: 'State-of-the-art innovation and collaboration space',
      location: 'Innovation Park',
      address: '456 Future Avenue, Tech City, TC 10002',
      createdAt: new Date().toISOString()
    }
  ];
  
  const rooms = [
    {
      id: room1Id,
      venueId: venue1Id,
      tenantId: tenant1Id,
      name: 'Conference Room A',
      capacity: 20,
      facilities: ['Projector', 'Whiteboard', 'Video Conferencing', 'Air Conditioning'],
      floor: '3rd Floor',
      createdAt: new Date().toISOString()
    },
    {
      id: room2Id,
      venueId: venue1Id,
      tenantId: tenant1Id,
      name: 'Board Room',
      capacity: 12,
      facilities: ['Large Screen TV', 'Video Conferencing', 'Premium Audio', 'Catering Service'],
      floor: '5th Floor',
      createdAt: new Date().toISOString()
    },
    {
      id: room3Id,
      venueId: venue2Id,
      tenantId: tenant1Id,
      name: 'Training Hall',
      capacity: 50,
      facilities: ['Projector', 'Sound System', 'Multiple Screens', 'Stage'],
      floor: 'Ground Floor',
      createdAt: new Date().toISOString()
    }
  ];
  
  const resources = [
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      roomId: room1Id,
      name: 'Epson Projector Pro',
      type: 'projector',
      description: 'High-definition projector for presentations',
      status: 'available',
      quantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      roomId: room2Id,
      name: 'Bose Sound System',
      type: 'sound_system',
      description: 'Premium wireless sound system',
      status: 'available',
      quantity: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      roomId: null,
      name: 'Portable Screen 100"',
      type: 'screen',
      description: 'Portable projection screen',
      status: 'available',
      quantity: 3,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      roomId: null,
      name: 'Wireless Microphone Set',
      type: 'microphone',
      description: 'Set of 4 wireless microphones with receiver',
      status: 'available',
      quantity: 2,
      createdAt: new Date().toISOString()
    }
  ];
  
  const now = new Date();
  const bookings = [
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      venueId: venue1Id,
      roomId: room1Id,
      userId: staff1Id,
      title: 'Weekly Team Meeting',
      description: 'Weekly sync-up with the development team',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30).toISOString(),
      status: 'approved',
      isRecurring: true,
      recurringPattern: { frequency: 'weekly', interval: 1, endDate: new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString() },
      attendees: 15,
      resources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      venueId: venue1Id,
      roomId: room2Id,
      userId: staff1Id,
      title: 'Client Presentation',
      description: 'Q4 results presentation for stakeholders',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 16, 0).toISOString(),
      status: 'pending',
      isRecurring: false,
      attendees: 8,
      resources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      venueId: venue2Id,
      roomId: room3Id,
      userId: staff1Id,
      title: 'Training Session: New Tools',
      description: 'Introduction to new development tools',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 9, 0).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 17, 0).toISOString(),
      status: 'approved',
      isRecurring: false,
      attendees: 40,
      resources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  const notifications = [
    {
      id: uuidv4(),
      tenantId: tenant1Id,
      userId: tenantAdmin1Id,
      type: 'booking_created',
      title: 'New Booking Request',
      message: 'Mike Wilson has requested to book Board Room for Client Presentation',
      read: false,
      createdAt: new Date().toISOString()
    }
  ];
  
  return { users, tenants, venues, rooms, resources, bookings, notifications };
};

// Initial state
const initialState = {
  auth: {
    user: null,
    tenant: null,
    isAuthenticated: false
  },
  users: [],
  tenants: [],
  venues: [],
  rooms: [],
  resources: [],
  bookings: [],
  notifications: [],
  subscriptions: []
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      const auth = action.payload;
      if (auth.user && auth.user.id && !auth.user._id) {
        auth.user._id = auth.user.id;
      }
      return { ...state, auth };
    case 'LOGOUT':
      return { ...state, auth: { user: null, tenant: null, isAuthenticated: false } };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'ADD_TENANT':
      return { ...state, tenants: [...state.tenants, action.payload] };
    case 'UPDATE_TENANT':
      return { ...state, tenants: state.tenants.map(t => t._id === action.payload._id ? action.payload : t) };
    case 'DELETE_TENANT':
      return { ...state, tenants: state.tenants.filter(t => t._id !== action.payload) };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return { ...state, users: state.users.map(u => u._id === action.payload._id ? action.payload : u) };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter(u => u._id !== action.payload) };
    case 'ADD_VENUE':
      return { ...state, venues: [...state.venues, action.payload] };
    case 'UPDATE_VENUE':
      return { ...state, venues: state.venues.map(v => v._id === action.payload._id ? action.payload : v) };
    case 'DELETE_VENUE':
      return { ...state, venues: state.venues.filter(v => v._id !== action.payload) };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM':
      return { ...state, rooms: state.rooms.map(r => r._id === action.payload._id ? action.payload : r) };
    case 'DELETE_ROOM':
      return { ...state, rooms: state.rooms.filter(r => r._id !== action.payload) };
    case 'ADD_RESOURCE':
      return { ...state, resources: [...state.resources, action.payload] };
    case 'UPDATE_RESOURCE':
      return { ...state, resources: state.resources.map(r => r._id === action.payload._id ? action.payload : r) };
    case 'DELETE_RESOURCE':
      return { ...state, resources: state.resources.filter(r => r._id !== action.payload) };
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'UPDATE_BOOKING':
      return { ...state, bookings: state.bookings.map(b => b._id === action.payload._id ? action.payload : b) };
    case 'DELETE_BOOKING':
      return { ...state, bookings: state.bookings.filter(b => b._id !== action.payload) };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n._id === action.payload ? { ...n, read: true } : n) };
    case 'SET_SUBSCRIPTIONS':
      return { ...state, subscriptions: action.payload };
    case 'UPDATE_SUBSCRIPTION':
      return { ...state, subscriptions: state.subscriptions.some(s => s._id === action.payload._id) 
        ? state.subscriptions.map(s => s._id === action.payload._id ? action.payload : s)
        : [...state.subscriptions, action.payload] };
    default:
      return state;
  }
}

const AppContext = createContext(undefined);

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('venueSchedulerAuth');
    if (storedAuth) {
      const auth = JSON.parse(storedAuth);
      dispatch({ type: 'SET_AUTH', payload: auth });
    }
  }, []);

  // Fetch initial data on login
  useEffect(() => {
    const fetchData = async () => {
      if (state.auth.isAuthenticated) {
        try {
          const [venuesRes, bookingsRes, resourcesRes] = await Promise.all([
            api.get('/venues'),
            api.get('/bookings'),
            api.get('/resources')
          ]);

          let tenantsData = [];
          let currentTenant = null;
          let usersData = [];

          if (state.auth.user.role === 'super_admin') {
            const [tenantsRes, usersRes] = await Promise.all([
              api.get('/tenants'),
              api.get('/users')
            ]);
            tenantsData = tenantsRes.data.data;
            usersData = usersRes.data.data;
          } else {
            const tenantRes = await api.get('/tenants/me');
            currentTenant = tenantRes.data.data;
            tenantsData = [currentTenant];
            
            if (state.auth.user.role === 'tenant_admin') {
              const usersRes = await api.get('/users');
              usersData = usersRes.data.data;
            }
          }

          dispatch({ type: 'LOAD_STATE', payload: {
            venues: venuesRes.data.data || [],
            bookings: bookingsRes.data.data || [],
            resources: resourcesRes.data.data || [],
            tenants: tenantsData || [],
            users: usersData || []
          }});

          dispatch({ 
            type: 'SET_AUTH', 
            payload: { 
              ...state.auth, 
              tenant: currentTenant 
            } 
          });

          // Load rooms for all venues found
          if (venuesRes.data.data.length > 0) {
            const allRooms = [];
            for (const venue of venuesRes.data.data) {
                const roomsRes = await api.get(`/rooms/${venue._id}`);
                if (Array.isArray(roomsRes.data.data)) {
                  allRooms.push(...roomsRes.data.data);
                }
            }
            dispatch({ type: 'LOAD_STATE', payload: { rooms: allRooms } });
          }

        } catch (error) {
          console.error('Initial data fetch error:', error);
        }
      }
    };

    fetchData();
  }, [state.auth.isAuthenticated]);
  
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      const authState = {
        user: res.data.user,
        tenant: null, // We'll fetch tenant info later if needed
        isAuthenticated: true,
        token: res.data.token
      };

      dispatch({ type: 'SET_AUTH', payload: authState });
      localStorage.setItem('venueSchedulerAuth', JSON.stringify(authState));
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      return false;
    }
  };
  
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('venueSchedulerAuth');
  };

  const registerTenant = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      
      const authState = {
        user: res.data.user,
        tenant: null,
        isAuthenticated: true,
        token: res.data.token
      };

      dispatch({ type: 'SET_AUTH', payload: authState });
      localStorage.setItem('venueSchedulerAuth', JSON.stringify(authState));
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const registerStaff = async (staffData) => {
    try {
      const res = await api.post('/auth/register-staff', staffData);
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error('Staff registration error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };
  
  // CRUD Operations
  const addVenue = async (venueData) => {
    try {
      const res = await api.post('/venues', venueData);
      dispatch({ type: 'ADD_VENUE', payload: res.data.data });
      return true;
    } catch (error) {
      console.error('Add venue error:', error);
      return false;
    }
  };

  const updateVenue = async (id, venueData) => {
    try {
      // Assuming PUT /venues/:id exists or needs to be implemented. 
      // Current seeder/backend mostly has basic endpoints.
      const res = await api.put(`/venues/${id}`, venueData);
      dispatch({ type: 'UPDATE_VENUE', payload: res.data.data });
      return true;
    } catch (error) {
      console.error('Update venue error:', error);
      return false;
    }
  };

  const deleteVenue = async (id) => {
    try {
      await api.delete(`/venues/${id}`);
      dispatch({ type: 'DELETE_VENUE', payload: id });
      return true;
    } catch (error) {
      console.error('Delete venue error:', error);
      return false;
    }
  };

  const addRoom = async (roomData) => {
    try {
      const res = await api.post('/rooms', roomData);
      dispatch({ type: 'ADD_ROOM', payload: res.data.data });
      return true;
    } catch (error) {
      console.error('Add room error:', error);
      return false;
    }
  };

  const addResource = async (resourceData) => {
    try {
      const res = await api.post('/resources', resourceData);
      dispatch({ type: 'ADD_RESOURCE', payload: res.data.data });
      return true;
    } catch (error) {
      console.error('Add resource error:', error);
      return false;
    }
  };

  const updateRoom = async (id, roomData) => {
    try {
      const res = await api.put(`/rooms/${id}`, roomData);
      dispatch({ type: 'UPDATE_ROOM', payload: res.data.data });
      return true;
    } catch (error) {
      console.error('Update room error:', error);
      return false;
    }
  };

  const deleteRoom = async (id) => {
    try {
      await api.delete(`/rooms/${id}`);
      dispatch({ type: 'DELETE_ROOM', payload: id });
      return true;
    } catch (error) {
      console.error('Delete room error:', error);
      return false;
    }
  };

  const updateResource = async (id, resourceData) => {
    try {
      const res = await api.put(`/resources/${id}`, resourceData);
      dispatch({ type: 'UPDATE_RESOURCE', payload: res.data.data });
      return true;
    } catch (error) {
      console.error('Update resource error:', error);
      return false;
    }
  };

  const deleteResource = async (id) => {
    try {
      await api.delete(`/resources/${id}`);
      dispatch({ type: 'DELETE_RESOURCE', payload: id });
      return true;
    } catch (error) {
      console.error('Delete resource error:', error);
      return false;
    }
  };

  const addBooking = async (bookingData) => {
    try {
      const res = await api.post('/bookings', bookingData);
      dispatch({ type: 'ADD_BOOKING', payload: res.data.data });
      return true;
    } catch (error) {
      console.error('Add booking error:', error);
      return false;
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const res = await api.put(`/bookings/${id}/status`, { status });
      dispatch({ type: 'UPDATE_BOOKING', payload: res.data.data });
      return true;
    } catch (error) {
      console.error('Update booking status error:', error);
      return false;
    }
  };

  const updateBooking = async (id, bookingData) => {
    try {
      const res = await api.put(`/bookings/${id}`, bookingData);
      dispatch({ type: 'UPDATE_BOOKING', payload: res.data.data });
      return true;
    } catch (error) {
      console.error('Update booking error:', error);
      return false;
    }
  };

  const deleteBooking = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      dispatch({ type: 'DELETE_BOOKING', payload: id });
      return true;
    } catch (error) {
      console.error('Delete booking error:', error);
      return false;
    }
  };
  const addUser = async (userData) => {
    try {
      const { data } = await api.post('/users', userData);
      dispatch({ type: 'ADD_USER', payload: data.data });
      return true;
    } catch (error) {
      console.error('Add user error:', error);
      return false;
    }
  };

  const updateUserStatus = async (id, status) => {
    try {
      const res = await api.put(`/users/${id}/status`, { status });
      dispatch({ type: 'UPDATE_USER', payload: res.data.data });
      return true;
    } catch (error) {
      console.error('Update user status error:', error);
      return false;
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      dispatch({ type: 'DELETE_USER', payload: id });
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  };

  const updateSubscription = async (subData) => {
    try {
      const { data } = await api.post('/subscriptions', subData);
      dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: data.data });
      return true;
    } catch (error) {
      console.error('Update subscription error:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      login, 
      logout, 
      registerTenant,
      registerStaff,
      addVenue,
      updateVenue,
      deleteVenue,
      addRoom,
      updateRoom,
      deleteRoom,
      addResource,
      updateResource,
      deleteResource,
      addBooking,
      updateBooking,
      updateBookingStatus,
      deleteBooking,
      addUser,
      updateUserStatus,
      deleteUser,
      updateSubscription
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useAuth() {
  const { state, login, logout, registerTenant } = useApp();
  return { ...state.auth, login, logout, registerTenant };
}

export function useTenantData() {
  const { 
    state, 
    dispatch, 
    addVenue, 
    updateVenue, 
    deleteVenue,
    addRoom,
    updateRoom,
    deleteRoom,
    addResource,
    updateResource,
    deleteResource,
    addBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
    addUser,
    updateUserStatus,
    deleteUser,
    updateSubscription
  } = useApp();
  const { user, tenant } = state.auth;
  
  const isSuperAdmin = user?.role === 'super_admin';
  const isTenantAdmin = user?.role === 'tenant_admin';
  const tenantId = user?.tenantId;
  
  // Filter data by tenant
  const venues = isSuperAdmin ? state.venues : tenantId ? state.venues.filter(v => v.tenantId === tenantId) : [];
  const rooms = isSuperAdmin ? state.rooms : tenantId ? state.rooms.filter(r => r.tenantId === tenantId) : [];
  const resources = isSuperAdmin ? state.resources : tenantId ? state.resources.filter(r => r.tenantId === tenantId) : [];
  const bookings = isSuperAdmin ? state.bookings : tenantId ? state.bookings.filter(b => b.tenantId === tenantId) : [];
  const notifications = isSuperAdmin ? state.notifications : tenantId ? state.notifications.filter(n => n.tenantId === tenantId) : [];
  const users = isSuperAdmin ? state.users : tenantId ? state.users.filter(u => u.tenantId === tenantId) : [];
  
  return {
    venues,
    rooms,
    resources,
    bookings,
    notifications,
    users,
    tenants: state.tenants,
    tenant,
    user,
    isSuperAdmin,
    isTenantAdmin,
    dispatch,
    addVenue,
    updateVenue,
    deleteVenue,
    addRoom,
    updateRoom,
    deleteRoom,
    addResource,
    updateResource,
    deleteResource,
    addBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
    addUser,
    updateUserStatus,
    deleteUser,
    updateSubscription,
    subscriptions: state.subscriptions
  };
}

export { uuidv4, PLAN_LIMITS, PLAN_PRICES };
