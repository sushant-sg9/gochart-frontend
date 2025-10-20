import React, { useState, useEffect } from "react";
import { 
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Key
} from "lucide-react";
import { PYTHON_API_CONFIG } from "../../config/apiConfig";
import { useToast } from "../../context/ToastContext";

interface ConnectionStatus {
  connected: boolean;
  message?: string;
  timestamp?: string;
}

const AdminQuotexConnection: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [lastChecked, setLastChecked] = useState<string>("");
  const { success, error } = useToast();

  // Check connection status
  const checkConnectionStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${PYTHON_API_CONFIG.BASE_URL}${PYTHON_API_CONFIG.ENDPOINTS.HEALTH}`);
      const data = await response.json();
      
      setConnectionStatus({
        connected: data.connected || false,
        message: data.status,
        timestamp: data.timestamp
      });
      setLastChecked(new Date().toLocaleString());
    } catch (err) {
      console.error("Error checking connection:", err);
      setConnectionStatus({ 
        connected: false, 
        message: "API service unavailable" 
      });
      error("Failed to check connection status");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize connection
  const connectToQuotex = async () => {
    setIsConnecting(true);
    setOtpRequired(false);
    
    try {
      const response = await fetch(`${PYTHON_API_CONFIG.BASE_URL}${PYTHON_API_CONFIG.ENDPOINTS.CONNECT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        success("Connected to Quotex successfully!");
        setConnectionStatus({ connected: true, message: data.message });
        setOtpRequired(false);
      } else {
        // Check if OTP is required - check both error and message fields
        const errorMsg = data.error || data.message || "";
        if (data.requires_otp || errorMsg.toLowerCase().includes("otp")) {
          setOtpRequired(true);
          error("OTP required for login - check your email");
        } else {
          error(errorMsg || "Connection failed");
        }
      }
    } catch (err) {
      console.error("Connection error:", err);
      error("Failed to connect to Quotex API");
    } finally {
      setIsConnecting(false);
    }
  };

  // Submit OTP
  const submitOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsConnecting(true);
    
    try {
      const response = await fetch(`${PYTHON_API_CONFIG.BASE_URL}${PYTHON_API_CONFIG.ENDPOINTS.OTP}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: otpCode }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        success("OTP verified successfully!");
        setOtpCode("");
        // Retry connection after OTP with a small delay
        setTimeout(() => {
          connectToQuotex();
        }, 2000); // 2 seconds to ensure OTP is processed
      } else {
        error(data.error || "OTP verification failed");
      }
    } catch (err) {
      console.error("OTP submission error:", err);
      error("Failed to submit OTP");
    } finally {
      setIsConnecting(false);
    }
  };

  // Check status on component mount
  useEffect(() => {
    checkConnectionStatus();
    
    // Set up periodic status check every 30 seconds
    const interval = setInterval(checkConnectionStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white mb-2">
          Quotex API Connection
        </h1>
        <p className="text-slate-400">
          Manage the connection to Quotex API for chart data services
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Connection Status
          </h2>
          <button
            onClick={checkConnectionStatus}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            {connectionStatus.connected ? (
              <>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-green-400 font-medium">Connected</span>
                  <p className="text-slate-400 text-sm">
                    Quotex API is connected and ready
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-red-400 font-medium">Disconnected</span>
                  <p className="text-slate-400 text-sm">
                    {connectionStatus.message || "API connection not established"}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Last Checked */}
          {lastChecked && (
            <p className="text-slate-500 text-sm">
              Last checked: {lastChecked}
            </p>
          )}

          {/* Connection Actions */}
          <div className="pt-4 border-t border-slate-800">
            {!connectionStatus.connected && (
              <button
                onClick={connectToQuotex}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
                {isConnecting ? "Connecting..." : "Connect to Quotex"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* OTP Input Card */}
      {otpRequired && (
        <div className="bg-slate-900 rounded-xl border border-yellow-500/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">
              OTP Verification Required
            </h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-slate-300">
              Please enter the 6-digit OTP code sent to your email to complete the login process.
            </p>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                maxLength={6}
                disabled={isConnecting}
              />
              <button
                onClick={submitOtp}
                disabled={isConnecting || otpCode.length !== 6}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                Verify OTP
              </button>
            </div>
            
            <p className="text-slate-500 text-sm">
              The OTP will expire in 5 minutes. Check your email inbox and spam folder.
            </p>
          </div>
        </div>
      )}

      {/* Information Card */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-3">
          How It Works
        </h2>
        <div className="space-y-2 text-slate-300">
          <p>• The Quotex API connection is shared across all users</p>
          <p>• Only admin can manage the connection status</p>
          <p>• Once connected, all users can view Quotex charts without authentication</p>
          <p>• If disconnected, OTP verification may be required to reconnect</p>
          <p>• Connection status is automatically monitored every 30 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default AdminQuotexConnection;