import React, { useState, useRef, useEffect } from 'react';

const ChevronDown = ({ className }) => (
  <svg className={className} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function RegistrationDropdown({ label, placeholder, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="reg-dropdown" ref={ref}>
      <button
        className={`reg-dropdown-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <div className="reg-dropdown-trigger-content">
          <span className="reg-dropdown-label">{label}</span>
          {value ? (
            <span className="reg-dropdown-value">{value}</span>
          ) : (
            <span className="reg-dropdown-placeholder">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`reg-dropdown-chevron ${open ? 'open' : ''}`} />
      </button>
      {open && options.length > 0 && (
        <div className="reg-dropdown-menu">
          {options.map((opt) => (
            <button
              key={opt}
              className={`reg-dropdown-option ${value === opt ? 'selected' : ''}`}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
              type="button"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
