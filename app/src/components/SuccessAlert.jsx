import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);
  const [alertKey, setAlertKey] = useState(0);
  const timerRef = useRef(null);

  const showAlert = useCallback((message = 'Изменения сохранены') => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Force new render with unique key
    setAlertKey(prev => prev + 1);
    setAlert(message);
    timerRef.current = setTimeout(() => {
      setAlert(null);
      timerRef.current = null;
    }, 3000);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      <div className="relative flex-1 flex flex-col">
        {alert && (
          <div
            key={alertKey}
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
