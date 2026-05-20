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

  return (
    <div className="flex-1 flex flex-col bg-[#f9f9f9] overflow-y-auto">
      {/* Header */}
      <header className="flex items-center gap-4 px-8 py-6">
        <button
          onClick={() => navigate(`/api/${id}`)}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors shrink-0"
        >
          <img src={`${import.meta.env.BASE_URL}assets/icon-arrow-left.svg`} alt="Назад" className="w-5 h-5" />
        </button>
        <h1 className="text-[30px] font-semibold text-[#191919] leading-9 tracking-[-0.3px] m-0">
          Редактирование
        </h1>
      </header>

      {/* Content — centered 640px column */}
      <div className="flex-1 flex flex-col items-center pb-0">
        <div className="w-[640px] flex flex-col gap-3.5">

          {/* Описание документа */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] flex flex-col">
            <div className="px-10 py-5 flex flex-col gap-1.5">
              <h2 className="text-lg font-medium text-[#191919] leading-[22px] py-3 m-0">
                Описание документа
              </h2>

              {/* Название метода */}
              <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 flex flex-col">
                <div className="flex flex-col gap-2 py-3">
                  <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                    Название метода
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-none outline-none text-base text-[#949494] leading-5 tracking-[0.16px] p-0 m-0 w-full"
                    style={{ fontFamily: 'inherit' }}
                    placeholder="new_method"
                  />
                </div>
                <div className="flex flex-col gap-2 pb-3">
                  <div className="h-[0.5px] bg-[rgba(25,25,25,0.2)]" />
                  <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">
                    Латинские буквы и знак подчеркивания, больше 6 символов
                  </span>
                </div>
              </div>

              {/* Краткое описание */}
              <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5">
                <div className="flex flex-col gap-2 py-3">
                  <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                    Краткое описание
                  </span>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-transparent border-none outline-none text-base text-[#949494] leading-5 tracking-[0.16px] p-0 m-0 w-full"
                    style={{ fontFamily: 'inherit' }}
                    placeholder="Пример краткого описания"
                  />
                </div>
              </div>

              {/* Подробная информация */}
              <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5">
                <div className="flex flex-col gap-2 py-3">
                  <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                    Подробная информация о методу
                  </span>
                  <input
                    type="text"
                    value={detailedInfo}
                    onChange={(e) => setDetailedInfo(e.target.value)}
                    className="bg-transparent border-none outline-none text-base text-[#949494] leading-5 tracking-[0.16px] p-0 m-0 w-full"
                    style={{ fontFamily: 'inherit' }}
                    placeholder="Какие нюансы есть у метода"
                  />
                </div>
              </div>

              {/* SQL запрос */}
              <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5">
                <div className="flex items-center justify-between py-3">
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                      SQL запрос
                    </span>
                    <span className="text-base text-[#949494] leading-5 tracking-[0.16px]">
                      {sql ? 'Добавьте SQL запрос' : 'Добавьте SQL запрос'}
                    </span>
                  </div>
                  <div className="pl-4 flex items-center">
                    <img src={`${import.meta.env.BASE_URL}assets/icon-pencil-edit.svg`} alt="" className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Командная тех. учетка */}
              <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5">
                <div className="flex items-center justify-between py-3">
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                      Командная тех. учетка
                    </span>
                    <span className="text-base text-[#191919] leading-5 tracking-[0.16px]">
                      {techAccount}
                    </span>
                  </div>
                  <div className="pl-4 flex items-center">
                    <img src={`${import.meta.env.BASE_URL}assets/icon-chevron-down.svg`} alt="" className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SQL */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] flex flex-col">
            <div className="px-10 py-5">
              <h2 className="text-lg font-medium text-[#191919] leading-[22px] py-3 m-0">
                SQL
              </h2>
              <div className="mt-3 relative">
                <div className="rounded-xl overflow-hidden">
                  <div className="px-5 pt-3 pb-3">
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
                      style={{ minHeight: '260px', overflow: 'hidden', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      className="w-full bg-transparent border-none outline-none resize-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 block"
                      placeholder="Введите SQL запрос..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Поля (таблица) */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)]">
            <div className="pt-2.5 pb-5">
              <div className="px-10">
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
                {fields.map((field, i) => (
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
          </div>

          {/* Фильтры */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] flex flex-col">
            <div className="px-10 py-5">
              <h2 className="text-lg font-medium text-[#191919] leading-[22px] py-3 m-0">
                Фильтры
              </h2>
              <div className="flex flex-col gap-4 mt-3">
                {filters.map((filter, i) => (
                  <div key={i} className="flex gap-0.5 items-stretch">
                    {/* Левая колонка: имя + тип */}
                    <div className="w-[300px] flex flex-col gap-0.5">
                      <div className="bg-[rgba(25,25,25,0.05)] rounded-tl-xl px-5 py-3">
                        <input
                          type="text"
                          value={filter.name}
                          onChange={(e) => {
                            const updated = [...filters];
                            updated[i] = { ...updated[i], name: e.target.value };
                            setFilters(updated);
                          }}
                          className="bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 w-full"
                          style={{ fontFamily: 'inherit' }}
                          placeholder="Название"
                        />
                      </div>
                      <div className="bg-[rgba(25,25,25,0.05)] rounded-bl-xl px-5 py-3 flex items-center justify-between">
                        <span className="text-base text-[#191919] leading-5 tracking-[0.16px]">{filter.type}</span>
                        <img src={`${import.meta.env.BASE_URL}assets/icon-chevron-down.svg`} alt="" className="w-3 h-3 opacity-60" />
                      </div>
                    </div>
                    {/* Правая колонка: описание */}
                    <div className="flex-1 bg-[rgba(25,25,25,0.05)] px-5 py-3 flex items-start">
                      <input
                        type="text"
                        value={filter.description}
                        onChange={(e) => {
                          const updated = [...filters];
                          updated[i] = { ...updated[i], description: e.target.value };
                          setFilters(updated);
                        }}
                        className="bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 w-full"
                        style={{ fontFamily: 'inherit' }}
                        placeholder="Описание"
                      />
                    </div>
                    {/* Кнопка удалить (крестик) */}
                    <button
                      onClick={() => handleRemoveFilter(i)}
                      className="bg-[rgba(25,25,25,0.05)] rounded-tr-xl rounded-br-xl px-2.5 flex items-center justify-center border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors"
                    >
                      <img src={`${import.meta.env.BASE_URL}assets/icon-cross.svg`} alt="Удалить" className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center py-5 bg-[#f9f9f9] shrink-0">
        <button
          onClick={handleSave}
          className="w-[335px] h-[50px] bg-[#835de1] text-white text-lg font-medium leading-[22px] rounded-[10px] border-none cursor-pointer hover:bg-[#7248d4] transition-colors"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
