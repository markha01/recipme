import { Link } from 'react-router-dom';
import type { Board } from '../../../../shared/types';

interface BoardCardProps {
  board: Board;
}

export default function BoardCard({ board }: BoardCardProps) {
  const validImages = (board.previewImages ?? []).filter((img): img is string => img !== null);
  const n = validImages.length;

  return (
    <Link
      to={`/boards/${board.id}`}
      className="flex flex-col rounded-2xl overflow-hidden bg-white border border-black/8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Pinterest-style image mosaic */}
      <div className="h-36 bg-primary/5 flex gap-0.5 overflow-hidden">
        {n === 0 && (
          <div className="flex-1 flex items-center justify-center text-primary/30">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        )}
        {n === 1 && (
          <img src={validImages[0]} alt="" className="w-full h-full object-cover" />
        )}
        {n === 2 && (
          <>
            <div className="flex-1 overflow-hidden">
              <img src={validImages[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 overflow-hidden">
              <img src={validImages[1]} alt="" className="w-full h-full object-cover" />
            </div>
          </>
        )}
        {n >= 3 && (
          <>
            <div className="flex-[3] overflow-hidden">
              <img src={validImages[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-[2] flex flex-col gap-0.5 overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <img src={validImages[1]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 overflow-hidden">
                <img src={validImages[2]} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Board name + recipe count */}
      <div className="p-3">
        <h3 className="font-medium text-text text-sm">{board.name}</h3>
        <p className="text-xs text-text/50 mt-0.5">
          {board.recipeCount} {board.recipeCount === 1 ? 'recipe' : 'recipes'}
        </p>
      </div>
    </Link>
  );
}
