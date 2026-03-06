"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Link2, PlayCircle } from "lucide-react";

interface VideoResult {
  coverUrl: string;
  downloadAddr: string;
  duration: number;
  definition: string;
  format: string;
  text: string;
  authorName: string;
}
export default function Home() {
  const [url, setUrl] = useState("");
  const [isPasted, setIsPasted] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = ["getting video", "hang tight", "hold on", "just a minute"];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, loadingMessages.length]);

  // Monitor paste events to trigger animation
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text") || "";
      if (text.includes("tiktok.com")) {
        setIsPasted(true);
        setUrl(text);
        setTimeout(() => setIsPasted(false), 800);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // If empty URL and not loading, try to paste from clipboard
    if (!url) {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.includes("tiktok.com")) {
          setUrl(text);
          setIsPasted(true);
          setTimeout(() => setIsPasted(false), 800);
          // Don't return, continue to submit
        } else {
          setError("Please paste a valid TikTok link");
          return;
        }
      } catch (_err) {
        setError("Please enter a valid TikTok link");
        return;
      }
    }

    // Use the latest url (either state or clipboard)
    const targetUrl = url || await navigator.clipboard.readText().catch(() => "");

    if (!targetUrl || !targetUrl.includes("tiktok.com")) {
      setError("Please provide a valid TikTok URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/apify/tiktok", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to download video");
      }

      setResult(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#010101] flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-[#fe0979] selection:text-white">
      {/* Background neon blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f2fe] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#fe0979] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8">

        {/* Title */}
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter"
          >
            <span className="glitch-text" data-text="TikTok">TikTok</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#fe0979]">Saver</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg"
          >
            Download TikTok videos without watermark instantly
          </motion.p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full relative flex flex-col items-center gap-6 mt-8">

          {/* Animated Input Field */}
          <motion.div
            className="w-full relative"
            animate={isPasted ? {
              scale: [1, 1.05, 0.95, 1],
              rotate: [0, -1, 1, 0]
            } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Link2 className="h-6 w-6 text-[#00f2fe]" />
            </div>

            <input
              type="text"
              placeholder="Paste TikTok URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#111111] border-2 border-transparent text-white placeholder-gray-500 rounded-2xl py-5 pl-14 pr-6 text-lg outline-none transition-all duration-300 glitch-focus focus:border-[#fe0979] shadow-lg"
            />

            {/* Input highlight on paste */}
            <AnimatePresence>
              {isPasted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute inset-0 border-2 border-[#00f2fe] rounded-2xl pointer-events-none glitch-shadow"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-[#fe0979] text-sm font-medium bg-[#fe0979]/10 py-2 px-4 rounded-lg border border-[#fe0979]/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Sphere → Pill Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            layout
            animate={isLoading
              ? { borderRadius: "9999px", width: "auto", height: "52px" }
              : { borderRadius: "9999px", width: "128px", height: "128px" }
            }
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            whileHover={!isLoading ? { scale: 1.05 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
            className="group relative flex items-center justify-center outline-none disabled:cursor-not-allowed mt-4 overflow-hidden"
            style={{ minWidth: isLoading ? "180px" : undefined }}
          >
            {/* Gradient border glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#00f2fe] to-[#fe0979] opacity-80 group-hover:opacity-100 transition-opacity"
              animate={{ filter: isLoading ? "blur(0px)" : "blur(2px)" }}
            />
            <div className="absolute inset-[2px] bg-gradient-to-tl from-[#010101] to-[#111111] z-10" style={{ borderRadius: "inherit" }} />

            {/* Inner glow on hover */}
            {!isLoading && (
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-[#00f2fe]/20 to-[#fe0979]/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            {/* Button Content */}
            <div className="z-30 flex flex-row items-center justify-center gap-3 px-6">
              {isLoading ? (
                <>
                  {/* TikTok conic-gradient spinner */}
                  <motion.div
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{
                      background: "conic-gradient(#00f2fe 0deg, #fe0979 180deg, transparent 180deg)",
                      maskImage: "radial-gradient(transparent 55%, black 56%)",
                      WebkitMaskImage: "radial-gradient(transparent 55%, black 56%)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-sm font-bold text-white uppercase tracking-wider whitespace-nowrap">
                    {loadingMessages[loadingStep].split(" ").map((word, idx) => (
                      <span key={idx}>
                        {word === "video" ? (
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#fe0979]">
                            {word}
                          </span>
                        ) : (
                          word
                        )}
                        {idx < loadingMessages[loadingStep].split(" ").length - 1 ? " " : ""}
                      </span>
                    ))}
                    ...
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    Get{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] to-[#fe0979]">Video</span>
                  </span>
                </>
              )}
            </div>

            {/* Scanning line effect on hover (sphere only) */}
            {!isLoading && (
              <div className="absolute inset-0 z-20 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none">
                <motion.div
                  className="w-full h-[2px] bg-white/50"
                  animate={{ y: [-64, 64] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
          </motion.button>

          {/* Patience notice */}
          {!isLoading && (
            <p className="text-xs text-gray-600 text-center max-w-xs leading-relaxed">
              This uses a video scraper and may take up to a minute.{" "}
              <span className="text-gray-500">Thanks for your patience 🙏</span>
            </p>
          )}
        </form>

        {/* Results Section */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="w-full bg-[#111111] rounded-3xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden"
            >
              {/* Glossy top highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="flex flex-col md:flex-row gap-6">
                {/* Video Image Cover */}
                <div className="relative w-full md:w-48 aspect-[9/16] rounded-xl overflow-hidden bg-gray-900 flex-shrink-0 group">
                  {result.coverUrl ? (
                    <img
                      src={result.coverUrl}
                      alt="Video cover"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <PlayCircle className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  {result.coverUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                  )}
                  {/* Glitch overlay on image */}
                  <div className="absolute inset-0 bg-[#00f2fe] mix-blend-color opacity-0 group-hover:opacity-20 transition-opacity" />
                </div>

                {/* Info & Download */}
                <div className="flex flex-col justify-between flex-1 py-2">
                  <div className="space-y-4">
                    {result.authorName && (
                      <p className="text-xs font-semibold text-[#00f2fe] uppercase tracking-widest">
                        @{result.authorName}
                      </p>
                    )}
                    <p className="text-sm text-gray-300 line-clamp-4 leading-relaxed">
                      {result.text || "No description available."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {result.definition && (
                        <span className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-400 font-medium">
                          {result.definition}
                        </span>
                      )}
                      {result.format && (
                        <span className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-400 font-medium uppercase">
                          {result.format}
                        </span>
                      )}
                      {result.duration > 0 && (
                        <span className="px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-400 font-medium">
                          {result.duration}s
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    {result.downloadAddr ? (
                      <a
                        href={`/api/apify/download?url=${encodeURIComponent(result.downloadAddr)}`}
                        download
                        className="flex-1 relative group overflow-hidden bg-white text-black font-semibold rounded-xl py-4 px-6 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Download Video
                        {/* Glitch active state */}
                        <div className="absolute inset-0 border-2 border-transparent group-active:border-[#00f2fe] rounded-xl transition-colors pointer-events-none" />
                      </a>
                    ) : (
                      <div className="flex-1 bg-gray-800/50 text-gray-400 font-medium rounded-xl py-4 px-6 flex items-center justify-center gap-2 cursor-not-allowed">
                        Download Unavailable
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
