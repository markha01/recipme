import { NavLink } from 'react-router-dom';

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-150 text-xs font-medium ${
      isActive ? 'text-primary' : 'text-text/50 hover:text-text/80'
    }`;

  return (
    <>
      {/* Desktop: top bar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 h-16 bg-background border-b border-black/8 items-center px-8 justify-between">
        <span className="text-primary font-bold text-xl tracking-tight">RecipMe</span>
        <div className="flex gap-2">
          <NavLink to="/" end className={linkClass}>
            <HomeIcon />
            <span>Home</span>
          </NavLink>
          <NavLink to="/account" className={linkClass}>
            <AccountIcon />
            <span>Account</span>
          </NavLink>
        </div>
      </nav>

      {/* Mobile: bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-background border-t border-black/8 flex items-center justify-around px-4">
        <NavLink to="/" end className={linkClass}>
          <HomeIcon />
          <span>Home</span>
        </NavLink>
        <NavLink to="/account" className={linkClass}>
          <AccountIcon />
          <span>Account</span>
        </NavLink>
      </nav>
    </>
  );
}
