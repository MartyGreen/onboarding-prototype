import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function WarningTooltip({ text = 'Поле не заполнено' }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  const show = useCallback(() => {
    if (!iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    setPos({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
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
            transform: 'translate(-50%, -100%)',
            background: '#ffffff',
            color: '#191919',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: '18px',
            letterSpacing: '0.14px',
            padding: '20px',
            borderRadius: 12,
            whiteSpace: 'nowrap',
            zIndex: 99999,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 5px 7.5px rgba(0,0,0,0.05))',
          }}
        >
          {text}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #ffffff',
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
