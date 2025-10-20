import React, { useState } from 'react';
import { 
  FaTimes, 
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
  FaExclamationTriangle
} from 'react-icons/fa';
import LoadingSpinner from '../ui/LoadingSpinner';

interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  deviceType?: string;
  ipAddress?: string;
}

interface ActiveSession {
  sessionId: string;
  deviceInfo: DeviceInfo;
  lastActivity: string;
  loginTime: string;
}

interface SessionConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessions: ActiveSession[];
  onForceLogin: () => Promise<void>;
  onTerminateSession: (sessionId: string) => Promise<void>;
  loading: boolean;
}

const SessionConflictModal: React.FC<SessionConflictModalProps> = ({
  isOpen,
  onClose,
  activeSessions,
  onForceLogin,
  onTerminateSession,
  loading
}) => {
  const [terminating, setTerminating] = useState<string | null>(null);

  if (!isOpen) return null;

  // Device type icon
  const getDeviceIcon = (deviceType?: string) => {
    if (!deviceType) return <FaDesktop className="w-5 h-5" />;
    switch (deviceType.toLowerCase()) {
      case 'mobile': return <FaMobile className="w-5 h-5" />;
      case 'tablet': return <FaTabletAlt className="w-5 h-5" />;
      default: return <FaDesktop className="w-5 h-5" />;
    }
  };

  // Browser icon
  const getBrowserIcon = (browser?: string) => {
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
  const getPlatformIcon = (platform?: string) => {
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
    return date.toLocaleDateString();
  };

  const handleTerminateSession = async (sessionId: string) => {
    setTerminating(sessionId);
    try {
      await onTerminateSession(sessionId);
    } finally {
      setTerminating(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-2xl border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-orange-500/20 p-3 rounded-xl mr-4">
              <FaExclamationTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Device Limit Reached</h2>
              <p className="text-gray-400">You can only be logged in on 2 devices at once</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Active Sessions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Currently Active Sessions</h3>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div 
                key={session.sessionId} 
                className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-600/50 p-2 rounded-lg">
                      {getDeviceIcon(session.deviceInfo.deviceType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getPlatformIcon(session.deviceInfo.platform)}
                        <span className="text-white font-medium">
                          {session.deviceInfo.platform}{session.deviceInfo.deviceType ? ` • ${session.deviceInfo.deviceType}` : ''}
                        </span>
                        {getBrowserIcon(session.deviceInfo.browser)}
                        <span className="text-gray-300 text-sm">{session.deviceInfo.browser}</span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>Last active: {formatLastActivity(session.lastActivity)}</div>
                        <div>Login time: {new Date(session.loginTime).toLocaleString()}</div>
                        {session.deviceInfo.ipAddress && (
                          <div>IP: {session.deviceInfo.ipAddress}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTerminateSession(session.sessionId)}
                    disabled={terminating === session.sessionId}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    {terminating === session.sessionId ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <FaSignOutAlt className="w-3 h-3" />
                        <span>Sign Out</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onForceLogin}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <span>Continue Login</span>
                <small className="opacity-75">(Sign out oldest session)</small>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500/20 p-1 rounded">
              <FaExclamationTriangle className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Security Notice</p>
              <p className="text-blue-300">
                For security reasons, you can only be signed in on 2 devices simultaneously. 
                You can manually sign out from specific devices or continue login to automatically 
                sign out the oldest session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionConflictModal;