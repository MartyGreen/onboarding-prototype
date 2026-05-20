import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const methodData = {
  name: 'fds_fresh_payee_limited',
  description: 'Получение массива id активных терминалов торгового эквайринга по ИНН клиента',
  detailedInfo: 'Метод для получения массива id активных терминалов торгового эквайринга по ИНН клиента для реализации акции с Т-банком по продвижению наших клиентов в разделе кэшбэк внутри Т-банка',
  needsPagination: 'Да',
  recordsPerRequest: '10 000',
  author: 'Кисарова Галина',
  status: 'Активен',
  created: '3 дня назад',
  updated: 'минуту назад',
  sql: [
    { type: 'keyword', text: 'select' },
    { type: 'normal', text: '    ' },
    { type: 'comment', text: 'cl.client_inn,' },
    { type: 'comment', text: '                 customer_code,' },
    { type: 'comment', text: '                 atr.tid' },
    { type: 'keyword', text: 'from ' },
    { type: 'normal', text: '      ' },
    { type: 'comment', text: 'stage.acquiring_terminals atr' },
    { type: 'keyword', text: 'join' },
    { type: 'normal', text: '         ' },
    { type: 'comment', text: 'stage.acquiring_contracts ac on atr.contract_id = ac.id' },
    { type: 'keyword', text: 'and' },
    { type: 'normal', text: '         ' },
    { type: 'comment', text: "ac.status = 'EKV_REG_1'" },
    { type: 'keyword', text: 'join' },
    { type: 'normal', text: '         ' },
    { type: 'comment', text: 'datamart.client_life cl on cl.client_code = ac.customer_code' },
    { type: 'keyword', text: 'and' },
    { type: 'normal', text: '         ' },
    { type: 'comment', text: 'cl.last_life_flag = 1' },
    { type: 'keyword', text: 'where' },
    { type: 'normal', text: '   ' },
    { type: 'comment', text: ' cl.client_inn = :inn' },
  ],
  fields: [
    { name: 'COLVIR_CODE', type: 'NAMBER', length: '22', description: 'id активного терминала' },
    { name: 'FRAGMENT_NAME', type: 'VARCHAR_2', length: '100 000', description: 'Сссылка на процесс на ежегодную актуализацию данных клиента в ЭДО Идентификатор пользователя из Слака' },
  ],
  filters: [
    { name: 'inn', type: 'VARCHAR2', description: 'ИНН клиента' },
    { name: 'bag_int', type: 'sting', description: 'Сссылка на процесс на ежегодную актуализацию данных клиента в ЭДО Идентификатор пользователя из Слака' },
  ],
};

const statusStyles = {
  'Активен': { color: '#5cad9a', borderColor: '#5cad9a' },
  'На проверке': { color: '#949494', borderColor: '#949494' },
  'Отклонён': { color: '#d84d4d', borderColor: '#d84d4d' },
};

const tabs = ['Описание', 'Запросы', 'Статистика'];

