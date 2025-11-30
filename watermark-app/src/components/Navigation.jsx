import { Link } from "react-router-dom";
import { useState } from "react";

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 shadow-lg border-b border-blue-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link
            to="/"
            className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-500 bg-clip-text text-lg sm:text-xl font-bold hover:from-cyan-300 hover:via-blue-300 hover:to-sky-400 transition-all"
            onClick={() => setIsMenuOpen(false)}
          >
            Waterbench
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex gap-2">
            <Link
              to="/challenge"
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-200 hover:text-white hover:bg-blue-900/30 rounded-lg transition-all font-medium"
            >
              Challenge
            </Link>
            <Link
              to="/benchmark"
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-200 hover:text-white hover:bg-blue-900/30 rounded-lg transition-all font-medium"
            >
              Benchmark
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="sm:hidden p-2 text-slate-200 hover:text-white hover:bg-blue-900/30 rounded-lg transition-all"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-blue-900/30 py-2">
            <Link
              to="/challenge"
              className="block px-4 py-2.5 text-slate-200 hover:text-white hover:bg-blue-900/30 rounded-lg transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Challenge
            </Link>
            <Link
              to="/benchmark"
              className="block px-4 py-2.5 text-slate-200 hover:text-white hover:bg-blue-900/30 rounded-lg transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Benchmark
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
