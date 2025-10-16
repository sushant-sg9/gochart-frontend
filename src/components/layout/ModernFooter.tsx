import React from "react";

export const ModernFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-slate-400">
            © 2024 GoChart. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};