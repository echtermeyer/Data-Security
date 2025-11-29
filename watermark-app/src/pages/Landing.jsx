import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Image,
  Cpu,
  Layers,
  Target,
  FlaskConical,
  Mail,
  Github,
  Linkedin,
} from "lucide-react";

function Landing() {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-2 p-4">
            {[...Array(32)].map((_, i) => (
              <div key={i} className="aspect-square bg-white/20 rounded"></div>
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <ShieldCheck className="w-20 h-20 text-cyan-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
              Image Watermarking & Robustness
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Safeguarding content authenticity in the era of AI-generated
              images
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/challenge"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition shadow-lg hover:shadow-xl"
              >
                <Target className="w-5 h-5" />
                Try Challenge Mode
              </Link>
              <Link
                to="/benchmark"
                className="inline-flex items-center gap-2 bg-cyan-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-cyan-600 transition shadow-lg hover:shadow-xl"
              >
                <FlaskConical className="w-5 h-5" />
                Run Benchmark
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is Watermarking */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              What is Digital Watermarking?
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Digital watermarking embeds invisible information directly into
              images to verify authenticity, protect copyright, and ensure
              content integrity. As AI-generated images become indistinguishable
              from real photographs, watermarking has emerged as a critical tool
              for content attribution.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Unlike metadata that can be easily stripped, watermarks are
              embedded within the pixel data itself, making them more resistant
              to tampering and removal.
            </p>
            <div className="flex gap-4 mt-8">
              <div className="flex items-center gap-2 text-cyan-600">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-semibold">Authenticity</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-600">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-semibold">Copyright</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-600">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-semibold">Integrity</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gradient-to-br from-cyan-100 to-slate-200 rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Watermarking Categories */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-800 text-center mb-4">
            Watermarking Techniques
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Different approaches to embedding and protecting watermarks in
            digital images
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* LSB */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition border-t-4 border-blue-500">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Layers className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                LSB (Spatial Domain)
              </h3>
              <p className="text-gray-700 mb-4">
                Least Significant Bit techniques modify the lowest bits of pixel
                values to embed watermark data with minimal visual impact.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Simple implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>High capacity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Vulnerable to compression</span>
                </li>
              </ul>
            </div>

            {/* Transform Domain */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition border-t-4 border-cyan-500">
              <div className="w-16 h-16 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Transform Domain
              </h3>
              <p className="text-gray-700 mb-4">
                Frequency-based methods (DCT, DWT, FFT) embed watermarks in
                transform coefficients, offering better robustness to attacks.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>Robust to compression</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>Resistant to filtering</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>More complex</span>
                </li>
              </ul>
            </div>

            {/* Deep Learning */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition border-t-4 border-indigo-500">
              <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Cpu className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Deep Learning
              </h3>
              <p className="text-gray-700 mb-4">
                Neural network-based approaches learn to embed watermarks that
                are both imperceptible and highly robust to various attacks.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>Adaptive embedding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>Superior robustness</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>Requires training data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Modes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-slate-800 text-center mb-12">
          Explore Watermark Security
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Challenge Mode */}
          <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 p-10 rounded-2xl shadow-xl border-2 border-purple-200">
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Featured
            </div>
            <Target className="w-16 h-16 text-purple-600 mb-6" />
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              Challenge Mode
            </h3>
            <p className="text-gray-700 mb-6 text-lg">
              Put watermarks to the test! Upload your image and message, then
              try to destroy the watermark using common image transformations.
              See how robust different techniques really are.
            </p>
            <ul className="space-y-3 mb-8 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 text-xl">✓</span>
                <span>Interactive attack simulation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 text-xl">✓</span>
                <span>Real-time robustness testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 text-xl">✓</span>
                <span>Progressive difficulty levels</span>
              </li>
            </ul>
            <Link
              to="/challenge"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition shadow-lg hover:shadow-xl w-full justify-center"
            >
              <Target className="w-5 h-5" />
              Start Challenge
            </Link>
          </div>

          {/* Benchmark Mode */}
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-10 rounded-2xl shadow-xl border-2 border-cyan-200">
            <FlaskConical className="w-16 h-16 text-cyan-600 mb-6" />
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              Benchmark Mode
            </h3>
            <p className="text-gray-700 mb-6 text-lg">
              Compare watermarking algorithms side-by-side. Analyze
              imperceptibility metrics, embedding efficiency, and extraction
              accuracy across multiple techniques.
            </p>
            <ul className="space-y-3 mb-8 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 text-xl">✓</span>
                <span>Multi-algorithm comparison</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 text-xl">✓</span>
                <span>Comprehensive robustness tests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 text-xl">✓</span>
                <span>Performance metrics analysis</span>
              </li>
            </ul>
            <Link
              to="/benchmark"
              className="inline-flex items-center gap-2 bg-cyan-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-cyan-600 transition shadow-lg hover:shadow-xl w-full justify-center"
            >
              <FlaskConical className="w-5 h-5" />
              Run Benchmark
            </Link>
          </div>
        </div>
      </section>

      {/* Research Paper Section */}
      <section className="bg-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Research Paper</h2>
          <p className="text-gray-300 mb-8 text-lg">
            This project is part of our research on digital watermarking
            security and robustness. Read our full findings and methodology.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-white text-slate-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Paper (PDF)
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Project Info */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">
                About This Project
              </h3>
              <p className="text-gray-400 text-sm">
                Part of the Data Science & Ethics course at
                Ludwig-Maximilians-Universität München, supervised by Prof. Dr.
                D. Kranzlmüller, Jan Schmidt, and Fabio Genz.
              </p>
            </div>

            {/* Team */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">
                Research Team
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Fanni Büki</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>David B. Hoffmann</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Eric Echtermeyer</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <a
                  href="mailto:contact@watermark-security.com"
                  className="flex items-center gap-2 text-sm hover:text-cyan-400 transition"
                >
                  <Mail className="w-4 h-4" />
                  <span>contact@watermark-security.com</span>
                </a>
                <a
                  href="https://github.com"
                  className="flex items-center gap-2 text-sm hover:text-cyan-400 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4" />
                  <span>View on GitHub</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm text-gray-500">
            <p>
              © 2025 Watermark Security Lab - Ludwig-Maximilians-Universität
              München
            </p>
            <p className="mt-2">Munich Network Management Team</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
