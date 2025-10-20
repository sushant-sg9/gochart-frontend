import React, { useState, useEffect } from 'react';
import { 
  FaChevronRight, 
  FaChartLine, 
  FaShieldAlt, 
  FaBolt, 
  FaRocket,
  FaUsers, 
  FaGlobe, 
  FaStar, 
  FaArrowUp, 
  FaBars, 
  FaTimes,
  FaTelegram,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUser,
  FaPhone,
  FaUserPlus,
  FaEnvelope,
  FaCheck,
  FaKey
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SessionConflictModal from '../../components/auth/SessionConflictModal';
import { api } from '../../services/api';

interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const LoginPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupStep, setSignupStep] = useState<'details' | 'otp'>('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // Session conflict state
  const [showSessionConflict, setShowSessionConflict] = useState(false);
  const [sessionConflictData, setSessionConflictData] = useState<any>(null);
  const [pendingCredentials, setPendingCredentials] = useState<{email: string, password: string} | null>(null);
  
  const navigate = useNavigate();
  const { login, user, forceLogin, terminateSession } = useUser();
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

  // Timer for OTP resend
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Please enter your full name';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      errors.name = 'Name can only contain letters and spaces';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Please enter your phone number';
    } else if (!/^[\d\-\+\(\)\s]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      errors.password = 'Please enter a password';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showError('Please fill all fields');
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(email, password);
      showSuccess('Login successful!');
      navigate('/analysis');
    } catch (error: any) {
      // Handle session conflict
      if (error.code === 'SESSION_LIMIT_EXCEEDED') {
        setSessionConflictData(error.data);
        setPendingCredentials({ email, password });
        setShowSessionConflict(true);
        showError('Device Limit Reached', error.message);
      } else {
        showError('Login failed', error.message || 'Invalid credentials');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Session conflict handlers
  const handleForceLogin = async () => {
    if (!pendingCredentials) return;
    
    try {
      await forceLogin(pendingCredentials.email, pendingCredentials.password);
      setShowSessionConflict(false);
      setPendingCredentials(null);
      setSessionConflictData(null);
      showSuccess('Login successful!');
      navigate('/analysis');
    } catch (error: any) {
      showError('Force login failed', error.message);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession(sessionId);
      showSuccess('Session terminated successfully');
      
      // Update the session list
      if (sessionConflictData) {
        const updatedSessions = sessionConflictData.activeSessions.filter(
          (session: any) => session.sessionId !== sessionId
        );
        setSessionConflictData({ ...sessionConflictData, activeSessions: updatedSessions });
        
        // If only one session left, allow login
        if (updatedSessions.length < sessionConflictData.maxSessions && pendingCredentials) {
          await login(pendingCredentials.email, pendingCredentials.password);
          setShowSessionConflict(false);
          setPendingCredentials(null);
          setSessionConflictData(null);
          showSuccess('Login successful!');
          navigate('/analysis');
        }
      }
    } catch (error: any) {
      showError('Failed to terminate session', error.message);
    }
  };

  const handleCloseSessionModal = () => {
    setShowSessionConflict(false);
    setPendingCredentials(null);
    setSessionConflictData(null);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSigningUp(true);
    try {
      const response = await api.post('/auth/send-registration-otp', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase()
      });

      if (response.success) {
        setSignupStep('otp');
        showSuccess('OTP sent to your email! Please check your inbox.');
        setOtpTimer(600); // 10 minutes timer
      }
    } catch (error: any) {
      showError('Failed to send OTP', error.message || 'Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      showError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      showError('OTP must be 6 digits');
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      showError('OTP must contain only numbers');
      return;
    }

    setIsSigningUp(true);
    try {
      const response = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        otp: otp
      });

      if (response.success) {
        // Store auth data
        if (response.data?.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        
        showSuccess('Registration successful! Welcome to GoChart!');
        setShowSignupModal(false);
        navigate('/analysis');
      }
    } catch (error: any) {
      showError('Registration failed', error.message || 'Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;

    setIsSigningUp(true);
    try {
      await api.post('/auth/send-registration-otp', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase()
      });
      
      showSuccess('New OTP sent to your email!');
      setOtpTimer(600);
      setOtp('');
    } catch (error: any) {
      showError('Failed to resend OTP', error.message || 'Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const stats = [
    { value: '5+', label: 'Top Technical Charts', icon: FaChartLine },
    { value: '1M+', label: 'Active Analysts', icon: FaUsers },
    { value: '20+', label: 'Top Best Assets', icon: FaGlobe },
    { value: '99.9%', label: 'Data Accuracy', icon: FaShieldAlt }
  ];

  const features = [
    {
      icon: FaChartLine,
      title: 'Advanced Charting Tools',
      description: 'Professional-grade charts with 5+ technical indicators, drawing tools, and customizable layouts for comprehensive market analysis.',
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      icon: FaShieldAlt,
      title: 'Real-Time Market Data',
      description: 'Direct exchange feeds ensure accurate, reliable data sourced from multiple exchanges for trustworthy analysis.',
      gradient: 'from-green-600 to-green-700'
    },
    {
      icon: FaBolt,
      title: 'Lightning-Fast Analysis',
      description: 'Instant chart rendering and real-time data updates to capture every market movement and opportunity.',
      gradient: 'from-indigo-600 to-indigo-700'
    },
    {
      icon: FaRocket,
      title: 'Decision Support System',
      description: 'AI-powered insights, pattern recognition, and analytical tools to support your trading decisions.',
      gradient: 'from-purple-600 to-purple-700'
    }
  ];

  const FloatingCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <div 
      className="animate-float"
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );

  const handleNavigate = () => {
    setShowLoginModal(true);
  };

  const handleContact = () => {
    window.open("https://telegram.me/gocharts", "_blank");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-white overflow-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-gray-800/50 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FaChartLine className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">GoChart</h1>
                    <p className="text-xs text-gray-400">Analysis Platform</p>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={handleContact} className="cursor-pointer bg-white text-blue-600 px-6 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold">
                  Support
                </button>
                <button onClick={handleNavigate} className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold">
                  Start Analysis
                </button>
              </div>

              <button 
                className="cursor-pointer md:hidden text-gray-300"
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
              <button onClick={handleContact} className="cursor-pointer bg-white text-blue-600 px-6 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold">
                Support
              </button>
              <button onClick={handleNavigate} className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-all transform hover:scale-105 font-semibold">
                Start Analysis
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gray-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-6 py-3 bg-gray-800/50 rounded-full backdrop-blur-sm border border-gray-700/50 mb-8">
                  <FaStar className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-gray-300">Trusted by Professional Analysts</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="block text-white">
                    Advanced Trading
                  </span>
                  <span className="block text-blue-500">
                    Analysis Platform
                  </span>
                  <span className="block text-gray-300">
                    Gochart.in
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
                  Experience the power of professional technical analysis with high-quality charts, reliable market data, and advanced analytical tools. All information sourced directly from exchanges.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button onClick={handleNavigate} className="cursor-pointer group bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                  Start Analysis
                  <FaChevronRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Floating Analysis Cards */}
              <div className="relative mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <FloatingCard delay={0}>
                  <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-gray-400 font-medium">BTC/USD Analysis</span>
                      <div className="flex items-center text-green-500">
                        <FaArrowUp className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">Strong Buy</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">$67,234.56</div>
                    <div className="text-sm text-gray-400">RSI: 58.2 • MACD: Bullish</div>
                  </div>
                </FloatingCard>

                <FloatingCard delay={1}>
                  <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-gray-400 font-medium">Market Sentiment</span>
                      <div className="flex items-center text-blue-500">
                        <FaChartLine className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">Bullish</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">78% Buy</div>
                    <div className="text-sm text-gray-400">Fear & Greed: 65 (Greed)</div>
                  </div>
                </FloatingCard>

                <FloatingCard delay={2}>
                  <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-gray-400 font-medium">Active Patterns</span>
                      <FaRocket className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">156</div>
                    <div className="text-sm text-gray-400">Bullish Patterns Detected</div>
                  </div>
                </FloatingCard>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-white">
                Powering Market Analysis
              </h2>
              <p className="text-gray-400 text-lg">Join millions of analysts who trust Gochart.in for reliable market insights</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 transform hover:scale-105 shadow-xl">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 group-hover:bg-blue-700 transition-colors">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 font-medium text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-6 text-white">
                Why Choose Gochart.in?
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Experience professional technical analysis with reliable market data sourced directly from exchanges
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {features.map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-10 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 transform hover:scale-105 h-full shadow-xl">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl mb-8 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-lg">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 border border-gray-700/50 shadow-xl">
              <h2 className="text-4xl font-bold mb-6 text-white">
                Ready to Start Analysis?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join millions of analysts who trust Gochart.in for comprehensive market analysis. Start your technical analysis journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={handleNavigate} className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105">
                  <FaEye className="w-5 h-5 mr-2 inline-block" />
                  Live Analysis
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-800/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FaChartLine className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">GoChart</h1>
                    <p className="text-xs text-gray-400">Analysis Platform</p>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Professional technical analysis platform trusted by millions of analysts worldwide for reliable market insights.
                </p>
                <div className="flex space-x-4">
                  <a href="https://telegram.me/gocharts" target='_blank' className="cursor-pointer w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <FaTelegram className="w-5 h-5 text-gray-400" />
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-6 text-white text-lg">Analysis Tools</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Technical Indicators</a></li>
                  <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Chart Patterns</a></li>
                  <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Market Screener</a></li>
                  <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Price Alerts</a></li>
                  <li><a href="#" className="cursor-pointer hover:text-white transition-colors">Backtesting</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-6 text-white text-lg">Market Data</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Real-time Quotes</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Historical Data</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Market Depth</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Volume Analysis</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Correlation Matrix</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-6 text-white text-lg">Learning</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Trading Academy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Analysis Guides</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Video Tutorials</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Webinars</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Market Reports</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2025 Gochart.in. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </footer>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="cursor-pointer text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
              >
                {isLoggingIn ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <FaChartLine className="w-4 h-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <button 
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/forgot-password');
                }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </button>
              
              <p className="text-gray-400 text-sm">
                New to GoChart? 
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowSignupModal(true);
                  }} 
                  className="text-blue-400 hover:text-blue-300 ml-1"
                >
                  Create your account
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {signupStep === 'details' ? 'Join GoChart' : 'Verify Email'}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {signupStep === 'details' ? 'Create your account' : 'Enter the OTP sent to your email'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSignupModal(false);
                  setSignupStep('details');
                  setOtp('');
                  setOtpTimer(0);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {signupStep === 'details' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
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
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg focus:ring-2 focus:border-transparent text-white placeholder-gray-400 ${
                        fieldErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>
                  )}
                </div>

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
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg focus:ring-2 focus:border-transparent text-white placeholder-gray-400 ${
                        fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </div>

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
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg focus:ring-2 focus:border-transparent text-white placeholder-gray-400 ${
                        fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-3 bg-gray-700/50 border rounded-lg focus:ring-2 focus:border-transparent text-white placeholder-gray-400 ${
                        fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
                  )}
                  {formData.password && !fieldErrors.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength <= 1 ? 'text-red-400' :
                          passwordStrength <= 2 ? 'text-orange-400' :
                          passwordStrength <= 3 ? 'text-yellow-400' :
                          passwordStrength <= 4 ? 'text-blue-400' : 'text-green-400'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FaCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-10 py-3 bg-gray-700/50 border rounded-lg focus:ring-2 focus:border-transparent text-white placeholder-gray-400 ${
                        fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  {isSigningUp ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <FaEnvelope className="w-4 h-4 mr-2" />
                      Send Verification OTP
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCompleteRegistration} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Verification OTP
                  </label>
                  <div className="relative">
                    <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full pl-10 pr-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                      OTP sent to {formData.email}
                    </p>
                    {otpTimer > 0 ? (
                      <span className="text-xs text-blue-400">
                        Expires in {formatTimer(otpTimer)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isSigningUp}
                        className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                      >
                        {isSigningUp ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  {isSigningUp ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <FaUserPlus className="w-4 h-4 mr-2" />
                      Complete Registration
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSignupStep('details')}
                  className="w-full text-blue-400 hover:text-blue-300 py-2 flex items-center justify-center"
                >
                  <FaChevronRight className="w-4 h-4 mr-2 rotate-180" />
                  Back to Details
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account? 
                <button 
                  onClick={() => {
                    setShowSignupModal(false);
                    setShowLoginModal(true);
                  }} 
                  className="text-blue-400 hover:text-blue-300 ml-1"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Session Conflict Modal */}
      {showSessionConflict && sessionConflictData && (
        <SessionConflictModal
          isOpen={showSessionConflict}
          onClose={handleCloseSessionModal}
          activeSessions={sessionConflictData.activeSessions}
          onForceLogin={handleForceLogin}
          onTerminateSession={handleTerminateSession}
          loading={isLoggingIn}
        />
      )}
    </>
  );
};

export default LoginPage;
