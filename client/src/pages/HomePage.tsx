import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listRecipes } from '../api/recipes';
import { listBoards } from '../api/boards';
import type { RecipeSummary, Board, Tag, SortField, SortOrder } from '../../../shared/types';
import SearchBar from '../components/layout/SearchBar';
import TabBar from '../components/home/TabBar';
import RecipeGrid from '../components/home/RecipeGrid';
import BoardGrid from '../components/home/BoardGrid';
import FilterMenu from '../components/home/FilterMenu';
import AddButton from '../components/home/AddButton';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<'recipes' | 'boards'>('recipes');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [sort, setSort] = useState<SortField>('created_at');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read tag filter from URL params (e.g. when navigating from recipe detail page)
  useEffect(() => {
    const tagId = searchParams.get('tagId');
    const tagName = searchParams.get('tagName');
    if (tagId && tagName) {
      setSelectedTag({ id: tagId, name: decodeURIComponent(tagName), userId: '', recipeCount: 0 });
      setSearchParams({}, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecipes = useCallback(
    (searchVal: string, tagId: string | undefined, sortVal: SortField, orderVal: SortOrder) => {
      setLoadingRecipes(true);
      listRecipes({ search: searchVal || undefined, tagId, sort: sortVal, order: orderVal })
        .then(setRecipes)
        .catch(() => setRecipes([]))
        .finally(() => setLoadingRecipes(false));
    },
    []
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchRecipes(search, selectedTag?.id, sort, order);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, selectedTag, sort, order, fetchRecipes]);

  // Load boards when switching to boards tab
  useEffect(() => {
    if (tab === 'boards') {
      setLoadingBoards(true);
      listBoards()
        .then(setBoards)
        .catch(() => setBoards([]))
        .finally(() => setLoadingBoards(false));
    }
  }, [tab]);

  function handleTagSelect(tag: Tag) {
    setSelectedTag(tag);
    setSearch('');
  }

  function handleClearTag() {
    setSelectedTag(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:px-8 md:py-6">
      {/* Search + Filter row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            onTagSelect={handleTagSelect}
            selectedTagId={selectedTag?.id}
            onClearTag={handleClearTag}
          />
        </div>
        {tab === 'recipes' && (
          <FilterMenu sort={sort} order={order} onChange={(s, o) => { setSort(s); setOrder(o); }} />
        )}
      </div>

      {/* Active tag badge */}
      {selectedTag && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-text/60">Filtering by:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/15 text-secondary rounded-full text-sm font-medium">
            {selectedTag.name}
            <button onClick={handleClearTag} className="hover:text-red-500 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        </div>
      )}

      {/* Tabs */}
      <TabBar activeTab={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === 'recipes' ? (
          <RecipeGrid
            recipes={recipes}
            loading={loadingRecipes}
            emptyMessage={search || selectedTag ? 'No recipes match your search' : 'No recipes yet. Tap + to add one!'}
          />
        ) : (
          <BoardGrid boards={boards} loading={loadingBoards} />
        )}
      </div>

      <AddButton />
    </div>
  );
}
