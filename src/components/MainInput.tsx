import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, Plus, SlidersHorizontal } from 'lucide-react';
import Tooltip from './Tooltip';

interface MainInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
  playlistSize: number;
  onPlaylistSizeChange: (size: number) => void;
  selectedImage: string | null;
  onImageChange: (img: string | null) => void;
}

const MainInput: React.FC<MainInputProps> = ({ prompt, onPromptChange, onSubmit, playlistSize, onPlaylistSizeChange, selectedImage, onImageChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    handleInput();
  }, [prompt]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dropdownOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onImageChange(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onImageChange(null);
    }
  };

  return (
    <div className="px-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2 rounded-xl bg-secondary border border-border-color max-w-3xl mx-auto shadow-sm relative">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          type="button"
          title="Upload Image"
          className="flex-shrink-0 p-2 rounded-md hover:bg-border-color text-text-secondary transition-colors"
          onClick={handlePlusClick}
        >
          <Plus size={20} />
        </button>
        <div className="relative">
          <button
            type="button"
            className="flex-shrink-0 p-2 rounded-md hover:bg-border-color text-text-secondary transition-colors"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="Settings"
          >
            <SlidersHorizontal size={20} />
          </button>
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 mt-2 z-20 w-56 bg-secondary border border-border-color rounded-xl shadow-lg p-4 text-sm text-text-primary animate-fade-in"
            >
              <div className="mb-2 font-semibold">Playlist Settings</div>
              <label className="flex flex-col gap-1 mb-2">
                <span>Playlist Size</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={playlistSize}
                  onChange={e => onPlaylistSizeChange(Number(e.target.value))}
                  className="p-2 rounded bg-secondary border border-border-color focus:outline-none text-text-primary placeholder:text-text-secondary transition-colors"
                  style={{ fontFamily: 'inherit', fontSize: '1rem' }}
                />
                <span className="text-xs text-text-secondary">Enter a number between 1 and 100</span>
              </label>
            </div>
          )}
        </div>
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={1}
          placeholder="Describe your mood, activity, or vibe..."
          className="w-full p-2 bg-transparent focus:outline-none resize-none overflow-hidden text-text-primary placeholder:text-text-secondary"
          style={{ maxHeight: '200px' }}
        />
        <button type="submit" className="flex-shrink-0 p-3 rounded-lg bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50" disabled={!prompt.trim()}>
          <ArrowUp size={20} />
        </button>
      </form>
      {selectedImage && (
        <div className="max-w-3xl mx-auto mt-4 flex justify-start">
          <div className="relative bg-secondary/80 border border-border-color rounded-xl shadow-lg p-2 flex items-center" style={{ backdropFilter: 'blur(2px)' }}>
            <button
              type="button"
              onClick={() => {
                onImageChange(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute -top-3 -right-3 bg-white/80 hover:bg-red-500 text-red-500 hover:text-white border border-border-color rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-200 ring-1 ring-border-color focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Remove image"
              style={{ fontSize: '1.5rem', fontWeight: 700 }}
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Selected preview"
              className="max-h-40 rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
              style={{ objectFit: 'contain', maxWidth: '200px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainInput; 