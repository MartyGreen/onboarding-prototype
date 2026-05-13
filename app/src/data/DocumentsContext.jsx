import React, { createContext, useContext, useState } from 'react';
import { documents as initialDocuments, statusConfig } from './documents';

const DocumentsContext = createContext();

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState(initialDocuments);

  const addDocument = (doc) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const updateDocument = (id, updates) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const toggleStarred = (id) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, starred: !d.starred } : d));
  };

  return (
    <DocumentsContext.Provider value={{ documents, addDocument, updateDocument, toggleStarred, statusConfig }}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error('useDocuments must be used within DocumentsProvider');
  return ctx;
}
