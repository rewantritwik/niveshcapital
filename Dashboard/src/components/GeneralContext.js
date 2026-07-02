import React, { useContext } from "react";

const GeneralContext = React.createContext({
  openBuyWindow: (uid, mode) => { },
  closeBuyWindow: () => { },
  user: null,
  setUser: () => { },
  funds: 0,
  setFunds: () => { },
  addFunds: () => { },
  withdrawFunds: () => { },
  refreshTrigger: 0,
  triggerRefresh: () => { },
  showToast: () => { },
  toastQueue: [],
  dismissToast: () => { },
  isInitializing: true
});

export const useGeneralContext = () => useContext(GeneralContext);

export default GeneralContext;