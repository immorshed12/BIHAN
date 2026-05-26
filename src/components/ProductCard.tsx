'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookItem } from '@/store/useStore';

interface ProductCardProps {
  book: BookItem & {
    author: string;
    description: string;
    rating: number;
    isFree: boolean;
    coverColor?: string;
    _id?: string;
  };
  onAction: (bookId: string) => void;
}

export default function ProductCard({ book, onAction }: ProductCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = x - xc;
    const dy = y - yc;
    // Rotate card up to 10 degrees dynamically
    const rx = -(dy / yc) * 10;
    const ry = (dx / xc) * 10;
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--rx', '0deg');
    cardRef.current.style.setProperty('--ry', '0deg');
  };

  // Define cover backgrounds based on titles/colors
  const getCoverGradient = () => {
    const bookIdStr = book.id || book._id;
    switch (bookIdStr) {
      case "60c72b2f9b1d8a23c4d5e6f1": // UI/UX Guide
        return "from-cyan-900 via-indigo-950 to-dark-950";
      case "60c72b2f9b1d8a23c4d5e6f2": // Art techniques
        return "from-fuchsia-950 via-purple-950 to-dark-950";
      case "60c72b2f9b1d8a23c4d5e6f3": // Typography
        return "from-slate-900 via-zinc-950 to-dark-950";
      case "60c72b2f9b1d8a23c4d5e6f4": // Creator's handbook
        return "from-teal-950 via-slate-950 to-dark-950";
      case "60c72b2f9b1d8a23c4d5e6f5": // Responsive design
        return "from-sky-950 via-emerald-950 to-dark-950";
      case "60c72b2f9b1d8a23c4d5e6f6": // Tuntunir Boi
        return "from-emerald-950 via-teal-950 to-dark-950";
      case "60c72b2f9b1d8a23c4d5e6f7": // Abol Tabol
        return "from-amber-950 via-rose-950 to-dark-950";
      case "60c72b2f9b1d8a23c4d5e6f8": // Thakurmar Jhuli
        return "from-indigo-950 via-violet-950 to-dark-950";
      case "60c72b2f9b1d8a23c4d5e6f9": // HaJaBaRaLa
        return "from-pink-950 via-purple-950 to-dark-950";
      default:
        return "from-primary-950 via-dark-900 to-dark-950";
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        transform: 'perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))',
        transformStyle: 'preserve-3d',
      }}
      className={`glass-panel rounded-3xl p-6 flex flex-col justify-between gap-6 relative transition-all duration-100 ${
        book.isFree 
          ? 'border-emerald-500/10 hover:border-emerald-500/30 shadow-emerald-950/5' 
          : 'border-white/5 hover:border-lavender/35 hover:shadow-[0_0_25px_rgba(211,197,246,0.18)] shadow-black/40'
      } book-perspective book-mockup-hover group`}
    >
      {/* 3D Tilted floating physical book cover */}
      <div className="w-full h-56 rounded-2xl relative overflow-hidden bg-dark-950/30 border border-white/5 flex items-center justify-center py-2">
        
        {/* Book Container with 3D Rotation */}
        <div className="relative w-36 h-48 book-mockup transition-transform duration-500 ease-out">
          
          {/* Glowing outer shadow layer */}
          <div className={`absolute -inset-1 rounded-r-xl blur-lg opacity-40 group-hover:opacity-60 transition duration-300 ${
            book.isFree 
              ? 'bg-emerald-500/20' 
              : 'bg-lavender/25'
          }`} />

          {/* Paper Edge layers (Inside Pages) */}
          <div className="absolute top-1 bottom-1 -right-[3px] w-[5px] bg-slate-100 rounded-r shadow-sm border-r border-slate-300" />
          <div className="absolute top-1.5 bottom-1.5 -right-[5px] w-[3px] bg-slate-50 rounded-r shadow-sm" />
          
          {/* Left Spine (Physical Thickness) */}
          <div className={`absolute top-0 bottom-0 -left-[14px] w-[14px] bg-gradient-to-r ${
            book.isFree 
              ? 'from-emerald-900 to-emerald-950' 
              : 'from-velvet to-dark-900'
          } rounded-l origin-right -rotate-y-[85deg] shadow-lg flex flex-col justify-between py-4 items-center text-[7px] text-white/40 font-mono font-black tracking-widest select-none`}>
            <span>PDF</span>
            <span className="uppercase rotate-180 writing-mode-vertical">GRONTHI</span>
          </div>

          {/* Front Book Cover Graphic */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getCoverGradient()} rounded-r-xl border border-white/10 shadow-2xl flex flex-col justify-between p-4 overflow-hidden`}>
            {/* Top Gloss sheen */}
            <div className="absolute top-0 left-0 right-0 h-[150%] bg-gradient-to-b from-white/10 via-transparent to-transparent -skew-y-[40deg] origin-top-left pointer-events-none z-10" />

            {book.coverImage && (
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-300 group-hover:scale-105" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}

            {/* Custom Icon/Badge based on books */}
            <div className="flex justify-between items-start z-10">
              <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                book.isFree ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-lavender/10 text-lavender border border-lavender/20'
              }`}>
                {book.isFree ? 'ফ্রি' : 'প্রিমিয়াম'}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-white/40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>

            {/* Beautiful Title Typography inside the book cover */}
            <div className="flex flex-col gap-1.5 text-left z-10">
              <span className="text-[7px] text-white/50 tracking-wider font-semibold uppercase">{book.author}</span>
              <h4 className="text-xs font-black text-white leading-tight font-serif select-none line-clamp-3">
                {book.title}
              </h4>
            </div>

            {/* Floating details inside cover */}
            <div className="flex justify-between items-end border-t border-white/5 pt-1.5 z-10">
              <span className="text-[7px] text-white/30 font-mono">1.0.0</span>
              <span className="text-[8px] font-black text-white/70">
                {book.isFree ? '৳ ০' : `৳ ${book.price}`}
              </span>
            </div>
          </div>

        </div>

        {/* Free Floating Badge */}
        {book.isFree && (
          <div className="absolute top-3 left-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg backdrop-blur-md">
            ফ্রি
          </div>
        )}
      </div>

      {/* Book Metadata details */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            {book.author}
          </span>
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            ★ {book.rating}
          </span>
        </div>
        
        <h3 className="text-lg font-black text-slate-100 group-hover:text-lavender transition-colors duration-200 line-clamp-1">
          {book.title}
        </h3>
        
        <p className="text-[11px] text-slate-400 leading-tight line-clamp-2 h-7">
          {book.description}
        </p>
      </div>

      {/* Pricing and Action Footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">মূল্য</span>
          <span className="text-lg font-black text-slate-100">
            {book.isFree ? (
              <span className="text-emerald-400">৳ ০.০০</span>
            ) : (
              <span>৳ {book.price}</span>
            )}
          </span>
        </div>

        {book.isFree ? (
          <button
            onClick={() => onAction(book.id || book._id || '')}
            className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-slate-950 text-xs font-black rounded-xl transition duration-300 shadow-md shadow-emerald-500/5 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            ফ্রি ডাউনলোড
          </button>
        ) : (
          <button
            onClick={() => onAction(book.id || book._id || '')}
            className="px-5 py-2.5 bg-gradient-to-r from-velvet/50 to-[#4e3a7a] hover:from-[#4e3a7a] hover:to-[#5d4692] text-lavender border border-lavender/20 text-xs font-black rounded-xl transition duration-300 shadow-md shadow-lavender/5 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-lavender">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            পড়ুন এবং আনলক করুন
          </button>
        )}
      </div>
    </motion.div>
  );
}
