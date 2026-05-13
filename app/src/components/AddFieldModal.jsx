import React, { useState, useRef, useEffect } from 'react';

export default function AddFieldModal({ isOpen, onClose, onAdd, initialData }) {
  const isEdit = !!initialData;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
    } else if (!isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen, initialData]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [description]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), description: description.trim() });
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.4)]"
      onClick={handleOverlayClick}
    >
      <div
        className="w-[480px] flex flex-col bg-white rounded-[18px] max-h-[90vh]"
        style={{ minHeight: '620px' }}
      >
        {/* Header */}
        <div className="flex flex-col shrink-0">
          <div className="h-16 flex items-center justify-end px-5">
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center border-none bg-transparent cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2L14 14M14 2L2 14" stroke="#191919" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="px-5 pb-[15px]">
            <h2 className="text-2xl font-semibold text-[#191919] leading-[30px] m-0">
              {isEdit ? 'Редактирование поля' : 'Добавление поля'}
            </h2>
          </div>
        </div>

        {/* Body — scrollable area */}
        <div className="flex-1 overflow-y-auto px-5 pb-[15px] min-h-0">
          <div className="flex flex-col gap-[10px]">
            {/* Input: Название */}
            <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 py-3 flex flex-col gap-2">
              <div className="flex items-center h-5">
                <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                  Название
                </span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите название"
                className="w-full bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] placeholder:text-[#949494] p-0"
              />
            </div>

            {/* Text Area: Описание — растягивается */}
            <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center h-5">
                  <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                    Описание
                  </span>
                </div>
                <span className="text-xs text-[#676767] leading-[15px] tracking-[0.12px]">
                  {description.length} / 500
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Введите описание"
                rows={1}
                className="w-full bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] placeholder:text-[#949494] p-0 resize-none overflow-hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 shrink-0">
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="w-full h-[50px] bg-[#835de1] rounded-[10px] border-none text-lg text-white leading-[22px] cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
}
