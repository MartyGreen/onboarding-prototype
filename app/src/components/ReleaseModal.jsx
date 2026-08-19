import React, { useEffect } from 'react';

const base = import.meta.env.BASE_URL;

const releaseItems = [
  {
    title: 'Новая навигация',
    description:
      'Теперь по фавикону вы сможете оделить один банк от другого, всегда сможете найти информацию о новом релизе, а расположение кнопок и экшонов стали работать по единым правилам',
  },
  {
    title: 'Быстрый поиск',
    description:
      'По нажатию «/» или ⌘+K откроется омни-бокс: ищите документы, команды и разделы в одном месте',
  },
  {
    title: 'Drag-and-drop загрузка',
    description:
      'Файлы теперь можно перетаскивать прямо в окно браузера — загрузчик подхватит их автоматически',
  },
];

export default function ReleaseModal({ onClose }) {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="release-modal-overlay" onClick={onClose}>
      <div className="release-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="release-modal-header">
          <h2 className="release-modal-title">Релиз от 02.11.2026&nbsp; 🦀</h2>
          <button className="release-modal-close" onClick={onClose} title="Закрыть">
            <img src={`${base}assets/icon-cross.svg`} alt="Закрыть" />
          </button>
        </div>

        {/* Content */}
        <div className="release-modal-content">
          {releaseItems.map((item, i) => (
            <div key={i} className="release-modal-item">
              <div className="release-modal-item-title">{item.title}</div>
              <div className="release-modal-item-desc">{item.description}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="release-modal-footer">
          <button className="release-modal-btn" onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
