import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaCrown,
  FaShieldAlt,
  FaSignOutAlt,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaGlobe,
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SessionManager from '../../components/profile/SessionManager';

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showSuccess("Logged out successfully!");
      navigate("/");
    } catch (error) {
      showError("Logout failed", "Please try again.");
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubscriptionStatus = () => {
    if (!user) return { text: "Loading...", color: "text-gray-400", bgColor: "bg-gray-600", icon: FaClock };
    
    if (user.isPremium && user.status === "paid") {
      return { text: "Premium Active", color: "text-green-400", bgColor: "bg-green-600", icon: FaCrown };
    } else if (user.status === "pending") {
      return { text: "Pending Approval", color: "text-yellow-400", bgColor: "bg-yellow-600", icon: FaClock };
    } else {
      return { text: "Free User", color: "text-blue-400", bgColor: "bg-blue-600", icon: FaUser };
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 ${subscriptionStatus.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
                  <subscriptionStatus.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <p className={`text-sm ${subscriptionStatus.color} flex items-center`}>
                    <subscriptionStatus.icon className="w-4 h-4 mr-2" />
                    {subscriptionStatus.text}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {user.isEmailVerified ? (
                  <div className="flex items-center text-green-400">
                    <FaCheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-400">
                    <FaTimesCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Unverified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaUser className="w-5 h-5 mr-2 text-blue-400" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center text-gray-400 mb-2">
                    <FaEnvelope className="w-4 h-4 mr-2" />
                    <span className="text-sm">Email Address</span>
                  </div>
                  <p className="text-white font-medium">{user.email}</p>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center text-gray-400 mb-2">
                    <FaPhone className="w-4 h-4 mr-2" />
                    <span className="text-sm">Phone Number</span>
                  </div>
                  <p className="text-white font-medium">{user.phone}</p>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center text-gray-400 mb-2">
                    <FaShieldAlt className="w-4 h-4 mr-2" />
                    <span className="text-sm">Account Role</span>
                  </div>
                  <p className="text-white font-medium capitalize">{user.role}</p>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center text-gray-400 mb-2">
                    <FaCalendarAlt className="w-4 h-4 mr-2" />
                    <span className="text-sm">Member Since</span>
                  </div>
                  <p className="text-white font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription & Account Status */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaCrown className="w-5 h-5 mr-2 text-yellow-400" />
                Subscription
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className={`text-sm font-medium ${subscriptionStatus.color}`}>
                      {subscriptionStatus.text}
                    </span>
                  </div>
                </div>

                {user.isPremium && (
                  <>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-2">Premium Start Date</div>
                      <div className="text-white font-medium">
                        {formatDate(user.premiumStartDate)}
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="text-gray-400 text-sm mb-2">Premium End Date</div>
                      <div className="text-white font-medium">
                        {formatDate(user.premiumEndDate)}
                      </div>
                    </div>

                    {user.subscriptionMonths && (
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-2">Subscription Period</div>
                        <div className="text-white font-medium">
                          {user.subscriptionMonths} {user.subscriptionMonths === 1 ? 'month' : 'months'}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {user.paymentType && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">Payment Type</div>
                    <div className="text-white font-medium capitalize">{user.paymentType}</div>
                  </div>
                )}

                {user.paymentAmount && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">Payment Amount</div>
                    <div className="text-white font-medium">₹{user.paymentAmount}</div>
                  </div>
                )}

                {user.transactionId && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">Transaction ID</div>
                    <div className="text-white font-medium text-xs break-all">{user.transactionId}</div>
                  </div>
                )}

                {user.utrNo && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">UTR Number</div>
                    <div className="text-white font-medium">{user.utrNo}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaShieldAlt className="w-5 h-5 mr-2 text-green-400" />
                Account Security
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center">
                    {user.isActive ? (
                      <FaUnlock className="w-4 h-4 text-green-400 mr-3" />
                    ) : (
                      <FaLock className="w-4 h-4 text-red-400 mr-3" />
                    )}
                    <span className="text-white text-sm">Account Status</span>
                  </div>
                  <span className={`text-sm font-medium ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center">
                    {user.isEmailVerified ? (
                      <FaCheckCircle className="w-4 h-4 text-green-400 mr-3" />
                    ) : (
                      <FaTimesCircle className="w-4 h-4 text-red-400 mr-3" />
                    )}
                    <span className="text-white text-sm">Email Verification</span>
                  </div>
                  <span className={`text-sm font-medium ${user.isEmailVerified ? 'text-green-400' : 'text-red-400'}`}>
                    {user.isEmailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                {user.lastActivity && (
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-2">Last Activity</div>
                    <div className="text-white font-medium">{formatDate(user.lastActivity)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Support Button */}
            <button
              onClick={() => window.open("https://telegram.me/gocharts", "_blank")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <FaPhone className="w-4 h-4 mr-2" />
              Contact Support
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              {isLoggingOut ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <FaSignOutAlt className="w-4 h-4 mr-2" />
                  Sign Out
                </>
              )}
            </button>
          </div>
        </div>

        {/* Session Management Section - Full Width */}
        <div className="mt-6">
          <SessionManager />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
