import React, { useState, useEffect } from 'react';
import { 
  FaChevronRight, 
  FaChartLine, 
  FaShieldAlt, 
  FaBolt, 
  FaBars, 
  FaTimes,
  FaLock,
  FaUser,
  FaPhone,
  FaUserPlus,
  FaEnvelope,
  FaCheck
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const SignupPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const navigate = useNavigate();
  const { register, user } = useUser();
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/analysis');
    }
  }, [user, navigate]);

  // Password strength checker
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showError('Please enter your full name');
      return false;
    }
    
    if (!formData.email.trim()) {
      showError('Please enter your email address');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.phone.trim()) {
      showError('Please enter your phone number');
      return false;
    }
    
    if (!/^[\d\-\+\(\)\s]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      showError('Please enter a valid phone number');
      return false;
    }
    
    if (!formData.password) {
      showError('Please enter a password');
      return false;
    }
    
    if (formData.password.length < 8) {
      showError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSigningUp(true);
    try {
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password
      });
      
      // Check if email verification is required
      if (response?.requiresEmailVerification) {
        showSuccess('Account created successfully! Please verify your email with the OTP sent to your inbox.');
        // Navigate to email verification page with email
        navigate('/verify-email', { state: { email: formData.email.trim().toLowerCase() } });
      } else {
        showSuccess('Account created successfully! Welcome to GoChart!');
        navigate('/analysis');
      }
    } catch (error: any) {
      showError('Registration failed', error.message || 'Failed to create account');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleNavigate = () => {
    setShowSignupModal(true);
  };

  const handleContact = () => {
    window.open("https://telegram.me/gocharts", "_blank");
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Excellent';
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-white overflow-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-gray-800/50 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FaChartLine className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">GoChart</h1>
                    <p className="text-xs text-gray-400">Analysis Platform</p>
                  </div>
                </div>
              </Link>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <button onClick={handleContact} className="bg-white text-blue-600 px-6 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold">
                  Support
                </button>
                <button onClick={handleNavigate} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold">
                  Join Now
                </button>
              </div>

              <button 
                className="md:hidden text-gray-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-lg md:hidden">
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <Link to="/" className="text-gray-300 hover:text-white text-xl">
                Sign In
              </Link>
              <button onClick={handleContact} className="bg-white text-blue-600 px-6 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold">
                Support
              </button>
              <button onClick={handleNavigate} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold">
                Join Now
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-6 py-3 bg-emerald-900/30 rounded-full backdrop-blur-sm border border-emerald-700/50 mb-8">
                  <FaUserPlus className="w-4 h-4 text-emerald-400 mr-2" />
                  <span className="text-sm font-medium text-emerald-300">Join Thousands of Pro Analysts</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="block text-white">
                    Start Your Trading
                  </span>
                  <span className="block text-emerald-500">
                    Analysis Journey
                  </span>
                  <span className="block text-gray-300">
                    Today
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
                  Join GoChart and unlock professional technical analysis tools, real-time market data, and advanced charting capabilities. Create your account in minutes and start analyzing like a pro.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button onClick={handleNavigate} className="group bg-emerald-600 hover:bg-emerald-700 px-10 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                  Create Free Account
                  <FaChevronRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                </button>
                <Link to="/" className="group border border-gray-600 hover:border-gray-500 px-10 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105">
                  Already have an account?
                </Link>
              </div>

              {/* Benefits Cards */}
              <div className="relative mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-xl">
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-lg mb-4 mx-auto">
                    <FaChartLine className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Professional Tools</h3>
                  <p className="text-gray-400">Advanced charting with 5+ technical indicators and drawing tools</p>
                </div>

                <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-xl">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4 mx-auto">
                    <FaBolt className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Real-Time Data</h3>
                  <p className="text-gray-400">Live market data directly from exchanges for accurate analysis</p>
                </div>

                <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-xl">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mb-4 mx-auto">
                    <FaShieldAlt className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Secure Platform</h3>
                  <p className="text-gray-400">Bank-level security to protect your data and analysis</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2025 Gochart.in. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <Link to="/" className="hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <button
                onClick={() => setShowSignupModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Create a strong password"
                    required
                  />
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Password Strength</span>
                      <span className="text-white">{getPasswordStrengthText()}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Confirm your password"
                    required
                  />
                  {formData.confirmPassword && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {formData.password === formData.confirmPassword ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                {isSigningUp ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <FaUserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account? 
                <Link to="/" className="text-emerald-400 hover:text-emerald-300 ml-1">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignupPage;