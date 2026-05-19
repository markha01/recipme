import { useState, useEffect, useRef } from 'react';
import { listBoards, createBoard } from '../../api/boards';
import type { Board } from '../../../../shared/types';

interface BoardSelectorProps {
  value: string | null;
  onChange: (boardId: string | null) => void;
}

export default function BoardSelector({ value, onChange }: BoardSelectorProps) {
  const [open, setOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listBoards().then(setBoards).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleCreateBoard() {
    const name = newBoardName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      const board = await createBoard(name);
      setBoards((prev) => [...prev, board]);
      onChange(board.id);
      setNewBoardName('');
      setOpen(false);
    } catch (err) {
      setError('Could not create board');
    } finally {
      setCreating(false);
    }
  }

  const selectedBoard = boards.find((b) => b.id === value);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text">Board</span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-black/10 bg-white text-sm text-left transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <span className={selectedBoard ? 'text-text' : 'text-text/40'}>
            {selectedBoard ? selectedBoard.name : 'Select a board (optional)'}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-text/40 transition-transform ${open ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-black/10 shadow-lg z-30 overflow-hidden">
            {value && (
              <button
                type="button"
                onClick={() => { onChange(null); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-text/50 hover:bg-black/5 transition-colors"
              >
                None
              </button>
            )}
            {boards.map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={() => { onChange(board.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/5 ${
                  board.id === value ? 'text-primary font-medium' : 'text-text'
                }`}
              >
                {board.name}
              </button>
            ))}

            <div className="border-t border-black/8 px-3 py-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateBoard(); } }}
                  placeholder="New board name..."
                  className="flex-1 text-sm bg-transparent focus:outline-none text-text placeholder-text/40"
                />
                <button
                  type="button"
                  onClick={handleCreateBoard}
                  disabled={creating || !newBoardName.trim()}
                  className="text-primary hover:text-orange-500 transition-colors disabled:opacity-40"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
