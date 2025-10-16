import React, { memo, useEffect, useRef, useState } from "react";
import { useChartStateContext } from "../../context/ChartContext";
import { useTimeFrameContext } from "../../context/ChartContext";
import './tradingview.css';

interface GoChartAnalysisWidgetProps {
  symbol?: string;
}

const GoChartAnalysisWidget: React.FC<GoChartAnalysisWidgetProps> = ({ symbol }) => {
  const { chartIndicator } = useChartStateContext();
  const { timeFrame, updateTimeFrame } = useTimeFrameContext();
  const container = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSymbol, setCurrentSymbol] = useState(symbol || "NSE:NIFTY");
  
  // Update currentSymbol when symbol prop changes
  useEffect(() => {
    setCurrentSymbol(symbol || "NSE:NIFTY");
  }, [symbol]);

  useEffect(() => {
    setIsLoading(true);

    // Check if the time frame is supported for the stock
    if (isStockSymbol(currentSymbol) && !['1D', '1W', '1M'].includes(timeFrame)) {
      updateTimeFrame('1D');
      return; // Prevent further processing until the time frame is updated
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const studies: string[] = [];

    if (chartIndicator.blockPressure) {
      studies.push("PUB;9533853ded4e404195105a1baf79d45e");
    }
    if (chartIndicator.volumeDelta) {
      studies.push("PUB;f2d6754278d844d2b3fa62d4b9985a7f");
    }
    if (chartIndicator.zigZag) {
      studies.push("PUB;1b9fe120579d43f2b5e2cb64bab3c87b");
    }
    if (chartIndicator.pivotpoint) {
      studies.push("PUB;d71462438b944f07889623e0b1fcb42b");
    }
    if (chartIndicator.renkoSRvolume) {
      studies.push("PUB;a3794fcd95374bac8cb6847fab86090f");
    }
    if (chartIndicator.pricePercentageShadedCandel) {
      studies.push("PUB;0c0cd7a17fdb4414817c58750b5207a1"); 
    }

    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${currentSymbol}",
        "interval": "${timeFrame}",
        "timezone": "${userTimezone}",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "withdateranges": false,
        "hide_side_toolbar": true,
        "backgroundColor": "rgba(2, 6, 23, 1)",
        "gridColor": "rgba(255, 255, 255, 0.06)",
        "hide_top_toolbar": true,
        "allow_symbol_change": false,
        "details": false,
        "hotlist": false,
        "calendar": false,
        "widgets": false,
        "hide_legend": true,
        "hide_volume": true,
        "studies": ${JSON.stringify(studies)},
        "support_host": "https://www.tradingview.com"
      }`;
    
    script.onload = () => {
      setTimeout(() => setIsLoading(false), 800);
    };

    // Clear previous content
    while (container?.current?.firstChild) {
      container.current.removeChild(container.current.firstChild);
    }
    
    if (container.current) {
      container.current.appendChild(script);
    }
  }, [currentSymbol, chartIndicator, timeFrame, updateTimeFrame]);

  // Determine whether a symbol is a stock
  const isStockSymbol = (symbol: string): boolean => {
    const stockSymbols = ['TATAMOTORS', 'RELIANCE', 'TATASTEEL', 'HAVELLS', 'BAJFINANCE'];
    return stockSymbols.includes(symbol);
  };

  return (
    <div className="relative h-full w-full">
      {/* Modern loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <div className="text-center">
              <p className="text-slate-300 font-medium">Loading Analysis</p>
              <p className="text-slate-500 text-sm">Powered by GoChart Analytics...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Analysis Chart Container */}
      <div
        className="gochart-analysis-container h-full w-full"
        ref={container}
        style={{ height: "100%", width: "100%" }}
      >
        <div
          className="gochart-analysis-widget"
          style={{ height: "100%", width: "100%" }}
        ></div>
      </div>
    </div>
  );
};

export default memo(GoChartAnalysisWidget);
