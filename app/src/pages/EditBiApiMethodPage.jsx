import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAlert } from '../components/SuccessAlert';
import { useBiApiMethods } from '../data/BiApiMethodsContext';

export default function EditBiApiMethodPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert } = useAlert();
  const { getMethod, updateMethod } = useBiApiMethods();

  const methodData = getMethod(id);

  const [name, setName] = useState(methodData?.name || '');
  const [description, setDescription] = useState(methodData?.description || '');
  const [detailedInfo, setDetailedInfo] = useState(methodData?.detailedInfo || '');
  const [sql, setSql] = useState(methodData?.sql || '');
  const [techAccount] = useState(methodData?.techAccount || 'TEST_TEAM');
  const [fields, setFields] = useState(methodData?.fields || []);
  const [filters, setFilters] = useState(methodData?.filters || []);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [sqlDraft, setSqlDraft] = useState('');
  const [sqlError, setSqlError] = useState('');

  if (!methodData) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
        <p style={{ fontSize: 18, color: '#949494' }}>Метод не найден</p>
      </div>
    );
  }

  // Парсинг SQL: извлечение полей из SELECT и фильтров из WHERE (:param)
  const parseSqlFieldsAndFilters = (sqlText) => {
    const text = sqlText.trim();
    
    // Извлекаем поля между SELECT и FROM
    const selectFromMatch = text.match(/select\s+([\s\S]*?)\s+from\s/i);
    if (selectFromMatch) {
      const fieldsPart = selectFromMatch[1];
      const parsedFields = fieldsPart
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0)
        .map(f => {
          // Убираем алиас таблицы (cl.client_inn -> CLIENT_INN)
          const parts = f.split('.');
          const fieldName = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).trim().toUpperCase();
          // Проверяем, есть ли уже такое поле — если да, сохраняем его данные
          const existing = fields.find(ef => ef.name === fieldName);
          return existing || { name: fieldName, type: 'VARCHAR2', length: '', description: '' };
        });
      setFields(parsedFields);
    }
    
    // Извлекаем фильтры — параметры :param из SQL
    const paramMatches = [...text.matchAll(/:(\w+)/g)];
    if (paramMatches.length > 0) {
      const uniqueParams = [...new Set(paramMatches.map(m => m[1]))];
      const parsedFilters = uniqueParams.map(paramName => {
        // Сохраняем существующий фильтр, если есть
        const existing = filters.find(ef => ef.name === paramName);
        return existing || { name: paramName, type: 'VARCHAR2', description: '', enabled: false };
      });
      setFilters(parsedFilters);
    } else {
      setFilters([]);
    }
  };

  const handleSave = () => {
    updateMethod(id, {
      name,
      description,
      detailedInfo,
      sql,
      techAccount,
      fields,
      filters,
    });
    showAlert('Изменения сохранены');
    navigate(`/api/${id}`);
  };


  const base = import.meta.env.BASE_URL;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f9f9f9', overflowY: 'auto' }}>
      {/* Right Panel: w=1190, pt=24, pb=24, px=32, gap=32, centered */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', paddingTop: 24, paddingBottom: 24, paddingLeft: 32, paddingRight: 32 }}>

        {/* Title: w=640, gap=16, items-center */}
        <div style={{ width: 640, display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Icon Button: 40x40, rounded=8, bg=transparent-1 */}
          <button
            onClick={() => navigate(`/api/${id}`)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 8, background: 'rgba(25,25,25,0.05)', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <img src={`${base}assets/icon-arrow-left.svg`} alt="Назад" style={{ width: 20, height: 20 }} />
          </button>
          {/* 3XL: 30px DemiBold, lh=36, ls=-0.3 */}
          <h1 style={{ fontSize: 30, fontWeight: 600, color: '#191919', lineHeight: '36px', letterSpacing: '-0.3px', margin: 0 }}>
            Редактирование
          </h1>
        </div>

        {/* Content: w=640, pb=32 */}
        <div style={{ width: 640, paddingBottom: 32 }}>
          {/* Cards stack: gap=14 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* === Card 1: Описание документа === */}
            {/* px=40, py=20, rounded=20, drop-shadow 0 4 8 */}
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 16px rgba(0,0,0,0.05)', padding: '20px 40px' }}>
              {/* Content: gap=6 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* L: h=86, py=12 */}
                <div style={{ display: 'flex', alignItems: 'center', height: 86, padding: '12px 0' }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '22px' }}>
                    Описание документа
                  </span>
                </div>

                {/* Input: Название метода — with description */}
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                        Название метода
                      </span>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="new_method"
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: '#949494', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit' }}
                    />
                  </div>
                  {/* Description with divider */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', height: 2 }}>
                      <div style={{ flex: 1, height: 0.5, background: 'rgba(25,25,25,0.2)' }} />
                    </div>
                    <span style={{ fontSize: 14, color: '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>
                      Латинские буквы и знак подчеркивания, больше 6 символов
                    </span>
                  </div>
                </div>

                {/* Input: Краткое описание */}
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                        Краткое описание
                      </span>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                      placeholder="Пример краткого описания"
                      rows={1}
                      style={{ background: 'transparent', border: 'none', outline: 'none', resize: 'none', overflow: 'hidden', fontSize: 16, color: '#949494', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
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
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                      placeholder="Какие нюансы есть у метода"
                      rows={1}
                      style={{ background: 'transparent', border: 'none', outline: 'none', resize: 'none', overflow: 'hidden', fontSize: 16, color: '#949494', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Dropdown: Командная тех. учетка */}
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', height: 20 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                          Командная тех. учетка
                        </span>
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
              </div>
            </div>

            {/* === Card 2: SQL === */}
            {/* pt=20, pb=40, px=40, rounded=20, drop-shadow 0 4 8 */}
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 16px rgba(0,0,0,0.05)', padding: '20px 40px 40px 40px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, justifyContent: 'space-between', height: '100%' }}>
                {/* L: h=86, py=12 */}
                <div style={{ display: 'flex', alignItems: 'center', height: 86, padding: '12px 0', flexShrink: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '22px' }}>
                    SQL
                  </span>
                </div>

                {/* Input-кнопка: показывает SQL или placeholder, при клике открывает модалку */}
                <button
                  onClick={() => { setSqlDraft(sql); setSqlError(''); setSqlModalOpen(true); }}
                  style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                        Текст SQL запроса
                      </span>
                    </div>
                    <p style={{ fontSize: 16, color: sql ? '#191919' : '#949494', lineHeight: '20px', letterSpacing: '0.16px', margin: 0, fontFamily: 'inherit', whiteSpace: sql ? 'pre-wrap' : 'nowrap', wordBreak: 'break-word', overflow: sql ? 'visible' : 'hidden', textOverflow: sql ? 'unset' : 'ellipsis' }}>
                      {sql || 'Введите текст'}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* === Card 3: Поля (таблица) === */}
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 16px rgba(0,0,0,0.05)', padding: '10px 0 20px 0', boxSizing: 'border-box' }}>
              {/* Table Header */}
              <div style={{ padding: '0 40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '8px 0' }}>
                  <div style={{ width: 250 }}>
                    <span style={{ fontSize: 14, color: '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>Поля</span>
                  </div>
                  {fields.length > 0 && (
                    <>
                      <div style={{ width: 70 }}>
                        <span style={{ fontSize: 14, color: '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>Длинна</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 14, color: '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>Описание</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {fields.length > 0 && (
                <>
                  {/* Divider */}
                  <div style={{ height: 1, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 0.5, height: 0.5, background: 'rgba(25,25,25,0.2)' }} />
                  </div>
                  {/* Rows */}
                  <div style={{ padding: '6px 40px 0 40px' }}>
                    {fields.map((field, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '12px 0' }}>
                        <div style={{ width: 250 }}>
                          <p style={{ fontSize: 16, fontWeight: 500, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px', margin: 0 }}>{field.name}</p>
                          <p style={{ fontSize: 14, color: '#676767', lineHeight: '18px', letterSpacing: '0.14px', margin: 0, marginTop: 2 }}>{field.type}</p>
                        </div>
                        <div style={{ width: 70 }}>
                          <p style={{ fontSize: 16, fontWeight: 500, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px', margin: 0 }}>{field.length}</p>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 16, color: '#191919', lineHeight: '22px', letterSpacing: '0.16px', margin: 0 }}>{field.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {fields.length === 0 && (
                <div style={{ padding: '12px 40px 0 40px' }}>
                  <p style={{ fontSize: 14, color: '#949494', lineHeight: '18px', margin: 0 }}>Поля будут извлечены из SQL запроса</p>
                </div>
              )}
            </div>

            {/* === Card 4: Фильтры === */}
            <div style={{ background: 'white', borderRadius: 20, boxShadow: '0px 4px 16px rgba(0,0,0,0.05)', padding: '20px 40px 40px 40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Заголовок: L */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '22px' }}>
                    Фильтры
                  </span>
                </div>

                {/* Список фильтров: gap=16 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filters.map((filter, i) => {
                    const isDisabled = filter.enabled === true;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, overflow: 'hidden' }}>
                        {/* M-ячейка: название + тип (текст), справа кнопка "Учитывать/Не учитывать" */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12, height: 76, alignItems: 'flex-start', padding: '8px 0' }}>
                            <div style={{
                              flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2,
                              justifyContent: 'center', alignSelf: 'stretch',
                              fontSize: 16, lineHeight: '20px', letterSpacing: '0.16px',
                              color: isDisabled ? '#949494' : undefined,
                            }}>
                              <p style={{ fontWeight: 500, color: isDisabled ? '#949494' : '#191919', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {filter.name}
                              </p>
                              <p style={{ fontWeight: 400, color: isDisabled ? '#949494' : '#676767', margin: 0 }}>
                                {filter.type || 'string'}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: 20, flexShrink: 0, gap: 12 }}>
                            <button
                              onClick={() => {
                                const updated = [...filters];
                                updated[i] = { ...updated[i], enabled: !filter.enabled };
                                setFilters(updated);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 16, fontWeight: 400, color: '#676767', lineHeight: '20px', letterSpacing: '0.16px', textAlign: 'right', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
                            >
                              {isDisabled ? 'Учитывать' : 'Не учитывать'}
                            </button>
                          </div>
                        </div>

                        {/* Инпут «Описание» — на всю ширину */}
                        <div style={{
                          background: 'rgba(25,25,25,0.05)',
                          borderRadius: 12,
                          height: 72,
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
                                {!isDisabled && !filter.description && (
                                  <span style={{ fontSize: 18, fontWeight: 500, color: '#d84d4d', lineHeight: '22px', position: 'relative', top: -4, width: 8 }}>*</span>
                                )}
                              </div>
                              {isDisabled ? (
                                <p style={{ fontSize: 16, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {filter.description || 'Заполните описание'}
                                </p>
                              ) : (
                                <input
                                  type="text"
                                  value={filter.description}
                                  onChange={(e) => {
                                    const updated = [...filters];
                                    updated[i] = { ...updated[i], description: e.target.value };
                                    setFilters(updated);
                                  }}
                                  placeholder="Заполните описание"
                                  style={{
                                    background: 'transparent', border: 'none', outline: 'none',
                                    fontSize: 16, color: filter.description ? '#191919' : '#949494',
                                    lineHeight: '20px', letterSpacing: '0.16px',
                                    padding: 0, margin: 0, width: '100%', fontFamily: 'inherit',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer: h=90, py=20, gap=10, items-center, justify-end */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 90, alignItems: 'center', justifyContent: 'flex-end', padding: '20px 0', flexShrink: 0, background: '#f9f9f9', boxSizing: 'border-box' }}>
        <button
          onClick={handleSave}
          style={{ width: 335, height: 50, borderRadius: 10, background: '#835de1', border: 'none', cursor: 'pointer', position: 'relative' }}
        >
          <span style={{ fontSize: 18, fontWeight: 500, color: 'white', lineHeight: '22px', textAlign: 'center' }}>
            Сохранить
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
            {/* Header: h=56, title centered, cross right */}
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
              {/* Divider */}
              <div style={{ height: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0.5, height: 0.5, background: 'rgba(25,25,25,0.2)' }} />
              </div>
            </div>

            {/* Content: TextArea fills available space */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 20px', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* TextArea content */}
                  <div style={{ flex: 1, minHeight: 0, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Title */}
                    <div style={{ display: 'flex', alignItems: 'center', height: 20, flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                        Текст SQL запроса
                      </span>
                    </div>
                    {/* Input area */}
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
                  {/* Description/Error with divider */}
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

            {/* Footer: divider + button */}
            <div style={{ flexShrink: 0 }}>
              {/* Divider */}
              <div style={{ height: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 0.5, background: 'rgba(25,25,25,0.2)' }} />
              </div>
              {/* Button area */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 20px' }}>
                <button
                  onClick={() => {
                    // Валидация: проверяем, что SQL содержит перечисление полей после SELECT
                    const trimmed = sqlDraft.trim().toLowerCase();
                    const selectMatch = trimmed.match(/^(select|with)\s+/i);
                    if (!selectMatch) {
                      setSqlError('В методе не указаны поля для обращения');
                      return;
                    }
                    // Проверяем что после SELECT есть что-то кроме пробелов до FROM
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
