import React, { useContext } from "react";
import GeneralContext from "./GeneralContext";

const Toast = () => {
  const { toastQueue, dismissToast } = useContext(GeneralContext);

  if (!toastQueue || toastQueue.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toastQueue.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between gap-4 px-5 py-4 
            rounded-xl shadow-xl text-white font-semibold text-sm
            min-w-72 max-w-96 animate-slide-up
            ${toast.type === "success" ? "bg-emerald-500" : ""}
            ${toast.type === "error" ? "bg-rose-500" : ""}
            ${toast.type === "info" ? "bg-blue-500" : ""}
          `}
        >
          <div className="flex items-center gap-3">
            {toast.type === "success" && <span className="text-lg">✅</span>}
            {toast.type === "error" && <span className="text-lg">❌</span>}
            {toast.type === "info" && <span className="text-lg">ℹ️</span>}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-white/80 hover:text-white font-bold text-lg 
              leading-none ml-2 flex-shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
