import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, TrendingUp, Coins, Activity, Building, Zap, Menu } from 'lucide-react';

const TradingNav: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tradingCategories = {
    forex: {
      label: 'FOREX',
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600',
      items: [
        { label: 'EUR/USD', path: '/analysis/eur-usd', popular: true },
        { label: 'GBP/USD', path: '/analysis/gbp-usd', popular: true },
        { label: 'USD/JPY', path: '/analysis/usd-jpy', popular: true },
        { label: 'USD/CAD', path: '/analysis/usd-cad' },
        { label: 'EUR/GBP', path: '/analysis/eur-gbp' },
        { label: 'AUD/USD', path: '/analysis/aud-usd' },
        { label: 'EUR/JPY', path: '/analysis/eur-jpy' },
        { label: 'GBP/JPY', path: '/analysis/gbp-jpy' },
        { label: 'CAD/JPY', path: '/analysis/cad-jpy' },
      ]
    },
    crypto: {
      label: 'CRYPTO',
      icon: Coins,
      color: 'text-orange-400',
      bgColor: 'bg-orange-600',
      items: [
        { label: 'BTC/USD', path: '/analysis/btc-usd', popular: true },
        { label: 'ETH/USDT', path: '/analysis/eth-usdt', popular: true },
        { label: 'BTC/USDT', path: '/analysis/btc-usdt' },
        { label: 'BITCOIN', path: '/analysis/bitcoin' },
        { label: 'XAU/USD', path: '/analysis/xau-usd' },
        { label: 'DOGE/USDT', path: '/analysis/doge-usdt' },
        { label: 'CAKE/USDT', path: '/analysis/cake-usdt' },
      ]
    },
    futures: {
      label: 'FUTURES',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-600',
      items: [
        { label: 'NIFTY 50', path: '/analysis/nifty50', popular: true },
        { label: 'BANK NIFTY', path: '/analysis/banknifty', popular: true },
        { label: 'E-mini S&P', path: '/analysis/es' },
        { label: 'SENSEX', path: '/analysis/sensex' },
        { label: 'FIN NIFTY', path: '/analysis/finnifty' },
        { label: 'Gold Future', path: '/analysis/gold-future' },
      ]
    },
    stocks: {
      label: 'STOCKS',
      icon: Building,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600',
      items: [
        { label: 'Reliance', path: '/analysis/reliance', popular: true },
        { label: 'Tata Motors', path: '/analysis/tata-motors' },
        { label: 'Tata Steel', path: '/analysis/tata-steel' },
        { label: 'Havells', path: '/analysis/havells' },
        { label: 'Bajaj Finance', path: '/analysis/bajaj-finance' },
      ]
    },
    quotex: {
      label: 'QUOTEX',
      icon: Zap,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-600',
      items: [
        { label: 'Quotex EUR/USD', path: '/analysis/quotex-eurusd' },
        { label: 'Quotex USD/CAD', path: '/analysis/quotex-usdcad' },
        { label: 'Quotex USD/INR', path: '/analysis/quotex-usdinr' },
        { label: 'Quotex EUR/CAD', path: '/analysis/quotex-eurcad' },
        { label: 'Quotex ETC/USD', path: '/analysis/quotex-crypto-etcusd' },
        { label: 'Quotex BCH/USD', path: '/analysis/quotex-crypto-bchusd' },
      ]
    }
  };

  const handleMouseEnter = (category: string) => {
    if (!isMobile) {
      setActiveDropdown(category);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setActiveDropdown(null);
    }
  };

  const handleClick = (category: string) => {
    if (isMobile) {
      setActiveDropdown(activeDropdown === category ? null : category);
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const getCategoryByPath = (pathname: string) => {
    for (const [key, category] of Object.entries(tradingCategories)) {
      if (category.items.some(item => item.path === pathname)) {
        return key;
      }
    }
    return null;
  };

  const activeCategory = getCategoryByPath(location.pathname);

  return (
    <nav ref={navRef} className="sticky top-16 z-[9998] bg-slate-900/98 backdrop-blur-xl border-b border-slate-700/50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile active indicator */}
        {isMobile && activeCategory && (
          <div className="flex items-center justify-center py-1 border-b border-slate-800/50">
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              {tradingCategories[activeCategory as keyof typeof tradingCategories]?.label}
            </span>
          </div>
        )}
        <div className="flex items-center justify-center space-x-1 py-2 overflow-x-auto scrollbar-hide">
          {Object.entries(tradingCategories).map(([key, category]) => {
            const Icon = category.icon;
            const isActive = activeCategory === key;
            const isDropdownOpen = activeDropdown === key;

            return (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => handleMouseEnter(key)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Category Button */}
                <button
                  onClick={() => handleClick(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? `${category.bgColor} text-white shadow-lg`
                      : `text-slate-300 hover:text-white hover:bg-slate-800`
                  } ${isDropdownOpen ? 'bg-slate-800' : ''}`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : category.color} />
                  <span>{category.label}</span>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800/98 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-[9999] ring-1 ring-black/10">
                    <div className="py-2">
                      {/* Popular Section */}
                      {category.items.some(item => item.popular) && (
                        <>
                          <div className="px-4 py-2">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Popular
                            </span>
                          </div>
                          {category.items
                            .filter(item => item.popular)
                            .map((item) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                className={`block px-4 py-2 text-sm transition-colors ${
                                  isActiveRoute(item.path)
                                    ? `${category.color} ${category.bgColor}/20 font-medium`
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
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
                          <div className="border-t border-slate-700/50 my-2"></div>
                        </>
                      )}

                      {/* All Items */}
                      <div className="px-4 py-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          All {category.label}
                        </span>
                      </div>
                      {category.items
                        .filter(item => !item.popular)
                        .map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              isActiveRoute(item.path)
                                ? `${category.color} ${category.bgColor}/20 font-medium`
                                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TradingNav;