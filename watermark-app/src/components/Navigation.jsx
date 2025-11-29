import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 shadow-lg border-b border-blue-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-500 bg-clip-text text-xl font-bold hover:from-cyan-300 hover:via-blue-300 hover:to-sky-400 transition-all"
          >
            Watermark Security Lab
          </Link>
          <div className="flex gap-2">
            <Link
              to="/challenge"
              className="px-4 py-2 text-slate-200 hover:text-white hover:bg-blue-900/30 rounded-lg transition-all font-medium"
            >
              Challenge Mode
            </Link>
            <Link
              to="/benchmark"
              className="px-4 py-2 text-slate-200 hover:text-white hover:bg-blue-900/30 rounded-lg transition-all font-medium"
            >
              Benchmark Mode
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
