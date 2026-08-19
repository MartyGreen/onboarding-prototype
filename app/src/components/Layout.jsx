import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AlertProvider } from './SuccessAlert';
import ReleaseModal from './ReleaseModal';

export default function Layout() {
  const [releaseOpen, setReleaseOpen] = useState(false);

  return (
    <>
      <div className="sidebar-top-bar">
        <span className="sidebar-top-bar-company">ООО <span>"Банк Точка"</span></span>
        <span className="sidebar-top-bar-release">
          последний релиз:{' '}
          <span
            className="sidebar-top-bar-release-date"
            onClick={() => setReleaseOpen(true)}
          >
            02.11.2026 🦀
          </span>
        </span>
      </div>
      <div className="layout">
        <Sidebar />
        <div className="main-area">
          <AlertProvider>
            <Outlet />
          </AlertProvider>
        </div>
      </div>
      {releaseOpen && <ReleaseModal onClose={() => setReleaseOpen(false)} />}
    </>
  );
}
