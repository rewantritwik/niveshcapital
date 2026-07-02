

export const watchlist = [
  { name: "RELIANCE", price: 2456.20, percent: "+1.45%", isDown: false },
  { name: "TCS", price: 3840.50, percent: "+2.10%", isDown: false },
  { name: "INFY", price: 1562.80, percent: "-0.85%", isDown: true },
  { name: "HDFCBANK", price: 1642.10, percent: "+1.85%", isDown: false },  
  { name: "ICICIBANK", price: 954.30, percent: "+3.12%", isDown: false },  
  { name: "AXISBANK", price: 1020.15, percent: "-1.20%", isDown: true },  
  { name: "SBIN", price: 612.40, percent: "+2.45%", isDown: false },  
  { name: "WIPRO", price: 482.90, percent: "-2.30%", isDown: true },
  { name: "BHARTIARTL", price: 1120.00, percent: "+1.75%", isDown: false },
  { name: "ITC", price: 435.50, percent: "-0.40%", isDown: true },
  { name: "HINDUNILVR", price: 2540.20, percent: "+0.95%", isDown: false },
]




export const holdings = [
  { name: "RELIANCE", qty: 10, avg: 2400.00, price: 2456.20, net: "+2.34%", day: "+1.45%" },
  { name: "TCS", qty: 5, avg: 3800.00, price: 3840.50, net: "+1.07%", day: "+2.10%" },
  { name: "INFY", qty: 15, avg: 1580.00, price: 1562.80, net: "-1.09%", day: "-0.85%", isLoss: true },
  { name: "HDFCBANK", qty: 12, avg: 1600.00, price: 1642.10, net: "+2.63%", day: "+1.85%" },  
  { name: "ICICIBANK", qty: 20, avg: 920.00, price: 954.30, net: "+3.73%", day: "+3.12%" },  
  { name: "WIPRO", qty: 25, avg: 500.00, price: 482.90, net: "-3.42%", day: "-2.30%", isLoss: true },
  { name: "BHARTIARTL", qty: 15, avg: 1100.00, price: 1120.00, net: "+1.82%", day: "+1.75%" },
  { name: "HINDUNILVR", qty: 8, avg: 2500.00, price: 2540.20, net: "+1.61%", day: "+0.95%" },
]

export const positions = [
  { product: "CNC", name: "AXISBANK", qty: 10, avg: 1030.00, price: 1020.15, net: "-0.96%", day: "-1.20%", isLoss: true },  
  { product: "CNC", name: "SBIN", qty: 20, avg: 600.00, price: 612.40, net: "+2.07%", day: "+2.45%" },                
  { product: "CNC", name: "RELIANCE", qty: 5, avg: 2420.00, price: 2456.20, net: "+1.50%", day: "+1.45%" },
  { product: "CNC", name: "TCS", qty: 2, avg: 3820.00, price: 3840.50, net: "+0.54%", day: "+2.10%" },
  { product: "CNC", name: "INFY", qty: 8, avg: 1570.00, price: 1562.80, net: "-0.46%", day: "-0.85%", isLoss: true },
  { product: "CNC", name: "HDFCBANK", qty: 6, avg: 1630.00, price: 1642.10, net: "+0.74%", day: "+1.85%" },               
  { product: "CNC", name: "ICICIBANK", qty: 15, avg: 940.00, price: 954.30, net: "+1.52%", day: "+3.12%" },               
]