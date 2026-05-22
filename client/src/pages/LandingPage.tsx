import { Link } from 'react-router-dom';

function BookIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function BoardsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

const features = [
  {
    icon: <BookIcon />,
    title: 'Write your recipes',
    description: 'Save your favourite dishes with ingredients, steps, times, and photos — all in one place.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: <BoardsIcon />,
    title: 'Organise with boards',
    description: 'Group recipes into boards like "Weeknight dinners" or "Holiday baking" to keep things tidy.',
    color: 'bg-secondary/15 text-secondary',
  },
  {
    icon: <SearchIcon />,
    title: 'Find anything fast',
    description: 'Search by name or tag so your go-to recipes are always a tap away.',
    color: 'bg-primary/10 text-primary',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <span className="text-primary text-3xl leading-none">
          <span style={{ fontFamily: "'Kalam', cursive" }}>Recip</span>
          <span style={{ fontFamily: "'Homemade Apple', cursive" }}>Me</span>
        </span>
        <Link
          to="/login"
          className="text-sm font-medium text-text/60 hover:text-text transition-colors duration-150"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-xl mx-auto">
          {/* Decorative food row */}
          <div className="flex justify-center gap-3 text-3xl mb-8 select-none" aria-hidden>
            <span>🥘</span>
            <span>🥗</span>
            <span>🍰</span>
            <span>🍝</span>
            <span>🫐</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-text leading-tight mb-4">
            Your personal{' '}
            <span className="text-primary" style={{ fontFamily: "'Kalam', cursive" }}>
              recipe book
            </span>
            , always with you.
          </h1>

          <p className="text-text/60 text-lg leading-relaxed mb-10 max-w-md mx-auto">
            Write, organise, and rediscover the recipes that matter to you — all in a cosy little corner of the internet.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-primary text-white font-semibold text-base shadow-sm hover:bg-primary/90 active:scale-95 transition-all duration-150"
            >
              Get started — it's free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-black/10 text-text font-medium text-base hover:bg-black/5 active:scale-95 transition-all duration-150"
            >
              I already have an account
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 text-left shadow-sm border border-black/5"
            >
              <div className={`inline-flex p-2.5 rounded-xl mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-text text-base mb-1">{f.title}</h3>
              <p className="text-text/55 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-text/30 text-xs">
        RecipMe — made with love for home cooks
      </footer>
    </div>
  );
}
