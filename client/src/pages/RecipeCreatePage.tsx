import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecipe } from '../api/recipes';
import RecipeForm, { RecipeFormData } from '../components/recipe/RecipeForm';
import SearchBar from '../components/layout/SearchBar';

export default function RecipeCreatePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(data: RecipeFormData) {
    setLoading(true);
    setError(null);
    try {
      const recipe = await createRecipe({
        title: data.title,
        imageUrl: data.imageUrl,
        servings: data.servings,
        prepTimeMin: data.prepTimeMin,
        cookTimeMin: data.cookTimeMin,
        instructions: data.instructions || null,
        boardId: data.boardId,
        ingredients: data.ingredients.map((text, i) => ({ text, sortOrder: i })),
        tagIds: data.tags.map((t) => t.id),
      });
      navigate(`/recipes/${recipe!.id}`, { replace: true });
    } catch {
      setError('Failed to create recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 md:px-8 md:py-6">
      {/* Persistent search bar (same position as home) */}
      <div className="mb-4">
        <SearchBar value="" onChange={() => {}} />
      </div>

      {/* Header row */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors text-text"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 className="flex-1 text-lg font-semibold text-text">New recipe</h1>
      </div>

      <RecipeForm
        onSubmit={handleSubmit}
        submitLabel="Add"
        loading={loading}
        error={error}
      />
    </div>
  );
}
