import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AlertProvider } from './SuccessAlert';
import ReleaseModal from './ReleaseModal';
import TaskModal from './TaskModal';
import WelcomeModal from './WelcomeModal';
import RegistrationPage from '../pages/RegistrationPage';

const FIREBASE_DB_URL = 'https://datagatetest-4f190-default-rtdb.firebaseio.com';

/*
  Research flow (triggered from sidebar "Новое исследование"):
    1. WelcomeModal  — intro screen
    2. RegistrationPage — grade & position form (overlay)
    3. Registration completes → currentUser set → TaskModal shows tasks
*/

export default function Layout({ currentUser, onRegistrationComplete }) {
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [researchStep, setResearchStep] = useState(null); // null | 'welcome' | 'registration'
  const [hasActiveStudy, setHasActiveStudy] = useState(false);
  const [activeStudyChecked, setActiveStudyChecked] = useState(false);

  // Check whether any study is active in Firebase; returns boolean
  const checkActiveStudy = useCallback(async () => {
    try {
      const res = await fetch(`${FIREBASE_DB_URL}/onboarding_studies.json`);
      const data = await res.json();
      if (data) {
        const active = Object.values(data).some((s) => s.active);
        setHasActiveStudy(active);
        setActiveStudyChecked(true);
        return active;
      }
    } catch { /* ignore */ }
    setHasActiveStudy(false);
    setActiveStudyChecked(true);
    return false;
  }, []);

  // Check on mount and periodically (every 30s) so admin changes propagate
  useEffect(() => {
    checkActiveStudy();
    const interval = setInterval(checkActiveStudy, 30000);
    return () => clearInterval(interval);
  }, [checkActiveStudy]);

  const handleOpenResearch = async () => {
    // Fresh check right before opening in case admin just toggled
    const active = await checkActiveStudy();
    if (!active) return;
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
        <Sidebar onOpenResearch={handleOpenResearch} researchDisabled={!hasActiveStudy} />
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
