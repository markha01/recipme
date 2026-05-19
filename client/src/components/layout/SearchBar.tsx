import { useState, useRef, useEffect } from 'react';
import { listTags } from '../../api/tags';
import type { Tag } from '../../../../shared/types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onTagSelect?: (tag: Tag) => void;
  selectedTagId?: string | null;
  onClearTag?: () => void;
}

export default function SearchBar({
  value,
  onChange,
  onTagSelect,
  selectedTagId,
  onClearTag,
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

  const showDropdown = focused && tags.length > 0 && !selectedTagId;

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
          placeholder="Search recipes or tags..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/10 bg-white text-sm text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-150"
        />

        {selectedTagId && onClearTag && (
          <button
            onClick={onClearTag}
            className="absolute right-3 text-text/50 hover:text-text transition-colors"
            aria-label="Clear tag filter"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-black/10 shadow-lg z-30 overflow-hidden">
          {loadingTags ? (
            <div className="px-4 py-3 text-sm text-text/50">Loading...</div>
          ) : (
            <ul>
              {tags.map((tag) => (
                <li key={tag.id}>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onTagSelect?.(tag);
                      setFocused(false);
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
