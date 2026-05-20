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
    }, 1500);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      <div className="relative flex-1 flex flex-col">
        {alert && (
          <div
            key={alertKey}
            className="animate-slideDown"
            style={{
              position: 'fixed',
              top: 0,
              left: 245,
              right: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 50,
              backgroundColor: '#5cad9a',
              padding: '0 20px',
            }}
          >
            <p style={{
              margin: 0,
              fontFamily: "'TT Norms Tochka Extended', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              lineHeight: '18px',
              letterSpacing: '0.14px',
              color: '#ffffff',
              textAlign: 'center',
              width: '100%',
              maxWidth: 640,
            }}>
              {alert}
            </p>
          </div>
        )}
        {children}
      </div>
    </AlertContext.Provider>
  );
}
