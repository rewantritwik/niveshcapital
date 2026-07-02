import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const { user, refreshTrigger } = useContext(GeneralContext);

  useEffect(() => {
    document.title = 'Orders - NiveshCapital';
  }, []);

  const fetchOrders = (pageNum = 1) => {
    setIsLoading(true);
    setIsError(false);
    const token = localStorage.getItem("token");

    axios
      .get(
        `http://localhost:3005/allOrders?page=${pageNum}&limit=50`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      )
      .then((res) => {
        
        setAllOrders(res.data.orders || []);
        setTotalOrders(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setPage(res.data.page || 1);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setIsError(true);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders(1);
  }, [user, refreshTrigger]);

  
  const formatTime = (createdAt) => {
    if (!createdAt) return "—";
    const date = new Date(createdAt);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  
  const fmt = (val) =>
    parseFloat(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="border-b pb-4 flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex space-x-4 p-4 border-b items-center">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-left font-sans">

      {}
      <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            Complete transaction history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded border border-gray-200">
            {totalOrders} total orders
          </span>
          <button
            onClick={() => fetchOrders(1)}
            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold text-xs rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {}
      {isError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm font-medium">Failed to load orders.</span>
          <button
            onClick={() => fetchOrders(1)}
            className="text-xs font-bold bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg"
          >
            Retry
          </button>
        </div>
      )}

      {}
      {!isError && allOrders.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="p-4 bg-gray-50 rounded-full text-gray-400 border border-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              No orders placed yet
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mt-1 mx-auto">
              Select a stock from the watchlist and click Buy or Sell to get
              started.
            </p>
          </div>
        </div>
      )}

      {}
      {allOrders.length > 0 && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-[700px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Instrument
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-sm">
                {allOrders.map((order, idx) => {
                  const orderType = order.mode || "BUY";
                  const isBuy = orderType === "BUY";
                  const total = order.total || order.qty * order.price;

                  return (
                    <tr
                      key={order._id || idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {}
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                        {formatTime(order.createdAt)}
                      </td>

                      {}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${isBuy
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-rose-50 text-rose-600 border border-rose-200"
                            }`}
                        >
                          {orderType}
                        </span>
                      </td>

                      {}
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        {order.name}
                      </td>

                      {}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                        {order.qty}
                      </td>

                      {}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                        ₹{fmt(order.price)}
                      </td>

                      {}
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${isBuy ? "text-rose-600" : "text-emerald-600"
                          }`}
                      >
                        {isBuy ? "-" : "+"}₹{fmt(total)}
                      </td>

                      {}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                          {order.status || "Executed"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-2">
              <button
                onClick={() => fetchOrders(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => fetchOrders(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;