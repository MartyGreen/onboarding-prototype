import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocuments } from '../data/DocumentsContext';
import { useAlert } from '../components/SuccessAlert';

// Данные для дропдаунов
const ownerOptions = [
  'Круг Data Engineering',
  'Круг Data Analytics',
  'Круг Data Science',
  'Круг Platform',
  'Круг Backend',
  'Круг Frontend',
  'Круг DevOps',
  'Круг Security',
  'Круг Product',
  'Круг QA',
];

const databaseOptions = ['Oracle', 'ClickHouse', 'GreenPlum'];

const schemaOptions = {
  'Oracle': ['STAGE', 'DWH', 'ODS', 'MART'],
  'ClickHouse': ['STAGE', 'RAW', 'DWH', 'ANALYTICS'],
  'GreenPlum': ['PUBLIC', 'STAGE', 'DWH', 'SANDBOX'],
};

const tableOptions = {
  'STAGE': ['ecom_team.prelead_seller_sign', 'ecom_team.orders', 'ecom_team.customers'],
  'DWH': ['dim_client', 'fact_orders', 'dim_product'],
  'ODS': ['ods_transactions', 'ods_accounts', 'ods_contracts'],
  'MART': ['mart_sales', 'mart_retention', 'mart_funnel'],
  'RAW': ['raw_events', 'raw_clicks', 'raw_sessions'],
  'ANALYTICS': ['report_daily', 'report_weekly', 'report_monthly'],
  'PUBLIC': ['users', 'orders', 'products'],
  'SANDBOX': ['tmp_analysis', 'tmp_model', 'tmp_export'],
};

