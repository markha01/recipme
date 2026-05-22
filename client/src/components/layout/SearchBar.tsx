import { useState, useRef, useEffect } from 'react';
import { listTags } from '../../api/tags';
import type { Tag } from '../../../../shared/types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onTagSelect?: (tag: Tag) => void;
  selectedTagIds?: string[];
}

export default function SearchBar({
  value,
  onChange,
  onTagSelect,
  selectedTagIds = [],
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focused) return;
    setLoadingTags(true);
    listTags(value || undefined)
      .then(setTags)
      .catch(() => setTags([]))
      .finally(() => setLoadingTags(false));
  }, [focused, value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableTags = tags.filter((t) => !selectedTagIds.includes(t.id));
  const showDropdown = focused && availableTags.length > 0;

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return;
    const exactMatch = availableTags.find((t) => t.name === trimmed);
    if (exactMatch && onTagSelect) {
      e.preventDefault();
      onTagSelect(exactMatch);
      onChange('');
      setFocused(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-text/40 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search recipes or tags..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-white text-sm text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-150"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-black/10 shadow-lg z-30 overflow-hidden">
          {loadingTags ? (
            <div className="px-4 py-3 text-sm text-text/50">Loading...</div>
          ) : (
            <ul>
              {availableTags.map((tag) => (
                <li key={tag.id}>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onTagSelect?.(tag);
                      onChange('');
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-black/5 transition-colors text-left"
                  >
                    <span className="text-text">{tag.name}</span>
                    <span className="text-xs text-text/50 bg-black/5 px-2 py-0.5 rounded-full">
                      {tag.recipeCount} {tag.recipeCount === 1 ? 'recipe' : 'recipes'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
