import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDocuments } from '../data/DocumentsContext';
import AddFieldModal from '../components/AddFieldModal';
import WarningTooltip from '../components/WarningTooltip';
import { useAlert } from '../components/SuccessAlert';
import { useCollection } from '../data/CollectionContext';
import SmartSearch from '../components/SmartSearch';

export default function DocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { documents, updateDocument, statusConfig, toggleStarred, fieldLinks } = useDocuments();
  const { showAlert } = useAlert();
  const { collection, addToCollection, removeFromCollection, isInCollection, clearCollection, groupedByDoc } = useCollection();
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  // SQL Generator state
  const [sqlStep, setSqlStep] = useState('idle'); // 'idle' | 'filters' | 'result'
  const [sqlDateFrom, setSqlDateFrom] = useState('');
  const [sqlDateTo, setSqlDateTo] = useState('');
  const [sqlLimit, setSqlLimit] = useState('100');
  const [generatedSql, setGeneratedSql] = useState('');
  const [sqlCopied, setSqlCopied] = useState(false);
  const doc = documents.find(d => d.id === id) || documents[0];
  const [fieldSearch, setFieldSearch] = useState('');
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // индекс поля с открытым меню
  const [openMissingMenuIndex, setOpenMissingMenuIndex] = useState(null); // для missing fields
  const [editFieldIndex, setEditFieldIndex] = useState(null); // индекс поля для редактирования

  // Подсветка полей из SmartSearch
  const location = useLocation();
  const highlightFields = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const h = params.get('highlight');
    if (!h) return new Set();
    return new Set(decodeURIComponent(h).split(','));
  }, [location.search]);

  // Discussions state
  const [expandedDiscussion, setExpandedDiscussion] = useState(null);
  const [isNewTopicOpen, setIsNewTopicOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicMessage, setNewTopicMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sentToChannel, setSentToChannel] = useState({});

  // Field links popup
  const [linksPopupField, setLinksPopupField] = useState(null); // fieldName or null

  // Helper: get links for a field in current doc (both directions)
  const getFieldLinks = (fieldName) => {
    if (!fieldLinks) return [];
    return fieldLinks
      .filter(l =>
        (l.fromDoc === doc.id && l.fromField === fieldName) ||
        (l.toDoc === doc.id && l.toField === fieldName)
      )
      .map(l => {
        const isOutgoing = l.fromDoc === doc.id && l.fromField === fieldName;
        const targetDocId = isOutgoing ? l.toDoc : l.fromDoc;
        const targetField = isOutgoing ? l.toField : l.fromField;
        const targetDoc = documents.find(d => d.id === targetDocId);
        return { ...l, targetDocId, targetField, targetDoc };
      })
      .filter(l => l.targetDoc);
  };

  // Закрытие меню и попапов при клике вне
  React.useEffect(() => {
    if (openMenuIndex === null && openMissingMenuIndex === null && linksPopupField === null) return;
    const handleClick = () => {
      setOpenMenuIndex(null);
      setOpenMissingMenuIndex(null);
      setLinksPopupField(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [openMenuIndex, openMissingMenuIndex, linksPopupField]);

  const handleDeleteField = (fieldIndex) => {
    const newFields = doc.fields.filter((_, i) => i !== fieldIndex);
    updateDocument(doc.id, { fields: newFields });
    setOpenMenuIndex(null);
  };

  const handleDeleteMissingField = (fieldIndex) => {
    const newMissingFields = doc.missingFields.filter((_, i) => i !== fieldIndex);
    updateDocument(doc.id, { missingFields: newMissingFields });
    setOpenMissingMenuIndex(null);
  };

  const handleDuplicateField = (fieldIndex) => {
    const field = doc.fields[fieldIndex];
    const newField = { ...field, name: `${field.name}_copy` };
    const newFields = [...doc.fields];
    newFields.splice(fieldIndex + 1, 0, newField);
    updateDocument(doc.id, { fields: newFields });
    setOpenMenuIndex(null);
  };

  const handleMoveFieldUp = (fieldIndex) => {
    if (fieldIndex === 0) return;
    const newFields = [...doc.fields];
    [newFields[fieldIndex - 1], newFields[fieldIndex]] = [newFields[fieldIndex], newFields[fieldIndex - 1]];
    updateDocument(doc.id, { fields: newFields });
    setOpenMenuIndex(null);
  };

  const handleMoveFieldDown = (fieldIndex) => {
    if (fieldIndex >= doc.fields.length - 1) return;
    const newFields = [...doc.fields];
    [newFields[fieldIndex], newFields[fieldIndex + 1]] = [newFields[fieldIndex + 1], newFields[fieldIndex]];
    updateDocument(doc.id, { fields: newFields });
    setOpenMenuIndex(null);
  };

  const handleAddField = ({ name, description }) => {
    const newField = {
      name,
      type: 'String',
      description: description || '—',
      hasInfo: false,
    };
    updateDocument(doc.id, {
      fields: [...doc.fields, newField],
    });
  };

  const handleEditField = ({ name, description }) => {
    if (editFieldIndex === null) return;
    const newFields = [...doc.fields];
    newFields[editFieldIndex] = {
      ...newFields[editFieldIndex],
      name,
      description: description || '—',
    };
    updateDocument(doc.id, { fields: newFields });
    setEditFieldIndex(null);
  };

  const filteredFields = useMemo(() => {
    if (!fieldSearch.trim()) return doc.fields;
    const q = fieldSearch.toLowerCase();
    return doc.fields.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.description && f.description.toLowerCase().includes(q)) ||
      (f.type && f.type.toLowerCase().includes(q))
    );
  }, [doc.fields, fieldSearch]);

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] overflow-y-auto">
      {/* Header */}
      <header className="flex items-center gap-4 px-8 py-6">
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors shrink-0"
        >
          <img src={`${import.meta.env.BASE_URL}assets/icon-arrow-left.svg`} alt="Back" className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-[30px] font-semibold text-[#191919] leading-9 tracking-[-0.3px] m-0 truncate">
            {doc.fullPath}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* 1. Связи (layer-copy) */}
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src={`${import.meta.env.BASE_URL}assets/icon-layer-copy.svg`} alt="" className="w-5 h-5" />
          </button>
          {/* 2. Избранное */}
          <button
            onClick={() => {
              const wasStarred = doc.starred;
              toggleStarred(doc.id);
              showAlert(wasStarred ? 'Документ убран из избранного' : 'Документ добавлен в избранное');
            }}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors"
            title={doc.starred ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            {doc.starred ? (
              <svg width="20" height="20" viewBox="0 0 16.5456 16.1406" fill="#191919" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.40924 0.495979C7.79511 -0.165363 8.75084 -0.16529 9.13678 0.495979L11.5362 4.61024C11.6859 4.86674 11.9425 5.04363 12.2354 5.09266L15.709 5.67176C16.5381 5.80994 16.8372 6.84677 16.209 7.40516L13.6749 9.65809C13.4244 9.88088 13.3014 10.2149 13.3487 10.5468L13.9844 14.997C14.102 15.8197 13.2226 16.4184 12.5001 16.0077L8.76666 13.8856C8.46037 13.7118 8.08457 13.7116 7.77838 13.8856L4.04498 16.0077C3.32253 16.4179 2.44408 15.8195 2.56158 14.997L3.19732 10.5468C3.24461 10.2148 3.12181 9.88089 2.87115 9.65809L0.335996 7.40516C-0.291363 6.84686 0.00779379 5.81047 0.835996 5.67176L4.30963 5.09266C4.60266 5.04382 4.85899 4.86671 5.00885 4.61024L7.40924 0.495979Z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 17.9002 16.9038" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.15157 0.350462C8.57826 -0.116784 9.32259 -0.116857 9.74923 0.350462L9.83516 0.457884L12.5256 4.25769L17.1555 5.78406C17.8744 6.02155 18.1357 6.90494 17.6584 7.49499L14.6164 11.2538L14.9934 15.7274C15.0585 16.5031 14.3099 17.0908 13.5734 16.8485L8.94942 15.3241L4.32637 16.8485C3.5901 17.0905 2.84141 16.503 2.90645 15.7274L3.28341 11.2538L0.241413 7.49499C-0.235541 6.90484 0.0262741 6.02133 0.745319 5.78406L5.37325 4.25769L8.06563 0.457884L8.15157 0.350462ZM6.83223 5.66003C6.6982 5.84917 6.50627 5.99081 6.28633 6.06335L2.63008 7.26745L5.07051 10.2831C5.24591 10.5002 5.33117 10.7772 5.30782 11.0555L5.01583 14.5145L8.61055 13.3309L8.77852 13.2899C8.89182 13.2718 9.00799 13.2719 9.1213 13.2899L9.28926 13.3309L12.884 14.5145L12.593 11.0555C12.5696 10.7771 12.6548 10.5002 12.8303 10.2831L15.2688 7.26745L11.6135 6.06335C11.3938 5.99078 11.2025 5.84901 11.0686 5.66003L8.9504 2.66784L6.83223 5.66003Z" fill="#191919" />
              </svg>
            )}
          </button>
          {/* 3. Редактировать */}
          <button
            onClick={() => navigate(`/document/${id}/edit`)}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors"
          >
            <img src={`${import.meta.env.BASE_URL}assets/icon-pencil.svg`} alt="" className="w-5 h-5" />
          </button>
          {/* 4. Копировать */}
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src={`${import.meta.env.BASE_URL}assets/icon-trash.svg`} alt="" className="w-5 h-5" />
          </button>
          {/* 5. Удалить */}
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src={`${import.meta.env.BASE_URL}assets/icon-arrows-rotation.svg`} alt="" className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Toolbar chips */}
      <div className="flex items-center gap-2 px-8 pb-4">
        <button className="px-3 h-10 rounded-xl border-[1.4px] border-[#191919] bg-transparent text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px] cursor-pointer transition-colors">
          Описание
        </button>
        <button className="px-3 h-10 rounded-xl border-none bg-[rgba(25,25,25,0.05)] text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px] cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
          Зависимость
        </button>
      </div>

      {/* Content */}
      <div className="flex gap-8 px-8 pb-8 flex-1 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-[14px] flex-1 min-w-0">
          {/* Description Card */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[#191919] leading-[22px] m-0">
                Описание документа
              </h3>
              <button
                onClick={() => navigate(`/document/${id}/edit`)}
                className="flex items-center justify-center w-6 h-6 border-none bg-transparent cursor-pointer"
              >
                <img src={`${import.meta.env.BASE_URL}assets/icon-pencil-3.svg`} alt="Edit" className="w-6 h-6" />
              </button>
            </div>
            <h4 className="text-2xl font-medium text-[#191919] leading-[30px] m-0 mb-4">
              {doc.name}
            </h4>
            <div className="text-base text-[#191919] leading-6 tracking-[0.16px] m-0">
              {doc.descriptionFull.split('\n\n').map((paragraph, i) => (
                <p key={i} className={`m-0 ${i > 0 ? 'mt-4' : ''}`}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Fields Table Card */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 pt-8 pb-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-medium text-[#191919] leading-[22px] m-0">
                Описание полей
              </h3>
              <button
                onClick={() => navigate(`/document/${id}/edit-fields`)}
                className="flex items-center justify-center w-6 h-6 border-none bg-transparent cursor-pointer"
              >
                <img src={`${import.meta.env.BASE_URL}assets/icon-pencil-3.svg`} alt="Edit" className="w-6 h-6" />
              </button>
            </div>

            {doc.fields.length > 0 && (
              <>
            {/* Search */}
            <div className="mb-4">
              <div className="search-field flex items-center bg-[rgba(25,25,25,0.05)] rounded-lg h-10 px-3">
                <img src={`${import.meta.env.BASE_URL}assets/icon-search-20.svg`} alt="" className="w-5 h-5 mr-2 shrink-0" />
                <input
                  type="text"
                  value={fieldSearch}
                  onChange={(e) => setFieldSearch(e.target.value)}
                  placeholder="Поиск по полям"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#191919] leading-[18px] tracking-[0.14px] placeholder:text-[#949494]"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl">
              {/* Header */}
              <div className="flex gap-[2px] rounded-t-xl overflow-hidden">
                <div className="w-[280px] bg-[rgba(25,25,25,0.05)] px-5 py-3">
                  <span className="text-xs font-medium text-[#191919] leading-[15px] tracking-[0.12px]">
                    Название
                  </span>
                </div>
                <div className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-3">
                  <span className="text-xs font-medium text-[#191919] leading-[15px] tracking-[0.12px]">
                    Описание
                  </span>
                </div>
              </div>

              {/* Rows */}
              {filteredFields.map((row, i) => {
                const realIndex = doc.fields.indexOf(row);
                const isLast = i === filteredFields.length - 1;
                const isNearBottom = i >= filteredFields.length - 2;
                const isEmpty = !row.description || row.description === '—' || row.description.trim() === '';
                const isHighlighted = highlightFields.has(row.name);
                const hasLinks = getFieldLinks(row.name).length > 0;
                return (
                  <div
                    key={i}
                    ref={el => { if (isHighlighted && el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); }}
                    className={`flex gap-[2px] mt-[2px] ${isHighlighted ? 'rounded-lg relative z-10' : ''}`}
                    style={isHighlighted ? {
                      boxShadow: '0 0 0 3px #835de1',
                      borderRadius: '12px',
                      animation: 'highlightPulse 2.5s ease-out',
                    } : {}}
                  >
                    <div className={`w-[280px] px-5 py-3.5 relative ${isLast ? 'rounded-bl-xl' : ''}`} style={isHighlighted ? { backgroundColor: 'rgba(131, 93, 225, 0.1)' } : hasLinks ? { backgroundColor: 'rgba(131, 93, 225, 0.04)' } : { backgroundColor: 'rgba(25, 25, 25, 0.05)' }}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {/* Collection checkbox */}
                          <button
                            className={`w-[18px] h-[18px] rounded border-[1.5px] flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                              isInCollection(doc.id, row.name)
                                ? 'bg-[#835de1] border-[#835de1]'
                                : 'bg-white border-[#c4c4c4] hover:border-[#835de1]'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isInCollection(doc.id, row.name)) {
                                removeFromCollection(doc.id, row.name);
                              } else {
                                addToCollection({
                                  docId: doc.id,
                                  docName: doc.name,
                                  fieldName: row.name,
                                  fieldType: row.type,
                                  fieldDescription: row.description || '',
                                });
                              }
                            }}
                          >
                            {isInCollection(doc.id, row.name) && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                          <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">
                            {row.name}
                          </span>
                          {(() => {
                            const links = getFieldLinks(row.name);
                            if (links.length === 0) return null;
                            return (
                              <button
                                className="inline-flex items-center gap-1 px-1.5 h-5 rounded-md bg-[rgba(131,93,225,0.12)] border-none cursor-pointer hover:bg-[rgba(131,93,225,0.22)] transition-colors shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLinksPopupField(linksPopupField === row.name ? null : row.name);
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M5 7L7 5" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round"/>
                                  <path d="M3.5 8.5L2.15 9.85C1.56 10.44 1.56 11.39 2.15 11.98V11.98C2.74 12.57 3.69 12.57 4.28 11.98L5.5 10.76" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round"/>
                                  <path d="M8.5 3.5L9.85 2.15C10.44 1.56 10.44 0.61 9.85 0.02V0.02C9.26 -0.57 8.31 -0.57 7.72 0.02L6.5 1.24" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                                <span className="text-[10px] font-semibold text-[#835de1] leading-none">{links.length}</span>
                              </button>
                            );
                          })()}
                        </div>
                        <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">
                          {row.type}
                        </span>
                      </div>

                      {/* Links popup */}
                      {linksPopupField === row.name && (() => {
                        const links = getFieldLinks(row.name);
                        if (links.length === 0) return null;
                        return (
                          <div
                            className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.15)] py-3 min-w-[320px] max-w-[420px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-4 pb-2 border-b border-[rgba(25,25,25,0.08)]">
                              <span className="text-xs font-medium text-[#676767] leading-[15px]">
                                Связи поля <span className="text-[#191919] font-semibold">{row.name}</span> ({links.length})
                              </span>
                            </div>
                            <div className="flex flex-col max-h-[250px] overflow-y-auto">
                              {links.map((link, li) => (
                                <div
                                  key={li}
                                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[rgba(25,25,25,0.03)] cursor-pointer transition-colors"
                                  onClick={() => {
                                    setLinksPopupField(null);
                                    navigate(`/document/${link.targetDocId}`);
                                  }}
                                >
                                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                    <span className="text-sm font-medium text-[#835de1] leading-[18px] truncate">
                                      {link.targetDoc.name}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs text-[#191919] font-medium">{link.targetField}</span>
                                      <span className="text-[10px] text-[#949494] px-1 py-0.5 rounded bg-[rgba(25,25,25,0.06)]">{link.joinType}</span>
                                    </div>
                                    <span className="text-xs text-[#676767] leading-[14px]">{link.description}</span>
                                  </div>
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                                    <path d="M6 4L10 8L6 12" stroke="#949494" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div
                      className="flex-1 px-5 py-3.5 flex items-start gap-2 cursor-text"
                      style={{ backgroundColor: hasLinks ? 'rgba(131, 93, 225, 0.04)' : 'rgba(25, 25, 25, 0.05)' }}
                      onClick={(e) => {
                        const ta = e.currentTarget.querySelector('textarea');
                        if (ta) ta.focus();
                      }}
                    >
                      {isEmpty ? (
                        <>
                          <textarea
                            placeholder="Добавить описание..."
                            className="flex-1 bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] placeholder:text-[#949494] p-0 m-0 resize-none"
                            rows={1}
                            style={{ overflow: 'hidden', fontFamily: 'inherit' }}
                            onInput={(e) => {
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey && e.target.value.trim()) {
                                e.preventDefault();
                                const newFields = [...doc.fields];
                                newFields[realIndex] = { ...newFields[realIndex], description: e.target.value.trim() };
                                updateDocument(doc.id, { fields: newFields });
                                e.target.value = '';
                                e.target.style.height = 'auto';
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                const newFields = [...doc.fields];
                                newFields[realIndex] = { ...newFields[realIndex], description: e.target.value.trim() };
                                updateDocument(doc.id, { fields: newFields });
                              }
                            }}
                          />
                          <WarningTooltip />
                        </>
                      ) : (
                        <>
                          <span className="text-base text-[#191919] leading-5 tracking-[0.16px] flex-1 break-words">
                            {row.description}
                          </span>
                        </>
                      )}
                    </div>
                    <div className={`bg-[rgba(25,25,25,0.05)] px-3 py-3.5 flex items-center relative ${isLast ? 'rounded-br-xl' : ''}`}>
                      <button
                        className="border-none bg-transparent cursor-pointer p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMissingMenuIndex(null);
                          setOpenMenuIndex(openMenuIndex === realIndex ? null : realIndex);
                        }}
                      >
                        <img src={`${import.meta.env.BASE_URL}assets/icon-dots-three.svg`} alt="" className="w-5 h-5" />
                      </button>
                      {openMenuIndex === realIndex && (
                        <div
                          className="absolute right-full top-0 mr-1 z-50 bg-white rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.1)] py-2.5 min-w-[255px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="flex items-center gap-3 w-full px-5 py-2.5 text-base font-medium text-[#191919] leading-5 tracking-[0.16px] bg-transparent border-none cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors text-left"
                            onClick={() => {
                              setEditFieldIndex(realIndex);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <img src={`${import.meta.env.BASE_URL}assets/icon-pencil-3.svg`} alt="" className="w-6 h-6" style={{ filter: 'brightness(0)' }} />
                            Редактировать
                          </button>
                          <button
                            className="flex items-center gap-3 w-full px-5 py-2.5 text-base font-semibold text-[#d74b4b] leading-5 tracking-[0.16px] bg-transparent border-none cursor-pointer hover:bg-[rgba(215,75,75,0.05)] transition-colors text-left"
                            onClick={() => handleDeleteField(realIndex)}
                          >
                            <img src={`${import.meta.env.BASE_URL}assets/icon-trash-red.svg`} alt="" className="w-6 h-6" />
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Missing Fields */}
            {doc.missingFields.length > 0 && (
              <div className="flex flex-col gap-1 py-2.5 mt-2">
                <div className="flex flex-col gap-0.5 py-2">
                  <span className="text-sm font-medium text-[#191919] leading-5 tracking-[0.14px]">Поля которых нет в таблице</span>
                  <span className="text-xs text-[#676767] leading-[15px] tracking-[0.12px]">Обратитесь к автору таблицы или удалите их</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-xl">
                  {doc.missingFields.map((field, i) => {
                    const isFirstMissing = i === 0;
                    const isLastMissing = i === doc.missingFields.length - 1;
                    return (
                    <div key={i} className="flex gap-[2px]">
                      <div className={`w-[280px] bg-[rgba(25,25,25,0.05)] px-5 py-2.5 ${isFirstMissing ? 'rounded-tl-xl' : ''} ${isLastMissing ? 'rounded-bl-xl' : ''}`}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-base text-[#191919] leading-5 tracking-[0.16px]">{field.name}</span>
                          <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">{field.type}</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-2.5 flex items-center">
                        <span className="text-base text-[#191919] leading-5 tracking-[0.16px]">{field.description}</span>
                      </div>
                      <div className={`bg-[rgba(25,25,25,0.05)] px-3 py-2.5 flex items-center relative ${isFirstMissing ? 'rounded-tr-xl' : ''} ${isLastMissing ? 'rounded-br-xl' : ''}`}>
                        <button
                          className="border-none bg-transparent cursor-pointer p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuIndex(null);
                            setOpenMissingMenuIndex(openMissingMenuIndex === i ? null : i);
                          }}
                        >
                          <img src={`${import.meta.env.BASE_URL}assets/icon-dots-three.svg`} alt="" className="w-5 h-5" />
                        </button>
                        {openMissingMenuIndex === i && (
                          <div
                            className="absolute right-full top-0 mr-1 z-50 bg-white rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.1)] py-2.5 min-w-[255px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="flex items-center gap-3 w-full px-5 py-2.5 text-base font-semibold text-[#d74b4b] leading-5 tracking-[0.16px] bg-transparent border-none cursor-pointer hover:bg-[rgba(215,75,75,0.05)] transition-colors text-left"
                              onClick={() => handleDeleteMissingField(i)}
                            >
                              <img src={`${import.meta.env.BASE_URL}assets/icon-trash-red.svg`} alt="" className="w-6 h-6" />
                              Удалить
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

              </>
            )}

            {/* Add Field */}
            <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 py-4 mt-4">
              <div>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsAddFieldOpen(true)}>
                  <img src={`${import.meta.env.BASE_URL}assets/icon-plus-circle.svg`} alt="" className="w-6 h-6" />
                  <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px]">Добавить поле</span>
                </div>
              </div>
            </div>
          </div>

          {/* Discussions Card */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 pt-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium text-[#191919] leading-[22px] m-0">
                  Обсуждения
                </h3>
                {(doc.discussions || []).length > 0 && (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#835de1] text-xs font-medium text-white">
                    {(doc.discussions || []).length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#676767] leading-[15px] tracking-[0.12px]">
                  Канал: #{doc.name}
                </span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0 mb-5">
              Вопросы и ответы по таблице. Новые темы автоматически отправляются в канал мессенджера с тегом <span className="font-medium text-[#835de1]">#{doc.name}</span>
            </p>

            {/* Discussion threads */}
            {(doc.discussions || []).length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {(doc.discussions || []).map((discussion) => {
                  const isExpanded = expandedDiscussion === discussion.id;
                  const isResolved = discussion.status === 'resolved';
                  return (
                    <div key={discussion.id} className="rounded-xl border border-[rgba(25,25,25,0.1)] overflow-hidden">
                      {/* Thread header */}
                      <div
                        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-[rgba(25,25,25,0.02)] transition-colors"
                        onClick={() => setExpandedDiscussion(isExpanded ? null : discussion.id)}
                      >
                        {/* Status indicator */}
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isResolved ? 'bg-[#5cad9a]' : 'bg-[#835de1]'}`} />
                        
                        {/* Author avatar */}
                        <div className="w-8 h-8 rounded-full bg-[#e1e1e1] overflow-hidden shrink-0">
                          <img src={`${import.meta.env.BASE_URL}${discussion.authorAvatar}`} alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* Title & meta */}
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px] truncate">
                            {discussion.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#676767] leading-[15px] tracking-[0.12px]">
                              {discussion.author}
                            </span>
                            <span className="text-xs text-[#949494]">·</span>
                            <span className="text-xs text-[#949494] leading-[15px] tracking-[0.12px]">
                              {discussion.createdAt}
                            </span>
                          </div>
                        </div>

                        {/* Messages count & status */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V10C14 10.5523 13.5523 11 13 11H9.5L6 14V11H3C2.44772 11 2 10.5523 2 10V3Z" stroke="#949494" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-xs text-[#949494] font-medium">{discussion.messages.length}</span>
                          </div>
                          {isResolved && (
                            <span className="inline-flex items-center px-2 h-5 rounded-md bg-[rgba(92,173,154,0.1)] text-xs font-medium text-[#5cad9a]">
                              Решено
                            </span>
                          )}
                          <svg
                            width="16" height="16" viewBox="0 0 16 16" fill="none"
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          >
                            <path d="M4 6L8 10L12 6" stroke="#676767" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>

                      {/* Expanded thread messages */}
                      {isExpanded && (
                        <div className="border-t border-[rgba(25,25,25,0.08)]">
                          <div className="flex flex-col gap-0">
                            {discussion.messages.map((msg, mi) => (
                              <div key={mi} className={`flex gap-3 px-5 py-3 ${mi > 0 ? 'border-t border-[rgba(25,25,25,0.05)]' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-[#e1e1e1] overflow-hidden shrink-0 mt-0.5">
                                  <img src={`${import.meta.env.BASE_URL}${msg.avatar}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-[#191919] leading-[18px]">{msg.author}</span>
                                    <span className="text-xs text-[#949494] leading-[15px]">{msg.time}</span>
                                  </div>
                                  <p className="text-sm text-[#191919] leading-[20px] tracking-[0.14px] m-0">{msg.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Reply input */}
                          <div className="px-5 py-3 border-t border-[rgba(25,25,25,0.08)] bg-[rgba(25,25,25,0.02)]">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#e1e1e1] overflow-hidden shrink-0">
                                <img src={`${import.meta.env.BASE_URL}assets/avatar-girl-2.jpg`} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex gap-2">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Написать ответ..."
                                  className="flex-1 bg-white border border-[rgba(25,25,25,0.12)] rounded-lg px-3 py-2 text-sm text-[#191919] leading-[18px] tracking-[0.14px] placeholder:text-[#949494] resize-none outline-none focus:border-[#835de1] transition-colors"
                                  rows={1}
                                  style={{ fontFamily: 'inherit' }}
                                  onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && replyText.trim()) {
                                      e.preventDefault();
                                      const discussions = [...(doc.discussions || [])];
                                      const dIdx = discussions.findIndex(d => d.id === discussion.id);
                                      if (dIdx !== -1) {
                                        discussions[dIdx] = {
                                          ...discussions[dIdx],
                                          messages: [
                                            ...discussions[dIdx].messages,
                                            {
                                              author: 'Бесстрашный исследователь',
                                              avatar: 'assets/avatar-girl-2.jpg',
                                              text: replyText.trim(),
                                              time: 'только что',
                                            },
                                          ],
                                        };
                                        updateDocument(doc.id, { discussions });
                                        setReplyText('');
                                        showAlert('Ответ отправлен в тред и в канал мессенджера');
                                      }
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    if (!replyText.trim()) return;
                                    const discussions = [...(doc.discussions || [])];
                                    const dIdx = discussions.findIndex(d => d.id === discussion.id);
                                    if (dIdx !== -1) {
                                      discussions[dIdx] = {
                                        ...discussions[dIdx],
                                        messages: [
                                          ...discussions[dIdx].messages,
                                          {
                                            author: 'Бесстрашный исследователь',
                                            avatar: 'assets/avatar-girl-2.jpg',
                                            text: replyText.trim(),
                                            time: 'только что',
                                          },
                                        ],
                                      };
                                      updateDocument(doc.id, { discussions });
                                      setReplyText('');
                                      showAlert('Ответ отправлен в тред и в канал мессенджера');
                                    }
                                  }}
                                  className="self-end flex items-center justify-center w-9 h-9 rounded-lg bg-[#835de1] border-none cursor-pointer hover:bg-[#7249d1] transition-colors shrink-0 disabled:opacity-40 disabled:cursor-default"
                                  disabled={!replyText.trim()}
                                >
                                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M2 9L16 2L12 16L9 10L2 9Z" fill="white" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {(doc.discussions || []).length === 0 && !isNewTopicOpen && (
              <div className="flex flex-col items-center py-8 text-center">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-3 opacity-30">
                  <path d="M6 9C6 7.34315 7.34315 6 9 6H39C40.6569 6 42 7.34315 42 9V30C42 31.6569 40.6569 33 39 33H28.5L18 42V33H9C7.34315 33 6 31.6569 6 30V9Z" stroke="#191919" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="16" cy="19.5" r="2" fill="#191919"/>
                  <circle cx="24" cy="19.5" r="2" fill="#191919"/>
                  <circle cx="32" cy="19.5" r="2" fill="#191919"/>
                </svg>
                <span className="text-sm text-[#949494] leading-[18px]">Обсуждений пока нет</span>
              </div>
            )}

            {/* New topic form */}
            {isNewTopicOpen && (
              <div className="rounded-xl border border-[#835de1] bg-[rgba(131,93,225,0.03)] p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 5C2.5 4.17157 3.17157 3.5 4 3.5H16C16.8284 3.5 17.5 4.17157 17.5 5V13C17.5 13.8284 16.8284 14.5 16 14.5H11.5L7.5 18V14.5H4C3.17157 14.5 2.5 13.8284 2.5 13V5Z" stroke="#835de1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-medium text-[#835de1] leading-[18px]">Новая тема обсуждения</span>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="Заголовок вопроса..."
                    className="w-full bg-white border border-[rgba(25,25,25,0.12)] rounded-lg px-4 py-2.5 text-base text-[#191919] leading-5 tracking-[0.16px] placeholder:text-[#949494] outline-none focus:border-[#835de1] transition-colors"
                    style={{ fontFamily: 'inherit' }}
                  />
                  <textarea
                    value={newTopicMessage}
                    onChange={(e) => setNewTopicMessage(e.target.value)}
                    placeholder="Опишите ваш вопрос подробнее..."
                    className="w-full bg-white border border-[rgba(25,25,25,0.12)] rounded-lg px-4 py-2.5 text-sm text-[#191919] leading-[20px] tracking-[0.14px] placeholder:text-[#949494] resize-none outline-none focus:border-[#835de1] transition-colors"
                    rows={3}
                    style={{ fontFamily: 'inherit' }}
                  />
                  <div className="flex items-center gap-2 px-1">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1V13M1 7H13" stroke="#835de1" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <span className="text-xs text-[#676767] leading-[15px]">
                      Будет отправлено в канал мессенджера с тегом <span className="font-medium text-[#835de1]">#{doc.name}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <button
                      onClick={() => {
                        setIsNewTopicOpen(false);
                        setNewTopicTitle('');
                        setNewTopicMessage('');
                      }}
                      className="px-4 h-9 rounded-lg border border-[rgba(25,25,25,0.15)] bg-white text-sm font-medium text-[#191919] cursor-pointer hover:bg-[rgba(25,25,25,0.03)] transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => {
                        if (!newTopicTitle.trim() || !newTopicMessage.trim()) return;
                        const newDiscussion = {
                          id: `d_new_${Date.now()}`,
                          tag: `#${doc.name}`,
                          title: newTopicTitle.trim(),
                          author: 'Бесстрашный исследователь',
                          authorAvatar: 'assets/avatar-girl-2.jpg',
                          createdAt: 'только что',
                          status: 'open',
                          messages: [
                            {
                              author: 'Бесстрашный исследователь',
                              avatar: 'assets/avatar-girl-2.jpg',
                              text: newTopicMessage.trim(),
                              time: 'только что',
                            },
                          ],
                        };
                        updateDocument(doc.id, {
                          discussions: [...(doc.discussions || []), newDiscussion],
                        });
                        setIsNewTopicOpen(false);
                        setNewTopicTitle('');
                        setNewTopicMessage('');
                        setExpandedDiscussion(newDiscussion.id);
                        showAlert('Тема создана и отправлена в канал мессенджера');
                      }}
                      disabled={!newTopicTitle.trim() || !newTopicMessage.trim()}
                      className="px-4 h-9 rounded-lg border-none bg-[#835de1] text-sm font-medium text-white cursor-pointer hover:bg-[#7249d1] transition-colors disabled:opacity-40 disabled:cursor-default"
                    >
                      Создать и отправить в канал
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Create new topic button */}
            {!isNewTopicOpen && (
              <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 py-4">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setIsNewTopicOpen(true)}
                >
                  <img src={`${import.meta.env.BASE_URL}assets/icon-plus-circle.svg`} alt="" className="w-6 h-6" />
                  <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px]">Создать тему обсуждения</span>
                </div>
              </div>
            )}
          </div>

          {/* Experts Card */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 pt-5 pb-10">
            <h3 className="text-lg font-medium text-[#191919] leading-[22px] m-0 mb-3">
              Эксперты по документу
            </h3>

            <div className="flex flex-col gap-0.5">
              {doc.experts.map((expert, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-[#e1e1e1] overflow-hidden shrink-0">
                    <img src={`${import.meta.env.BASE_URL}${expert.avatar}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">{expert.role}</span>
                    <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px]">{expert.name}</span>
                  </div>
                  {expert.isSelf && (
                    <button
                      onClick={() => {
                        const newExperts = doc.experts.filter((_, idx) => idx !== i);
                        updateDocument(doc.id, { experts: newExperts });
                      }}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors shrink-0"
                    >
                      <img src={`${import.meta.env.BASE_URL}assets/icon-trash-red.svg`} alt="Удалить" className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Expert — скрываем если уже добавлен */}
            {!doc.experts.some(e => e.isSelf) && (
              <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 py-4 mt-3">
                <div>
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                      const selfExpert = {
                        name: 'Бесстрашный исследователь',
                        role: 'Эксперт',
                        avatar: 'assets/avatar-girl-2.jpg',
                        isSelf: true,
                      };
                      updateDocument(doc.id, { experts: [...doc.experts, selfExpert] });
                    }}
                  >
                    <img src={`${import.meta.env.BASE_URL}assets/icon-plus-circle.svg`} alt="" className="w-6 h-6" />
                    <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px]">Добавить себя как эксперта</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[280px] shrink-0 flex flex-col gap-4 pb-6">
          {/* Author */}
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-[#e1e1e1] overflow-hidden shrink-0">
              <img src={`${import.meta.env.BASE_URL}${doc.authorAvatar}`} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Автор</span>
              <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">{doc.author}</span>
            </div>
          </div>

          <div className="h-px bg-[rgba(25,25,25,0.2)]" />

          {/* Roles */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Роли</span>
            <div className="flex flex-col gap-4">
              {doc.roles.map((role, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">{role.name}</span>
                  <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px] cursor-pointer">{role.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-[rgba(25,25,25,0.2)]" />

          {/* Circles */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Круги-владельцы</span>
            <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px] cursor-pointer">{doc.circles}</span>
          </div>

          <div className="h-px bg-[rgba(25,25,25,0.2)]" />

          {/* Status */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Статус</span>
            <span
              className="inline-flex items-center justify-center self-start px-2 h-6 rounded-md text-sm font-medium leading-[18px] tracking-[0.14px] border"
              style={{ color: statusConfig[doc.status]?.color, borderColor: statusConfig[doc.status]?.color }}
            >
              {doc.status}
            </span>
          </div>

          {/* Created */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Создано</span>
            <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">{doc.createdAt}</span>
          </div>

          {/* Updated */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Обновлено</span>
            <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">{doc.updatedAt}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Теги</span>
            <div className="flex flex-wrap gap-2">
              {doc.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center justify-center px-2.5 h-6 rounded-full bg-[#aeaeae] text-sm font-medium text-white leading-[18px] tracking-[0.14px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Field Modal */}
      <AddFieldModal
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
        onAdd={handleAddField}
      />

      {/* Edit Field Modal */}
      <AddFieldModal
        isOpen={editFieldIndex !== null}
        onClose={() => setEditFieldIndex(null)}
        onAdd={handleEditField}
        initialData={editFieldIndex !== null ? doc.fields[editFieldIndex] : null}
      />

      {/* Smart Search Modal */}
      <SmartSearch isOpen={smartSearchOpen} onClose={() => setSmartSearchOpen(false)} />

      {/* SQL Overlay backdrop */}
      {collection.length > 0 && (sqlStep === 'filters' || sqlStep === 'result') && (
        <div
          className="fixed inset-0 z-[99] transition-colors duration-300"
          style={{
            backgroundColor: sqlStep === 'result' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)',
          }}
          onClick={() => {
            setSqlStep('idle');
            setSqlDateFrom('');
            setSqlDateTo('');
            setSqlLimit('100');
          }}
        />
      )}

      {/* Collection Floating Bar */}
      {collection.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-[slideUp_0.3s_ease-out]">
          <div className="bg-[#191919] rounded-2xl shadow-[0px_20px_60px_rgba(0,0,0,0.3)] px-6 py-3.5 flex items-center gap-5 min-w-[480px]">
            {/* Count */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#835de1] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 3H7V7H3V3ZM11 3H15V7H11V3ZM3 11H7V15H3V11ZM11 13H15M13 11V15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white leading-[18px]">
                  {collection.length} {collection.length === 1 ? 'поле' : collection.length < 5 ? 'поля' : 'полей'}
                </span>
                <span className="text-xs text-[rgba(255,255,255,0.5)] leading-[14px]">
                  из {groupedByDoc.length} {groupedByDoc.length === 1 ? 'таблицы' : 'таблиц'}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-[rgba(255,255,255,0.15)]" />

            {/* Preview chips */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
              {collection.slice(0, 4).map((item, i) => (
                <span
                  key={`${item.docId}-${item.fieldName}`}
                  className="inline-flex items-center gap-1 px-2 h-6 rounded-md bg-[rgba(255,255,255,0.1)] text-xs text-white whitespace-nowrap shrink-0"
                >
                  <span className="text-[rgba(255,255,255,0.5)]">{item.docName.length > 12 ? item.docName.slice(0, 12) + '…' : item.docName}.</span>
                  <span className="font-medium">{item.fieldName}</span>
                </span>
              ))}
              {collection.length > 4 && (
                <span className="text-xs text-[rgba(255,255,255,0.5)] shrink-0">+{collection.length - 4}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {groupedByDoc.length >= 2 && (
                <button
                  onClick={() => setSmartSearchOpen(true)}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-lg border border-[#835de1] bg-transparent text-sm font-medium text-[#835de1] cursor-pointer hover:bg-[rgba(131,93,225,0.15)] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="#835de1" strokeWidth="1.5"/>
                    <path d="M11 11L14 14" stroke="#835de1" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Найти таблицу
                </button>
              )}
              <button
                onClick={() => setIsCollectionOpen(!isCollectionOpen)}
                className="px-4 h-9 rounded-lg bg-[rgba(255,255,255,0.12)] border-none text-sm font-medium text-white cursor-pointer hover:bg-[rgba(255,255,255,0.2)] transition-colors"
              >
                {isCollectionOpen ? 'Скрыть' : 'Показать'}
              </button>
              <button
                onClick={() => clearCollection()}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.08)] border-none cursor-pointer hover:bg-[rgba(255,75,75,0.2)] transition-colors"
                title="Очистить коллекцию"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Expanded collection panel */}
          {isCollectionOpen && (
            <div className="mt-3 bg-white rounded-2xl shadow-[0px_20px_60px_rgba(0,0,0,0.2)] max-h-[400px] overflow-y-auto">
              <div className="px-6 py-4 border-b border-[rgba(25,25,25,0.08)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-[#191919] m-0">Собранная коллекция полей</h4>
                  <span className="text-xs text-[#676767]">{collection.length} полей из {groupedByDoc.length} таблиц</span>
                </div>
              </div>
              <div className="px-6 py-3">
                {groupedByDoc.map((group) => {
                  const groupDoc = documents.find(d => d.id === group.docId);
                  const groupDesc = groupDoc?.descriptionFull || groupDoc?.description || '';
                  const DESC_LIMIT = 100;
                  const isLongDesc = groupDesc.length > DESC_LIMIT;
                  return (
                  <div key={group.docId} className="mb-4 last:mb-0">
                    <div className="flex flex-col gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#835de1] shrink-0 mt-0.5" />
                        <span
                          className="text-sm font-medium text-[#835de1] leading-[18px] cursor-pointer hover:underline"
                          onClick={() => {
                            setIsCollectionOpen(false);
                            navigate(`/document/${group.docId}`);
                          }}
                        >
                          {group.docName}
                        </span>
                        {groupDoc?.tags?.length > 0 && (
                          <div className="flex items-center gap-1 ml-1">
                            {groupDoc.tags.map((tag, ti) => (
                              <span key={ti} className="inline-flex items-center px-1.5 h-[18px] rounded-full border border-[rgba(25,25,25,0.2)] text-[10px] font-medium text-[#949494] leading-none">{tag}</span>
                            ))}
                          </div>
                        )}
                        <button
                          className="flex items-center justify-center w-5 h-5 rounded bg-transparent border-none cursor-pointer hover:bg-[rgba(25,25,25,0.08)] transition-colors shrink-0 ml-auto"
                          title="Открыть таблицу"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`${window.location.origin}${import.meta.env.BASE_URL}document/${group.docId}`, '_blank');
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M11 7.5V11.5C11 12.05 10.55 12.5 10 12.5H2.5C1.95 12.5 1.5 12.05 1.5 11.5V4C1.5 3.45 1.95 3 2.5 3H6.5" stroke="#949494" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 1.5H12.5V5" stroke="#949494" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 8L12.5 1.5" stroke="#949494" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-4">
                      {group.fields.map((field) => {
                        // Проверяем, является ли поле ключом связи с другой таблицей в коллекции
                        const isLinkKey = fieldLinks?.some(l => {
                          const otherDocIds = groupedByDoc.filter(g => g.docId !== field.docId).map(g => g.docId);
                          return (
                            (l.fromDoc === field.docId && l.fromField === field.fieldName && otherDocIds.includes(l.toDoc)) ||
                            (l.toDoc === field.docId && l.toField === field.fieldName && otherDocIds.includes(l.fromDoc))
                          );
                        });
                        return (
                        <span
                          key={field.fieldName}
                          className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-sm ${
                            isLinkKey
                              ? 'bg-[rgba(131,93,225,0.12)] border border-[rgba(131,93,225,0.3)]'
                              : 'bg-[rgba(25,25,25,0.05)]'
                          }`}
                        >
                          {isLinkKey && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="shrink-0">
                              <path d="M5 7L7 5" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round"/>
                              <path d="M3.5 8.5L2.5 9.5C2 10 2 10.8 2.5 11.3C3 11.8 3.8 11.8 4.3 11.3L5.3 10.3" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round"/>
                              <path d="M8.5 3.5L9.5 2.5C10 2 10 1.2 9.5 0.7C9 0.2 8.2 0.2 7.7 0.7L6.7 1.7" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                          )}
                          <span className={`font-medium ${isLinkKey ? 'text-[#835de1]' : 'text-[#191919]'}`}>{field.fieldName}</span>
                          <button
                            onClick={() => removeFromCollection(field.docId, field.fieldName)}
                            className="ml-0.5 flex items-center justify-center w-4 h-4 rounded bg-transparent border-none cursor-pointer hover:bg-[rgba(215,75,75,0.1)] transition-colors"
                          >
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1 1L7 7M7 1L1 7" stroke="#949494" strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </span>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
              </div>
              {/* SQL Generator Footer — показываем только при 2+ таблицах */}
              {groupedByDoc.length >= 2 && (
              <div className="px-6 py-3 border-t border-[rgba(25,25,25,0.08)]">
                {sqlStep === 'idle' && (
                  <div className="flex justify-end">
                    <button
                      className="flex items-center gap-2 px-5 h-10 rounded-xl bg-[#835de1] border-none text-sm font-semibold text-white cursor-pointer hover:bg-[#7249d1] transition-colors"
                      onClick={() => setSqlStep('filters')}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3H13L9 8V12L7 13V8L3 3Z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Сформировать SQL
                    </button>
                  </div>
                )}

                {sqlStep === 'filters' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3H13L9 8V12L7 13V8L3 3Z" stroke="#835de1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm font-semibold text-[#191919]">Параметры запроса</span>
                    </div>
                    <p className="text-xs text-[#676767] m-0 -mt-1">Укажите фильтры для SQL-запроса. Оставьте пустыми для выборки без ограничений.</p>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs text-[#676767]">Период от</label>
                        <input
                          type="date"
                          value={sqlDateFrom}
                          onChange={(e) => setSqlDateFrom(e.target.value)}
                          className="h-9 px-3 rounded-lg border border-[rgba(25,25,25,0.15)] bg-white text-sm text-[#191919] outline-none focus:border-[#835de1] transition-colors"
                          style={{ fontFamily: 'inherit' }}
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-xs text-[#676767]">Период до</label>
                        <input
                          type="date"
                          value={sqlDateTo}
                          onChange={(e) => setSqlDateTo(e.target.value)}
                          className="h-9 px-3 rounded-lg border border-[rgba(25,25,25,0.15)] bg-white text-sm text-[#191919] outline-none focus:border-[#835de1] transition-colors"
                          style={{ fontFamily: 'inherit' }}
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-[100px]">
                        <label className="text-xs text-[#676767]">Лимит</label>
                        <input
                          type="number"
                          value={sqlLimit}
                          onChange={(e) => setSqlLimit(e.target.value)}
                          placeholder="100"
                          className="h-9 px-3 rounded-lg border border-[rgba(25,25,25,0.15)] bg-white text-sm text-[#191919] outline-none focus:border-[#835de1] transition-colors"
                          style={{ fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <button
                        onClick={() => { setSqlStep('idle'); setSqlDateFrom(''); setSqlDateTo(''); setSqlLimit('100'); }}
                        className="px-4 h-9 rounded-lg border border-[rgba(25,25,25,0.15)] bg-white text-sm font-medium text-[#191919] cursor-pointer hover:bg-[rgba(25,25,25,0.03)] transition-colors"
                      >
                        Отмена
                      </button>
                      <button
                        className="flex items-center gap-2 px-5 h-9 rounded-lg bg-[#835de1] border-none text-sm font-semibold text-white cursor-pointer hover:bg-[#7249d1] transition-colors"
                        onClick={() => {
                          // Generate SQL from collection
                          const groups = groupedByDoc;
                          if (groups.length === 0) return;
                          const mainGroup = groups[0];
                          const mainDoc = documents.find(d => d.id === mainGroup.docId);
                          const mainAlias = 't0';
                          // SELECT fields
                          const selectParts = [];
                          groups.forEach((g, gi) => {
                            const alias = `t${gi}`;
                            g.fields.forEach(f => {
                              selectParts.push(`  ${alias}.${f.fieldName}`);
                            });
                          });
                          // FROM
                          let sql = `SELECT\n${selectParts.join(',\n')}\nFROM ${mainDoc?.name || mainGroup.docName} AS ${mainAlias}`;
                          // JOINs for additional tables
                          for (let gi = 1; gi < groups.length; gi++) {
                            const g = groups[gi];
                            const targetDoc = documents.find(d => d.id === g.docId);
                            const alias = `t${gi}`;
                            // Find a link between main doc and this doc
                            const link = fieldLinks?.find(l =>
                              (l.fromDoc === mainGroup.docId && l.toDoc === g.docId) ||
                              (l.toDoc === mainGroup.docId && l.fromDoc === g.docId)
                            );
                            const joinType = link?.joinType || 'LEFT JOIN';
                            const onFrom = link ? (link.fromDoc === mainGroup.docId ? link.fromField : link.toField) : 'id';
                            const onTo = link ? (link.fromDoc === mainGroup.docId ? link.toField : link.fromField) : 'id';
                            sql += `\n${joinType} ${targetDoc?.name || g.docName} AS ${alias}\n  ON ${mainAlias}.${onFrom} = ${alias}.${onTo}`;
                          }
                          // WHERE
                          const whereParts = [];
                          // Ищем поле с датой в любой из таблиц коллекции
                          let dateField = null;
                          for (const g of groups) {
                            const d = documents.find(dd => dd.id === g.docId);
                            if (d) {
                              const df = d.fields?.find(f => f.type?.toLowerCase().includes('date') || f.type?.toLowerCase().includes('timestamp') || f.name?.toLowerCase().includes('date') || f.name?.toLowerCase().includes('created'));
                              if (df) {
                                const alias = `t${groups.indexOf(g)}`;
                                dateField = `${alias}.${df.name}`;
                                break;
                              }
                            }
                          }
                          if (sqlDateFrom && dateField) whereParts.push(`${dateField} >= '${sqlDateFrom}'`);
                          if (sqlDateTo && dateField) whereParts.push(`${dateField} <= '${sqlDateTo}'`);
                          if (!dateField && (sqlDateFrom || sqlDateTo)) {
                            // fallback — добавим как комментарий
                            if (sqlDateFrom) whereParts.push(`/* date_column */ created_at >= '${sqlDateFrom}'`);
                            if (sqlDateTo) whereParts.push(`/* date_column */ created_at <= '${sqlDateTo}'`);
                          }
                          if (whereParts.length > 0) {
                            sql += `\nWHERE ${whereParts.join('\n  AND ')}`;
                          }
                          if (sqlLimit && parseInt(sqlLimit) > 0) {
                            sql += `\nLIMIT ${parseInt(sqlLimit)}`;
                          }
                          sql += ';';
                          setGeneratedSql(sql);
                          setSqlStep('result');
                          setSqlCopied(false);
                        }}
                      >
                        Сгенерировать SQL
                      </button>
                    </div>
                  </div>
                )}

                {sqlStep === 'result' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="2" y="2" width="12" height="12" rx="2" stroke="#5cad9a" strokeWidth="1.4"/>
                          <path d="M5 8L7 10L11 6" stroke="#5cad9a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-sm font-semibold text-[#191919]">SQL-запрос сформирован</span>
                      </div>
                      <button
                        onClick={() => { setSqlStep('filters'); setSqlCopied(false); }}
                        className="text-xs text-[#835de1] bg-transparent border-none cursor-pointer hover:underline font-medium"
                      >
                        Изменить параметры
                      </button>
                    </div>
                    <div className="relative">
                      <pre className="bg-[#1e1e2e] text-[#cdd6f4] text-xs leading-[18px] rounded-xl p-4 m-0 overflow-x-auto max-h-[200px] overflow-y-auto" style={{ fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace" }}>
                        {generatedSql}
                      </pre>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedSql);
                          setSqlCopied(true);
                          setTimeout(() => setSqlCopied(false), 2000);
                        }}
                        className={`flex items-center gap-1.5 px-4 h-9 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                          sqlCopied
                            ? 'border-[#5cad9a] bg-[rgba(92,173,154,0.08)] text-[#5cad9a]'
                            : 'border-[rgba(25,25,25,0.15)] bg-white text-[#191919] hover:bg-[rgba(25,25,25,0.03)]'
                        }`}
                      >
                        {sqlCopied ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M4 8L7 11L12 5" stroke="#5cad9a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Скопировано
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="#191919" strokeWidth="1.3"/>
                              <path d="M3 11V3H11" stroke="#191919" strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                            Скопировать
                          </>
                        )}
                      </button>
                      <button
                        className="flex items-center gap-1.5 px-5 h-9 rounded-lg bg-[#835de1] border-none text-sm font-semibold text-white cursor-pointer hover:bg-[#7249d1] transition-colors"
                        onClick={() => {
                          showAlert('SQL-запрос открыт в SQL-редакторе Data Gate');
                          setSqlStep('idle');
                          setSqlDateFrom('');
                          setSqlDateTo('');
                          setSqlLimit('100');
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M2 4L8 8L2 12V4Z" fill="white"/>
                          <rect x="10" y="4" width="4" height="8" rx="0.5" fill="white"/>
                        </svg>
                        Открыть в SQL-редакторе
                      </button>
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
