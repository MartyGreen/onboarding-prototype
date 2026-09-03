import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import LogoSvg from './LogoSvg';

const base = import.meta.env.BASE_URL;

const mainMenuItems = [
  { icon: `${base}assets/icon-document-book.svg`, label: 'Документация', to: '/', badge: '5' },
  { icon: `${base}assets/icon-person.svg`, label: 'Команда', to: '/team' },
  { icon: `${base}assets/icon-integration.svg`, label: 'Сессия', to: '/session' },
  { icon: `${base}assets/icon-file.svg`, label: 'Загрузчик файлов', to: '/files' },
  { icon: `${base}assets/icon-check-circle.svg`, label: 'Bi-API методы', to: '/api' },
  { icon: `${base}assets/icon-upload-arrow.svg`, label: 'Управление загрузками', to: '/uploads' },
  { icon: `${base}assets/icon-pencil.svg`, label: 'Редактор SQL', to: '/sql' },
];

const mapItem = { icon: `${base}assets/icon-layout-grid.svg`, label: 'Карта сервисов', to: '/services' };

const bottomItems = [
  { icon: `${base}assets/icon-document-book-2.svg`, label: 'Есть идея', to: '/idea' },
  { icon: `${base}assets/icon-help-circle.svg`, label: 'Нужна помощь', to: '/help' },
];

const CollapseChevron = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M11 4.5L6.5 9L11 13.5" stroke="#949494" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Sidebar({ onOpenResearch, researchDisabled }) {
  const [collapsed, setCollapsed] = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  const [badgeHovered, setBadgeHovered] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleAvatarClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      clearTimeout(clickTimerRef.current);
      window.open(`${base}dashboard.html`, '_blank');
      return;
    }
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 500);
  };

  const isPulsing = navHovered || badgeHovered;

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo + Collapse */}
      <div className="sidebar-logo">
        <LogoSvg isPulsing={isPulsing} />
        <button
          className={`sidebar-collapse-btn ${collapsed ? 'collapsed' : ''}`}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Развернуть' : 'Свернуть'}
        >
          <CollapseChevron />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="sidebar-nav"
        onMouseEnter={() => setNavHovered(true)}
        onMouseLeave={() => { setNavHovered(false); setBadgeHovered(false); }}
      >
        {/* Main menu */}
        <div className="sidebar-menu-group">
          {mainMenuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <img src={item.icon} alt="" className="sidebar-item-icon" />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className="sidebar-badge"
                  onMouseEnter={() => setBadgeHovered(true)}
                  onMouseLeave={() => setBadgeHovered(false)}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Map section */}
        <div className="sidebar-menu-group map-group">
          <NavLink
            to={mapItem.to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <img src={mapItem.icon} alt="" className="sidebar-item-icon" />
            <span>{mapItem.label}</span>
          </NavLink>
        </div>

        {/* Spacer */}
        <div className="sidebar-spacer" />

        {/* Bottom */}
        <div className="sidebar-bottom">
          <div className="sidebar-bottom-card">
            {bottomItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <img src={item.icon} alt="" className="sidebar-item-icon" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Новое исследование — opens WelcomeModal */}
            <button
              className={`sidebar-item sidebar-item-research${researchDisabled ? ' sidebar-item-disabled' : ''}`}
              onClick={researchDisabled ? undefined : onOpenResearch}
              disabled={researchDisabled}
              title={researchDisabled ? 'Нет активного исследования' : ''}
            >
              <img src={`${base}assets/icon-new-research.svg`} alt="" className="sidebar-item-icon" />
              <span>Новое исследование</span>
            </button>
          </div>

          {/* User — triple-click opens admin dashboard */}
          <button className="sidebar-user" onClick={handleAvatarClick}>
            <div className="sidebar-avatar">
              <img src={`${base}assets/avatar-cat.jpg`} alt="Avatar" />
            </div>
            <span className="sidebar-user-name">Кот Ревьюн</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
