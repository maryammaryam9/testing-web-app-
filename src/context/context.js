import React, { createContext, useState } from "react";

const AppContext = createContext();

function ContextProvider({ children }) {
  const [isChatSearch, setIsChatSearch] = useState(false);

  const resetContext = () => {
    setIsChatSearch(false);
  };  

  return (
    <AppContext.Provider
      value={{
        isChatSearch: [isChatSearch, setIsChatSearch],
        resetContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export { AppContext, ContextProvider };
