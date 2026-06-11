"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = [
  "Halo",        // Indonesia
  "Hello",        // Inggris
  "Bonjour",     // Prancis
  "Ciao",        // Italia
  "안녕하세요",    // Korea
  "你好",        // China
  "こんにちは",  // Jepang
  "Selamat Datang",        // Rusia
];

const colors = [
  "text-blue-600",
  "text-purple-600",
  "text-pink-600",
  "text-emerald-600",
  "text-amber-600",
  "text-blue-600",
  "text-pink-600",
  "text-blue-600"
];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Jika sudah sampai kata terakhir, hentikan loop dan panggil onComplete
    if (index === words.length - 1) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500); // Tahan kata terakhir selama 500ms
      return () => clearTimeout(timeout);
    }

    // Ganti kata setiap 200 milidetik
    const interval = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 200);

    return () => clearInterval(interval);
  }, [index, onComplete]);

  useEffect(() => {
    // Pastikan scroll berada di atas
    window.scrollTo(0, 0);
    // Kunci scrollbar browser selama loading aktif agar user tidak bisa scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
      window.scrollTo(0, 0);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        scale: 1.5,
        opacity: 0,
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }
      }}
      className="fixed inset-0 bg-[#F3F0FF] z-[9999] flex items-center justify-center"
    >
      {/* Wrapper tanpa overflow-hidden agar efek fade-out terasa natural tanpa terpotong kotak tajam */}
      <div className="h-32 flex items-center justify-center relative w-full">
        <AnimatePresence>
          <motion.p
            key={index}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`text-5xl md:text-7xl font-black tracking-tight ${colors[index]} absolute`}
          >
            {words[index]}
            <span className="text-primary">.</span>
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
