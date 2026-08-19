import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocuments } from '../data/DocumentsContext';
import { useAlert } from '../components/SuccessAlert';

// Данные для дропдаунов
const ownerOptions = [
  'Data Engineering',
  'Data Analytics',
  'Data Science',
  'Platform',
  'Backend',
  'Frontend',
  'DevOps',
  'Security',
  'Product',
  'QA',
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

// Данные для внешнего источника (по макету Figma)
const extSourceOptions = [
  'iron_wall', 'opendata', 'pg-public', 'pg-public1',
  'pg-public2', 'pg-public3', 'pg-public4', 'pg-public5',
];

const extDatabaseOptions = {
  'iron_wall': ['iron_db_prod', 'iron_db_stage'],
  'opendata': ['opendata_main', 'opendata_archive'],
  'pg-public': ['pg_main', 'pg_analytics'],
  'pg-public1': ['pg1_prod', 'pg1_test'],
  'pg-public2': ['pg2_prod', 'pg2_stage'],
  'pg-public3': ['pg3_main'],
  'pg-public4': ['pg4_prod', 'pg4_dev'],
  'pg-public5': ['pg5_prod'],
};

const extSchemaOptions = {
  'iron_db_prod': ['public', 'core', 'analytics'],
  'iron_db_stage': ['staging', 'raw'],
  'opendata_main': ['datasets', 'references'],
  'opendata_archive': ['archive_2024', 'archive_2023'],
  'pg_main': ['public', 'billing'],
  'pg_analytics': ['reports', 'metrics'],
  'pg1_prod': ['public', 'orders'],
  'pg1_test': ['test_schema'],
  'pg2_prod': ['public', 'warehouse'],
  'pg2_stage': ['staging'],
  'pg3_main': ['public', 'integration'],
  'pg4_prod': ['public', 'partner'],
  'pg4_dev': ['dev_schema'],
  'pg5_prod': ['public'],
};

const extTableOptions = {
  'public': ['users', 'transactions', 'accounts', 'sessions'],
  'core': ['dim_client', 'dim_product', 'fact_orders'],
  'analytics': ['daily_metrics', 'weekly_report', 'funnel_data'],
  'staging': ['stg_orders', 'stg_users', 'stg_events'],
  'raw': ['raw_events', 'raw_logs'],
  'datasets': ['population', 'economics', 'transport'],
  'references': ['countries', 'currencies', 'categories'],
  'archive_2024': ['q1_data', 'q2_data', 'q3_data'],
  'archive_2023': ['annual_report', 'monthly_stats'],
  'billing': ['invoices', 'payments', 'subscriptions'],
  'reports': ['daily_summary', 'weekly_kpi'],
  'metrics': ['conversion', 'retention', 'revenue'],
  'orders': ['order_items', 'order_headers', 'order_status'],
  'test_schema': ['test_users', 'test_orders'],
  'warehouse': ['stock', 'shipments', 'returns'],
  'integration': ['api_logs', 'sync_status'],
  'partner': ['partner_orders', 'partner_products'],
  'dev_schema': ['dev_test_table'],
};

const loadFrequencyOptions = [
  { value: 'Ежедневный', description: 'Запуск расчёта раз в день в указанное время.' },
  { value: 'По расписанию', description: 'Запуск расчёта с определенной частотой и в рамках указанного интервала (≥ 1 раз в день)' },
];

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

// Кастомный дропдаун частоты загрузки (с описаниями и галочкой)
function FrequencyDropdown({ value, onChange, options }) {
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
        onClick={() => setIsOpen(!isOpen)}
        className={`dropdown-trigger flex items-center rounded-xl px-5 py-3 border-none text-left w-full transition-all ${
          isOpen
            ? 'bg-[rgba(25,25,25,0.05)] ring-2 ring-[#835de1] cursor-pointer'
            : 'bg-[rgba(25,25,25,0.05)] cursor-pointer hover:bg-[rgba(25,25,25,0.08)]'
        }`}
      >
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">Частота загрузки</span>
          <span className={`text-base leading-5 tracking-[0.16px] ${value ? 'text-[#191919]' : 'text-[#949494]'}`}>
            {value || 'Выберите частоту'}
          </span>
        </div>
        <img
          src={`${import.meta.env.BASE_URL}assets/icon-chevron-down.svg`}
          alt=""
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-[0px_4px_16px_rgba(0,0,0,0.12)] border border-[rgba(25,25,25,0.08)] z-50 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`flex items-start w-full px-5 py-3 border-none text-left cursor-pointer transition-colors ${
                value === opt.value
                  ? 'bg-[rgba(25,25,25,0.02)]'
                  : 'bg-transparent hover:bg-[rgba(25,25,25,0.04)]'
              }`}
            >
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="text-base font-semibold text-[#191919] leading-5 tracking-[0.16px]">{opt.value}</span>
                <span className="text-sm text-[#6E6E6E] leading-[18px] tracking-[0.14px]">{opt.description}</span>
              </div>
              {value === opt.value && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5 ml-3">
                  <path d="M4 10.5L8 14.5L16 6.5" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
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

  // External source states
  const [extSource, setExtSource] = useState('');
  const [extDatabase, setExtDatabase] = useState('');
  const [extSchema, setExtSchema] = useState('');
  const [extTable, setExtTable] = useState('');
  const [loadFrequency, setLoadFrequency] = useState('Ежедневный');
  const [loadTime, setLoadTime] = useState('');
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
  const [tagCircleOnly, setTagCircleOnly] = useState(true);
  const [tagHintVisible, setTagHintVisible] = useState(true);
  const tagInputRef = useRef(null);
  const tagDropdownRef = useRef(null);

  // Dropdown states
  const [owner, setOwner] = useState(existingDoc?.circles?.replace(' (Якорный Круг)', '').replace('Круг ', '') || '');
  const [database, setDatabase] = useState(existingDoc?.database || '');
  const [schema, setSchema] = useState(existingDoc?.schema || '');
  const [table, setTable] = useState(existingDoc?.name || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingFields, setIsGeneratingFields] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationDone, setGenerationDone] = useState(false);
  const [llmDismissed, setLlmDismissed] = useState(false);

  // LLM suggestion state
  const [llmDescSuggestion, setLlmDescSuggestion] = useState(null);
  const [llmFieldSuggestions, setLlmFieldSuggestions] = useState({});

  // Популярные теги команды (зависят от выбранного владельца)
  const popularTagsByOwner = {
    'Data Engineering': ['ETL', 'DWH', 'Pipeline', 'Airflow', 'Data Quality', 'Spark'],
    'Data Analytics': ['BI', 'Дашборд', 'Метрики', 'A/B тест', 'Когорты', 'Отчётность'],
    'Data Science': ['ML', 'Модель', 'Фичи', 'Прогноз', 'NLP', 'Рекомендации'],
    'Platform': ['Инфраструктура', 'Kubernetes', 'CI/CD', 'Мониторинг', 'SLA'],
    'Backend': ['API', 'Микросервис', 'БД', 'Кэш', 'Очереди', 'REST'],
    'Frontend': ['UI', 'Компонент', 'Дизайн-система', 'SPA', 'Роутинг'],
    'DevOps': ['Deploy', 'Docker', 'Terraform', 'Логи', 'Алерты'],
    'Security': ['Безопасность', 'Аутентификация', 'Шифрование', 'Аудит'],
    'Product': ['Продукт', 'Фича', 'Roadmap', 'OKR', 'Гипотеза'],
    'QA': ['Тестирование', 'Автотест', 'Регресс', 'Баг', 'Покрытие'],
  };
  const defaultPopularTags = ['ORACLE', 'DOCUMENT', 'ЭДО', 'Документооборот', 'ЭПД', 'DWH', 'ETL', 'Метрики'];
  const ownerTags = owner ? (popularTagsByOwner[owner] || defaultPopularTags) : defaultPopularTags;
  const allTagsPool = [...new Set([...defaultPopularTags, ...Object.values(popularTagsByOwner).flat()])];

  // Пул тегов: тоггл ON → теги выбранного круга, OFF → все теги
  const poolTags = (tagCircleOnly && owner) ? ownerTags : allTagsPool;

  // Фильтрация тегов в дропдауне
  const filteredPopularTags = tagInput.trim()
    ? poolTags.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t))
    : poolTags.filter(t => !tags.includes(t));

  const showCreateOption = tagInput.trim() && !poolTags.some(t => t.toLowerCase() === tagInput.trim().toLowerCase()) && !tags.includes(tagInput.trim());

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

  // External source dependent dropdown handlers
  const handleExtSourceChange = (val) => {
    setExtSource(val);
    setExtDatabase('');
    setExtSchema('');
    setExtTable('');
  };

  const handleExtDatabaseChange = (val) => {
    setExtDatabase(val);
    setExtSchema('');
    setExtTable('');
  };

  const handleExtSchemaChange = (val) => {
    setExtSchema(val);
    setExtTable('');
  };

  const handleFieldChange = (index, key, value) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const addField = () => {
    setFields(prev => [...prev, { name: '', description: '' }]);
  };

  // Можно ли генерировать (нужно выбрать таблицу)
  const canGenerate = storageType === 'external' ? Boolean(extTable) : Boolean(table);

  // Генерация описания ИИ — текст появляется целиком как LLM-предложение
  const generateAIDescription = () => {
    if (isGenerating || !canGenerate) return;
    setIsGenerating(true);
    const isExt = storageType === 'external';
    const tableName = isExt ? (extTable || 'таблица') : (table || 'таблица');
    const dbName = isExt ? (extDatabase || 'база данных') : (database || 'база данных');
    const schemaName = isExt ? (extSchema || 'схема') : (schema || 'схема');
    const fieldNames = fields.filter(f => f.name).map(f => f.name).join(', ');

    const descriptions = [
      `Таблица ${tableName} в ${dbName}.${schemaName} содержит данные, необходимые для аналитической отчётности и формирования ключевых бизнес-метрик. Поля: ${fieldNames || 'не указаны'}. Данные обновляются ежедневно в рамках ETL-процесса и используются смежными командами для построения дашбордов и ad-hoc анализа.`,
      `Данная таблица (${tableName}) является частью схемы ${schemaName} в ${dbName} и служит источником данных для расчёта операционных показателей. Содержит информацию, структурированную по полям: ${fieldNames || 'не указаны'}. Рекомендуется для использования в витринах данных и BI-отчётах.`,
      `${tableName} — таблица хранилища ${dbName}, схема ${schemaName}. Предназначена для хранения и агрегации бизнес-данных. Основные поля: ${fieldNames || 'не указаны'}. Используется в процессах Data Engineering для обеспечения консистентности данных между слоями хранилища.`,
    ];

    const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
    // Имитация задержки LLM — текст появляется целиком как предложение
    setTimeout(() => {
      setLlmDescSuggestion(randomDesc);
      setIsGenerating(false);
    }, 3000);
  };

  // Принять предложение описания таблицы
  const acceptDescSuggestion = () => {
    if (llmDescSuggestion) {
      setDescription(llmDescSuggestion);
      setLlmDescSuggestion(null);
    }
  };

  // Генерация описаний полей ИИ — текст появляется целиком как LLM-предложение
  const generateFieldDescriptions = () => {
    if (isGeneratingFields || !canGenerate) return;
    setIsGeneratingFields(true);
    const fieldDescs = [
      'Уникальный идентификатор записи в таблице, автоинкрементный первичный ключ',
      'Дата и время создания записи в формате UTC, заполняется автоматически при INSERT',
      'Код статуса обработки записи в рамках ETL-пайплайна',
      'Ссылка на внешний идентификатор в системе-источнике',
    ];
    // Все предложения появляются одновременно после задержки
    setTimeout(() => {
      const suggestions = {};
      fields.forEach((field, idx) => {
        if (!field.description || field.description === 'PK') {
          suggestions[idx] = fieldDescs[idx] || `Описание поля ${field.name}`;
        }
      });
      setLlmFieldSuggestions(suggestions);
      setIsGeneratingFields(false);
    }, 4000);
  };

  // Принять предложение описания конкретного поля
  const acceptFieldSuggestion = (idx) => {
    if (llmFieldSuggestions[idx]) {
      setFields(prev => {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], description: llmFieldSuggestions[idx] };
        return updated;
      });
      setLlmFieldSuggestions(prev => {
        const updated = { ...prev };
        delete updated[idx];
        return updated;
      });
    }
  };

  // Отклонить предложение описания конкретного поля
  const dismissFieldSuggestion = (idx) => {
    setLlmFieldSuggestions(prev => {
      const updated = { ...prev };
      delete updated[idx];
      return updated;
    });
  };

  // Когда generateAll запущен и обе генерации завершились — показываем галочку
  useEffect(() => {
    if (isGeneratingAll && !isGenerating && !isGeneratingFields) {
      setIsGeneratingAll(false);
      setGenerationDone(true);
    }
  }, [isGeneratingAll, isGenerating, isGeneratingFields]);

  // Генерация всего через LLM (описание + поля)
  const generateAll = () => {
    if (isGeneratingAll || !canGenerate) return;
    setIsGeneratingAll(true);
    setGenerationDone(false);
    generateAIDescription();
    setTimeout(() => {
      generateFieldDescriptions();
    }, 500);
  };

  // Показываем LLM-панель когда можно генерировать и пользователь не закрыл её
  const showLLMPanel = canGenerate && !llmDismissed;

  return (
    <div className="flex-1 flex bg-[#f9f9f9] overflow-hidden h-full min-h-0">
      {/* Main scrollable area */}
      <div className="flex-1 flex flex-col pt-8 px-8 overflow-y-auto min-h-0">
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

                  {/* Conditional Dropdowns: DWH vs External */}
                  {storageType === 'DWH' ? (
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
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Dropdown
                        label="Источник"
                        placeholder="Выберите источник"
                        options={extSourceOptions}
                        value={extSource}
                        onChange={handleExtSourceChange}
                      />

                      <Dropdown
                        label="База данных"
                        placeholder="Выберите базу данных"
                        options={extSource ? (extDatabaseOptions[extSource] || []) : []}
                        value={extDatabase}
                        onChange={handleExtDatabaseChange}
                        disabled={!extSource}
                      />

                      <Dropdown
                        label="Схема"
                        placeholder="Выберите схему"
                        options={extDatabase ? (extSchemaOptions[extDatabase] || []) : []}
                        value={extSchema}
                        onChange={handleExtSchemaChange}
                        disabled={!extDatabase}
                      />

                      <Dropdown
                        label="Таблица"
                        placeholder="Выберите таблицу"
                        options={extSchema ? (extTableOptions[extSchema] || []) : []}
                        value={extTable}
                        onChange={setExtTable}
                        disabled={!extSchema}
                      />

                      {/* Частота загрузки — кастомный дропдаун с описаниями */}
                      <FrequencyDropdown
                        value={loadFrequency}
                        onChange={setLoadFrequency}
                        options={loadFrequencyOptions}
                      />

                      {/* Время начала загрузки */}
                      <div className="relative">
                        <div
                          className="dropdown-trigger flex items-center rounded-xl px-5 py-3 border-none text-left w-full bg-[rgba(25,25,25,0.05)]"
                        >
                          <div className="flex-1 flex flex-col gap-1">
                            <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">Время начала загрузки</span>
                            <input
                              type="time"
                              value={loadTime}
                              onChange={(e) => setLoadTime(e.target.value)}
                              placeholder="--:--"
                              className="bg-transparent border-none outline-none text-base leading-5 tracking-[0.16px] p-0 m-0 text-[#191919] placeholder:text-[#949494] w-full"
                              style={{ fontFamily: 'inherit' }}
                            />
                          </div>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-50">
                            <circle cx="10" cy="10" r="8" stroke="#191919" strokeWidth="1.5"/>
                            <path d="M10 6V10L13 12" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Description Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center py-2">
                <span className="text-lg font-medium text-[#191919] leading-[22px] flex-1">Описание таблицы</span>
                <button
                  onClick={generateAIDescription}
                  disabled={isGenerating || !canGenerate}
                  className={`ai-generate-label ${isGenerating ? 'generating' : ''} ${(!canGenerate || isGenerating) ? 'disabled' : ''}`}
                >
                  <span>{isGenerating ? 'Генерация...' : 'Сгенерировать общее описание'}</span>
                </button>
              </div>
              <div className="form-field bg-[rgba(25,25,25,0.05)] rounded-xl overflow-hidden">
                <div className="flex flex-col px-5 pt-3 min-h-[108px]">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Введите описание документа..."
                    className="w-full bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 resize-none min-h-[80px] placeholder:text-[#949494]"
                  />
                  {/* LLM Suggestion для описания таблицы */}
                  {llmDescSuggestion && (
                    <div className="llm-suggestion">
                      <button className="llm-dismiss-btn" onClick={() => setLlmDescSuggestion(null)} title="Закрыть">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#949494" strokeWidth="2" strokeLinecap="round"/></svg>
                      </button>
                      <p className="llm-suggestion-text"><span className="llm-suggestion-prefix">LLM:</span> {llmDescSuggestion}</p>
                      <button className="llm-accept-btn" onClick={acceptDescSuggestion}>Принять</button>
                    </div>
                  )}
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
                      disabled={isGenerating || !canGenerate}
                      className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border-none cursor-pointer transition-colors ${
                        !canGenerate
                          ? 'opacity-40 cursor-not-allowed'
                          : isGenerating
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
            <div className="flex flex-col gap-3" ref={tagDropdownRef}>
              {/* Contextual Notification — подсказка (T-DS) */}
              {tagHintVisible && (
                <div
                  className="flex items-start w-full box-border"
                  style={{ padding: '0 var(--spacing-5x)', border: '1px solid var(--translucent-primitives-neutral-2)', borderRadius: 'var(--rounding-3x)' }}
                >
                  <div className="flex items-center shrink-0" style={{ padding: 'var(--spacing-3x) var(--spacing-3x) var(--spacing-3x) 0', color: 'var(--primitive-brand)' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9.75 1.5L3.07 9.47a.75.75 0 00.58 1.22H8.25l-.75 5.44a.375.375 0 00.65.31L14.93 8.53a.75.75 0 00-.58-1.22H9.75l.75-5.44a.375.375 0 00-.65-.31L9.75 1.5Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0" style={{ padding: 'var(--spacing-3x) 0', gap: '5px' }}>
                    <p className="m-0 w-full overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: 'var(--font-family-tt-norms-tochka-extended)', fontWeight: 500, fontSize: '14px', lineHeight: '18px', letterSpacing: '0.01em', color: 'var(--primitive-primary)' }}>
                      Как использовать теги?
                    </p>
                    <p className="m-0 w-full" style={{ fontFamily: 'var(--font-family-tt-norms-tochka-extended)', fontWeight: 400, fontSize: '14px', lineHeight: '18px', letterSpacing: '0.01em', color: 'var(--primitive-primary)', overflowWrap: 'anywhere' }}>
                      Это своего рода группировка, вы можете создать группы для всей команды или личные, по тегам так же есть поиск в общем списке или и самого документа.
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center shrink-0 p-0 border-0 bg-transparent cursor-pointer"
                    style={{ color: 'var(--primitive-neutral-4)' }}
                    onClick={() => setTagHintVisible(false)}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="relative">
                <div
                  className="flex flex-col w-full cursor-text transition-all"
                  style={{
                    padding: '0 var(--spacing-5x)',
                    borderRadius: 'var(--rounding-3x)',
                    background: 'var(--container-transparent-1)',
                    boxShadow: tagDropdownOpen ? 'inset 0 0 0 2px var(--primitive-brand)' : 'none',
                  }}
                  onClick={() => { setTagDropdownOpen(true); tagInputRef.current?.focus(); }}
                >
                  <div className="flex flex-col w-full" style={{ padding: 'var(--spacing-3x) 0', gap: 'var(--spacing-2x)' }}>
                    {/* Label (T-DS .input__title) */}
                    <div className="flex items-center" style={{ gap: 'var(--spacing-3x)', minHeight: '18px' }}>
                      <p className="m-0 whitespace-nowrap" style={{ fontFamily: 'var(--font-family-tt-norms-tochka-extended)', fontWeight: 500, fontSize: '14px', lineHeight: '18px', letterSpacing: '0.01em', color: 'var(--primitive-primary)' }}>
                        Теги
                      </p>
                    </div>
                    {/* Tags + Input row */}
                    <div className="flex items-center flex-wrap" style={{ gap: 'var(--spacing-2x)' }}>
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center justify-center whitespace-nowrap"
                          style={{
                            minHeight: '32px',
                            padding: 'var(--spacing-1-5x) var(--spacing-2-5x)',
                            borderRadius: 'var(--rounding-2-5x)',
                            background: 'var(--container-transparent-1)',
                            color: 'var(--primitive-brand)',
                            gap: 'var(--spacing-2x)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-family-tt-norms-tochka-extended)',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '18px',
                            letterSpacing: '0.01em',
                          }}
                        >
                          {tag}
                          <span
                            className="relative inline-flex items-center justify-center shrink-0"
                            style={{ width: '12px', height: '12px', color: 'inherit', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </span>
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
                        className="tags-input-field flex-1 min-w-[120px] p-0 m-0 border-0 outline-0 bg-transparent"
                        style={{
                          fontFamily: 'var(--font-family-tt-norms-tochka-extended)',
                          fontWeight: 400,
                          fontSize: '16px',
                          lineHeight: '20px',
                          letterSpacing: '0.01em',
                          color: 'var(--primitive-primary)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Дропдаун популярных тегов (T-DS Popup) */}
                {tagDropdownOpen && (filteredPopularTags.length > 0 || showCreateOption) && (
                  <div
                    className="absolute top-full left-0 right-0 z-50 overflow-hidden"
                    style={{
                      marginTop: '4px',
                      background: 'var(--popup-primary)',
                      borderRadius: 'var(--rounding-3x)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      padding: 'var(--spacing-1-5x) 0',
                    }}
                  >
                    {/* Тоггл «Используемые в выбранном круге» — только когда круг выбран */}
                    {owner && (
                    <div
                      className="flex items-center justify-between"
                      style={{ padding: 'var(--spacing-2-5x) var(--spacing-5x)', borderBottom: '1px solid var(--translucent-primitives-neutral-2)' }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <span style={{ fontFamily: 'var(--font-family-tt-norms-tochka-extended)', fontWeight: 500, fontSize: '13px', lineHeight: '17px', letterSpacing: '0.01em', color: 'var(--primitive-secondary)' }}>
                        Используемые в выбранном круге
                      </span>
                      <button
                        className="relative shrink-0 border-none p-0 transition-colors duration-200"
                        style={{
                          width: '56px',
                          height: '32px',
                          borderRadius: 'var(--rounding-4x)',
                          background: tagCircleOnly ? 'var(--bg-brand)' : 'var(--container-transparent-2)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setTagCircleOnly(prev => !prev)}
                      >
                        <div
                          className="absolute rounded-full bg-white transition-[left] duration-200"
                          style={{ top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', left: tagCircleOnly ? 'auto' : '4px', right: tagCircleOnly ? '4px' : 'auto' }}
                        />
                      </button>
                    </div>
                    )}
                    <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
                      {filteredPopularTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => addTag(tag)}
                          className="flex items-center w-full border-none bg-transparent cursor-pointer transition-colors text-left hover:bg-[#1919191a]"
                          style={{ padding: 'var(--spacing-2-5x) var(--spacing-5x)' }}
                        >
                          <span style={{ flex: 1, fontFamily: 'var(--font-family-tt-norms-tochka-extended)', fontWeight: 500, fontSize: '16px', lineHeight: '20px', letterSpacing: '0.01em', color: 'var(--primitive-primary)' }}>
                            {tag}
                          </span>
                        </button>
                      ))}
                      {showCreateOption && (
                        <button
                          onClick={() => addTag(tagInput)}
                          className="flex items-center w-full border-none bg-transparent cursor-pointer transition-colors text-left hover:bg-[rgba(131,93,225,0.04)]"
                          style={{ gap: 'var(--spacing-2x)', padding: 'var(--spacing-2-5x) var(--spacing-5x)', borderTop: '1px solid var(--translucent-primitives-neutral-2)' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="var(--primitive-brand)" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          <span style={{ fontFamily: 'var(--font-family-tt-norms-tochka-extended)', fontWeight: 500, fontSize: '16px', lineHeight: '20px', letterSpacing: '0.01em', color: 'var(--primitive-brand)' }}>
                            Создать «{tagInput.trim()}»
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fields Table — только если выбрана таблица */}
            {table && (
            <div className="flex flex-col" style={{ gap: 6 }}>
              <div className="flex items-center" style={{ height: 78, padding: '8px 0' }}>
                <span className="text-lg font-medium text-[#191919] leading-[22px] flex-1">Описание полей</span>
                <button
                  onClick={generateFieldDescriptions}
                  disabled={isGeneratingFields || !canGenerate}
                  className={`ai-generate-label ${isGeneratingFields ? 'generating' : ''} ${(!canGenerate || isGeneratingFields) ? 'disabled' : ''}`}
                >
                  <span>{isGeneratingFields ? 'Генерация...' : 'Сгенерировать описание полей'}</span>
                </button>
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
                    <div className="bg-[rgba(25,25,25,0.05)] flex flex-col flex-1 min-w-0" style={{ padding: '10px 20px', gap: 4 }}>
                      <div className="flex items-center" style={{ gap: 10 }}>
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
                        {!field.description && !llmFieldSuggestions[i] && (
                          <img src={`${import.meta.env.BASE_URL}assets/icon-warning-circle.svg`} alt="Нет описания" style={{ width: 18, height: 18, flexShrink: 0 }} />
                        )}
                      </div>
                      {/* LLM Suggestion для поля */}
                      {llmFieldSuggestions[i] && (
                        <div className="llm-field-suggestion">
                          <button className="llm-dismiss-btn" onClick={() => dismissFieldSuggestion(i)} title="Закрыть">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#949494" strokeWidth="2" strokeLinecap="round"/></svg>
                          </button>
                          <span className="llm-suggestion-text"><span className="llm-suggestion-prefix">LLM:</span> {llmFieldSuggestions[i]}</span>
                          <button className="llm-accept-btn" onClick={() => acceptFieldSuggestion(i)}>Принять</button>
                        </div>
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
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center px-5 py-3">
            <button
              onClick={() => {
                const isExternal = storageType === 'external';
                const tableName = isExternal ? (extTable || 'new_table') : (table || 'new_table');
                const usedDatabase = isExternal ? extDatabase : database;
                const usedSchema = isExternal ? extSchema : schema;
                const fullPath = usedDatabase && usedSchema
                  ? `${usedDatabase.toUpperCase()} > ${usedSchema} > ${tableName}`
                  : tableName;
                const parsedFields = fields.filter(f => f.name).map(f => ({
                  name: f.name,
                  type: f.type || 'varchar',
                  description: f.description || '',
                }));
                const parsedTags = tags.length > 0 ? tags : [];

                // External source metadata
                const externalMeta = isExternal ? {
                  storageType: 'external',
                  extSource,
                  extDatabase,
                  extSchema,
                  extTable,
                  loadFrequency,
                  loadTime,
                } : {
                  storageType: 'DWH',
                };

                if (isEditMode && existingDoc) {
                  updateDocument(id, {
                    name: tableName,
                    fullPath,
                    description: description.slice(0, 80) || existingDoc.description,
                    descriptionFull: description || existingDoc.descriptionFull,
                    database: usedDatabase || existingDoc.database,
                    dbColor: isExternal ? '#2196F3' : (dbColors[database] || existingDoc.dbColor),
                    schema: usedSchema || existingDoc.schema,
                    circles: owner ? `${owner} (Якорный Круг)` : existingDoc.circles,
                    tags: parsedTags,
                    fields: parsedFields,
                    missingFields: missingFields.filter(f => f.name),
                    updatedAt: 'только что',
                    ...externalMeta,
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
                    database: usedDatabase || 'ClickHouse',
                    dbColor: isExternal ? '#2196F3' : (dbColors[database] || '#facc15'),
                    schema: usedSchema || 'STAGE',
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
                    ...externalMeta,
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

      {/* Правая панель LLM — плавно появляется после выбора таблицы, сдвигает контент */}
      <div className={`llm-panel ${showLLMPanel ? 'visible' : ''}`}>
        <div className="llm-panel-content">
          <button className="llm-panel-close" onClick={() => setLlmDismissed(true)} title="Закрыть">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <div className="llm-panel-text">
            <h3 className="llm-panel-title">Генерация описания LLM</h3>
            <p className="llm-panel-description">
              Вы можете сгенерировать все описание документа с помощью модели LLM. Это займет несколько минут, после завершения вы сможете принять или поправить предложенный текст.
            </p>
          </div>
          {isGeneratingAll ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <div className="llm-generating-row">
                <div className="llm-spinner">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12" stroke="#835de1" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="llm-generating-text">Идет генерация</span>
              </div>
              <div className="llm-generating-hint">Это займет несколько минут</div>
            </div>
          ) : (
            <button className="llm-panel-btn" onClick={generateAll}>
              {generationDone ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19.2655 4.32106C19.6401 3.91566 20.2729 3.89092 20.6786 4.26539C21.0833 4.64012 21.1085 5.27303 20.7342 5.67848L8.73423 18.6785C8.34912 19.095 7.69429 19.1075 7.29282 18.7068L3.29282 14.7068C2.90235 14.3163 2.90244 13.6833 3.29282 13.2927C3.68334 12.9022 4.31636 12.9022 4.70688 13.2927L7.97055 16.5564L19.2655 4.32106Z" fill="#3F9180"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3.5 20.5L14 10M10 14L20.5 3.5" stroke="#835de1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 8.5L19.5 6.5L21.5 5.5L19.5 4.5L18.5 2.5L17.5 4.5L15.5 5.5L17.5 6.5L18.5 8.5Z" fill="#835de1"/>
                  <path d="M8.5 6.5L9.25 4.75L11 4L9.25 3.25L8.5 1.5L7.75 3.25L6 4L7.75 4.75L8.5 6.5Z" fill="#835de1"/>
                  <path d="M4.5 11.5L5.25 9.75L7 9L5.25 8.25L4.5 6.5L3.75 8.25L2 9L3.75 9.75L4.5 11.5Z" fill="#835de1"/>
                </svg>
              )}
              <span>{generationDone ? 'Запустить снова' : 'Запустить'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
