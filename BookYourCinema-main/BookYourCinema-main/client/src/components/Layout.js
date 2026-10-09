import { Link, Outlet } from 'react-router-dom';
import UserAuth from './Auth/UserAuth';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { session } = useAuth();
  return (
    <>
      <header className="site-header">
        <div className="nav-inner">
          <Link className="brand" to="/"><span className="brand-mark">B</span><span>book<span className="brand-accent">your</span>cinema</span></Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link to="/">Movies</Link>
            {session?.role === 'user' && <Link to="/bookings">My bookings</Link>}
            <Link to="/admin">List your cinema</Link>
          </nav>
          <UserAuth />
        </div>
      </header>
      <Outlet />
      <footer className="site-footer"><Link className="brand" to="/"><span className="brand-mark">B</span><span>book<span className="brand-accent">your</span>cinema</span></Link><p>Good stories belong on the big screen.</p><span>© {new Date().getFullYear()} BookYourCinema</span></footer>
    </>
  );
}
