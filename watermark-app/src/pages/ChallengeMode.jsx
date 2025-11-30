import { useState, useRef, useEffect } from "react";
import Footer from "../components/Footer";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function ChallengeMode() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [message, setMessage] = useState("");
  const [algorithm, setAlgorithm] = useState("lsb");
  const [watermarkedImage, setWatermarkedImage] = useState(null);
  const [attackedImage, setAttackedImage] = useState(null);
  const [extractedMessage, setExtractedMessage] = useState(null);
  const [status, setStatus] = useState("idle");
  const [attacksApplied, setAttacksApplied] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [brightness, setBrightness] = useState(0);
  const [blur, setBlur] = useState(0);
  const [noise, setNoise] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [compression, setCompression] = useState(100);
  const [cropAmount, setCropAmount] = useState(0);

  const canvasRef = useRef(null);
  const attackSectionRef = useRef(null);

  const sampleImages = [
    { id: 1, name: "Sample Image 1", path: "/samples/sample1.jpg" },
    { id: 2, name: "Sample Image 2", path: "/samples/sample2.jpg" },
    { id: 3, name: "Sample Image 3", path: "/samples/sample3.jpg" },
    { id: 4, name: "Sample Image 4", path: "/samples/sample4.jpg" },
  ];

  const algorithms = [
    {
      id: "lsb",
      name: "LSB",
      fullName: "Least Significant Bit",
      robustness: 1, // Lowest robustness (basic spatial technique)
      description: "Basic spatial domain technique for fast embedding.",
    },
    {
      id: "dctdwt",
      name: "DCT-DWT",
      fullName: "Discrete Cosine/Wavelet Transform Hybrid",
      robustness: 2, // High robustness (transform domain hybrid)
      description:
        "Hybrid frequency domain approach combining DCT and DWT for better robustness.",
    },
    {
      id: "dctdwtsvd",
      name: "DCT-DWT-SVD",
      fullName: "DCT-DWT-Singular Value Decomposition",
      robustness: 3, // Very high robustness (Advanced transform domain with linear algebra)
      description:
        "High-robustness transform domain approach using DWT for decomposition, DCT on sub-bands, and SVD for embedding/extraction.",
    },
    {
      id: "mbrs",
      name: "MBRS",
      fullName: "Mini-Batch Real & Simulated JPEG",
      robustness: 4, // Very high robustness (DNN-based with attack simulation)
      description:
        "Deep Neural Network (DNN) based method for watermarking, highly robust against JPEG compression.",
    },
    {
      id: "vine",
      name: "VINE",
      fullName: "Generative Prior Watermarking",
      robustness: 5, // Very high robustness (Generative model-based against various edits)
      description:
        "Advanced watermarking method using generative priors to enhance robustness against complex image editing.",
    },
  ];

  const convertImageToBase64 = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg", 1.0);
        resolve(dataURL.split(",")[1]);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setSelectedImageName(file.name);
        setWatermarkedImage(null);
        setStatus("idle");
        setExtractedMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleSelect = (e) => {
    const selectedId = parseInt(e.target.value);
    const sample = sampleImages.find((img) => img.id === selectedId);
    if (sample) {
      setSelectedImage(sample.path);
      setSelectedImageName(sample.name);
      setWatermarkedImage(null);
      setStatus("idle");
      setExtractedMessage(null);
    }
  };

  const resetAttacks = () => {
    setBrightness(0);
    setBlur(0);
    setNoise(0);
    setRotation(0);
    setCompression(100);
    setCropAmount(0);
  };

  const handleEmbed = async () => {
    if (!selectedImage || !message || !algorithm) return;

    setIsLoading(true);
    setStatus("idle");
    setExtractedMessage(null);

    try {
      const imageBase64 = await convertImageToBase64(selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/embed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          message: message,
          algorithm: algorithm,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const newWatermarkedImage = `data:image/jpeg;base64,${data.watermarked_image}`;

      setWatermarkedImage(newWatermarkedImage);
      setAttackedImage(newWatermarkedImage);
      setStatus("embedded");
      setAttacksApplied(0);
      resetAttacks();

      setTimeout(() => {
        attackSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("Embedding failed:", error);
      setStatus("error");
      alert(
        `Failed to embed watermark: ${error.message}. Check console for details.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!watermarkedImage || status === "idle" || status === "error") return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cropX = (img.width * cropAmount) / 200;
      const cropY = (img.height * cropAmount) / 200;
      const cropWidth = img.width - cropX * 2;
      const cropHeight = img.height - cropY * 2;

      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = "none";
      }

      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() * 100 < noise) {
          const noiseValue = Math.random() * 255;
          data[i] = noiseValue;
          data[i + 1] = noiseValue;
          data[i + 2] = noiseValue;
        }

        if (brightness !== 0) {
          data[i] = Math.min(
            255,
            Math.max(0, data[i] + (255 * brightness) / 100)
          );
          data[i + 1] = Math.min(
            255,
            Math.max(0, data[i + 1] + (255 * brightness) / 100)
          );
          data[i + 2] = Math.min(
            255,
            Math.max(0, data[i + 2] + (255 * brightness) / 100)
          );
        }
      }
      ctx.putImageData(imageData, 0, 0);

      ctx.restore();

      const newAttackedImage = canvas.toDataURL(
        "image/jpeg",
        compression / 100
      );
      setAttackedImage(newAttackedImage);

      // Only change status to "attacking" if not already verified
      if (status !== "verified") {
        setStatus("attacking");
      }
      const attacks =
        [brightness, blur, noise, rotation, cropAmount].filter((v) => v !== 0)
          .length + (compression < 100 ? 1 : 0);
      setAttacksApplied(attacks);
    };

    img.src = watermarkedImage;
  }, [
    watermarkedImage,
    brightness,
    blur,
    noise,
    rotation,
    compression,
    cropAmount,
    status,
  ]);

  const handleExtract = async () => {
    if (!attackedImage) return;

    setIsLoading(true);
    setExtractedMessage(null);
    setStatus("attacking");

    try {
      const attackedImageBase64 = attackedImage.split(",")[1];

      const response = await fetch(`${API_BASE_URL}/api/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: attackedImageBase64,
          algorithm: algorithm,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setExtractedMessage(data.message || "(Failed extraction)");
      setStatus("verified");
    } catch (error) {
      console.error("Extraction failed:", error);
      setStatus("error");
      setExtractedMessage("ERROR: Extraction failed due to API error.");
      alert(
        `Failed to extract watermark: ${error.message}. Check console for details.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyQuickAttack = (preset) => {
    if (preset === "light") {
      setBrightness(3);
      setBlur(1);
      setNoise(2);
      setRotation(2);
      setCompression(95);
      setCropAmount(2);
    } else if (preset === "heavy") {
      setBrightness(8);
      setBlur(2);
      setNoise(5);
      setRotation(5);
      setCompression(85);
      setCropAmount(5);
    } else if (preset === "extreme") {
      setBrightness(15);
      setBlur(4);
      setNoise(12);
      setRotation(10);
      setCompression(75);
      setCropAmount(8);
    }
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
              Challenge Mode
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-2">
              Evaluate watermarking algorithm resilience against common image
              transformations and attacks
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Methodology Section */}
        <div className="bg-white/80 backdrop-blur-sm border-2 border-gradient shadow-xl rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500"></div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-8 text-center">
            Experimental Methodology
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="pl-12 sm:pl-16 relative">
              <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                1
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Watermark Embedding
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Select a host image and configure the watermarking algorithm.
                  Each technique offers different trade-offs between
                  imperceptibility and robustness.
                </p>
              </div>
            </div>
            <div className="pl-12 sm:pl-16 relative">
              <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                2
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-2 bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                  Attack Simulation
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Apply various image processing operations to simulate
                  real-world attacks. Transformations include compression, noise
                  injection, geometric distortions, and filtering.
                </p>
              </div>
            </div>
            <div className="pl-12 sm:pl-16 relative sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 left-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                3
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-2 bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                  Integrity Verification
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Extract the embedded watermark from the attacked image and
                  compare against the original to assess algorithm performance
                  under stress conditions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
          {/* Image Selection */}
          <div className="bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                1
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                Image Selection
              </h2>
            </div>

            <label className="block w-full cursor-pointer mb-3 sm:mb-4">
              <div className="border-2 border-dashed border-cyan-300 rounded-xl p-4 sm:p-6 text-center hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-200 bg-gradient-to-br from-cyan-50/30 to-blue-50/30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl sm:text-2xl">↑</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold">
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

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                Or select a sample:
              </label>
              <select
                onChange={handleSampleSelect}
                className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 bg-white text-xs sm:text-sm transition-all"
                defaultValue=""
              >
                <option value="" disabled>
                  Choose a sample...
                </option>
                {sampleImages.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedImage && (
              <div className="mt-3 sm:mt-4">
                <p className="text-xs font-medium text-slate-600 mb-2">
                  Preview:
                </p>
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden border-2 border-cyan-200 shadow-md">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 truncate">
                  {selectedImageName}
                </p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                2
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                Watermark Payload
              </h2>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the message to be embedded as a watermark. This payload will be used for extraction verification after attack simulation."
              className="w-full border-2 border-slate-200 rounded-lg p-2.5 sm:p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none text-xs sm:text-sm transition-all"
              rows="6"
              maxLength={30}
            />
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs text-slate-500">
                {message.length}/30 characters
              </p>
              <div className="h-1.5 w-20 sm:w-24 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (message.length / 30) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div className="bg-white/90 backdrop-blur-sm border border-sky-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                3
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                Algorithm
              </h2>
            </div>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {algorithms.map((algo) => (
                <label
                  key={algo.id}
                  className={`block border-2 rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-200 ${
                    algorithm === algo.id
                      ? "border-cyan-500 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg scale-[1.02]"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-md bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="algorithm"
                    value={algo.id}
                    checked={algorithm === algo.id}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="sr-only"
                  />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-bold text-xs sm:text-sm ${
                          algorithm === algo.id
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        {algo.name}
                      </span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 sm:w-1.5 h-2.5 sm:h-3 rounded-full ${
                              i < algo.robustness
                                ? algorithm === algo.id
                                  ? "bg-white"
                                  : "bg-gradient-to-b from-cyan-500 to-blue-500"
                                : algorithm === algo.id
                                ? "bg-white/30"
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p
                      className={`text-xs mb-1 ${
                        algorithm === algo.id
                          ? "text-white/90 font-medium"
                          : "text-slate-500"
                      }`}
                    >
                      {algo.fullName}
                    </p>
                    <p
                      className={`text-xs ${
                        algorithm === algo.id
                          ? "text-white/80"
                          : "text-slate-600"
                      }`}
                    >
                      {algo.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={handleEmbed}
              disabled={!selectedImage || !message || !algorithm || isLoading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading && status !== "verified"
                ? "Processing..."
                : "Embed Watermark"}
            </button>
            {status === "error" && (
              <p className="text-xs sm:text-sm text-red-600 mt-2 text-center">
                An error occurred during processing.
              </p>
            )}
          </div>
        </div>

        {/* Attack Interface */}
        {watermarkedImage && (
          <div ref={attackSectionRef} className="scroll-mt-8">
            <div className="border-t-2 border-gradient pt-6 sm:pt-10 mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 bg-clip-text text-transparent mb-2 text-center">
                Attack Simulation
              </h2>
              <p className="text-center text-sm sm:text-base text-slate-600">
                Apply transformations to test watermark resilience
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Image Preview */}
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    Watermarked Image
                  </h3>
                  {status === "attacking" && (
                    <span className="text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md">
                      Under Attack
                    </span>
                  )}
                  {status === "verified" && (
                    <span className="text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-md">
                      Verified
                    </span>
                  )}
                </div>

                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center border-2 border-slate-200 overflow-hidden mb-3 sm:mb-4 shadow-inner">
                  <img
                    src={attackedImage || watermarkedImage}
                    alt="Watermarked"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <a
                    href={attackedImage}
                    download={`attacked-image-${Date.now()}.jpeg`}
                    className="flex-1 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                  >
                    <span>↓</span> Download
                  </a>
                  <button
                    onClick={resetAttacks}
                    className="flex-1 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                  >
                    <span>↻</span> Reset
                  </button>
                </div>

                {/* Extraction Results */}
                {status === "verified" && (
                  <div className="space-y-3">
                    <div
                      className={`p-3 sm:p-4 rounded-xl border-2 shadow-md ${
                        extractedMessage === message
                          ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300"
                          : "bg-gradient-to-br from-red-50 to-rose-50 border-red-300"
                      }`}
                    >
                      <p
                        className={`font-bold text-sm sm:text-base mb-1 ${
                          extractedMessage === message
                            ? "text-emerald-900"
                            : "text-red-900"
                        }`}
                      >
                        {extractedMessage === message
                          ? "✓ Extraction Successful"
                          : "✗ Extraction Failed"}
                      </p>
                      <p
                        className={`text-xs sm:text-sm ${
                          extractedMessage === message
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {extractedMessage === message
                          ? "Watermark survived the applied transformations."
                          : "Watermark could not be recovered from attacked image."}
                      </p>
                    </div>

                    <div className="p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 text-xs sm:text-sm shadow-inner">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="font-semibold text-slate-700 mb-2">
                            Original Message:
                          </p>
                          <p className="text-slate-900 font-mono text-xs break-words bg-white p-2 rounded border border-slate-200">
                            {message}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 mb-2">
                            Extracted Message:
                          </p>
                          <p
                            className={`font-mono text-xs break-words p-2 rounded border ${
                              extractedMessage === message
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                : "text-red-700 bg-red-50 border-red-200"
                            }`}
                          >
                            {extractedMessage || "(empty)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Attack Controls */}
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6">
                  Transformation Parameters
                </h3>

                <div className="space-y-4 sm:space-y-5">
                  {/* Brightness */}
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                        Brightness
                      </span>
                      <span className="text-xs font-mono bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-slate-700 border border-slate-200">
                        {brightness > 0 ? "+" : ""}
                        {brightness}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full h-2 sm:h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-600"
                    />
                  </div>

                  {/* Blur */}
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                        Gaussian Blur
                      </span>
                      <span className="text-xs font-mono bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-slate-700 border border-slate-200">
                        {blur}px
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={blur}
                      onChange={(e) => setBlur(parseInt(e.target.value))}
                      className="w-full h-2 sm:h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-600"
                    />
                  </div>

                  {/* Noise */}
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                        Random Noise
                      </span>
                      <span className="text-xs font-mono bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-slate-700 border border-slate-200">
                        {noise}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={noise}
                      onChange={(e) => setNoise(parseInt(e.target.value))}
                      className="w-full h-2 sm:h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-600"
                    />
                  </div>

                  {/* Rotation */}
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                        Rotation
                      </span>
                      <span className="text-xs font-mono bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-slate-700 border border-slate-200">
                        {rotation}°
                      </span>
                    </label>
                    <input
                      type="range"
                      min="-15"
                      max="15"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-2 sm:h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-600"
                    />
                  </div>

                  {/* Compression */}
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                        JPEG Quality
                      </span>
                      <span className="text-xs font-mono bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-slate-700 border border-slate-200">
                        {compression}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="70"
                      max="100"
                      value={compression}
                      onChange={(e) => setCompression(parseInt(e.target.value))}
                      className="w-full h-2 sm:h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-600"
                    />
                  </div>

                  {/* Crop */}
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                        Cropping
                      </span>
                      <span className="text-xs font-mono bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-slate-700 border border-slate-200">
                        {cropAmount}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={cropAmount}
                      onChange={(e) => setCropAmount(parseInt(e.target.value))}
                      className="w-full h-2 sm:h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-cyan-600"
                    />
                  </div>

                  {/* Quick Presets */}
                  <div className="pt-3 sm:pt-4 border-t-2 border-slate-200">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3">
                      Quick Attack Presets
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => applyQuickAttack("light")}
                        className="px-2 sm:px-3 py-2 sm:py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-xs sm:text-sm font-medium border-2 border-slate-300 hover:border-slate-400"
                      >
                        Light
                      </button>
                      <button
                        onClick={() => applyQuickAttack("heavy")}
                        className="px-2 sm:px-3 py-2 sm:py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-xs sm:text-sm font-medium border-2 border-slate-300 hover:border-slate-400"
                      >
                        Moderate
                      </button>
                      <button
                        onClick={() => applyQuickAttack("extreme")}
                        className="px-2 sm:px-3 py-2 sm:py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-xs sm:text-sm font-medium border-2 border-slate-300 hover:border-slate-400"
                      >
                        Severe
                      </button>
                    </div>
                  </div>
                </div>

                {/* Extract Button */}
                <button
                  onClick={handleExtract}
                  disabled={isLoading || status === "embedded"}
                  className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading
                    ? "Extracting Watermark..."
                    : status === "verified"
                    ? "Re-extract Watermark"
                    : "Extract Watermark"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default ChallengeMode;
