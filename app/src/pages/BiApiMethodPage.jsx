import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBiApiMethods, circles, holaspiritRoles, dwhRoles, accessLevels } from '../data/BiApiMethodsContext';

const statusStyles = {
  'Активен': { color: '#5cad9a', borderColor: '#5cad9a' },
  'На проверке': { color: '#949494', borderColor: '#949494' },
  'Отклонён': { color: '#d84d4d', borderColor: '#d84d4d' },
};

const tabs = ['Описание', 'Запросы', 'Роли и доступы', 'Статистика'];

// Парсинг SQL строки в токены для подсветки
const SQL_KEYWORDS = ['select', 'from', 'join', 'and', 'or', 'where', 'on', 'left', 'right', 'inner', 'outer', 'group', 'order', 'by', 'having', 'insert', 'update', 'delete', 'create', 'alter', 'drop', 'into', 'values', 'set', 'as', 'in', 'not', 'null', 'is', 'like', 'between', 'exists', 'case', 'when', 'then', 'else', 'end', 'union', 'all', 'distinct', 'limit', 'offset'];

function parseSqlToTokens(sqlString) {
  if (!sqlString) return [];
  const lines = sqlString.split('\n');
  return lines.map(line => {
    const tokens = [];
    const words = line.split(/(\s+)/);
    words.forEach(word => {
      if (/^\s+$/.test(word)) {
        tokens.push({ type: 'normal', text: word });
      } else if (SQL_KEYWORDS.includes(word.toLowerCase())) {
        tokens.push({ type: 'keyword', text: word });
      } else {
        tokens.push({ type: 'comment', text: word });
      }
    });
    return tokens;
  });
}

