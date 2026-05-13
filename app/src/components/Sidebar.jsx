import React from 'react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { icon: '/assets/icon-document-book.svg', label: 'Документация', to: '/', active: true },
  { icon: '/assets/icon-person.svg', label: 'Команда', to: '/team' },
  { icon: '/assets/icon-integration.svg', label: 'Сессия', to: '/session' },
  { icon: '/assets/icon-file.svg', label: 'Загрузчик файлов', to: '/files' },
  { icon: '/assets/icon-check-circle.svg', label: 'Bi-API методы', to: '/api' },
  { icon: '/assets/icon-layout-grid.svg', label: 'Карта сервисов', to: '/services' },
  { icon: '/assets/icon-pencil.svg', label: 'Редактор SQL', to: '/sql' },
  { icon: '/assets/icon-upload-arrow.svg', label: 'Управление загрузками', to: '/uploads' },
];

const bottomItems = [
  { icon: '/assets/icon-document-book-2.svg', label: 'Есть идея', to: '/idea' },
  { icon: '/assets/icon-help-circle.svg', label: 'Нужна помощь', to: '/help' },
];

export default function Sidebar() {
  return (
    <aside className="bg-white flex flex-col h-screen w-[245px] shrink-0 pt-5 pb-6 px-3 sticky top-0 left-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-3 mb-6">
        <div className="py-3">
          <h1 className="text-4xl font-semibold text-[#191919] tracking-tight leading-[42px] m-0">
            DataGate
          </h1>
        </div>
      </div>

      {/* Main menu */}
      <nav className="flex flex-col flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-sm font-medium leading-[18px] tracking-[0.14px] no-underline rounded-lg transition-colors ${
                isActive
                  ? 'text-[#835de1]'
                  : 'text-[#191919] hover:bg-[rgba(25,25,25,0.05)]'
              }`
            }
          >
            <img src={item.icon} alt="" className="w-6 h-6" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom menu */}
        <div className="mt-6">
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium leading-[18px] tracking-[0.14px] text-[#191919] no-underline rounded-lg hover:bg-[rgba(25,25,25,0.05)] transition-colors"
            >
              <img src={item.icon} alt="" className="w-6 h-6" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* User */}
        <div className="mt-6">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
              <img src={`${import.meta.env.BASE_URL}assets/logo.png`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
              Никита Сокол
            </span>
          </div>
        </div>
      </nav>
    </aside>
  );
}
