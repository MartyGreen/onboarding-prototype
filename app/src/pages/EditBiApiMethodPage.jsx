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
    <div className="flex-1 flex flex-col bg-[#f9f9f9] overflow-y-auto">
      {/* Right Panel: pt-24, px-32, gap-32, pb-24 */}
      <div className="flex flex-col gap-8 items-center pt-6 px-8 pb-6">

        {/* Title: w-640, gap-16, items-center */}
        <div className="w-[640px] flex items-center gap-4">
          {/* Icon Button: 40x40, rounded-8, bg transparent-1 */}
          <button
            onClick={() => navigate(`/api/${id}`)}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors shrink-0"
          >
            <img src={`${base}assets/icon-arrow-left.svg`} alt="Назад" className="w-5 h-5" />
          </button>
          {/* 3XL title: 30px DemiBold, lh-36, ls=-0.3 */}
          <h1 className="text-[30px] font-semibold text-[#191919] leading-9 tracking-[-0.3px] m-0">
            Редактирование
          </h1>
        </div>

        {/* Content: w-640, pb-32 */}
        <div className="w-[640px] pb-8">
          {/* Frame 1: flex-col, gap-14 */}
          <div className="flex flex-col gap-3.5">

            {/* === Описание документа === */}
            {/* Card: bg-white, rounded-20, shadow, px-40, py-20 */}
            <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)]" style={{ padding: '20px 40px' }}>
              {/* Content: flex-col, gap-6 */}
              <div className="flex flex-col" style={{ gap: '6px' }}>
                {/* L title: 18px Medium, lh-22, py-12 → total h=46 */}
                <div className="flex items-center" style={{ padding: '12px 0' }}>
                  <h2 className="text-[18px] font-medium text-[#191919] leading-[22px] m-0">
                    Описание документа
                  </h2>
                </div>

                {/* Input: Название метода — with description */}
                <div className="bg-[rgba(25,25,25,0.05)] rounded-xl" style={{ padding: '0 20px' }}>
                  <div className="flex flex-col" style={{ gap: '8px', padding: '12px 0' }}>
                    <div className="flex items-center h-5">
                      <span className="text-[14px] font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                        Название метода
                      </span>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent border-none outline-none text-[16px] text-[#949494] leading-5 tracking-[0.16px] p-0 m-0 w-full"
                      style={{ fontFamily: 'inherit' }}
                      placeholder="new_method"
                    />
                  </div>
                  {/* Description section with divider */}
                  <div className="flex flex-col" style={{ gap: '8px', paddingBottom: '12px' }}>
                    <div className="flex items-end justify-end h-[2px]">
                      <div className="flex-1 h-[0.5px] bg-[rgba(25,25,25,0.2)]" />
                    </div>
                    <span className="text-[14px] text-[#676767] leading-[18px] tracking-[0.14px]">
                      Латинские буквы и знак подчеркивания, больше 6 символов
                    </span>
                  </div>
                </div>

                {/* Input: Краткое описание */}
                <div className="bg-[rgba(25,25,25,0.05)] rounded-xl" style={{ padding: '0 20px' }}>
                  <div className="flex flex-col" style={{ gap: '8px', padding: '12px 0' }}>
                    <div className="flex items-center h-5">
                      <span className="text-[14px] font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                        Краткое описание
                      </span>
                    </div>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-transparent border-none outline-none text-[16px] text-[#949494] leading-5 tracking-[0.16px] p-0 m-0 w-full"
                      style={{ fontFamily: 'inherit' }}
                      placeholder="Пример краткого описания"
                    />
                  </div>
                </div>

                {/* Input: Подробная информация о методу */}
                <div className="bg-[rgba(25,25,25,0.05)] rounded-xl" style={{ padding: '0 20px' }}>
                  <div className="flex flex-col" style={{ gap: '8px', padding: '12px 0' }}>
                    <div className="flex items-center h-5">
                      <span className="text-[14px] font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                        Подробная информация о методу
                      </span>
                    </div>
                    <input
                      type="text"
                      value={detailedInfo}
                      onChange={(e) => setDetailedInfo(e.target.value)}
                      className="bg-transparent border-none outline-none text-[16px] text-[#949494] leading-5 tracking-[0.16px] p-0 m-0 w-full"
                      style={{ fontFamily: 'inherit' }}
                      placeholder="Какие нюансы есть у метода"
                    />
                  </div>
                </div>

                {/* Dropdown: Командная тех. учетка */}
                <div className="bg-[rgba(25,25,25,0.05)] rounded-xl" style={{ padding: '0 20px' }}>
                  <div className="flex items-start">
                    <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '8px', padding: '12px 0' }}>
                      <div className="flex items-center h-5">
                        <span className="text-[14px] font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                          Командная тех. учетка
                        </span>
                      </div>
                      <span className="text-[16px] text-[#191919] leading-5 tracking-[0.16px] truncate">
                        {techAccount}
                      </span>
                    </div>
                    <div className="flex flex-col items-end justify-center self-stretch shrink-0" style={{ paddingLeft: '16px' }}>
                      <div className="flex items-center justify-end">
                        <img src={`${base}assets/icon-chevron-down.svg`} alt="" className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* === SQL === */}
            {/* Card: bg-white, rounded-20, shadow, pt-20, pb-40, px-40, h-404 */}
            <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)]" style={{ padding: '20px 40px 40px 40px' }}>
              {/* Text Container: flex-col, gap-6 */}
              <div className="flex flex-col" style={{ gap: '6px' }}>
                {/* L title */}
                <div className="flex items-center" style={{ padding: '12px 0' }}>
                  <h2 className="text-[18px] font-medium text-[#191919] leading-[22px] m-0">
                    SQL
                  </h2>
                </div>

                {/* text_block: bg, rounded-12, pt-12, pb-12, px-20 */}
                <div className="bg-[rgba(25,25,25,0.05)] rounded-xl" style={{ padding: '12px 20px' }}>
                  <textarea
                    value={sql}
                    onChange={(e) => setSql(e.target.value)}
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
                    style={{ minHeight: '260px', overflow: 'hidden', fontFamily: 'inherit', boxSizing: 'border-box', paddingBottom: '8px' }}
                    className="w-full bg-transparent border-none outline-none resize-none text-[16px] text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 block"
                    placeholder="Добавьте SQL запрос"
                  />
                </div>
              </div>
            </div>

            {/* === Поля (таблица) === */}
            {/* Card: bg-white, rounded-20, shadow, pt-10, pb-20 */}
            <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)]" style={{ padding: '10px 0 20px 0' }}>
              {/* Table Header: px-40, pb-8 */}
              <div style={{ padding: '0 40px' }}>
                <div className="flex items-center" style={{ gap: '20px', paddingBottom: '8px' }}>
                  <div style={{ width: '250px' }}>
                    <span className="text-[14px] text-[#676767] leading-[18px] tracking-[0.14px]">Поля</span>
                  </div>
                  <div style={{ width: '70px' }}>
                    <span className="text-[14px] text-[#676767] leading-[18px] tracking-[0.14px]">Длинна</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-[14px] text-[#676767] leading-[18px] tracking-[0.14px]">Описание</span>
                  </div>
                </div>
              </div>
              {/* Divider */}
              <div className="h-px relative">
                <div className="absolute left-0 right-0 top-[0.5px] h-[0.5px] bg-[rgba(25,25,25,0.2)]" />
              </div>
              {/* Rows: px-40, pt-6 */}
              <div style={{ padding: '6px 40px 0 40px' }}>
                {fields.map((field, i) => (
                  <div key={i} className="flex items-start" style={{ gap: '20px', padding: '12px 0' }}>
                    <div style={{ width: '250px' }}>
                      <p className="text-[16px] font-medium text-[#191919] leading-5 tracking-[0.16px] m-0">{field.name}</p>
                      <p className="text-[14px] text-[#676767] leading-[18px] tracking-[0.14px] m-0" style={{ marginTop: '2px' }}>{field.type}</p>
                    </div>
                    <div style={{ width: '70px' }}>
                      <p className="text-[16px] font-medium text-[#191919] leading-5 tracking-[0.16px] m-0">{field.length}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[16px] text-[#191919] leading-[22px] tracking-[0.16px] m-0">{field.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* === Фильтры === */}
            {/* Card: bg-white, rounded-20, shadow, pt-20, pb-40, px-40 */}
            <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)]" style={{ padding: '20px 40px 40px 40px' }}>
              {/* Content: flex-col, gap-6 */}
              <div className="flex flex-col" style={{ gap: '6px' }}>
                {/* L title */}
                <div className="flex items-center" style={{ padding: '12px 0' }}>
                  <h2 className="text-[18px] font-medium text-[#191919] leading-[22px] m-0">
                    Фильтры
                  </h2>
                </div>

                {/* Filters list: gap-16 */}
                <div className="flex flex-col" style={{ gap: '16px' }}>
                  {filters.map((filter, i) => (
                    <div key={i} className="flex overflow-hidden rounded-xl" style={{ gap: '2px' }}>
                      {/* Left column: name + type dropdown, w-240 */}
                      <div className="flex flex-col shrink-0" style={{ width: '240px', gap: '2px' }}>
                        {/* Name input: h-52 */}
                        <div className="bg-[rgba(25,25,25,0.05)] rounded-tl-xl" style={{ padding: '0 20px', height: '52px', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={filter.name}
                            onChange={(e) => {
                              const updated = [...filters];
                              updated[i] = { ...updated[i], name: e.target.value };
                              setFilters(updated);
                            }}
                            className="bg-transparent border-none outline-none text-[16px] text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 w-full"
                            style={{ fontFamily: 'inherit' }}
                            placeholder="Название"
                          />
                        </div>
                        {/* Type dropdown */}
                        <div className="bg-[rgba(25,25,25,0.05)] rounded-bl-xl flex items-center justify-between" style={{ padding: '12px 20px' }}>
                          <span className="text-[16px] text-[#191919] leading-5 tracking-[0.16px]">{filter.type}</span>
                          <img src={`${base}assets/icon-chevron-down.svg`} alt="" className="w-3 h-3 opacity-60" />
                        </div>
                      </div>

                      {/* Description area: flex-1, full height */}
                      <div className="flex-1 min-w-0 bg-[rgba(25,25,25,0.05)] flex items-start" style={{ padding: '12px 20px' }}>
                        <input
                          type="text"
                          value={filter.description}
                          onChange={(e) => {
                            const updated = [...filters];
                            updated[i] = { ...updated[i], description: e.target.value };
                            setFilters(updated);
                          }}
                          className="bg-transparent border-none outline-none text-[16px] leading-5 tracking-[0.16px] p-0 m-0 w-full"
                          style={{ fontFamily: 'inherit', color: filter.description ? '#191919' : '#949494' }}
                          placeholder="Описание"
                        />
                      </div>

                      {/* Delete button: px-10, rounded-tr-12, rounded-br-12 */}
                      <button
                        onClick={() => handleRemoveFilter(i)}
                        className="bg-[rgba(25,25,25,0.05)] rounded-tr-xl rounded-br-xl flex items-center justify-center border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors shrink-0"
                        style={{ padding: '12px 10px' }}
                      >
                        <img src={`${base}assets/icon-cross.svg`} alt="Удалить" className="w-6 h-6" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer: h-90, py-20, centered */}
      <div className="flex items-center justify-center shrink-0 bg-[#f9f9f9]" style={{ height: '90px', padding: '20px 0' }}>
        <button
          onClick={handleSave}
          className="bg-[#835de1] text-white text-[18px] font-medium leading-[22px] border-none cursor-pointer hover:bg-[#7248d4] transition-colors"
          style={{ width: '335px', height: '50px', borderRadius: '10px' }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
