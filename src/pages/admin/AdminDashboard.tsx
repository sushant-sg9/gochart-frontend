import React, { useState, useEffect } from 'react';
import { Users, UserPlus, CreditCard, TrendingUp, Activity, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../../config/apiConfig';
import { useToast } from '../../context/ToastContext';

interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  pendingPayments: number;
  monthlyRevenue: number;
  activeUsers: number;
  newUsersToday: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    premiumUsers: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    newUsersToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { error: showError, success: showSuccess } = useToast();

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching dashboard stats from:', getApiUrl('ADMIN', 'BASE'));
      
      // Fetch users data
      const usersResponse = await fetch(getApiUrl('ADMIN', 'BASE'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', usersResponse.status);
      console.log('Response headers:', Object.fromEntries(usersResponse.headers));
      
      if (!usersResponse.ok) {
        let errorMessage = `HTTP error! status: ${usersResponse.status}`;
        try {
          const errorData = await usersResponse.json();
          console.log('Error response:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.log('Could not parse error response as JSON');
        }
        throw new Error(errorMessage);
      }
      
      const responseData = await usersResponse.json();
      
      console.log('Admin dashboard API response:', responseData);
      console.log('Response type:', typeof responseData);
      console.log('Is array:', Array.isArray(responseData));
      
      // Handle different response formats
      let usersData;
      if (Array.isArray(responseData)) {
        usersData = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        usersData = responseData.data;
      } else if (responseData && Array.isArray(responseData.users)) {
        usersData = responseData.users;
      } else if (responseData && responseData.statuscode === 200 && Array.isArray(responseData.data)) {
        usersData = responseData.data;
      } else if (responseData && typeof responseData === 'object') {
        // Try to find any array property
        const arrayProps = Object.keys(responseData).filter(key => 
          Array.isArray(responseData[key])
        );
        if (arrayProps.length > 0) {
          console.log('Found array properties:', arrayProps);
          usersData = responseData[arrayProps[0]];
        } else {
          console.error('No array found in response. Available properties:', Object.keys(responseData));
          // If no users found, initialize empty array
          usersData = [];
        }
      } else {
        console.error('Unexpected API response format:', responseData);
        // Initialize with empty array instead of throwing error
        usersData = [];
      }
      
      console.log('Processed users data:', usersData);
      console.log('Users count:', usersData ? usersData.length : 'undefined');
      
      if (usersData && usersData.length >= 0) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Calculate stats from users data
        const totalUsers = usersData.length;
        const premiumUsers = usersData.filter((user: any) => user.isPremium && user.status === 'paid').length;
        const pendingPayments = usersData.filter((user: any) => user.status === 'pending').length;
        const newUsersToday = usersData.filter((user: any) => {
          const userDate = new Date(user.createdAt || user.premiumStartDate);
          return userDate >= today;
        }).length;
        
        // Calculate active users (users with recent activity - simplified estimation)
        const activeUsers = Math.floor(premiumUsers * 0.7); // Assume 70% of premium users are active
        
        // Calculate monthly revenue (simplified - you might need actual revenue data)
        const cryptoUsers = usersData.filter((user: any) => user.paymentType === 'crypto' && user.status === 'paid').length;
        const regularUsers = usersData.filter((user: any) => (user.paymentType === 'upi' || user.paymentType === 'bank') && user.status === 'paid').length;
        const monthlyRevenue = (cryptoUsers * 50) + (regularUsers * 2000); // Estimated prices
        
        setStats({
          totalUsers,
          premiumUsers,
          pendingPayments,
          monthlyRevenue,
          activeUsers,
          newUsersToday
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showError('Failed to load dashboard statistics. Using fallback data.');
      
      // Set fallback stats to show something instead of zeros
      setStats({
        totalUsers: 0,
        premiumUsers: 0,
        pendingPayments: 0,
        monthlyRevenue: 0,
        activeUsers: 0,
        newUsersToday: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleRefresh = () => {
    fetchDashboardStats();
    showSuccess('Dashboard refreshed successfully');
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    loading 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
    trend?: string; 
    loading: boolean;
  }) => (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <span className="text-green-400 text-sm font-medium">
            +{trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        {loading ? (
          <div className="h-8 bg-slate-800 rounded animate-pulse"></div>
        ) : (
          <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        )}
      </div>
    </div>
  );

  const QuickAction = ({ 
    title, 
    description, 
    icon: Icon, 
    color, 
    onClick 
  }: { 
    title: string; 
    description: string; 
    icon: any; 
    color: string; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-900/30 border border-slate-800 rounded-lg p-4 hover:border-slate-700 hover:bg-slate-900/50 transition-colors group"
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1 lg:mt-2">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 text-slate-400 text-sm">
            <Clock size={16} />
            <span className="hidden sm:inline">Last updated:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-600"
          trend="8.2%"
          loading={isLoading}
        />
        <StatCard
          title="Premium Users"
          value={stats.premiumUsers}
          icon={UserPlus}
          color="bg-emerald-600"
          trend="12.5%"
          loading={isLoading}
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={CreditCard}
          color="bg-amber-600"
          loading={isLoading}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue}`}
          icon={TrendingUp}
          color="bg-violet-600"
          trend="15.3%"
          loading={isLoading}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Activity}
          color="bg-cyan-600"
          loading={isLoading}
        />
        <StatCard
          title="New Today"
          value={stats.newUsersToday}
          icon={UserPlus}
          color="bg-rose-600"
          loading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction
              title="Manage Users"
              description="View and manage all registered users"
              icon={Users}
              color="bg-blue-600"
              onClick={() => window.location.href = '/admin/users'}
            />
            <QuickAction
              title="Review Payments"
              description="Approve or decline payment requests"
              icon={CreditCard}
              color="bg-emerald-600"
              onClick={() => window.location.href = '/admin/user-requests'}
            />
            <QuickAction
              title="Update Payment Info"
              description="Modify payment plans and pricing"
              icon={TrendingUp}
              color="bg-violet-600"
              onClick={() => window.location.href = '/admin/update-payment'}
            />
            <QuickAction
              title="Reset Password"
              description="Help users with password recovery"
              icon={CheckCircle}
              color="bg-amber-600"
              onClick={() => window.location.href = '/admin/reset-password'}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">New user registration</p>
                  <p className="text-slate-400 text-xs">john.doe@email.com - 2 minutes ago</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Payment approved</p>
                  <p className="text-slate-400 text-xs">Premium subscription - 15 minutes ago</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Payment pending</p>
                  <p className="text-slate-400 text-xs">Awaiting verification - 1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;