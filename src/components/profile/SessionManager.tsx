import React, { useState, useEffect } from 'react';
import { 
  FaDesktop, 
  FaMobile, 
  FaTabletAlt, 
  FaChrome,
  FaFirefox,
  FaSafari,
  FaEdge,
  FaOpera,
  FaGlobe,
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
  FaSignOutAlt,
  FaShieldAlt,
  FaExclamationTriangle,
  FaSync,
  FaClock,
  FaMapMarkerAlt,
  FaBan
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  deviceType: string;
  ipAddress?: string;
}

interface SessionData {
  sessionId: string;
  deviceInfo: DeviceInfo;
  location: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  lastActivity: string;
  loginTime: string;
  isOnline: boolean;
  isCurrent: boolean;
}

const SessionManager: React.FC = () => {
  const { getActiveSessions, terminateSession } = useUser();
  const { success: showSuccess, error: showError } = useToast();
  
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminating, setTerminating] = useState<string | null>(null);
  const [terminatingAll, setTerminatingAll] = useState(false);

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const sessionData = await getActiveSessions();
      setSessions(sessionData);
    } catch (error: any) {
      showError('Failed to load sessions', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Device type icon
  const getDeviceIcon = (deviceType: string) => {
    if (!deviceType) return <FaDesktop className="w-5 h-5" />;
    switch (deviceType.toLowerCase()) {
      case 'mobile': return <FaMobile className="w-5 h-5" />;
      case 'tablet': return <FaTabletAlt className="w-5 h-5" />;
      default: return <FaDesktop className="w-5 h-5" />;
    }
  };

  // Browser icon
  const getBrowserIcon = (browser: string) => {
    if (!browser) return <FaGlobe className="w-4 h-4 text-gray-500" />;
    switch (browser.toLowerCase()) {
      case 'chrome': return <FaChrome className="w-4 h-4 text-yellow-500" />;
      case 'firefox': return <FaFirefox className="w-4 h-4 text-orange-500" />;
      case 'safari': return <FaSafari className="w-4 h-4 text-blue-500" />;
      case 'edge': return <FaEdge className="w-4 h-4 text-blue-600" />;
      case 'opera': return <FaOpera className="w-4 h-4 text-red-500" />;
      default: return <FaGlobe className="w-4 h-4 text-gray-500" />;
    }
  };

  // Platform icon
  const getPlatformIcon = (platform: string) => {
    if (!platform) return <FaGlobe className="w-4 h-4 text-gray-500" />;
    switch (platform.toLowerCase()) {
      case 'windows': return <FaWindows className="w-4 h-4 text-blue-500" />;
      case 'macos': return <FaApple className="w-4 h-4 text-gray-600" />;
      case 'linux': return <FaLinux className="w-4 h-4 text-yellow-600" />;
      case 'android': return <FaAndroid className="w-4 h-4 text-green-500" />;
      case 'ios': return <FaApple className="w-4 h-4 text-gray-600" />;
      default: return <FaGlobe className="w-4 h-4 text-gray-500" />;
    }
  };

  // Format last activity
  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)} days ago`;
    return date.toLocaleDateString();
  };

  // Terminate specific session
  const handleTerminateSession = async (sessionId: string, sessionName: string) => {
    if (confirm(`Are you sure you want to sign out from "${sessionName}"?`)) {
      setTerminating(sessionId);
      try {
        await terminateSession(sessionId);
        showSuccess('Session terminated successfully');
        
        // Remove from local state
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      } catch (error: any) {
        showError('Failed to terminate session', error.message);
      } finally {
        setTerminating(null);
      }
    }
  };

  // Terminate all other sessions
  const handleTerminateAllOthers = async () => {
    const otherSessions = sessions.filter(s => !s.isCurrent);
    if (otherSessions.length === 0) {
      showError('No other sessions to terminate');
      return;
    }

    if (confirm(`Are you sure you want to sign out from all ${otherSessions.length} other devices?`)) {
      setTerminatingAll(true);
      try {
        // Terminate all other sessions individually
        const promises = otherSessions.map(session => terminateSession(session.sessionId));
        await Promise.all(promises);
        
        showSuccess(`Successfully signed out from ${otherSessions.length} devices`);
        
        // Update local state - keep only current session
        setSessions(prev => prev.filter(s => s.isCurrent));
      } catch (error: any) {
        showError('Failed to terminate sessions', error.message);
      } finally {
        setTerminatingAll(false);
      }
    }
  };

  // Get device display name
  const getDeviceDisplayName = (session: SessionData) => {
    const { platform, deviceType, browser } = session.deviceInfo || {};
    return `${platform || 'Unknown'} ${deviceType || 'Device'} • ${browser || 'Browser'}`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FaShieldAlt className="w-5 h-5 mr-2 text-blue-400" />
          Active Sessions ({sessions.length}/2)
        </h3>
        <button
          onClick={loadSessions}
          disabled={loading}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          title="Refresh sessions"
        >
          <FaSync className={`w-4 h-4 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FaBan className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p>No active sessions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div 
              key={session.sessionId} 
              className={`p-4 rounded-xl border transition-all ${
                session.isCurrent 
                  ? 'bg-blue-900/30 border-blue-600/50' 
                  : 'bg-gray-700/30 border-gray-600/30 hover:border-gray-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {/* Device Icon */}
                  <div className={`p-2 rounded-lg ${
                    session.isCurrent ? 'bg-blue-600/20' : 'bg-gray-600/50'
                  }`}>
                    {getDeviceIcon(session.deviceInfo.deviceType)}
                  </div>

                  {/* Session Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getPlatformIcon(session.deviceInfo.platform)}
                      <span className="text-white font-medium">
                        {getDeviceDisplayName(session)}
                      </span>
                      {getBrowserIcon(session.deviceInfo.browser)}
                      
                      {/* Current Session Badge */}
                      {session.isCurrent && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          Current
                        </span>
                      )}
                      
                      {/* Online Status */}
                      <div className={`w-2 h-2 rounded-full ${
                        session.isOnline ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                    </div>

                    {/* Session Info */}
                    <div className="text-sm text-gray-400 space-y-1">
                      <div className="flex items-center">
                        <FaClock className="w-3 h-3 mr-2" />
                        <span>Last active: {formatLastActivity(session.lastActivity)}</span>
                      </div>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="w-3 h-3 mr-2" />
                        <span>Login: {new Date(session.loginTime).toLocaleString()}</span>
                      </div>
                      {session.deviceInfo.ipAddress && (
                        <div className="flex items-center">
                          <FaGlobe className="w-3 h-3 mr-2" />
                          <span>IP: {session.deviceInfo.ipAddress}</span>
                        </div>
                      )}
                      {session.location.country && (
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="w-3 h-3 mr-2" />
                          <span>
                            {session.location.city && `${session.location.city}, `}
                            {session.location.country}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!session.isCurrent && (
                  <button
                    onClick={() => handleTerminateSession(
                      session.sessionId, 
                      getDeviceDisplayName(session)
                    )}
                    disabled={terminating === session.sessionId || terminatingAll}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 min-w-[90px] justify-center"
                  >
                    {terminating === session.sessionId ? (
                      <LoadingSpinner size="xs" />
                    ) : (
                      <>
                        <FaSignOutAlt className="w-3 h-3" />
                        <span>Sign Out</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        {sessions.filter(s => !s.isCurrent).length > 0 && (
          <button
            onClick={handleTerminateAllOthers}
            disabled={terminatingAll || terminating !== null}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {terminatingAll ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <FaSignOutAlt className="w-4 h-4" />
                <span>Sign Out All Other Devices ({sessions.filter(s => !s.isCurrent).length})</span>
              </>
            )}
          </button>
        )}

        {/* Security Notice */}
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500/20 p-1 rounded">
              <FaExclamationTriangle className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Security Notice</p>
              <p className="text-blue-300">
                You can be signed in on maximum 2 devices simultaneously. 
                If you don't recognize a device, sign it out immediately and change your password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManager;