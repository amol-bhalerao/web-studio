import { motion } from 'framer-motion';
import {
  FileText,
  FolderTree,
  Images,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  ListTree,
  LogOut,
  Menu,
  Home,
  Newspaper,
  PanelTop,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { setToken } from '../api/client';
import clsx from 'clsx';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-indigo-600/20 text-white ring-1 ring-indigo-500/30'
      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
  );

export function AdminLayout({ contentOnly }: { contentOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function logout() {
    setToken(null);
    if (contentOnly) {
      window.location.assign('/login');
    } else {
      navigate('/login', { replace: true });
    }
  }

  if (contentOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ink-950 via-slate-950 to-indigo-950/30">
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-4 lg:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-950 via-slate-950 to-indigo-950/30">
      <div className="lg:flex">
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-800/80 bg-slate-950/90 shadow-panel backdrop-blur-xl transition-transform lg:static lg:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-6">
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              Web Studio
            </span>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            <NavLink to="." end className={linkClass}>
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              Dashboard
            </NavLink>
            <NavLink to="posts" className={linkClass}>
              <FileText className="h-5 w-5 shrink-0" />
              Posts
            </NavLink>
            <NavLink to="categories" className={linkClass}>
              <FolderTree className="h-5 w-5 shrink-0" />
              Categories
            </NavLink>
            <NavLink to="carousel" className={linkClass}>
              <Images className="h-5 w-5 shrink-0" />
              Carousel
            </NavLink>
            <NavLink to="news-events" className={linkClass}>
              <Newspaper className="h-5 w-5 shrink-0" />
              News &amp; events
            </NavLink>
            <NavLink to="home-page" className={linkClass}>
              <Home className="h-5 w-5 shrink-0" />
              Home page
            </NavLink>
            <NavLink to="header-footer" className={linkClass}>
              <LayoutTemplate className="h-5 w-5 shrink-0" />
              Header &amp; footer
            </NavLink>
            <NavLink to="account" className={linkClass}>
              <User className="h-5 w-5 shrink-0" />
              Account
            </NavLink>
            <NavLink to="site-pages" className={linkClass}>
              <PanelTop className="h-5 w-5 shrink-0" />
              Site pages
            </NavLink>
            <NavLink to="gallery-media" className={linkClass}>
              <LayoutGrid className="h-5 w-5 shrink-0" />
              Gallery media
            </NavLink>
            <NavLink to="navigation" className={linkClass}>
              <ListTree className="h-5 w-5 shrink-0" />
              Navigation
            </NavLink>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800/80 p-4">
            <button
              type="button"
              onClick={logout}
              className="admin-btn-ghost w-full justify-start text-slate-400 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            aria-label="Close overlay"
            onClick={() => setOpen(false)}
          />
        )}

        <div className="min-h-screen flex-1 lg:pl-0">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-800/80 bg-slate-950/80 px-4 backdrop-blur-xl lg:px-8">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="font-display text-sm font-medium text-slate-300">Admin</div>
          </header>
          <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 lg:p-8"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </div>
  );
}
