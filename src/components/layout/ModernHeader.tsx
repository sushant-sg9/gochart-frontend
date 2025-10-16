import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaChartLine, 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaStar,
  FaClock,
  FaCalendarAlt,
  FaBars,
  FaTimes,
  FaCrown,
  FaShieldAlt
} from "react-icons/fa";
import { TrendingUp } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useTimeFrameContext } from "../../context/ChartContext";
import { useToast } from "../../context/ToastContext";
import { ModernSubscriptionModal } from "../subscription/ModernSubscriptionModal";
import { ModernChartSettings } from "../chart/ModernChartSettings";

interface ModernHeaderProps {
  onToggleNav: () => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({ onToggleNav }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showChartSettings, setShowChartSettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user } = useUser();
  const { getTimeFrameLabel, timeFrame } = useTimeFrameContext();
  const { success: showSuccess } = useToast();
  const navigate = useNavigate();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);



  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSubscriptionStatus = () => {
    if (!user) return { text: "Loading...", color: "text-gray-400", bgColor: "bg-gray-600" };
    
    if (user.isPremium && user.status === "paid") {
      return { text: "Premium Active", color: "text-green-300", bgColor: "bg-green-600" };
    } else if (user.status === "pending") {
      return { text: "Pending Approval", color: "text-yellow-300", bgColor: "bg-yellow-600" };
    } else {
      return { text: "Free User", color: "text-blue-300", bgColor: "bg-blue-600" };
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <>
      <header className="sticky top-0 z-[9997] bg-gradient-to-r from-slate-900/95 via-gray-900/95 to-slate-900/95 backdrop-blur-xl border-b border-gray-700/30 shadow-2xl">
        <div className="mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Logo & Navigation */}
            <div className="flex items-center space-x-6">
              <Link to={user ? "/analysis" : "/"} className="group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl blur-sm opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                      <FaChartLine className="w-7 h-7 text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                      GoChart
                    </h1>
                    <p className="text-sm text-gray-300 font-medium tracking-wide">Professional Analysis</p>
                  </div>
                </div>
              </Link>

              {/* Market Analysis Navigation Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleNav();
                }}
                className="group relative bg-gradient-to-r from-gray-800/90 to-gray-700/90 hover:from-gray-700/90 hover:to-gray-600/90 border border-gray-600/40 hover:border-gray-500/60 text-white px-5 py-3 rounded-xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                title="Analysis Markets"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <TrendingUp size={20} className="text-cyan-400 group-hover:text-cyan-300 transition-colors drop-shadow-sm" />
                  <span className="hidden lg:inline text-sm font-semibold tracking-wide">Markets</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse shadow-lg"></div>
              </button>
            </div>

            {/* Desktop Center - Time & Date Cards */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Date Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-xl blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-xl rounded-xl px-4 py-3 border border-gray-600/40 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="w-4 h-4 text-blue-400 drop-shadow-sm" />
                    <div className="text-sm text-white font-semibold tracking-wide">
                      {formatDate(currentTime)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-600/30 rounded-xl blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-xl rounded-xl px-4 py-3 border border-gray-600/40 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <FaClock className="w-4 h-4 text-green-400 drop-shadow-sm" />
                    <div className="text-sm text-white font-bold font-mono tracking-wider">
                      {formatTime(currentTime)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Frame Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/40 to-purple-600/40 rounded-xl blur opacity-70 group-hover:opacity-90 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-indigo-800/90 to-purple-800/90 backdrop-blur-xl rounded-xl px-4 py-3 border border-indigo-500/50 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <FaChartLine className="w-4 h-4 text-indigo-300 drop-shadow-sm" />
                    <div className="text-sm text-white font-semibold tracking-wide">
                      {getTimeFrameLabel(timeFrame)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Right - User Actions */}
            <div className="hidden md:flex items-center space-x-5">
              {/* Admin Button */}
              {user?.role === "admin" && (
                <Link to="/admin" className="cursor-pointer">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-indigo-600/40 rounded-xl blur opacity-60 group-hover:opacity-90 transition-opacity"></div>
                    <button className="relative bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-500/90 hover:to-indigo-500/90 text-white px-5 py-3 rounded-xl transition-all transform hover:scale-105 font-semibold shadow-xl flex items-center backdrop-blur-sm border border-purple-500/30 cursor-pointer">
                      <FaShieldAlt className="w-4 h-4 mr-2 drop-shadow-sm" />
                      <span className="tracking-wide">Admin</span>
                    </button>
                  </div>
                </Link>
              )}

              {/* Premium/Settings Button */}
              {!user?.isPremium ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/50 to-orange-500/50 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="relative bg-gradient-to-r from-amber-500/90 to-orange-500/90 hover:from-amber-400/90 hover:to-orange-400/90 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 font-bold shadow-2xl flex items-center backdrop-blur-sm border border-amber-400/40 cursor-pointer"
                  >
                    <FaStar className="w-4 h-4 mr-2 drop-shadow-sm animate-pulse" />
                    <span className="tracking-wide">Premium</span>
                  </button>
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-600/40 to-slate-600/40 rounded-xl blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  <button
                    onClick={() => setShowChartSettings(true)}
                    className="relative bg-gradient-to-r from-gray-700/90 to-slate-700/90 hover:from-gray-600/90 hover:to-slate-600/90 text-white px-5 py-3 rounded-xl transition-all transform hover:scale-105 font-semibold shadow-xl flex items-center backdrop-blur-sm border border-gray-600/40 cursor-pointer"
                  >
                    <FaCog className="w-4 h-4 mr-2 drop-shadow-sm" />
                    <span className="tracking-wide">Settings</span>
                  </button>
                </div>
              )}

              {/* Profile Button */}
              <Link to="/analysis/profile" className="cursor-pointer">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-600/30 rounded-2xl blur opacity-60 group-hover:opacity-90 transition-all duration-300"></div>
                  <button className="relative bg-gradient-to-br from-gray-800/95 to-gray-700/95 hover:from-gray-700/95 hover:to-gray-600/95 backdrop-blur-xl rounded-xl p-2 border border-gray-600/40 hover:border-gray-500/60 shadow-xl transition-all transform hover:scale-105 group-hover:shadow-cyan-500/20 cursor-pointer">
                    <div className="relative">
                      <div className={`w-10 h-10 ${subscriptionStatus.bgColor} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {user?.isPremium ? (
                          <FaCrown className="w-5 h-5 text-white drop-shadow-sm" />
                        ) : (
                          <FaUser className="w-5 h-5 text-white drop-shadow-sm" />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                    </div>
                  </button>
                </div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600/30 to-slate-600/30 rounded-xl blur opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative bg-gradient-to-br from-gray-800/90 to-gray-700/90 hover:from-gray-700/90 hover:to-gray-600/90 text-white p-3 rounded-xl border border-gray-600/40 hover:border-gray-500/60 shadow-xl backdrop-blur-sm transition-all transform hover:scale-105 cursor-pointer"
              >
                {isMobileMenuOpen ? <FaTimes className="w-5 h-5 drop-shadow-sm" /> : <FaBars className="w-5 h-5 drop-shadow-sm" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700/30 backdrop-blur-xl bg-gradient-to-b from-gray-900/95 to-slate-900/95 py-6">
              {/* Mobile Time & Date */}
              <div className="flex justify-center space-x-3 mb-6 mx-4">
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-xl rounded-xl p-3 border border-gray-600/40 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="w-3 h-3 text-blue-400 drop-shadow-sm" />
                    <div className="text-xs text-white font-semibold">{formatDate(currentTime)}</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-xl rounded-xl p-3 border border-gray-600/40 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <FaClock className="w-3 h-3 text-green-400 drop-shadow-sm" />
                    <div className="text-xs text-white font-bold font-mono">{formatTime(currentTime)}</div>
                  </div>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="space-y-4 mx-4">
                <Link to="/analysis/profile" className="block cursor-pointer">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-xl blur opacity-60 group-hover:opacity-90 transition-opacity"></div>
                    <button className="relative w-full bg-gradient-to-br from-gray-800/95 to-gray-700/95 backdrop-blur-xl text-white py-4 rounded-xl font-bold flex items-center justify-center border border-gray-600/40 shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                      <FaUser className="w-5 h-5 mr-3 drop-shadow-sm" />
                      <span className="tracking-wide">View Profile</span>
                    </button>
                  </div>
                </Link>

                {user?.role === "admin" && (
                  <Link to="/admin" className="block cursor-pointer">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-indigo-600/30 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <button className="relative w-full bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white py-3 rounded-xl font-bold flex items-center justify-center backdrop-blur-sm border border-purple-500/30 shadow-xl cursor-pointer">
                        <FaShieldAlt className="w-4 h-4 mr-2 drop-shadow-sm" />
                        <span className="tracking-wide">Admin Dashboard</span>
                      </button>
                    </div>
                  </Link>
                )}

                {!user?.isPremium ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/40 to-orange-500/40 rounded-xl blur opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    <button
                      onClick={() => setShowSubscriptionModal(true)}
                      className="relative w-full bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white py-3 rounded-xl font-bold flex items-center justify-center backdrop-blur-sm border border-amber-400/40 shadow-xl cursor-pointer"
                    >
                      <FaStar className="w-4 h-4 mr-2 drop-shadow-sm animate-pulse" />
                      <span className="tracking-wide">Upgrade to Premium</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-600/30 to-slate-600/30 rounded-xl blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <button
                      onClick={() => setShowChartSettings(true)}
                      className="relative w-full bg-gradient-to-r from-gray-700/90 to-slate-700/90 text-white py-3 rounded-xl font-bold flex items-center justify-center backdrop-blur-sm border border-gray-600/40 shadow-xl cursor-pointer"
                    >
                      <FaCog className="w-4 h-4 mr-2 drop-shadow-sm" />
                      <span className="tracking-wide">Analysis Settings</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <ModernSubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
      
      {user?.isPremium && (
        <ModernChartSettings
          isOpen={showChartSettings}
          onClose={() => setShowChartSettings(false)}
        />
      )}
    </>
  );
};