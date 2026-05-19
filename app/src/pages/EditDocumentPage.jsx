import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocuments } from '../data/DocumentsContext';
import { useAlert } from '../components/SuccessAlert';

export default function EditDocumentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { documents, updateDocument } = useDocuments();
  const { showAlert } = useAlert();
  const doc = documents.find(d => d.id === id) || documents[0];

  const [name, setName] = useState(doc.name);
  const [description, setDescription] = useState(doc.descriptionFull);

  const maxChars = 5000;

  const handleSave = () => {
    updateDocument(doc.id, {
      name,
      descriptionFull: description,
    });
    showAlert('Изменения сохранены');
    navigate(`/document/${id}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] overflow-y-auto">
      {/* Header */}
      <header className="flex items-center gap-4 px-8 py-6">
        <button
          onClick={() => navigate(`/document/${id}`)}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-[rgba(25,25,25,0.05)] border-none cursor-pointer hover:bg-[rgba(25,25,25,0.1)] transition-colors shrink-0"
        >
          <img src={`${import.meta.env.BASE_URL}assets/icon-arrow-left.svg`} alt="Back" className="w-5 h-5" />
        </button>
        <h1 className="text-[30px] font-medium text-[#191919] leading-9 tracking-[-0.3px] m-0">
          Общее описание
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 pb-0">
        <div className="bg-white rounded-[20px] shadow-[0px_4px_16px_rgba(0,0,0,0.05)] px-10 py-10 flex flex-col gap-5">
          {/* Name Input */}
          <div className="bg-[rgba(25,25,25,0.05)] rounded-xl px-5 flex flex-col">
            <div className="flex flex-col gap-2 py-3">
              <span className="text-sm font-medium text-[#191919] leading-[18px] tracking-[0.14px]">
                Название документа
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none outline-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 w-full"
              />
            </div>
            <div className="flex flex-col gap-2 pb-3">
              <div className="h-[0.5px] bg-[rgba(25,25,25,0.2)]" />
              <span className="text-sm text-[#676767] leading-[18px] tracking-[0.14px]">
                Латинские буквы и знак подчеркивания, больше 6 символов
              </span>
            </div>
          </div>

          {/* Description Text Area */}
          <div className="flex flex-col bg-[rgba(25,25,25,0.05)] rounded-xl">
            <div className="px-5 pt-3 pb-2">
              <textarea
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    setDescription(e.target.value);
                  }
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
                style={{ minHeight: '120px', overflow: 'hidden', fontFamily: 'inherit', boxSizing: 'border-box' }}
                className="w-full bg-transparent border-none outline-none resize-none text-base text-[#191919] leading-5 tracking-[0.16px] p-0 m-0 block"
                placeholder="Введите описание документа..."
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-2 border-t border-[rgba(25,25,25,0.2)]">
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors">
                  <span className="text-sm font-medium text-[#191919]">T</span>
                </button>
                <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors">
                  <span className="text-sm font-bold text-[#191919]">B</span>
                </button>
                <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors">
                  <span className="text-sm text-[#191919]">≡</span>
                </button>
                <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer hover:bg-[rgba(25,25,25,0.05)] transition-colors">
                  <span className="text-sm text-[#191919]">🔗</span>
                </button>
              </div>
              <span className="text-xs text-[rgba(25,25,25,0.45)] leading-[15px] tracking-[0.12px]">
                {description.length} / {maxChars.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center py-5 bg-[#f5f5f5]">
        <button
          onClick={handleSave}
          className="w-[335px] h-[50px] bg-[#835de1] text-white text-lg font-medium leading-[22px] rounded-[10px] border-none cursor-pointer hover:bg-[#7248d4] transition-colors"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
