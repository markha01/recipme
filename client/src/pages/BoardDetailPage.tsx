import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard } from '../api/boards';
import type { RecipeSummary } from '../../../shared/types';
import RecipeGrid from '../components/home/RecipeGrid';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

export default function BoardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState<string>('');
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBoard(id)
      .then((data) => {
        setBoardName(data.name);
        setRecipes(data.recipes);
      })
      .catch(() => setError('Board not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-24 text-text/50">
        <p>{error}</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:px-8 md:py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors text-text"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-text truncate">{boardName}</h1>
          <p className="text-xs text-text/50 mt-0.5">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </p>
        </div>
      </div>

      <RecipeGrid
        recipes={recipes}
        emptyMessage="No recipes in this board yet."
      />
    </div>
  );
}
