import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocuments } from '../data/DocumentsContext';
import AddFieldModal from '../components/AddFieldModal';

export default function DocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { documents, updateDocument, statusConfig } = useDocuments();
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
    return doc.fields.filter(f => f.name.toLowerCase().includes(q));
  }, [doc.fields, fieldSearch]);

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] overflow-y-auto">
      {/* Header */}
      <header className="flex items-center gap-4 px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors shrink-0"
        >
          <img src={`${import.meta.env.BASE_URL}assets/icon-arrow-left.svg`} alt="Back" className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: statusConfig[doc.status]?.bgColor || '#80bc00' }}>
            <span className="text-white text-sm font-bold">{doc.database?.substring(0, 2).toUpperCase()}</span>
          </div>
          <h1 className="text-[30px] font-semibold text-[#191919] leading-9 tracking-[-0.3px] m-0 truncate">
            {doc.fullPath}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src={`${import.meta.env.BASE_URL}assets/icon-arrows-rotation.svg`} alt="" className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src={`${import.meta.env.BASE_URL}assets/icon-pencil-2.svg`} alt="" className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src={`${import.meta.env.BASE_URL}assets/icon-layer-copy.svg`} alt="" className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src={`${import.meta.env.BASE_URL}assets/icon-trash.svg`} alt="" className="w-5 h-5" />
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
              <button className="flex items-center justify-center w-6 h-6 border-none bg-transparent cursor-pointer">
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
                return (
                  <div key={i} className={`flex gap-[2px] mt-[2px] ${isLast ? 'rounded-b-xl overflow-hidden' : ''}`}>
                    <div className="w-[280px] bg-[rgba(25,25,25,0.05)] px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">
                          {row.name}
                        </span>
                        <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">
                          {row.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-3.5 flex items-center">
                      <span className="text-base text-[#191919] leading-5 tracking-[0.16px] flex-1">
                        {row.description}
                      </span>
                      {row.hasInfo && (
                        <img src={`${import.meta.env.BASE_URL}assets/icon-help-circle.svg`} alt="" className="w-[18px] h-[18px] ml-2" />
                      )}
                    </div>
                    <div className="bg-[rgba(25,25,25,0.05)] px-3 py-3.5 flex items-center relative">
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
                          className="absolute right-0 top-full z-50 bg-white rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.1)] py-2.5 min-w-[255px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="flex items-center gap-3 w-full px-5 py-2.5 text-base font-medium text-[#191919] leading-5 tracking-[0.16px] bg-transparent border-none cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors text-left"
                            onClick={() => {
                              setEditFieldIndex(realIndex);
                              setOpenMenuIndex(null);
                            }}
                          >
                            <img src={`${import.meta.env.BASE_URL}assets/icon-pencil-3.svg`} alt="" className="w-6 h-6" />
                            Редактировать
                          </button>
                          <button
                            className="flex items-center gap-3 w-full px-5 py-2.5 text-base font-semibold text-[#d74b4b] leading-5 tracking-[0.16px] bg-transparent border-none cursor-pointer hover:bg-[rgba(215,75,75,0.05)] transition-colors text-left"
                            onClick={() => handleDeleteField(realIndex)}
                          >
                            <img src={`${import.meta.env.BASE_URL}assets/icon-trash.svg`} alt="" className="w-6 h-6" />
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
                <div className="flex flex-col gap-0.5 rounded-xl overflow-hidden">
                  {doc.missingFields.map((field, i) => (
                    <div key={i} className="flex gap-[2px]">
                      <div className="w-[280px] bg-[rgba(25,25,25,0.05)] px-5 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-base text-[#191919] leading-5 tracking-[0.16px]">{field.name}</span>
                          <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">{field.type}</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-2.5 flex items-center">
                        <span className="text-base text-[#191919] leading-5 tracking-[0.16px]">{field.description}</span>
                      </div>
                      <div className="bg-[rgba(25,25,25,0.05)] px-2.5 py-2.5 flex items-start relative">
                        <button
                          className="border-none bg-transparent cursor-pointer p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuIndex(null);
                            setOpenMissingMenuIndex(openMissingMenuIndex === i ? null : i);
                          }}
                        >
                          <img src={`${import.meta.env.BASE_URL}assets/icon-dots-three.svg`} alt="" className="w-6 h-6" />
                        </button>
                        {openMissingMenuIndex === i && (
                          <div
                            className="absolute right-0 top-full z-50 bg-white rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.1)] py-2.5 min-w-[255px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="flex items-center gap-3 w-full px-5 py-2.5 text-base font-semibold text-[#d74b4b] leading-5 tracking-[0.16px] bg-transparent border-none cursor-pointer hover:bg-[rgba(215,75,75,0.05)] transition-colors text-left"
                              onClick={() => handleDeleteMissingField(i)}
                            >
                              <img src={`${import.meta.env.BASE_URL}assets/icon-trash.svg`} alt="" className="w-6 h-6" />
                              Удалить
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">{expert.role}</span>
                    <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px]">{expert.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Expert */}
            <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 py-4 mt-3">
              <div>
                <div className="flex items-center gap-3 cursor-pointer">
                  <img src={`${import.meta.env.BASE_URL}assets/icon-plus-circle.svg`} alt="" className="w-6 h-6" />
                  <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px]">Добавить себя как эксперта</span>
                </div>
              </div>
            </div>
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
