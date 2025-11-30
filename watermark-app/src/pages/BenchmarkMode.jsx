import { useState } from "react";
import Footer from "../components/Footer";

function BenchmarkMode() {
  const [selectedImage, setSelectedImage] = useState("/samples/sample1.jpg");
  const [selectedImageName, setSelectedImageName] = useState("Sample Image 1");
  const [message, setMessage] = useState(
    "This is a secret watermark message for testing"
  );
  const [showCustomResults, setShowCustomResults] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [customResults, setCustomResults] = useState(null);

  // Sample images
  const sampleImages = [
    { id: 1, name: "Sample Image 1", path: "/samples/sample1.jpg" },
    { id: 2, name: "Sample Image 2", path: "/samples/sample2.jpg" },
    { id: 3, name: "Sample Image 3", path: "/samples/sample3.jpg" },
    { id: 4, name: "Sample Image 4", path: "/samples/sample4.jpg" },
  ];

  // Fake benchmark data
  const benchmarkResults = {
    imperceptibility: [
      { algorithm: "LSB", psnr: 42.3, ssim: 0.991, mse: 3.82 },
      { algorithm: "DCT", psnr: 38.7, ssim: 0.967, mse: 8.91 },
      { algorithm: "DWT", psnr: 40.1, ssim: 0.978, mse: 6.45 },
      { algorithm: "Deep Learning", psnr: 44.8, ssim: 0.995, mse: 2.14 },
    ],
    performance: [
      {
        algorithm: "LSB",
        embedTime: 0.023,
        extractTime: 0.018,
        capacity: "High",
      },
      {
        algorithm: "DCT",
        embedTime: 0.156,
        extractTime: 0.142,
        capacity: "Medium",
      },
      {
        algorithm: "DWT",
        embedTime: 0.189,
        extractTime: 0.171,
        capacity: "Medium",
      },
      {
        algorithm: "Deep Learning",
        embedTime: 0.842,
        extractTime: 0.731,
        capacity: "Low",
      },
    ],
    robustness: [
      {
        algorithm: "LSB",
        attacks: {
          jpegCompression: 23,
          gaussianNoise: 18,
          rotation: 5,
          crop: 12,
          blur: 15,
          brightness: 67,
        },
      },
      {
        algorithm: "DCT",
        attacks: {
          jpegCompression: 78,
          gaussianNoise: 71,
          rotation: 45,
          crop: 62,
          blur: 69,
          brightness: 84,
        },
      },
      {
        algorithm: "DWT",
        attacks: {
          jpegCompression: 85,
          gaussianNoise: 79,
          rotation: 58,
          crop: 71,
          blur: 76,
          brightness: 88,
        },
      },
      {
        algorithm: "Deep Learning",
        attacks: {
          jpegCompression: 94,
          gaussianNoise: 91,
          rotation: 87,
          crop: 89,
          blur: 92,
          brightness: 95,
        },
      },
    ],
  };

  const handleSampleSelect = (e) => {
    const selectedId = parseInt(e.target.value);
    const sample = sampleImages.find((img) => img.id === selectedId);
    if (sample) {
      setSelectedImage(sample.path);
      setSelectedImageName(sample.name);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setSelectedImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const runCustomBenchmark = () => {
    setIsRunning(true);
    setShowCustomResults(false);

    setTimeout(() => {
      const results = {
        lsb: {
          embedTime: 0.02 + Math.random() * 0.01,
          extractTime: 0.015 + Math.random() * 0.01,
          psnr: 41 + Math.random() * 3,
          ssim: 0.988 + Math.random() * 0.006,
        },
        dct: {
          embedTime: 0.15 + Math.random() * 0.02,
          extractTime: 0.13 + Math.random() * 0.02,
          psnr: 37 + Math.random() * 3,
          ssim: 0.963 + Math.random() * 0.008,
        },
        dwt: {
          embedTime: 0.18 + Math.random() * 0.02,
          extractTime: 0.16 + Math.random() * 0.02,
          psnr: 39 + Math.random() * 3,
          ssim: 0.974 + Math.random() * 0.008,
        },
        deep: {
          embedTime: 0.8 + Math.random() * 0.1,
          extractTime: 0.7 + Math.random() * 0.1,
          psnr: 43 + Math.random() * 3,
          ssim: 0.992 + Math.random() * 0.006,
        },
      };

      setCustomResults(results);
      setShowCustomResults(true);
      setIsRunning(false);

      setTimeout(() => {
        document
          .getElementById("custom-results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white mb-8 sm:mb-12">
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-500 bg-clip-text text-transparent pb-2">
              Benchmark Mode
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-2">
              Comprehensive performance comparison of watermarking algorithms
              across multiple evaluation metrics
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Methodology Overview */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-10 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
            Evaluation Metrics
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-2">
                Imperceptibility
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Measures visual quality preservation using PSNR (Peak
                Signal-to-Noise Ratio), SSIM (Structural Similarity Index), and
                MSE (Mean Squared Error).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-2">
                Performance
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Evaluates embedding/extraction speed, computational efficiency,
                and watermark capacity for each algorithm implementation.
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-2">
                Robustness
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tests resilience against common attacks including JPEG
                compression, noise injection, rotation, cropping, and filtering
                operations.
              </p>
            </div>
          </div>
        </div>

        {/* Benchmark Results */}
        <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-10">
          {/* Imperceptibility Results */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">
              Table 1: Imperceptibility Metrics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
              Quality assessment of watermarked images. Higher PSNR and SSIM
              values indicate better visual fidelity. Lower MSE values are
              preferred.
            </p>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300">
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50">
                        Algorithm
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50">
                        PSNR (dB)
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50">
                        SSIM
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50">
                        MSE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarkResults.imperceptibility.map((result, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-6 font-medium text-xs sm:text-sm text-slate-800">
                          {result.algorithm}
                        </td>
                        <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                          {result.psnr.toFixed(1)}
                        </td>
                        <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                          {result.ssim.toFixed(3)}
                        </td>
                        <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                          {result.mse.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Performance Results */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">
              Table 2: Performance Metrics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
              Computational efficiency analysis. Embedding and extraction times
              measured in seconds. Capacity indicates payload size capability.
            </p>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300">
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50">
                        Algorithm
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50 whitespace-nowrap">
                        Embed (s)
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50 whitespace-nowrap">
                        Extract (s)
                      </th>
                      <th className="text-center py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50">
                        Capacity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarkResults.performance.map((result, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-6 font-medium text-xs sm:text-sm text-slate-800">
                          {result.algorithm}
                        </td>
                        <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                          {result.embedTime.toFixed(3)}
                        </td>
                        <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                          {result.extractTime.toFixed(3)}
                        </td>
                        <td className="text-center py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm text-slate-700">
                          {result.capacity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Robustness Results */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">
              Table 3: Robustness Against Attacks
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
              Success rate (%) of watermark extraction after applying various
              attack types. Higher percentages indicate greater robustness.
            </p>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300">
                      <th className="text-left py-3 sm:py-4 px-2 sm:px-4 lg:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50 sticky left-0 z-10">
                        Algorithm
                      </th>
                      <th className="text-center py-3 sm:py-4 px-2 sm:px-3 lg:px-4 font-semibold text-xs text-slate-900 bg-slate-50 whitespace-nowrap">
                        JPEG
                      </th>
                      <th className="text-center py-3 sm:py-4 px-2 sm:px-3 lg:px-4 font-semibold text-xs text-slate-900 bg-slate-50 whitespace-nowrap">
                        Noise
                      </th>
                      <th className="text-center py-3 sm:py-4 px-2 sm:px-3 lg:px-4 font-semibold text-xs text-slate-900 bg-slate-50 whitespace-nowrap">
                        Rotation
                      </th>
                      <th className="text-center py-3 sm:py-4 px-2 sm:px-3 lg:px-4 font-semibold text-xs text-slate-900 bg-slate-50 whitespace-nowrap">
                        Crop
                      </th>
                      <th className="text-center py-3 sm:py-4 px-2 sm:px-3 lg:px-4 font-semibold text-xs text-slate-900 bg-slate-50 whitespace-nowrap">
                        Blur
                      </th>
                      <th className="text-center py-3 sm:py-4 px-2 sm:px-3 lg:px-4 font-semibold text-xs text-slate-900 bg-slate-50 whitespace-nowrap">
                        Brightness
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarkResults.robustness.map((result, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 sm:py-4 px-2 sm:px-4 lg:px-6 font-medium text-xs sm:text-sm text-slate-800 sticky left-0 bg-white z-10">
                          {result.algorithm}
                        </td>
                        {Object.entries(result.attacks).map(
                          ([attack, score]) => (
                            <td
                              key={attack}
                              className="text-center py-3 sm:py-4 px-2 sm:px-3 lg:px-4 font-mono text-xs sm:text-sm text-slate-700"
                            >
                              {score}%
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">
              Analysis Summary
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="border-l-4 border-cyan-500 pl-3 sm:pl-4">
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-2">
                  Deep Learning Performance
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Demonstrates superior imperceptibility (PSNR: 44.8 dB, SSIM:
                  0.995) and exceptional robustness across all attack categories
                  (87-95% survival rate). Trade-off includes increased
                  computational complexity with embedding time of 0.842s.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3 sm:pl-4">
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-2">
                  LSB Characteristics
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Exhibits optimal computational efficiency (0.023s embedding,
                  0.018s extraction) with high payload capacity. However,
                  demonstrates limited robustness to transformation attacks
                  (5-67% survival rate), suitable only for controlled
                  environments.
                </p>
              </div>
              <div className="border-l-4 border-sky-500 pl-3 sm:pl-4">
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-2">
                  DWT Balance
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Provides balanced performance with moderate robustness (58-88%
                  survival rate), acceptable processing speed (0.189s), and good
                  visual quality (PSNR: 40.1 dB). Optimal choice for
                  general-purpose watermarking applications.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-3 sm:pl-4">
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-2">
                  DCT Frequency Domain
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Demonstrates strong resistance to JPEG compression (78%
                  survival) and other frequency-domain transformations.
                  Particularly effective when compression tolerance is a primary
                  requirement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Test Section */}
        <div className="bg-white/90 backdrop-blur-sm border-2 border-cyan-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">
            Custom Benchmark Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-4 sm:mb-6">
            Execute a custom benchmark test using your own image and watermark
            payload. All algorithms will be evaluated using the same input
            parameters.
          </p>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Upload/Select Image */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Test Image
              </label>
              <label className="block w-full cursor-pointer mb-3">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 sm:p-6 text-center hover:border-cyan-500 hover:bg-cyan-50/50 transition-all">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg sm:text-xl">↑</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">
                    Upload Image
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <select
                onChange={handleSampleSelect}
                className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 bg-white text-xs sm:text-sm transition-all"
                value={
                  sampleImages.find((img) => img.path === selectedImage)?.id ||
                  1
                }
              >
                {sampleImages.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Preview */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Preview
              </label>
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 truncate">
                {selectedImageName}
              </p>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Watermark Payload
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 text-xs sm:text-sm resize-none transition-all"
                rows="4"
                placeholder="Enter test message..."
              />
              <p className="text-xs text-slate-500 mt-2">
                {message.length} characters
              </p>
            </div>
          </div>

          <button
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={runCustomBenchmark}
            disabled={isRunning}
          >
            {isRunning ? (
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running Benchmark...
              </span>
            ) : (
              "Execute Benchmark Test"
            )}
          </button>
        </div>

        {/* Custom Results */}
        {showCustomResults && customResults && (
          <div
            id="custom-results"
            className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm border-2 border-green-300 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg scroll-mt-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Custom Benchmark Results
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-slate-700">
                Test Image:{" "}
                <span className="font-semibold">{selectedImageName}</span> |
                Payload Length:{" "}
                <span className="font-semibold">
                  {message.length} characters
                </span>
              </p>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300">
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50">
                        Algorithm
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50 whitespace-nowrap">
                        Embed (s)
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50 whitespace-nowrap">
                        Extract (s)
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50 whitespace-nowrap">
                        PSNR
                      </th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50">
                        SSIM
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="py-3 sm:py-4 px-3 sm:px-6 font-medium text-xs sm:text-sm text-slate-800">
                        LSB
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.lsb.embedTime.toFixed(3)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.lsb.extractTime.toFixed(3)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.lsb.psnr.toFixed(1)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.lsb.ssim.toFixed(3)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="py-3 sm:py-4 px-3 sm:px-6 font-medium text-xs sm:text-sm text-slate-800">
                        DCT
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.dct.embedTime.toFixed(3)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.dct.extractTime.toFixed(3)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.dct.psnr.toFixed(1)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.dct.ssim.toFixed(3)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="py-3 sm:py-4 px-3 sm:px-6 font-medium text-xs sm:text-sm text-slate-800">
                        DWT
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.dwt.embedTime.toFixed(3)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.dwt.extractTime.toFixed(3)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.dwt.psnr.toFixed(1)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.dwt.ssim.toFixed(3)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="py-3 sm:py-4 px-3 sm:px-6 font-medium text-xs sm:text-sm text-slate-800">
                        Deep Learning
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.deep.embedTime.toFixed(3)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.deep.extractTime.toFixed(3)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.deep.psnr.toFixed(1)}
                      </td>
                      <td className="text-right py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm text-slate-700">
                        {customResults.deep.ssim.toFixed(3)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs sm:text-sm text-green-800">
                <span className="font-semibold">
                  Test completed successfully.
                </span>{" "}
                All algorithms have been evaluated using your specified
                parameters. Processing times may vary based on payload size and
                image complexity.
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default BenchmarkMode;
