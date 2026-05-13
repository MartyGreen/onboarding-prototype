import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <Outlet />
    </div>
  );
}
