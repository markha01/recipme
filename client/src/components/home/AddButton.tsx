import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBoard } from '../../api/boards';

interface AddButtonProps {
  onBoardCreated?: () => void;
}

export default function AddButton({ onBoardCreated }: AddButtonProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showBoardInput, setShowBoardInput] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (showBoardInput) inputRef.current?.focus();
  }, [showBoardInput]);

  function close() {
    setOpen(false);
    setShowBoardInput(false);
    setBoardName('');
    setError(null);
  }

  function handleToggle() {
    if (open) {
      close();
    } else {
      setOpen(true);
    }
  }

  async function handleCreateBoard() {
    const name = boardName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      await createBoard(name);
      close();
      onBoardCreated?.();
    } catch {
      setError('Could not create board');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div ref={containerRef} className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 flex flex-col items-end gap-2">
      {open && !showBoardInput && (
        <div className="flex flex-col items-end gap-2 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            onClick={() => setShowBoardInput(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg text-text text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all duration-150 whitespace-nowrap"
          >
            New board
          </button>
          <button
            onClick={() => navigate('/recipes/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-lg text-text text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all duration-150 whitespace-nowrap"
          >
            New recipe
          </button>
        </div>
      )}

      {open && showBoardInput && (
        <div className="bg-white rounded-2xl shadow-xl p-3 mb-1 w-56 animate-in fade-in zoom-in-95 duration-150">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <input
            ref={inputRef}
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateBoard();
              if (e.key === 'Escape') { setShowBoardInput(false); setBoardName(''); setError(null); }
            }}
            placeholder="Board name"
            disabled={creating}
            className="w-full text-sm text-text bg-transparent outline-none placeholder-text/40 border-b border-text/20 pb-1 focus:border-primary transition-colors"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleCreateBoard}
              disabled={!boardName.trim() || creating}
              className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-full disabled:opacity-50 active:scale-95 transition-all duration-150"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleToggle}
        aria-label={open ? 'Close menu' : 'Add new'}
        className={`w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-orange-500 active:scale-95 transition-all duration-150 flex items-center justify-center ${open ? 'rotate-45' : ''}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
