import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import "./index.css";

import PremiumLanding from "./premium_landing/PremiumLanding";
import Navbar from "./premium_landing/landing_page/Navbar";
import Footer from "./premium_landing/landing_page/Footer";
import AuthModal from "./premium_landing/landing_page/components/AuthModal";
import VerifyEmail from "./VerifyEmail";
import TickerBar from "./premium_landing/landing_page/components/TickerBar";

// Production URLs — hardcoded as fallback so they always work
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://niveshcapital-backend.onrender.com';
const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || 'https://niveshcapital-dashboard.vercel.app';

function Home() {
  const [activeModal, setActiveModal] = useState(null);
  const [prefillEmail, setPrefillEmail] = useState('');
  const [prefillPassword, setPrefillPassword] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    document.title = 'NiveshCapital - Invest Smarter';
    // Keep Render backend alive — ping every 10 minutes
    const keepAlive = () => {
      fetch('https://niveshcapital-backend.onrender.com/')
        .catch(() => { })
    }
    keepAlive()
    const interval = setInterval(keepAlive, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, []);

  const handleTryDemo = async () => {
    try {
      setDemoLoading(true)
      const res = await axios.post('/login', {
        email: 'demo@niveshcapital.com',
        password: 'Demo@1234'
      })

      localStorage.setItem('token', res.data.token || res.data.accessToken)
      localStorage.setItem('user', JSON.stringify({
        id: res.data.id,
        name: res.data.name,
        email: res.data.email
      }))

      const token = res.data.token || res.data.accessToken
      const redirectUrl = `${DASHBOARD_URL}/?id=${res.data.id}&name=${encodeURIComponent(res.data.name)}&email=${encodeURIComponent(res.data.email)}&token=${token}`
      window.location.href = redirectUrl
    } catch (err) {
      console.error('Demo login error:', err.message)
      alert('Demo account not available. Please sign up instead.')
    } finally {
      setDemoLoading(false)
    }
  }

  const handleOpenSignIn = () => {
    setPrefillEmail('')
    setPrefillPassword('')
    setActiveModal('signin')
  }

  const handleOpenGetStarted = () => {
    setPrefillEmail('')
    setPrefillPassword('')
    setActiveModal('getstarted')
  }

  return (
    <>
      <TickerBar />
      <Navbar
        onSignIn={handleOpenSignIn}
        onGetStarted={handleOpenGetStarted}
        onTryDemo={handleTryDemo}
        demoLoading={demoLoading}
      />
      <PremiumLanding
        onSignIn={handleOpenSignIn}
        onGetStarted={handleOpenGetStarted}
      />
      <Footer />
      {activeModal && (
        <AuthModal
          type={activeModal === 'getstarted' ? 'signup' : activeModal}
          prefillEmail={prefillEmail}
          prefillPassword={prefillPassword}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </Router>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<App />)