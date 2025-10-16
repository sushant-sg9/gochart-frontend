/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Define candlestick data type
interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Types for indicator settings
interface IndicatorSettings {
  binaryOptions: {
    enabled: boolean;
    settings: {
      showSignals: boolean;
    };
  };
  by2bars: {
    enabled: boolean;
    settings: {
      showSignals: boolean;
      showPerformance: boolean;
      showRevenueLine: boolean;
    };
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const useIndicators = () => {
  const [indicatorSettings, setIndicatorSettings] = useState<IndicatorSettings>({
    binaryOptions: {
      enabled: true,
      settings: {
        showSignals: true,
      },
    },
    by2bars: {
      enabled: false,
      settings: {
        showSignals: true,
        showPerformance: true,
        showRevenueLine: true,
      },
    },
  });

  const toggleIndicator = (indicatorName: keyof IndicatorSettings) => {
    setIndicatorSettings(prev => ({
      ...prev,
      [indicatorName]: {
        ...prev[indicatorName],
        enabled: !prev[indicatorName].enabled,
      },
    }));
  };

  const updateIndicatorSettings = (
    indicatorName: keyof IndicatorSettings, 
    settings: Partial<IndicatorSettings[keyof IndicatorSettings]['settings']>
  ) => {
    setIndicatorSettings(prev => ({
      ...prev,
      [indicatorName]: {
        ...prev[indicatorName],
        settings: {
          ...prev[indicatorName].settings,
          ...settings,
        },
      },
    }));
  };

  const getIndicatorSettings = (indicatorName: keyof IndicatorSettings) => {
    return indicatorSettings[indicatorName];
  };

  return {
    indicatorSettings,
    toggleIndicator,
    updateIndicatorSettings,
    getIndicatorSettings,
  };
};

// Binary Options Indicator Component
interface BinaryOptionsIndicatorProps {
  candleData: CandlestickData[];
  chart: any;
  candlestickSeries: any;
  enabled: boolean;
  settings: IndicatorSettings['binaryOptions']['settings'];
  updateMarkers: (markers: any[]) => void;
  clearMarkers: () => void;
}

export const BinaryOptionsIndicator: React.FC<BinaryOptionsIndicatorProps> = ({
  candleData,
  chart,
  candlestickSeries,
  enabled,
  settings,
  updateMarkers,
  clearMarkers
}) => {

  // Binary Options indicator - simplified version matching old frontend
  const calculateIndicatorSignals = useCallback((candles: CandlestickData[]) => {
    if (!candles || candles.length < 2) return [];
    
    const signals = [];
    
    if (!settings.showSignals) return signals;
    
    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const previous = candles[i - 1];
      const time = current.time;
      
      // Combined Binary Options logic
      // 5-Minute Time Anchor Detection
      const date = new Date(time * 1000);
      const minutes = date.getMinutes();
      const new5Min = (minutes % 5 === 0);
      
      if (new5Min) {
        signals.push({
          time: time,
          position: 'aboveBar' as const,
          color: '#808080', // gray
          shape: 'arrowDown' as const,
          text: '',
          size: 'small'
        });
      }
      
      // Engulfing Pattern Detection
      const bullishEngulfing = 
        current.close > current.open && // Current is bullish
        previous.close < previous.open && // Previous is bearish
        current.close > previous.open && // Current close > previous open
        current.open <= previous.close; // Current open <= previous close
      
      const bearishEngulfing = 
        current.close < current.open && // Current is bearish
        previous.close > previous.open && // Previous is bullish
        current.close < previous.open && // Current close < previous open
        current.open >= previous.close; // Current open >= previous close
      
      if (bullishEngulfing) {
        signals.push({
          time: time,
          position: 'belowBar' as const,
          color: '#26a69a', // green
          shape: 'arrowUp' as const,
          text: 'CALL'
        });
      }
      
      if (bearishEngulfing) {
        signals.push({
          time: time,
          position: 'aboveBar' as const,
          color: '#ef5350', // red
          shape: 'arrowDown' as const,
          text: 'PUT'
        });
      }
      
      // Rejection Wick Detection
      const high = current.high;
      const low = current.low;
      const open = current.open;
      const close = current.close;
      
      const upperWick = high - Math.max(close, open);
      const lowerWick = Math.min(close, open) - low;
      const totalRange = high - low;
      
      // Big wicks are 60% or more of the total candle range
      const bigUpperWick = upperWick > totalRange * 0.6;
      const bigLowerWick = lowerWick > totalRange * 0.6;
      
      if (bigLowerWick && totalRange > 0) {
        signals.push({
          time: time,
          position: 'belowBar' as const,
          color: '#00ff80', // lime
          shape: 'circle' as const,
          text: ''
        });
      }
      
      if (bigUpperWick && totalRange > 0) {
        signals.push({
          time: time,
          position: 'aboveBar' as const,
          color: '#ff8c00', // orange
          shape: 'circle' as const,
          text: ''
        });
      }
    }
    
    return signals;
  }, [settings]);

  // Convert signals to lightweight-charts markers format
  const convertToChartMarkers = (signals: any[]) => {
    return signals.map(signal => ({
      time: signal.time,
      position: signal.position,
      color: signal.color,
      shape: signal.shape,
      text: signal.text || ''
    }));
  };

  // Update markers when candle data changes
  useEffect(() => {
    if (!enabled || !candleData.length || !settings.showSignals) {
      clearMarkers();
      return;
    }

    const signals = calculateIndicatorSignals(candleData);
    const chartMarkers = convertToChartMarkers(signals);
    updateMarkers(chartMarkers);
  }, [candleData, enabled, settings, calculateIndicatorSignals, updateMarkers, clearMarkers]);

  return null; // This component doesn't render anything visible
};

// By2Bars Indicator Component
interface By2BarsIndicatorProps {
  candleData: CandlestickData[];
  chart: any;
  candlestickSeries: any;
  enabled: boolean;
  settings: IndicatorSettings['by2bars']['settings'];
  updateMarkers: (markers: any[]) => void;
  clearMarkers: () => void;
}

export const By2BarsIndicator: React.FC<By2BarsIndicatorProps> = ({
  candleData,
  chart,
  candlestickSeries,
  enabled,
  settings,
  updateMarkers,
  clearMarkers
}) => {
  const [markers, setMarkers] = useState<any[]>([]);
  const [performanceSeries, setPerformanceSeries] = useState<any>(null);
  const [revenueSeries, setRevenueSeries] = useState<any>(null);

  // Convert Pine Script logic to JavaScript - exact copy from old frontend
  const calculateBy2BarsSignals = useCallback((candles: CandlestickData[]) => {
    if (!candles || candles.length < 3) return { signals: [], performance: [], revenue: [] };
    
    const signals = [];
    const performance = [];
    const revenue = [];
    
    let yellowBarsTotal = 0; // Successful predictions
    let blackBarsTotal = 0;  // Failed predictions
    
    for (let i = 2; i < candles.length; i++) {
      const current = candles[i];    // Current candle (open vs close)
      const candle1 = candles[i-1];  // Previous candle
      const candle2 = candles[i-2];  // 2 candles ago
      const time = current.time;
      
      // Pine Script logic conversion
      // data = (close[2]>open[2]) == (close[1]>open[1])
      const candle2Bullish = candle2.close > candle2.open;
      const candle1Bullish = candle1.close > candle1.open;
      const data = candle2Bullish === candle1Bullish; // Same direction
      
      // dir = close[2] < close[1] 
      const dir = candle2.close < candle1.close; // Price went down
      
      // correct = (close[2] < close[1]) == (open<close)
      const currentBullish = current.close > current.open;
      const correct = dir === currentBullish; // Prediction was correct
      
      if (!data) continue; // Only process when pattern exists
      
      // === Trading Signals ===
      if (settings.showSignals) {
        // Buy signal: pattern + downward trend
        if (data && dir) {
          signals.push({
            time: time,
            position: 'aboveBar' as const,
            color: '#32CD32', // lime
            shape: 'arrowUp' as const,
            text: 'Buy'
          });
        }
        
        // Sell signal: pattern + upward trend  
        if (data && !dir) {
          signals.push({
            time: time,
            position: 'belowBar' as const,
            color: '#FF0000', // red
            shape: 'arrowDown' as const, 
            text: 'Sell'
          });
        }
      }
      
      // === Performance Tracking ===
      if (settings.showPerformance) {
        if (data && correct) {
          // Yellow bar - successful prediction
          yellowBarsTotal += 1;
          performance.push({
            time: time,
            value: 1, // Success
            color: '#32CD32' // green for success histogram
          });
        } else if (data && !correct) {
          // Black bar - failed prediction  
          blackBarsTotal += 1;
          performance.push({
            time: time,
            value: -1, // Failure
            color: '#FF0000' // red for failure histogram
          });
        }
      }
      
      // === Revenue Line ===
      if (settings.showRevenueLine && data) {
        const totalRevenue = yellowBarsTotal - blackBarsTotal;
        revenue.push({
          time: time,
          value: totalRevenue
        });
      }
    }
    
    return { signals, performance, revenue };
  }, [settings]);

  // Initialize performance series (histogram)
  useEffect(() => {
    if (!chart || !enabled || !settings.showPerformance) {
      if (performanceSeries) {
        try {
          chart.removeSeries(performanceSeries);
        } catch (e) {
          console.warn('Error removing performance series:', e);
        }
        setPerformanceSeries(null);
      }
      return;
    }

    if (!performanceSeries) {
      const series = chart.addHistogramSeries({
        color: '#32CD32',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'by2bars-performance', 
        scaleMargins: {
          top: 0.1,
          bottom: 0.8, // Place at bottom 20% of chart
        },
      });
      
      // Configure scale
      chart.priceScale('by2bars-performance').applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.8,
        },
      });

      setPerformanceSeries(series);
    }

