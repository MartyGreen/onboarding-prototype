import React, { createContext, useContext, useState } from 'react';

const CollectionContext = createContext();

export function CollectionProvider({ children }) {
  // Каждый элемент: { docId, docName, fieldName, fieldType, fieldDescription }
  const [collection, setCollection] = useState([]);

  const addToCollection = (item) => {
    setCollection(prev => {
      // Не добавляем дубликаты
      if (prev.some(p => p.docId === item.docId && p.fieldName === item.fieldName)) return prev;
      return [...prev, item];
    });
  };

  const removeFromCollection = (docId, fieldName) => {
    setCollection(prev => prev.filter(p => !(p.docId === docId && p.fieldName === fieldName)));
  };

  const isInCollection = (docId, fieldName) => {
    return collection.some(p => p.docId === docId && p.fieldName === fieldName);
  };

  const clearCollection = () => setCollection([]);

  // Группировка по документу
  const groupedByDoc = collection.reduce((acc, item) => {
    if (!acc[item.docId]) {
      acc[item.docId] = { docId: item.docId, docName: item.docName, fields: [] };
    }
    acc[item.docId].fields.push(item);
    return acc;
  }, {});

  return (
    <CollectionContext.Provider value={{
      collection,
      addToCollection,
      removeFromCollection,
      isInCollection,
      clearCollection,
      groupedByDoc: Object.values(groupedByDoc),
    }}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection must be used within CollectionProvider');
  return ctx;
}
