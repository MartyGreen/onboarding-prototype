import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function WarningTooltip({ text = 'Поле не заполненно' }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  const show = useCallback(() => {
    if (!iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    setPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 4,
    });
    setVisible(true);
  }, []);

  const hide = useCallback(() => setVisible(false), []);

  return (
    <>
      <img
        ref={iconRef}
        src={`${import.meta.env.BASE_URL}assets/icon-warning-circle.svg`}
        alt={text}
        className="w-[18px] h-[18px] cursor-help shrink-0"
        onMouseEnter={show}
        onMouseLeave={hide}
      />
      {visible && createPortal(
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 99999,
            pointerEvents: 'none',
            filter: 'drop-shadow(0px 5px 7.5px rgba(0,0,0,0.05))',
          }}
        >
          {/* Arrow pointing left */}
          <svg
            width="9"
            height="18"
            viewBox="0 0 9 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', flexShrink: 0, marginRight: -1 }}
          >
            <path d="M9 0L9 18L0 9L9 0Z" fill="white" />
          </svg>
          <div
            style={{
              background: '#ffffff',
              color: '#191919',
              fontSize: 14,
              fontWeight: 400,
              lineHeight: '18px',
              letterSpacing: '0.14px',
              padding: '20px',
              borderRadius: 12,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {text}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
