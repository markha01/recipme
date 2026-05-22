import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ImageUploader from './ImageUploader';
import TimePicker from './TimePicker';
import IngredientList from './IngredientList';
import TagInput from './TagInput';
import BoardSelector from './BoardSelector';
import type { Tag } from '../../../../shared/types';

export interface RecipeFormData {
  title: string;
  imageUrl: string | null;
  servings: number | null;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  instructions: string;
  boardIds: string[];
  ingredients: string[];
  tags: Tag[];
}

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  error?: string | null;
}

export default function RecipeForm({
  initialData,
  onSubmit,
  submitLabel = 'Add',
  loading = false,
  error = null,
}: RecipeFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [servings, setServings] = useState<number | null>(initialData?.servings ?? null);
  const [prepTimeMin, setPrepTimeMin] = useState<number | null>(initialData?.prepTimeMin ?? null);
  const [cookTimeMin, setCookTimeMin] = useState<number | null>(initialData?.cookTimeMin ?? null);
  const [instructions, setInstructions] = useState(initialData?.instructions ?? '');
  const [boardIds, setBoardIds] = useState<string[]>(initialData?.boardIds ?? []);
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients ?? []);
  const [tags, setTags] = useState<Tag[]>(initialData?.tags ?? []);

  const canSubmit = title.trim().length > 0 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    await onSubmit({
      title: title.trim(),
      imageUrl,
      servings,
      prepTimeMin,
      cookTimeMin,
      instructions,
      boardIds,
      ingredients,
      tags,
    });
  }

  function handleServingsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    setServings(raw === '' ? null : parseInt(raw));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-8">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Recipe title"
        required
      />

      <ImageUploader value={imageUrl} onChange={setImageUrl} />

      <Input
        label="Servings"
        value={servings ?? ''}
        onChange={handleServingsChange}
        placeholder="e.g. 4"
        inputMode="numeric"
      />

      <div className="flex gap-6 flex-wrap">
        <TimePicker label="Prep Time" value={prepTimeMin} onChange={setPrepTimeMin} />
        <TimePicker label="Cook Time" value={cookTimeMin} onChange={setCookTimeMin} />
      </div>

      <IngredientList ingredients={ingredients} onChange={setIngredients} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text">Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Describe the cooking steps..."
          rows={6}
          className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-sm text-text placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-150 resize-none"
        />
      </div>

      <BoardSelector value={boardIds} onChange={setBoardIds} />

      <TagInput tags={tags} onChange={setTags} />

      {error && (
        <p className="text-sm text-red-500 px-1">{error}</p>
      )}

      <Button type="submit" disabled={!canSubmit} loading={loading} size="lg">
        {submitLabel}
      </Button>
    </form>
  );
}
