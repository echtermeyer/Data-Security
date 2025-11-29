import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="bg-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-white text-xl font-bold hover:text-gray-300 transition">
            Watermark Security Lab
          </Link>
          <div className="flex gap-6">
            <Link to="/challenge" className="text-white hover:text-gray-300 transition">
              Challenge Mode
            </Link>
            <Link to="/benchmark" className="text-white hover:text-gray-300 transition">
              Benchmark Mode
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;