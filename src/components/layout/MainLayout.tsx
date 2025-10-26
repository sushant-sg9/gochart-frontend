import React, { useState, useCallback, useEffect, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ModernHeader } from "./ModernHeader";
import { ModernFooter } from "./ModernFooter";
import ModernSidebarNav from "../navigation/ModernSidebarNav";

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleToggleNav = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);
  
  // Log route changes for debugging
  useEffect(() => {
    console.log('MainLayout route changed to:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      <ModernHeader onToggleNav={handleToggleNav} />
      <ModernSidebarNav isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      }>
        <main className="flex-1" key={location.pathname}>
          <Outlet />
        </main>
      </Suspense>
      <ModernFooter />
    </div>
  );
};
