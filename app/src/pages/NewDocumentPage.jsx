import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../data/DocumentsContext';

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
          src="/assets/icon-chevron-down.svg"
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
  const { addDocument } = useDocuments();
  const [storageEnabled, setStorageEnabled] = useState(true);
  const [storageType, setStorageType] = useState('DWH');
  const [fields, setFields] = useState([{ name: '', description: '' }]);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // Dropdown states
  const [owner, setOwner] = useState('');
  const [database, setDatabase] = useState('');
  const [schema, setSchema] = useState('');
  const [table, setTable] = useState('');

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
              <img src="/assets/icon-arrow-left.svg" alt="Back" className="w-6 h-6" />
            </button>
            <h1 className="text-[30px] font-semibold text-[#191919] leading-9 tracking-[-0.3px] m-0 flex-1">
              Новый документ
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="w-[640px] flex flex-col gap-8 pb-8">
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
                  </div>
                  <span className="text-xs text-[rgba(25,25,25,0.45)] tracking-[0.12px]">0 / 5 000</span>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="flex flex-col gap-0">
              <div className="flex items-center py-2">
                <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Теги</span>
              </div>
              <div className="form-field bg-[rgba(25,25,25,0.05)] rounded-xl px-5 py-3">
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Начните вводить (через запятую)"
                  className="w-full bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 placeholder:text-[#949494]"
                />
              </div>
            </div>

            {/* Fields Table */}
            <div className="flex flex-col gap-0">
              <div className="flex items-center py-3">
                <span className="text-lg font-medium text-[#191919] leading-[22px] flex-1">Описание полей</span>
              </div>

              {/* Table */}
              <div className="flex flex-col gap-0.5 rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="flex gap-0.5">
                  <div className="w-[280px] bg-[rgba(25,25,25,0.05)] px-5 py-2 flex items-center gap-3">
                    <span className="text-xs font-medium text-[#191919] leading-[15px] tracking-[0.12px]">Название</span>
                  </div>
                  <div className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-2">
                    <span className="text-xs font-medium text-[#191919] leading-[15px] tracking-[0.12px]">Описание</span>
                  </div>
                </div>

                {/* Table Rows */}
                {fields.map((field, i) => (
                  <div key={i} className="flex gap-0.5">
                    <div className="w-[280px] bg-[rgba(25,25,25,0.05)] px-5 py-2.5">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => handleFieldChange(i, 'name', e.target.value)}
                        placeholder="Имя поля"
                        className="form-input w-full bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 placeholder:text-[#949494]"
                      />
                    </div>
                    <div className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-2.5">
                      <input
                        type="text"
                        value={field.description}
                        onChange={(e) => handleFieldChange(i, 'description', e.target.value)}
                        placeholder="Описание поля"
                        className="form-input w-full bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 placeholder:text-[#949494]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Field */}
              <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 pb-4 mt-1">
                <div className="border-t border-[rgba(25,25,25,0.05)] pt-3.5">
                  <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={addField}>
                    <img src="/assets/icon-plus-circle.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-medium text-[#835de1] leading-5 tracking-[0.16px]">Добавить поле</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center px-5 py-3">
            <button
              onClick={() => {
                const newId = String(Date.now());
                const tableName = table || 'new_table';
                const fullPath = database && schema
                  ? `${database.toUpperCase()} > ${schema} > ${tableName}`
                  : tableName;
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
                  tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                  fields: fields.filter(f => f.name).map(f => ({
                    name: f.name,
                    type: 'varchar',
                    description: f.description || '',
                  })),
                  missingFields: [],
                  experts: [],
                };
                addDocument(newDoc);
                navigate(`/document/${newId}`);
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
