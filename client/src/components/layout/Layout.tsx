import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Content area with padding for navbar */}
      <main className="md:pt-16 pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
