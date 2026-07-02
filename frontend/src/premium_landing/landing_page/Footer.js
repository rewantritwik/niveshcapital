import React from "react";

function Footer() {
  return (
    <footer className="bg-navy-950 text-gray-400 py-16 border-t border-gray-800/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {}
          <div className="lg:col-span-2 space-y-4">
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
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              AI-powered wealth management and investment intelligence platform. Redefining modern financial growth and learning.
            </p>
            
          </div>

          {}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">About</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>About Us</span>
              </li>
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Careers</span>
              </li>
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Press</span>
              </li>
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Blog</span>
              </li>
            </ul>
          </div>

          {}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Features</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Portfolio Tracker</span>
              </li>
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Stock Watchlist</span>
              </li>
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Market Insights</span>
              </li>
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Trading Sandbox</span>
              </li>
            </ul>
          </div>

          {}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Academy</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Beginner Courses</span>
              </li>
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Mutual Funds</span>
              </li>
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Trading Concepts</span>
              </li>
              <li>
                <span title="Coming soon" className="hover:text-emerald-400 transition-colors duration-150 cursor-pointer" onClick={(e) => e.preventDefault()}>Help Center</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800/80 my-10" />

        <div className="space-y-4 text-[11px] text-gray-500 leading-relaxed">

          <div className="bg-navy-900/50 border border-gray-800/50 rounded-xl p-4 mb-8 text-center">
            <p className="text-gray-500 text-xs leading-relaxed">
              ⚠️ <strong className="text-gray-400">Disclaimer:</strong>{' '}
              NiveshCapital is an educational stock market simulator
              built for learning purposes only. All trades use virtual
              money. Stock prices are simulated and do not reflect real
              market values. This is not a real trading platform and
              does not constitute financial advice. No real money is
              involved.
            </p>
          </div>

          <p className="text-center pt-4 mb-0 text-xs">
            &copy; {new Date().getFullYear()} NiveshCapital. All rights reserved. Built for the next generation of investors.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
