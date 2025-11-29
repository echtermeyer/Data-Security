function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-300 mt-20 border-t border-blue-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Project Information
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Research project conducted as part of the Data Science & Ethics
              curriculum at Ludwig-Maximilians-Universität München under the
              supervision of Prof. Dr. D. Kranzlmüller, Jan Schmidt, and Fabio
              Genz.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-white text-sm font-semibold mb-3 bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
              Research Team
            </h3>
            <ul className="space-y-1 text-sm text-slate-400">
              <li className="hover:text-cyan-400 transition-colors">
                Fanni Büki
              </li>
              <li className="hover:text-cyan-400 transition-colors">
                David B. Hoffmann
              </li>
              <li className="hover:text-cyan-400 transition-colors">
                Eric Echtermeyer
              </li>
            </ul>
          </div>

          <div className="text-right">
            <h3 className="text-white text-sm font-semibold mb-3 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              Resources
            </h3>
            <div className="space-y-2">
              <a
                href="https://github.com/echtermeyer/Data-Security"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-2"
              >
                <span>View on GitHub</span>
                <span>→</span>
              </a>
              <br />
              <a
                href="https://github.com/echtermeyer/Data-Security"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-2"
              >
                <span>Research Paper</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-900/30 pt-6 text-center text-xs text-slate-500">
          <p>© 2025 Ludwig-Maximilians-Universität München</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