    return () => {
      if (performanceSeries) {
        try {
          chart.removeSeries(performanceSeries);
        } catch (e) {
          console.warn('Error removing performance series:', e);
        }
        setPerformanceSeries(null);
      }
    };
  }, [chart, enabled, settings.showPerformance]);

  // Initialize revenue line series
  useEffect(() => {
    if (!chart || !enabled || !settings.showRevenueLine) {
      if (revenueSeries) {
        try {
          chart.removeSeries(revenueSeries);
        } catch (e) {
          console.warn('Error removing revenue series:', e);
        }
        setRevenueSeries(null);
      }
      return;
    }

    if (!revenueSeries) {
      const series = chart.addLineSeries({
        color: '#0066FF', // blue
        lineWidth: 2,
        priceScaleId: 'by2bars-revenue',
        scaleMargins: {
          top: 0.8,
          bottom: 0.1, // Place at top 20% of chart
        },
      });
      
      // Configure scale
      chart.priceScale('by2bars-revenue').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0.1,
        },
      });

      setRevenueSeries(series);
    }

    return () => {
      if (revenueSeries) {
        try {
          chart.removeSeries(revenueSeries);
        } catch (e) {
          console.warn('Error removing revenue series:', e);
        }
        setRevenueSeries(null);
      }
    };
  }, [chart, enabled, settings.showRevenueLine]);

  // Update all indicators when candle data changes
  useEffect(() => {
    if (!enabled || !candleData.length) {
      setMarkers([]);
      if (performanceSeries) performanceSeries.setData([]);
      if (revenueSeries) revenueSeries.setData([]);
      return;
    }

    const { signals, performance, revenue } = calculateBy2BarsSignals(candleData);
    
    // Convert signals to chart markers format
    const chartMarkers = signals.map(signal => ({
      time: signal.time,
      position: signal.position,
      color: signal.color,
      shape: signal.shape,
      text: signal.text || ''
    }));
    setMarkers(chartMarkers);
    
    // Update performance histogram
    if (performanceSeries && performance.length > 0) {
      performanceSeries.setData(performance);
    }
    
    // Update revenue line
    if (revenueSeries && revenue.length > 0) {
      revenueSeries.setData(revenue);
    }

  }, [candleData, enabled, settings, performanceSeries, revenueSeries, calculateBy2BarsSignals]);

  // Apply markers using centralized system
  useEffect(() => {
    if (!enabled || !settings.showSignals) {
      clearMarkers();
    } else if (markers.length > 0) {
      updateMarkers(markers);
    }
  }, [markers, enabled, settings.showSignals, updateMarkers, clearMarkers]);

  return null; // This component doesn't render anything visible
};

// Indicator Controls Component
interface IndicatorControlsProps {
  indicatorSettings: IndicatorSettings;
  toggleIndicator: (indicatorName: keyof IndicatorSettings) => void;
  updateIndicatorSettings: (
    indicatorName: keyof IndicatorSettings,
    settings: Partial<IndicatorSettings[keyof IndicatorSettings]['settings']>
  ) => void;
}

export const IndicatorControls: React.FC<IndicatorControlsProps> = ({
  indicatorSettings,
  toggleIndicator,
  updateIndicatorSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-2 right-2 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-slate-700/50 hover:bg-slate-700/90 transition-colors cursor-pointer"
      >
        Indicators
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 min-w-80 shadow-xl max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {/* Binary Options Indicator */}
            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-medium">Binary Options</label>
              <input
                type="checkbox"
                checked={indicatorSettings.binaryOptions.enabled}
                onChange={() => toggleIndicator('binaryOptions')}
                className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* By2Bars Indicator */}
            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-medium">By2Bars</label>
              <input
                type="checkbox"
                checked={indicatorSettings.by2bars.enabled}
                onChange={() => toggleIndicator('by2bars')}
                className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white py-1 px-3 rounded text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
