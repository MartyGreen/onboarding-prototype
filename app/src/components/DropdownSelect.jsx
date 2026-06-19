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
export default function DropdownSelect({ sourceDoc, links = [], documents = [], onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [previewDocId, setPreviewDocId] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
        setPreviewDocId(null);
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

  const previewDoc = previewDocId ? documents.find(d => d.id === previewDocId) : null;
  const previewLink = previewDocId ? links.find(l => l.targetDocId === previewDocId) : null;

  return (
    <div ref={ref} className="relative inline-flex">
      {/* Trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setSearch('');
          setPreviewDocId(null);
        }}
        className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg bg-[rgba(131,93,225,0.1)] border-none cursor-pointer hover:bg-[rgba(131,93,225,0.2)] transition-colors"
      >
        {/* Link/chain icon 12px */}
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M6.5 9.5L9.5 6.5" stroke="#835de1" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M9 4L11.5 1.5C12.3284 0.671573 13.6716 0.671573 14.5 1.5C15.3284 2.32843 15.3284 3.67157 14.5 4.5L12 7L10.5 8.5" stroke="#835de1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 12L4.5 14.5C3.67157 15.3284 2.32843 15.3284 1.5 14.5C0.671573 13.6716 0.671573 12.3284 1.5 11.5L4 9L5.5 7.5" stroke="#835de1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
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
        <div className="absolute top-full left-0 mt-1.5 z-50 flex items-start gap-2">
          {/* Main dropdown */}
          <div
            className="bg-white rounded-[12px] shadow-[0px_20px_40px_rgba(0,0,0,0.1)] overflow-hidden shrink-0"
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
                      setPreviewDocId(null);
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
                  {filteredLinks.map((link, i) => {
                    const isActive = previewDocId === link.targetDocId;
                    return (
                    <div
                      key={i}
                      className={`flex items-center cursor-pointer transition-colors ${isActive ? 'bg-[rgba(131,93,225,0.06)]' : 'hover:bg-[rgba(25,25,25,0.04)]'}`}
                      style={{ height: '60px', paddingLeft: '20px', paddingRight: '20px', gap: '12px' }}
                      onClick={() => {
                        // Если превью уже открыто для этой таблицы — навигация
                        if (previewDocId === link.targetDocId) {
                          setIsOpen(false);
                          setSearch('');
                          setPreviewDocId(null);
                          onNavigate?.(link.targetDocId, link.targetField);
                        } else {
                          // Показываем превью
                          setPreviewDocId(link.targetDocId);
                        }
                      }}
                    >
                      {/* Icon container 40×40, rounded-12 with background — Share Android 24px */}
                      <div className={`shrink-0 flex items-center justify-center ${isActive ? 'bg-[rgba(131,93,225,0.12)]' : 'bg-[rgba(25,25,25,0.05)]'}`} style={{ width: '40px', height: '40px', borderRadius: '12px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="18" cy="5" r="2.5" stroke={isActive ? '#835de1' : '#191919'} strokeWidth="1.8"/>
                          <circle cx="6" cy="12" r="2.5" stroke={isActive ? '#835de1' : '#191919'} strokeWidth="1.8"/>
                          <circle cx="18" cy="19" r="2.5" stroke={isActive ? '#835de1' : '#191919'} strokeWidth="1.8"/>
                          <path d="M8.59 13.51L15.42 17.49" stroke={isActive ? '#835de1' : '#191919'} strokeWidth="1.8" strokeLinecap="round"/>
                          <path d="M15.41 6.51L8.59 10.49" stroke={isActive ? '#835de1' : '#191919'} strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </div>
                      {/* Text: title 16/500, description 14/400 */}
                      <div className="flex flex-col flex-1 min-w-0" style={{ gap: '2px' }}>
                        <span className={`text-[16px] font-medium leading-5 tracking-[0.16px] truncate ${isActive ? 'text-[#835de1]' : 'text-[#191919]'}`}>
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
                        <path d="M7.5 5L12.5 10L7.5 15" stroke={isActive ? '#835de1' : '#191919'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Preview panel */}
          {previewDoc && (
            <div
              className="bg-white rounded-[12px] shadow-[0px_20px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-[expandIn_0.2s_ease-out]"
              style={{ width: '380px', maxHeight: '460px', display: 'flex', flexDirection: 'column' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-3 border-b border-[rgba(25,25,25,0.08)]">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 flex items-center justify-center bg-[rgba(131,93,225,0.1)]" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="2" y="3" width="16" height="14" rx="2" stroke="#835de1" strokeWidth="1.5"/>
                      <path d="M2 7H18" stroke="#835de1" strokeWidth="1.5"/>
                      <path d="M7 7V17" stroke="#835de1" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-[15px] font-semibold text-[#191919] leading-5 tracking-[0.15px] break-words">
                      {previewDoc.name}
                    </span>
                    {previewDoc.circles && (
                      <span className="text-xs text-[#676767] leading-[15px] tracking-[0.12px]">
                        {previewDoc.circles}
                      </span>
                    )}
                    {previewDoc.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {previewDoc.tags.map((tag, ti) => (
                          <span key={ti} className="inline-flex items-center px-1.5 h-[18px] rounded-full border border-[rgba(25,25,25,0.15)] text-[10px] font-medium text-[#949494] leading-none">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {previewDoc.descriptionFull && (
                  <p className="text-[13px] text-[#676767] leading-[18px] tracking-[0.13px] m-0 mt-3" style={{ 
                    display: '-webkit-box', 
                    WebkitLineClamp: 3, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden' 
                  }}>
                    {previewDoc.descriptionFull}
                  </p>
                )}

                {/* Join info */}
                {previewLink && (
                  <div className="flex items-center gap-1.5 mt-2.5 px-2.5 py-1.5 rounded-lg bg-[rgba(131,93,225,0.06)]">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M6.5 9.5L9.5 6.5" stroke="#835de1" strokeWidth="1.4" strokeLinecap="round"/>
                      <path d="M9 4L11.5 1.5C12.3284 0.671573 13.6716 0.671573 14.5 1.5C15.3284 2.32843 15.3284 3.67157 14.5 4.5L12 7L10.5 8.5" stroke="#835de1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 12L4.5 14.5C3.67157 15.3284 2.32843 15.3284 1.5 14.5C0.671573 13.6716 0.671573 12.3284 1.5 11.5L4 9L5.5 7.5" stroke="#835de1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[11px] font-medium text-[#835de1] leading-none">
                      {previewLink.joinType || 'JOIN'} по {previewLink.targetField}
                    </span>
                  </div>
                )}
              </div>

              {/* Fields list */}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: '280px' }}>
                <div className="px-5 pt-2.5 pb-1">
                  <span className="text-[11px] font-medium text-[#949494] leading-[14px] tracking-[0.11px] uppercase">
                    Поля · {previewDoc.fields?.length || 0}
                  </span>
                </div>
                <div className="px-3 pb-2">
                  {(previewDoc.fields || []).map((field, fi) => (
                    <div
                      key={fi}
                      className="flex items-center gap-2 px-2 py-[5px] rounded-lg hover:bg-[rgba(25,25,25,0.03)] transition-colors"
                    >
                      <span className="text-[13px] font-medium text-[#191919] leading-[17px] tracking-[0.13px] shrink-0">
                        {field.name}
                      </span>
                      <span className="text-[11px] text-[#949494] leading-[14px] tracking-[0.11px] shrink-0">
                        {field.type}
                      </span>
                      {field.description && field.description !== '—' && field.description.trim() !== '' && (
                        <span className="text-[11px] text-[#c4c4c4] leading-[14px] truncate ml-auto">
                          {field.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-[rgba(25,25,25,0.08)]">
                <button
                  className="w-full h-9 rounded-lg bg-[#835de1] border-none text-sm font-medium text-white cursor-pointer hover:bg-[#7249d1] transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    setIsOpen(false);
                    setSearch('');
                    setPreviewDocId(null);
                    onNavigate?.(previewDocId, previewLink?.targetField);
                  }}
                >
                  Перейти к таблице
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
