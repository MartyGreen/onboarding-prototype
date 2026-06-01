import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAlert } from '../components/SuccessAlert';
import { useBiApiMethods } from '../data/BiApiMethodsContext';

export default function ModerateBiApiMethodPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert } = useAlert();
  const { getMethod, updateMethod } = useBiApiMethods();

  const data = getMethod(id);

  const [moderationComment, setModerationComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const base = import.meta.env.BASE_URL;

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f9f9f9]">
        <p className="text-lg text-[#949494]">Метод не найден</p>
      </div>
    );
  }

  const handleApprove = () => {
    updateMethod(id, {
      status: 'Активен',
      moderationComment: moderationComment.trim() || undefined,
    });
    showAlert('Метод одобрен');
    navigate(`/api/${id}`);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return;
    }
    updateMethod(id, {
      status: 'Отклонён',
      moderationComment: moderationComment.trim() || undefined,
      rejectionReason: rejectionReason.trim(),
    });
    showAlert('Метод отклонён');
    navigate(`/api/${id}`);
  };

  // SQL подсветка
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

  const sqlLines = typeof data.sql === 'string' ? parseSqlToTokens(data.sql) : [];

  return (
    <div className="flex-1 flex flex-col bg-[#f9f9f9] overflow-y-auto">
      {/* Main content area */}
      <div className="flex flex-col gap-8 items-center pt-6 pb-6 px-8 flex-1">

        {/* Title: w=640, gap=16, items-center */}
        <div style={{ width: 640 }} className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/api/${id}`)}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors shrink-0"
          >
            <img src={`${base}assets/icon-arrow-left.svg`} alt="Назад" className="w-5 h-5" />
          </button>
          <h1 className="text-[30px] font-semibold text-[#191919] leading-9 tracking-[-0.3px] m-0">
            Модерация
          </h1>
        </div>

        {/* Content: w=640 */}
        <div style={{ width: 640 }} className="flex flex-col gap-3.5">

          {/* Card 1: Описание документа */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-5">
            <div className="flex flex-col gap-1.5">
              {/* Заголовок секции */}
              <div className="flex items-center py-3">
                <span className="text-lg font-medium text-[#191919] leading-[22px]">
                  Описание документа
                </span>
              </div>

              {/* Информация о методе (read-only) */}
              <div className="flex flex-col gap-3">
                {/* Название метода */}
                <div className="py-2">
                  <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Название метода</p>
                  <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0 font-medium">{data.name}</p>
                </div>

                {/* Краткое описание */}
                {data.description && (
                  <div className="py-2">
                    <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Краткое описание</p>
                    <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.description}</p>
                  </div>
                )}

                {/* Подробная информация */}
                {data.detailedInfo && (
                  <div className="py-2">
                    <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Подробная информация</p>
                    <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.detailedInfo}</p>
                  </div>
                )}

                {/* Автор */}
                <div className="py-2">
                  <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Автор</p>
                  <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0 font-medium">{data.author}</p>
                </div>

                {/* Тех. учётка */}
                <div className="py-2">
                  <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Командная тех. учетка</p>
                  <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.techAccount || 'TEST_TEAM'}</p>
                </div>

                {/* Пагинация */}
                <div className="py-2">
                  <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Нужна пагинация?</p>
                  <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.needsPagination || 'Нет'}</p>
                </div>

                {data.needsPagination === 'Да' && data.recordsPerRequest && (
                  <div className="py-2">
                    <p className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] m-0">Количество записей за один запрос</p>
                    <p className="text-base text-[#191919] leading-5 tracking-[0.16px] mt-0.5 m-0">{data.recordsPerRequest}</p>
                  </div>
                )}
              </div>

              {/* Комментарий модератора — Text Area */}
              <div className="mt-4">
                <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 overflow-hidden">
                  <div className="flex flex-col gap-2 py-3">
                    <div className="flex items-center h-5">
                      <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                        Комментарий
                      </span>
                    </div>
                    <textarea
                      value={moderationComment}
                      onChange={(e) => {
                        setModerationComment(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                      placeholder="Оставьте комментарий к методу"
                      rows={2}
                      className="bg-transparent border-none outline-none resize-none overflow-hidden text-base leading-5 tracking-[0.16px] p-0 m-0 w-full"
                      style={{
                        color: moderationComment ? '#191919' : '#949494',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 pb-3">
                    <div className="flex items-end justify-end h-0.5">
                      <div className="flex-1 h-px bg-[rgba(25,25,25,0.2)]" />
                    </div>
                    <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">
                      Необязательно
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: SQL */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-5">
            <div className="flex flex-col gap-1.5">
              {/* Заголовок */}
              <div className="flex items-center py-3">
                <span className="text-lg font-medium text-[#191919] leading-[22px]">
                  SQL
                </span>
              </div>

              {/* SQL content — read-only */}
              {data.sql ? (
                <div className="border border-[rgba(25,25,25,0.1)] rounded-xl p-5">
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
              ) : (
                <p className="text-sm text-[#949494] leading-[18px] m-0 py-2">
                  SQL запрос не указан
                </p>
              )}

              {/* Причина отклонения — Text Area */}
              <div className="mt-4">
                <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 overflow-hidden">
                  <div className="flex flex-col gap-2 py-3">
                    <div className="flex items-center h-5 gap-0.5">
                      <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                        Причина отклонения
                      </span>
                    </div>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                      placeholder="Укажите причину, если отклоняете метод"
                      rows={3}
                      className="bg-transparent border-none outline-none resize-none overflow-hidden text-base leading-5 tracking-[0.16px] p-0 m-0 w-full"
                      style={{
                        color: rejectionReason ? '#191919' : '#949494',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 pb-3">
                    <div className="flex items-end justify-end h-0.5">
                      <div className="flex-1 h-px bg-[rgba(25,25,25,0.2)]" />
                    </div>
                    <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">
                      Обязательно при отклонении
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Поля — read-only */}
          {data.fields && data.fields.length > 0 && (
            <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] pt-5 pb-10 px-10">
              <div className="flex items-center py-3">
                <span className="text-lg font-medium text-[#191919] leading-[22px]">
                  Поля
                </span>
              </div>
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
          )}

          {/* Фильтры — read-only */}
          {data.filters && data.filters.length > 0 && (
            <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] pt-5 pb-10 px-10">
              <div className="flex items-center py-3">
                <span className="text-lg font-medium text-[#191919] leading-[22px]">
                  Фильтры
                </span>
              </div>
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
          )}

        </div>
      </div>

      {/* Footer: sticky, h=90, кнопки Одобрить / Отклонить */}
      <div className="flex items-center justify-center gap-4 h-[90px] px-8 bg-[#f9f9f9] shrink-0 sticky bottom-0 z-10">
        <button
          onClick={handleReject}
          disabled={!rejectionReason.trim()}
          className="h-[50px] px-8 rounded-[10px] border-[1.4px] border-[#d84d4d] bg-transparent cursor-pointer transition-colors hover:bg-[rgba(216,77,77,0.05)] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: 'inherit' }}
        >
          <span className="text-lg font-medium text-[#d84d4d] leading-[22px] whitespace-nowrap">
            Отклонить
          </span>
        </button>
        <button
          onClick={handleApprove}
          className="h-[50px] px-8 rounded-[10px] bg-[#835de1] border-none cursor-pointer transition-colors hover:bg-[#7350cc]"
          style={{ fontFamily: 'inherit' }}
        >
          <span className="text-lg font-medium text-white leading-[22px] whitespace-nowrap">
            Одобрить
          </span>
        </button>
      </div>
    </div>
  );
}
