import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DocumentsProvider } from './data/DocumentsContext';
import Layout from './components/Layout';
import DocumentListPage from './pages/DocumentListPage';
import DocumentPage from './pages/DocumentPage';
import NewDocumentPage from './pages/NewDocumentPage';
import EditFieldsPage from './pages/EditFieldsPage';

function PlaceholderPage({ title }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f5f5]">
      <div className="text-center">
        <h2 className="text-2xl font-medium text-[#191919] mb-2">{title}</h2>
        <p className="text-base text-[#949494]">Страница в разработке</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DocumentsProvider>
    <BrowserRouter basename="/onboarding-prototype">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DocumentListPage />} />
          <Route path="document/:id" element={<DocumentPage />} />
          <Route path="document/:id/edit-fields" element={<EditFieldsPage />} />
          <Route path="new-document" element={<NewDocumentPage />} />
          <Route path="team" element={<PlaceholderPage title="Команда" />} />
          <Route path="session" element={<PlaceholderPage title="Сессия" />} />
          <Route path="files" element={<PlaceholderPage title="Загрузчик файлов" />} />
          <Route path="api" element={<PlaceholderPage title="Bi-API методы" />} />
          <Route path="services" element={<PlaceholderPage title="Карта сервисов" />} />
          <Route path="sql" element={<PlaceholderPage title="Редактор SQL" />} />
          <Route path="uploads" element={<PlaceholderPage title="Управление загрузками" />} />
          <Route path="idea" element={<PlaceholderPage title="Есть идея" />} />
          <Route path="help" element={<PlaceholderPage title="Нужна помощь" />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </DocumentsProvider>
  );
}
