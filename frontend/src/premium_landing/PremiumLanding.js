import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp,
  BookOpen,
  Shield,
  Activity,
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle,
  Users,
  UserPlus,
  Layout,
  Zap,
  Compass
} from 'lucide-react';
import { AreaChart, Area } from 'recharts';
import MarketWidget from './landing_page/MarketWidget';
import PortfolioChart from './landing_page/PortfolioChart';
import FinalCTA from './landing_page/components/FinalCTA';


const INITIAL_WATCHLIST = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹2,456.20', change: '+1.45%', isPositive: true },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: '₹3,840.50', change: '+2.10%', isPositive: true },
  { symbol: 'INFY', name: 'Infosys Limited', price: '₹1,562.80', change: '-0.85%', isPositive: false }
];

const MARKET_STOCKS = [
  { symbol: 'HDFC BANK', name: 'HDFC Bank Ltd.', price: '₹1,642.10', change: '+1.85%', isPositive: true },
  { symbol: 'ICICI BANK', name: 'ICICI Bank Ltd.', price: '₹954.30', change: '+3.12%', isPositive: true },
  { symbol: 'AXIS BANK', name: 'Axis Bank Ltd.', price: '₹1,020.15', change: '-1.20%', isPositive: false },
  { symbol: 'SBI', name: 'State Bank of India', price: '₹612.40', change: '+2.45%', isPositive: true },
  { symbol: 'WIPRO', name: 'Wipro Limited', price: '₹482.90', change: '-2.30%', isPositive: false },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: '₹1,120.00', change: '+1.75%', isPositive: true },
  { symbol: 'ITC', name: 'ITC Limited', price: '₹435.50', change: '-0.40%', isPositive: false },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: '₹2,540.20', change: '+0.95%', isPositive: true }
];









