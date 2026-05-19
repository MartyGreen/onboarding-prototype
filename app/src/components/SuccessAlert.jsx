import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message = 'Изменения сохранены') => {
    setAlert(null);
    // Small delay to reset animation if called rapidly
    requestAnimationFrame(() => {
      setAlert(message);
      setTimeout(() => setAlert(null), 3000);
    });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      <div className="relative flex-1 flex flex-col">
        {alert && (
          <div
            key={Date.now()}
            className="fixed top-0 left-[240px] right-0 z-[100] flex flex-col items-center px-5 py-4 animate-slideDown"
            style={{ backgroundColor: '#5cad9a' }}
          >
            <p className="text-sm font-medium text-white leading-[18px] tracking-[0.14px] text-center w-full max-w-[640px] m-0">
              {alert}
            </p>
          </div>
        )}
        {children}
      </div>
    </AlertContext.Provider>
  );
}
