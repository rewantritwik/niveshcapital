import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

function Navbar({ onSignIn, onGetStarted, onTryDemo, demoLoading }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { passive: true });
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-navy-950/80 backdrop-blur-lg border-b border-gray-800/80 py-4" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {}
        <a className="flex items-center gap-2 font-heading font-extrabold text-xl text-white tracking-tight" href="/">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="#10B981" />
            <path
              d="M8 22V10C8 8.89543 8.89543 8 10 8H16C17.1046 8 18 8.89543 18 10V22"
              stroke="#0a0f1d"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M14 24H22C23.1046 24 24 23.1046 24 22V15C24 13.8954 23.1046 13 22 13H18"
              stroke="#0a0f1d"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span>Nivesh<span className="text-emerald-500">Capital</span></span>
        </a>

        {}
        <div className="hidden md:flex items-center gap-8">
          <a className="text-gray-300 hover:text-white font-medium text-sm transition-colors duration-200" href="#market">
            Market
          </a>
          <a className="text-gray-300 hover:text-white font-medium text-sm transition-colors duration-200" href="#dashboard">
            Portfolio Tracker
          </a>
          <a className="text-gray-300 hover:text-white font-medium text-sm transition-colors duration-200" href="#how-it-works">
            How It Works
          </a>
          <a className="text-gray-300 hover:text-white font-medium text-sm transition-colors duration-200" href="#why-us">
            Why Us
          </a>
        </div>

        {}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="text-gray-300 hover:text-white font-semibold 
              text-sm transition-colors duration-200 bg-transparent border-0 cursor-pointer"
          >
            Sign In
          </button>

          <button
            onClick={onTryDemo}
            disabled={demoLoading}
            className="px-4 py-2 border border-emerald-500/40 
              text-emerald-400 hover:bg-emerald-500/10 font-semibold 
              text-sm rounded-xl transition-all duration-200 bg-transparent cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {demoLoading ? 'Loading...' : 'Try Demo'}
          </button>

          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 
              text-navy-950 font-bold text-sm rounded-xl transition-all 
              duration-200 flex items-center gap-1.5 shadow-lg 
              shadow-emerald-500/10 cursor-pointer border-0"
          >
            Get Started <ArrowUpRight size={16} />
          </button>
        </div>

        {}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors duration-200 bg-transparent border-0"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-950 border-b border-gray-800/80 absolute top-full left-0 right-0 py-6 px-6 space-y-4 shadow-xl">
          <a 
            onClick={() => setMobileMenuOpen(false)} 
            className="block text-gray-300 hover:text-white font-semibold text-base py-2 transition-colors duration-200" 
            href="#market"
          >
            Market
          </a>
          <a 
            onClick={() => setMobileMenuOpen(false)} 
            className="block text-gray-300 hover:text-white font-semibold text-base py-2 transition-colors duration-200" 
            href="#dashboard"
          >
            Portfolio Tracker
          </a>
          <a 
            onClick={() => setMobileMenuOpen(false)} 
            className="block text-gray-300 hover:text-white font-semibold text-base py-2 transition-colors duration-200" 
            href="#how-it-works"
          >
            How It Works
          </a>
          <a 
            onClick={() => setMobileMenuOpen(false)} 
            className="block text-gray-300 hover:text-white font-semibold text-base py-2 transition-colors duration-200" 
            href="#why-us"
          >
            Why Us
          </a>
          <div className="pt-4 border-t border-gray-800 flex flex-col gap-4">
            <button 
              onClick={() => { setMobileMenuOpen(false); onSignIn(); }} 
              className="text-center text-gray-300 hover:text-white font-semibold text-base py-2 transition-colors duration-200 bg-transparent border-0 cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onTryDemo(); }} 
              disabled={demoLoading}
              className="w-full text-center py-3 border border-emerald-500/40 text-emerald-400 font-semibold rounded-xl transition-all duration-200 bg-transparent cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {demoLoading ? 'Loading...' : 'Try Demo'}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onGetStarted(); }} 
              className="w-full text-center py-3 bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-bold rounded-xl transition-all duration-200 border-0 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
