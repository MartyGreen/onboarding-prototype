import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBiApiMethods } from '../data/BiApiMethodsContext';

const statusStyles = {
  'Активен': { color: '#5cad9a', borderColor: '#5cad9a' },
  'На проверке': { color: '#949494', borderColor: '#949494' },
  'Отклонён': { color: '#d84d4d', borderColor: '#d84d4d' },
};

const tabs = ['Описание', 'Запросы', 'Статистика'];

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
