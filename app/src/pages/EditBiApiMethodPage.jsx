import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAlert } from '../components/SuccessAlert';

const methodData = {
  name: 'new_method',
  description: '',
  detailedInfo: '',
  sql: `select    cl.client_inn,
                 customer_code,
                 atr.tid
from       stage.acquiring_terminals atr
join         stage.acquiring_contracts ac on atr.contract_id = ac.id
and         ac.status = 'EKV_REG_1'
join         datamart.client_life cl on cl.client_code = ac.customer_code
and         cl.last_life_flag = 1
where    cl.client_inn = :inn`,
  techAccount: 'TEST_TEAM',
  fields: [
    { name: 'COLVIR_CODE', type: 'NAMBER', length: '22', description: 'id активного терминала' },
    { name: 'FRAGMENT_NAME', type: 'VARCHAR_2', length: '100 000', description: 'Сссылка на процесс на ежегодную актуализацию данных клиента в ЭДО Идентификатор пользователя из Слака' },
  ],
  filters: [
    { name: 'sum_flag_int', type: 'sting', description: 'Фильтруем по сумме переводов' },
    { name: 'sum_flag_int', type: 'sting', description: '' },
    { name: 'bag_int', type: 'namber', description: '' },
  ],
};

export default function EditBiApiMethodPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert } = useAlert();

  const [name, setName] = useState(methodData.name);
  const [description, setDescription] = useState(methodData.description);
  const [detailedInfo, setDetailedInfo] = useState(methodData.detailedInfo);
  const [sql, setSql] = useState(methodData.sql);
  const [techAccount] = useState(methodData.techAccount);
  const [fields] = useState(methodData.fields);
  const [filters, setFilters] = useState(methodData.filters);

  const handleSave = () => {
    showAlert('Изменения сохранены');
    navigate(`/api/${id}`);
  };

  const handleRemoveFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
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
            <div style={{ background: 'white', borderRadius: 20, filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.05))', padding: '20px 40px' }}>
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
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                        Краткое описание
                      </span>
                    </div>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Пример краткого описания"
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: '#949494', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>

                {/* Input: Подробная информация */}
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '0 20px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 20 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#191919', lineHeight: '18px', letterSpacing: '0.14px' }}>
                        Подробная информация о методу
                      </span>
                    </div>
                    <input
                      type="text"
                      value={detailedInfo}
                      onChange={(e) => setDetailedInfo(e.target.value)}
                      placeholder="Какие нюансы есть у метода"
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: '#949494', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit' }}
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
            {/* h=404, pt=20, pb=40, px=40, rounded=20, drop-shadow 0 4 8 */}
            <div style={{ background: 'white', borderRadius: 20, filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.05))', height: 404, padding: '20px 40px 40px 40px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%' }}>
                {/* L: h=86, py=12 */}
                <div style={{ display: 'flex', alignItems: 'center', height: 86, padding: '12px 0', flexShrink: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '22px' }}>
                    SQL
                  </span>
                </div>

                {/* text_block: bg, rounded=12, pt=12, pb=12, px=20 */}
                <div style={{ background: 'rgba(25,25,25,0.05)', borderRadius: 12, padding: '12px 20px 12px 20px', flex: 1, overflow: 'hidden' }}>
                  <textarea
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
                    placeholder="Добавьте SQL запрос"
                    style={{
                      width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none',
                      resize: 'none', fontSize: 16, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px',
                      padding: 0, margin: 0, fontFamily: 'inherit', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* === Card 3: Поля (таблица) === */}
            {/* h=275, pt=10, pb=20, rounded=20, drop-shadow 0 4 8 */}
            <div style={{ background: 'white', borderRadius: 20, filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.05))', height: 275, padding: '10px 0 20px 0', boxSizing: 'border-box' }}>
              {/* Table Header: px=40, row gap=20, pb=8 */}
              <div style={{ padding: '0 40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 8 }}>
                  <div style={{ width: 250 }}>
                    {/* S: h=54, py=8 */}
                    <div style={{ height: 54, padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>Поля</span>
                    </div>
                  </div>
                  <div style={{ width: 70 }}>
                    <div style={{ height: 54, padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>Длинна</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 54, padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: '#676767', lineHeight: '18px', letterSpacing: '0.14px' }}>Описание</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Divider */}
              <div style={{ height: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0.5, height: 0.5, background: 'rgba(25,25,25,0.2)' }} />
              </div>
              {/* Rows: px=40, pt=6 */}
              <div style={{ padding: '6px 40px 0 40px' }}>
                {fields.map((field, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '12px 0' }}>
                    {/* M cell: w=250, h=84, py=12 */}
                    <div style={{ width: 250 }}>
                      <p style={{ fontSize: 16, fontWeight: 500, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px', margin: 0 }}>{field.name}</p>
                      <p style={{ fontSize: 14, color: '#676767', lineHeight: '18px', letterSpacing: '0.14px', margin: 0, marginTop: 2 }}>{field.type}</p>
                    </div>
                    {/* M cell: w=70 */}
                    <div style={{ width: 70 }}>
                      <p style={{ fontSize: 16, fontWeight: 500, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px', margin: 0 }}>{field.length}</p>
                    </div>
                    {/* M cell: flex=1 */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 16, color: '#191919', lineHeight: '22px', letterSpacing: '0.16px', margin: 0 }}>{field.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* === Card 4: Фильтры === */}
            {/* pt=20, pb=40, px=40, rounded=20, drop-shadow 0 4 8 */}
            <div style={{ background: 'white', borderRadius: 20, filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.05))', padding: '20px 40px 40px 40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* L: h=86, py=12 */}
                <div style={{ display: 'flex', alignItems: 'center', height: 86, padding: '12px 0' }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: '#191919', lineHeight: '22px' }}>
                    Фильтры
                  </span>
                </div>

                {/* Filters: gap=16 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filters.map((filter, i) => (
                    <div key={i} style={{ display: 'flex', gap: 2, borderRadius: 12, overflow: 'hidden' }}>
                      {/* Left column: w=240, gap=2 */}
                      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Name input: h=52, px=20, rounded-tl=12 */}
                        <div style={{ background: 'rgba(25,25,25,0.05)', borderTopLeftRadius: 12, height: 52, padding: '0 20px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                          <input
                            type="text"
                            value={filter.name}
                            onChange={(e) => {
                              const updated = [...filters];
                              updated[i] = { ...updated[i], name: e.target.value };
                              setFilters(updated);
                            }}
                            placeholder="Название"
                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit' }}
                          />
                        </div>
                        {/* Type dropdown: px=20, py=12, rounded-bl=12 */}
                        <div style={{ background: 'rgba(25,25,25,0.05)', borderBottomLeftRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}>
                          <span style={{ fontSize: 16, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px' }}>{filter.type}</span>
                          <img src={`${base}assets/icon-chevron-down.svg`} alt="" style={{ width: 12, height: 12, flexShrink: 0 }} />
                        </div>
                      </div>

                      {/* Description area: flex=1, full height */}
                      <div style={{ flex: 1, minWidth: 0, background: 'rgba(25,25,25,0.05)', display: 'flex', overflow: 'hidden' }}>
                        {filter.description ? (
                          /* With text: simple input, px=20, py=12 */
                          <div style={{ flex: 1, padding: '12px 20px', display: 'flex', alignItems: 'flex-start' }}>
                            <input
                              type="text"
                              value={filter.description}
                              onChange={(e) => {
                                const updated = [...filters];
                                updated[i] = { ...updated[i], description: e.target.value };
                                setFilters(updated);
                              }}
                              placeholder="Описание"
                              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: '#191919', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit' }}
                            />
                          </div>
                        ) : (
                          /* Empty: shows placeholder + warning circle icon */
                          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <input
                                type="text"
                                value={filter.description}
                                onChange={(e) => {
                                  const updated = [...filters];
                                  updated[i] = { ...updated[i], description: e.target.value };
                                  setFilters(updated);
                                }}
                                placeholder="Описание"
                                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: '#949494', lineHeight: '20px', letterSpacing: '0.16px', padding: 0, margin: 0, width: '100%', fontFamily: 'inherit' }}
                              />
                            </div>
                            {/* Warning circle icon */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', flexShrink: 0, paddingRight: 16 }}>
                              <img src={`${base}assets/icon-warning-circle.svg`} alt="" style={{ width: 18, height: 18 }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delete button: px=10, rounded-tr=12, rounded-br=12, cross icon 24x24 */}
                      <button
                        onClick={() => handleRemoveFilter(i)}
                        style={{ background: 'rgba(25,25,25,0.05)', borderTopRightRadius: 12, borderBottomRightRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '0 10px', overflow: 'hidden' }}
                      >
                        {/* Content: h=72, py=12 */}
                        <div style={{ height: 72, padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={`${base}assets/icon-cross.svg`} alt="Удалить" style={{ width: 10, height: 10 }} />
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
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
    </div>
  );
}
