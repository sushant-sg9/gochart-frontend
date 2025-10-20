const production = false;

const getApiBaseUrl = () => {
  if (production) {
    return import.meta.env.VITE_PRODUCTION_API_BASE_URL || 'https://mychart-backend-blush.vercel.app/api/v1';
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    AUTH: {
      SIGN_IN: '/auth/login',
      SIGN_UP: '/auth/register',
      FORGOT_PASSWORD: '/auth/forgot-password',
    },
    USER: {
      BASE: '/user',
      PAYMENT: '/user/payment',
    },
    ADMIN: {
      BASE: '/admin',
      USER_STATUS: '/admin/userstatus',
      PAYMENT_INFO: '/admin/payment-info', // Admin only
      PAYMENT_INFO_PUBLIC: '/admin/payment-info/public/all', // Public access
      ONLINE_USERS: '/admin/getOnlineUsers',
      RESET_PASSWORD: '/admin/reset-password',
      UPDATE_SUBSCRIPTION: '/admin/change-sub-months',
      UPDATE_PAYMENT_INFO: '/admin/update-payment-info',
      CREATE_PAYMENT_INFO: '/admin/create-payment-info',
      DELETE_PAYMENT_INFO: '/admin/payment-info'
    }
  }
};

// Python API Configuration for Quotex data
export const PYTHON_API_CONFIG = {
  BASE_URL: import.meta.env.VITE_PYTHON_API_BASE_URL || 'http://127.0.0.1:5000/api',
  ENDPOINTS: {
    HEALTH: '/health',
    CONNECT: '/connect',
    OTP: '/otp',
    EMAIL_CONFIG: '/email-config',
    EURUSD_CANDLES: '/eurusd/candles',
    EURUSD_REALTIME: '/eurusd/realtime',
    USDCAD_CANDLES: '/usdcad/candles',
    USDCAD_REALTIME: '/usdcad/realtime',
    USDINR_CANDLES: '/usdinr/candles',
    USDINR_REALTIME: '/usdinr/realtime',
    EURCAD_CANDLES: '/eurcad/candles',
    EURCAD_REALTIME: '/eurcad/realtime',
    ETCUSD_CANDLES: '/etcusd/candles',
    ETCUSD_REALTIME: '/etcusd/realtime',
    BCHUSD_CANDLES: '/bchusd/candles',
    BCHUSD_REALTIME: '/bchusd/realtime'
  }
};

export const EXTERNAL_URLS = {
  TELEGRAM: import.meta.env.VITE_TELEGRAM_URL || 'https://telegram.me/gocharts',
};

export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getApiUrl = (category: keyof typeof API_CONFIG.ENDPOINTS, endpoint: string, id?: string) => {
  const categoryEndpoints = API_CONFIG.ENDPOINTS[category] as any;
  if (!categoryEndpoints || !categoryEndpoints[endpoint]) {
    throw new Error(`Invalid API endpoint: ${category}.${endpoint}`);
  }
  let url = buildApiUrl(categoryEndpoints[endpoint]);
  if (id && endpoint === 'DELETE_PAYMENT_INFO') {
    url += `/${id}`;
  }
  return url;
};

export const buildPythonApiUrl = (endpoint: string) => {
  return `${PYTHON_API_CONFIG.BASE_URL}${endpoint}`;
};

export const getPythonApiUrl = (endpoint: keyof typeof PYTHON_API_CONFIG.ENDPOINTS) => {
  const endpointPath = PYTHON_API_CONFIG.ENDPOINTS[endpoint];
  if (!endpointPath) {
    throw new Error(`Invalid Python API endpoint: ${endpoint}`);
  }
  return buildPythonApiUrl(endpointPath);
};

export const API_BASE_URL = API_CONFIG.BASE_URL;
export const PYTHON_API_BASE_URL = PYTHON_API_CONFIG.BASE_URL;

export default API_CONFIG;