
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import GeneralContext from "./GeneralContext";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { user, refreshTrigger, triggerRefresh, openBuyWindow } =
    useContext(GeneralContext);

  useEffect(() => {
    document.title = 'Holdings - NiveshCapital';
  }, []);

  const fetchHoldings = () => {
    setIsLoading(true);
    setIsError(false);
    const token = localStorage.getItem("token");

    axios
      .get(`/allHoldings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      .then((res) => {
        setAllHoldings(res.data);
        setLastUpdated(new Date().toLocaleTimeString());
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching holdings:", err);
        setIsError(true);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchHoldings();
  }, [user, refreshTrigger]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHoldings();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  
  const totalCost = allHoldings.reduce(
    (acc, stock) => acc + stock.qty * stock.avg,
    0
  );
  const totalCurrentValue = allHoldings.reduce(
    (acc, stock) => acc + stock.qty * (stock.livePrice || stock.avg),
    0
  );
  const totalPnL = totalCurrentValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  
  const chartData = {
    labels: allHoldings.map((s) => s.name),
    datasets: [
      {
        label: "Current Price (₹)",
        data: allHoldings.map((s) => s.livePrice || s.avg),
        backgroundColor: allHoldings.map((s) =>
          (s.livePrice || s.avg) >= s.avg
            ? "rgba(16, 185, 129, 0.6)"
            : "rgba(244, 63, 94, 0.6)"
        ),
        borderColor: allHoldings.map((s) =>
          (s.livePrice || s.avg) >= s.avg
            ? "rgba(16, 185, 129, 1)"
            : "rgba(244, 63, 94, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  
  const fmt = (val) =>
    parseFloat(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="border-b pb-4 flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex space-x-8">
            <div className="h-12 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex space-x-4 p-4 border-b">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-left font-sans">

      {}
      <div className="border-b border-gray-200 pb-4 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Holdings ({allHoldings.length})
            </h1>
            <button
              onClick={() => {
                triggerRefresh();
                fetchHoldings();
              }}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold text-xs rounded transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 font-mono">
            {lastUpdated && <span>Last updated: {lastUpdated}</span>}
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              Prices update every 30 seconds
            </span>
          </div>
        </div>

        {}
        <div className="flex space-x-8 text-right">
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wider block">
              Total Investment
            </span>
            <span className="text-lg font-bold text-gray-900 mt-1 block">
              ₹{fmt(totalCost)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wider block">
              Current Value
            </span>
            <span className="text-lg font-bold text-gray-900 mt-1 block">
              ₹{fmt(totalCurrentValue)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wider block">
              Total P&L
            </span>
            <span
              className={`text-lg font-bold mt-1 block ${totalPnL >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
            >
              {totalPnL >= 0 ? "+" : ""}₹{fmt(totalPnL)} (
              {totalPnLPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {}
      {isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm font-medium">Failed to load holdings.</span>
          <button
            onClick={fetchHoldings}
            className="text-xs font-bold bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {}
      {!isError && allHoldings.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-gray-900">
            No holdings yet
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Buy your first stock from the watchlist to get started.
          </p>
        </div>
      )}

      {}
      {allHoldings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-[700px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Instrument
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Qty.
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Avg. Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  LTP (Live)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cur. Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Net Chg.
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Day Chg.
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-sm">
              {allHoldings.map((stock, index) => {
                const livePrice = stock.livePrice || stock.avg;
                const curValue = livePrice * stock.qty;
                const costValue = stock.avg * stock.qty;
                const pnl = parseFloat((curValue - costValue).toFixed(2));
                const isProfit = pnl >= 0;

                
                const netChange = stock.pnlPercent !== undefined
                  ? stock.pnlPercent
                  : (((livePrice - stock.avg) / stock.avg) * 100);

                
                const dayChange = stock.dayChange !== undefined
                  ? stock.dayChange
                  : null;

                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {stock.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      ₹{stock.avg.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                      ₹{livePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      ₹{curValue.toFixed(2)}
                    </td>

                    {}
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${isProfit ? "text-emerald-600" : "text-rose-600"
                        }`}
                    >
                      {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
                    </td>

                    {}
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right font-medium ${netChange >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                    >
                      {netChange >= 0 ? "+" : ""}
                      {parseFloat(netChange).toFixed(2)}%
                    </td>

                    {}
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right font-medium ${dayChange === null
                          ? "text-gray-400"
                          : dayChange >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                    >
                      {dayChange === null
                        ? "—"
                        : `${dayChange >= 0 ? "+" : ""}${parseFloat(
                          dayChange
                        ).toFixed(2)}%`}
                    </td>

                    {}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => openBuyWindow(stock.name, "SELL")}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-semibold text-xs rounded-lg transition-colors"
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {}
      {allHoldings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
            Holdings Price Chart
          </h3>
          <VerticalGraph data={chartData} />
        </div>
      )}

      {}
      <p className="text-xs text-gray-400 text-center">
        ⚠️ Prices are simulated and update every 30 seconds. NiveshCapital is
        for educational simulation purposes only.
      </p>
    </div>
  );
};

export default Holdings;