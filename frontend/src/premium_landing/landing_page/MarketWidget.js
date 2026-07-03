import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://niveshcapital-backend.onrender.com';

export default function MarketWidget() {
  const [nifty, setNifty] = useState({ value: 0, change: 0, changePercent: 0 });
  const [sensex, setSensex] = useState({ value: 0, change: 0, changePercent: 0 });
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gainers');

  const fetchMarketData = async () => {
    try {

      const indicesRes = await axios.get(`${BACKEND_URL}/indices`);
      if (indicesRes.data.nifty) {
        setNifty({
          value: indicesRes.data.nifty.value,
          change: indicesRes.data.nifty.change,
          changePercent: indicesRes.data.nifty.changePercent
        });
      }
      if (indicesRes.data.sensex) {
        setSensex({
          value: indicesRes.data.sensex.value,
          change: indicesRes.data.sensex.change,
          changePercent: indicesRes.data.sensex.changePercent
        });
      }


      const stocksRes = await axios.get(`${BACKEND_URL}/allStocks`);
      const stocks = stocksRes.data;


      const sortedGainers = [...stocks]
        .filter(s => s.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 4)
        .map(s => ({
          symbol: s.symbol,
          price: `₹${s.currentPrice.toLocaleString('en-IN', {
            minimumFractionDigits: 2
          })}`,
          change: `+${s.changePercent.toFixed(2)}%`,
          isPositive: true
        }));


      const sortedLosers = [...stocks]
        .filter(s => s.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 4)
        .map(s => ({
          symbol: s.symbol,
          price: `₹${s.currentPrice.toLocaleString('en-IN', {
            minimumFractionDigits: 2
          })}`,
          change: `${s.changePercent.toFixed(2)}%`,
          isPositive: false
        }));

      setGainers(sortedGainers);
      setLosers(sortedLosers);
      setIsLoading(false);
    } catch (err) {
      console.error('Market data fetch error:', err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();

    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentData = activeTab === 'gainers' ? gainers : losers;

  return (
    <div className="bg-navy-950/40 border border-gray-800/80 rounded-2xl p-6 md:p-8">
      { }
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-navy-950/60 border border-gray-850 p-6 rounded-2xl flex justify-between items-center hover:border-emerald-500/30 transition-all duration-300 shadow-xl">
          <div>
            <span className="text-gray-400 font-medium text-sm">NIFTY 50</span>
            <h3 className="text-2xl font-bold mt-1 text-white">
              {typeof nifty.value === 'number'
                ? nifty.value.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
                : '0.00'
              }
            </h3>
          </div>
          <div className={`flex items-center gap-1 font-semibold ${nifty.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {nifty.changePercent >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className={nifty.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {nifty.changePercent >= 0 ? '+' : ''}
              {typeof nifty.changePercent === 'number'
                ? nifty.changePercent.toFixed(2)
                : '0.00'
              }%
            </span>
          </div>
        </div>

        <div className="bg-navy-950/60 border border-gray-850 p-6 rounded-2xl flex justify-between items-center hover:border-emerald-500/30 transition-all duration-300 shadow-xl">
          <div>
            <span className="text-gray-400 font-medium text-sm">SENSEX</span>
            <h3 className="text-2xl font-bold mt-1 text-white">
              {typeof sensex.value === 'number'
                ? sensex.value.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
                : '0.00'
              }
            </h3>
          </div>
          <div className={`flex items-center gap-1 font-semibold ${sensex.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {sensex.changePercent >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className={sensex.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {sensex.changePercent >= 0 ? '+' : ''}
              {typeof sensex.changePercent === 'number'
                ? sensex.changePercent.toFixed(2)
                : '0.00'
              }%
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex bg-navy-900 p-1.5 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'gainers' ? 'bg-emerald-500 text-navy-950 shadow' : 'text-gray-400 hover:text-white'}`}>
            📈 Top Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'losers' ? 'bg-emerald-500 text-navy-950 shadow' : 'text-gray-400 hover:text-white'}`}>
            📉 Top Losers
          </button>
        </div>

        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Simulated Live
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading market snapshot...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentData.map((stock, i) => (
            <div key={i} className="p-5 rounded-xl border border-gray-800/60 bg-navy-950/80 hover:border-gray-700 transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold tracking-wide text-white">{stock.symbol}</span>
                <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${stock.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {stock.change}
                </span>
              </div>
              <p className="text-xl font-extrabold text-white">{stock.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
