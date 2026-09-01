import React, { useState } from 'react';
import LogoSvg from '../components/LogoSvg';
import RegistrationDropdown from '../components/RegistrationDropdown';

/* ===== Firebase Realtime Database (REST API) ===== */
const FIREBASE_DB_URL = 'https://datagatetest-4f190-default-rtdb.firebaseio.com';

async function fbFetch(path) {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`);
    const data = await res.json();
    if (!data) return [];
    return Object.entries(data).map(([key, val]) => ({ ...val, _key: key }));
  } catch (err) {
    console.warn('Firebase fetch failed:', err);
    return [];
  }
}

async function firebasePush(path, data) {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result?.name;
  } catch (err) {
    console.warn('Firebase push failed:', err);
    return null;
  }
}

const GRADE_OPTIONS = ['Junior', 'Middle', 'Senior', 'Lead', 'Principal', 'Head'];

const POSITION_OPTIONS = [
  'Data Engineer',
  'Data Analyst',
  'Data Scientist',
  'Backend Developer',
  'Frontend Developer',
  'DevOps Engineer',
  'QA Engineer',
  'Product Manager',
  'Project Manager',
  'Designer',
  'Team Lead',
  'Tech Lead',
  'Аналитик',
  'Разработчик',
  'Тестировщик',
];

export default function RegistrationPage({ onComplete }) {
  const [grade, setGrade] = useState('');
  const [position, setPosition] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = grade && position && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    // 1. Find active study
    const studies = await fbFetch('onboarding_studies');
    const activeStudy = studies.find((s) => s.active);
    const studyKey = activeStudy ? activeStudy._key : null;

    const participant = {
      id: Date.now(),
      grade,
      position,
      registeredAt: new Date().toISOString(),
      studyKey: studyKey || null,
      currentTaskIndex: 0,
      taskProgress: [],
      allTasksCompleted: false,
    };

    // 2. Save to Firebase — into study-specific collection if study exists, else global
    const fbPath = studyKey
      ? `onboarding_participants/${studyKey}`
      : 'onboarding_participants_global';

    const fbKey = await firebasePush(fbPath, participant);
    if (fbKey) {
      participant._firebaseKey = fbKey;
    }

    // 3. Save to localStorage
    localStorage.setItem('onboarding_current_user', JSON.stringify(participant));

    setSubmitting(false);
    onComplete(participant);
  };

  return (
    <div className="registration-page">
      <div className="registration-card">
        <div className="registration-logo">
          <LogoSvg />
        </div>
        <h1 className="registration-title">Добро пожаловать</h1>
        <p className="registration-subtitle">
          Перед началом исследования заполните, пожалуйста, информацию о себе
        </p>

        <div className="registration-form">
          <RegistrationDropdown
            label="Грейд"
            placeholder="Выберите грейд"
            options={GRADE_OPTIONS}
            value={grade}
            onChange={setGrade}
          />

          <RegistrationDropdown
            label="Должность"
            placeholder="Выберите должность"
            options={POSITION_OPTIONS}
            value={position}
            onChange={setPosition}
          />
        </div>

        <button
          className={`registration-submit ${canSubmit ? '' : 'disabled'}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? 'Загрузка…' : 'Начать исследование'}
        </button>
      </div>
    </div>
  );
}
