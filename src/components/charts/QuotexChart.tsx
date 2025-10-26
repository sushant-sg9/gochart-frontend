/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { getPythonApiUrl } from '../../config/apiConfig';
import axios from 'axios';
import { BinaryOptionsIndicator, By2BarsIndicator, IndicatorControls, useIndicators } from './Indicators';
import type { IndicatorSettings } from './Indicators';

// Define data types for lightweight-charts
interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface HistogramData {
  time: number;
  value: number;
  color?: string;
}

// Synthetic volume helpers (deterministic per candle)
function candleSeed(c: CandlestickData) {
  const t = c.time as number | 0;
  const o = Math.floor(c.open * 1e5) | 0;
  const h = Math.floor(c.high * 1e5) | 0;
  const l = Math.floor(c.low * 1e5) | 0;
  const cl = Math.floor(c.close * 1e5) | 0;
  let x = ((t ^ (o << 7)) >>> 0) ^ ((h << 13) >>> 0) ^ ((l << 17) >>> 0) ^ ((cl << 23) >>> 0);
  x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b) >>> 0;
  x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function computeSyntheticVolume(candle: CandlestickData, medianRange: number, isLatest: boolean, nowMs: number) {
  const seed = candleSeed(candle);
  const rnd = mulberry32(seed);
  const range = Math.max(1e-6, candle.high - candle.low);
  const body = Math.abs(candle.close - candle.open);
  const relRange = Math.min(3, range / Math.max(1e-6, medianRange));
  const relBody = Math.min(3, body / Math.max(1e-6, medianRange));

  const base = 600 + Math.floor(rnd() * 800); // 600..1400
  const mult = 0.9 + 0.3 * relRange + 0.2 * relBody + rnd() * 0.2; // ~0.9..1.9 typically
  let v = Math.max(50, Math.floor(base * mult));

  // Only the newest candle gets a tiny live jitter so it looks alive
  if (isLatest && nowMs) {
    const phase = (nowMs / 1000) % 8; // 8s cycle
    const jitter = Math.sin(phase * Math.PI * 2) * 20; // +/-20 units
    v = Math.max(50, Math.floor(v + jitter));
  }

  return v;
}

// Format volume numbers with k, M, B notation or full numbers
function formatVolume(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(Math.floor(n));
}

// Format asset name for display
function formatAssetName(asset: string) {
  const cleanAsset = asset.replace('_otc', '').toUpperCase();
  switch (cleanAsset) {
    case 'EURUSD':
      return 'EUR/USD';
    case 'USDCAD':
      return 'USD/CAD';
    case 'USDINR':
      return 'USD/INR';
    case 'EURCAD':
      return 'EUR/CAD';
    case 'ETCUSD':
      return 'ETC/USD';
    case 'BCHUSD':
      return 'BCH/USD';
    default:
      return cleanAsset;
  }
}

interface QuotexChartProps {
  asset?: string;
  period?: number;
  count?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const QuotexChart: React.FC<QuotexChartProps> = ({ 
  asset = 'EURUSD_otc', 
  period = 60, 
  count = 100,
  autoRefresh = true,
  refreshInterval = 5000 // 5 seconds
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);
  const candlestickSeries = useRef<any>(null);
  const volumeSeries = useRef<any>(null);
  const volumeLabelsRef = useRef<HTMLDivElement>(null);
  const allVolumeRef = useRef<HistogramData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hoveredCandleSum, setHoveredCandleSum] = useState<string | null>(null);
  const [currentTimeframe, setCurrentTimeframe] = useState(period);
  const intervalRef = useRef<number | null>(null);
  const candleDataRef = useRef<CandlestickData[]>([]);
  const [allMarkers, setAllMarkers] = useState<any[]>([]);
  const isMountedRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Indicator management
  const { 
    indicatorSettings, 
    toggleIndicator, 
    updateIndicatorSettings, 
    getIndicatorSettings 
  } = useIndicators();

  // Centralized marker management
  const updateIndicatorMarkers = useCallback((indicatorName: string, markers: any[]) => {
    setAllMarkers(prev => {
      // Remove old markers from this indicator
      const filtered = prev.filter(m => m.source !== indicatorName);
      // Add new markers with source tag
      const newMarkers = markers.map(m => ({ ...m, source: indicatorName }));
      return [...filtered, ...newMarkers];
    });
  }, []);

