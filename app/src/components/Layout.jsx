import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AlertProvider } from './SuccessAlert';

export default function Layout() {
  return (
    <>
      <div className="sidebar-top-bar">
        <span className="sidebar-top-bar-company">ООО <span>"Банк Точка"</span></span>
        <span className="sidebar-top-bar-release">последний релиз: <span>02.11.2026 🦀</span></span>
      </div>
      <div className="layout">
        <Sidebar />
        <div className="main-area">
          <AlertProvider>
            <Outlet />
          </AlertProvider>
        </div>
      </div>
    </>
  );
}
