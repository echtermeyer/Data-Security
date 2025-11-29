import { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Shield, Zap, RotateCw, Crop, Wind, Sun, Volume2, Download, CheckCircle, XCircle, Trophy, Target, Flame, ChevronDown, Mail, Github } from 'lucide-react';

function ChallengeMode() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState('');
  const [message, setMessage] = useState('');
  const [algorithm, setAlgorithm] = useState('lsb'); // Pre-select LSB
  const [watermarkedImage, setWatermarkedImage] = useState(null);
  const [attackedImage, setAttackedImage] = useState(null);
  const [extractedMessage, setExtractedMessage] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, embedded, attacking, verified
  const [score, setScore] = useState(0);
  const [attacksApplied, setAttacksApplied] = useState(0);
  
  // Attack parameters
  const [brightness, setBrightness] = useState(0);
  const [blur, setBlur] = useState(0);
  const [noise, setNoise] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [compression, setCompression] = useState(100);
  const [cropAmount, setCropAmount] = useState(0);

  const canvasRef = useRef(null);
  const attackSectionRef = useRef(null);
  
  // Sample images - store these in public/samples/
  const sampleImages = [
    { id: 1, name: 'Here for the goodies', path: '/samples/sample1.jpg' },
    { id: 2, name: 'Finally done with HCA', path: '/samples/sample2.jpg' },
    { id: 3, name: 'Damn, its so cold out here', path: '/samples/sample3.jpg' },
    { id: 4, name: 'Fooood', path: '/samples/sample4.jpg' },
  ];

  const algorithms = [
    { id: 'lsb', name: 'LSB', robustness: 1, icon: '📄' },
    { id: 'dct', name: 'DCT', robustness: 3, icon: '🔷' },
    { id: 'dwt', name: 'DWT', robustness: 4, icon: '🌊' },
    { id: 'deep', name: 'Deep Learning', robustness: 5, icon: '🧠' },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setSelectedImageName(file.name);
        setWatermarkedImage(null);
        setStatus('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleSelect = (e) => {
    const selectedId = parseInt(e.target.value);
    const sample = sampleImages.find(img => img.id === selectedId);
    if (sample) {
      setSelectedImage(sample.path);
      setSelectedImageName(sample.name);
      setWatermarkedImage(null);
      setStatus('idle');
    }
  };

  const handleEmbed = () => {
    // TODO: Backend API call to embed watermark
    console.log('Embedding watermark...', { image: selectedImage, message, algorithm });
    setWatermarkedImage(selectedImage);
    setAttackedImage(selectedImage);
    setStatus('embedded');
    setScore(0);
    setAttacksApplied(0);
    resetAttacks();
    
    // Scroll to attack section
    setTimeout(() => {
      attackSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const resetAttacks = () => {
    setBrightness(0);
    setBlur(0);
    setNoise(0);
    setRotation(0);
    setCompression(100);
    setCropAmount(0);
  };

  // Apply attacks to image in real-time
  useEffect(() => {
    if (!watermarkedImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply crop
      const cropX = (img.width * cropAmount) / 200;
      const cropY = (img.height * cropAmount) / 200;
      const cropWidth = img.width - (cropX * 2);
      const cropHeight = img.height - (cropY * 2);

      ctx.save();
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply rotation
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Draw image (with crop if applied)
      if (cropAmount > 0) {
        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(img, 0, 0);
      }

      // Apply brightness
      if (brightness !== 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(${brightness > 0 ? '255,255,255' : '0,0,0'},${Math.abs(brightness) / 200})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }

      // Apply blur
      if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
      }

      // Apply noise
      if (noise > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (Math.random() < noise / 100) {
            const noiseValue = Math.random() * 255;
            data[i] = noiseValue;
            data[i + 1] = noiseValue;
            data[i + 2] = noiseValue;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      ctx.restore();

      // Update attacked image
      setAttackedImage(canvas.toDataURL('image/jpeg', compression / 100));
      setStatus('attacking');
      
      // Count active attacks
      const attacks = [brightness, blur, noise, rotation, cropAmount].filter(v => v !== 0).length + (compression < 100 ? 1 : 0);
      setAttacksApplied(attacks);
    };

    img.src = watermarkedImage;
  }, [watermarkedImage, brightness, blur, noise, rotation, compression, cropAmount]);

  const handleExtract = () => {
    // TODO: Backend API call to extract watermark
    console.log('Extracting watermark...');
    
    // Simulate extraction with probability based on attacks
    const damageScore = (Math.abs(brightness) / 100) + (blur / 20) + (noise / 100) + 
                        (Math.abs(rotation) / 180) + (cropAmount / 50) + ((100 - compression) / 100);
    
    const algoRobustness = algorithms.find(a => a.id === algorithm)?.robustness || 1;
    const survivalChance = Math.max(0, 1 - (damageScore / (algoRobustness * 2)));
    
    const survived = Math.random() < survivalChance;
    setExtractedMessage(survived ? message : '');
    setStatus('verified');
    
    if (survived) {
      const points = Math.floor(attacksApplied * 10 * algoRobustness);
      setScore(prev => prev + points);
    }
  };

  const applyQuickAttack = (preset) => {
    if (preset === 'light') {
      setBrightness(10);
      setBlur(2);
      setNoise(5);
      setRotation(5);
      setCompression(90);
      setCropAmount(5);
    } else if (preset === 'heavy') {
      setBrightness(30);
      setBlur(8);
      setNoise(20);
      setRotation(15);
      setCompression(70);
      setCropAmount(15);
    } else if (preset === 'extreme') {
      setBrightness(50);
      setBlur(15);
      setNoise(40);
      setRotation(45);
      setCompression(50);
      setCropAmount(25);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Gamification */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <Target className="w-10 h-10 text-purple-600" />
              Challenge Mode
            </h1>
            <p className="text-lg text-gray-600">
              Try to destroy the watermark and test algorithm robustness!
            </p>
          </div>
          
          {/* Score Display */}
          <div className="flex gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-medium">Score</span>
              </div>
              <p className="text-3xl font-bold">{score}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-medium">Attacks</span>
              </div>
              <p className="text-3xl font-bold">{attacksApplied}</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" />
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2">1</div>
              <h3 className="font-semibold text-slate-800 mb-2">Setup Your Watermark</h3>
              <p className="text-gray-700">
                Select an image, enter your secret message, and choose a watermarking algorithm. 
                Each algorithm has different robustness levels against attacks.
              </p>
            </div>
            <div>
              <div className="bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2">2</div>
              <h3 className="font-semibold text-slate-800 mb-2">Attack the Watermark</h3>
              <p className="text-gray-700">
                Apply transformations like blur, rotation, compression, and noise to try to destroy 
                the embedded watermark. Watch the image change in real-time!
              </p>
            </div>
            <div>
              <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2">3</div>
              <h3 className="font-semibold text-slate-800 mb-2">Test & Score Points</h3>
              <p className="text-gray-700">
                Extract the message to see if it survived. More attacks + stronger algorithms = higher scores! 
                Challenge yourself to break even the toughest watermarks.
              </p>
            </div>
          </div>
        </div>

        {/* Top Row - Setup */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Image Selection */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-purple-500">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
              Select Image
            </h2>
            
            {/* Upload Button */}
            <label className="block w-full cursor-pointer mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition">
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">Click to Upload</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </label>

            {/* Sample Images Dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Or select a sample image:
              </label>
              <div className="relative">
                <select 
                  onChange={handleSampleSelect}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 pr-8 focus:border-purple-500 focus:outline-none appearance-none bg-white text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>Choose a sample...</option>
                  {sampleImages.map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Image Preview */}
            {selectedImage && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-purple-200">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{selectedImageName}</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-purple-500">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
              Secret Message
            </h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your secret message here... This will be embedded into the image and you'll try to recover it after applying attacks."
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-purple-500 focus:outline-none resize-none text-sm"
              rows="8"
            />
            <p className="text-xs text-gray-500 mt-2">
              {message.length} characters
            </p>
          </div>

          {/* Algorithm Selection */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-purple-500">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
              Algorithm
            </h2>
            <div className="space-y-2 mb-4">
              {algorithms.map((algo) => (
                <label
                  key={algo.id}
                  className={`block border-2 rounded-lg p-3 cursor-pointer hover:border-purple-500 transition ${
                    algorithm === algo.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{algo.icon}</span>
                      <span className="font-semibold text-sm text-slate-800">{algo.name}</span>
                    </div>
                    <div className="flex gap-1" title={`Robustness: ${algo.robustness}/5`}>
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-4 rounded ${i < algo.robustness ? 'bg-purple-500' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            <button
              onClick={handleEmbed}
              disabled={!selectedImage || !message || !algorithm}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Zap className="w-5 h-5" />
              Embed Watermark
            </button>
          </div>
        </div>

        {/* Bottom Row - Attack Interface */}
        {watermarkedImage && (
          <div ref={attackSectionRef} className="grid lg:grid-cols-2 gap-6 scroll-mt-8">
            {/* Left - Image Preview */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center justify-between">
                <span>Watermarked Image</span>
                {status === 'attacking' && (
                  <span className="text-sm text-orange-600 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Under Attack
                  </span>
                )}
              </h2>
              
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-purple-300 overflow-hidden">
                <img 
                  src={attackedImage || watermarkedImage} 
                  alt="Watermarked" 
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="mt-4 flex gap-2">
                <button className="flex-1 text-sm text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1 py-2 border border-purple-300 rounded hover:bg-purple-50 transition">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button 
                  onClick={resetAttacks}
                  className="flex-1 text-sm text-gray-600 hover:text-gray-700 flex items-center justify-center gap-1 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  <RotateCw className="w-4 h-4" />
                  Reset Attacks
                </button>
              </div>

              {/* Status after extraction */}
              {status === 'verified' && (
                <div className="mt-4">
                  <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                    extractedMessage === message 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    {extractedMessage === message ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        extractedMessage === message ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {extractedMessage === message ? '✨ Watermark Survived!' : '💥 Watermark Destroyed!'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        extractedMessage === message ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {extractedMessage === message 
                          ? `+${Math.floor(attacksApplied * 10 * (algorithms.find(a => a.id === algorithm)?.robustness || 1))} points! Try more attacks.` 
                          : 'Try a different algorithm or fewer attacks.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="font-medium text-gray-700">Original:</p>
                        <p className="text-gray-900 font-mono text-xs mt-1 break-words">{message}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Extracted:</p>
                        <p className="text-gray-900 font-mono text-xs mt-1 break-words">{extractedMessage || '(empty)'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right - Attack Controls */}
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-cyan-500">
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-cyan-600" />
                Attack Controls
              </h2>

              <div className="space-y-5">
                {/* Brightness */}
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      Brightness
                    </span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{brightness > 0 ? '+' : ''}{brightness}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="-100" 
                    max="100" 
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>

                {/* Blur */}
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Wind className="w-4 h-4 text-blue-500" />
                      Blur
                    </span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{blur}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={blur}
                    onChange={(e) => setBlur(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>

                {/* Noise */}
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-purple-500" />
                      Noise
                    </span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{noise}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={noise}
                    onChange={(e) => setNoise(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>

                {/* Rotation */}
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <RotateCw className="w-4 h-4 text-green-500" />
                      Rotation
                    </span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{rotation}°</span>
                  </label>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>

                {/* Compression */}
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">JPEG Quality</span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{compression}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={compression}
                    onChange={(e) => setCompression(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>

                {/* Crop */}
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Crop className="w-4 h-4 text-red-500" />
                      Crop
                    </span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{cropAmount}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={cropAmount}
                    onChange={(e) => setCropAmount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                </div>

                {/* Quick Attack Presets */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">⚡ Quick Attacks</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => applyQuickAttack('light')}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                    >
                      💚 Light
                    </button>
                    <button 
                      onClick={() => applyQuickAttack('heavy')}
                      className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition text-sm font-medium"
                    >
                      🧡 Heavy
                    </button>
                    <button 
                      onClick={() => applyQuickAttack('extreme')}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                    >
                      ❤️ Extreme
                    </button>
                  </div>
                </div>
              </div>

              {/* Extract Button */}
              <button
                onClick={handleExtract}
                className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-4 rounded-lg font-semibold hover:from-cyan-700 hover:to-cyan-800 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Shield className="w-5 h-5" />
                Test Watermark Survival
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Project Info */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">About This Project</h3>
              <p className="text-gray-400 text-sm">
                Part of the Data Science & Ethics course at Ludwig-Maximilians-Universität München, 
                supervised by Prof. Dr. D. Kranzlmüller, Jan Schmidt, and Fabio Genz.
              </p>
            </div>

            {/* Team */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Research Team</h3>
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
            <p>© 2025 Watermark Security Lab - Ludwig-Maximilians-Universität München</p>
            <p className="mt-2">Munich Network Management Team</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ChallengeMode;