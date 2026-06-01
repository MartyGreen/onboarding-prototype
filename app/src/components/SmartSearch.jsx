import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../data/DocumentsContext';
import { semanticConcepts, queryTemplates } from '../data/semanticIndex';

/**
 * SmartSearch — умный поиск по таблицам на человеческом языке.
 * Пользователь вводит «Клиенты по регионам и тарифам» →
 * система подбирает таблицы, поля и связи между ними.
 */
export default function SmartSearch({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { documents } = useDocuments();
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState({}); // { docId: true }
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
      setHasSearched(false);
    }
  }, [isOpen]);

  // Разбиваем запрос на слова и ищем совпадения с концептами
  const matchedConcepts = useMemo(() => {
    if (!query.trim()) return [];
    const words = query.toLowerCase().split(/[\s,;.!?]+/).filter(w => w.length > 2);
    
    return semanticConcepts.filter(concept => {
      return concept.keywords.some(kw => {
        const kwLower = kw.toLowerCase();
        return words.some(w => kwLower.includes(w) || w.includes(kwLower));
      });
    });
  }, [query]);

  // Собираем уникальные таблицы и их поля из найденных концептов
  const searchResults = useMemo(() => {
    if (matchedConcepts.length === 0) return [];

    const docFieldMap = new Map(); // docId → { fields: Set, concepts: Set }

    matchedConcepts.forEach(concept => {
      concept.matches.forEach(match => {
        if (!docFieldMap.has(match.docId)) {
          docFieldMap.set(match.docId, { fields: new Set(), concepts: new Set() });
        }
        const entry = docFieldMap.get(match.docId);
        match.fields.forEach(f => entry.fields.add(f));
        entry.concepts.add(concept.concept);
      });
    });

    // Конвертируем в массив и обогащаем данными о документе
    const results = [];
    docFieldMap.forEach((value, docId) => {
      const doc = documents.find(d => d.id === docId);
      if (!doc) return;
      
      const matchedFields = doc.fields.filter(f => value.fields.has(f.name));
      
      results.push({
        doc,
        matchedFields,
        allFieldNames: value.fields,
        concepts: Array.from(value.concepts),
        relevance: value.fields.size + value.concepts.size * 2,
      });
    });

    results.sort((a, b) => b.relevance - a.relevance);
    return results;
  }, [matchedConcepts, documents]);

  // Связи между таблицами (пока не реализовано — заглушка)
  const relevantLinks = [];

  const handleSearch = () => {
    if (query.trim()) setHasSearched(true);
  };

  const handleTemplateClick = (template) => {
    setQuery(template.query);
    setHasSearched(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[8vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm" />
      
      <div
        className="relative bg-white rounded-2xl shadow-[0px_30px_80px_rgba(0,0,0,0.25)] w-[720px] max-h-[80vh] flex flex-col overflow-hidden animate-[slideUp_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="px-6 pt-6 pb-4 border-b border-[rgba(25,25,25,0.08)]">
          <div className="flex items-center gap-3 bg-[rgba(25,25,25,0.05)] rounded-xl px-4 h-14">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="11" cy="11" r="7" stroke="#835de1" strokeWidth="2"/>
              <path d="M16 16L20 20" stroke="#835de1" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) setHasSearched(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
                if (e.key === 'Escape') onClose();
              }}
              placeholder="Что вы хотите найти? Например: «Клиенты по тарифам и регионам»"
              className="flex-1 bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] placeholder:text-[#949494]"
              style={{ fontFamily: 'inherit' }}
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setHasSearched(false); }}
                className="w-6 h-6 rounded-full bg-[rgba(25,25,25,0.1)] border-none cursor-pointer flex items-center justify-center hover:bg-[rgba(25,25,25,0.2)] transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1L9 9M9 1L1 9" stroke="#676767" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Matched concepts badges */}
          {matchedConcepts.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              <span className="text-xs text-[#676767]">Найдены концепции:</span>
              {matchedConcepts.map(c => (
                <span
                  key={c.concept}
                  className="inline-flex items-center px-2 h-6 rounded-lg bg-[rgba(131,93,225,0.1)] text-xs font-medium text-[#835de1]"
                >
                  {c.concept}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Templates (before search) */}
          {!hasSearched && (
            <div>
              <h4 className="text-sm font-medium text-[#676767] leading-[18px] m-0 mb-3">
                Популярные запросы
              </h4>
              <div className="flex flex-col gap-1.5">
                {queryTemplates.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-[rgba(131,93,225,0.05)] transition-colors group"
                    onClick={() => handleTemplateClick(t)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                      <circle cx="10" cy="10" r="8" stroke="#835de1" strokeWidth="1.5"/>
                      <path d="M10 6V10L13 12" stroke="#835de1" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base font-medium text-[#191919] leading-5">{t.query}</span>
                      <span className="text-xs text-[#949494] leading-[15px]">{t.description}</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <path d="M6 4L10 8L6 12" stroke="#835de1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {hasSearched && searchResults.length === 0 && query.trim() && (
            <div className="flex flex-col items-center py-10 text-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-3 opacity-20">
                <circle cx="22" cy="22" r="14" stroke="#191919" strokeWidth="3"/>
                <path d="M32 32L42 42" stroke="#191919" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <span className="text-base text-[#949494]">Ничего не найдено</span>
              <span className="text-sm text-[#c4c4c4] mt-1">Попробуйте другие слова: клиенты, регионы, тарифы, выручка...</span>
            </div>
          )}

          {hasSearched && searchResults.length > 0 && (
            <div className="flex flex-col gap-4">
              {/* Связи между таблицами */}
              {relevantLinks.length > 0 && (
                <div className="bg-[rgba(131,93,225,0.04)] rounded-xl p-4 border border-[rgba(131,93,225,0.12)]">
                  <div className="flex items-center gap-2 mb-3">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M6 3H4C3.17157 3 2.5 3.67157 2.5 4.5V4.5C2.5 5.32843 3.17157 6 4 6H6M12 6H14C14.8284 6 15.5 5.32843 15.5 4.5V4.5C15.5 3.67157 14.8284 3 14 3H12M5 4.5H13M6 12H4C3.17157 12 2.5 12.6716 2.5 13.5V13.5C2.5 14.3284 3.17157 15 4 15H6M12 15H14C14.8284 15 15.5 14.3284 15.5 13.5V13.5C15.5 12.6716 14.8284 12 14 12H12M5 13.5H13" stroke="#835de1" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <span className="text-sm font-semibold text-[#835de1]">
                      Связи между таблицами ({relevantLinks.length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {relevantLinks.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="font-medium text-[#191919]">{link.fromDocName}</span>
                        <span className="text-[#949494]">.{link.fromField}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[rgba(131,93,225,0.1)] text-xs font-medium text-[#835de1]">
                          {link.joinType}
                        </span>
                        <span className="font-medium text-[#191919]">{link.toDocName}</span>
                        <span className="text-[#949494]">.{link.toField}</span>
                        <span className="text-xs text-[#949494] ml-auto">— {link.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Таблицы-результаты */}
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-[#676767] leading-[18px] m-0">
                  Подходящие таблицы ({searchResults.length})
                </h4>

                {searchResults.map(({ doc, matchedFields, concepts }) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-[rgba(25,25,25,0.1)] overflow-hidden hover:border-[rgba(131,93,225,0.3)] transition-colors"
                  >
                    {/* Table header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(25,25,25,0.02)]">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: doc.dbColor || '#949494' }}
                      />
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span
                          className="text-base font-semibold text-[#835de1] leading-5 cursor-pointer hover:underline truncate"
                          onClick={() => {
                            const fieldNames = matchedFields.map(f => f.name).join(',');
                            onClose();
                            navigate(`/document/${doc.id}${fieldNames ? `?highlight=${encodeURIComponent(fieldNames)}` : ''}`);
                          }}
                        >
                          {doc.name}
                        </span>
                        <span className="text-xs text-[#949494] leading-[15px] truncate">
                          {doc.fullPath}
                        </span>
                        {/* Краткое описание таблицы */}
                        {(doc.descriptionFull || doc.description) && (() => {
                          const DESC_LIMIT = 120;
                          const fullText = doc.descriptionFull || doc.description;
                          const isLong = fullText.length > DESC_LIMIT;
                          const isExpanded = expandedDesc[doc.id];
                          const displayText = isLong && !isExpanded
                            ? fullText.slice(0, DESC_LIMIT).replace(/\s+\S*$/, '') + '…'
                            : fullText;
                          return (
                            <span className="text-xs text-[#676767] leading-[16px] mt-0.5" style={{ whiteSpace: isExpanded ? 'pre-wrap' : 'normal' }}>
                              {displayText}
                              {isLong && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedDesc(prev => ({ ...prev, [doc.id]: !prev[doc.id] }));
                                  }}
                                  className="ml-1 text-xs font-medium text-[#835de1] bg-transparent border-none cursor-pointer hover:underline p-0"
                                >
                                  {isExpanded ? 'свернуть' : 'ещё'}
                                </button>
                              )}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {concepts.map(c => (
                          <span
                            key={c}
                            className="inline-flex items-center px-1.5 h-5 rounded-md bg-[rgba(131,93,225,0.08)] text-[10px] font-medium text-[#835de1]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Matched fields */}
                    {matchedFields.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-[rgba(25,25,25,0.06)]">
                        <div className="flex flex-wrap gap-1.5">
                          {matchedFields.map(field => (
                            <span
                              key={field.name}
                              className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg border border-[rgba(25,25,25,0.12)] bg-white text-sm"
                            >
                              <span className="font-medium text-[#191919]">{field.name}</span>
                              <span className="text-[#949494]">{field.type}</span>
                            </span>
                          ))}
                        </div>
                        {/* Open document button */}
                        <button
                          onClick={() => {
                            const fieldNames = matchedFields.map(f => f.name).join(',');
                            onClose();
                            navigate(`/document/${doc.id}${fieldNames ? `?highlight=${encodeURIComponent(fieldNames)}` : ''}`);
                          }}
                          className="mt-2 text-xs font-medium text-[#835de1] bg-transparent border-none cursor-pointer hover:underline"
                        >
                          Открыть таблицу →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[rgba(25,25,25,0.08)] flex items-center justify-between bg-[rgba(25,25,25,0.02)]">
          <div className="flex items-center gap-2 text-xs text-[#949494]">
            <kbd className="px-1.5 py-0.5 rounded bg-[rgba(25,25,25,0.08)] text-[11px] font-medium">Enter</kbd>
            <span>поиск</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[rgba(25,25,25,0.08)] text-[11px] font-medium ml-2">Esc</kbd>
            <span>закрыть</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 h-8 rounded-lg border border-[rgba(25,25,25,0.12)] bg-white text-sm text-[#676767] cursor-pointer hover:bg-[rgba(25,25,25,0.03)] transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