  const clearIndicatorMarkers = useCallback((indicatorName: string) => {
    setAllMarkers(prev => prev.filter(m => m.source !== indicatorName));
  }, []);

  // Apply all markers to candlestick series
  useEffect(() => {
    if (candlestickSeries.current && allMarkers) {
      try {
        // Remove source tags before applying to chart
        const chartMarkers = allMarkers.map(({ source, ...marker }) => marker);
        candlestickSeries.current.setMarkers(chartMarkers);
      } catch (error) {
        console.warn('Error applying markers to chart:', error);
      }
    }
  }, [allMarkers]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    isMountedRef.current = true;
    console.log('QuotexChart mounting for asset:', asset);

    // Create the chart
    chart.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: {
          color: 'rgba(16, 1, 25, 1)', // Dark theme to match your existing style
        },
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        horzLines: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series
    candlestickSeries.current = chart.current.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceScaleId: 'right',
    });

    // Add volume series (demo purpose)
    volumeSeries.current = chart.current.addHistogramSeries({
      color: '#1e7d74',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.92,
        bottom: 0,
      },
    });

    // Configure price scales
    chart.current.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.92,
        bottom: 0,
      },
    });

    // Handle resize
    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
        // Re-render labels on resize
        renderVolumeLabels();
      }
    };

    const handleVisibleRangeChange = () => {
      renderVolumeLabels();
    };

    // Handle crosshair move for hover functionality
    const handleCrosshairMove = (param: any) => {
      if (!param.time || !candleDataRef.current) {
        setHoveredCandleSum(null);
        return;
      }

      // Find the candle data for the hovered time
      const hoveredCandle = candleDataRef.current.find(candle => candle.time === param.time);
      if (hoveredCandle) {
        // Calculate sum: (open + close) + (high + low)
        const sum = (hoveredCandle.open + hoveredCandle.close) + (hoveredCandle.high + hoveredCandle.low);
        setHoveredCandleSum(sum.toFixed(5)); // Format to 5 decimal places
      } else {
        setHoveredCandleSum(null);
      }
    };

    chart.current.timeScale().subscribeVisibleTimeRangeChange(handleVisibleRangeChange);
    chart.current.subscribeCrosshairMove(handleCrosshairMove);
    window.addEventListener('resize', handleResize);

    return () => {
      console.log('QuotexChart cleanup starting for asset:', asset);
      
      // IMMEDIATELY mark as unmounted to prevent any further operations
      isMountedRef.current = false;
      
      // Cancel any pending requests FIRST
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // Clear intervals IMMEDIATELY
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Clean up event listeners
      window.removeEventListener('resize', handleResize);
      try { chart.current?.timeScale().unsubscribeVisibleTimeRangeChange(handleVisibleRangeChange); } catch(e) {}
      try { chart.current?.unsubscribeCrosshairMove(handleCrosshairMove); } catch(e) {}
      
      // Remove chart instance
      if (chart.current) {
        try {
          chart.current.remove();
        } catch(e) {
          console.warn('Error removing chart:', e);
        }
        chart.current = null;
      }
      
      // Clear refs
      candlestickSeries.current = null;
      volumeSeries.current = null;
      candleDataRef.current = [];
      allVolumeRef.current = [];
      
      console.log('QuotexChart cleanup complete for asset:', asset);
    };
  }, []);

  // Render small numeric labels above all volume bars
  function renderVolumeLabels() {
    const overlay = volumeLabelsRef.current;
    if (!overlay || !chart.current || !volumeSeries.current || !chartContainerRef.current) return;
    const ts = chart.current.timeScale();
    const series = volumeSeries.current;
    const data = allVolumeRef.current || [];

    // Clear previous labels
    overlay.innerHTML = '';

    // Get visible time range to only render labels for visible candles
    const visibleRange = ts.getVisibleLogicalRange();
    if (!visibleRange) return;

    const chartWidth = chartContainerRef.current.clientWidth;
    const chartHeight = chartContainerRef.current.clientHeight;

    for (const d of data) {
      const x = ts.timeToCoordinate(d.time);
      const y = series.priceToCoordinate(d.value);
      if (x == null || y == null) continue;

      // Calculate label position (centered above the bar)
      const labelText = formatVolume(d.value);
      const labelWidth = labelText.length * 6 + 4; // Estimate width based on text length
      const labelX = Math.round(x) - Math.floor(labelWidth / 2); // Center based on text width
      const labelY = Math.round(y) - 14;

      // Only render labels that are completely within the chart boundaries
      if (labelX < 0 || labelX + labelWidth > chartWidth || labelY < 0 || labelY + 12 > chartHeight) continue;

      const label = document.createElement('div');
      label.textContent = labelText;
      label.style.position = 'absolute';
      label.style.left = `${labelX}px`;
      label.style.top = `${labelY}px`;
      label.style.color = 'rgba(255,255,255,0.85)';
      label.style.fontSize = '10px';
      label.style.fontFamily = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
      label.style.pointerEvents = 'none';
      label.style.textShadow = '0 1px 2px rgba(0,0,0,0.6)';
      label.style.textAlign = 'center';
      label.style.whiteSpace = 'nowrap';
      overlay.appendChild(label);
    }
  }

  // Fetch candle data from Python API
  const fetchCandleData = async () => {
    // Don't fetch if component is unmounted
    if (!isMountedRef.current) return false;
    
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      setError(null);
      // Determine API endpoint based on asset
      const getApiEndpoint = (assetName: string) => {
        switch (assetName.toLowerCase()) {
          case 'eurusd_otc':
            return 'EURUSD_CANDLES';
          case 'usdcad_otc':
            return 'USDCAD_CANDLES';
          case 'usdinr_otc':
            return 'USDINR_CANDLES';
          case 'eurcad_otc':
            return 'EURCAD_CANDLES';
          case 'etcusd_otc':
            return 'ETCUSD_CANDLES';
          case 'bchusd_otc':
            return 'BCHUSD_CANDLES';
          default:
            return 'EURUSD_CANDLES'; // Default fallback
        }
      };
      
      const url = getPythonApiUrl(getApiEndpoint(asset));
      
      const response = await axios.get(url, {
        params: {
          period: currentTimeframe,
          count
        },
        timeout: 10000, // 10 second timeout
        signal: abortControllerRef.current.signal
      });

      console.log('API Response:', {
        success: response.data.success,
        period: response.data.period,
        actual_count: response.data.actual_count,
        requested_count: response.data.requested_count,
        status: response.data.api_status
      });
      
      if (response.data.success && response.data.data) {
        const raw = response.data.data;
        
        if (raw.length === 0) {
          throw new Error(`No candle data available for ${formatTimeframe(currentTimeframe)} timeframe. This timeframe may not be supported.`);
        }

        const candleData: CandlestickData[] = raw.map((candle: any) => ({
          time: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        // Prefer real volume if provided, otherwise synthesize deterministically
        const ranges = raw.map((c: any) => Math.max(1e-6, c.high - c.low)).sort((a: number, b: number) => a - b);
        const medianRange = ranges.length ? ranges[Math.floor(ranges.length/2)] : 1e-3;
        const latestTime = raw.length ? Math.max(...raw.map((c: any) => c.time)) : 0;
        const nowMs = Date.now();

        const volumeData: HistogramData[] = raw.map((c: any) => {
          const useReal = typeof c.volume === 'number' && c.volume > 0;
          const isLatest = c.time === latestTime;
          const val = useReal ? c.volume : computeSyntheticVolume({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }, medianRange, isLatest, nowMs);
          return {
            time: c.time,
            value: Math.floor(val),
            color: c.close >= c.open ? '#26a69a33' : '#ef535033', // slightly darker (lower opacity)
          };
        });

        // Only update state if component is still mounted
        if (!isMountedRef.current) return false;
        
        if (candlestickSeries.current) {
          candlestickSeries.current.setData(candleData);
          candleDataRef.current = candleData; // Store candle data for hover functionality
          setLastUpdate(new Date());
        }

        if (volumeSeries.current) {
          volumeSeries.current.setData(volumeData);
          allVolumeRef.current = volumeData;
          renderVolumeLabels();
        }
        
        setIsLoading(false);
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to fetch data');
      }
    } catch (err: any) {
      // Ignore abort errors - they're intentional
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        console.log('Request cancelled');
        return false;
      }
      
      console.error('Error fetching candle data:', err);
      // Only update state if component is still mounted
      if (!isMountedRef.current) return false;
      setError(err.message || 'Failed to connect to Quotex API');
      setIsLoading(false);
      return false;
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCandleData();
  }, [asset, currentTimeframe, count]);

  // Auto-refresh setup
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (autoRefresh && !isLoading && isMountedRef.current) {
      intervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          fetchCandleData();
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, isLoading, currentTimeframe]);

  // Manual refresh handler
  const handleRefresh = () => {
    setIsLoading(true);
    fetchCandleData();
  };

  // Timeframe change handler
  const handleTimeframeChange = (newTimeframe: number) => {
    console.log(`Changing timeframe from ${currentTimeframe}s to ${newTimeframe}s`);
    setCurrentTimeframe(newTimeframe);
    setIsLoading(true);
    setError(null); // Clear any previous errors
  };

  // Format timeframe for display
  const formatTimeframe = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = seconds / 60;
    return `${minutes}m`;
  };

  return (
    <div className="relative h-full w-full bg-slate-950">
      {/* Header with controls */}
      <div className="absolute top-2 left-2 z-10 flex items-center space-x-4 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
        <div className="text-white text-sm font-medium">
          {formatAssetName(asset)}
        </div>
        <div className="text-slate-400 text-xs">
          {formatTimeframe(currentTimeframe)} • {count} candles • Volume: Demo
        </div>
        
        {/* Timeframe Dropdown */}
        <div className="relative">
          <select 
            value={currentTimeframe}
            onChange={(e) => handleTimeframeChange(parseInt(e.target.value))}
            className="appearance-none bg-slate-700 text-white text-xs py-1 pl-2 pr-6 rounded border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={60}>1m</option>
            <option value={120}>2m</option>
            <option value={240}>4m</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-1 text-slate-400 pointer-events-none">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {hoveredCandleSum && (
          <div className="text-yellow-400 text-xs font-mono">
            Candle Sum: {hoveredCandleSum}
          </div>
        )}
        {lastUpdate && (
          <div className="text-slate-500 text-xs">
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
        <button 
          onClick={handleRefresh}
          className="text-blue-400 hover:text-blue-300 text-xs underline"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Indicator Controls */}
      <IndicatorControls 
        indicatorSettings={indicatorSettings}
        toggleIndicator={toggleIndicator}
        updateIndicatorSettings={updateIndicatorSettings}
      />

      {/* Binary Options Indicator */}
      <BinaryOptionsIndicator
        candleData={candleDataRef.current}
        chart={chart.current}
        candlestickSeries={candlestickSeries.current}
        enabled={getIndicatorSettings('binaryOptions').enabled}
        settings={getIndicatorSettings('binaryOptions').settings}
        updateMarkers={(markers: any[]) => updateIndicatorMarkers('binaryOptions', markers)}
        clearMarkers={() => clearIndicatorMarkers('binaryOptions')}
      />

      {/* By2Bars Indicator */}
      <By2BarsIndicator
        candleData={candleDataRef.current}
        chart={chart.current}
        candlestickSeries={candlestickSeries.current}
        enabled={getIndicatorSettings('by2bars').enabled}
        settings={getIndicatorSettings('by2bars').settings as IndicatorSettings['by2bars']['settings']}
        updateMarkers={(markers: any[]) => updateIndicatorMarkers('by2bars', markers)}
        clearMarkers={() => clearIndicatorMarkers('by2bars')}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 text-sm">Loading Quotex data...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && !isLoading && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex flex-col items-center text-center max-w-md">
            <div className="text-red-500 text-2xl mb-4">⚠️</div>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Chart container */}
      <div
        ref={chartContainerRef}
        className="h-full w-full"
        style={{ height: '100%', width: '100%', touchAction: 'pan-x pan-y' }}
      />

      {/* Small volume labels overlay */}
      <div
        ref={volumeLabelsRef}
        className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      />

      {/* Status indicator */}
      <div className="absolute bottom-2 right-2 z-10">
        <div className={`flex items-center space-x-2 px-2 py-1 rounded text-xs ${
          error ? 'bg-red-900/80 text-red-300' : 
          autoRefresh ? 'bg-green-900/80 text-green-300' : 
          'bg-slate-800/80 text-slate-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            error ? 'bg-red-400' : 
            autoRefresh ? 'bg-green-400 animate-pulse' : 
            'bg-slate-500'
          }`}></div>
          <span>
            {error ? 'Error' : autoRefresh ? 'Live' : 'Paused'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuotexChart;