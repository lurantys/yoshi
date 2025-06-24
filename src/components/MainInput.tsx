import React, { useRef, useEffect } from 'react';
import { ArrowUp, Plus, SlidersHorizontal } from 'lucide-react';
import Tooltip from './Tooltip';

interface MainInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
}

const MainInput: React.FC<MainInputProps> = ({ prompt, onPromptChange, onSubmit }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="px-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2 rounded-xl bg-secondary border border-border-color max-w-3xl mx-auto shadow-sm">
        <button type="button" title="Coming Soon" className="flex-shrink-0 p-2 rounded-md hover:bg-border-color text-text-secondary transition-colors">
          <Plus size={20} />
        </button>
        <button type="button" className="flex-shrink-0 p-2 rounded-md hover:bg-border-color text-text-secondary transition-colors">
          <SlidersHorizontal size={20} />
        </button>
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
    </div>
  );
};

export default MainInput; 