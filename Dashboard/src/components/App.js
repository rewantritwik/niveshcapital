import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopBar from "./TopBar";
import WatchList from "./WatchList";
import Summary from "./Summary";
import GeneralContext, { useGeneralContext } from "./GeneralContext";
import BuyActionWindow from "./BuyActionWindow";
import Toast from "./Toast";
import '../utils/axiosConfig';

// Lazy-load route components to reduce initial bundle size (~60KB+ saved)
const Orders = lazy(() => import("./Orders"));
const Holdings = lazy(() => import("./Holdings"));
const Positions = lazy(() => import("./Positions"));
const Funds = lazy(() => import("./Funds"));

const LANDING_URL = process.env.REACT_APP_LANDING_URL || 'https://niveshcapital.vercel.app';

// All symbols fetched in a single request (watchlist + indices)
const ALL_PRICE_SYMBOLS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK',
  'AXISBANK', 'SBIN', 'WIPRO', 'BHARTIARTL', 'HINDUNILVR', 'ITC',
  '^NSEI', '^BSESN'
];

// Suspense fallback for lazy-loaded routes
const RouteFallback = () => (
  <div className="p-6 space-y-6">
    <div className="border-b pb-4">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
      ))}
    </div>
  </div>
);

const AppContent = () => {
  const {
    user,
    isInitializing,
    isModalOpen,
    modalStock,
    modalAction,
  } = useGeneralContext();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 
          border-t-transparent rounded-full">
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = LANDING_URL;
    return null;
  }

  return (
    <Router>
      <div className="flex flex-col h-screen overflow-hidden bg-white text-gray-900">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:flex md:w-96 border-r border-gray-200 
            flex-col overflow-y-auto bg-white">
            <WatchList />
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Summary />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/holdings" element={<Holdings />} />
                <Route path="/positions" element={<Positions />} />
                <Route path="/funds" element={<Funds />} />
              </Routes>
            </Suspense>
          </div>
        </div>
        {isModalOpen && (
          <BuyActionWindow uid={modalStock} mode={modalAction} />
        )}
        <Toast />
      </div>
    </Router>
  );
};

const App = () => {
  const [user, setUserState] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [funds, setFunds] = useState(100000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStock, setModalStock] = useState("");
  const [modalAction, setModalAction] = useState("BUY");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toastQueue, setToastQueue] = useState([]);

  // Centralized stock prices (shared between WatchList + TopBar)
  const [stockPrices, setStockPrices] = useState({});

  // Fetch all stock prices in a single API call
  const fetchAllPrices = useCallback(async () => {
    try {
      const symbols = ALL_PRICE_SYMBOLS.join(',');
      const res = await axios.get(`/stockPrices?symbols=${symbols}`);
      setStockPrices(res.data);
    } catch (err) {
      console.error('Error fetching stock prices:', err.message);
    }
  }, []);

  useEffect(() => {
    const initUser = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      const urlName = params.get('name');
      const urlEmail = params.get('email');
      const urlToken = params.get('token');

      if (urlId && urlName && urlToken) {
        const oldUser = localStorage.getItem("user");
        if (oldUser) {
          try {
            const parsed = JSON.parse(oldUser);
            if (parsed.id !== urlId) {
              localStorage.removeItem("funds");
            }
          } catch (e) { }
        }
        const urlUser = { id: urlId, name: urlName, email: urlEmail || '' };
        localStorage.setItem('user', JSON.stringify(urlUser));
        localStorage.setItem('token', urlToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        setUserState(urlUser);
        setIsInitializing(false);
        return;
      }

      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (!savedUser || !savedToken) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUserState(null);
        setIsInitializing(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);

        // Fire verify + funds + stock prices in PARALLEL instead of sequentially
        const [verifyRes, fundsRes] = await Promise.all([
          axios.post('/verify', {}, { headers: { Authorization: `Bearer ${savedToken}` } }),
          axios.get('/allFunds', { headers: { Authorization: `Bearer ${savedToken}` } }).catch(() => null),
        ]);

        if (verifyRes.data.status) {
          setUserState(parsedUser);
          if (fundsRes?.data?.available !== undefined) {
            setFunds(fundsRes.data.available);
          }
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUserState(null);
        }
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUserState(null);
      } finally {
        setIsInitializing(false);
      }
    };
    initUser();
  }, []);

  // Start stock price polling after user is authenticated
  useEffect(() => {
    if (isInitializing || !user) return;

    // Fetch immediately
    fetchAllPrices();

    // Poll every 30 seconds
    const interval = setInterval(fetchAllPrices, 30000);
    return () => clearInterval(interval);
  }, [user, isInitializing, fetchAllPrices]);

  // Re-sync funds when refreshTrigger changes (after trades)
  useEffect(() => {
    if (isInitializing || !user || refreshTrigger === 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get('/allFunds', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data?.available !== undefined) {
          setFunds(res.data.available);
        }
      })
      .catch(err => console.error("Error syncing funds:", err));
  }, [refreshTrigger, user, isInitializing]);

  const handleUserChange = (newUser) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  const showToast = ({ type = 'info', message }) => {
    const id = Date.now();
    setToastQueue(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToastQueue(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToastQueue(prev => prev.filter(t => t.id !== id));
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const openBuyWindow = (symbol, mode = "BUY") => {
    setModalStock(symbol);
    setModalAction(mode);
    setIsModalOpen(true);
  };

  const closeBuyWindow = () => {
    setIsModalOpen(false);
    setModalStock("");
    setModalAction("BUY");
  };

  return (
    <GeneralContext.Provider
      value={{
        user,
        setUser: handleUserChange,
        isInitializing,
        funds,
        setFunds,
        refreshTrigger,
        triggerRefresh,
        showToast,
        toastQueue,
        dismissToast,
        isModalOpen,
        modalStock,
        modalAction,
        openBuyWindow,
        closeBuyWindow,
        stockPrices,
        fetchAllPrices,
      }}
    >
      <AppContent />
    </GeneralContext.Provider>
  );
};

export default App;