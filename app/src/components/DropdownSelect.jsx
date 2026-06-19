import React, { useState, useRef, useEffect } from 'react';

/**
 * DropdownSelect — дропдаун связей полей таблицы.
 * Точно по макету Figma (node 2735:55826).
 *
 * Размеры из Figma metadata:
 * - Popup: w=438, rounded-12, shadow 0 20 40 rgba(0,0,0,0.1), pt=4
 * - Content: py=5
 * - XS label: h=15, px=20
 * - Source Cell: h=60, px=20
 * - Divider: h=1, rgba(25,25,25,0.2) 0.5px
 * - Search frame: pt=12, Input: mx=10, h=44, rounded-12, border-2 #835de1
 * - Link Cells: h=60, px=20, no gap
 * - Icon containers: 40×40, rounded-12
 * - Icons: 24px (Arrow Up Outgoing Circle for source, Share Android for links)
 * - Chevron Right: 20px
 */
export default function DropdownSelect({ sourceDoc, links = [], onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const q = search.toLowerCase();
  const filteredLinks = q
    ? links.filter(l =>
        l.targetDoc?.name?.toLowerCase().includes(q) ||
        l.targetField?.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q))
      )
    : links;

  return (
    <div ref={ref} className="relative inline-flex">
      {/* Trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg bg-[rgba(131,93,225,0.1)] border-none cursor-pointer hover:bg-[rgba(131,93,225,0.2)] transition-colors"
      >
        {/* Link icon 12px */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M5 7L7 5" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M3.5 8.5L2.15 9.85C1.56 10.44 1.56 11.39 2.15 11.98C2.74 12.57 3.69 12.57 4.28 11.98L5.5 10.76" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M8.5 3.5L9.85 2.15C10.44 1.56 10.44 0.61 9.85 0.02C9.26 -0.57 8.31 -0.57 7.72 0.02L6.5 1.24" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span className="text-[11px] font-semibold text-[#835de1] leading-none">{links.length}</span>
        {/* Chevron down 10px */}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown popup */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1.5 z-50 bg-white rounded-[12px] shadow-[0px_20px_40px_rgba(0,0,0,0.1)] overflow-hidden"
          style={{ width: '438px', paddingTop: '4px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content wrapper: py=5 */}
          <div style={{ paddingTop: '5px', paddingBottom: '5px' }}>

            {/* ── Источник ── */}
            {sourceDoc && (
              <>
                {/* XS label: h=15, px=20 */}
                <div style={{ height: '15px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
                  <span className="text-xs text-[#676767] leading-[15px] tracking-[0.12px]">
                    Источник
                  </span>
                </div>

                {/* Source Cell: h=60, px=20, gap=12 between icon/text/chevron */}
                <div
                  className="flex items-center cursor-pointer hover:bg-[rgba(25,25,25,0.04)] transition-colors"
                  style={{ height: '60px', paddingLeft: '20px', paddingRight: '20px', gap: '12px' }}
                  onClick={() => {
                    setIsOpen(false);
                    setSearch('');
                    onNavigate?.(sourceDoc.id);
                  }}
                >
                  {/* Icon container 40×40, rounded-12 with background — Arrow Up Outgoing Circle 24px */}
                  <div className="shrink-0 flex items-center justify-center bg-[rgba(25,25,25,0.05)]" style={{ width: '40px', height: '40px', borderRadius: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#191919" strokeWidth="1.8"/>
                      <path d="M12 16V8" stroke="#191919" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M8.5 11.5L12 8L15.5 11.5" stroke="#191919" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {/* Text: title 16/500, description 14/400 */}
                  <div className="flex flex-col flex-1 min-w-0" style={{ gap: '2px' }}>
                    <span className="text-[16px] font-medium text-[#191919] leading-5 tracking-[0.16px] truncate">
                      {sourceDoc.name}
                    </span>
                    {sourceDoc.circles && (
                      <span className="text-[14px] text-[#676767] leading-[18px] tracking-[0.14px] truncate">
                        {sourceDoc.circles}
                      </span>
                    )}
                  </div>
                  {/* Chevron Right — 20px */}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="#191919" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Divider: h=1, fill at 0.5px */}
                <div style={{ height: '1px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: '0.5px', height: '0.5px', background: 'rgba(25,25,25,0.2)' }} />
                </div>
              </>
            )}

            {/* ── Связи ── */}
            <div style={{ paddingTop: '12px' }}>
              {/* Search: pb=6, px=10 */}
              <div style={{ paddingBottom: '6px', paddingLeft: '10px', paddingRight: '10px' }}>
                {/* Input: h=44, rounded-12, border-2 #835de1, bg rgba(25,25,25,0.05), px=20 */}
                <div
                  className="flex items-center overflow-hidden bg-[rgba(25,25,25,0.05)]"
                  style={{ height: '44px', borderRadius: '12px', border: '2px solid #835de1', paddingLeft: '20px', paddingRight: '20px' }}
                >
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ключ для других таблиц"
                    autoFocus
                    className="flex-1 text-[16px] text-[#191919] leading-5 tracking-[0.16px] placeholder:text-[#949494] bg-transparent border-none outline-none p-0 m-0"
                    style={{ fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* Link cells: each h=60, px=20, gap=12, no gap between cells */}
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {filteredLinks.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <span className="text-sm text-[#949494]">Ничего не найдено</span>
                  </div>
                )}
                {filteredLinks.map((link, i) => (
                  <div
                    key={i}
                    className="flex items-center cursor-pointer hover:bg-[rgba(25,25,25,0.04)] transition-colors"
                    style={{ height: '60px', paddingLeft: '20px', paddingRight: '20px', gap: '12px' }}
                    onClick={() => {
                      setIsOpen(false);
                      setSearch('');
                      onNavigate?.(link.targetDocId, link.targetField);
                    }}
                  >
                    {/* Icon container 40×40, rounded-12 with background — Share Android 24px */}
                    <div className="shrink-0 flex items-center justify-center bg-[rgba(25,25,25,0.05)]" style={{ width: '40px', height: '40px', borderRadius: '12px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="18" cy="5" r="2.5" stroke="#191919" strokeWidth="1.8"/>
                        <circle cx="6" cy="12" r="2.5" stroke="#191919" strokeWidth="1.8"/>
                        <circle cx="18" cy="19" r="2.5" stroke="#191919" strokeWidth="1.8"/>
                        <path d="M8.59 13.51L15.42 17.49" stroke="#191919" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M15.41 6.51L8.59 10.49" stroke="#191919" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    {/* Text: title 16/500, description 14/400 */}
                    <div className="flex flex-col flex-1 min-w-0" style={{ gap: '2px' }}>
                      <span className="text-[16px] font-medium text-[#191919] leading-5 tracking-[0.16px] truncate">
                        {link.targetDoc?.name || 'Неизвестная таблица'}
                      </span>
                      {link.targetDoc?.circles && (
                        <span className="text-[14px] text-[#676767] leading-[18px] tracking-[0.14px] truncate">
                          {link.targetDoc.circles}
                        </span>
                      )}
                    </div>
                    {/* Chevron Right — 20px */}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                      <path d="M7.5 5L12.5 10L7.5 15" stroke="#191919" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
