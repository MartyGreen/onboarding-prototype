import React, { createContext, useContext, useState } from 'react';

const initialMethods = [
  {
    id: 1,
    name: 'get_salary_payments',
    description: 'Получение платежей физ. лицам в рамках зарплатных проектов',
    detailedInfo: '',
    author: 'zhenikhov',
    status: 'На проверке',
    avatarColor: '#F2C94C',
    needsPagination: 'Да',
    recordsPerRequest: '10 000',
    created: '3 дня назад',
    updated: 'минуту назад',
    techAccount: 'TEST_TEAM',
    sql: `select    cl.client_inn,
                 customer_code,
                 atr.tid
from       stage.acquiring_terminals atr
join         stage.acquiring_contracts ac on atr.contract_id = ac.id
and         ac.status = 'EKV_REG_1'
join         datamart.client_life cl on cl.client_code = ac.customer_code
and         cl.last_life_flag = 1
where    cl.client_inn = :inn`,
    fields: [
      { name: 'CLIENT_INN', type: 'VARCHAR2', length: '12', description: 'ИНН клиента' },
      { name: 'CUSTOMER_CODE', type: 'VARCHAR2', length: '20', description: 'Код клиента в системе' },
      { name: 'TID', type: 'NUMBER', length: '22', description: 'Идентификатор активного терминала торгового эквайринга' },
    ],
    filters: [
      { name: 'inn', type: 'VARCHAR2', description: 'ИНН клиента для поиска терминалов' },
    ],
  },
  {
    id: 2,
    name: 'get_flexible_access_permissions_changelog',
    description: 'Запрос логов о выдаче/изъятии доступов уполномоченных лиц к счетам',
    detailedInfo: '',
    author: 'sokol',
    status: 'Одобрен',
    avatarColor: '#7AC6B2',
    needsPagination: 'Нет',
    recordsPerRequest: '10 000',
    created: '5 дней назад',
    updated: '2 часа назад',
    techAccount: 'TEST_TEAM',
    sql: '',
    fields: [],
    filters: [],
  },
  {
    id: 3,
    name: 'get_authorized_phone',
    description: 'Запрос логов о выдаче/изъятии доступов уполномоченных лиц к счетам',
    detailedInfo: '',
    author: 'ivanov',
    status: 'Одобрен',
    avatarColor: '#835DE1',
    needsPagination: 'Нет',
    recordsPerRequest: '10 000',
    created: '7 дней назад',
    updated: 'вчера',
    techAccount: 'TEST_TEAM',
    sql: '',
    fields: [],
    filters: [],
  },
  {
    id: 4,
    name: 'get_authorized_phone',
    description: 'Запрос логов о выдаче/изъятии доступов уполномоченных лиц к счетам',
    detailedInfo: '',
    author: 'petrov',
    status: 'На проверке',
    avatarColor: '#EB5757',
    needsPagination: 'Нет',
    recordsPerRequest: '10 000',
    created: '10 дней назад',
    updated: '3 дня назад',
    techAccount: 'TEST_TEAM',
    sql: '',
    fields: [],
    filters: [],
  },
  {
    id: 5,
    name: 'get_authorized_phone',
    description: 'Запрос логов о выдаче/изъятии доступов уполномоченных лиц к счетам',
    detailedInfo: '',
    author: 'sidorova',
    status: 'На проверке',
    avatarColor: '#56CCF2',
    needsPagination: 'Нет',
    recordsPerRequest: '10 000',
    created: '2 недели назад',
    updated: 'неделю назад',
    techAccount: 'TEST_TEAM',
    sql: '',
    fields: [],
    filters: [],
  },
  {
    id: 6,
    name: 'get_authorized_phone',
    description: 'Запрос логов о выдаче/изъятии доступов уполномоченных лиц к счетам',
    detailedInfo: '',
    author: 'kuznetsov',
    status: 'Отклонён',
    avatarColor: '#F2994A',
    needsPagination: 'Нет',
    recordsPerRequest: '10 000',
    created: '3 недели назад',
    updated: '2 недели назад',
    techAccount: 'TEST_TEAM',
    sql: '',
    fields: [],
    filters: [],
  },
];

const BiApiMethodsContext = createContext();

export function BiApiMethodsProvider({ children }) {
  const [methods, setMethods] = useState(initialMethods);

  const getMethod = (id) => methods.find(m => m.id === Number(id));

  const updateMethod = (id, updates) => {
    setMethods(prev => prev.map(m => m.id === Number(id) ? { ...m, ...updates } : m));
  };

  const addMethod = (data) => {
    const newId = Math.max(0, ...methods.map(m => m.id)) + 1;
    const now = new Date();
    const newMethod = {
      id: newId,
      name: data.name || 'new_method',
      description: data.description || '',
      detailedInfo: data.detailedInfo || '',
      author: 'current_user',
      status: 'На проверке',
      avatarColor: '#835DE1',
      needsPagination: data.needsPagination || 'Нет',
      recordsPerRequest: data.recordsPerRequest || '10 000',
      created: 'только что',
      updated: 'только что',
      techAccount: data.techAccount || 'TEST_TEAM',
      sql: data.sql || '',
      fields: data.fields || [],
      filters: data.filters || [],
    };
    setMethods(prev => [newMethod, ...prev]);
    return newId;
  };

  return (
    <BiApiMethodsContext.Provider value={{ methods, getMethod, updateMethod, addMethod }}>
      {children}
    </BiApiMethodsContext.Provider>
  );
}

export function useBiApiMethods() {
  const ctx = useContext(BiApiMethodsContext);
  if (!ctx) throw new Error('useBiApiMethods must be used within BiApiMethodsProvider');
  return ctx;
}
