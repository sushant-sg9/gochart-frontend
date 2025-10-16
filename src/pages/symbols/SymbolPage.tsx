import React from "react";
import TradingViewWidget from "../../components/charts/TradingViewWidget";

interface SymbolPageProps {
  symbol: string;
  title: string;
}

const SymbolPage: React.FC<SymbolPageProps> = ({ symbol, title }) => {
  return (
    <div className="h-screen w-full">
      <div className="h-full flex flex-col">
        {/* Optional: Symbol header */}
        <div className="hidden md:block bg-slate-900/50 border-b border-slate-800 px-6 py-3">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>
        
        {/* Chart container */}
        <div className="flex-1">
          <TradingViewWidget symbol={symbol} />
        </div>
      </div>
    </div>
  );
};

export default SymbolPage;