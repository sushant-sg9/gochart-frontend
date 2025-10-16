import React from 'react';
import { X, TrendingUp, BarChart3, Zap, Target, Activity, Layers } from 'lucide-react';
import { useChartStateContext } from '../../context/ChartContext';

interface ModernChartSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const indicatorData = [
  {
    key: 'blockPressure',
    name: 'Block Pressure',
    description: 'Advanced pressure analysis indicator',
    icon: BarChart3,
    color: 'text-blue-400',
  },
  {
    key: 'volumeDelta',
    name: 'Volume Delta',
    description: 'Volume delta analysis for market sentiment',
    icon: Activity,
    color: 'text-green-400',
  },
  {
    key: 'zigZag',
    name: 'Zig Zag',
    description: 'Price trend reversal indicator',
    icon: TrendingUp,
    color: 'text-purple-400',
  },
  {
    key: 'pivotpoint',
    name: 'Pivot Point',
    description: 'Support and resistance levels',
    icon: Target,
    color: 'text-orange-400',
  },
  {
    key: 'renkoSRvolume',
    name: 'Renko SR Volume',
    description: 'Renko support/resistance with volume',
    icon: Layers,
    color: 'text-cyan-400',
  },
  {
    key: 'pricePercentageShadedCandel',
    name: 'Price % Shaded Candle',
    description: 'Price percentage shaded candlestick analysis',
    icon: Zap,
    color: 'text-red-400',
  },
];

export const ModernChartSettings: React.FC<ModernChartSettingsProps> = ({ isOpen, onClose }) => {
  const { chartIndicator, setChartIndicator } = useChartStateContext();

  if (!isOpen) return null;

  const toggleIndicator = (key: string) => {
    setChartIndicator((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const enabledCount = Object.values(chartIndicator).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Analysis Settings</h2>
            <p className="text-slate-400 text-sm">
              {enabledCount} of {indicatorData.length} GoChart indicators active
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <TrendingUp size={18} className="mr-2 text-blue-400" />
              GoChart Analysis Indicators
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Enable advanced GoChart indicators to enhance your analysis powered by professional market data
            </p>
          </div>

          <div className="space-y-3">
            {indicatorData.map((indicator) => {
              const Icon = indicator.icon;
              const isEnabled = chartIndicator[indicator.key];
              
              return (
                <div
                  key={indicator.key}
                  className={`group relative border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                    isEnabled
                      ? 'border-blue-500/50 bg-blue-600/10'
                      : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600/50'
                  }`}
                  onClick={() => toggleIndicator(indicator.key)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        isEnabled ? 'bg-blue-600/20' : 'bg-slate-700/50'
                      }`}>
                        <Icon 
                          size={18} 
                          className={isEnabled ? 'text-blue-400' : indicator.color}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium ${
                            isEnabled ? 'text-white' : 'text-slate-300'
                          }`}>
                            {indicator.name}
                          </h4>
                          {isEnabled && (
                            <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {indicator.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Toggle Switch */}
                    <div className="flex items-center">
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isEnabled ? 'bg-blue-600' : 'bg-slate-600'
                      }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {enabledCount > 0 && (
            <div className="mt-6 p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">
                  {enabledCount} Active Indicator{enabledCount !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Indicators will be applied to your GoChart analysis automatically
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700/50 bg-slate-900/50">
          <div className="text-xs text-slate-500">
            Powered by GoChart Analytics • Professional Indicators
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
