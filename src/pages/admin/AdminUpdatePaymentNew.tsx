import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CreditCard, 
  QrCode, 
  Calendar,
  DollarSign,
  Coins,
  Wallet,
  X,
  Save,
  CheckCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface PaymentPlan {
  _id: string;
  price: number;
  month: number;
  qrcodeUrl: string;
  type: 'crypto' | 'regular';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaymentFormData {
  price: number;
  month: number;
  qrcodeUrl: string;
  type: 'crypto' | 'regular';
}

const AdminUpdatePayment: React.FC = () => {
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'crypto' | 'regular'>('all');
  const { success: showSuccess, error: showError } = useToast();

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    price: 0,
    month: 1,
    qrcodeUrl: '',
    type: 'regular'
  });

  // Fetch payment plans
  const fetchPaymentPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/payment-info?includeInactive=true');
      if (response.success) {
        setPaymentPlans(response.data);
      }
    } catch (error: any) {
      showError('Failed to fetch payment plans', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentPlans();
  }, []);

  const resetForm = () => {
    setPaymentForm({
      price: 0,
      month: 1,
      qrcodeUrl: '',
      type: 'regular'
    });
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/admin/create-payment-info', paymentForm);
      if (response.success) {
        showSuccess('Payment plan created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchPaymentPlans();
      }
    } catch (error: any) {
      showError('Failed to create payment plan', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setIsSubmitting(true);
    try {
      const response = await api.put('/admin/update-payment-info', {
        id: selectedPlan._id,
        ...paymentForm
      });
      if (response.success) {
        showSuccess('Payment plan updated successfully!');
        setShowUpdateModal(false);
        setSelectedPlan(null);
        resetForm();
        fetchPaymentPlans();
      }
    } catch (error: any) {
      showError('Failed to update payment plan', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this payment plan?')) return;

    try {
      const response = await api.delete(`/admin/payment-info/${planId}`);
      if (response.success) {
        showSuccess('Payment plan deleted successfully!');
        fetchPaymentPlans();
      }
    } catch (error: any) {
      showError('Failed to delete payment plan', error.message);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openUpdateModal = (plan: PaymentPlan) => {
    setSelectedPlan(plan);
    setPaymentForm({
      price: plan.price,
      month: plan.month,
      qrcodeUrl: plan.qrcodeUrl,
      type: plan.type
    });
    setShowUpdateModal(true);
  };

  const getTypeIcon = (type: string) => {
    return type === 'crypto' ? (
      <Coins className="w-4 h-4 text-yellow-400" />
    ) : (
      <Wallet className="w-4 h-4 text-blue-400" />
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'crypto' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Coins className="w-3 h-3 mr-1" />
        Crypto
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Wallet className="w-3 h-3 mr-1" />
        Regular
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredPlans = paymentPlans.filter(plan => 
    typeFilter === 'all' || plan.type === typeFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Plans Management</h1>
          <p className="text-slate-400">Create and manage subscription payment plans that users can choose from</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={fetchPaymentPlans}
            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </button>
        </div>
      </div>

      {/* Filter and Stats */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'crypto' | 'regular')}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="crypto">Crypto</option>
              <option value="regular">Regular</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-sm text-slate-300">Total Plans:</span>
            </div>
            <span className="font-semibold text-white">{filteredPlans.length}</span>
          </div>

          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center">
              <Coins className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-sm text-slate-300">Crypto Plans:</span>
            </div>
            <span className="font-semibold text-white">{paymentPlans.filter(p => p.type === 'crypto').length}</span>
          </div>

          <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center">
              <Wallet className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-sm text-slate-300">Regular Plans:</span>
            </div>
            <span className="font-semibold text-white">{paymentPlans.filter(p => p.type === 'regular').length}</span>
          </div>
        </div>
      </div>

      {/* Payment Plans Grid */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center p-8">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No payment plans found</p>
            <p className="text-slate-500 text-sm">Create your first payment plan to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div
                key={plan._id}
                className={`bg-slate-800/50 border rounded-xl p-6 transition-all hover:border-slate-600 ${
                  !plan.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(plan.type)}
                    <span className="font-semibold text-white capitalize">{plan.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeBadge(plan.type)}
                    {!plan.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Price:</span>
                    <span className="text-2xl font-bold text-white">{formatCurrency(plan.price)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <div className="flex items-center text-white">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{plan.month} {plan.month === 1 ? 'month' : 'months'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Per Month:</span>
                    <span className="text-white font-medium">
                      {formatCurrency(plan.price / plan.month)}
                    </span>
                  </div>

                  {plan.qrcodeUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">QR Code:</span>
                      <div className="flex items-center text-green-400">
                        <QrCode className="w-4 h-4 mr-1" />
                        <span className="text-sm">Available</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openUpdateModal(plan)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Payment Plan</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentForm.price}
                      onChange={(e) => setPaymentForm({ ...paymentForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duration (Months)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={paymentForm.month}
                      onChange={(e) => setPaymentForm({ ...paymentForm, month: parseInt(e.target.value) || 1 })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Payment Type
                </label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as 'crypto' | 'regular' })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="regular">Regular</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  QR Code URL
                </label>
                <div className="relative">
                  <QrCode className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={paymentForm.qrcodeUrl}
                    onChange={(e) => setPaymentForm({ ...paymentForm, qrcodeUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="https://example.com/qr-code.png"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Plan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Plan Modal */}
      {showUpdateModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Update Payment Plan</h3>
              <button
                onClick={() => {setShowUpdateModal(false); setSelectedPlan(null);}}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentForm.price}
                      onChange={(e) => setPaymentForm({ ...paymentForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duration (Months)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={paymentForm.month}
                      onChange={(e) => setPaymentForm({ ...paymentForm, month: parseInt(e.target.value) || 1 })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Payment Type
                </label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as 'crypto' | 'regular' })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="regular">Regular</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  QR Code URL
                </label>
                <div className="relative">
                  <QrCode className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={paymentForm.qrcodeUrl}
                    onChange={(e) => setPaymentForm({ ...paymentForm, qrcodeUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="https://example.com/qr-code.png"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {setShowUpdateModal(false); setSelectedPlan(null);}}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Plan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUpdatePayment;