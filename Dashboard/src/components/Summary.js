
import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import axios from "axios";
import GeneralContext from "./GeneralContext";

const defaultData = [
  { day: "Mon", value: 100000 },
  { day: "Tue", value: 101200 },
  { day: "Wed", value: 100800 },
  { day: "Thu", value: 102100 },
  { day: "Fri", value: 102900 },
  { day: "Sat", value: 103400 },
  { day: "Sun", value: 104200 },
];

const Summary = () => {
  const { user, refreshTrigger } = useContext(GeneralContext);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartWidth, setChartWidth] = useState(0);
  const observerRef = useRef(null);

  const chartRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (node !== null) {
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          setChartWidth(entries[0].contentRect.width);
        }
      });
      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  useEffect(() => {
    document.title = 'Dashboard - NiveshCapital';
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsLoading(true);

    axios
      .get(`http://localhost:3005/portfolio/summary`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        setSummaryData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Summary fetch error:", err);
        setIsLoading(false);
      });
  }, [user, refreshTrigger]);

  const hour = new Date().getHours();
  const greeting = hour < 12 
    ? 'Good morning' 
    : hour < 17 
      ? 'Good afternoon' 
      : 'Good evening';

  if (isLoading || !summaryData) {
    return (
      <div className="p-6 space-y-6">
        <div className="border-b pb-4">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  const { funds = {}, holdingsCount = 0, ordersCount = 0, topHoldings = [] } = summaryData;
  const availableFunds = funds.available || 0;
  const totalInvested = funds.totalInvested || 0;
  const currentPortfolioValue = funds.currentPortfolioValue || 0;
  const unrealizedPnL = funds.unrealizedPnL || 0;
  const totalPnL = funds.totalPnL || 0;
  const portfolioReturn = funds.portfolioReturn || 0;

  
  const totalWealth = availableFunds + currentPortfolioValue;
  const chartData = defaultData.map((d) => {
    const scaleFactor = totalWealth / 104200.00;
    return {
      day: d.day,
      value: Math.round(d.value * scaleFactor),
    };
  });

  const fmt = (val) =>
    `₹${parseFloat(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="p-6 space-y-6 text-left font-sans">
      {}
      <div className="border-b border-gray-200 pb-4 flex justify-between items-end">
        <div>
          <h6 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
            {greeting}, {user.name}!
          </h6>
          <h1 className="text-3xl font-bold mt-1 text-gray-900">
            Welcome to NiveshCapital Dashboard
          </h1>
        </div>
        <div className="flex space-x-3 text-sm">
          <div className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg font-medium text-gray-600">
            Holdings: <span className="text-gray-900 font-bold ml-1">{holdingsCount}</span>
          </div>
          <div className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg font-medium text-gray-600">
            Total Orders: <span className="text-gray-900 font-bold ml-1">{ordersCount}</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Available Funds
          </p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {fmt(availableFunds)}
          </p>
          <span className="text-[10px] text-gray-400">Ready to trade</span>
        </div>

        {}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Total Invested
          </p>
          <p className="text-xl font-extrabold text-gray-900 mt-1">
            {fmt(totalInvested)}
          </p>
          <span className="text-[10px] text-gray-400">Total cost basis</span>
        </div>

        {}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Portfolio Value
          </p>
          <p className="text-xl font-extrabold text-gray-900 mt-1">
            {fmt(currentPortfolioValue)}
          </p>
          <span className="text-[10px] text-gray-400">At live simulated price</span>
        </div>

        {}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Unrealized P&L
          </p>
          <p className={`text-xl font-extrabold mt-1 ${unrealizedPnL >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {unrealizedPnL >= 0 ? "+" : ""}{fmt(unrealizedPnL)}
          </p>
          <span className="text-[10px] text-gray-400">Open positions</span>
        </div>

        {}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Total P&L
          </p>
          <p className={`text-xl font-extrabold mt-1 ${totalPnL >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {totalPnL >= 0 ? "+" : ""}{fmt(totalPnL)}
          </p>
          <span className={`text-xs font-semibold mt-0.5 block ${portfolioReturn >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {portfolioReturn >= 0 ? "+" : ""}{portfolioReturn}% return
          </span>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Wealth Trend (7 Days)
          </h3>
          <div ref={chartRef} className="w-full" style={{ height: '280px' }}>
            {chartWidth > 0 && (
              <AreaChart width={chartWidth} height={280} data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            )}
          </div>
        </div>

        {}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Holdings
            </h3>
            {topHoldings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No holdings yet. Buy stocks to start your portfolio.
              </div>
            ) : (
              <div className="space-y-4">
                {topHoldings.map((h, i) => {
                  const holdingPnL = h.pnl || 0;
                  const isProfit = holdingPnL >= 0;
                  const totalCost = h.avg * h.qty;
                  const holdingReturn = totalCost > 0 ? (holdingPnL / totalCost) * 100 : 0;
                  return (
                    <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-gray-900">{h.name}</p>
                        <p className="text-xs text-gray-500">Qty: {h.qty} @ Avg: ₹{h.avg.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{h.currentValue.toLocaleString("en-IN")}</p>
                        <p className={`text-xs font-semibold ${isProfit ? "text-emerald-600" : "text-rose-600"}`}>
                          {isProfit ? "+" : ""}₹{holdingPnL.toFixed(2)} ({isProfit ? "+" : ""}{holdingReturn.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;