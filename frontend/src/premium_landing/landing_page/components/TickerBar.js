import React, { useState, useEffect } from 'react'
import axios from 'axios'

const TickerBar = () => {
  const [stocks, setStocks] = useState([])

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await axios.get('http://localhost:3005/allStocks')
        
        const seen = new Set()
        const unique = res.data.filter(stock => {
          if (seen.has(stock.symbol)) return false
          seen.add(stock.symbol)
          return true
        })
        setStocks(unique)
      } catch (err) {
        console.error('Ticker fetch error:', err.message)
      }
    }
    fetchStocks()
    const interval = setInterval(fetchStocks, 30000)
    return () => clearInterval(interval)
  }, [])

  if (stocks.length === 0) return null

  
  const uniqueStocks = stocks.filter(
    (stock, index, self) =>
      index === self.findIndex(t => t.symbol === stock.symbol)
  )
  const tickerItems = [...uniqueStocks, ...uniqueStocks]

  return (
    <div className="bg-navy-950 border-b border-gray-800/50 overflow-x-hidden py-1.5 w-full">
      <div className="flex animate-ticker whitespace-nowrap">
        {tickerItems.map((stock, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-2 mx-6 text-xs"
          >
            <span className="text-gray-300 font-semibold">
              {stock.symbol}
            </span>
            <span className="text-white font-bold">
              ₹{stock.currentPrice.toLocaleString('en-IN', {
                minimumFractionDigits: 2
              })}
            </span>
            <span className={`font-semibold ${
              stock.changePercent >= 0 
                ? 'text-emerald-400' 
                : 'text-red-400'
            }`}>
              {stock.changePercent >= 0 ? '▲' : '▼'}
              {Math.abs(stock.changePercent).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default TickerBar
