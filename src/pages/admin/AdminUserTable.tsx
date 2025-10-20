import React, { useEffect, useState } from "react";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Edit,
  RefreshCw,
  Download,
  UserX,
  Calendar,
  Crown,
  Smartphone
} from "lucide-react";
import { getApiUrl } from '../../config/apiConfig';
import { useToast } from '../../context/ToastContext';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isPremium: boolean;
  status: 'paid' | 'pending' | 'cancel' | 'expired';
  premiumStartDate: string;
  premiumEndDate: string;
  subscriptionMonths: number;
  paymentType: 'crypto' | 'upi' | 'bank' | 'regular';
  utrNo?: string;
  createdAt: string;
  role?: string;
  isActive?: boolean;
  paymentAmount?: number;
  transactionId?: string;
}

interface FilterState {
  search: string;
  status: string;
  paymentType: string;
  isPremium: string;
  startDate: string;
  endDate: string;
}

const AdminUserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    paymentType: '',
    isPremium: '',
    startDate: '',
    endDate: ''
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionModalUser, setSubscriptionModalUser] = useState<User | null>(null);
  const [newSubscriptionMonths, setNewSubscriptionMonths] = useState('');
  const [showDeleteSessionsModal, setShowDeleteSessionsModal] = useState(false);
  const [deleteSessionsUser, setDeleteSessionsUser] = useState<User | null>(null);
  
  const itemsPerPage = 10;
  const { error: showError, success: showSuccess } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('ADMIN', 'BASE'), {
        credentials: 'include',
      });
      const data = await response.json();
      
      console.log('API Response:', data);
      
      // Handle the specific API response format: { success: true, data: { users: [...] } }
      if (data.success && data.data && Array.isArray(data.data.users)) {
        setUsers(data.data.users);
        setFilteredUsers(data.data.users);
        console.log('Successfully loaded', data.data.users.length, 'users');
      } else if (Array.isArray(data)) {
        // Fallback: direct array
        setUsers(data);
        setFilteredUsers(data);
      } else {
        console.error('Unexpected API response format:', data);
        throw new Error('Invalid response format: Expected { success: true, data: { users: [...] } }');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on current filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.utrNo && user.utrNo.includes(filters.search))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Payment type filter
    if (filters.paymentType) {
      filtered = filtered.filter(user => user.paymentType === filters.paymentType);
    }

    // Premium filter
    if (filters.isPremium) {
      filtered = filtered.filter(user => 
        filters.isPremium === 'true' ? user.isPremium : !user.isPremium
      );
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(user => {
        const userDate = new Date(user.premiumStartDate);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        return (!startDate || userDate >= startDate) && (!endDate || userDate <= endDate);
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [filters, users]);

  const handleUserAction = async (action: 'approve' | 'decline' | 'suspend', userId: string, months?: number) => {
    try {
      const payload: any = { id: userId };
      
      if (action === 'approve') {
        payload.status = true;
        if (months) {
          const startDate = new Date();
          const premiumEndDate = new Date(startDate);
          premiumEndDate.setMonth(premiumEndDate.getMonth() + months);
          payload.premiumEndDate = premiumEndDate;
        }
      } else {
        payload.status = false;
      }

      const response = await fetch(getApiUrl('ADMIN', 'USER_STATUS'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (result.statuscode === 200) {
        showSuccess(result.message);
        fetchUsers();
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError('Failed to update user status');
    }
  };


  const handleSubscriptionUpdate = async () => {
    if (!subscriptionModalUser) return;
    
    if (!newSubscriptionMonths || parseInt(newSubscriptionMonths) <= 0) {
      showError('Please enter a valid number of months');
      return;
    }

    try {
      const response = await fetch(getApiUrl('ADMIN', 'UPDATE_SUBSCRIPTION'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: subscriptionModalUser.email,
          months: parseInt(newSubscriptionMonths)
        }),
      });

      if (response.ok) {
        showSuccess('Subscription updated successfully');
        setShowSubscriptionModal(false);
        setNewSubscriptionMonths('');
        setSubscriptionModalUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        showError(data.message);
      }
    } catch (error) {
      showError('Failed to update subscription');
    }
  };

  const handleDeleteUserSessions = async () => {
    if (!deleteSessionsUser) return;

    try {
      const response = await fetch(getApiUrl('ADMIN', 'DELETE_USER_SESSIONS'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: deleteSessionsUser._id
        }),
      });

      if (response.ok) {
        showSuccess('All user sessions deleted successfully');
        setShowDeleteSessionsModal(false);
        setDeleteSessionsUser(null);
      } else {
        const data = await response.json();
        showError(data.message);
      }
    } catch (error) {
      showError('Failed to delete user sessions');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      paymentType: '',
      isPremium: '',
      startDate: '',
      endDate: ''
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'Paid' },
      pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'Pending' },
      cancel: { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Cancelled' },
      expired: { color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: 'Expired' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.expired;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentTypeBadge = (type: string) => {
    const typeConfig = {
      crypto: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'Crypto' },
      upi: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'UPI' },
      bank: { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'Bank' },
      regular: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Regular' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    if (!config) return <span className="text-slate-400">—</span>;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-400">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">
            {filteredUsers.length} of {users.length} users
            {filters.search && ` matching "${filters.search}"`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6">
        {/* Search Bar - Full width on mobile */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or UTR..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-700"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancel">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Payment Type Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Payment</label>
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({...filters, paymentType: e.target.value})}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="crypto">Crypto</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank</option>
              <option value="regular">Regular</option>
            </select>
          </div>

          {/* Premium Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Plan</label>
            <select
              value={filters.isPremium}
              onChange={(e) => setFilters({...filters, isPremium: e.target.value})}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Plans</option>
              <option value="true">Premium</option>
              <option value="false">Regular</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">&nbsp;</label>
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500/50 rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Date Range - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center space-x-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-slate-400 text-sm">to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Active Filters Count */}
          {(filters.search || filters.status || filters.paymentType || filters.isPremium || filters.startDate || filters.endDate) && (
            <div className="flex items-center space-x-2">
              <div className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full">
                <span className="text-blue-400 text-xs font-medium">
                  {[filters.search, filters.status, filters.paymentType, filters.isPremium, filters.startDate || filters.endDate].filter(Boolean).length} active
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table / Mobile Cards */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700/50">
                <tr>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">User</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Contact</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Plan</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Payment</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Subscription</th>
                  <th className="text-right py-4 px-6 text-slate-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {currentUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-slate-400 text-sm flex items-center">
                            {user.isPremium && <Crown className="w-3 h-3 mr-1" />}
                            #{startIndex + index + 1}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-white text-sm">{user.email}</div>
                        <div className="text-slate-400 text-xs">{user.phone || '—'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {user.isPremium ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {getPaymentTypeBadge(user.paymentType)}
                        {user.utrNo && (
                          <div className="text-xs text-slate-400 font-mono">{user.utrNo}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-white text-sm">{user.subscriptionMonths} months</div>
                        {user.premiumEndDate && (
                          <div className="text-slate-400 text-xs">
                            Until {new Date(user.premiumEndDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        {user.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUserAction('approve', user._id, user.subscriptionMonths)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleUserAction('decline', user._id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Decline"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleUserAction('suspend', user._id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Suspend"
                          >
                            <UserX size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setDeleteSessionsUser(user);
                            setShowDeleteSessionsModal(true);
                          }}
                          className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 rounded-lg transition-colors"
                          title="Delete All Sessions"
                        >
                          <Smartphone size={16} />
                        </button>
                        
                        {user.subscriptionMonths > 0 && (
                          <button
                            onClick={() => {
                              setSubscriptionModalUser(user);
                              setShowSubscriptionModal(true);
                            }}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 rounded-lg transition-colors"
                            title="Edit Subscription"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards - Hidden on desktop */}
        <div className="lg:hidden divide-y divide-slate-700/50">
          {currentUsers.map((user, index) => (
            <div key={user._id} className="p-4 hover:bg-slate-700/10 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{user.name}</div>
                    <div className="text-slate-400 text-xs flex items-center mt-1">
                      {user.isPremium && <Crown className="w-3 h-3 mr-1" />}
                      #{startIndex + index + 1} • {user.role || 'user'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.isPremium ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30">
                      Regular
                    </span>
                  )}
                  {getStatusBadge(user.status)}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Phone:</span>
                  <span className="text-white">{user.phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Payment:</span>
                  <div className="flex flex-col items-end space-y-1">
                    {getPaymentTypeBadge(user.paymentType)}
                    {user.utrNo && (
                      <span className="text-xs text-slate-400 font-mono">{user.utrNo}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Subscription:</span>
                  <div className="text-right">
                    <div className="text-white text-sm">{user.subscriptionMonths} months</div>
                    {user.premiumEndDate && (
                      <div className="text-slate-400 text-xs">
                        Until {new Date(user.premiumEndDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-700/30">
                {user.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleUserAction('approve', user._id, user.subscriptionMonths)}
                      className="flex items-center space-x-2 px-3 py-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors text-sm"
                    >
                      <CheckCircle size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleUserAction('decline', user._id)}
                      className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
                    >
                      <XCircle size={14} />
                      <span>Decline</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleUserAction('suspend', user._id)}
                    className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
                  >
                    <UserX size={14} />
                    <span>Suspend</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setDeleteSessionsUser(user);
                    setShowDeleteSessionsModal(true);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 rounded-lg transition-colors text-sm"
                >
                  <Smartphone size={14} />
                  <span>Sessions</span>
                </button>
                
                {user.subscriptionMonths > 0 && (
                  <button
                    onClick={() => {
                      setSubscriptionModalUser(user);
                      setShowSubscriptionModal(true);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10 rounded-lg transition-colors text-sm"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
            <div className="text-slate-400 text-sm">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-600 rounded text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded transition-colors ${
                      pageNum === currentPage
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-600 rounded text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Subscription Update Modal */}
      {showSubscriptionModal && subscriptionModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Update Subscription</h2>
            <div className="mb-4">
              <p className="text-green-400 font-medium">{subscriptionModalUser.email}</p>
              <p className="text-slate-400 text-sm">Current: {subscriptionModalUser.subscriptionMonths} months</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">New Subscription Months</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={newSubscriptionMonths}
                  onChange={(e) => setNewSubscriptionMonths(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of months"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSubscriptionModal(false);
                  setSubscriptionModalUser(null);
                  setNewSubscriptionMonths('');
                }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscriptionUpdate}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Update Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sessions Modal */}
      {showDeleteSessionsModal && deleteSessionsUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Delete All Sessions</h2>
            <div className="mb-4">
              <p className="text-green-400 font-medium">{deleteSessionsUser.name}</p>
              <p className="text-slate-400 text-sm">{deleteSessionsUser.email}</p>
            </div>
            
            <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="bg-orange-500/20 p-1 rounded">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-sm text-orange-200">
                  <p className="font-medium mb-1">Warning</p>
                  <p className="text-orange-300">
                    This will immediately sign out the user from all devices and sessions. 
                    They will need to log in again.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteSessionsModal(false);
                  setDeleteSessionsUser(null);
                }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUserSessions}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Delete All Sessions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserTable;
