import { useNavigate } from 'react-router-dom';

export default function AddButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/recipes/new')}
      aria-label="Add new recipe"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-orange-500 active:scale-95 transition-all duration-150 flex items-center justify-center"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
