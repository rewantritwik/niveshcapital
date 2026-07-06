import React, { useContext } from "react";
import Menu from "./Menu";
import GeneralContext from "./GeneralContext";

const TopBar = () => {
  // Read index prices from centralized context instead of separate useLivePrices hook
  const { stockPrices } = useContext(GeneralContext);
  
  const niftyData = stockPrices["^NSEI"];
  const sensexData = stockPrices["^BSESN"];

  const nifty = {
    price: niftyData?.currentPrice || niftyData?.price || 23456.75,
    change: niftyData?.changePercent ?? niftyData?.change ?? 2.45,
  };
  const sensex = {
    price: sensexData?.currentPrice || sensexData?.price || 77890.25,
    change: sensexData?.changePercent ?? sensexData?.change ?? 2.18,
  };

  const isNiftyUp = nifty.change >= 0;
  const isSensexUp = sensex.change >= 0;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center text-sm font-sans select-none">
      <div className="flex space-x-6">
        <div className="flex items-center space-x-2">
          <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider">NIFTY 50</p>
          <p className={isNiftyUp ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
            {nifty.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-xs font-semibold ${isNiftyUp ? "text-emerald-600" : "text-rose-600"}`}>
            {isNiftyUp ? "+" : ""}{nifty.change.toFixed(2)}%
          </p>
        </div>
        <div className="flex items-center space-x-2 border-l border-gray-200 pl-6">
          <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider">SENSEX</p>
          <p className={isSensexUp ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
            {sensex.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-xs font-semibold ${isSensexUp ? "text-emerald-600" : "text-rose-600"}`}>
            {isSensexUp ? "+" : ""}{sensex.change.toFixed(2)}%
          </p>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;