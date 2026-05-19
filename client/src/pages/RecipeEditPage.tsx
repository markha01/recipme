import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, updateRecipe } from '../api/recipes';
import type { Recipe } from '../../../shared/types';
import RecipeForm, { RecipeFormData } from '../components/recipe/RecipeForm';
import Spinner from '../components/ui/Spinner';
import SearchBar from '../components/layout/SearchBar';

export default function RecipeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRecipe(id)
      .then(setRecipe)
      .catch(() => setError('Recipe not found'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: RecipeFormData) {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await updateRecipe(id, {
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
      navigate(`/recipes/${id}`, { replace: true });
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex justify-center py-24 text-text/50 text-sm">
        {error ?? 'Recipe not found'}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 md:px-8 md:py-6">
      <div className="mb-4">
        <SearchBar value="" onChange={() => {}} />
      </div>

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
        <h1 className="flex-1 text-lg font-semibold text-text">Edit recipe</h1>
      </div>

      <RecipeForm
        initialData={{
          title: recipe.title,
          imageUrl: recipe.imageUrl,
          servings: recipe.servings,
          prepTimeMin: recipe.prepTimeMin,
          cookTimeMin: recipe.cookTimeMin,
          instructions: recipe.instructions ?? '',
          boardId: recipe.boardId,
          ingredients: recipe.ingredients.map((i) => i.text),
          tags: recipe.tags,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save"
        loading={saving}
        error={error}
      />
    </div>
  );
}
