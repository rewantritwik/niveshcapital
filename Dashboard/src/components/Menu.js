import React, { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import GeneralContext from "./GeneralContext";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, setUser, funds } = useContext(GeneralContext);
  const [tempName, setTempName] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setTempName(user.name);
  }, [user]);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!tempName.trim()) {
      alert("Name cannot be empty!");
      return;
    }
    setUser({ ...user, name: tempName.trim() });
    setIsEditing(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("funds");
    window.location.href = "http://localhost:3001";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const linkStyle = "text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition-all";
  const activeLinkStyle = "text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-semibold transition-all";

  return (
    <div className="flex items-center space-x-6">
      <div className="flex items-center space-x-2 mr-6">
        <svg
          width="24"
          height="24"
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
        <span className="text-gray-900 font-heading font-bold text-base tracking-wide">
          Nivesh<span className="text-emerald-600">Capital</span>
        </span>
      </div>
      <nav className="flex space-x-2">
        <Link to="/" onClick={() => handleMenuClick(0)} className={selectedMenu === 0 ? activeLinkStyle : linkStyle}>
          Dashboard
        </Link>
        <Link to="/orders" onClick={() => handleMenuClick(1)} className={selectedMenu === 1 ? activeLinkStyle : linkStyle}>
          Orders
        </Link>
        <Link to="/holdings" onClick={() => handleMenuClick(2)} className={selectedMenu === 2 ? activeLinkStyle : linkStyle}>
          Holdings
        </Link>
        <Link to="/positions" onClick={() => handleMenuClick(3)} className={selectedMenu === 3 ? activeLinkStyle : linkStyle}>
          Positions
        </Link>
        <Link to="/funds" onClick={() => handleMenuClick(4)} className={selectedMenu === 4 ? activeLinkStyle : linkStyle}>
          Funds
        </Link>
      </nav>

      {}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="border-l border-gray-200 h-6 pl-6 flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs group-hover:bg-emerald-500 group-hover:text-white transition-all">
            {getInitials(user.name)}
          </div>
          <span className="text-gray-700 font-medium text-sm group-hover:text-gray-950 transition-colors uppercase font-sans tracking-wide">
            {user.name}
          </span>
          <span className="text-emerald-600 font-mono text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            ₹{(funds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-lg flex items-center justify-center">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold text-base leading-tight">{user.name}</h4>
                    {user.email && (
                      <p className="text-gray-500 text-xs mt-1">
                        Email: <span className="font-semibold text-gray-700 font-sans">{user.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Edit Profile Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <h4 className="text-gray-950 font-bold text-sm uppercase tracking-wider">Update Profile</h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-gray-500 text-xs font-semibold uppercase">User Name</label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full mt-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Guest User"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setTempName(user.name);
                    }}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;