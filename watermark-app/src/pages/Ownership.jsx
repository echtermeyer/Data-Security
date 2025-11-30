import { useState, useEffect } from "react";
import Footer from "../components/Footer";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const generateKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );
  return keyPair;
};

const exportPublicKey = async (key) => {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  const exportedAsString = String.fromCharCode.apply(
    null,
    new Uint8Array(exported)
  );
  const exportedAsBase64 = window.btoa(exportedAsString);
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
};

const exportPrivateKey = async (key) => {
  const exported = await window.crypto.subtle.exportKey("pkcs8", key);
  const exportedAsString = String.fromCharCode.apply(
    null,
    new Uint8Array(exported)
  );
  const exportedAsBase64 = window.btoa(exportedAsString);
  return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
};

const importPrivateKey = async (pemKey) => {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pemKey
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  const binaryDer = window.atob(pemContents);
  const binaryDerArray = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    binaryDerArray[i] = binaryDer.charCodeAt(i);
  }

  return await window.crypto.subtle.importKey(
    "pkcs8",
    binaryDerArray.buffer,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    true,
    ["sign"]
  );
};

const signData = async (data, privateKey) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const signature = await window.crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    privateKey,
    dataBuffer
  );

  return window.btoa(String.fromCharCode(...new Uint8Array(signature)));
};

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function Ownership() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  const [activeTab, setActiveTab] = useState("claim");

  const [claimImage, setClaimImage] = useState(null);
  const [claimImageName, setClaimImageName] = useState("");
  const [claimImagePreview, setClaimImagePreview] = useState(null);
  const [isClaimingOwnership, setIsClaimingOwnership] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  const [verifyImage, setVerifyImage] = useState(null);
  const [verifyImageName, setVerifyImageName] = useState("");
  const [verifyImagePreview, setVerifyImagePreview] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("waterbench_user_id");
    const userName = localStorage.getItem("waterbench_display_name");
    const privateKey = localStorage.getItem("waterbench_private_key");

    if (userId && userName && privateKey) {
      setCurrentUser({ userId, displayName: userName, privateKey });
    } else {
      setShowRegistration(true);
    }
  }, []);

  const handleRegister = async () => {
    if (!displayName.trim()) {
      alert("Please enter a display name");
      return;
    }

    setIsRegistering(true);

    try {
      const userId = generateUUID();
      const keyPair = await generateKeyPair();
      const publicKeyPem = await exportPublicKey(keyPair.publicKey);
      const privateKeyPem = await exportPrivateKey(keyPair.privateKey);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          display_name: displayName.trim(),
          public_key: publicKeyPem,
        }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }

      localStorage.setItem("waterbench_user_id", userId);
      localStorage.setItem("waterbench_display_name", displayName.trim());
      localStorage.setItem("waterbench_private_key", privateKeyPem);

      setCurrentUser({
        userId,
        displayName: displayName.trim(),
        privateKey: privateKeyPem,
      });

      setShowRegistration(false);
    } catch (error) {
      console.error("Registration error:", error);
      alert(`Failed to register: ${error.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleClaimImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result.split(",")[1];
        setClaimImage(base64);
        setClaimImageName(file.name);
        setClaimImagePreview(event.target.result);
        setClaimResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClaimOwnership = async () => {
    if (!claimImage || !currentUser) return;

    setIsClaimingOwnership(true);
    setClaimResult(null);

    try {
      const claim = {
        author_name: currentUser.displayName,
        user_id: currentUser.userId,
        timestamp: new Date().toISOString(),
      };

      const claimJson = JSON.stringify(claim);
      const privateKey = await importPrivateKey(currentUser.privateKey);
      const signature = await signData(claimJson, privateKey);

      const response = await fetch(`${API_BASE_URL}/api/watermark/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: claimImage,
          claim: claim,
          signature: signature,
          algorithm: "lsb",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setClaimResult({
        success: true,
        watermarkedImage: `data:image/png;base64,${data.watermarked_image}`,
        metadata: data.metadata,
      });
    } catch (error) {
      console.error("Claim ownership failed:", error);
      setClaimResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsClaimingOwnership(false);
    }
  };

  const handleVerifyImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result.split(",")[1];
        setVerifyImage(base64);
        setVerifyImageName(file.name);
        setVerifyImagePreview(event.target.result);
        setVerifyResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyOwnership = async () => {
    if (!verifyImage) return;

    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/watermark/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: verifyImage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVerifyResult(data);
    } catch (error) {
      console.error("Verify ownership failed:", error);
      setVerifyResult({
        watermark_found: false,
        error: error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30">
      {/* Registration Modal */}
      {showRegistration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Welcome to Ownership Claims
              </h2>
              <p className="text-sm text-slate-600">
                Create your identity to start claiming ownership of images
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-all"
                  onKeyPress={(e) => e.key === "Enter" && handleRegister()}
                  disabled={isRegistering}
                />
              </div>

              <button
                onClick={handleRegister}
                disabled={isRegistering || !displayName.trim()}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Identity...
                  </span>
                ) : (
                  "Create Identity"
                )}
              </button>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  🔐 A cryptographic keypair will be generated and stored
                  securely in your browser. Keep this browser/device to maintain
                  your identity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              Ownership Claims
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-2">
              Claim authorship of your images with cryptographic proof and
              verify ownership of watermarked content
            </p>
          </div>

          {currentUser && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-cyan-400/30">
                <span className="text-cyan-400">👤</span>
                <span className="text-sm text-white">
                  Logged in as:{" "}
                  <span className="font-semibold">
                    {currentUser.displayName}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-slate-200">
          <button
            onClick={() => setActiveTab("claim")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "claim"
                ? "text-cyan-600 border-b-2 border-cyan-600 -mb-0.5"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Claim Ownership
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "verify"
                ? "text-cyan-600 border-b-2 border-cyan-600 -mb-0.5"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Verify Ownership
          </button>
        </div>

        {/* Claim Ownership Tab */}
        {activeTab === "claim" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Claim Image Ownership
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Upload an image to embed a cryptographically signed authorship
                claim. This creates verifiable proof that you owned this image
                at a specific timestamp.
              </p>

              <label className="block w-full cursor-pointer mb-6">
                <div className="border-2 border-dashed border-cyan-300 rounded-xl p-8 text-center hover:border-cyan-500 hover:bg-cyan-50/50 transition-all bg-gradient-to-br from-cyan-50/30 to-blue-50/30">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl">↑</span>
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">
                    Upload Image to Claim
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleClaimImageUpload}
                />
              </label>

              {claimImagePreview && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Preview:
                  </p>
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden border-2 border-cyan-200">
                    <img
                      src={claimImagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {claimImageName}
                  </p>
                </div>
              )}

              <button
                onClick={handleClaimOwnership}
                disabled={!claimImage || isClaimingOwnership}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isClaimingOwnership ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Claiming Ownership...
                  </span>
                ) : (
                  "Claim Ownership"
                )}
              </button>
            </div>

            {/* Claim Result */}
            {claimResult && (
              <div
                className={`p-6 rounded-xl border-2 shadow-lg ${
                  claimResult.success
                    ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300"
                    : "bg-gradient-to-br from-red-50 to-rose-50 border-red-300"
                }`}
              >
                {claimResult.success ? (
                  <>
                    <h3 className="text-lg font-bold text-emerald-900 mb-4">
                      ✓ Ownership Claimed Successfully
                    </h3>
                    <div className="mb-4">
                      <img
                        src={claimResult.watermarkedImage}
                        alt="Watermarked"
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-emerald-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="text-xs text-emerald-700 font-semibold">
                          PSNR
                        </p>
                        <p className="text-lg font-bold text-emerald-900">
                          {claimResult.metadata?.psnr?.toFixed(2)} dB
                        </p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="text-xs text-emerald-700 font-semibold">
                          SSIM
                        </p>
                        <p className="text-lg font-bold text-emerald-900">
                          {claimResult.metadata?.ssim?.toFixed(3)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={claimResult.watermarkedImage}
                      download={`claimed-${claimImageName}`}
                      className="block w-full text-center bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-500 transition-all"
                    >
                      Download Watermarked Image
                    </a>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      ✗ Claim Failed
                    </h3>
                    <p className="text-sm text-red-700">{claimResult.error}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verify Ownership Tab */}
        {activeTab === "verify" && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Verify Image Ownership
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Upload a watermarked image to extract and verify the embedded
                ownership claim.
              </p>

              <label className="block w-full cursor-pointer mb-6">
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-gradient-to-br from-blue-50/30 to-sky-50/30">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-sky-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl">🔍</span>
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">
                    Upload Image to Verify
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleVerifyImageUpload}
                />
              </label>

              {verifyImagePreview && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Preview:
                  </p>
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden border-2 border-blue-200">
                    <img
                      src={verifyImagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {verifyImageName}
                  </p>
                </div>
              )}

              <button
                onClick={handleVerifyOwnership}
                disabled={!verifyImage || isVerifying}
                className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-4 rounded-xl font-semibold hover:from-blue-500 hover:to-sky-500 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying Ownership...
                  </span>
                ) : (
                  "Verify Ownership"
                )}
              </button>
            </div>

            {/* Verify Result */}
            {verifyResult && (
              <div
                className={`p-6 rounded-xl border-2 shadow-lg ${
                  verifyResult.watermark_found &&
                  verifyResult.verification?.signature_valid
                    ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300"
                    : "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300"
                }`}
              >
                {verifyResult.watermark_found ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          verifyResult.verification?.signature_valid
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      >
                        <span className="text-white text-2xl">
                          {verifyResult.verification?.signature_valid
                            ? "✓"
                            : "⚠"}
                        </span>
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold ${
                            verifyResult.verification?.signature_valid
                              ? "text-emerald-900"
                              : "text-amber-900"
                          }`}
                        >
                          {verifyResult.verification?.signature_valid
                            ? "Ownership Verified"
                            : "Watermark Found (Unverified)"}
                        </h3>
                        <p
                          className={`text-sm ${
                            verifyResult.verification?.signature_valid
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          {verifyResult.verification?.signature_valid
                            ? "Cryptographic signature is valid"
                            : "User not found in registry"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white/50 p-4 rounded-lg">
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          Author
                        </p>
                        <p className="text-base font-bold text-slate-900">
                          {verifyResult.claim?.author_name || "Unknown"}
                        </p>
                      </div>

                      <div className="bg-white/50 p-4 rounded-lg">
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          Claimed At
                        </p>
                        <p className="text-base font-mono text-slate-900">
                          {verifyResult.claim?.timestamp
                            ? new Date(
                                verifyResult.claim.timestamp
                              ).toLocaleString()
                            : "Unknown"}
                        </p>
                      </div>

                      {verifyResult.author_details && (
                        <div className="bg-white/50 p-4 rounded-lg">
                          <p className="text-xs font-semibold text-slate-600 mb-1">
                            Registered At
                          </p>
                          <p className="text-base font-mono text-slate-900">
                            {new Date(
                              verifyResult.author_details.registered_at
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-300">
                        <div className="text-center">
                          <p className="text-xs text-slate-600">Signature</p>
                          <p
                            className={`text-lg ${
                              verifyResult.verification?.signature_valid
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {verifyResult.verification?.signature_valid
                              ? "✓"
                              : "✗"}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600">Public Key</p>
                          <p
                            className={`text-lg ${
                              verifyResult.verification?.public_key_found
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {verifyResult.verification?.public_key_found
                              ? "✓"
                              : "✗"}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600">Integrity</p>
                          <p
                            className={`text-lg ${
                              verifyResult.verification?.integrity_intact
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {verifyResult.verification?.integrity_intact
                              ? "✓"
                              : "✗"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-slate-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">✗</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          No Watermark Found
                        </h3>
                        <p className="text-sm text-slate-700">
                          This image does not contain an ownership claim
                        </p>
                      </div>
                    </div>
                    {verifyResult.error && (
                      <p className="text-sm text-red-600 mt-2">
                        Error: {verifyResult.error}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Ownership;
