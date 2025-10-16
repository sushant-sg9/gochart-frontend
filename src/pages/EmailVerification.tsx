import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, RefreshCw, Key } from 'lucide-react';
import axios from 'axios';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // Timer for OTP resend
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Initialize timer on component mount
  useEffect(() => {
    if (email) {
      setOtpTimer(600); // 10 minutes
    }
  }, [email]);

  const verifyEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !otp) {
      setError('Please enter both email and OTP');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/v1/auth/verify-email-otp', {
        email: email,
        otp: otp
      });

      if (response.data.success) {
        setSuccess('Email verified successfully! Redirecting to dashboard...');
        
        // Store auth data
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/analysis', { replace: true });
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Email verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0 || !email) return;

    setIsResending(true);
    setError('');
    
    try {
      const response = await axios.post('/api/v1/auth/resend-verification', {
        email: email
      });

      if (response.data.success) {
        setSuccess('New verification OTP sent to your email!');
        setOtpTimer(600); // Reset 10-minute timer
        setOtp(''); // Clear current OTP
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to resend verification OTP');
    } finally {
      setIsResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            Enter the OTP sent to your email
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={verifyEmailOTP} className="space-y-6">
          {!location.state?.email && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification OTP
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>
            {email && (
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  OTP sent to {email}
                </p>
                {otpTimer > 0 ? (
                  <span className="text-xs text-blue-600">
                    Expires in {formatTimer(otpTimer)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {isResending ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Email
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Back to Login
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;