import { useState, useRef } from 'react';

interface IngredientListProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

export default function IngredientList({ ingredients, onChange }: IngredientListProps) {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addIngredient() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onChange([...ingredients, trimmed]);
    setInputValue('');
  }

  function removeIngredient(index: number) {
    onChange(ingredients.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  }

  function startEditing(index: number) {
    setEditingIndex(index);
    setEditingValue(ingredients[index]);
  }

  function commitEdit() {
    if (editingIndex === null) return;
    const trimmed = editingValue.trim();
    if (trimmed) {
      const updated = ingredients.map((ing, i) => (i === editingIndex ? trimmed : ing));
      onChange(updated);
    }
    setEditingIndex(null);
    setEditingValue('');
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditingValue('');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-text">Ingredients</span>

      {ingredients.length > 0 && (
        <ul className="flex flex-col gap-1">
          {ingredients.map((ing, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-black/8 text-sm text-text group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              {editingIndex === idx ? (
                <input
                  autoFocus
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={commitEdit}
                  className="flex-1 bg-transparent text-sm text-text focus:outline-none"
                />
              ) : (
                <span
                  className="flex-1 cursor-text"
                  onClick={() => startEditing(idx)}
                >
                  {ing}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeIngredient(idx)}
                className="text-text/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove ingredient"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-black/8 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-primary flex-shrink-0">
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
          placeholder="Add ingredient"
          className="flex-1 bg-transparent text-sm text-text placeholder-text/40 focus:outline-none"
        />
      </div>
      <p className="text-xs text-text/40">Press Enter to add</p>
    </div>
  );
}