export default function PremiumLanding({ onSignIn, onGetStarted }) {
  const [watchlist, setWatchlist] = useState(INITIAL_WATCHLIST);
  const [heroChartWidth, setHeroChartWidth] = useState(0);
  const observerRef = useRef(null);

  const heroChartRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (node !== null) {
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          setHeroChartWidth(entries[0].contentRect.width);
        }
      });
      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  const calculatePortfolioValue = () => {
    return watchlist.reduce((sum, stock) => {
      const numericPrice = parseFloat(stock.price.replace(/[^\d.]/g, '')) || 0;
      return sum + (numericPrice * 50); 
    }, 0);
  };

  const calculatePortfolioPnL = () => {
    let totalCost = 0;
    let totalCurrent = 0;
    watchlist.forEach(stock => {
      const currentPrice = parseFloat(stock.price.replace(/[^\d.]/g, '')) || 0;
      const changePercent = parseFloat(stock.change.replace(/[^\d.-]/g, '')) || 0;
      const avgCost = currentPrice / (1 + (changePercent / 100));
      totalCost += avgCost * 50;
      totalCurrent += currentPrice * 50;
    });
    const pnl = totalCurrent - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    return { pnl, pnlPercent };
  };

  const currentPortfolioValue = calculatePortfolioValue();
  const portfolioPnL = calculatePortfolioPnL();

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    
    
    const generateChartData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const baseValue = 387000;
      let currentValue = baseValue;

      return days.map(day => {
        
        const change = (Math.random() - 0.45) * 5000;
        currentValue = Math.max(baseValue * 0.95, currentValue + change);
        return {
          name: day,
          value: Math.round(currentValue)
        };
      });
    };

    setChartData(generateChartData());

    
    const interval = setInterval(() => {
      setChartData(generateChartData());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const addToWatchlist = (stock) => {
    if (!watchlist.find(item => item.symbol === stock.symbol)) {
      setWatchlist([...watchlist, stock]);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(item => item.symbol !== symbol));
  };

  return (
    <div className="bg-navy-900 text-white min-h-screen font-sans selection:bg-emerald-500 selection:text-navy-950 overflow-x-hidden pt-16">

      {}
      <section className="relative overflow-hidden py-24 md:py-32 border-b border-gray-800/50">
        {}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400 text-sm font-semibold">
                Start with ₹1,00,000 virtual capital — No real money needed
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-white leading-tight">
              Invest Smarter with <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">NiveshCapital</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-xl font-normal leading-relaxed">
              Track your portfolio, monitor stocks, and learn investing with interactive tools. The modern fintech gateway built for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 text-center flex items-center justify-center gap-2"
              >
                Get Started <ChevronRight size={18} />
              </button>
              <a href="#academy" className="px-8 py-4 bg-navy-800 hover:bg-navy-700 border border-gray-700 text-white font-semibold rounded-xl transition-all duration-300 text-center">
                Learn More
              </a>
            </div>
          </div>

          <div className="relative">
            {}
            <div className="rounded-3xl border border-gray-800/80 bg-navy-950/80 p-8 shadow-2xl backdrop-blur-xl relative">
              <div className="absolute -top-4 -right-4 bg-navy-800 border border-gray-700 rounded-2xl p-4 shadow-lg flex items-center gap-3 animate-bounce">
                <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Profit</p>
                  <p className="text-sm font-bold text-emerald-400">+₹12,400</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Nivesh Simulator</h3>
                  <p className="text-xs text-gray-400">Interactive live sandbox demo</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">Demo Active</span>
              </div>

              <div ref={heroChartRef} className="w-full mt-4" style={{ height: '200px' }}>
                {heroChartWidth > 0 && (
                  <AreaChart width={heroChartWidth} height={200} data={chartData}>
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#heroGradient)" />
                  </AreaChart>
                )}
              </div>

              <div className="mt-6 flex justify-between items-center text-sm border-t border-gray-800/60 pt-4">
                <span className="text-gray-400">Estimated Returns</span>
                <span className="font-bold text-emerald-400">+18.4% P.A.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <div className="border-y border-gray-800/50 bg-navy-900/30 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

            <div>
              <p className="text-3xl font-extrabold text-white font-heading">
                15+
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Stocks Available
              </p>
            </div>

            <div>
              <p className="text-3xl font-extrabold text-white font-heading">
                ₹1L
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Virtual Capital
              </p>
            </div>

            <div>
              <p className="text-3xl font-extrabold text-emerald-400 font-heading">
                30s
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Price Update Interval
              </p>
            </div>

            <div>
              <p className="text-3xl font-extrabold text-white font-heading">
                100%
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Free Forever
              </p>
            </div>

          </div>
        </div>
      </div>

      {}
      <section id="market" className="py-20 border-b border-gray-800/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white">Live Market Snapshot</h2>
            <p className="text-gray-400 mt-3">Watch indices move and toggle between top market performers instantly.</p>
          </div>

          <MarketWidget />
        </div>
      </section>

      {}
      <section className="py-20 bg-navy-950/20 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white">Platform Features</h2>
            <p className="text-gray-400 mt-3">All the features you need to track and grow your investments in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-2xl bg-navy-950/80 border border-gray-850 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-navy-950 transition-colors duration-300">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Portfolio Tracker</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connect and aggregate all your equity, mutual funds, and cash balances in a single consolidated screen.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-navy-950/80 border border-gray-850 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-navy-950 transition-colors duration-300">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Stock Watchlist</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Build personalized watchlists with active alerts, metrics tracking, and custom volatility warnings.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-navy-950/80 border border-gray-850 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-navy-950 transition-colors duration-300">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Market Insights</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Gain deep analytical breakdowns, sector allocation feedback, and risk exposure updates daily.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-navy-950/80 border border-gray-850 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-navy-950 transition-colors duration-300">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Investment Learning</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Step-by-step masterclasses ranging from stock basics to complex options strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {}
      <section id="dashboard" className="py-24 border-b border-gray-800/50 bg-gradient-to-b from-navy-900 to-navy-950/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white">Interactive Dashboard Preview</h2>
            <p className="text-gray-400 mt-3">Simulate trading, build your custom watchlist, and watch your metrics grow.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {}
            <div className="lg:col-span-8 bg-navy-950 border border-gray-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">Portfolio Value</span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <h3 className="text-3xl md:text-4xl font-extrabold text-white">
                      ₹{currentPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </h3>
                    <span className={`font-semibold text-sm flex items-center gap-0.5 ${portfolioPnL.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {portfolioPnL.pnl >= 0 ? <TrendingUp size={14} /> : null}
                      {portfolioPnL.pnl >= 0 ? '+' : ''}₹{portfolioPnL.pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({portfolioPnL.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400">1W Performance</span>
                </div>
              </div>

              {}
              <PortfolioChart data={chartData} />

              <div className="grid grid-cols-3 gap-4 border-t border-gray-800/80 pt-6 mt-6 text-center">
                <div>
                  <p className="text-xs text-gray-500">Day High</p>
                  <p className="text-base font-bold text-white mt-0.5">
                    ₹{Math.round(currentPortfolioValue * 1.008).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Day Low</p>
                  <p className="text-base font-bold text-white mt-0.5">
                    ₹{Math.round(currentPortfolioValue * 0.985).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Volume</p>
                  <p className="text-base font-bold text-white mt-0.5">
                    {(watchlist.length * 0.4).toFixed(1)}M
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {}
              <div className="bg-navy-950 border border-gray-800/80 rounded-3xl p-6 shadow-xl flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Your Watchlist</h3>
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs font-mono">{watchlist.length} Stocks</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                  {watchlist.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500">
                      <p className="text-sm">No stocks in your watchlist.</p>
                      <p className="text-xs mt-1">Add stocks from the panel below.</p>
                    </div>
                  ) : (
                    watchlist.map((stock) => (
                      <div key={stock.symbol} className="flex justify-between items-center p-3.5 rounded-xl bg-navy-900 border border-gray-800/40 hover:border-gray-700 transition-all duration-150">
                        <div>
                          <div className="font-bold text-sm text-white">{stock.symbol}</div>
                          <div className="text-xs text-gray-400">{stock.name}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-bold">{stock.price}</div>
                            <div className={`text-xs font-semibold ${stock.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                              {stock.change}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromWatchlist(stock.symbol)}
                            className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors duration-150"
                            title="Remove stock">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {}
              <div className="bg-navy-950 border border-gray-800/80 rounded-3xl p-6 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-4">Quick Add Stocks</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {MARKET_STOCKS.map((stock) => {
                    const isAdded = watchlist.some(item => item.symbol === stock.symbol);
                    return (
                      <button
                        key={stock.symbol}
                        onClick={() => addToWatchlist(stock)}
                        disabled={isAdded}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${isAdded
                          ? 'border-gray-800/60 bg-gray-900/40 text-gray-500 cursor-not-allowed'
                          : 'border-gray-800 bg-navy-900 hover:border-emerald-500/40 hover:bg-navy-850 text-gray-300'
                          }`}>
                        <span>{stock.symbol}</span>
                        <Plus size={14} className={isAdded ? 'text-gray-600' : 'text-emerald-400'} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section id="how-it-works" className="py-20 border-b border-gray-800/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white">How It Works</h2>
            <p className="text-gray-400 mt-3">Follow these four simple steps to begin simulating your investments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-2xl bg-navy-950/80 border border-gray-850 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-navy-950 transition-colors duration-300">
                <UserPlus size={24} />
              </div>
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest block mb-2 font-bold">Step 01</span>
              <h3 className="text-lg font-bold text-white mb-2">Create Your Account</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Click "Get Started" to sign up. The system secures your details and assigns a custom sequential NIVESH ID (e.g. NIVESH105) instantly.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-navy-950/80 border border-gray-850 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-navy-950 transition-colors duration-300">
                <Layout size={24} />
              </div>
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest block mb-2 font-bold">Step 02</span>
              <h3 className="text-lg font-bold text-white mb-2">Enter The Portal</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                You are redirected to your private Trading Dashboard origin. Your account is pre-funded with ₹1,00,000 mock capital to start.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-navy-950/80 border border-gray-850 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-navy-950 transition-colors duration-300">
                <Compass size={24} />
              </div>
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest block mb-2 font-bold">Step 03</span>
              <h3 className="text-lg font-bold text-white mb-2">Build Your Watchlist</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Monitor stock tickers in real-time. Add/remove shares such as Reliance, TCS, or HDFC Bank to track their daily fluctuation percentages.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-navy-950/80 border border-gray-850 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-navy-950 transition-colors duration-300">
                <Zap size={24} />
              </div>
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest block mb-2 font-bold">Step 04</span>
              <h3 className="text-lg font-bold text-white mb-2">Execute Live Trades</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Click Buy or Sell to submit orders. Trades execute instantly and persist your holdings, positions, and history logs directly in MongoDB.
              </p>
            </div>
          </div>
        </div>
      </section>

      {}
      <section id="why-us" className="py-20 border-b border-gray-800/50 bg-navy-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white">Why NiveshCapital?</h2>
            <p className="text-gray-400 mt-3">We provide the tools and security you need to build long-term wealth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Easy to Use</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Clean visual metrics interface designed with minimalism and efficiency in mind.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-5">
                <Activity size={28} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Updates</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Stay updated with index adjustments and market movements immediately.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-5">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Interactive Charts</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Examine growth and simulate investments directly in a sandboxed chart framework.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-5">
                <Users size={28} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Beginner Friendly</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Detailed educational modules mapping basic finance metrics for beginner profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-24 relative overflow-hidden bg-navy-950/40">
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          {}
          <FinalCTA onGetStarted={onGetStarted} />
        </div>
      </section>

    </div>
  );
}
