import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface UserRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  utrNo: string;
  paymentAmount: number;
  paymentType: 'crypto' | 'regular';
  subscriptionMonths: number;
  status: 'pending' | 'paid' | 'cancel';
  createdAt: string;
  updatedAt: string;
  paymentPlanId?: string;
}

interface FilterState {
  search: string;
  paymentType: string;
  startDate: string;
  endDate: string;
}

const AdminRequestUser: React.FC = () => {
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    paymentType: '',
    startDate: '',
    endDate: ''
  });
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  
  const itemsPerPage = 10;
  const { error: showError, success: showSuccess } = useToast();

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin');
      
      if (data.success && data.data && Array.isArray(data.data.users)) {
        // Filter users who have submitted payment requests (have UTR and are pending)
        const requests = data.data.users.filter((user: any) => 
          user.utrNo && user.status === 'pending'
        );
        setUserRequests(requests);
        setFilteredRequests(requests);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching user requests:', error);
      showError('Failed to fetch user requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  // Filter requests based on current filters
  useEffect(() => {
    let filtered = userRequests;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(request => 
        request.name.toLowerCase().includes(searchLower) ||
        request.email.toLowerCase().includes(searchLower) ||
        (request.utrNo && request.utrNo.toLowerCase().includes(searchLower))
      );
    }

    // Payment type filter
    if (filters.paymentType) {
      filtered = filtered.filter(request => request.paymentType === filters.paymentType);
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.createdAt);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        return (!startDate || requestDate >= startDate) && (!endDate || requestDate <= endDate);
      });
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [filters, userRequests]);

  const handleApproveRequest = async (requestId: string, subscriptionMonths: number) => {
    if (!confirm('Are you sure you want to approve this payment request?')) return;
    
    setProcessingRequest(requestId);
    try {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + subscriptionMonths);

      const result = await api.put(`/user/${requestId}/subscription`, {
        isPremium: true,
        status: 'paid',
        premiumStartDate: startDate.toISOString(),
        premiumEndDate: endDate.toISOString(),
      });
      
      if (result.success) {
        showSuccess('Payment request approved successfully');
        fetchUserRequests();
      } else {
        showError(result.message || 'Failed to approve request');
      }
    } catch (error) {
      showError('Failed to approve payment request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to reject this payment request?')) return;
    
    setProcessingRequest(requestId);
    try {
      const result = await api.put(`/user/${requestId}/subscription`, {
        status: 'cancel',
        isPremium: false,
      });
      
      if (result.success) {
        showSuccess('Payment request rejected');
        fetchUserRequests();
      } else {
        showError(result.message || 'Failed to reject request');
      }
    } catch (error) {
      showError('Failed to reject payment request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      paymentType: '',
      startDate: '',
      endDate: ''
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const getPaymentTypeBadge = (type: string) => {
    const typeConfig = {
      crypto: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'Crypto' },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Payment Requests</h1>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-400">Loading payment requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Requests</h1>
          <p className="text-slate-400 mt-1">
            {filteredRequests.length} pending payment requests
            {filters.search && ` matching "${filters.search}"`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchUserRequests}
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
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or UTR number..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-700"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* Payment Type Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Payment Type</label>
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({...filters, paymentType: e.target.value})}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="crypto">Crypto</option>
              <option value="regular">Regular</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-slate-600/50 hover:bg-slate-600 border border-slate-500/50 rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors"
          >
            Clear Filters
          </button>
          
          {/* Active Filters Count */}
          {(filters.search || filters.paymentType || filters.startDate || filters.endDate) && (
            <div className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full">
              <span className="text-blue-400 text-xs font-medium">
                {[filters.search, filters.paymentType, filters.startDate || filters.endDate].filter(Boolean).length} active
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Requests Table/Cards */}
      {filteredRequests.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Payment Requests</h3>
          <p className="text-slate-400">
            {userRequests.length === 0 
              ? 'There are no pending payment requests at the moment.' 
              : 'No requests match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">User</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">Payment Details</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">UTR Number</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">Subscription</th>
                    <th className="text-left py-4 px-6 text-slate-300 font-medium">Requested On</th>
                    <th className="text-right py-4 px-6 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {currentRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {request.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium">{request.name}</div>
                            <div className="text-slate-400 text-sm">{request.email}</div>
                            <div className="text-slate-400 text-xs">{request.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="text-white font-medium">{formatCurrency(request.paymentAmount)}</div>
                          {getPaymentTypeBadge(request.paymentType)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white font-mono text-sm bg-slate-700/30 px-2 py-1 rounded">
                          {request.utrNo}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white text-sm">
                          {request.subscriptionMonths} month{request.subscriptionMonths > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-300 text-sm">
                          {formatDate(request.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleApproveRequest(request._id, request.subscriptionMonths)}
                            disabled={processingRequest === request._id}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve Request"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={processingRequest === request._id}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject Request"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-slate-700/50">
            {currentRequests.map((request) => (
              <div key={request._id} className="p-4 hover:bg-slate-700/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {request.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{request.name}</div>
                      <div className="text-slate-400 text-xs">{request.email}</div>
                      <div className="text-slate-400 text-xs">{request.phone}</div>
                    </div>
                  </div>
                  {getPaymentTypeBadge(request.paymentType)}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-white font-medium">{formatCurrency(request.paymentAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">UTR Number:</span>
                    <span className="text-white font-mono text-xs bg-slate-700/30 px-2 py-1 rounded">{request.utrNo}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Subscription:</span>
                    <span className="text-white">{request.subscriptionMonths} month{request.subscriptionMonths > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Requested:</span>
                    <span className="text-white">{formatDate(request.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-700/30">
                  <button
                    onClick={() => handleApproveRequest(request._id, request.subscriptionMonths)}
                    disabled={processingRequest === request._id}
                    className="flex items-center space-x-2 px-3 py-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request._id)}
                    disabled={processingRequest === request._id}
                    className="flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
              <div className="text-slate-400 text-sm">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
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
      )}
    </div>
  );
};

export default AdminRequestUser;
