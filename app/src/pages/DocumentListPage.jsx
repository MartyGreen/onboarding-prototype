import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../data/DocumentsContext';

// Иконки аватаров по статусам из Figma

// Черновик — Stroked 2px/Pencil
function PencilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20.1717 20.1709" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.8783 0.878373C13.0499 -0.292735 14.95 -0.292847 16.1215 0.878373L19.2934 4.04927C20.4646 5.22072 20.4644 7.1209 19.2934 8.29244L9.70742 17.8784C9.57939 18.0063 9.41816 18.0971 9.24258 18.1411L1.24258 20.1411C0.902115 20.2261 0.541675 20.1263 0.293361 19.8784C0.0452224 19.6301 -0.055335 19.2688 0.0296889 18.9282L2.02969 10.9282C2.07369 10.7527 2.16546 10.5913 2.29336 10.4633L11.8783 0.878373ZM3.90274 11.6821L2.37442 17.7963L8.48867 16.268L14.5863 10.1704L10.0004 5.5854L3.90274 11.6821ZM14.7074 2.29244C14.317 1.90228 13.6838 1.90242 13.2934 2.29244L11.4145 4.17037L16.0004 8.7563L17.8783 6.87837C18.2684 6.48786 18.2686 5.85374 17.8783 5.46333L14.7074 2.29244Z" fill="white"/>
    </svg>
  );
}

// Нужны правки — Stroked 2px/Document List Acs Cross
function DocCrossIcon() {
  return (
    <svg width="19" height="21" viewBox="0 0 19.0004 21.0004" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.2793 14.3066C17.6623 13.9089 18.2955 13.8965 18.6934 14.2793C19.0911 14.6623 19.1034 15.2955 18.7207 15.6934L16.9326 17.5498L18.7012 19.2861C19.0952 19.6731 19.1009 20.3072 18.7139 20.7012C18.3269 21.0952 17.6928 21.1009 17.2988 20.7139L15.5176 18.9639L13.6934 20.7207C13.2954 21.1036 12.6622 21.0913 12.2793 20.6934C11.8965 20.2954 11.9087 19.6622 12.3066 19.2793L14.1035 17.5488L12.2871 15.7012C11.9001 15.3074 11.9052 14.6743 12.2988 14.2871C12.6926 13.9001 13.3257 13.9052 13.7129 14.2988L15.5176 16.1348L17.2793 14.3066ZM15 0C16.6569 0 18 1.34315 18 3V9C18 9.55228 17.5523 10 17 10C16.4477 10 16 9.55228 16 9V3C16 2.44772 15.5523 2 15 2H3C2.44772 2 2 2.44772 2 3V17C2 17.5523 2.44772 18 3 18H8C8.55228 18 9 18.4477 9 19C9 19.5523 8.55228 20 8 20H3C1.34315 20 8.05319e-09 18.6569 0 17V3C0 1.34315 1.34315 0 3 0H15ZM8 13C8.55228 13 9 13.4477 9 14C9 14.5523 8.55228 15 8 15H6C5.44772 15 5 14.5523 5 14C5 13.4477 5.44772 13 6 13H8ZM12 9C12.5523 9 13 9.44772 13 10C13 10.5523 12.5523 11 12 11H6C5.44772 11 5 10.5523 5 10C5 9.44772 5.44772 9 6 9H12ZM12 5C12.5523 5 13 5.44772 13 6C13 6.55228 12.5523 7 12 7H6C5.44772 7 5 6.55228 5 6C5 5.44772 5.44772 5 6 5H12Z" fill="white"/>
    </svg>
  );
}

// Активен — Stroked 2px/Document List Acs Checkmark
function DocCheckIcon() {
  return (
    <svg width="19" height="20" viewBox="0 0 18.9999 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C16.6569 0 18 1.34315 18 3V9C18 9.55228 17.5523 10 17 10C16.4477 10 16 9.55228 16 9V3C16 2.44772 15.5523 2 15 2H3C2.44772 2 2 2.44772 2 3V17C2 17.5523 2.44772 18 3 18H8C8.55228 18 9 18.4477 9 19C9 19.5523 8.55228 20 8 20H3C1.34315 20 8.05319e-09 18.6569 0 17V3C0 1.34315 1.34315 0 3 0H15ZM17.293 14.293C17.6835 13.9024 18.3165 13.9024 18.707 14.293C19.0976 14.6835 19.0976 15.3165 18.707 15.707L14.707 19.707C14.3165 20.0976 13.6835 20.0976 13.293 19.707L11.293 17.707C10.9024 17.3165 10.9024 16.6835 11.293 16.293C11.6835 15.9024 12.3165 15.9024 12.707 16.293L14 17.5859L17.293 14.293ZM8 13C8.55228 13 9 13.4477 9 14C9 14.5523 8.55228 15 8 15H6C5.44772 15 5 14.5523 5 14C5 13.4477 5.44772 13 6 13H8ZM12 9C12.5523 9 13 9.44772 13 10C13 10.5523 12.5523 11 12 11H6C5.44772 11 5 10.5523 5 10C5 9.44772 5.44772 9 6 9H12ZM12 5C12.5523 5 13 5.44772 13 6C13 6.55228 12.5523 7 12 7H6C5.44772 7 5 6.55228 5 6C5 5.44772 5.44772 5 6 5H12Z" fill="white"/>
    </svg>
  );
}

// Маппинг: статус → { bgColor, Icon }
const statusAvatars = {
  'Черновик': { bgColor: '#949494', Icon: PencilIcon },
  'Нужны правки': { bgColor: '#F98E88', Icon: DocCrossIcon },
  'Активен': { bgColor: '#7AC6B2', Icon: DocCheckIcon },
};

export default function DocumentListPage() {
  const navigate = useNavigate();
  const { documents, toggleStarred, statusConfig } = useDocuments();
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  const filteredDocuments = useMemo(() => {
    if (!showStarredOnly) return documents;
    return documents.filter(d => d.starred);
  }, [documents, showStarredOnly]);

  return (
    <div className="flex-1 flex flex-col bg-[#f9f9f9] pt-8 px-8 pb-5 gap-6 overflow-hidden">
      {/* Title Row */}
      <div className="flex items-center gap-4">
        <h1 className="text-[30px] font-semibold text-[#191919] leading-9 tracking-[-0.3px] m-0 flex-1">
          Документация
        </h1>
        <div className="flex items-center gap-2">
          {/* Icon buttons */}
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src="/assets/icon-connection-arrows.svg" alt="" className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src="/assets/icon-arrows-rotation.svg" alt="" className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src="/assets/icon-pencil-2.svg" alt="" className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src="/assets/icon-layer-copy.svg" alt="" className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <img src="/assets/icon-trash.svg" alt="" className="w-5 h-5" />
          </button>
          {/* New Document Button */}
          <button
            onClick={() => navigate('/new-document')}
            className="flex items-center gap-2 h-10 px-3 rounded-lg bg-[#835de1] border-none cursor-pointer hover:bg-[#7249d1] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium text-white leading-[18px] tracking-[0.14px] whitespace-nowrap">
              Новый документ
            </span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">Все владельцы</span>
            <img src="/assets/icon-chevron-down.svg" alt="" className="w-3 h-3" />
          </button>
          <button className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
            <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">База данных</span>
            <img src="/assets/icon-chevron-down.svg" alt="" className="w-3 h-3" />
          </button>
        </div>
        <div className="search-field flex items-center w-[280px] h-10 px-3 rounded-lg bg-[rgba(25,25,25,0.05)] cursor-pointer">
          <img src="/assets/icon-search-20.svg" alt="" className="w-5 h-5 mr-2" />
          <span className="text-sm text-[#949494] leading-[18px] tracking-[0.14px]">Название, автор или раздел</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-xl shadow-[0px_4px_16px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center px-5 py-3 border-b border-[rgba(25,25,25,0.1)]">
          <div className="w-[400px] pl-3">
            {/* View toggle placeholder */}
          </div>
          <div className="flex-1 flex items-center gap-0.5 pl-2.5">
            <div className="flex-1 px-2.5">
              <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Автор</span>
            </div>
            <div className="flex-1 px-2.5">
              <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">База данных</span>
            </div>
            <div className="flex-1 px-2.5">
              <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Схема</span>
            </div>
            <div className="flex-1 px-2.5">
              <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Статус</span>
            </div>
            <div className="w-[75px] flex items-center">
              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`flex items-center gap-3 w-[75px] h-10 px-[10px] rounded-xl border-none cursor-pointer transition-colors ${
                  showStarredOnly
                    ? 'bg-[#efedf8] hover:bg-[#e5e1f5]'
                    : 'bg-transparent hover:bg-[rgba(25,25,25,0.05)]'
                }`}
                title="Избранное"
              >
                {showStarredOnly ? (
                  <svg width="20" height="20" viewBox="0 0 16.5456 16.1406" fill="#835de1" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M7.40924 0.495979C7.79511 -0.165363 8.75084 -0.16529 9.13678 0.495979L11.5362 4.61024C11.6859 4.86674 11.9425 5.04363 12.2354 5.09266L15.709 5.67176C16.5381 5.80994 16.8372 6.84677 16.209 7.40516L13.6749 9.65809C13.4244 9.88088 13.3014 10.2149 13.3487 10.5468L13.9844 14.997C14.102 15.8197 13.2226 16.4184 12.5001 16.0077L8.76666 13.8856C8.46037 13.7118 8.08457 13.7116 7.77838 13.8856L4.04498 16.0077C3.32253 16.4179 2.44408 15.8195 2.56158 14.997L3.19732 10.5468C3.24461 10.2148 3.12181 9.88089 2.87115 9.65809L0.335996 7.40516C-0.291363 6.84686 0.00779379 5.81047 0.835996 5.67176L4.30963 5.09266C4.60266 5.04382 4.85899 4.86671 5.00885 4.61024L7.40924 0.495979Z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 17.9002 16.9038" fill="#191919" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <path d="M8.15157 0.350462C8.57826 -0.116784 9.32259 -0.116857 9.74923 0.350462L9.83516 0.457884L12.5256 4.25769L17.1555 5.78406C17.8744 6.02155 18.1357 6.90494 17.6584 7.49499L14.6164 11.2538L14.9934 15.7274C15.0585 16.5031 14.3099 17.0908 13.5734 16.8485L8.94942 15.3241L4.32637 16.8485C3.5901 17.0905 2.84141 16.503 2.90645 15.7274L3.28341 11.2538L0.241413 7.49499C-0.235541 6.90484 0.0262741 6.02133 0.745319 5.78406L5.37325 4.25769L8.06563 0.457884L8.15157 0.350462ZM6.83223 5.66003C6.6982 5.84917 6.50627 5.99081 6.28633 6.06335L2.63008 7.26745L5.07051 10.2831C5.24591 10.5002 5.33117 10.7772 5.30782 11.0555L5.01583 14.5145L8.61055 13.3309L8.77852 13.2899C8.89182 13.2718 9.00799 13.2719 9.1213 13.2899L9.28926 13.3309L12.884 14.5145L12.593 11.0555C12.5696 10.7771 12.6548 10.5002 12.8303 10.2831L15.2688 7.26745L11.6135 6.06335C11.3938 5.99078 11.2025 5.84901 11.0686 5.66003L8.9504 2.66784L6.83223 5.66003Z" />
                  </svg>
                )}
                {showStarredOnly ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <path d="M4 6l4 4 4-4" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center px-5 py-1 hover:bg-[rgba(25,25,25,0.02)] cursor-pointer transition-colors"
              onClick={() => navigate(`/document/${doc.id}`)}
            >
              <div className="w-[400px] flex items-center gap-3 py-3">
                <div className="w-10 h-10 shrink-0 relative">
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                    <path d="M20 0C33.6364 0 40 6.36364 40 20C40 33.6364 33.6364 40 20 40C6.36364 40 0 33.6364 0 20C0 6.36364 6.36364 0 20 0Z" fill={statusAvatars[doc.status]?.bgColor || '#949494'}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {(() => {
                      const avatar = statusAvatars[doc.status];
                      const Icon = avatar?.Icon || PencilIcon;
                      return <Icon />;
                    })()}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px] truncate">
                    {doc.name}
                  </span>
                  <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] truncate">
                    {doc.description}
                  </span>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-0.5 pl-2.5">
                <div className="flex-1 px-2.5">
                  <span className="text-base font-medium text-[#676767] leading-5 tracking-[0.16px]">
                    {doc.author}
                  </span>
                </div>
                <div className="flex-1 px-2.5">
                  <span className="text-base font-medium text-[#676767] leading-5 tracking-[0.16px]">
                    {doc.database}
                  </span>
                </div>
                <div className="flex-1 px-2.5">
                  <span className="text-base font-medium text-[#676767] leading-5 tracking-[0.16px]">
                    {doc.schema}
                  </span>
                </div>
                <div className="flex-1 px-2.5">
                  <span
                    className="inline-flex items-center justify-center px-2 h-6 rounded-md text-sm font-medium leading-[18px] tracking-[0.14px] border whitespace-nowrap"
                    style={{ color: statusConfig[doc.status]?.color, borderColor: statusConfig[doc.status]?.color }}
                  >
                    {doc.status}
                  </span>
                </div>
                <div className="w-[75px] flex items-center justify-start pl-[10px]">
                  <button
                    className={`border-none bg-transparent cursor-pointer p-1 rounded transition-opacity ${
                      doc.starred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStarred(doc.id);
                    }}
                    title={doc.starred ? 'Убрать из избранного' : 'Добавить в избранное'}
                  >
                    {doc.starred ? (
                      <svg width="20" height="20" viewBox="0 0 16.5456 16.1406" fill="#676767" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.40924 0.495979C7.79511 -0.165363 8.75084 -0.16529 9.13678 0.495979L11.5362 4.61024C11.6859 4.86674 11.9425 5.04363 12.2354 5.09266L15.709 5.67176C16.5381 5.80994 16.8372 6.84677 16.209 7.40516L13.6749 9.65809C13.4244 9.88088 13.3014 10.2149 13.3487 10.5468L13.9844 14.997C14.102 15.8197 13.2226 16.4184 12.5001 16.0077L8.76666 13.8856C8.46037 13.7118 8.08457 13.7116 7.77838 13.8856L4.04498 16.0077C3.32253 16.4179 2.44408 15.8195 2.56158 14.997L3.19732 10.5468C3.24461 10.2148 3.12181 9.88089 2.87115 9.65809L0.335996 7.40516C-0.291363 6.84686 0.00779379 5.81047 0.835996 5.67176L4.30963 5.09266C4.60266 5.04382 4.85899 4.86671 5.00885 4.61024L7.40924 0.495979Z" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 17.9002 16.9038" fill="#676767" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.15157 0.350462C8.57826 -0.116784 9.32259 -0.116857 9.74923 0.350462L9.83516 0.457884L12.5256 4.25769L17.1555 5.78406C17.8744 6.02155 18.1357 6.90494 17.6584 7.49499L14.6164 11.2538L14.9934 15.7274C15.0585 16.5031 14.3099 17.0908 13.5734 16.8485L8.94942 15.3241L4.32637 16.8485C3.5901 17.0905 2.84141 16.503 2.90645 15.7274L3.28341 11.2538L0.241413 7.49499C-0.235541 6.90484 0.0262741 6.02133 0.745319 5.78406L5.37325 4.25769L8.06563 0.457884L8.15157 0.350462ZM6.83223 5.66003C6.6982 5.84917 6.50627 5.99081 6.28633 6.06335L2.63008 7.26745L5.07051 10.2831C5.24591 10.5002 5.33117 10.7772 5.30782 11.0555L5.01583 14.5145L8.61055 13.3309L8.77852 13.2899C8.89182 13.2718 9.00799 13.2719 9.1213 13.2899L9.28926 13.3309L12.884 14.5145L12.593 11.0555C12.5696 10.7771 12.6548 10.5002 12.8303 10.2831L15.2688 7.26745L11.6135 6.06335C11.3938 5.99078 11.2025 5.84901 11.0686 5.66003L8.9504 2.66784L6.83223 5.66003Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
