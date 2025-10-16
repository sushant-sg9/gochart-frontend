import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AdminRoute } from "../components/auth/AdminRoute";
import { MainLayout } from "../components/layout/MainLayout";
import { AdminLayout } from "../components/layout/AdminLayout";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import EmailVerification from "../pages/EmailVerification";
import ForgotPassword from "../pages/ForgotPassword";

// User Pages
import HomePage from "../pages/user/HomePage";
import ProfilePage from "../pages/user/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";

// Symbol Pages - Forex
import EURUSDPage from "../pages/symbols/forex/EURUSDPage";
import GBPUSDPage from "../pages/symbols/forex/GBPUSDPage";
import EURGBPPage from "../pages/symbols/forex/EURGBPPage";
import USDCADPage from "../pages/symbols/forex/USDCADPage";
import USDJPYPage from "../pages/symbols/forex/USDJPYPage";
import CADJPYPage from "../pages/symbols/forex/CADJPYPage";
import AUDUSDPage from "../pages/symbols/forex/AUDUSDPage";
import GBPJPYPage from "../pages/symbols/forex/GBPJPYPage";
import EURJPYPage from "../pages/symbols/forex/EURJPYPage";

// Symbol Pages - Crypto
import BTCUSDPage from "../pages/symbols/crypto/BTCUSDPage";
import BTCUSDTPage from "../pages/symbols/crypto/BTCUSDTPage";
import XAUUSDPage from "../pages/symbols/crypto/XAUUSDPage";
import BITCOINPage from "../pages/symbols/crypto/BITCOINPage";
import CAKEUSDTPage from "../pages/symbols/crypto/CAKEUSDTPage";
import ETHUSDTPage from "../pages/symbols/crypto/ETHUSDTPage";
import DOGEUSDTPage from "../pages/symbols/crypto/DOGEUSDTPage";

// Symbol Pages - Futures
import ESPage from "../pages/symbols/futures/ESPage";
import NIFTY50Page from "../pages/symbols/futures/NIFTY50Page";
import GOLDFUTUREPage from "../pages/symbols/futures/GOLDFUTUREPage";
import BANKNIFTYPage from "../pages/symbols/futures/BANKNIFTYPage";
import FINNIFTYPage from "../pages/symbols/futures/FINNIFTYPage";
import SENSEXPage from "../pages/symbols/futures/SENSEXPage";

// Symbol Pages - Stocks
import TataMotorsPage from "../pages/symbols/stocks/TataMotorsPage";
import ReliancePage from "../pages/symbols/stocks/ReliancePage";
import TataSteelPage from "../pages/symbols/stocks/TataSteelPage";
import HavellsPage from "../pages/symbols/stocks/HavellsPage";
import BajajFinancePage from "../pages/symbols/stocks/BajajFinancePage";

// Symbol Pages - Quotex
import QuotexEURUSDPage from "../pages/symbols/quotex/QuotexEURUSDPage";
import QuotexUSDCADPage from "../pages/symbols/quotex/QuotexUSDCADPage";
import QuotexUSDINRPage from "../pages/symbols/quotex/QuotexUSDINRPage";
import QuotexEURCADPage from "../pages/symbols/quotex/QuotexEURCADPage";
import QuotexETCUSDPage from "../pages/symbols/quotex/QuotexETCUSDPage";
import QuotexBCHUSDPage from "../pages/symbols/quotex/QuotexBCHUSDPage";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUserTable from "../pages/admin/AdminUserTable";
import AdminRequestUser from "../pages/admin/AdminRequestUser";
import AdminUpdatePayment from "../pages/admin/AdminUpdatePayment";
import AdminResetPassword from "../pages/admin/AdminResetPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/verify-email",
    element: <EmailVerification />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/analysis",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <MainLayout />,
        children: [
          // Analysis Home
          {
            index: true,
            element: <HomePage />,
          },
          
          // Profile Page
          {
            path: "profile",
            element: <ProfilePage />,
          },
          
          // Forex Routes
          {
            path: "eur-usd",
            element: <EURUSDPage />,
          },
          {
            path: "gbp-usd", 
            element: <GBPUSDPage />,
          },
          {
            path: "eur-gbp",
            element: <EURGBPPage />,
          },
          {
            path: "usd-cad",
            element: <USDCADPage />,
          },
          {
            path: "usd-jpy",
            element: <USDJPYPage />,
          },
          {
            path: "cad-jpy",
            element: <CADJPYPage />,
          },
          {
            path: "aud-usd",
            element: <AUDUSDPage />,
          },
          {
            path: "gbp-jpy",
            element: <GBPJPYPage />,
          },
          {
            path: "eur-jpy",
            element: <EURJPYPage />,
          },

          // Crypto Routes
          {
            path: "btc-usd",
            element: <BTCUSDPage />,
          },
          {
            path: "btc-usdt",
            element: <BTCUSDTPage />,
          },
          {
            path: "xau-usd",
            element: <XAUUSDPage />,
          },
          {
            path: "bitcoin",
            element: <BITCOINPage />,
          },
          {
            path: "cake-usdt",
            element: <CAKEUSDTPage />,
          },
          {
            path: "eth-usdt",
            element: <ETHUSDTPage />,
          },
          {
            path: "doge-usdt",
            element: <DOGEUSDTPage />,
          },

          // Futures Routes
          {
            path: "es",
            element: <ESPage />,
          },
          {
            path: "nifty50",
            element: <NIFTY50Page />,
          },
          {
            path: "gold-future",
            element: <GOLDFUTUREPage />,
          },
          {
            path: "banknifty",
            element: <BANKNIFTYPage />,
          },
          {
            path: "finnifty",
            element: <FINNIFTYPage />,
          },
          {
            path: "sensex",
            element: <SENSEXPage />,
          },

          // Stock Routes
          {
            path: "tata-motors",
            element: <TataMotorsPage />,
          },
          {
            path: "reliance",
            element: <ReliancePage />,
          },
          {
            path: "tata-steel",
            element: <TataSteelPage />,
          },
          {
            path: "havells",
            element: <HavellsPage />,
          },
          {
            path: "bajaj-finance",
            element: <BajajFinancePage />,
          },

          // Quotex Routes
          {
            path: "quotex-eurusd",
            element: <QuotexEURUSDPage />,
          },
          {
            path: "quotex-usdcad",
            element: <QuotexUSDCADPage />,
          },
          {
            path: "quotex-usdinr",
            element: <QuotexUSDINRPage />,
          },
          {
            path: "quotex-eurcad",
            element: <QuotexEURCADPage />,
          },
          {
            path: "quotex-crypto-etcusd",
            element: <QuotexETCUSDPage />,
          },
          {
            path: "quotex-crypto-bchusd",
            element: <QuotexBCHUSDPage />,
          },
        ],
      },
    ],
  },
  
  // Admin Routes
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "users",
            element: <AdminUserTable />,
          },
          {
            path: "user-requests",
            element: <AdminRequestUser />,
          },
          {
            path: "update-payment",
            element: <AdminUpdatePayment />,
          },
          {
            path: "reset-password",
            element: <AdminResetPassword />,
          },
        ],
      },
    ],
  },

  // 404 Route
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;