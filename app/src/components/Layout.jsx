import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AlertProvider } from './SuccessAlert';
import ReleaseModal from './ReleaseModal';
import TaskModal from './TaskModal';
import WelcomeModal from './WelcomeModal';
import RegistrationPage from '../pages/RegistrationPage';

/*
  Research flow (triggered from sidebar "Новое исследование"):
    1. WelcomeModal  — intro screen
    2. RegistrationPage — grade & position form (overlay)
    3. Registration completes → currentUser set → TaskModal shows tasks
*/

export default function Layout({ currentUser, onRegistrationComplete }) {
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [researchStep, setResearchStep] = useState(null); // null | 'welcome' | 'registration'

  const handleOpenResearch = () => {
    // If user already registered, just re-open welcome for info
    // (tasks will resume automatically via TaskProvider)
    setResearchStep('welcome');
  };

  const handleWelcomeStart = () => {
    if (currentUser) {
      // Already registered — close modals, tasks resume via TaskModal
      setResearchStep(null);
    } else {
      // Not yet registered — proceed to registration
      setResearchStep('registration');
    }
  };

  const handleRegistrationDone = (participant) => {
    setResearchStep(null);
    onRegistrationComplete(participant);
  };

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
        <Sidebar onOpenResearch={handleOpenResearch} />
        <div className="main-area">
          <AlertProvider>
            <Outlet />
          </AlertProvider>
        </div>
      </div>
      {releaseOpen && <ReleaseModal onClose={() => setReleaseOpen(false)} />}
      {researchStep === 'welcome' && <WelcomeModal onStart={handleWelcomeStart} />}
      {researchStep === 'registration' && <RegistrationPage onComplete={handleRegistrationDone} />}
      <TaskModal />
    </>
  );
}