// Компонент Dropdown
function Dropdown({ label, placeholder, options, value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`dropdown-trigger flex items-center rounded-xl px-5 py-3 border-none text-left w-full transition-all ${
          disabled
            ? 'bg-[rgba(25,25,25,0.03)] cursor-not-allowed opacity-50'
            : isOpen
              ? 'bg-[rgba(25,25,25,0.05)] ring-2 ring-[#835de1] cursor-pointer'
              : 'bg-[rgba(25,25,25,0.05)] cursor-pointer hover:bg-[rgba(25,25,25,0.08)]'
        }`}
      >
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">{label}</span>
          <span className={`text-base leading-5 tracking-[0.16px] ${value ? 'text-[#191919]' : 'text-[#949494]'}`}>
            {value || placeholder}
          </span>
        </div>
        <img
          src={`${import.meta.env.BASE_URL}assets/icon-chevron-down.svg`}
          alt=""
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && options.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-[0px_4px_16px_rgba(0,0,0,0.12)] border border-[rgba(25,25,25,0.08)] z-50 overflow-hidden max-h-[240px] overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`flex items-center w-full px-5 py-3 border-none text-left cursor-pointer transition-colors text-base leading-5 tracking-[0.16px] ${
                value === option
                  ? 'bg-[rgba(131,93,225,0.08)] text-[#835de1] font-medium'
                  : 'bg-transparent text-[#191919] hover:bg-[rgba(25,25,25,0.04)]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const dbColors = {
  'Oracle': '#ff6b35',
  'ClickHouse': '#facc15',
  'GreenPlum': '#4caf50',
};

export default function NewDocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { documents, addDocument, updateDocument } = useDocuments();
  const { showAlert } = useAlert();

  // Режим редактирования
  const isEditMode = Boolean(id);
  const existingDoc = isEditMode ? documents.find(d => d.id === id) : null;

  const [storageEnabled, setStorageEnabled] = useState(true);
  const [storageType, setStorageType] = useState('DWH');
  const [fields, setFields] = useState(() => {
    if (existingDoc && existingDoc.fields.length > 0) {
      return existingDoc.fields.map(f => ({ name: f.name, type: f.type || '', description: f.description || '', inTable: true }));
    }
    return [{ name: 'id', type: 'bigint', description: 'PK', inTable: true }, { name: 'created_at', type: 'timestamp without time zone', description: '', inTable: true }];
  });
  const [missingFields, setMissingFields] = useState(() => {
    if (existingDoc && existingDoc.missingFields && existingDoc.missingFields.length > 0) {
      return existingDoc.missingFields.map(f => ({ name: f.name, type: f.type || '', description: f.description || '' }));
    }
    return [];
  });
  const [description, setDescription] = useState(existingDoc?.descriptionFull || '');
  const [tags, setTags] = useState(existingDoc?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const tagInputRef = useRef(null);
  const tagDropdownRef = useRef(null);

  // Dropdown states
  const [owner, setOwner] = useState(existingDoc?.circles?.replace(' (Якорный Круг)', '') || '');
  const [database, setDatabase] = useState(existingDoc?.database || '');
  const [schema, setSchema] = useState(existingDoc?.schema || '');
  const [table, setTable] = useState(existingDoc?.name || '');
  const [isGenerating, setIsGenerating] = useState(false);

  // Популярные теги команды (зависят от выбранного владельца)
  const popularTagsByOwner = {
    'Круг Data Engineering': ['ETL', 'DWH', 'Pipeline', 'Airflow', 'Data Quality', 'Spark'],
    'Круг Data Analytics': ['BI', 'Дашборд', 'Метрики', 'A/B тест', 'Когорты', 'Отчётность'],
    'Круг Data Science': ['ML', 'Модель', 'Фичи', 'Прогноз', 'NLP', 'Рекомендации'],
    'Круг Platform': ['Инфраструктура', 'Kubernetes', 'CI/CD', 'Мониторинг', 'SLA'],
    'Круг Backend': ['API', 'Микросервис', 'БД', 'Кэш', 'Очереди', 'REST'],
    'Круг Frontend': ['UI', 'Компонент', 'Дизайн-система', 'SPA', 'Роутинг'],
    'Круг DevOps': ['Deploy', 'Docker', 'Terraform', 'Логи', 'Алерты'],
    'Круг Security': ['Безопасность', 'Аутентификация', 'Шифрование', 'Аудит'],
    'Круг Product': ['Продукт', 'Фича', 'Roadmap', 'OKR', 'Гипотеза'],
    'Круг QA': ['Тестирование', 'Автотест', 'Регресс', 'Баг', 'Покрытие'],
  };
  const defaultPopularTags = ['ORACLE', 'DOCUMENT', 'ЭДО', 'Документооборот', 'ЭПД', 'DWH', 'ETL', 'Метрики'];
  const popularTags = owner ? (popularTagsByOwner[owner] || defaultPopularTags) : defaultPopularTags;

  // Фильтрация тегов в дропдауне
  const filteredPopularTags = tagInput.trim()
    ? popularTags.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t))
    : popularTags.filter(t => !tags.includes(t));

  const showCreateOption = tagInput.trim() && !popularTags.some(t => t.toLowerCase() === tagInput.trim().toLowerCase()) && !tags.includes(tagInput.trim());

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
    setTagDropdownOpen(false);
    tagInputRef.current?.focus();
  };

  const removeTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  // Закрытие тег-дропдауна при клике вне
  useEffect(() => {
    function handleClickOutside(e) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target)) {
        setTagDropdownOpen(false);
      }
    }
    if (tagDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tagDropdownOpen]);

  // Reset dependent dropdowns
  const handleDatabaseChange = (val) => {
    setDatabase(val);
    setSchema('');
    setTable('');
  };

  const handleSchemaChange = (val) => {
    setSchema(val);
    setTable('');
  };

  const handleFieldChange = (index, key, value) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const addField = () => {
    setFields(prev => [...prev, { name: '', description: '' }]);
  };

  // Генерация описания ИИ
  const generateAIDescription = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const tableName = table || 'таблица';
    const dbName = database || 'база данных';
    const schemaName = schema || 'схема';
    const fieldNames = fields.filter(f => f.name).map(f => f.name).join(', ');

    const descriptions = [
      `Таблица ${tableName} в ${dbName}.${schemaName} содержит данные, необходимые для аналитической отчётности и формирования ключевых бизнес-метрик. Поля: ${fieldNames || 'не указаны'}. Данные обновляются ежедневно в рамках ETL-процесса и используются смежными командами для построения дашбордов и ad-hoc анализа.`,
      `Данная таблица (${tableName}) является частью схемы ${schemaName} в ${dbName} и служит источником данных для расчёта операционных показателей. Содержит информацию, структурированную по полям: ${fieldNames || 'не указаны'}. Рекомендуется для использования в витринах данных и BI-отчётах.`,
      `${tableName} — таблица хранилища ${dbName}, схема ${schemaName}. Предназначена для хранения и агрегации бизнес-данных. Основные поля: ${fieldNames || 'не указаны'}. Используется в процессах Data Engineering для обеспечения консистентности данных между слоями хранилища.`,
    ];

    const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];

    // Имитация печатания
    let i = 0;
    setDescription('');
    const interval = setInterval(() => {
      if (i < randomDesc.length) {
        setDescription(prev => prev + randomDesc[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 15);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f9f9f9] pt-8 px-8 overflow-y-auto">
      <div className="flex flex-col gap-6 items-center w-full">
        {/* Title */}
        <div className="w-[600px]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[rgba(25,25,25,0.05)] transition-colors border-none bg-transparent cursor-pointer"
            >
              <img src={`${import.meta.env.BASE_URL}assets/icon-arrow-left.svg`} alt="Back" className="w-6 h-6" />
            </button>
            <h1 className="text-[30px] font-semibold text-[#191919] leading-9 tracking-[-0.3px] m-0 flex-1">
              {isEditMode ? 'Редактирование документа' : 'Новый документ'}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="w-[720px] flex flex-col gap-8 pb-8">
          {/* Fields Section */}
          <div className="flex flex-col gap-4 px-5">
            {/* Owner Dropdown */}
            <Dropdown
              label="Круги-владельцы"
              placeholder="Выберите круг"
              options={ownerOptions}
              value={owner}
              onChange={setOwner}
            />

            {/* Storage Section */}
            <div className="flex flex-col gap-3">
              {/* Storage Toggle */}
              <div className="flex items-center gap-4 py-3">
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-lg font-medium text-[#191919] leading-[22px]">Хранилище</span>
                  <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Для активного документа выбор хранилища обязателен</span>
                </div>
                {/* Switch */}
                <button
                  onClick={() => setStorageEnabled(!storageEnabled)}
                  className="relative w-14 h-8 rounded-2xl border-none cursor-pointer transition-colors p-0"
                  style={{ backgroundColor: storageEnabled ? '#835de1' : 'rgba(25,25,25,0.1)' }}
                >
                  <div
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all"
                    style={{ left: storageEnabled ? '26px' : '4px' }}
                  />
                </button>
              </div>

              {storageEnabled && (
                <>
                  {/* Storage Type Chips */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStorageType('DWH')}
                      className={`flex items-center h-10 px-3 rounded-xl border-none cursor-pointer transition-colors text-sm font-medium leading-[18px] tracking-[0.14px] ${
                        storageType === 'DWH'
                          ? 'bg-[#835de1] text-white'
                          : 'bg-[rgba(25,25,25,0.05)] text-[#191919] hover:bg-[rgba(25,25,25,0.1)]'
                      }`}
                    >
                      DWH
                    </button>
                    <button
                      onClick={() => setStorageType('external')}
                      className={`flex items-center h-10 px-3 rounded-xl border-none cursor-pointer transition-colors text-sm font-medium leading-[18px] tracking-[0.14px] ${
                        storageType === 'external'
                          ? 'bg-[#835de1] text-white'
                          : 'bg-[rgba(25,25,25,0.05)] text-[#191919] hover:bg-[rgba(25,25,25,0.1)]'
                      }`}
                    >
                      Внешний источник
                    </button>
                  </div>

                  {/* Database / Schema / Table Dropdowns */}
                  <div className="flex flex-col gap-3">
                    <Dropdown
                      label="База данных"
                      placeholder="Выберите базу данных"
                      options={databaseOptions}
                      value={database}
                      onChange={handleDatabaseChange}
                    />

                    <Dropdown
                      label="Схема"
                      placeholder="Выберите схему"
                      options={database ? (schemaOptions[database] || []) : []}
                      value={schema}
                      onChange={handleSchemaChange}
                      disabled={!database}
                    />

                    <Dropdown
                      label="Таблица"
                      placeholder="Выберите таблицу"
                      options={schema ? (tableOptions[schema] || []) : []}
                      value={table}
                      onChange={setTable}
                      disabled={!schema}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Description Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center py-2">
                <span className="text-lg font-medium text-[#191919] leading-[22px] flex-1">Описание таблицы</span>
              </div>
              <div className="form-field bg-[rgba(25,25,25,0.05)] rounded-xl overflow-hidden">
                <div className="flex flex-col px-5 pt-3 min-h-[108px]">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Введите описание документа..."
                    className="w-full bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 resize-none min-h-[80px] placeholder:text-[#949494]"
                  />
                </div>
                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-2 border-t border-[rgba(25,25,25,0.1)]">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors">
                      <span className="text-sm font-bold text-[#191919]">T</span>
                    </button>
                    <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors">
                      <span className="text-sm font-bold text-[#191919]">B</span>
                    </button>
                    <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors">
                      <span className="text-sm text-[#191919]">≡</span>
                    </button>
                    <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors">
                      <span className="text-sm text-[#191919]">🔗</span>
                    </button>
                    <div className="w-[1px] h-5 bg-[rgba(25,25,25,0.1)] mx-1" />
                    <button
                      onClick={generateAIDescription}
                      disabled={isGenerating}
                      className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border-none cursor-pointer transition-colors ${
                        isGenerating
                          ? 'bg-[rgba(131,93,225,0.1)] cursor-wait'
                          : 'bg-transparent hover:bg-[rgba(131,93,225,0.08)]'
                      }`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1L9.5 5.5L14 7L9.5 8.5L8 13L6.5 8.5L2 7L6.5 5.5L8 1Z" stroke="#835de1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12.5 1.5L13 3L14.5 3.5L13 4L12.5 5.5L12 4L10.5 3.5L12 3L12.5 1.5Z" stroke="#835de1" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs font-medium text-[#835de1] leading-[15px] tracking-[0.12px] whitespace-nowrap">
                        {isGenerating ? 'Генерация...' : 'Сгенерировать ИИ'}
                      </span>
                    </button>
                  </div>
                  <span className="text-xs text-[rgba(25,25,25,0.45)] tracking-[0.12px]">{description.length} / 5 000</span>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="flex flex-col gap-0" ref={tagDropdownRef}>
              <div className="flex items-center py-2">
                <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Теги</span>
              </div>
              <div className="relative">
                <div
                  className={`bg-[rgba(25,25,25,0.05)] rounded-xl px-5 py-3 transition-all cursor-text ${
                    tagDropdownOpen ? 'ring-2 ring-[#835de1]' : ''
                  }`}
                  onClick={() => { setTagDropdownOpen(true); tagInputRef.current?.focus(); }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-[rgba(131,93,225,0.1)] text-sm font-medium text-[#835de1] leading-[18px] tracking-[0.14px] whitespace-nowrap"
                      >
                        {tag}
                        <svg
                          width="12" height="12" viewBox="0 0 16 16" fill="none"
                          className="cursor-pointer shrink-0"
                          onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                        >
                          <path d="M4 4l8 8M12 4l-8 8" stroke="#835de1" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </span>
                    ))}
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={tagInput}
                      onChange={(e) => { setTagInput(e.target.value); setTagDropdownOpen(true); }}
                      onFocus={() => setTagDropdownOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          e.preventDefault();
                          addTag(tagInput);
                        } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
                          removeTag(tags[tags.length - 1]);
                        }
                      }}
                      placeholder={tags.length === 0 ? 'Начните вводить тег...' : ''}
                      className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 placeholder:text-[#949494]"
                    />
                  </div>
                </div>

                {/* Дропдаун популярных тегов */}
                {tagDropdownOpen && (filteredPopularTags.length > 0 || showCreateOption) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.1)] z-50 overflow-hidden py-[5px]">
                    <div className="max-h-[240px] overflow-y-auto">
                      {filteredPopularTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => addTag(tag)}
                          className="flex items-center w-full px-5 py-[10px] border-none bg-transparent cursor-pointer hover:bg-[rgba(25,25,25,0.04)] transition-colors text-left"
                        >
                          <span className="flex-1 text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">{tag}</span>
                        </button>
                      ))}
                      {showCreateOption && (
                        <button
                          onClick={() => addTag(tagInput)}
                          className="flex items-center gap-2 w-full px-5 py-[10px] border-none bg-transparent cursor-pointer hover:bg-[rgba(131,93,225,0.04)] transition-colors text-left border-t border-[rgba(25,25,25,0.08)]"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="#835de1" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px]">
                            Создать «{tagInput.trim()}»
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fields Table */}
            <div className="flex flex-col" style={{ gap: 6 }}>
              <div className="flex items-center" style={{ height: 78, padding: '8px 0' }}>
                <span className="text-lg font-medium text-[#191919] leading-[22px] flex-1">Описание полей</span>
              </div>

              {/* Table — поля из таблицы */}
              <div className="flex flex-col gap-0.5 overflow-hidden" style={{ borderRadius: 12 }}>
                {fields.map((field, i) => (
                  <div key={i} className="flex gap-0.5" style={{ minHeight: 60 }}>
                    {/* Название + тип */}
                    <div className="bg-[rgba(25,25,25,0.05)] flex items-start" style={{ width: 240, padding: '10px 20px', gap: 10 }}>
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-base text-[#191919] leading-5 tracking-[0.16px]" style={{ wordBreak: 'break-word' }}>{field.name || 'Имя поля'}</span>
                        {field.type && (
                          <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]" style={{ wordBreak: 'break-word' }}>{field.type}</span>
                        )}
                      </div>
                    </div>
                    {/* Описание */}
                    <div className="bg-[rgba(25,25,25,0.05)] flex flex-1 items-center min-w-0" style={{ padding: '10px 20px', gap: 10 }}>
                      <textarea
                        value={field.description}
                        onChange={(e) => {
                          handleFieldChange(i, 'description', e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        ref={(el) => {
                          if (el) {
                            el.style.height = 'auto';
                            el.style.height = el.scrollHeight + 'px';
                          }
                        }}
                        placeholder="Заполните описание"
                        rows={1}
                        style={{ fontFamily: 'inherit', resize: 'none', overflow: 'hidden' }}
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 placeholder:text-[#949494]"
                      />
                      {/* Красная иконка предупреждения если нет описания */}
                      {!field.description && (
                        <img src={`${import.meta.env.BASE_URL}assets/icon-warning-circle.svg`} alt="Нет описания" style={{ width: 18, height: 18, flexShrink: 0 }} />
                      )}
                    </div>
                    {/* Корзина — серая, неактивная для полей из таблицы */}
                    <div className="bg-[rgba(25,25,25,0.05)] flex items-center justify-center" style={{ padding: '10px 20px' }}>
                      <img src={`${import.meta.env.BASE_URL}assets/icon-trash-black.svg`} alt="" style={{ width: 20, height: 20, opacity: 0.25, cursor: 'default' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Поля которых нет в таблице */}
              {missingFields.length > 0 && (
                <div className="flex flex-col items-start" style={{ marginTop: 20 }}>
                  {/* Заголовок блока */}
                  <div className="flex flex-col gap-0.5" style={{ padding: '8px 0', height: 54, justifyContent: 'center' }}>
                    <span className="text-sm font-medium text-[#191919] leading-5 tracking-[0.14px]">
                      Поля которых нет в таблице
                    </span>
                    <span className="text-xs text-[#676767] leading-[15px] tracking-[0.12px]">
                      Обратитесь к автору таблицы или удалите их
                    </span>
                  </div>

                  {/* Таблица missing-полей */}
                  <div className="flex flex-col gap-0.5 overflow-hidden w-full" style={{ borderRadius: 12 }}>
                    {missingFields.map((field, i) => (
                      <div key={i} className="flex gap-0.5" style={{ minHeight: 60 }}>
                        {/* Название + тип — редактируемое */}
                        <div className="bg-[rgba(25,25,25,0.05)] flex items-start" style={{ width: 240, padding: '10px 20px', gap: 10 }}>
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => {
                                const updated = [...missingFields];
                                updated[i] = { ...updated[i], name: e.target.value };
                                setMissingFields(updated);
                              }}
                              placeholder="Имя поля"
                              style={{ fontFamily: 'inherit', wordBreak: 'break-word' }}
                              className="w-full min-w-0 bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 placeholder:text-[#949494]"
                            />
                            <input
                              type="text"
                              value={field.type || ''}
                              onChange={(e) => {
                                const updated = [...missingFields];
                                updated[i] = { ...updated[i], type: e.target.value };
                                setMissingFields(updated);
                              }}
                              placeholder="Тип"
                              style={{ fontFamily: 'inherit' }}
                              className="w-full min-w-0 bg-transparent border-none outline-none text-sm text-[#676767] leading-[18px] tracking-[0.14px] p-0 m-0 placeholder:text-[#949494]"
                            />
                          </div>
                        </div>
                        {/* Описание */}
                        <div className="bg-[rgba(25,25,25,0.05)] flex flex-1 items-center min-w-0" style={{ padding: '10px 20px', gap: 10 }}>
                          <textarea
                            value={field.description}
                            onChange={(e) => {
                              const updated = [...missingFields];
                              updated[i] = { ...updated[i], description: e.target.value };
                              setMissingFields(updated);
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onInput={(e) => {
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            ref={(el) => {
                              if (el) {
                                el.style.height = 'auto';
                                el.style.height = el.scrollHeight + 'px';
                              }
                            }}
                            placeholder="Заполните описание"
                            rows={1}
                            style={{ fontFamily: 'inherit', resize: 'none', overflow: 'hidden' }}
                            className="flex-1 min-w-0 bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 placeholder:text-[#949494]"
                          />
                          {/* Красная иконка предупреждения если нет описания */}
                          {!field.description && (
                            <img src={`${import.meta.env.BASE_URL}assets/icon-warning-circle.svg`} alt="Нет описания" style={{ width: 18, height: 18, flexShrink: 0 }} />
                          )}
                        </div>
                        {/* Корзина — чёрная, активная для missing-полей */}
                        <div
                          className="bg-[rgba(25,25,25,0.05)] flex items-center justify-center cursor-pointer hover:bg-[rgba(25,25,25,0.08)] transition-colors"
                          style={{ padding: '10px 20px' }}
                          onClick={() => setMissingFields(prev => prev.filter((_, idx) => idx !== i))}
                        >
                          <img src={`${import.meta.env.BASE_URL}assets/icon-trash-black.svg`} alt="Удалить" style={{ width: 20, height: 20 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопка «Добавить строку» */}
              <div
                className="bg-[rgba(25,25,25,0.05)] flex items-center gap-2 cursor-pointer hover:bg-[rgba(25,25,25,0.08)] transition-colors"
                style={{ borderRadius: 8, padding: '0 12px', height: 40, marginTop: 20 }}
                onClick={() => setMissingFields(prev => [...prev, { name: '', type: '', description: '' }])}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">Добавить строку</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center px-5 py-3">
            <button
              onClick={() => {
                const tableName = table || 'new_table';
                const fullPath = database && schema
                  ? `${database.toUpperCase()} > ${schema} > ${tableName}`
                  : tableName;
                const parsedFields = fields.filter(f => f.name).map(f => ({
                  name: f.name,
                  type: f.type || 'varchar',
                  description: f.description || '',
                }));
                const parsedTags = tags.length > 0 ? tags : [];

                if (isEditMode && existingDoc) {
                  updateDocument(id, {
                    name: tableName,
                    fullPath,
                    description: description.slice(0, 80) || existingDoc.description,
                    descriptionFull: description || existingDoc.descriptionFull,
                    database: database || existingDoc.database,
                    dbColor: dbColors[database] || existingDoc.dbColor,
                    schema: schema || existingDoc.schema,
                    circles: owner ? `${owner} (Якорный Круг)` : existingDoc.circles,
                    tags: parsedTags,
                    fields: parsedFields,
                    missingFields: missingFields.filter(f => f.name),
                    updatedAt: 'только что',
                  });
                  showAlert('Изменения сохранены');
                  navigate(`/document/${id}`);
                } else {
                  const newId = String(Date.now());
                  const newDoc = {
                    id: newId,
                    name: tableName,
                    fullPath,
                    description: description.slice(0, 80) || 'Новый документ',
                    descriptionFull: description || 'Описание не указано',
                    author: 'Антон Вараксин',
                    authorAvatar: '/assets/avatar-boy.svg',
                    database: database || 'ClickHouse',
                    dbColor: dbColors[database] || '#facc15',
                    schema: schema || 'STAGE',
                    status: 'Черновик',
                    starred: false,
                    createdAt: 'только что',
                    updatedAt: 'только что',
                    circles: owner ? `${owner} (Якорный Круг)` : 'Не указан',
                    roles: [],
                    tags: parsedTags,
                    fields: parsedFields,
                    missingFields: [],
                    experts: [],
                  };
                  addDocument(newDoc);
                  showAlert('Документ успешно создан');
                  navigate(`/document/${newId}`);
                }
              }}
              className="w-full h-12 bg-[#835de1] rounded-xl border-none cursor-pointer hover:bg-[#7249d1] active:bg-[#6340b8] transition-colors"
            >
              <span className="text-base font-medium text-white leading-5 tracking-[0.16px]">Сохранить</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
