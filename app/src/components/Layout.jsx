import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AlertProvider } from './SuccessAlert';

export default function Layout() {
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <AlertProvider>
        <Outlet />
      </AlertProvider>
    </div>
  );
}
