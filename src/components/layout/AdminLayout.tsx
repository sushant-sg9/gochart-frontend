import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  Key, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Wifi
} from "lucide-react";
import { useState } from "react";

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3 },
    { name: "All Users", href: "/admin/users", icon: Users },
    { name: "User Requests", href: "/admin/user-requests", icon: UserCheck },
    { name: "Update Payment", href: "/admin/update-payment", icon: CreditCard },
    { name: "Reset Password", href: "/admin/reset-password", icon: Key },
    { name: "API Connection", href: "/admin/quotex-connection", icon: Wifi },
  ];

  const handleLogout = () => {
    // Handle logout logic
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white">GoChart Admin</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-red-300 hover:text-red-100 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar - always visible on desktop */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-50">
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 shadow-xl">
            <div className="flex items-center justify-center h-16 px-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">GoChart Admin</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-red-300 hover:text-red-100 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
            <div></div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 overflow-auto">
          <div className="p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export { AdminLayout };