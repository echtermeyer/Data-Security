import { Link } from "react-router-dom";
import Footer from "../components/Footer";

function Landing() {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-2 p-4">
            {[...Array(32)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-cyan-400/20 rounded"
              ></div>
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-500 bg-clip-text text-transparent pb-2">
              Image Watermarking & Robustness
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Safeguarding content authenticity in the era of AI-generated
              images
            </p>
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 justify-center mb-6 max-w-fit mx-auto">
              <Link
                to="/challenge"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02]"
              >
                Try Challenge Mode
              </Link>
              <Link
                to="/benchmark"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-500 hover:to-sky-500 transition-all shadow-lg hover:shadow-blue-500/50 transform hover:scale-[1.02]"
              >
                Run Benchmark
              </Link>
              <a
                href="#"
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md text-white px-8 py-2.5 rounded-xl text-sm font-medium hover:bg-white/30 transition-all border border-cyan-400/30 hover:border-cyan-400/50 shadow-lg"
              >
                <span>↓</span>
                Download Research Paper (PDF)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is Watermarking */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent mb-6">
              What is Digital Watermarking?
            </h2>
            <p className="text-lg text-slate-700 mb-4">
              Digital watermarking embeds invisible information directly into
              images to verify authenticity, protect copyright, and ensure
              content integrity. As AI-generated images become indistinguishable
              from real photographs, watermarking has emerged as a critical tool
              for content attribution.
            </p>
            <p className="text-lg text-slate-700 mb-4">
              Unlike metadata that can be easily stripped, watermarks are
              embedded within the pixel data itself, making them more resistant
              to tampering and removal.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
                <span className="font-semibold text-slate-800">
                  Authenticity
                </span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-lg">
                <span className="font-semibold text-slate-800">Copyright</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-lg">
                <span className="font-semibold text-slate-800">Integrity</span>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden">
            <div className="space-y-2">
              {[...Array(6)].map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex gap-2 animate-scroll"
                  style={{
                    animation: `scroll-${
                      rowIndex % 2 === 0 ? "right" : "left"
                    } ${40 + rowIndex * 5}s linear infinite`,
                  }}
                >
                  {[...Array(12)].map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="aspect-square w-20 flex-shrink-0 rounded-lg shadow-sm hover:shadow-lg transition-all transform hover:scale-110 border border-cyan-200 overflow-hidden bg-slate-100"
                    >
                      <img
                        src={`https://picsum.photos/seed/${
                          rowIndex * 12 + colIndex + 100
                        }/80/80`}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {[...Array(12)].map((_, colIndex) => (
                    <div
                      key={`dup-${colIndex}`}
                      className="aspect-square w-20 flex-shrink-0 rounded-lg shadow-sm hover:shadow-lg transition-all transform hover:scale-110 border border-cyan-200 overflow-hidden bg-slate-100"
                    >
                      <img
                        src={`https://picsum.photos/seed/${
                          rowIndex * 12 + colIndex + 100
                        }/80/80`}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <style>{`
              @keyframes scroll-right {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              @keyframes scroll-left {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* Watermarking Categories */}
      <section className="bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent text-center mb-4">
            Watermarking Techniques
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Different approaches to embedding and protecting watermarks in
            digital images
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* LSB */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-cyan-200 hover:border-cyan-300">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <span className="text-white font-bold text-2xl">LSB</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Spatial Domain
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Least Significant Bit
              </p>
              <p className="text-slate-700 mb-4">
                Modifies the lowest bits of pixel values to embed watermark data
                with minimal visual impact.
              </p>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>Simple implementation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>High capacity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>Vulnerable to compression</span>
                </li>
              </ul>
            </div>

            {/* Transform Domain */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-blue-200 hover:border-blue-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <span className="text-white font-bold text-xl">DCT</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Transform Domain
              </h3>
              <p className="text-sm text-slate-500 mb-4">DCT, DWT, FFT</p>
              <p className="text-slate-700 mb-4">
                Embeds watermarks in frequency transform coefficients, offering
                better robustness to attacks.
              </p>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Robust to compression</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Resistant to filtering</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>More complex</span>
                </li>
              </ul>
            </div>

            {/* Deep Learning */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-sky-200 hover:border-sky-300">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <span className="text-white font-bold text-xl">DL</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Deep Learning
              </h3>
              <p className="text-sm text-slate-500 mb-4">Neural Networks</p>
              <p className="text-slate-700 mb-4">
                Neural network-based approaches that learn to embed watermarks
                with superior imperceptibility and robustness.
              </p>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-1">•</span>
                  <span>Adaptive embedding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-1">•</span>
                  <span>Superior robustness</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-500 mt-1">•</span>
                  <span>Requires training data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Modes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent text-center mb-12">
          Explore Watermark Security
        </h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Challenge Mode */}
          <div className="relative bg-gradient-to-br from-cyan-50 to-blue-50 p-10 rounded-2xl shadow-xl border-2 border-cyan-200 hover:shadow-2xl transition-all">
            <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Featured
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              Challenge Mode
            </h3>
            <p className="text-slate-700 mb-6 text-lg">
              Put watermarks to the test! Upload your image and message, then
              try to destroy the watermark using common image transformations.
              See how robust different techniques really are.
            </p>
            <ul className="space-y-3 mb-8 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 text-xl">✓</span>
                <span>Interactive attack simulation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 text-xl">✓</span>
                <span>Real-time robustness testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 text-xl">✓</span>
                <span>Progressive difficulty levels</span>
              </li>
            </ul>
            <Link
              to="/challenge"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/50 w-full transform hover:scale-[1.02]"
            >
              Start Challenge
            </Link>
          </div>

          {/* Benchmark Mode */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-10 rounded-2xl shadow-xl border-2 border-blue-200 hover:shadow-2xl transition-all">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              Benchmark Mode
            </h3>
            <p className="text-slate-700 mb-6 text-lg">
              Compare watermarking algorithms side-by-side. Analyze
              imperceptibility metrics, embedding efficiency, and extraction
              accuracy across multiple techniques.
            </p>
            <ul className="space-y-3 mb-8 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 text-xl">✓</span>
                <span>Multi-algorithm comparison</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 text-xl">✓</span>
                <span>Comprehensive robustness tests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 text-xl">✓</span>
                <span>Performance metrics analysis</span>
              </li>
            </ul>
            <Link
              to="/benchmark"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-500 hover:to-sky-500 transition-all shadow-lg hover:shadow-blue-500/50 w-full transform hover:scale-[1.02]"
            >
              Run Benchmark
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;
