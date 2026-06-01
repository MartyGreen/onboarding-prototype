import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../components/SuccessAlert';
import { useBiApiMethods } from '../data/BiApiMethodsContext';

export default function NewBiApiMethodPage() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { addMethod } = useBiApiMethods();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [detailedInfo, setDetailedInfo] = useState('');
  const [sql, setSql] = useState('');
  const [techAccount] = useState('TEST_TEAM');
  const [needsPagination, setNeedsPagination] = useState('Нет');
  const [recordsPerRequest, setRecordsPerRequest] = useState('10 000');
  const [fields, setFields] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [sqlDraft, setSqlDraft] = useState('');
  const [sqlError, setSqlError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Парсинг SQL: извлечение полей из SELECT и фильтров из WHERE (:param)
  const parseSqlFieldsAndFilters = (sqlText) => {
    const text = sqlText.trim();
    
    const selectFromMatch = text.match(/select\s+([\s\S]*?)\s+from\s/i);
    if (selectFromMatch) {
      const fieldsPart = selectFromMatch[1];
      const parsedFields = fieldsPart
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0)
        .map(f => {
          const parts = f.split('.');
          const fieldName = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).trim().toUpperCase();
          const existing = fields.find(ef => ef.name === fieldName);
          return existing || { name: fieldName, type: 'VARCHAR2', length: '', description: '', enabled: true };
        });
      setFields(parsedFields);
    }
    
    const paramMatches = [...text.matchAll(/:(\w+)/g)];
    if (paramMatches.length > 0) {
      const uniqueParams = [...new Set(paramMatches.map(m => m[1]))];
      const parsedFilters = uniqueParams.map(paramName => {
        const existing = filters.find(ef => ef.name === paramName);
        return existing || { name: paramName, type: 'VARCHAR2', description: '', enabled: true };
      });
      setFilters(parsedFilters);
    } else {
      setFilters([]);
    }
  };

  const handleCreate = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Укажите название метода';
    if (!description.trim()) errors.description = 'Укажите краткое описание метода';
    if (!detailedInfo.trim()) errors.detailedInfo = 'Добавьте информацию о методе';
    if (!techAccount.trim()) errors.techAccount = 'Укажите учётку';
    if (!sql.trim()) errors.sql = 'Напишите запрос';
    fields.forEach((f, i) => { if (!f.description || !f.description.trim()) errors[`field_${i}`] = 'Заполните описание поля'; });
    filters.forEach((f, i) => { if (f.enabled !== false && (!f.description || !f.description.trim())) errors[`filter_${i}`] = 'Заполните описание фильтра'; });
    if (Object.keys(errors).length > 0) { setValidationErrors(errors); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setValidationErrors({});
    const newId = addMethod({
      name,
      description,
      detailedInfo,
      sql,
      techAccount,
      needsPagination,
      recordsPerRequest,
      fields,
      filters,
    });
    showAlert('Метод создан');
    navigate(`/api/${newId}`);
  };

  const base = import.meta.env.BASE_URL;

  // Компонент Filter-блока (используется и для полей, и для фильтров)
  const FilterBlock = ({ item, index, items, setItems, showLength, errorKey, showToggle = true }) => {
    const isDisabled = item.enabled === false;
    const fieldError = validationErrors[errorKey];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0' }}>
            <div style={{
              flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2,
              fontSize: 16, lineHeight: '20px', letterSpacing: '0.16px',
            }}>
              <p style={{
                fontWeight: 500,
                color: isDisabled ? '#949494' : '#191919',
                margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {item.name}
              </p>
              <p style={{
                fontWeight: 400,
                color: isDisabled ? '#949494' : '#676767',
                margin: 0, whiteSpace: 'pre-wrap'
              }}>
                {item.type || 'string'}{showLength && item.length ? `   (${item.length})` : ''}
              </p>
            </div>
          </div>
          {showToggle && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: 20, flexShrink: 0, gap: 12 }}>
              <button
                onClick={() => {
                  const updated = [...items];
                  updated[index] = { ...updated[index], enabled: !item.enabled };
                  setItems(updated);
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: 16, fontWeight: 400, color: '#676767', lineHeight: '20px',
                  letterSpacing: '0.16px', textAlign: 'right', whiteSpace: 'nowrap', fontFamily: 'inherit'
                }}
              >
                {isDisabled ? 'Учитывать' : 'Не учитывать'}
              </button>
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(25,25,25,0.05)',
          borderRadius: 12,
          height: 'auto',
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          overflow: 'hidden',
          opacity: isDisabled ? 0.25 : 1,
          pointerEvents: isDisabled ? 'none' : 'auto',
        }}>
          <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', height: 20, gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px', whiteSpace: 'nowrap' }}>
                  Описание
                </span>
                {!isDisabled && (
                  <span style={{ fontSize: 18, fontWeight: 500, color: '#d84d4d', lineHeight: '22px', position: 'relative', top: -4, width: 8 }}>*</span>
                )}
              </div>
              {isDisabled ? (
                <p style={{ fontSize: 16, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.description || 'Заполните описание'}
                </p>
              ) : (
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[index] = { ...updated[index], description: e.target.value };
                    setItems(updated);
                    if (validationErrors[errorKey]) { const v = {...validationErrors}; delete v[errorKey]; setValidationErrors(v); }
                  }}
                  placeholder="Заполните описание"
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 16, color: item.description ? '#191919' : '#949494',
                    lineHeight: '20px', letterSpacing: '0.16px',
                    padding: 0, margin: 0, width: '100%', fontFamily: 'inherit',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                />
              )}
            </div>
          </div>
          {!isDisabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: 2 }}>
                <div style={{ flex: 1, height: fieldError ? 2 : 0.5, background: fieldError ? '#d84d4d' : 'rgba(25,25,25,0.2)' }} />
              </div>
              <span style={{ fontSize: 14, color: fieldError ? '#d84d4d' : '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>
                {fieldError || 'Опишите назначение поля'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f9f9f9', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', paddingTop: 24, paddingBottom: 24, paddingLeft: 32, paddingRight: 32 }}>

        {/* Title */}
        <div style={{ width: 720, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/api')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 8, background: 'rgba(25,25,25,0.05)', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <img src={`${base}assets/icon-arrow-left.svg`} alt="Назад" style={{ width: 20, height: 20 }} />
          </button>
          <h1 style={{ fontSize: 30, fontWeight: 600, color: '#191919', lineHeight: '36px', letterSpacing: '-0.3px', margin: 0 }}>
            Создание метода
          </h1>
        </div>

        {/* Content */}
        <div style={{ width: 720, paddingBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* === Card 1: Описание документа === */}
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 16px rgba(0,0,0,0.05)', padding: '20px 40px 40px 40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '22px' }}>
                    Описание документа
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Input: Название метода */}
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20, gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                        Название метода
                      </span>
                      <span style={{ fontSize: 18, fontWeight: 500, color: '#d84d4d', lineHeight: '22px', position: 'relative', top: -4, width: 8 }}>*</span>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); if (validationErrors.name) { const v = {...validationErrors}; delete v.name; setValidationErrors(v); } }}
                      placeholder="new_method"
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: name ? '#191919' : '#949494', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: 2 }}>
                      <div style={{ flex: 1, height: validationErrors.name ? 2 : 0.5, background: validationErrors.name ? '#d84d4d' : 'rgba(25,25,25,0.2)' }} />
                    </div>
                    <span style={{ fontSize: 14, color: validationErrors.name ? '#d84d4d' : '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>
                      {validationErrors.name || 'Латинские буквы и знак подчеркивания, больше 6 символов'}
                    </span>
                  </div>
                </div>

                {/* Input: Краткое описание */}
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20, gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                        Краткое описание
                      </span>
                      <span style={{ fontSize: 18, fontWeight: 500, color: '#d84d4d', lineHeight: '22px', position: 'relative', top: -4, width: 8 }}>*</span>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (validationErrors.description) { const v = {...validationErrors}; delete v.description; setValidationErrors(v); }
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                      placeholder="Пример краткого описания"
                      rows={1}
                      style={{ background: 'transparent', border: 'none', outline: 'none', resize: 'none', overflow: 'hidden', fontSize: 16, color: description ? '#191919' : '#949494', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: 2 }}>
                      <div style={{ flex: 1, height: validationErrors.description ? 2 : 0.5, background: validationErrors.description ? '#d84d4d' : 'rgba(25,25,25,0.2)' }} />
                    </div>
                    <span style={{ fontSize: 14, color: validationErrors.description ? '#d84d4d' : '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>
                      {validationErrors.description || 'Расскажите о методе кратко'}
                    </span>
                  </div>
                </div>

                {/* Input: Подробная информация */}
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                        Подробная информация о методу
                      </span>
                    </div>
                    <textarea
                      value={detailedInfo}
                      onChange={(e) => {
                        setDetailedInfo(e.target.value);
                        if (validationErrors.detailedInfo) { const v = {...validationErrors}; delete v.detailedInfo; setValidationErrors(v); }
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                      placeholder="Какие нюансы есть у метода"
                      rows={1}
                      style={{ background: 'transparent', border: 'none', outline: 'none', resize: 'none', overflow: 'hidden', fontSize: 16, color: detailedInfo ? '#191919' : '#949494', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: 2 }}>
                      <div style={{ flex: 1, height: validationErrors.detailedInfo ? 2 : 0.5, background: validationErrors.detailedInfo ? '#d84d4d' : 'rgba(25,25,25,0.2)' }} />
                    </div>
                    <span style={{ fontSize: 14, color: validationErrors.detailedInfo ? '#d84d4d' : '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>
                      {validationErrors.detailedInfo || 'Опишите нюансы работы метода'}
                    </span>
                  </div>
                </div>

                {/* Dropdown: Командная тех. учетка */}
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', height: 20, gap: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                          Командная тех. учетка
                        </span>
                        <span style={{ fontSize: 18, fontWeight: 500, color: '#d84d4d', lineHeight: '22px', position: 'relative', top: -4, width: 8 }}>*</span>
                      </div>
                      <span style={{ fontSize: 16, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {techAccount}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', alignSelf: 'stretch', flexShrink: 0, paddingLeft: 16 }}>
                      <img src={`${base}assets/icon-chevron-down.svg`} alt="" style={{ width: 12, height: 12 }} />
                    </div>
                  </div>
                </div>

                {/* Свитчер: Нужна пагинация? */}
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                    <span style={{ fontSize: 16, fontWeight: 400, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px' }}>
                      Нужна пагинация?
                    </span>
                    <button
                      onClick={() => setNeedsPagination(needsPagination === 'Да' ? 'Нет' : 'Да')}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', padding: 2,
                        background: needsPagination === 'Да' ? '#835de1' : 'rgba(25,25,25,0.15)',
                        display: 'flex', alignItems: 'center', flexShrink: 0,
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        transform: needsPagination === 'Да' ? 'translateX(20px)' : 'translateX(0)',
                        transition: 'transform 0.2s',
                      }} />
                    </button>
                  </div>
                </div>

                {/* M-ячейка: Количество записей за один запрос */}
                {needsPagination === 'Да' && (
                  <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px', height: 44, display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: 16, fontWeight: 400, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px' }}>
                        Количество записей за запрос
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <button
                          onClick={() => {
                            const num = parseInt(recordsPerRequest.replace(/\s/g, ''), 10) || 0;
                            const step = num <= 1000 ? 100 : 1000;
                            const next = Math.max(100, num - step);
                            setRecordsPerRequest(next.toLocaleString('ru-RU').replace(/,/g, ' '));
                          }}
                          style={{
                            width: 28, height: 28, borderRadius: 8, border: '1.4px solid rgba(25,25,25,0.2)',
                            background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '20px', padding: 0,
                          }}
                        >
                          −
                        </button>
                        <span style={{ fontSize: 16, fontWeight: 500, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px', minWidth: 50, textAlign: 'center' }}>
                          {recordsPerRequest}
                        </span>
                        <button
                          onClick={() => {
                            const num = parseInt(recordsPerRequest.replace(/\s/g, ''), 10) || 0;
                            const step = num < 1000 ? 100 : 1000;
                            const next = num + step;
                            setRecordsPerRequest(next.toLocaleString('ru-RU').replace(/,/g, ' '));
                          }}
                          style={{
                            width: 28, height: 28, borderRadius: 8, border: '1.4px solid rgba(25,25,25,0.2)',
                            background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '20px', padding: 0,
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* === Card 2: SQL === */}
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 16px rgba(0,0,0,0.05)', padding: '20px 40px 40px 40px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', flexShrink: 0 }}>
                    <span style={{ fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '22px' }}>
                      SQL
                    </span>
                  </div>

                  <button
                    onClick={() => { setSqlDraft(sql); setSqlError(''); setSqlModalOpen(true); if (validationErrors.sql) { const v = {...validationErrors}; delete v.sql; setValidationErrors(v); } }}
                    style={{
                      background: 'rgba(25,25,25,0.05)', borderRadius: 12,
                      padding: '12px 20px',
                      border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 8 }}>
                      <p style={{
                        flex: 1, minWidth: 0,
                        fontSize: 16, fontWeight: 400, color: sql ? '#191919' : '#949494',
                        lineHeight: '20px', letterSpacing: '0.16px',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        margin: 0, fontFamily: 'inherit',
                      }}>
                        {sql || 'Запрос SQL'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: 2 }}>
                        <div style={{ flex: 1, height: validationErrors.sql ? 2 : 0.5, background: validationErrors.sql ? '#d84d4d' : 'rgba(25,25,25,0.2)' }} />
                      </div>
                      <span style={{ fontSize: 14, color: validationErrors.sql ? '#d84d4d' : '#676767', lineHeight: '18px', letterSpacing: '0.14px', fontWeight: 400 }}>
                        {validationErrors.sql || 'Нажмите, чтобы добавить SQL запрос'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* === Card 3: Поля === */}
            {sql && fields.length > 0 && <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 16px rgba(0,0,0,0.05)', padding: '20px 40px 40px 40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '22px' }}>
                    Поля
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {fields.length > 0 ? (
                    fields.map((field, i) => (
                      <FilterBlock
                        key={i}
                        item={field}
                        index={i}
                        items={fields}
                        setItems={setFields}
                        showLength={true}
                        errorKey={`field_${i}`}
                        showToggle={false}
                      />
                    ))
                  ) : (
                    <p style={{ fontSize: 14, color: '#949494', lineHeight: '18px', margin: 0 }}>
                      Поля будут извлечены из SQL запроса
                    </p>
                  )}
                </div>
              </div>
            </div>}

            {/* === Card 4: Фильтры === */}
            {sql && filters.length > 0 && <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 16px rgba(0,0,0,0.05)', padding: '20px 40px 40px 40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '22px' }}>
                    Фильтры
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filters.length > 0 ? (
                    filters.map((filter, i) => (
                      <FilterBlock
                        key={i}
                        item={filter}
                        index={i}
                        items={filters}
                        setItems={setFilters}
                        showLength={false}
                        errorKey={`filter_${i}`}
                      />
                    ))
                  ) : (
                    <p style={{ fontSize: 14, color: '#949494', lineHeight: '18px', margin: 0 }}>
                      Фильтры будут извлечены из SQL запроса
                    </p>
                  )}
                </div>
              </div>
            </div>}

          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 90, alignItems: 'center', justifyContent: 'flex-end', padding: '20px 0', flexShrink: 0, background: '#f9f9f9', boxSizing: 'border-box', position: 'sticky', bottom: 0, zIndex: 10 }}>
        <button
          onClick={handleCreate}
          style={{ width: 335, height: 50, borderRadius: 10, background: '#835de1', border: 'none', cursor: 'pointer', position: 'relative' }}
        >
          <span style={{ fontSize: 18, fontWeight: 500, color: 'white', lineHeight: '22px', textAlign: 'center' }}>
            Создать
          </span>
        </button>
      </div>

      {/* SQL Modal */}
      {sqlModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'linear-gradient(90deg, rgba(25,25,25,0.4) 0%, rgba(25,25,25,0.4) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setSqlModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', borderRadius: 12, width: 680, height: 620, minWidth: 320, maxWidth: 900, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0px 20px 40px rgba(0,0,0,0.1)' }}
          >
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', height: 56, padding: '0 20px', position: 'relative' }}>
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#191919', lineHeight: '22px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: 280 }}>
                    SQL запрос
                  </span>
                  <button
                    onClick={() => setSqlModalOpen(false)}
                    style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}
                  >
                    <img src={`${base}assets/icon-cross.svg`} alt="Закрыть" style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>
              <div style={{ height: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0.5, height: 0.5, background: 'rgba(25,25,25,0.2)' }} />
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 20px', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ flex: 1, minHeight: 0, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20, flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                        Текст SQL запроса
                      </span>
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                      <textarea
                        value={sqlDraft}
                        onChange={(e) => { setSqlDraft(e.target.value); setSqlError(''); }}
                        autoFocus
                        placeholder="Введите текст"
                        style={{
                          width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none',
                          resize: 'none', fontSize: 16, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px',
                          padding: 0, margin: 0, fontFamily: 'inherit', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: 2 }}>
                      <div style={{ flex: 1, height: sqlError ? 2 : 0.5, background: sqlError ? '#d84d4d' : 'rgba(25,25,25,0.2)' }} />
                    </div>
                    <span style={{ fontSize: 14, color: sqlError ? '#d84d4d' : '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>
                      {sqlError || 'Должен начинаться с SELECT или WITH'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flexShrink: 0 }}>
              <div style={{ height: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 0.5, background: 'rgba(25,25,25,0.2)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 20px' }}>
                <button
                  onClick={() => {
                    const trimmed = sqlDraft.trim().toLowerCase();
                    const selectMatch = trimmed.match(/^(select|with)\s+/i);
                    if (!selectMatch) {
                      setSqlError('В методе не указаны поля для обращения');
                      return;
                    }
                    const afterSelect = trimmed.replace(/^select\s+/i, '').trim();
                    if (!afterSelect || afterSelect.startsWith('from')) {
                      setSqlError('В методе не указаны поля для обращения');
                      return;
                    }
                    setSql(sqlDraft);
                    parseSqlFieldsAndFilters(sqlDraft);
                    setSqlModalOpen(false);
                  }}
                  style={{ width: '100%', height: 48, borderRadius: 12, background: '#835de1', border: 'none', cursor: 'pointer', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span style={{ fontSize: 16, fontWeight: 500, color: 'white', lineHeight: '20px', letterSpacing: '0.16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Добавить
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
