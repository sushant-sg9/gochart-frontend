import React, { useEffect } from "react";
import QuotexChart from "../../components/charts/QuotexChart";

interface QuotexPageProps {
  asset: string;
  title: string;
  description?: string;
  period?: number;
  count?: number;
}

const QuotexPage: React.FC<QuotexPageProps> = ({ 
  asset, 
  title, 
  description = "Real-time Quotex data",
  period = 60,
  count = 200
}) => {
  // Cleanup effect to ensure proper unmounting
  useEffect(() => {
    return () => {
      // Force cleanup any remaining intervals or event listeners
    };
  }, [asset]);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            <p className="text-slate-400 text-sm">{description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">Quotex Trading</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-semibold text-sm">Live Market</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0">
        <QuotexChart 
          key={asset}
          asset={asset}
          period={period}
          count={count}
          autoRefresh={true}
          refreshInterval={5000}
        />
      </div>

      {/* Footer Info */}
      <div className="bg-slate-900/90 backdrop-blur-sm border-t border-slate-700/50 px-6 py-3 flex-shrink-0">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span>Data provided by Quotex API</span>
            <span>•</span>
            <span>Real-time updates every 5 seconds</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
            <span>{title.replace(' OTC', '')} Over-The-Counter</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotexPage;