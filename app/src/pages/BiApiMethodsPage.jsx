import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBiApiMethods } from '../data/BiApiMethodsContext';

const statusStyles = {
  'Одобрен': { color: '#5cad9a', borderColor: '#5cad9a' },
  'На проверке': { color: '#949494', borderColor: '#949494' },
  'Отклонён': { color: '#d84d4d', borderColor: '#d84d4d' },
};

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM16.7071 10.7071L11.7071 15.7071C11.3166 16.0976 10.6834 16.0976 10.2929 15.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929C7.68342 10.9024 8.31658 10.9024 8.70711 11.2929L11 13.5858L15.2929 9.29289C15.6834 8.90237 16.3166 8.90237 16.7071 9.29289C17.0976 9.68342 17.0976 10.3166 16.7071 10.7071Z" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="12" r="1.5" fill="#191919"/>
      <circle cx="12" cy="12" r="1.5" fill="#191919"/>
      <circle cx="19" cy="12" r="1.5" fill="#191919"/>
    </svg>
  );
}

export default function BiApiMethodsPage() {
  const navigate = useNavigate();
  const { methods } = useBiApiMethods();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMethods = useMemo(() => {
    if (!searchQuery.trim()) return methods;
    const q = searchQuery.toLowerCase();
    return methods.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.author.toLowerCase().includes(q)
    );
  }, [searchQuery, methods]);

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] pt-8 px-8 pb-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Title Row */}
        <div className="flex items-center gap-4">
          <h1 className="text-[30px] font-semibold text-[#191919] leading-9 tracking-[-0.3px] m-0 flex-1">
            Методы Bi-API
          </h1>
          <button onClick={() => navigate('/api/new')} className="flex items-center gap-2 h-10 px-3 rounded-lg bg-[#835de1] border-none cursor-pointer hover:bg-[#7249d1] transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium text-white leading-[18px] tracking-[0.14px] whitespace-nowrap">
              Новый метод
            </span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
              <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">Все владельцы</span>
              <img src={`${import.meta.env.BASE_URL}assets/icon-chevron-down.svg`} alt="" className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors">
              <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">Все статусы</span>
              <img src={`${import.meta.env.BASE_URL}assets/icon-chevron-down.svg`} alt="" className="w-3 h-3" />
            </button>
          </div>
          <div className="search-field flex items-center w-[280px] h-10 px-3 rounded-lg bg-[rgba(25,25,25,0.05)]">
            <img src={`${import.meta.env.BASE_URL}assets/icon-search-20.svg`} alt="" className="w-5 h-5 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Название, автор или раздел"
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#191919] leading-[18px] tracking-[0.14px] placeholder:text-[#949494]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col mt-4 overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center px-5 py-2 pr-16">
          <div className="w-[608px]">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Название</span>
          </div>
          <div className="flex-1">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Автор</span>
          </div>
          <div className="flex-1 min-w-[160px]">
            <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">Статус</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[rgba(25,25,25,0.1)]" />

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto py-2">
          {filteredMethods.map((method) => {
            const style = statusStyles[method.status] || statusStyles['На проверке'];
            return (
              <div
                key={method.id}
                onClick={() => navigate(`/api/${method.id}`)}
                className="flex items-center gap-5 h-16 px-5 hover:bg-[rgba(25,25,25,0.02)] cursor-pointer transition-colors"
              >
                {/* Name + Avatar */}
                <div className="w-[608px] flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 relative">
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                      <path d="M20 0C33.6364 0 40 6.36364 40 20C40 33.6364 33.6364 40 20 40C6.36364 40 0 33.6364 0 20C0 6.36364 6.36364 0 20 0Z" fill={method.avatarColor} />
                    </svg>
                    <CheckCircleIcon />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-base font-medium text-[#191919] leading-5 tracking-[0.16px] truncate">
                      {method.name}
                    </span>
                    <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px] truncate">
                      {method.description}
                    </span>
                  </div>
                </div>

                {/* Author */}
                <div className="flex-1">
                  <span className="text-base font-medium text-[#676767] leading-5 tracking-[0.16px]">
                    {method.author}
                  </span>
                </div>

                {/* Status */}
                <div className="flex-1 min-w-[160px] flex items-center pr-6">
                  <span
                    className="inline-flex items-center justify-center px-2 h-6 rounded-md text-sm font-medium leading-[18px] tracking-[0.14px] border whitespace-nowrap"
                    style={{ color: style.color, borderColor: style.borderColor }}
                  >
                    {method.status}
                  </span>
                </div>

                {/* More button */}
                <div className="shrink-0">
                  <button className="bg-transparent border-none cursor-pointer p-0 flex items-center justify-center">
                    <MoreIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
