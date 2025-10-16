import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, TrendingUp, Coins, Activity, Building, Zap, 
  ChevronRight, Search 
} from 'lucide-react';

interface ModernSidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModernSidebarNav: React.FC<ModernSidebarNavProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const tradingCategories = {
    forex: {
      label: 'Forex',
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20',
      borderColor: 'border-blue-500/30',
      items: [
        { label: 'EUR/USD', path: '/analysis/eur-usd' },
        { label: 'GBP/USD', path: '/analysis/gbp-usd' },
        { label: 'EUR/GBP', path: '/analysis/eur-gbp' },
        { label: 'USD/CAD', path: '/analysis/usd-cad' },
        { label: 'USD/JPY', path: '/analysis/usd-jpy' },
        { label: 'CAD/JPY', path: '/analysis/cad-jpy' },
        { label: 'AUD/USD', path: '/analysis/aud-usd' },
        { label: 'GBP/JPY', path: '/analysis/gbp-jpy' },
        { label: 'EUR/JPY', path: '/analysis/eur-jpy' },
      ]
    },
    crypto: {
      label: 'Crypto',
      icon: Coins,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600/20',
      borderColor: 'border-orange-500/30',
      items: [
        { label: 'BTC/USD', path: '/analysis/btc-usd' },
        { label: 'BTC/USDT', path: '/analysis/btc-usdt' },
        { label: 'XAU/USD', path: '/analysis/xau-usd' },
        { label: 'BITCOIN', path: '/analysis/bitcoin' },
        { label: 'CAKE/USDT', path: '/analysis/cake-usdt' },
        { label: 'ETH/USDT', path: '/analysis/eth-usdt' },
        { label: 'DOGE/USDT', path: '/analysis/doge-usdt' },
      ]
    },
    futures: {
      label: 'Futures',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-500/30',
      items: [
        { label: 'SENSEX', path: '/analysis/sensex' },
      ]
    },
    stocks: {
      label: 'Stocks',
      icon: Building,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20',
      borderColor: 'border-purple-500/30',
      items: [
        { label: 'Tata Motors', path: '/analysis/tata-motors' },
        { label: 'Reliance', path: '/analysis/reliance' },
        { label: 'Tata Steel', path: '/analysis/tata-steel' },
        { label: 'Havells', path: '/analysis/havells' },
        { label: 'Bajaj Finance', path: '/analysis/bajaj-finance' },
      ]
    },
    quotex: {
      label: 'Quotex',
      icon: Zap,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-600/20',
      borderColor: 'border-cyan-500/30',
      items: [
        { label: 'Quotex EUR/USD', path: '/analysis/quotex-eurusd' },
        { label: 'Quotex USD/CAD', path: '/analysis/quotex-usdcad' },
        { label: 'Quotex USD/INR', path: '/analysis/quotex-usdinr' },
        { label: 'Quotex EUR/CAD', path: '/analysis/quotex-eurcad' },
      ]
    },
    quotexCrypto: {
      label: 'Quotex Crypto',
      icon: Coins,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-600/20',
      borderColor: 'border-emerald-500/30',
      items: [
        { label: 'Ethereum Classic OTC', path: '/analysis/quotex-crypto-etcusd' },
        { label: 'Bitcoin Cash OTC', path: '/analysis/quotex-crypto-bchusd' },
      ]
    }
  };

  // Get current category based on active route
  const getCurrentCategory = () => {
    for (const [key, category] of Object.entries(tradingCategories)) {
      if (category.items.some(item => item.path === location.pathname)) {
        return key;
      }
    }
    return null;
  };

  // Auto-expand current category
  useEffect(() => {
    const currentCat = getCurrentCategory();
    if (currentCat) {
      setActiveCategory(currentCat);
    }
  }, [location.pathname]);


  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const filteredCategories = Object.entries(tradingCategories).reduce((acc, [key, category]) => {
    if (searchQuery) {
      const filteredItems = category.items.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filteredItems.length > 0) {
        acc[key] = { ...category, items: filteredItems };
      }
    } else {
      acc[key] = category;
    }
    return acc;
  }, {} as typeof tradingCategories);

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-slate-900/98 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out z-[10000] ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Analysis Markets</h2>
              <p className="text-xs text-slate-400">Select asset to analyze</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {Object.entries(filteredCategories).map(([key, category]) => {
            const Icon = category.icon;
            const isExpanded = activeCategory === key;
            
            return (
              <div key={key} className="space-y-1">
                {/* Category Header */}
                <button
                  onClick={() => setActiveCategory(isExpanded ? null : key)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    getCurrentCategory() === key
                      ? `${category.bgColor} ${category.borderColor} border text-white`
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={18} className={getCurrentCategory() === key ? 'text-white' : category.color} />
                    <span className="font-medium">{category.label}</span>
                    <span className="text-xs bg-slate-700/50 px-2 py-0.5 rounded-full">
                      {category.items.length}
                    </span>
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {category.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActiveRoute(item.path)
                            ? `${category.color} ${category.bgColor} font-medium`
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.label}</span>
                          {isActiveRoute(item.path) && (
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="text-center">
            <p className="text-xs text-slate-500">
              {Object.values(tradingCategories).reduce((acc, cat) => acc + cat.items.length, 0)} analysis pairs available
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernSidebarNav;