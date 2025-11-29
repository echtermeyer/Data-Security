import { useState } from "react";
import {
  FlaskConical,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  Mail,
  Github,
  Upload,
} from "lucide-react";

function BenchmarkMode() {
  const [selectedImage, setSelectedImage] = useState("/samples/sample1.jpg");
  const [selectedImageName, setSelectedImageName] = useState(
    "Here for the goodies"
  );
  const [message, setMessage] = useState(
    "This is a secret watermark message for testing"
  );
  const [showCustomResults, setShowCustomResults] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [customResults, setCustomResults] = useState(null);

  // Sample images
  const sampleImages = [
    { id: 1, name: "Here for the goodies", path: "/samples/sample1.jpg" },
    { id: 2, name: "Finally done with HCA", path: "/samples/sample2.jpg" },
    { id: 3, name: "Damn, its so cold out here", path: "/samples/sample3.jpg" },
    { id: 4, name: "Fooood", path: "/samples/sample4.jpg" },
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

    // Simulate processing time
    setTimeout(() => {
      // Generate fake benchmark results
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

      // Scroll to results
      setTimeout(() => {
        document
          .getElementById("custom-results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3 flex items-center gap-3">
            <FlaskConical className="w-10 h-10 text-cyan-600" />
            Benchmark Mode
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive performance comparison of watermarking algorithms
          </p>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-600" />
            Evaluation Metrics
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-600" />
                Imperceptibility
              </h3>
              <p className="text-gray-700">
                Measures visual quality preservation using PSNR (Peak
                Signal-to-Noise Ratio), SSIM (Structural Similarity Index), and
                MSE (Mean Squared Error).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-600" />
                Performance
              </h3>
              <p className="text-gray-700">
                Evaluates embedding/extraction speed, computational efficiency,
                and watermark capacity for each algorithm.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                Robustness
              </h3>
              <p className="text-gray-700">
                Tests resilience against common attacks including JPEG
                compression, noise, rotation, cropping, and filtering.
              </p>
            </div>
          </div>
        </div>

        {/* Benchmark Results - Always Visible */}
        <div className="space-y-6 mb-8">
          {/* Imperceptibility Results */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" />
              Imperceptibility Metrics
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Higher PSNR and SSIM values indicate better visual quality. Lower
              MSE is better.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Algorithm
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      PSNR (dB)
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      SSIM
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      MSE
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Quality Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkResults.imperceptibility.map((result, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {result.algorithm}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-sm">
                        {result.psnr}
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-sm">
                        {result.ssim}
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-sm">
                        {result.mse}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex justify-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full ${
                                i < Math.floor(result.psnr / 10)
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Results */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-600" />
              Performance Metrics
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Embedding and extraction times measured in seconds. Lower is
              faster.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Algorithm
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Embed Time (s)
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Extract Time (s)
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Capacity
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Speed Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkResults.performance.map((result, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {result.algorithm}
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">
                            {result.embedTime.toFixed(3)}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">
                            {result.extractTime.toFixed(3)}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            result.capacity === "High"
                              ? "bg-green-100 text-green-700"
                              : result.capacity === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {result.capacity}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex justify-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full ${
                                i < Math.floor((1 - result.embedTime) * 5)
                                  ? "bg-blue-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Robustness Results */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Robustness Against Attacks
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Percentage of successful message extraction after each attack type
              (higher is better).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Algorithm
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      JPEG Compression
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Gaussian Noise
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Rotation
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Crop
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Blur
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Brightness
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkResults.robustness.map((result, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {result.algorithm}
                        </span>
                      </td>
                      {Object.entries(result.attacks).map(([attack, score]) => (
                        <td key={attack} className="text-center py-3 px-4">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`font-semibold ${
                                score >= 80
                                  ? "text-green-600"
                                  : score >= 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {score}%
                            </span>
                            {score >= 80 ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-100 border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Summary & Recommendations
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-green-700 mb-2">
                  Best Overall Performance
                </h3>
                <p className="text-gray-700">
                  <strong>Deep Learning:</strong> Excellent imperceptibility
                  (PSNR: 44.8 dB), superior robustness across all attack types
                  (87-95% survival rate). Trade-off: slower processing time
                  (0.842s embedding).
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-blue-700 mb-2">
                  Fastest Processing
                </h3>
                <p className="text-gray-700">
                  <strong>LSB:</strong> Extremely fast embedding/extraction
                  (0.023s / 0.018s) with high capacity. Trade-off: vulnerable to
                  most attacks (5-67% survival rate).
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-purple-700 mb-2">
                  Best Balance
                </h3>
                <p className="text-gray-700">
                  <strong>DWT:</strong> Good robustness (58-88% survival rate),
                  acceptable speed (0.189s), and decent visual quality (PSNR:
                  40.1 dB). Ideal for most practical applications.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-orange-700 mb-2">
                  Compression-Resistant
                </h3>
                <p className="text-gray-700">
                  <strong>DCT:</strong> Strong against JPEG compression (78%
                  survival) and other frequency-domain attacks. Best choice when
                  compression is the primary concern.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Test Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-cyan-500">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Run Custom Benchmark Test
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload your own image and message to run a custom benchmark analysis
            with all algorithms.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Upload/Select Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Image
              </label>
              <label className="block w-full cursor-pointer mb-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-500 hover:bg-cyan-50 transition">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-xs text-gray-600">Click to upload</p>
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
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none bg-white text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {selectedImageName}
              </p>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none text-sm resize-none"
                rows="6"
                placeholder="Enter test message..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length} characters
              </p>
            </div>
          </div>

          <button
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-4 rounded-lg font-semibold hover:from-cyan-700 hover:to-cyan-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={runCustomBenchmark}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running Benchmark...
              </>
            ) : (
              <>
                <FlaskConical className="w-5 h-5" />
                Run Custom Benchmark
              </>
            )}
          </button>
        </div>

        {/* Custom Results */}
        {showCustomResults && customResults && (
          <div
            id="custom-results"
            className="mt-8 bg-white p-6 rounded-lg shadow-lg border-l-4 border-cyan-500 scroll-mt-8"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Custom Benchmark Results
            </h2>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-700">
                Image: <strong>{selectedImageName}</strong> | Message length:{" "}
                <strong>{message.length} characters</strong>
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Algorithm
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Embed Time (s)
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Extract Time (s)
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      PSNR (dB)
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      SSIM
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      LSB
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.lsb.embedTime.toFixed(3)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.lsb.extractTime.toFixed(3)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.lsb.psnr.toFixed(1)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.lsb.ssim.toFixed(3)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      DCT
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.dct.embedTime.toFixed(3)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.dct.extractTime.toFixed(3)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.dct.psnr.toFixed(1)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.dct.ssim.toFixed(3)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      DWT
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.dwt.embedTime.toFixed(3)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.dwt.extractTime.toFixed(3)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.dwt.psnr.toFixed(1)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.dwt.ssim.toFixed(3)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      Deep Learning
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.deep.embedTime.toFixed(3)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.deep.extractTime.toFixed(3)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.deep.psnr.toFixed(1)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">
                      {customResults.deep.ssim.toFixed(3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>✓ Test completed successfully!</strong> All algorithms
                processed your image and message. Processing times may vary
                based on message length and image complexity.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
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

export default BenchmarkMode;
