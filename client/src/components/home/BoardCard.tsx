import { Link } from 'react-router-dom';
import type { Board } from '../../../../shared/types';

interface BoardCardProps {
  board: Board;
}

export default function BoardCard({ board }: BoardCardProps) {
  return (
    <Link
      to={`/?boardId=${board.id}`}
      className="flex flex-col rounded-2xl overflow-hidden bg-white border border-black/8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 gap-2"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div>
        <h3 className="font-medium text-text text-sm">{board.name}</h3>
        <p className="text-xs text-text/50 mt-0.5">
          {board.recipeCount} {board.recipeCount === 1 ? 'recipe' : 'recipes'}
        </p>
      </div>
    </Link>
  );
}