export default function BiApiMethodPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getMethod } = useBiApiMethods();
  const [activeTab, setActiveTab] = useState('Описание');

  const data = getMethod(id);

  // Состояния для таба «Запросы»
  const [selectedLayer, setSelectedLayer] = useState('Production');
  const [selectedTeam, setSelectedTeam] = useState('TEST_TEAM');
  const [selectedLang, setSelectedLang] = useState('Python');
  const [openDropdown, setOpenDropdown] = useState(null); // 'layer' | 'team' | 'lang' | null

  const layerOptions = ['Production', 'Pre-production', 'Stage'];
  const teamOptions = ['TEST_TEAM', 'DEV_TEAM', 'DATA_TEAM'];
  const langOptions = ['Python', 'Java', 'JavaScript', 'Go'];

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f9f9f9]">
        <p className="text-lg text-[#949494]">Метод не найден</p>
      </div>
    );
  }

  const status = statusStyles[data.status] || statusStyles['На проверке'];

  // Генерация кода для разных языков
  const methodName = data.name || 'method';
  const layerLower = selectedLayer.toLowerCase();

  const tokenCodeByLang = {
    Python: `import requests

url = "https://api.tochka.com/auth/token"
payload = {
    "grant_type": "client_credentials",
    "client_id": "${methodName}",
    "client_secret": "YOUR_SECRET"
}
response = requests.post(url, json=payload)
token = response.json()["access_token"]`,
    Java: `import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
String body = "{\\"grant_type\\":\\"client_credentials\\","
    + "\\"client_id\\":\\"${methodName}\\","
    + "\\"client_secret\\":\\"YOUR_SECRET\\"}";
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.tochka.com/auth/token"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();
HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());`,
    JavaScript: `const response = await fetch(
  "https://api.tochka.com/auth/token",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: "${methodName}",
      client_secret: "YOUR_SECRET",
    }),
  }
);
const { access_token: token } = await response.json();`,
    Go: `package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

payload, _ := json.Marshal(map[string]string{
    "grant_type":    "client_credentials",
    "client_id":     "${methodName}",
    "client_secret": "YOUR_SECRET",
})
resp, _ := http.Post(
    "https://api.tochka.com/auth/token",
    "application/json",
    bytes.NewBuffer(payload),
)`,
  };

  const methodCallCodeByLang = {
    Python: `import requests

url = "https://api.tochka.com/bi/${layerLower}/${methodName}"
headers = {
    "Authorization": f"Bearer {'{token}'}",
    "Content-Type": "application/json"
}
params = { "inn": "1234567890" }
response = requests.get(url, headers=headers, params=params)
data = response.json()`,
    Java: `HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.tochka.com/bi/${layerLower}/${methodName}?inn=1234567890"))
    .header("Authorization", "Bearer " + token)
    .header("Content-Type", "application/json")
    .GET()
    .build();
HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());`,
    JavaScript: `const response = await fetch(
  "https://api.tochka.com/bi/${layerLower}/${methodName}?inn=1234567890",
  {
    headers: {
      Authorization: \`Bearer \${'{token}'}\`,
      "Content-Type": "application/json",
    },
  }
);
const data = await response.json();`,
    Go: `req, _ := http.NewRequest("GET",
    "https://api.tochka.com/bi/${layerLower}/${methodName}?inn=1234567890", nil)
req.Header.Set("Authorization", "Bearer "+token)
req.Header.Set("Content-Type", "application/json")
resp, _ := http.DefaultClient.Do(req)`,
  };

  const tokenCode = tokenCodeByLang[selectedLang] || tokenCodeByLang['Python'];
  const methodCallCode = methodCallCodeByLang[selectedLang] || methodCallCodeByLang['Python'];

  // Подсветка кода — ключевые слова по языку
  const KEYWORDS_BY_LANG = {
    Python: ['import', 'from', 'def', 'return', 'if', 'else', 'for', 'in', 'class', 'try', 'except', 'with', 'as', 'True', 'False', 'None'],
    Java: ['import', 'public', 'private', 'static', 'final', 'class', 'new', 'return', 'void', 'String', 'int', 'var'],
    JavaScript: ['const', 'let', 'var', 'async', 'await', 'function', 'return', 'import', 'from', 'export', 'default', 'new', 'true', 'false', 'null'],
    Go: ['package', 'import', 'func', 'var', 'return', 'if', 'else', 'for', 'range', 'nil', 'true', 'false', 'defer'],
  };

  function parseCodeToTokens(code, lang) {
    if (!code) return [];
    const keywords = KEYWORDS_BY_LANG[lang] || KEYWORDS_BY_LANG['Python'];
    return code.split('\n').map(line => {
      const tokens = [];
      const words = line.split(/(\s+|"[^"]*"|'[^']*'|`[^`]*`|f"[^"]*")/);
      words.forEach(word => {
        if (/^\s+$/.test(word)) {
          tokens.push({ type: 'normal', text: word });
        } else if (keywords.includes(word)) {
          tokens.push({ type: 'keyword', text: word });
        } else {
          tokens.push({ type: 'comment', text: word });
        }
      });
      return tokens;
    });
  }

  const tokenCodeLines = parseCodeToTokens(tokenCode, selectedLang);
  const methodCallLines = parseCodeToTokens(methodCallCode, selectedLang);

  // Компонент Dropdown
  const DropdownSelect = ({ label, value, options, isOpen, onToggle, onChange }) => {
    const ref = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
          if (isOpen) onToggle();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
      <div ref={ref} className="flex-1 min-w-0 relative">
        <button
          onClick={onToggle}
          className="w-full bg-[rgba(25,25,25,0.05)] rounded-xl px-5 py-3 border-none cursor-pointer flex items-center text-left"
          style={{ fontFamily: 'inherit' }}
        >
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
              {label}
            </span>
            <span className="text-base text-[#191919] leading-5 tracking-[0.16px] overflow-hidden text-ellipsis whitespace-nowrap">
              {value}
            </span>
          </div>
          <div className="shrink-0 pl-4 flex items-center">
            <img
              src={`${import.meta.env.BASE_URL}assets/icon-chevron-down.svg`}
              alt=""
              className="w-3"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </div>
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-[0px_4px_16px_rgba(0,0,0,0.1)] z-10 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                className={`w-full text-left px-5 py-3 border-none cursor-pointer text-base leading-5 tracking-[0.16px] hover:bg-[rgba(25,25,25,0.05)] transition-colors ${
                  opt === value ? 'font-medium text-[#191919] bg-[rgba(25,25,25,0.03)]' : 'font-normal text-[#676767] bg-transparent'
                }`}
                style={{ fontFamily: 'inherit' }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Форматируем SQL с подсветкой
  const sqlLines = typeof data.sql === 'string' ? parseSqlToTokens(data.sql) : (() => {
    const lines = [];
    let currentLine = [];
    data.sql.forEach((token) => {
      if (token.type === 'keyword' && currentLine.length > 0) {
        lines.push([...currentLine]);
        currentLine = [];
      }
      currentLine.push(token);
      if (token.type === 'comment') {
        lines.push([...currentLine]);
        currentLine = [];
      }
    });
    if (currentLine.length > 0) lines.push(currentLine);
    return lines;
  })();

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
          {data.status === 'На проверке' && (
            <button
              onClick={() => navigate(`/api/${id}/moderate`)}
              className="flex items-center gap-2 h-10 px-3 rounded-lg border-[1.4px] border-[#835de1] bg-transparent cursor-pointer hover:bg-[rgba(131,93,225,0.05)] transition-colors"
            >
              <span className="text-sm font-medium text-[#835de1] leading-[18px] tracking-[0.14px] whitespace-nowrap">
                Модерация
              </span>
            </button>
          )}
          <button
            onClick={() => navigate(`/api/${id}/edit`)}
            className="flex items-center gap-2 h-10 px-3 rounded-lg bg-[#191919] border-none cursor-pointer hover:bg-[#333] transition-colors"
          >
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

          {/* ===== Таб «Запросы» ===== */}
          {activeTab === 'Запросы' && (
            <>
              {/* Параметры */}
              <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-5">
                <h2 className="text-lg font-medium text-[#191919] leading-[22px] py-3 m-0">
                  Параметры
                </h2>
                <div className="flex gap-4">
                  {/* Dropdown: Слой */}
                  <DropdownSelect
                    label="Слой"
                    value={selectedLayer}
                    options={layerOptions}
                    isOpen={openDropdown === 'layer'}
                    onToggle={() => setOpenDropdown(openDropdown === 'layer' ? null : 'layer')}
                    onChange={(v) => { setSelectedLayer(v); setOpenDropdown(null); }}
                  />
                  {/* Dropdown: Команда */}
                  <DropdownSelect
                    label="Команда"
                    value={selectedTeam}
                    options={teamOptions}
                    isOpen={openDropdown === 'team'}
                    onToggle={() => setOpenDropdown(openDropdown === 'team' ? null : 'team')}
                    onChange={(v) => { setSelectedTeam(v); setOpenDropdown(null); }}
                  />
                  {/* Dropdown: Язык */}
                  <DropdownSelect
                    label="Язык"
                    value={selectedLang}
                    options={langOptions}
                    isOpen={openDropdown === 'lang'}
                    onToggle={() => setOpenDropdown(openDropdown === 'lang' ? null : 'lang')}
                    onChange={(v) => { setSelectedLang(v); setOpenDropdown(null); }}
                  />
                </div>
              </div>

              {/* Получение токена */}
              <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 pt-5 pb-10">
                <div className="flex items-center justify-between py-3">
                  <h2 className="text-lg font-medium text-[#191919] leading-[22px] m-0">
                    Получение токена
                  </h2>
                  <button
                    onClick={() => navigator.clipboard?.writeText(tokenCode)}
                    className="flex items-center justify-center w-6 h-6 bg-transparent border-none cursor-pointer p-0 opacity-60 hover:opacity-100 transition-opacity"
                    title="Копировать"
                  >
                    <img src={`${import.meta.env.BASE_URL}assets/icon-copy.svg`} alt="Копировать" className="w-5 h-5" />
                  </button>
                </div>
                <div className="border border-[rgba(25,25,25,0.1)] rounded-xl p-4">
                  <pre className="text-base leading-5 tracking-[0.16px] m-0 font-[inherit] whitespace-pre-wrap">
                    {tokenCodeLines.map((line, i) => (
                      <div key={i} className="mb-2.5 last:mb-0">
                        {line.map((token, j) => (
                          <span
                            key={j}
                            className={
                              token.type === 'keyword' ? 'text-[#835de1]'
                                : token.type === 'comment' ? 'text-[#676767]'
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

              {/* Вызов метода */}
              <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 pt-5 pb-10">
                <div className="flex items-center justify-between py-3">
                  <h2 className="text-lg font-medium text-[#191919] leading-[22px] m-0">
                    Вызов метода
                  </h2>
                  <button
                    onClick={() => navigator.clipboard?.writeText(methodCallCode)}
                    className="flex items-center justify-center w-6 h-6 bg-transparent border-none cursor-pointer p-0 opacity-60 hover:opacity-100 transition-opacity"
                    title="Копировать"
                  >
                    <img src={`${import.meta.env.BASE_URL}assets/icon-copy.svg`} alt="Копировать" className="w-5 h-5" />
                  </button>
                </div>
                <div className="border border-[rgba(25,25,25,0.1)] rounded-xl p-4">
                  <pre className="text-base leading-5 tracking-[0.16px] m-0 font-[inherit] whitespace-pre-wrap">
                    {methodCallLines.map((line, i) => (
                      <div key={i} className="mb-2.5 last:mb-0">
                        {line.map((token, j) => (
                          <span
                            key={j}
                            className={
                              token.type === 'keyword' ? 'text-[#835de1]'
                                : token.type === 'comment' ? 'text-[#676767]'
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
            </>
          )}

          {/* ===== Таб «Описание» ===== */}
          {activeTab === 'Описание' && (<>
          {/* Описание документа */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-5">
            <h2 className="text-lg font-medium text-[#191919] leading-[22px] py-3 m-0">
              Описание документа
            </h2>
            <div className="flex flex-col">
              {data.description && (
              <div className="py-3">
                <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Общее описание</p>
                <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.description}</p>
              </div>
              )}
              {data.detailedInfo && (
              <div className="py-3">
                <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Подробная информация</p>
                <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.detailedInfo}</p>
              </div>
              )}
              {data.needsPagination && (
              <div className="py-3">
                <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Нужна пагинация?</p>
                <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.needsPagination}</p>
              </div>
              )}
              {data.recordsPerRequest && (
              <div className="py-3">
                <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Количество записей за один запрос</p>
                <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.recordsPerRequest}</p>
              </div>
              )}
            </div>
          </div>

          {/* SQL */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 pt-5 pb-10">
            <h2 className="text-lg font-medium text-[#191919] leading-[22px] py-3 m-0">
              SQL
            </h2>
            <div className="border border-[rgba(25,25,25,0.1)] rounded-xl p-5 mt-1.5">
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
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] pt-5 pb-10 px-10">
            <h2 className="text-lg font-medium text-[#191919] leading-[22px] py-3 m-0">
              Поля
            </h2>
            <div className="flex flex-col gap-0.5">
              {data.fields.map((field, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className="w-[250px] py-3">
                    <p className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px] m-0">{field.name}</p>
                    <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] mt-0.5 m-0">{field.type}{field.length ? ` (${field.length})` : ''}</p>
                  </div>
                  <div className="flex-1 py-2">
                    <p className="text-base text-[#191919] leading-[22px] tracking-[0.16px] m-0">{field.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Фильтры */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] pt-5 pb-10 px-10">
            <h2 className="text-lg font-medium text-[#191919] leading-[22px] py-3 m-0">
              Фильтры
            </h2>
            <div className="flex flex-col gap-0.5">
              {data.filters.map((filter, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className="w-[250px] py-3">
                    <p className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px] m-0">{filter.name}</p>
                    <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] mt-0.5 m-0">{filter.type}</p>
                  </div>
                  <div className="flex-1 py-2">
                    <p className="text-base text-[#191919] leading-[22px] tracking-[0.16px] m-0">{filter.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>)}

          {/* ===== Таб «Роли и доступы» ===== */}
          {activeTab === 'Роли и доступы' && (() => {
            const rules = data.accessRules || [];
            const grouped = accessLevels.map(level => ({
              ...level,
              rules: rules.filter(r => r.level === level.id),
            }));
            const getRoleName = (roleId, roleType) => {
              if (!roleId) return null;
              if (roleType === 'dwh') return dwhRoles.find(r => r.id === roleId)?.name;
              return holaspiritRoles.find(r => r.id === roleId)?.name;
            };
            const getCircleName = (circleId) => circleId ? circles.find(c => c.id === circleId)?.name : null;
            const getRoleTypeLabel = (roleType) => roleType === 'dwh' ? 'DWH Роль' : 'Holaspirit Роль';

            return (
              <>
                <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-8">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium text-[#191919] leading-[22px] m-0">Матрица доступов</h2>
                    <span className="text-xs text-[#676767]">{rules.length} {rules.length === 1 ? 'правило' : rules.length < 5 ? 'правила' : 'правил'}</span>
                  </div>
                  <p className="text-sm text-[#676767] leading-[18px] m-0 mb-6">
                    Каждое правило определяет, кто получает доступ. Круг <span className="font-medium text-[#191919]">+</span> Роль означает «И» — нужно быть в этом круге <em>и</em> иметь эту роль. Несколько правил одного уровня работают по принципу «ИЛИ».
                  </p>

                  <div className="flex flex-col gap-6">
                    {grouped.map(level => (
                      <div key={level.id}>
                        {/* Level header */}
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: level.color }} />
                          <span className="text-base font-semibold text-[#191919] leading-5">{level.label}</span>
                          <span className="text-xs text-[#949494] ml-1">{level.rules.length} {level.rules.length === 1 ? 'правило' : level.rules.length < 5 ? 'правила' : 'правил'}</span>
                        </div>

                        {level.rules.length === 0 ? (
                          <div className="pl-5 py-3">
                            <span className="text-sm text-[#949494] italic">Нет правил доступа</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 pl-5">
                            {level.rules.map((rule, ri) => {
                              const cond = rule.conditions[0];
                              const circleName = getCircleName(cond.circleId);
                              const roleName = getRoleName(cond.roleId, cond.roleType);
                              const isAndCondition = circleName && roleName;
                              const roleTypeLabel = cond.roleType ? getRoleTypeLabel(cond.roleType) : null;

                              return (
                                <div key={rule.id} className="flex items-center gap-2 flex-wrap">
                                  {ri > 0 && (
                                    <span className="text-xs font-semibold text-[#949494] uppercase tracking-wider w-8 text-center shrink-0">или</span>
                                  )}
                                  {ri === 0 && level.rules.length > 1 && <div className="w-8 shrink-0" />}
                                  
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {circleName && (
                                      <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[rgba(25,25,25,0.06)] text-sm">
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                                          <circle cx="7" cy="7" r="5.5" stroke="#676767" strokeWidth="1.2"/>
                                          <circle cx="7" cy="7" r="2" fill="#676767"/>
                                        </svg>
                                        <span className="font-medium text-[#191919]">{circleName}</span>
                                      </span>
                                    )}
                                    {isAndCondition && (
                                      <span className="text-xs font-bold text-[#835de1] mx-0.5">+</span>
                                    )}
                                    {roleName && (
                                      <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm" style={{ backgroundColor: cond.roleType === 'dwh' ? 'rgba(131,93,225,0.08)' : 'rgba(92,173,154,0.1)' }}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                                          <path d="M7 2C8.1 2 9 2.9 9 4C9 5.1 8.1 6 7 6C5.9 6 5 5.1 5 4C5 2.9 5.9 2 7 2Z" stroke={cond.roleType === 'dwh' ? '#835de1' : '#5cad9a'} strokeWidth="1.2"/>
                                          <path d="M3 11.5C3 9.3 4.8 7.5 7 7.5C9.2 7.5 11 9.3 11 11.5" stroke={cond.roleType === 'dwh' ? '#835de1' : '#5cad9a'} strokeWidth="1.2" strokeLinecap="round"/>
                                        </svg>
                                        <span className="font-medium" style={{ color: cond.roleType === 'dwh' ? '#835de1' : '#5cad9a' }}>{roleName}</span>
                                      </span>
                                    )}
                                    {!circleName && roleName && (
                                      <span className="text-xs text-[#949494] ml-1">в любом круге</span>
                                    )}
                                    {circleName && !roleName && (
                                      <span className="text-xs text-[#949494] ml-1">все роли</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Легенда */}
                <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-6">
                  <h3 className="text-sm font-medium text-[#676767] m-0 mb-3">Как читать правила</h3>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2.5 h-7 rounded-md bg-[rgba(25,25,25,0.06)] text-xs font-medium text-[#191919]">Круг</span>
                        <span className="text-xs font-bold text-[#835de1]">+</span>
                        <span className="inline-flex items-center px-2.5 h-7 rounded-md bg-[rgba(92,173,154,0.1)] text-xs font-medium text-[#5cad9a]">Роль</span>
                      </div>
                      <span className="text-sm text-[#676767]">— нужно быть <strong>в круге</strong> и <strong>иметь роль</strong> одновременно (И)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2.5 h-7 rounded-md bg-[rgba(131,93,225,0.08)] text-xs font-medium text-[#835de1]">DWH Роль</span>
                        <span className="text-xs text-[#949494]">в любом круге</span>
                      </div>
                      <span className="text-sm text-[#676767]">— достаточно <strong>только роли</strong>, круг не важен</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2.5 h-7 rounded-md bg-[rgba(25,25,25,0.06)] text-xs font-medium text-[#191919]">Круг</span>
                        <span className="text-xs text-[#949494]">все роли</span>
                      </div>
                      <span className="text-sm text-[#676767]">— достаточно быть <strong>в круге</strong>, роль не важна</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#949494] uppercase tracking-wider">или</span>
                      <span className="text-sm text-[#676767]">— между правилами одного уровня: подходит <strong>любое</strong> из условий</span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          {/* Таб «Статистика» — заглушка */}
          {activeTab === 'Статистика' && (
            <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-10 flex items-center justify-center">
              <p className="text-base text-[#949494]">Статистика пока недоступна</p>
            </div>
          )}
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
