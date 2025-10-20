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
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
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

  const formatDate = (dateString: string | Date | null | undefined) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Profile Overview - Spans 2 columns on XL screens */}
          <div className="xl:col-span-2">
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 ${subscriptionStatus.bgColor} rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/10`}>
                    <subscriptionStatus.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{user.name}</h2>
                    <p className={`text-sm ${subscriptionStatus.color} flex items-center mt-1`}>
                      <subscriptionStatus.icon className="w-3 h-3 mr-2" />
                      {subscriptionStatus.text}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.isEmailVerified === true ? (
                    <div className="flex items-center text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                      <FaCheckCircle className="w-3 h-3 mr-1" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
                      <FaTimesCircle className="w-3 h-3 mr-1" />
                      <span className="text-xs font-medium">Unverified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                  <div className="flex items-center text-gray-400 mb-2">
                    <FaEnvelope className="w-4 h-4 mr-2" />
                    <span className="text-sm">Email Address</span>
                  </div>
                  <p className="text-white font-medium truncate">{user.email}</p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                  <div className="flex items-center text-gray-400 mb-2">
                    <FaPhone className="w-4 h-4 mr-2" />
                    <span className="text-sm">Phone Number</span>
                  </div>
                  <p className="text-white font-medium">{user.phone}</p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                  <div className="flex items-center text-gray-400 mb-2">
                    <FaShieldAlt className="w-4 h-4 mr-2" />
                    <span className="text-sm">Account Role</span>
                  </div>
                  <p className="text-white font-medium capitalize">{user.role}</p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                  <div className="flex items-center text-gray-400 mb-2">
                    <FaCalendarAlt className="w-4 h-4 mr-2" />
                    <span className="text-sm">Member Since</span>
                  </div>
                  <p className="text-white font-medium text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="xl:col-span-1">
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 h-fit">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaCrown className="w-5 h-5 mr-2 text-yellow-400" />
                Subscription
              </h3>
              
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${subscriptionStatus.color} ${subscriptionStatus.bgColor}/20`}>
                      {subscriptionStatus.text}
                    </span>
                  </div>
                </div>

                {user.isPremium && (
                  <>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <div className="text-gray-400 text-sm mb-1">Premium Start</div>
                      <div className="text-white font-medium text-sm">
                        {user.premiumStartDate ? new Date(user.premiumStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not set'}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <div className="text-gray-400 text-sm mb-1">Premium End</div>
                      <div className="text-white font-medium text-sm">
                        {user.premiumEndDate ? new Date(user.premiumEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not set'}
                      </div>
                    </div>

                    {user.subscriptionMonths && (
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="text-gray-400 text-sm mb-1">Period</div>
                        <div className="text-white font-medium text-sm">
                          {user.subscriptionMonths} {user.subscriptionMonths === 1 ? 'month' : 'months'}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {user.paymentAmount && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-gray-400 text-sm mb-1">Amount</div>
                    <div className="text-white font-medium">₹{user.paymentAmount}</div>
                  </div>
                )}

                {user.utrNo && (
                  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="text-gray-400 text-sm mb-1">UTR Number</div>
                    <div className="text-white font-medium text-sm">{user.utrNo}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Security & Actions */}
          <div className="xl:col-span-1">
            <div className="space-y-6">
              {/* Security Status */}
              <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaShieldAlt className="w-5 h-5 mr-2 text-green-400" />
                  Security
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center">
                      {user.isActive === true ? (
                        <FaUnlock className="w-4 h-4 text-green-400 mr-3" />
                      ) : (
                        <FaLock className="w-4 h-4 text-red-400 mr-3" />
                      )}
                      <span className="text-white text-sm">Account</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.isActive === true ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'}`}>
                      {user.isActive === true ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center">
                      {user.isEmailVerified === true ? (
                        <FaCheckCircle className="w-4 h-4 text-green-400 mr-3" />
                      ) : (
                        <FaTimesCircle className="w-4 h-4 text-red-400 mr-3" />
                      )}
                      <span className="text-white text-sm">Email</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.isEmailVerified === true ? 'text-green-400 bg-green-400/20' : 'text-red-400 bg-red-400/20'}`}>
                      {user.isEmailVerified === true ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => window.open("https://telegram.me/gocharts", "_blank")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center border border-blue-500/20"
                >
                  <FaPhone className="w-4 h-4 mr-2" />
                  Contact Support
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center border border-red-500/20"
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
          </div>
        </div>

        {/* Session Management Section - Full Width */}
        <div className="mt-8">
          <SessionManager />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
