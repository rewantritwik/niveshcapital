import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid, mode = "BUY" }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0);
  const [isLiveFetched, setIsLiveFetched] = useState(false);
  const [ownedQty, setOwnedQty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [priceLoading, setPriceLoading] = useState(true);

  const {
    closeBuyWindow,
    user,
    funds,
    setFunds,
    triggerRefresh,
    showToast,
  } = useContext(GeneralContext);

  const isBuy = mode === "BUY";
  const cost = parseFloat((stockQuantity * stockPrice).toFixed(2));

  
  
  
  useEffect(() => {
    if (!uid) return;
    setPriceLoading(true);
    setErrorMsg("");

    axios
      .get(`http://localhost:3005/stockPrice/${uid}`)
      .then((res) => {
        if (res.data && res.data.currentPrice) {
          setStockPrice(res.data.currentPrice);
          setIsLiveFetched(true);
        }
        setPriceLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching live price:", err);
        setPriceLoading(false);
        setIsLiveFetched(false);
      });
  }, [uid]);

  
  
  
  useEffect(() => {
    if (isBuy || !uid) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`http://localhost:3005/allHoldings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const holding = res.data.find((h) => h.name === uid);
        setOwnedQty(holding ? holding.qty : 0);
      })
      .catch(() => setOwnedQty(0));
  }, [uid, isBuy, user]);

  
  
  
  const handleTradeClick = async () => {
    setErrorMsg("");

    
    if (stockQuantity <= 0) {
      setErrorMsg("Quantity must be at least 1.");
      return;
    }
    if (stockPrice <= 0) {
      setErrorMsg("Price must be greater than zero.");
      return;
    }
    if (isBuy && cost > funds) {
      setErrorMsg(
        `Insufficient funds. Available: ₹${funds.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}, Required: ₹${cost.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}`
      );
      return;
    }
    if (!isBuy && ownedQty !== null && stockQuantity > ownedQty) {
      setErrorMsg(
        `You only own ${ownedQty} shares of ${uid}. Cannot sell ${stockQuantity}.`
      );
      return;
    }

    const token = localStorage.getItem("token");

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3005/newOrder",
        {
          name: uid,
          qty: stockQuantity,
          price: stockPrice,
          mode,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      
      if (res.data.updatedFunds !== undefined) {
        setFunds(res.data.updatedFunds);
        localStorage.setItem("funds", res.data.updatedFunds.toString());
      }

      
      if (showToast) {
        showToast({
          type: "success",
          message: isBuy
            ? `Bought ${stockQuantity} shares of ${uid} at ₹${stockPrice.toFixed(2)}`
            : `Sold ${stockQuantity} shares of ${uid} at ₹${stockPrice.toFixed(2)}${res.data.realizedPnL !== undefined
              ? ` | P&L: ${res.data.realizedPnL >= 0 ? "+" : ""}₹${res.data.realizedPnL.toFixed(2)}`
              : ""
            }`,
        });
      }

      
      triggerRefresh();

      
      closeBuyWindow();

    } catch (err) {
      console.error("Order error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Order failed. Please try again.";
      setErrorMsg(typeof msg === "string" ? msg : JSON.stringify(msg));

      if (showToast) {
        showToast({
          type: "error",
          message: typeof msg === "string" ? msg : "Order failed.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = () => {
    closeBuyWindow();
  };

  
  const isSellDisabled =
    !isBuy && ownedQty !== null && (ownedQty === 0 || stockQuantity > ownedQty);

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-5"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 1000,
        width: "400px",
      }}
    >
      {}
      <div
        className={`flex justify-between items-center mb-5 pb-3 border-b ${isBuy ? "border-emerald-100" : "border-rose-100"
          }`}
      >
        <div>
          <h3
            className={`font-extrabold text-xl uppercase font-mono tracking-wide ${isBuy ? "text-emerald-600" : "text-rose-600"
              }`}
          >
            {mode} {uid}
          </h3>
          <p className="text-gray-400 text-xs mt-0.5">
            {isBuy ? "Place a buy order" : "Place a sell order"}
          </p>
        </div>
        <button
          onClick={handleCancelClick}
          className="text-gray-400 hover:text-gray-600 font-bold text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">

        {}
        <div className="grid grid-cols-2 gap-4">

          {}
          <div>
            <label className="text-gray-500 text-xs font-semibold uppercase block mb-1.5">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={stockQuantity}
              onChange={(e) =>
                setStockQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {}
            {!isBuy && ownedQty !== null && (
              <p
                className={`text-xs mt-1 font-medium ${ownedQty === 0 ? "text-rose-500" : "text-gray-500"
                  }`}
              >
                You own: {ownedQty} shares
              </p>
            )}
          </div>

          {}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-gray-500 text-xs font-semibold uppercase">
                Price (₹)
              </label>
              {}
              <span
                className={`text-[10px] font-semibold flex items-center gap-1 ${isLiveFetched ? "text-emerald-600" : "text-gray-400"
                  }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isLiveFetched
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-gray-300"
                    }`}
                ></span>
                {priceLoading
                  ? "Fetching..."
                  : isLiveFetched
                    ? "Simulated Live"
                    : "Manual"}
              </span>
            </div>
            <input
              type="number"
              step="0.05"
              min="0.05"
              value={stockPrice}
              onChange={(e) =>
                setStockPrice(
                  Math.max(0.05, parseFloat(e.target.value) || 0.05)
                )
              }
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {}
        <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">
              {isBuy ? "Total Cost" : "You Receive"}
            </span>
            <span className="font-bold text-gray-900">
              ₹
              {cost.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Available Funds</span>
            <span
              className={`font-semibold ${isBuy && cost > funds ? "text-rose-600" : "text-emerald-600"
                }`}
            >
              ₹
              {funds.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {isBuy && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">After Trade</span>
              <span
                className={`font-semibold ${funds - cost < 0 ? "text-rose-600" : "text-gray-700"
                  }`}
              >
                ₹
                {Math.max(0, funds - cost).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>

        {}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium rounded-lg px-3 py-2.5">
            ⚠️ {errorMsg}
          </div>
        )}

        {}
        {!isBuy && ownedQty === 0 && (
          <div className="bg-rose-50 border border-rose-100 text-rose-500 text-xs rounded-lg px-3 py-2">
            You don't own any {uid} shares. Buy first, then sell.
          </div>
        )}

        {}
        <div className="flex space-x-3 pt-1">
          <button
            onClick={handleCancelClick}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTradeClick}
            disabled={isLoading || isSellDisabled}
            className={`flex-1 py-3 font-bold text-sm rounded-xl transition-colors shadow-lg
              ${isLoading ? "opacity-60 cursor-not-allowed" : ""}
              ${isSellDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : isBuy
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
              }
            `}
          >
            {isLoading
              ? "Processing..."
              : isBuy
                ? `Buy ${uid}`
                : `Sell ${uid}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;