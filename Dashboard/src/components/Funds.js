import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PiggyBank,
  Activity,
  DollarSign,
  Plus,
  Minus,
  BarChart2,
  CheckCircle,
  XCircle,
  Clock,
  PieChart as PieChartIcon
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const Funds = () => {
  const [fundsData, setFundsData] = useState(null);
  const [holdings, setHoldings] = useState([]);
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
    document.title = 'Funds - NiveshCapital';
  }, []);
  const [isError, setIsError] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [showWithdrawInput, setShowWithdrawInput] = useState(false);
  const [addError, setAddError] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { user, refreshTrigger, triggerRefresh, setFunds, showToast } =
    useContext(GeneralContext);

  const fetchFundsAndHoldings = () => {
    setIsLoading(true);
    setIsError(false);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      axios.get("/allFunds", { headers }),
      axios.get("/allHoldings", { headers })
    ])
      .then(([fundsRes, holdingsRes]) => {
        setFundsData(fundsRes.data);
        if (setFunds) setFunds(fundsRes.data.available);
        setHoldings(holdingsRes.data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching funds/holdings data:", err);
        setIsError(true);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFundsAndHoldings();
  }, [user, refreshTrigger]);

  const handleAddFunds = async () => {
    setAddError("");
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      setAddError("Enter a valid positive amount.");
      return;
    }
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    setActionLoading(true);
    try {
      await axios.post(
        "/updateFunds",
        { amount, type: "add" },
        { headers }
      );
      setAddAmount("");
      setShowAddInput(false);
      triggerRefresh();
      fetchFundsAndHoldings();
      if (showToast)
        showToast({
          type: "success",
          message: `✅ ₹${amount.toLocaleString("en-IN")} added successfully`,
        });
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add funds.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawFunds = async () => {
    setWithdrawError("");
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError("Enter a valid positive amount.");
      return;
    }
    if (fundsData && amount > fundsData.available) {
      setWithdrawError(
        `Cannot withdraw more than available balance ₹${fundsData.available.toFixed(2)}`
      );
      return;
    }
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    setActionLoading(true);
    try {
      await axios.post(
        "/updateFunds",
        { amount, type: "withdraw" },
        { headers }
      );
      setWithdrawAmount("");
      setShowWithdrawInput(false);
      triggerRefresh();
      fetchFundsAndHoldings();
      if (showToast)
        showToast({
          type: "success",
          message: `✅ ₹${amount.toLocaleString("en-IN")} withdrawn successfully`,
        });
    } catch (err) {
      setWithdrawError(
        err.response?.data?.message || "Failed to withdraw funds."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const fmt = (val) =>
    val !== undefined && val !== null
      ? `₹${parseFloat(val).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "₹0.00";

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="border-b pb-4">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-200 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // calculations
  const totalCapital = (fundsData?.available || 0) + (fundsData?.totalInvested || 0);
  const utilizationPercent = totalCapital > 0 ? (fundsData.totalInvested / totalCapital) * 100 : 0;
  
  let barColorClass = "bg-emerald-500";
  if (utilizationPercent >= 50 && utilizationPercent <= 80) {
    barColorClass = "bg-amber-500";
  } else if (utilizationPercent > 80) {
    barColorClass = "bg-rose-500";
  }

  
  const overallReturn = fundsData && fundsData.openingBalance > 0
    ? (fundsData.totalPnL / fundsData.openingBalance) * 100
    : 0;

  
  const investedReturn = fundsData && fundsData.totalInvested > 0
    ? (fundsData.totalPnL / fundsData.totalInvested) * 100
    : null;

  
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

  
  const hasHoldings = holdings && holdings.length > 0;
  const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  const bestPerformer = hasHoldings
    ? holdings.reduce((best, curr) => 
        (curr.pnlPercent > (best?.pnlPercent ?? -Infinity)) ? curr : best
      , null)
    : null;

  const worstPerformer = hasHoldings
    ? holdings.reduce((worst, curr) => 
        (curr.pnlPercent < (worst?.pnlPercent ?? Infinity)) ? curr : worst
      , null)
    : null;

  const highestInvestmentStock = hasHoldings
    ? holdings.reduce((highest, curr) => 
        (curr.investedValue > (highest?.investedValue ?? -Infinity)) ? curr : highest
      , null)
    : null;

  
  const pieData = hasHoldings
    ? holdings.map((h) => ({
        name: h.name,
        value: h.currentValue,
      }))
    : [{ name: "Cash (Placeholder)", value: fundsData?.available || 100000 }];

  const pieColors = hasHoldings ? COLORS : ['#cbd5e1'];

  return (
    <div className="p-6 space-y-6 text-left font-sans bg-gray-50/50 min-h-screen">
      {}
      <div className="border-b border-gray-200 pb-4 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funds</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your trading capital and margins
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setShowWithdrawInput(!showWithdrawInput);
              setShowAddInput(false);
              setWithdrawError("");
            }}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 border border-gray-200 shadow-sm"
          >
            Withdraw
          </button>
          <button
            onClick={() => {
              setShowAddInput(!showAddInput);
              setShowWithdrawInput(false);
              setAddError("");
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm"
          >
            Add Funds
          </button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 flex justify-between items-center">
          <span className="text-sm font-medium">
            Failed to load funds and holdings data.
          </span>
          <button
            onClick={fetchFundsAndHoldings}
            className="text-xs font-bold bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {fundsData && (
        <>
          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {}
            <div className="bg-white border border-gray-200 border-l-4 border-l-emerald-500 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Available Margin
                </p>
                <Wallet className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-emerald-600 font-mono">
                  {fmt(fundsData.available)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ready to trade</p>
              </div>
            </div>

            {/* Card 2 — Portfolio Value */}
            <div className="bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Portfolio Value
                </p>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-gray-900 font-mono">
                  {fmt(fundsData.currentPortfolioValue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">At live simulated price</p>
              </div>
            </div>

            {}
            <div
              className={`bg-white border border-gray-200 border-l-4 ${
                fundsData.totalPnL >= 0 ? "border-l-emerald-500" : "border-l-rose-500"
              } rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Total P&L
                </p>
                <BarChart3
                  className={`w-5 h-5 ${
                    fundsData.totalPnL >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                />
              </div>
              <div className="mt-4">
                <p
                  className={`text-2xl font-extrabold font-mono ${
                    fundsData.totalPnL >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {fundsData.totalPnL >= 0 ? "+" : ""}
                  {fmt(fundsData.totalPnL)}
                </p>
                <div className="mt-1 flex flex-col gap-0.5 text-xs font-semibold">
                  <span className={overallReturn >= 0 ? "text-emerald-500" : "text-rose-500"}>
                    Overall: {overallReturn >= 0 ? "+" : ""}
                    {overallReturn.toFixed(2)}%
                  </span>
                  {investedReturn !== null && (
                    <span className={investedReturn >= 0 ? "text-emerald-500" : "text-rose-500"}>
                      On Invested: {investedReturn >= 0 ? "+" : ""}
                      {investedReturn.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 4 — Total Invested */}
            <div className="bg-white border border-gray-200 border-l-4 border-l-purple-500 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Total Invested
                </p>
                <PiggyBank className="w-5 h-5 text-purple-500" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-gray-900 font-mono">
                  {fmt(fundsData.totalInvested)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Capital deployed</p>
              </div>
            </div>

            {}
            <div className="bg-white border border-gray-200 border-l-4 border-l-amber-500 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Today's P&L
                </p>
                <Activity className="w-5 h-5 text-amber-500" />
              </div>
              <div className="mt-4">
                <p
                  className={`text-2xl font-extrabold font-mono ${
                    fundsData.unrealizedPnL >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {fundsData.unrealizedPnL >= 0 ? "+" : ""}
                  {fmt(fundsData.unrealizedPnL)}
                </p>
                <div className="text-xs mt-1 flex flex-col">
                  <span className="text-gray-500 font-semibold">Unrealized (open positions)</span>
                  <span className="text-[10px] text-gray-400 font-normal mt-0.5 animate-pulse">
                    Updates every 30s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Add / Withdraw Inline Panels */}
          {(showAddInput || showWithdrawInput) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Funds Panel */}
              {showAddInput && (
                <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Amount to Add (₹)
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">Select or enter custom amount</span>
                  </div>
                  
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full border border-emerald-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-gray-800"
                  />

                  {/* Quick Amount Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[500, 1000, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAddAmount(amt.toString())}
                        className="px-3 py-1.5 bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg transition-colors font-mono"
                      >
                        ₹{amt.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>

                  {addError && (
                    <p className="text-rose-600 text-xs font-semibold flex items-center gap-1">
                      ⚠️ {addError}
                    </p>
                  )}

                  <div className="flex space-x-2 pt-2 border-t border-emerald-100">
                    <button
                      onClick={handleAddFunds}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors shadow-sm"
                    >
                      {actionLoading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span>{actionLoading ? "Processing..." : "Add Funds"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddInput(false);
                        setAddAmount("");
                        setAddError("");
                      }}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Withdraw Panel */}
              {showWithdrawInput && (
                <div className="p-5 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                      Amount to Withdraw (₹)
                    </label>
                    <span className="text-xs text-rose-600 font-medium font-mono">
                      Available: {fmt(fundsData.available)}
                    </span>
                  </div>
                  
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono text-gray-800"
                  />

                  {/* Quick Amount Buttons for Withdraw */}
                  <div className="flex flex-wrap gap-2">
                    {[500, 1000, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setWithdrawAmount(amt.toString())}
                        className="px-3 py-1.5 bg-white border border-rose-200 hover:border-rose-500 hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-lg transition-colors font-mono"
                      >
                        ₹{amt.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>

                  {withdrawError && (
                    <p className="text-rose-600 text-xs font-semibold flex items-center gap-1">
                      ⚠️ {withdrawError}
                    </p>
                  )}

                  <div className="flex space-x-2 pt-2 border-t border-rose-100">
                    <button
                      onClick={handleWithdrawFunds}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors shadow-sm"
                    >
                      {actionLoading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span>{actionLoading ? "Processing..." : "Withdraw Funds"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowWithdrawInput(false);
                        setWithdrawAmount("");
                        setWithdrawError("");
                      }}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equity Margin card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Equity Margin
              </h3>

              <div className="space-y-4">
                {/* Capital Utilization Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                    <span>Capital Utilization</span>
                    <span className="font-mono text-gray-900">{utilizationPercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
                      style={{ width: `${utilizationPercent}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-150 text-sm mt-4">
                  {/* Row 1: Available Cash */}
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Wallet className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-gray-700">Available Cash</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 text-base">{fmt(fundsData.available)}</span>
                  </div>

                  {/* Row 2: Capital Used */}
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <TrendingDown className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-gray-700">Capital Used</span>
                    </div>
                    <span className="font-mono font-bold text-gray-900 text-base">{fmt(fundsData.totalInvested)}</span>
                  </div>

                  {/* Row 3: Opening Balance */}
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-700">Opening Balance</span>
                    </div>
                    <span className="font-mono font-semibold text-gray-900">{fmt(fundsData.openingBalance)}</span>
                  </div>

                  {/* Row 4: Total Added */}
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Plus className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-gray-700">Total Added (Payin)</span>
                    </div>
                    <span className="font-mono font-semibold text-emerald-600">+{fmt(fundsData.totalPayin || 0)}</span>
                  </div>

                  {/* Row 5: Total Withdrawn */}
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Minus className="w-4 h-4 text-rose-500" />
                      <span className="font-medium text-gray-700">Total Withdrawn (Payout)</span>
                    </div>
                    <span className="font-mono font-semibold text-rose-600">-{fmt(fundsData.totalPayout || 0)}</span>
                  </div>

                  {/* Row 6: Portfolio Value */}
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <BarChart2 className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-gray-700">Portfolio Value</span>
                    </div>
                    <span className="font-mono font-semibold text-gray-900">{fmt(fundsData.currentPortfolioValue)}</span>
                  </div>
                </div>

                {/* Empty State when totalInvested === 0 */}
                {fundsData.totalInvested === 0 && (
                  <div className="text-center py-8 text-gray-400 border-t border-gray-100 mt-4">
                    <div className="text-5xl mb-4">📊</div>
                    <p className="font-semibold text-gray-600">
                      No investments yet
                    </p>
                    <p className="text-sm mt-1">
                      Buy your first stock from the watchlist
                      to start building your portfolio.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* P&L Breakdown Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">P&L Breakdown</h3>

              <div className="space-y-6">
                {/* Realized P&L Row */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-start space-x-3">
                    {fundsData.realizedPnL >= 0 ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-bold text-sm">Realized P&L</span>
                        <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          LOCKED IN
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Profit/loss from completed sells
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-lg font-extrabold font-mono ${
                      fundsData.realizedPnL >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {fundsData.realizedPnL >= 0 ? "+" : ""}
                    {fmt(fundsData.realizedPnL)}
                  </span>
                </div>

                {/* Unrealized P&L Row */}
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-bold text-sm">Unrealized P&L</span>
                        <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          OPEN
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Floating profit on open positions
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-lg font-extrabold font-mono ${
                      fundsData.unrealizedPnL >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {fundsData.unrealizedPnL >= 0 ? "+" : ""}
                    {fmt(fundsData.unrealizedPnL)}
                  </span>
                </div>

                {/* Divider line */}
                <div className="border-t border-gray-150"></div>

                {/* Total P&L Premium Dark Card */}
                <div
                  className={`bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white transition-all duration-300 ${
                    fundsData.totalPnL >= 0
                      ? "shadow-[0_4px_25px_rgba(16,185,129,0.15)]"
                      : "shadow-[0_4px_25px_rgba(244,63,94,0.15)]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                        Total P&L
                      </span>
                      <p className="text-gray-500 text-[10px] mt-0.5">Realized + Unrealized</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-2xl font-extrabold font-mono ${
                          fundsData.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {fundsData.totalPnL >= 0 ? "+" : ""}
                        {fmt(fundsData.totalPnL)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col sm:flex-row sm:justify-between text-xs gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 font-semibold">Overall Return:</span>
                      <span
                        className={`font-semibold font-mono ${
                          overallReturn >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {overallReturn >= 0 ? "+" : ""}
                        {overallReturn.toFixed(2)}%
                      </span>
                    </div>
                    {investedReturn !== null && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 font-semibold">Return on Investment:</span>
                        <span
                          className={`font-semibold font-mono ${
                            investedReturn >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {investedReturn >= 0 ? "+" : ""}
                          {investedReturn.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation & Holdings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Allocation Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Allocation</h3>
              
              {!hasHoldings ? (
                <p className="text-sm text-gray-500 mb-4 text-center mt-2">
                  No holdings yet. Start buying stocks to see your portfolio allocation.
                </p>
              ) : (
                <p className="text-sm text-gray-500 mb-4">
                  Asset allocation by instrument based on current market values
                </p>
              )}

               <div className="flex flex-col items-center justify-center">
                <div ref={chartRef} className="w-full flex items-center justify-center" style={{ height: '280px' }}>
                  {chartWidth > 0 && (
                    <PieChart width={chartWidth} height={280}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={hasHoldings ? 3 : 0}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                    </PieChart>
                  )}
                </div>

                {/* Legend */}
                <div className="w-full mt-4 space-y-2.5 border-t border-gray-100 pt-4">
                  {pieData.map((entry, index) => {
                    const val = entry.value;
                    const total = hasHoldings ? totalHoldingsValue : (fundsData.available || 100000);
                    const percent = total > 0 ? (val / total) * 100 : 0;
                    const color = pieColors[index % pieColors.length];
                    return (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                          <span className="font-semibold text-gray-900">{entry.name}</span>
                        </div>
                        <div className="text-gray-500 flex items-center space-x-2 font-mono">
                          <span>{fmt(val)}</span>
                          <span className="text-gray-300">|</span>
                          <span className="font-bold text-gray-700">{percent.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Holdings Overview Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Holdings Overview</h3>

              {!hasHoldings ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <PieChartIcon className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="font-semibold text-gray-600">No holdings yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start trading to see your holdings stats.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Total Holdings Count */}
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 text-sm">
                    <span className="text-gray-500">Total Holdings</span>
                    <span className="font-semibold text-gray-900">{holdings.length} {holdings.length === 1 ? "stock" : "stocks"}</span>
                  </div>

                  {/* Best Performer */}
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 text-sm">
                    <span className="text-gray-500">Best Performer</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{bestPerformer?.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-100`}>
                        +{bestPerformer?.pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Worst Performer */}
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 text-sm">
                    <span className="text-gray-500">Worst Performer</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{worstPerformer?.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                        worstPerformer?.pnlPercent >= 0 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {worstPerformer?.pnlPercent >= 0 ? "+" : ""}{worstPerformer?.pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Highest Investment */}
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 text-sm">
                    <span className="text-gray-500">Highest Investment</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{highestInvestmentStock?.name}</span>
                      <span className="font-mono text-gray-600 text-xs">({fmt(highestInvestmentStock?.investedValue)})</span>
                    </div>
                  </div>

                  {/* Total Current Value */}
                  <div className="flex justify-between items-center py-2.5 pt-4 text-sm">
                    <span className="text-gray-900 font-bold">Total Current Value</span>
                    <span className="font-mono font-extrabold text-gray-900 text-lg">{fmt(totalHoldingsValue)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction History (Deposits & Withdrawals)
            </h3>
            {!fundsData.transactions || fundsData.transactions.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No recent add or withdraw transactions.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-150 text-gray-400 font-semibold uppercase text-xs">
                      <th className="pb-3">Date & Time</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...fundsData.transactions].reverse().map((t, index) => (
                      <tr key={index} className="text-gray-700">
                        <td className="py-3.5">
                          {new Date(t.date).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              t.type === 'add'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                t.type === 'add' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            ></span>
                            {t.type === 'add' ? 'Funds Deposited' : 'Funds Withdrawn'}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 text-right font-bold text-base font-mono ${
                            t.type === 'add' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {t.type === 'add' ? '+' : '-'} {fmt(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Commodity Margin Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm opacity-60">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Commodity Margin
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Not activated for this simulation
                </p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-semibold">
                Disabled
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Funds;