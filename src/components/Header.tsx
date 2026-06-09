import { Sun, Moon, Calendar, UserCheck } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onAdminClick: () => void;
  isAdminLoggedIn: boolean;
  onBookClick: () => void;
  onLogout: () => void;
}

export default function Header({
  darkMode,
  setDarkMode,
  onAdminClick,
  isAdminLoggedIn,
  onBookClick,
  onLogout
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/75 dark:bg-[#050505]/75 border-b border-slate-200/50 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-gold to-gold-dark flex items-center justify-center font-serif font-black text-black text-xl shadow-[0_0_20px_rgba(197,160,89,0.3)]">
            BV
          </div>
          <span className="text-xl font-light tracking-widest uppercase text-slate-900 dark:text-white font-display">
            Book your friend <span className="font-serif italic font-normal text-gold">Vikas</span>
          </span>
        </div>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => {
              const el = document.getElementById('services');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden md:inline-flex px-3 py-2 text-sm font-medium text-slate-600 dark:text-white/60 hover:text-gold dark:hover:text-gold transition-colors"
          >
            Services
          </button>
          
          <button
            onClick={() => {
              const el = document.getElementById('testimonials');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden md:inline-flex px-3 py-2 text-sm font-medium text-slate-600 dark:text-white/60 hover:text-gold dark:hover:text-gold transition-colors"
          >
            Testimonials
          </button>

          {/* Theme switcher */}
          <button
            id="theme-Toggle"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="h-4 w-4 text-gold" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Admin panel link / control */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onAdminClick}
                className="px-5 py-2.5 text-xs font-semibold rounded-full bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-all flex items-center gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Dashboard
              </button>
              <button
                onClick={onLogout}
                className="hidden sm:inline-flex px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-550/10 rounded-full transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onAdminClick}
              className="px-5 py-2.5 text-xs font-medium border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-white/80 transition-all"
            >
              Admin Login
            </button>
          )}

          {/* CTA Primary */}
          <button
            onClick={onBookClick}
            className="px-6 py-2.5 text-xs font-bold rounded-full bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-gold dark:hover:bg-gold hover:text-black dark:hover:text-black hover:shadow-[0_0_15px_rgba(197,160,89,0.4)] transition-all uppercase tracking-widest"
          >
            Book Session
          </button>
        </nav>
      </div>
    </header>
  );
}
