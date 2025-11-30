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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-500 bg-clip-text text-transparent pb-2">
              Secure Image Ownership & Watermarking
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
              Claim cryptographic ownership of your images and test watermark
              resilience against real-world attacks
            </p>
            <div className="flex flex-col gap-3 sm:gap-4 justify-center mb-6 max-w-md sm:max-w-fit mx-auto">
              <Link
                to="/ownership"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:from-emerald-500 hover:to-cyan-500 transition-all shadow-lg hover:shadow-emerald-500/50 transform hover:scale-[1.02]"
              >
                🔐 Claim Ownership
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/challenge"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02]"
                >
                  Try Challenge
                </Link>
                <Link
                  to="/benchmark"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:from-blue-500 hover:to-sky-500 transition-all shadow-lg hover:shadow-blue-500/50 transform hover:scale-[1.02]"
                >
                  Run Benchmark
                </Link>
              </div>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 sm:px-8 py-2.5 rounded-xl text-sm font-medium hover:bg-white/30 transition-all border border-cyan-400/30 hover:border-cyan-400/50 shadow-lg"
              >
                <span>↓</span>
                Download Research Paper (PDF)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is Watermarking */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent mb-4 sm:mb-6">
              Digital Watermarking & Ownership
            </h2>
            <p className="text-base sm:text-lg text-slate-700 mb-3 sm:mb-4">
              Digital watermarking embeds invisible information directly into
              images to verify authenticity, protect copyright, and ensure
              content integrity. As AI-generated images become indistinguishable
              from real photographs, watermarking has emerged as a critical tool
              for content attribution.
            </p>
            <p className="text-base sm:text-lg text-slate-700 mb-3 sm:mb-4">
              Our platform goes beyond simple watermarking by implementing{" "}
              <strong>cryptographic ownership claims</strong> - using public-key
              cryptography to create mathematically verifiable proof of
              authorship that cannot be forged or disputed.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-lg">
                <span className="font-semibold text-sm sm:text-base text-slate-800">
                  Ownership
                </span>
              </div>
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
                <span className="font-semibold text-sm sm:text-base text-slate-800">
                  Authenticity
                </span>
              </div>
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-lg">
                <span className="font-semibold text-sm sm:text-base text-slate-800">
                  Copyright
                </span>
              </div>
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-lg">
                <span className="font-semibold text-sm sm:text-base text-slate-800">
                  Integrity
                </span>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden h-64 sm:h-80 md:h-auto">
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
                      className="aspect-square w-16 sm:w-20 flex-shrink-0 rounded-lg shadow-sm hover:shadow-lg transition-all transform hover:scale-110 border border-cyan-200 overflow-hidden bg-slate-100"
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
                      className="aspect-square w-16 sm:w-20 flex-shrink-0 rounded-lg shadow-sm hover:shadow-lg transition-all transform hover:scale-110 border border-cyan-200 overflow-hidden bg-slate-100"
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
      <section className="bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent text-center mb-3 sm:mb-4">
            Watermarking Techniques
          </h2>
          <p className="text-sm sm:text-base text-slate-600 text-center mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Different approaches to embedding and protecting watermarks in
            digital images
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* LSB */}
            <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-cyan-200 hover:border-cyan-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-md">
                <span className="text-white font-bold text-xl sm:text-2xl">
                  LSB
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                Spatial Domain
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
                Least Significant Bit
              </p>
              <p className="text-sm sm:text-base text-slate-700 mb-3 sm:mb-4">
                Modifies the lowest bits of pixel values to embed watermark data
                with minimal visual impact.
              </p>
              <ul className="space-y-2 text-slate-600 text-xs sm:text-sm">
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
            <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-blue-200 hover:border-blue-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-md">
                <span className="text-white font-bold text-lg sm:text-xl">
                  DCT
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                Transform Domain
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
                DCT, DWT, FFT
              </p>
              <p className="text-sm sm:text-base text-slate-700 mb-3 sm:mb-4">
                Embeds watermarks in frequency transform coefficients, offering
                better robustness to attacks.
              </p>
              <ul className="space-y-2 text-slate-600 text-xs sm:text-sm">
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
            <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-sky-200 hover:border-sky-300 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-md">
                <span className="text-white font-bold text-lg sm:text-xl">
                  DL
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                Deep Learning
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
                Neural Networks
              </p>
              <p className="text-sm sm:text-base text-slate-700 mb-3 sm:mb-4">
                Neural network-based approaches that learn to embed watermarks
                with superior imperceptibility and robustness.
              </p>
              <ul className="space-y-2 text-slate-600 text-xs sm:text-sm">
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

      {/* Ownership Claims Feature - NEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-emerald-200">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="inline-flex items-center gap-2 bg-emerald-100 px-3 py-1 rounded-full mb-4">
                <span className="text-emerald-700 font-semibold text-xs sm:text-sm">
                  ✨ NEW FEATURE
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                Cryptographic Ownership Claims
              </h2>
              <p className="text-base sm:text-lg text-slate-700 mb-4">
                Prove you created an image with mathematically verifiable
                cryptographic signatures. Unlike simple watermarks that can be
                forged, ownership claims use public-key cryptography to create
                unfalsifiable proof of authorship.
              </p>
              <ul className="space-y-3 mb-6 sm:mb-8 text-sm sm:text-base text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 text-lg sm:text-xl mt-0.5">
                    ✓
                  </span>
                  <span>
                    <strong>Digital signatures:</strong> Cryptographically sign
                    your images with RSA-2048
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 text-lg sm:text-xl mt-0.5">
                    ✓
                  </span>
                  <span>
                    <strong>Verifiable proof:</strong> Anyone can verify
                    ownership without your private key
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 text-lg sm:text-xl mt-0.5">
                    ✓
                  </span>
                  <span>
                    <strong>Timestamped claims:</strong> Prove you had the image
                    at a specific date and time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 text-lg sm:text-xl mt-0.5">
                    ✓
                  </span>
                  <span>
                    <strong>Tamper detection:</strong> Detect if an image has
                    been modified since signing
                  </span>
                </li>
              </ul>
              <Link
                to="/ownership"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:from-emerald-500 hover:to-cyan-500 transition-all shadow-lg hover:shadow-emerald-500/50 w-full sm:w-auto transform hover:scale-[1.02]"
              >
                Start Claiming Ownership →
              </Link>
            </div>
            <div className="relative p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="relative">
                {/* Mock certificate/proof visualization */}
                <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 transform rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-emerald-200">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg sm:text-xl">✓</span>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                        OWNERSHIP VERIFIED
                      </p>
                      <p className="text-sm sm:text-base font-bold text-slate-900">
                        Cryptographic Proof
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Author</p>
                      <p className="text-sm sm:text-base font-semibold text-slate-900">
                        Your Name
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Claimed At</p>
                      <p className="text-xs sm:text-sm font-mono text-slate-700">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Signature</p>
                      <div className="bg-slate-100 rounded px-2 py-1 mt-1">
                        <p className="text-xs font-mono text-slate-600 truncate">
                          SHA256:a3f7b2c9d1e8...
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Signature</p>
                        <p className="text-lg sm:text-xl text-emerald-600">✓</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Key</p>
                        <p className="text-lg sm:text-xl text-emerald-600">✓</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Integrity</p>
                        <p className="text-lg sm:text-xl text-emerald-600">✓</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 bg-emerald-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-2 -left-2 w-20 h-20 sm:w-24 sm:h-24 bg-cyan-400/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Modes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent text-center mb-8 sm:mb-12">
          Explore Watermark Security
        </h2>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
          {/* Challenge Mode */}
          <div className="relative bg-gradient-to-br from-cyan-50 to-blue-50 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl border-2 border-cyan-200 hover:shadow-2xl transition-all">
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
              Featured
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
              Challenge Mode
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-slate-700 mb-4 sm:mb-6">
              Put watermarks to the test! Upload your image and message, then
              try to destroy the watermark using common image transformations.
              See how robust different techniques really are.
            </p>
            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-sm sm:text-base text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 text-lg sm:text-xl">✓</span>
                <span>Interactive attack simulation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 text-lg sm:text-xl">✓</span>
                <span>Real-time robustness testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 text-lg sm:text-xl">✓</span>
                <span>Progressive difficulty levels</span>
              </li>
            </ul>
            <Link
              to="/challenge"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/50 w-full transform hover:scale-[1.02]"
            >
              Start Challenge
            </Link>
          </div>

          {/* Benchmark Mode */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl border-2 border-blue-200 hover:shadow-2xl transition-all">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
              Benchmark Mode
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-slate-700 mb-4 sm:mb-6">
              Compare watermarking algorithms side-by-side. Analyze
              imperceptibility metrics, embedding efficiency, and extraction
              accuracy across multiple techniques. Find the best algorithm now!
            </p>
            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-sm sm:text-base text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 text-lg sm:text-xl">✓</span>
                <span>Multi-algorithm comparison</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 text-lg sm:text-xl">✓</span>
                <span>Comprehensive robustness tests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 text-lg sm:text-xl">✓</span>
                <span>Performance metrics analysis</span>
              </li>
            </ul>
            <Link
              to="/benchmark"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:from-blue-500 hover:to-sky-500 transition-all shadow-lg hover:shadow-blue-500/50 w-full transform hover:scale-[1.02]"
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
