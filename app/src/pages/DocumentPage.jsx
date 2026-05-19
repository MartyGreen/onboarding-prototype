import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDocuments } from '../data/DocumentsContext';
import AddFieldModal from '../components/AddFieldModal';
import WarningTooltip from '../components/WarningTooltip';

export default function DocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { documents, updateDocument, statusConfig, toggleStarred } = useDocuments();
  const doc = documents.find(d => d.id === id) || documents[0];
  const [fieldSearch, setFieldSearch] = useState('');
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // индекс поля с открытым меню
  const [openMissingMenuIndex, setOpenMissingMenuIndex] = useState(null); // для missing fields
  const [editFieldIndex, setEditFieldIndex] = useState(null); // индекс поля для редактирования

  // Закрытие меню при клике вне
  React.useEffect(() => {
    if (openMenuIndex === null && openMissingMenuIndex === null) return;
    const handleClick = () => {
      setOpenMenuIndex(null);
      setOpenMissingMenuIndex(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [openMenuIndex, openMissingMenuIndex]);

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
            onClick={() => toggleStarred(doc.id)}
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
                return (
                  <div key={i} className="flex gap-[2px] mt-[2px]">
                    <div className={`w-[280px] bg-[rgba(25,25,25,0.05)] px-5 py-3.5 ${isLast ? 'rounded-bl-xl' : ''}`}>
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">
                          {row.name}
                        </span>
                        <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">
                          {row.type}
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-3.5 flex items-start gap-2 cursor-text"
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
    </div>
  );
}
