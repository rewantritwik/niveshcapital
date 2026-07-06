
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";

const Positions = () => {
  const [allPositions, setAllPositions] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { user, refreshTrigger, triggerRefresh, openBuyWindow } = useContext(GeneralContext);

  useEffect(() => {
    document.title = 'Positions - NiveshCapital';
  }, []);

  const fetchPositions = () => {
    setIsLoading(true);
    setIsError(false);
    const token = localStorage.getItem("token");

    axios.get(`/allPositions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => {
        setAllPositions(res.data);
        setLastUpdated(new Date().toLocaleTimeString());
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching positions:", err);
        setIsError(true);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPositions();
  }, [user, refreshTrigger]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPositions();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const totalPnL = allPositions.reduce((acc, pos) => {
    const livePrice = pos.livePrice || pos.avg;
    return acc + ((livePrice - pos.avg) * pos.qty);
  }, 0);

  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="border-b pb-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex space-x-4 p-4 border-b">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
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
              Positions ({allPositions.length})
            </h1>
            <button
              onClick={() => { triggerRefresh(); fetchPositions(); }}
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
        <div className="text-right">
          <span className="text-gray-400 text-xs uppercase tracking-wider block">
            Total P&L
          </span>
          <span className={`text-xl font-bold block mt-1 ${totalPnL >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toFixed(2)}
          </span>
        </div>
      </div>

      {}
      {isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm font-medium">Failed to load positions.</span>
          <button
            onClick={fetchPositions}
            className="text-xs font-bold bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {}
      {!isError && allPositions.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900">No open positions</h3>
          <p className="text-gray-500 text-sm mt-1">
            Buy stocks from the watchlist to open positions.
          </p>
        </div>
      )}

      {}
      {allPositions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-[700px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Instrument
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Avg. Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  LTP (Live)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Chg.
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-sm">
              {allPositions.map((pos, idx) => {
                const livePrice = pos.livePrice || pos.avg;
                const pnl = parseFloat(((livePrice - pos.avg) * pos.qty).toFixed(2));
                const isProfit = pnl >= 0;

                
                const dayChange = pos.dayChange !== undefined
                  ? pos.dayChange
                  : null;

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {pos.product || "CNC"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {pos.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      {pos.qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                      ₹{pos.avg.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-medium">
                      ₹{livePrice.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${isProfit ? "text-emerald-600" : "text-rose-600"}`}>
                      {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
                    </td>

                    {}
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${dayChange === null
                      ? "text-gray-400"
                      : dayChange >= 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                      }`}>
                      {dayChange === null
                        ? "—"
                        : `${dayChange >= 0 ? "+" : ""}${dayChange.toFixed(2)}%`
                      }
                    </td>

                    {}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => openBuyWindow(pos.name, "SELL")}
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
      <p className="text-xs text-gray-400 text-center">
        ⚠️ Prices are simulated and update every 30 seconds.
        NiveshCapital is for educational simulation purposes only.
      </p>
    </div>
  );
};

export default Positions;