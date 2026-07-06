
import React, { useState, useContext } from "react";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { DoughnutChart } from "./DoughnoutChart";


const DISPLAY_NAMES = {
  'RELIANCE': 'Reliance',
  'TCS': 'TCS',
  'INFY': 'Infosys',
  'HDFCBANK': 'HDFC Bank',
  'ICICIBANK': 'ICICI Bank',
  'AXISBANK': 'Axis Bank',
  'SBIN': 'SBI',
  'WIPRO': 'Wipro',
  'BHARTIARTL': 'Bharti Airtel',
  'HINDUNILVR': 'HUL',
  'ITC': 'ITC',
}

const WATCHLIST_SYMBOLS = [
  'RELIANCE',
  'TCS',
  'INFY',
  'HDFCBANK',
  'ICICIBANK',
  'AXISBANK',
  'SBIN',
  'WIPRO',
  'BHARTIARTL',
  'HINDUNILVR',
  'ITC',
]

const WatchList = () => {
  const [searchTerm, setSearchTerm] = useState("")
  // Consume centralized stock prices from context (no more self-fetching)
  const { stockPrices } = useContext(GeneralContext)

  const hasData = Object.keys(stockPrices).length > 0
  const lastUpdated = hasData ? new Date().toLocaleTimeString() : ""

  // Filter symbols based on search
  const filteredSymbols = WATCHLIST_SYMBOLS.filter(symbol =>
    symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (DISPLAY_NAMES[symbol] || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Chart data
  const chartData = {
    labels: filteredSymbols.map(s => DISPLAY_NAMES[s] || s),
    datasets: [
      {
        label: "Price",
        data: filteredSymbols.map(s =>
          stockPrices[s]?.currentPrice || 0
        ),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(255, 99, 132, 0.3)",
          "rgba(54, 162, 235, 0.3)",
          "rgba(255, 206, 86, 0.3)",
          "rgba(75, 192, 192, 0.3)",
          "rgba(153, 102, 255, 0.3)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="p-4 flex flex-col h-full bg-white font-sans text-left">

      {}
      <div className="relative flex items-center mb-2">
        <input
          type="text"
          placeholder="Search eg: infy, hdfc, reliance..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg 
            pl-3 pr-16 py-2 text-gray-900 text-sm focus:outline-none 
            focus:border-emerald-500 transition-colors"
        />
        <span className="absolute right-3 text-gray-400 text-xs">
          {filteredSymbols.length} / 50
        </span>
      </div>

      {}
      <div className="flex justify-between items-center px-1 mb-4 
        text-[10px] text-gray-400 select-none">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full 
              rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 
              bg-emerald-500"></span>
          </span>
          <span className="font-semibold uppercase tracking-wider text-emerald-600">
            Simulated Live
          </span>
          {lastUpdated && (
            <span className="text-gray-400">· {lastUpdated}</span>
          )}
        </div>
        <span>Updates every 30s</span>
      </div>

      {}
      <ul className="space-y-1 divide-y divide-gray-100">
        {!hasData ? (
          
          [1, 2, 3, 4, 5].map(i => (
            <li key={i} className="py-3 px-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </li>
          ))
        ) : (
          filteredSymbols.map((symbol, index) => (
            <WatchListItem
              key={index}
              symbol={symbol}
              displayName={DISPLAY_NAMES[symbol] || symbol}
              liveData={stockPrices[symbol]}
            />
          ))
        )}
      </ul>

      {}
      {filteredSymbols.length > 0 && hasData && (
        <div className="mt-4">
          <DoughnutChart data={chartData} />
        </div>
      )}
    </div>
  )
}

export default WatchList




const WatchListItem = ({ symbol, displayName, liveData }) => {
  const [showActions, setShowActions] = useState(false)

  
  
  const currentPrice = liveData?.currentPrice || 0
  const changePercent = liveData?.changePercent || 0
  const isDown = changePercent < 0

  return (
    <li
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="relative flex flex-col py-3 px-2 hover:bg-gray-50 
        rounded-lg transition-colors cursor-pointer group"
    >
      <div className="flex justify-between items-center w-full">
        {}
        <div>
          <p className={`font-semibold text-sm ${isDown ? "text-rose-600" : "text-emerald-600"
            }`}>
            {symbol}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            {displayName}
          </p>
        </div>

        {}
        <div className="flex items-center space-x-1.5 text-xs text-right">
          <span className={`font-medium ${isDown ? "text-rose-500" : "text-emerald-500"
            }`}>
            {changePercent >= 0 ? "+" : ""}
            {changePercent.toFixed(2)}%
          </span>
          {isDown ? (
            <KeyboardArrowDown className="text-rose-600 !text-sm" />
          ) : (
            <KeyboardArrowUp className="text-emerald-600 !text-sm" />
          )}
          <span className="font-bold text-gray-900 pl-1">
            ₹{currentPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {}
      {showActions && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 
          bg-white/95 backdrop-blur rounded pl-2 shadow-md border border-gray-100">
          <WatchListActions uid={symbol} />
        </div>
      )}
    </li>
  )
}




const WatchListActions = ({ uid }) => {
  const generalContext = useContext(GeneralContext)

  return (
    <span className="actions">
      <span>
        <Tooltip title="Buy (B)" placement="top" arrow TransitionComponent={Grow}>
          <button
            className="buy bg-emerald-500 hover:bg-emerald-600 text-white 
              font-semibold text-xs px-2.5 py-1 rounded"
            onClick={() => generalContext.openBuyWindow(uid, 'BUY')}
          >
            Buy
          </button>
        </Tooltip>
        <Tooltip title="Sell (S)" placement="top" arrow TransitionComponent={Grow}>
          <button
            className="sell bg-rose-500 hover:bg-rose-600 text-white 
              font-semibold text-xs px-2.5 py-1 rounded"
            onClick={() => generalContext.openBuyWindow(uid, 'SELL')}
          >
            Sell
          </button>
        </Tooltip>
      </span>
    </span>
  )
}