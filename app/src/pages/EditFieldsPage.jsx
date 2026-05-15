import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocuments } from '../data/DocumentsContext';
import WarningTooltip from '../components/WarningTooltip';

export default function EditFieldsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { documents } = useDocuments();
  const doc = documents.find(d => d.id === id) || documents[0];

  // Editable state for fields
  const [fields, setFields] = useState(
    doc.fields.map(f => ({ ...f }))
  );
  const [missingFields, setMissingFields] = useState(
    doc.missingFields.map(f => ({ ...f }))
  );
  const [fieldSearch, setFieldSearch] = useState('');

  const filteredFields = useMemo(() => {
    if (!fieldSearch.trim()) return fields;
    const q = fieldSearch.toLowerCase();
    return fields.filter(f => f.name.toLowerCase().includes(q));
  }, [fields, fieldSearch]);

  const handleFieldChange = (index, key, value) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const handleMissingFieldChange = (index, key, value) => {
    setMissingFields(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const addField = () => {
    setFields(prev => [...prev, { name: '', type: '', description: '' }]);
  };

  const handleSave = () => {
    // In a real app, save to backend
    navigate(-1);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f9f9f9] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-5 pt-6 px-8">
        <div className="flex gap-4 items-center">
          <button
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors shrink-0"
          >
            <img src={`${import.meta.env.BASE_URL}assets/icon-arrow-left.svg`} alt="Back" className="w-5 h-5" />
          </button>
          <h1 className="text-[30px] font-medium text-[#191919] leading-9 tracking-[-0.3px] m-0">
            Описание полей
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pt-6 pb-6">
        <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-10">
          {/* Search */}
          <div className="mb-5">
            <div className="search-field flex items-center bg-[rgba(25,25,25,0.05)] rounded-xl h-12 px-3 w-[300px]">
              <img src={`${import.meta.env.BASE_URL}assets/icon-search-20.svg`} alt="" className="w-6 h-6 mr-3 shrink-0" />
              <input
                type="text"
                value={fieldSearch}
                onChange={(e) => setFieldSearch(e.target.value)}
                placeholder="Поиск по полям"
                className="flex-1 bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] placeholder:text-[#949494]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex flex-col gap-3">
            <div className="rounded-xl overflow-hidden">
              {/* Header */}
              <div className="flex gap-[2px]">
                <div className="w-[300px] bg-[rgba(25,25,25,0.05)] px-5 py-2">
                  <span className="text-xs font-medium text-[#191919] leading-[15px] tracking-[0.12px]">
                    Название
                  </span>
                </div>
                <div className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-2">
                  <span className="text-xs font-medium text-[#191919] leading-[15px] tracking-[0.12px]">
                    Описание
                  </span>
                </div>
                <div className="w-16 bg-[rgba(25,25,25,0.05)] px-5 py-2" />
              </div>

              {/* Rows */}
              {filteredFields.map((row, i) => {
                const realIndex = fields.indexOf(row);
                return (
                  <div key={i} className="flex gap-[2px] mt-[2px]">
                    <div className="w-[300px] bg-[rgba(25,25,25,0.05)] px-5 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleFieldChange(realIndex, 'name', e.target.value)}
                          className="bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] w-full p-0 m-0"
                          placeholder="Имя поля"
                        />
                        <input
                          type="text"
                          value={row.type}
                          onChange={(e) => handleFieldChange(realIndex, 'type', e.target.value)}
                          className="bg-transparent border-none outline-none text-sm text-[#676767] leading-[18px] tracking-[0.14px] w-full p-0 m-0"
                          placeholder="Тип"
                        />
                      </div>
                    </div>
                    <div className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-2.5 flex items-center gap-2">
                      <input
                        type="text"
                        value={row.description === '—' ? '' : row.description}
                        onChange={(e) => handleFieldChange(realIndex, 'description', e.target.value)}
                        className="bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] w-full p-0 m-0 flex-1"
                        placeholder="Описание поля"
                      />
                      {(!row.description || row.description === '—' || row.description.trim() === '') && (
                        <WarningTooltip />
                      )}
                      {row.hasInfo && (
                        <img src={`${import.meta.env.BASE_URL}assets/icon-help-circle.svg`} alt="" className="w-[18px] h-[18px] shrink-0" />
                      )}
                    </div>
                    <div className="w-16 bg-[rgba(25,25,25,0.05)] px-5 py-2.5 flex items-center justify-end">
                      <button className="border-none bg-transparent cursor-pointer p-0">
                        <img src={`${import.meta.env.BASE_URL}assets/icon-dots-three.svg`} alt="" className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Missing Fields */}
            {missingFields.length > 0 && (
              <div className="flex flex-col gap-1 py-2.5">
                <div className="flex flex-col gap-0.5 py-2">
                  <span className="text-sm font-medium text-[#191919] leading-5 tracking-[0.14px]">Поля которых нет в таблице</span>
                  <span className="text-xs text-[#676767] leading-[15px] tracking-[0.12px]">Обратитесь к автору таблицы или удалите их</span>
                </div>
                <div className="flex flex-col gap-[2px] rounded-xl overflow-hidden">
                  {missingFields.map((field, i) => (
                    <div key={i} className="flex gap-[2px]">
                      <div className="w-[300px] bg-[rgba(25,25,25,0.05)] px-5 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => handleMissingFieldChange(i, 'name', e.target.value)}
                            className="bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] w-full p-0 m-0"
                            placeholder="Имя поля"
                          />
                          <input
                            type="text"
                            value={field.type}
                            onChange={(e) => handleMissingFieldChange(i, 'type', e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-[#676767] leading-[18px] tracking-[0.14px] w-full p-0 m-0"
                            placeholder="Тип"
                          />
                        </div>
                      </div>
                      <div className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-2.5 flex items-center">
                        <input
                          type="text"
                          value={field.description}
                          onChange={(e) => handleMissingFieldChange(i, 'description', e.target.value)}
                          className="bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] w-full p-0 m-0 flex-1"
                          placeholder="Описание"
                        />
                      </div>
                      <div className="w-16 bg-[rgba(25,25,25,0.05)] px-5 py-2.5 flex items-center justify-end">
                        <button className="border-none bg-transparent cursor-pointer p-0">
                          <img src={`${import.meta.env.BASE_URL}assets/icon-dots-three.svg`} alt="" className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Field */}
            <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 py-4 w-[300px]">
              <div className="flex items-center gap-3 cursor-pointer" onClick={addField}>
                <img src={`${import.meta.env.BASE_URL}assets/icon-plus-circle.svg`} alt="" className="w-6 h-6" />
                <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px]">Добавить поле</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center py-5 bg-[#f9f9f9]">
        <button
          onClick={handleSave}
          className="w-[335px] h-[50px] rounded-[10px] bg-[#835de1] border-none cursor-pointer text-lg font-medium text-white leading-[22px] hover:bg-[#7249d1] transition-colors"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
