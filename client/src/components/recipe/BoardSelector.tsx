import { useState, useEffect, useRef } from 'react';
import { listBoards, createBoard } from '../../api/boards';
import type { Board } from '../../../../shared/types';

interface BoardSelectorProps {
  value: string[];
  onChange: (boardIds: string[]) => void;
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
      onChange([...value, board.id]);
      setNewBoardName('');
    } catch {
      setError('Could not create board');
    } finally {
      setCreating(false);
    }
  }

  function toggleBoard(boardId: string) {
    if (value.includes(boardId)) {
      onChange(value.filter((id) => id !== boardId));
    } else {
      onChange([...value, boardId]);
    }
  }

  const selectedBoards = boards.filter((b) => value.includes(b.id));
  const triggerLabel =
    selectedBoards.length === 0
      ? 'Select boards (optional)'
      : selectedBoards.length === 1
      ? selectedBoards[0].name
      : selectedBoards.length === 2
      ? selectedBoards.map((b) => b.name).join(', ')
      : `${selectedBoards.length} boards selected`;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text">Board</span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-black/10 bg-white text-sm text-left transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <span className={selectedBoards.length > 0 ? 'text-text' : 'text-text/40'}>
            {triggerLabel}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-text/40 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-black/10 shadow-lg z-30 overflow-hidden">
            {boards.length === 0 && (
              <p className="px-4 py-2.5 text-sm text-text/40">No boards yet</p>
            )}
            {boards.map((board) => {
              const selected = value.includes(board.id);
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => toggleBoard(board.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/5 flex items-center justify-between ${
                    selected ? 'text-primary font-medium' : 'text-text'
                  }`}
                >
                  <span>{board.name}</span>
                  {selected && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}

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