export default function BiApiMethodPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Описание');

  const data = methodData;
  const status = statusStyles[data.status] || statusStyles['На проверке'];

  // Форматируем SQL с подсветкой
  const sqlLines = [];
  let currentLine = [];
  data.sql.forEach((token) => {
    if (token.type === 'keyword' && currentLine.length > 0) {
      sqlLines.push([...currentLine]);
      currentLine = [];
    }
    currentLine.push(token);
    if (token.type === 'comment') {
      sqlLines.push([...currentLine]);
      currentLine = [];
    }
  });
  if (currentLine.length > 0) sqlLines.push(currentLine);

  return (
    <div className="flex-1 flex flex-col bg-[#f9f9f9] pt-6 px-8 pb-6 gap-8 overflow-y-auto">
      {/* Title Row */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/api')}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors shrink-0"
        >
          <img src={`${import.meta.env.BASE_URL}assets/icon-arrow-left.svg`} alt="Назад" className="w-5 h-5" />
        </button>
        <h1 className="text-[30px] font-semibold text-[#191919] leading-9 tracking-[-0.3px] m-0 flex-1 truncate">
          {data.name}
        </h1>
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src={`${import.meta.env.BASE_URL}assets/icon-trash-black.svg`} alt="" className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 h-10 px-3 rounded-lg bg-[#191919] border-none cursor-pointer hover:bg-[#333] transition-colors">
            <span className="text-sm font-medium text-white leading-[18px] tracking-[0.14px] whitespace-nowrap">
              Редактировать
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 h-10 px-3 rounded-xl border cursor-pointer transition-colors text-sm font-medium leading-[18px] tracking-[0.14px] ${
              activeTab === tab
                ? 'border-[#191919] bg-transparent text-[#191919] border-[1.4px]'
                : 'border-transparent bg-[rgba(25,25,25,0.05)] text-[#191919] hover:bg-[rgba(25,25,25,0.1)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex gap-8 items-start pb-8">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-3.5 min-w-0">
          {/* Описание документа */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-5">
            <h2 className="text-lg font-medium text-[#191919] leading-[22px] py-3 m-0">
              Описание документа
            </h2>
            <div className="flex flex-col">
              <div className="py-3">
                <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Общее описание</p>
                <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.description}</p>
              </div>
              <div className="py-3">
                <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Подробная информация</p>
                <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.detailedInfo}</p>
              </div>
              <div className="py-3">
                <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Нужна пагинация?</p>
                <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.needsPagination}</p>
              </div>
              <div className="py-3">
                <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Количество записей за один запрос</p>
                <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.recordsPerRequest}</p>
              </div>
            </div>
          </div>

          {/* SQL */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-5">
            <h2 className="text-lg font-medium text-[#191919] leading-[22px] py-3 m-0">
              SQL
            </h2>
            <div className="border border-[rgba(25,25,25,0.1)] rounded-xl p-4 mt-1.5">
              <pre className="text-base leading-5 tracking-[0.16px] m-0 font-[inherit] whitespace-pre-wrap">
                {sqlLines.map((line, i) => (
                  <div key={i} className="mb-2.5 last:mb-0">
                    {line.map((token, j) => (
                      <span
                        key={j}
                        className={
                          token.type === 'keyword'
                            ? 'text-[#835de1]'
                            : token.type === 'comment'
                            ? 'text-[#676767]'
                            : 'text-[#191919]'
                        }
                      >
                        {token.text}
                      </span>
                    ))}
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Поля */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] pt-2.5 pb-5">
            <div className="px-10">
              {/* Table Header */}
              <div className="flex items-center gap-5 pb-2">
                <div className="w-[250px]">
                  <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Поля</span>
                </div>
                <div className="w-[70px]">
                  <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Длинна</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Описание</span>
                </div>
              </div>
            </div>
            <div className="h-px bg-[rgba(25,25,25,0.2)]" />
            <div className="px-10 pt-1.5">
              {data.fields.map((field, i) => (
                <div key={i} className="flex items-start gap-5 py-3">
                  <div className="w-[250px]">
                    <p className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px] m-0">{field.name}</p>
                    <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] mt-0.5 m-0">{field.type}</p>
                  </div>
                  <div className="w-[70px]">
                    <p className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px] m-0">{field.length}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-base text-[#191919] leading-[22px] tracking-[0.16px] m-0">{field.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Фильтры */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] pt-2.5 pb-5">
            <div className="px-10">
              {/* Table Header */}
              <div className="flex items-center gap-5 pb-2">
                <div className="w-[250px]">
                  <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Фильтры</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Описание</span>
                </div>
              </div>
            </div>
            <div className="h-px bg-[rgba(25,25,25,0.2)]" />
            <div className="px-10 pt-1.5">
              {data.filters.map((filter, i) => (
                <div key={i} className="flex items-start gap-5 py-3">
                  <div className="w-[250px]">
                    <p className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px] m-0">{filter.name}</p>
                    <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] mt-0.5 m-0">{filter.type}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-base text-[#191919] leading-[22px] tracking-[0.16px] m-0">{filter.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[280px] shrink-0 flex flex-col gap-4">
          {/* Author */}
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#e1e1e1] overflow-hidden" />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Автор</span>
              <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">{data.author}</span>
            </div>
          </div>

          <div className="h-px bg-[rgba(25,25,25,0.2)]" />

          {/* Status */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Статус</span>
            <span
              className="inline-flex items-center justify-center self-start px-2 h-6 rounded-md text-sm font-medium leading-[18px] tracking-[0.14px] border whitespace-nowrap"
              style={{ color: status.color, borderColor: status.borderColor }}
            >
              {data.status}
            </span>
          </div>

          {/* Created */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Создано</span>
            <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">{data.created}</span>
          </div>

          {/* Updated */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Обновлено</span>
            <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px]">{data.updated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
