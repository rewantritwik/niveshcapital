import { useState, useEffect } from "react";
import axios from "axios";


export default function useLivePrices(symbols = []) {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    const fetchPrices = () => {
      const symbolsParam = symbols.join(",");
      axios
        .get(`/stockPrices?symbols=${symbolsParam}`)
        .then((res) => {
          setPrices(res.data);
        })
        .catch((err) => {
          console.error("Error fetching live prices in hook:", err);
        });
    };

    
    fetchPrices();

    
    const interval = setInterval(fetchPrices, 60000);

    return () => clearInterval(interval);
  }, [JSON.stringify(symbols)]); 

  return prices;
}
