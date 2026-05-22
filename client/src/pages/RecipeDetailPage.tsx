import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, deleteRecipe } from '../api/recipes';
import type { Recipe } from '../../../shared/types';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function formatTime(min: number | null | undefined): string | null {
  if (!min) return null;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRecipe(id)
      .then(setRecipe)
      .catch(() => setError('Recipe not found'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteRecipe(id);
      navigate('/', { replace: true });
    } catch {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex flex-col items-center py-24 text-text/50">
        <p>{error ?? 'Recipe not found'}</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 md:px-8 md:py-6">
      {/* Header */}
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
        <h1 className="flex-1 text-lg font-semibold text-text truncate">{recipe.title}</h1>
        <button
          onClick={() => navigate(`/recipes/${id}/edit`)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors text-text/60 hover:text-text"
          aria-label="Edit recipe"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors text-text/60 hover:text-red-500"
          aria-label="Delete recipe"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>

      {/* Image */}
      {recipe.imageUrl && (
        <div className="rounded-2xl overflow-hidden aspect-video mb-6">
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => navigate(`/?tagId=${tag.id}&tagName=${encodeURIComponent(tag.name)}`)}
              className="px-3 py-1 bg-secondary/15 text-secondary rounded-full text-sm hover:bg-secondary/30 transition-colors"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Time info */}
      {(recipe.prepTimeMin || recipe.cookTimeMin || recipe.servings) && (
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-2xl border border-black/8">
          {recipe.servings && (
            <div className="flex flex-col">
              <span className="text-xs text-text/50 mb-0.5">Servings</span>
              <span className="font-medium text-text text-sm">{recipe.servings}</span>
            </div>
          )}
          {recipe.prepTimeMin && (
            <div className="flex flex-col">
              <span className="text-xs text-text/50 mb-0.5">Prep</span>
              <span className="font-medium text-text text-sm flex items-center gap-1">
                <ClockIcon /> {formatTime(recipe.prepTimeMin)}
              </span>
            </div>
          )}
          {recipe.cookTimeMin && (
            <div className="flex flex-col">
              <span className="text-xs text-text/50 mb-0.5">Cook</span>
              <span className="font-medium text-text text-sm flex items-center gap-1">
                <ClockIcon /> {formatTime(recipe.cookTimeMin)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Boards */}
      {recipe.boards.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {recipe.boards.map((board) => (
            <div key={board.id} className="flex items-center gap-1.5 text-sm text-text/60">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>{board.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <section className="mb-6">
          <h2 className="font-semibold text-text mb-3">Ingredients</h2>
          <ul className="flex flex-col gap-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex items-start gap-2 text-sm text-text">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                {ing.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Instructions */}
      {recipe.instructions && (
        <section className="mb-6">
          <h2 className="font-semibold text-text mb-3">Instructions</h2>
          <p className="text-sm text-text/80 leading-relaxed whitespace-pre-wrap">
            {recipe.instructions}
          </p>
        </section>
      )}

      {showDeleteModal && (
        <Modal
          title="Delete recipe?"
          message={`"${recipe.title}" will be permanently deleted.`}
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleting}
        />
      )}
    </div>
  );
}
