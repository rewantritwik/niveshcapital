import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopBar from "./TopBar";
import WatchList from "./WatchList";
import Summary from "./Summary";
import Orders from "./Orders";
import Holdings from "./Holdings";
import Positions from "./Positions";
import Funds from "./Funds";
import GeneralContext, { useGeneralContext } from "./GeneralContext";
import BuyActionWindow from "./BuyActionWindow";
import Toast from "./Toast";
import '../utils/axiosConfig';

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
    window.location.href = 'http://localhost:3001';
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
            <Routes>
              <Route path="/" element={<Summary />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/holdings" element={<Holdings />} />
              <Route path="/positions" element={<Positions />} />
              <Route path="/funds" element={<Funds />} />
            </Routes>
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
        const res = await axios.post(
          'http://localhost:3005/verify',
          {},
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        if (res.data.status) {
          setUserState(parsedUser);
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

  useEffect(() => {
    if (isInitializing || !user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get('http://localhost:3005/allFunds', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data?.available !== undefined) {
          setFunds(res.data.available);
        }
      })
      .catch(err => console.error("Error syncing funds:", err));
  }, [user, isInitializing]);

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
      }}
    >
      <AppContent />
    </GeneralContext.Provider>
  );
};

export default App;