import { useState, useRef } from 'react';
import { createTag } from '../../api/tags';
import type { Tag } from '../../../../shared/types';

interface TagInputProps {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function addTag() {
    const trimmed = inputValue.trim().toLowerCase();
    if (!trimmed) return;

    if (tags.some((t) => t.name === trimmed)) {
      setInputValue('');
      return;
    }

    try {
      const tag = await createTag(trimmed);
      if (!tags.some((t) => t.id === tag.id)) {
        onChange([...tags, tag]);
      }
      setInputValue('');
      setError(null);
    } catch {
      setError('Failed to add tag');
    }
  }

  function removeTag(id: string) {
    onChange(tags.filter((t) => t.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text">Tags</span>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/15 text-secondary rounded-full text-sm"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="hover:text-red-500 transition-colors"
                aria-label={`Remove tag ${tag.name}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-black/8 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-secondary flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag"
          className="flex-1 bg-transparent text-sm text-text placeholder-text/40 focus:outline-none"
        />
      </div>
      <p className="text-xs text-text/40">Press Enter to add</p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
