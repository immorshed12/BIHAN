'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import Footer from '@/components/Footer';

export default function LibraryShelfPage() {
  const { user, setUser, logout } = useStore();
  const [books, setBooks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [activeLoungeTab, setActiveLoungeTab] = useState<'shelf' | 'stats' | 'claims'>('shelf');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    setIsMounted(true);
    
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const viewAsUser = searchParams?.get('view') === 'user';

    // Fetch fresh user session
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          if (data.user.role === 'admin') {
            if (viewAsUser) {
              setIsAdminPreview(true);
            } else {
              window.location.href = '/admin';
            }
          }
        }
      })
      .catch(err => console.error('Session fetch error:', err));

    // Fetch all books
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.books) {
          setBooks(data.books);
        }
      })
      .catch(err => console.error('Fetch books error:', err))
      .finally(() => setLoading(false));
  }, [setUser]);

  // Fetch user orders when session is loaded
  useEffect(() => {
    if (user && user.email) {
      setOrdersLoading(true);
      fetch('/api/user/orders')
        .then(res => res.json())
        .then(data => {
          if (data.orders) {
            setOrders(data.orders);
          }
        })
        .catch(err => console.error('Fetch user orders error:', err))
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  // Extract user-owned/unlocked books
  const ownedBooks = books.filter(book => {
    const isOwned = user?.purchasedBooks?.includes(book._id) || user?.role === 'admin';
    return isOwned;
  });

  const getReadingProgress = (bookId: string, totalPages: number) => {
    if (typeof window === 'undefined') return 0;
    const lastPage = localStorage.getItem(`gronthi-lastpage-${bookId}`);
    if (!lastPage) return 0;
    const progress = Math.round((parseInt(lastPage, 10) / totalPages) * 100);
    return Math.min(100, Math.max(0, progress));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    logout();
    window.location.href = '/';
  };

  // If mounted but no user — show login prompt
  if (isMounted && !user) {
    return (
      <main className="min-h-screen bg-radial-glow bg-velvet text-slate-100 flex flex-col items-center justify-center gap-8 px-4 font-sans">
        <div className="absolute inset-0 bg-radial-purple-glow opacity-30 pointer-events-none" />
        <div className="relative z-10 w-full max-w-md text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender/20 to-indigo-500/10 border border-lavender/30 flex items-center justify-center text-3xl shadow-lg shadow-lavender/20">
            📚
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-black text-slate-100 font-serif">আমার বিহান তাক</h1>
            <p className="text-sm text-slate-400">আপনার প্রোফাইল ও লাইব্রেরি দেখতে প্রথমে লগইন করুন।</p>
          </div>
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-velvet/85 to-[#4e3a7a] hover:from-[#4e3a7a] hover:to-[#5d4692] text-lavender border border-lavender/30 font-bold rounded-2xl text-sm transition duration-300 shadow-lg shadow-lavender/10"
          >
            হোম পেজে গিয়ে লগইন করুন →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {isAdminPreview && (
        <div className="w-full bg-gradient-to-r from-[#501c3e]/90 via-[#201140]/90 to-[#501c3e]/90 border-b border-lavender/30 text-slate-200 py-3 text-center text-xs font-sans font-bold flex items-center justify-center gap-3 backdrop-blur-md sticky top-0 z-[100] select-none shadow-lg">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lavender animate-pulse" />
            🛡️ <strong>এডমিন ইউজার ভিউ মোড:</strong> গ্রাহকরা যেভাবে লাইব্রেরি শেলফ দেখবে, আপনিও সেভাবেই দেখছেন।
          </span>
          <Link 
            href="/admin" 
            className="px-3.5 py-1 bg-lavender text-velvet rounded-xl font-black transition-all duration-200 hover:bg-white hover:text-velvet hover:shadow-lg shadow shadow-lavender/10"
          >
            এডমিন প্যানেলে ফিরে যান →
          </Link>
        </div>
      )}
      <main className="min-h-screen bg-radial-glow bg-velvet text-slate-100 py-12 px-4 md:px-8 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-radial-purple-glow opacity-30 pointer-events-none" />


      <div className="w-full max-w-6xl mx-auto z-10 relative flex flex-col gap-8">
        
        {/* Sleek Minimalist Header */}
        <nav className="w-full py-4 flex items-center justify-between border-b border-white/5 relative z-20">
          <Link href="/" className="flex items-center select-none cursor-pointer -my-4">
            <img 
              src="/logo.png" 
              alt="বিহান (BIHAN)" 
              className="h-20 md:h-28 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(15,23,42,0.03)]"
            />
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="px-5 py-2 border border-white/10 hover:bg-white/5 rounded-full text-xs font-black text-slate-200 transition cursor-pointer">
              ← লাইব্রেরি স্টোর
            </Link>
            {isMounted && user && (
              <button 
                onClick={handleLogout}
                className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 rounded-full text-xs font-black transition duration-200 cursor-pointer"
              >
                লগআউট
              </button>
            )}
          </div>
        </nav>

        {/* Dynamic Dual Grid: Profile Card & 3D Shelf */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 text-left">
          
          {/* ═══ PREMIUM CYBERPUNK GLASSMORPHIC PROFILE CARD ═══ */}
          <div className="relative rounded-3xl overflow-hidden h-fit group">
            {/* Animated neon border glow */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-lavender/60 via-indigo-500/30 to-cyan-500/40 opacity-70 group-hover:opacity-100 transition duration-500 blur-[1px]" />
            <div className="relative bg-dark-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 flex flex-col gap-5 shadow-2xl shadow-lavender/10">

              {/* Top accent line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-lavender via-cyan-400 to-indigo-500 shadow-[0_0_20px_rgba(192,132,252,0.6)]" />

              {/* Section Label */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-lavender/80 uppercase tracking-[0.25em] font-mono">
                  ◈ বিহান — সদস্য প্রোফাইল
                </span>
                <span className="text-[9px] font-black text-cyan-400/70 uppercase tracking-widest font-mono animate-pulse">
                  ● LIVE
                </span>
              </div>

              {isMounted && user ? (
                <>
                  {/* Avatar + Identity */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender/20 via-indigo-500/10 to-cyan-500/10 border border-lavender/40 flex items-center justify-center text-2xl font-black text-lavender select-none shadow-lg shadow-lavender/20">
                        {user.name ? user.name[0].toUpperCase() : '?'}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-dark-950 shadow" />
                    </div>
                    <div className="flex flex-col min-w-0 gap-1">
                      <span className="text-sm font-extrabold text-slate-100 truncate leading-tight">{user.name || 'সম্মানিত পাঠক'}</span>
                      {/* VIP Badge */}
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full w-fit">
                        ★ ভিআইপি সদস্য
                      </span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col gap-0.5">
                      <span className="text-base font-black text-lavender">{ownedBooks.length}</span>
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">বই আনলক</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col gap-0.5">
                      <span className="text-base font-black text-emerald-400">{orders.length}</span>
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">অর্ডার</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col gap-0.5">
                      <span className="text-base font-black text-cyan-400">∞</span>
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">অ্যাক্সেস</span>
                    </div>
                  </div>

                  {/* Info Fields */}
                  <div className="flex flex-col gap-2.5 text-xs font-mono">
                    <div className="flex items-center justify-between bg-velvet/30 border border-white/5 rounded-xl px-3.5 py-2.5">
                      <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">ইমেইল</span>
                      <span className="text-slate-200 select-all truncate max-w-[140px] text-right text-[11px]">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between bg-velvet/30 border border-white/5 rounded-xl px-3.5 py-2.5">
                      <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">রোল</span>
                      <span className="text-lavender font-black uppercase text-[10px] tracking-wider">{user.role}</span>
                    </div>
                    <div className="flex items-center justify-between bg-velvet/30 border border-lavender/10 rounded-xl px-3.5 py-2.5">
                      <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">আইডি</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 truncate max-w-[90px]">{user.id?.slice(0, 12)}…</span>
                        <button
                          onClick={() => copyToClipboard(user.id)}
                          className="px-2 py-1 bg-lavender/10 hover:bg-lavender/25 border border-lavender/20 hover:border-lavender/50 rounded-lg text-[9px] text-lavender font-black transition duration-200"
                        >
                          {copiedId ? '✓' : 'কপি'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-500/40 text-rose-400 font-bold rounded-2xl text-xs transition duration-200 cursor-pointer"
                  >
                    লগআউট করুন
                  </button>
                </>
              ) : (
                <div className="text-xs text-slate-400 font-mono text-center py-4">
                  প্রোফাইল লোড হচ্ছে...
                </div>
              )}
            </div>
          </div>

          {/* ═══ Lounges and Tabs Container (col-span-2) ═══ */}
          <div className="lg:col-span-2 flex flex-col gap-6 font-sans">
            
            {/* Tab Navigation header */}
            <div className="flex border-b border-white/5 pb-1 gap-2 md:gap-4 overflow-x-auto select-none text-left">
              {[
                { key: 'shelf', label: '📚 আমার বইয়ের তাক' },
                { key: 'stats', label: '📈 রিডিং হাব ও অর্জন' },
                { key: 'claims', label: '💳 পেমেন্ট ট্র্যাকার' }
              ].map((tab) => (
                <button 
                  key={tab.key}
                  onClick={() => setActiveLoungeTab(tab.key as any)}
                  className={`py-2 px-4 text-xs font-black border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
                    activeLoungeTab === tab.key 
                      ? 'border-lavender text-lavender' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: DYNAMIC VIRTUAL OAK-SHELF BOOKCASE */}
            {activeLoungeTab === 'shelf' && (
              <div className="flex flex-col gap-6 text-left">
                {/* Search and Filters panel */}
                {ownedBooks.length > 0 && (
                  <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-dark-900/30 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
                    {/* Quick Search */}
                    <div className="relative w-full md:max-w-xs">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                      <input 
                        type="text"
                        placeholder="তাকের বই খুঁজুন..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-velvet/40 border border-white/10 rounded-xl text-xs font-medium focus:border-lavender text-slate-200 placeholder:text-slate-500 transition duration-300 outline-none"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="relative w-full md:w-auto md:min-w-[150px]">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full appearance-none pl-3.5 pr-8 py-2 bg-velvet/50 border border-lavender/25 rounded-xl text-xs font-black text-slate-200 focus:outline-none focus:border-lavender cursor-pointer shadow-lg shadow-lavender/5"
                      >
                        {(() => {
                          const categoriesSet = new Set(ownedBooks.map(b => b.category).filter(Boolean));
                          const uniqueCats = ['All', ...Array.from(categoriesSet)];
                          return uniqueCats.map((cat) => (
                            <option key={cat} value={cat} className="bg-[#160e29] text-slate-200">
                              {cat === 'All' ? '📚 সব ক্যাটাগরি' : `• ${cat}`}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="py-20 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-lavender/20 border-t-lavender rounded-full animate-spin" />
                  </div>
                ) : (() => {
                  const filteredBooks = ownedBooks.filter(book => {
                    const matchesSearch = 
                      book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      book.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
                    return matchesSearch && matchesCategory;
                  });

                  if (ownedBooks.length === 0) {
                    return (
                      <div className="glass-panel p-12 text-center text-slate-400 rounded-3xl border border-white/5 bg-dark-900/30 shadow-xl backdrop-blur-md">
                        <span className="text-3xl block mb-3">📚</span>
                        <h3 className="text-base font-black text-slate-300 font-serif">আপনার তাক বর্তমানে খালি রয়েছে!</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed font-sans">
                          আপনি এখনও কোনো প্রিমিয়াম গাইড আনলক করেননি। হোমপেজে ফিরে গিয়ে আপনার পছন্দের প্রিমিয়াম গাইডটি আনলক করুন।
                        </p>
                        <Link href="/" className="mt-6 inline-block px-5 py-2.5 bg-gradient-to-r from-velvet/85 to-[#4e3a7a] hover:from-[#4e3a7a] hover:to-[#5d4692] text-lavender border border-lavender/30 text-xs font-bold rounded-xl transition duration-300">
                          প্রিমিয়াম গাইড ব্রাউজ করুন
                        </Link>
                      </div>
                    );
                  }

                  if (filteredBooks.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                        এই ফিল্টারের সাথে মিলে যায় এমন কোনো বই খুঁজে পাওয়া যায়নি।
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-12 relative">
                      {/* Luxurious Oak Bookshelf Visual Grid */}
                      <div className="relative flex flex-col pt-10 pb-2 bg-transparent">
                        {/* Shelf floor line */}
                        <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-b from-[#8B5A2B] via-[#5C3815] to-[#3D250E] rounded-full border-t border-[#A06D3B] shadow-[0_8px_20px_rgba(0,0,0,0.6)] z-10" />
                        <div className="absolute bottom-[-6px] inset-x-4 h-2 bg-[#261609] rounded-full blur-[2px] opacity-80 z-0" />
                        
                        {/* Book items list */}
                        <div className="flex justify-start gap-8 md:gap-10 items-end px-6 md:px-10 relative z-20 min-h-[200px] overflow-x-auto pb-5 scrollbar-thin">
                          {filteredBooks.map((book) => {
                            const progress = getReadingProgress(book._id, book.pageCount);
                            
                            // Glowing SVG Circular Progress Dial variables
                            const radius = 13;
                            const stroke = 2.5;
                            const normalizedRadius = radius - stroke * 2;
                            const circumference = normalizedRadius * 2 * Math.PI;
                            const strokeDashoffset = circumference - (progress / 100) * circumference;

                            return (
                              <Link 
                                key={book._id}
                                href={`/book/${book._id}${isAdminPreview ? '?view=user' : ''}`}
                                className="relative w-28 md:w-32 flex flex-col items-center group cursor-pointer book-perspective mb-1 transition-transform duration-300 hover:-translate-y-3.5 flex-shrink-0"
                              >
                                {/* 3D Standing Book Cover */}
                                <div className="relative w-24 h-32 md:w-28 md:h-36 rounded-r-lg shadow-[0_10px_20px_rgba(0,0,0,0.55)] border border-white/10 bg-gradient-to-br from-indigo-950/80 to-dark-950 overflow-hidden flex flex-col justify-between p-3 origin-bottom transition duration-300 group-hover:shadow-[0_15px_30px_rgba(211,197,246,0.22)]">
                                  <div className="absolute top-0 left-0 right-0 h-[150%] bg-gradient-to-b from-white/10 via-transparent to-transparent -skew-y-[40deg] origin-top-left pointer-events-none" />
                                  
                                  {/* Top Row: PDF tag + Circular glowing progress dial */}
                                  <div className="flex justify-between items-start z-10 w-full select-none">
                                    <span className="text-[6px] font-black text-lavender uppercase tracking-widest border border-lavender/35 px-1 py-0.5 rounded w-fit">PDF</span>
                                    
                                    {/* Mini SVG Progress Ring */}
                                    <div className="relative w-7 h-7 flex items-center justify-center rounded-full bg-dark-950/40 p-0.5 shadow-inner">
                                      <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="14" cy="14" r={normalizedRadius} stroke="rgba(255,255,255,0.03)" strokeWidth={stroke} fill="transparent" />
                                        <circle 
                                          cx="14" 
                                          cy="14" 
                                          r={normalizedRadius} 
                                          stroke="#c084fc" 
                                          strokeWidth={stroke} 
                                          fill="transparent" 
                                          strokeDasharray={circumference + ' ' + circumference} 
                                          style={{ strokeDashoffset }} 
                                          className="transition-all duration-500 ease-out"
                                        />
                                      </svg>
                                      <span className="absolute text-[6px] font-black text-slate-100 font-mono">{progress}%</span>
                                    </div>
                                  </div>

                                  <h4 className="text-[9px] md:text-[10px] font-black text-white font-serif leading-tight select-none line-clamp-3 text-left z-10 mt-1">{book.title}</h4>
                                  
                                  <div className="flex justify-between text-[6px] text-white/40 font-mono z-10 border-t border-white/5 pt-1 mt-1">
                                    <span>{book.pageCount} পৃষ্ঠা</span>
                                    <span className="font-bold text-lavender">{progress === 100 ? 'সমাপ্ত ✓' : 'পড়া হচ্ছে'}</span>
                                  </div>
                                </div>

                                {/* Custom premium label underneath shelf wood line shadow */}
                                <span className="text-[9px] text-slate-400 hover:text-slate-200 font-bold mt-2 shadow-sm font-sans z-20">
                                  পড়া হয়েছে: <strong className="text-lavender font-mono">{progress}%</strong>
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 2: PERSONAL READING HUB & GAMIFIED ACHIEVEMENTS */}
            {activeLoungeTab === 'stats' && (
              <div className="flex flex-col gap-6 text-left animate-fade-in">
                
                {/* 1. Continue Reading Glowing Hero Banner */}
                {(() => {
                  // Find user last-read book (with progress > 0). If none, default to first book.
                  const readingBooks = ownedBooks.map(b => ({
                    book: b,
                    progress: getReadingProgress(b._id, b.pageCount)
                  })).filter(item => item.progress > 0);

                  const activeItem = readingBooks.length > 0 
                    ? readingBooks.reduce((prev, current) => (prev.progress > current.progress) ? prev : current)
                    : ownedBooks.length > 0 ? { book: ownedBooks[0], progress: 0 } : null;

                  if (!activeItem) return null;

                  return (
                    <div className="relative rounded-3xl overflow-hidden group">
                      {/* Animated backglow neon gradient */}
                      <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-lavender/30 via-cyan-400/20 to-indigo-500/30 opacity-70 group-hover:opacity-100 transition duration-500 blur-[1px]" />
                      <div className="relative bg-dark-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-5 flex flex-col md:flex-row items-center gap-6 shadow-xl">
                        
                        {/* Book cover projection */}
                        <div className="relative w-20 h-28 bg-white/5 rounded-lg border border-white/10 flex-shrink-0 flex items-center justify-center p-0.5 overflow-hidden shadow-lg select-none">
                          {activeItem.book.coverImage ? (
                            <img src={activeItem.book.coverImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] text-slate-500 font-bold font-serif">{activeItem.book.title}</span>
                          )}
                        </div>

                        {/* Middle information column */}
                        <div className="flex-grow flex flex-col gap-1 text-left min-w-0 w-full">
                          <span className="text-[9px] font-black text-lavender uppercase tracking-widest font-mono flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-lavender animate-ping" />
                            {activeItem.progress > 0 ? '◈ সর্বশেষ পঠিত পিডিএফ' : '◈ আপনার প্রথম গাইড'}
                          </span>
                          <h3 className="text-base font-black text-slate-200 leading-snug truncate mt-1 font-serif">{activeItem.book.title}</h3>
                          <p className="text-xs text-slate-400 truncate max-w-sm">{activeItem.book.author} • {activeItem.book.category || 'লার্নিং গাইড'}</p>
                          
                          {/* Progress slider bar */}
                          <div className="flex items-center gap-3 mt-2 w-full max-w-xs font-sans">
                            <div className="flex-grow bg-white/10 h-1.5 rounded-full overflow-hidden border border-white/5">
                              <div 
                                style={{ width: `${activeItem.progress}%` }}
                                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold font-mono whitespace-nowrap">{activeItem.progress}% পড়া</span>
                          </div>
                        </div>

                        {/* Action Call to Button */}
                        <Link
                          href={`/book/${activeItem.book._id}${isAdminPreview ? '?view=user' : ''}`}
                          className="px-6 py-3 bg-gradient-to-r from-lavender to-indigo-600 hover:from-white hover:to-white hover:text-velvet text-white font-bold rounded-2xl text-xs transition duration-300 shadow-md shadow-lavender/5 shrink-0 flex items-center gap-1.5 cursor-pointer"
                        >
                          {activeItem.progress > 0 ? 'পড়া শুরু করুন' : 'প্রথম পাতা খুলুন'} 📖
                        </Link>

                      </div>
                    </div>
                  );
                })()}

                {/* 2. Achievement badging grid panel */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">অর্জনসমূহ ও মেডেল (Achievements Panel)</span>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none font-sans text-xs">
                    {[
                      {
                        emoji: '🎓',
                        title: 'প্রথম পদক্ষেপ',
                        desc: 'তাকের প্রথম গাইড আনলক করার গৌরব।',
                        unlocked: ownedBooks.length >= 1
                      },
                      {
                        emoji: '📖',
                        title: 'নিয়মিত পাঠক',
                        desc: 'বই পড়া শুরু করে রিডিং প্রোফাইল তৈরি।',
                        unlocked: ownedBooks.some(b => getReadingProgress(b._id, b.pageCount) > 0)
                      },
                      {
                        emoji: '🏆',
                        title: 'মাস্টার রিডার',
                        desc: 'যেকোনো একটি বই সফলভাবে ১০০% শেষ করা।',
                        unlocked: ownedBooks.some(b => getReadingProgress(b._id, b.pageCount) === 100)
                      },
                      {
                        emoji: '⚡',
                        title: 'ভিআইপি মেম্বার',
                        desc: 'একটি লাইভ ভেরিফাইড মেম্বারশিপ অ্যাকাউন্ট।',
                        unlocked: user && user.email !== 'guest_user'
                      }
                    ].map((badge, idx) => (
                      <div 
                        key={idx}
                        className={`relative rounded-2xl border p-4 flex flex-col items-center text-center gap-2 transition duration-300 ${
                          badge.unlocked 
                            ? 'bg-dark-900/40 border-lavender/25 text-slate-200 shadow-md shadow-lavender/5' 
                            : 'bg-dark-950/20 border-white/5 text-slate-600 grayscale opacity-45'
                        }`}
                      >
                        {badge.unlocked && (
                          <div className="absolute top-1 right-2 text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">UNLOCKED</div>
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${badge.unlocked ? 'bg-lavender/10 border border-lavender/30 shadow' : 'bg-white/5 border border-white/5'}`}>
                          {badge.emoji}
                        </div>
                        <h4 className={`font-black ${badge.unlocked ? 'text-lavender' : 'text-slate-500'}`}>{badge.title}</h4>
                        <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">{badge.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Overall Lounge Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-dark-900/30 flex justify-between items-center gap-4 text-left">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">লাইব্রেরি সমাপ্তির হার</span>
                      <h4 className="text-sm font-black text-slate-200">সার্বগ্রাহ্য তাকের অগ্রগতি</h4>
                    </div>
                    {(() => {
                      const totalProgress = ownedBooks.reduce((sum, b) => sum + getReadingProgress(b._id, b.pageCount), 0);
                      const average = ownedBooks.length > 0 ? Math.round(totalProgress / ownedBooks.length) : 0;
                      return <span className="text-xl font-black text-cyan-400 font-mono">{average}%</span>;
                    })()}
                  </div>
                  
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-dark-900/30 flex justify-between items-center gap-4 text-left">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">পড়ার স্ট্যাটাস</span>
                      <h4 className="text-sm font-black text-slate-200">সমাপ্ত হওয়া পিডিএফ গাইড</h4>
                    </div>
                    {(() => {
                      const completedCount = ownedBooks.filter(b => getReadingProgress(b._id, b.pageCount) === 100).length;
                      return <span className="text-xl font-black text-emerald-400 font-mono">{completedCount} / {ownedBooks.length}</span>;
                    })()}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: PAYMENT claims AND REAL-TIME TRANSACTION TRACKER */}
            {activeLoungeTab === 'claims' && (
              <div className="glass-panel p-5 rounded-3xl border border-white/5 bg-dark-900/40 backdrop-blur-xl flex flex-col gap-4 relative overflow-hidden shadow-2xl text-left animate-fade-in">
                <div className="flex flex-col gap-0.5 border-b border-white/5 pb-3">
                  <span className="text-[9px] font-black text-lavender uppercase tracking-widest font-mono">◈ রিয়েল-টাইম পেমেন্ট হিস্ট্রি</span>
                  <h2 className="text-base font-black text-slate-200 font-serif">আমার পেমেন্ট ক্লেইম ও অর্ডার ট্র্যাকিং</h2>
                </div>

                {ordersLoading ? (
                  <div className="py-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-lavender/20 border-t-lavender rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 border border-dashed border-white/5 rounded-2xl font-sans text-xs select-none">
                    কোনো সাবমিট করা পেমেন্ট ট্র্যাকিং রেকর্ড পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/5 shadow-inner">
                    <table className="w-full text-left border-collapse text-xs font-sans">
                      <thead>
                        <tr className="bg-dark-950/60 border-b border-white/5 text-[9px] text-slate-400 uppercase font-black tracking-wider select-none">
                          <th className="p-3.5">ই-বুক বিবরণ</th>
                          <th className="p-3.5">মোবাইল নম্বর</th>
                          <th className="p-3.5 font-mono">TrxID / TxID</th>
                          <th className="p-3.5">পরিমাণ</th>
                          <th className="p-3.5 text-center">ভেরিফিকেশন স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map((order: any) => (
                          <tr key={order._id} className="hover:bg-white/5 transition duration-150">
                            
                            {/* Ebook detail column */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3 min-w-[150px]">
                                <div className="w-7 h-10 bg-white/5 rounded border border-white/10 flex-shrink-0 flex items-center justify-center font-serif text-[5px] text-white/50 text-center overflow-hidden leading-tight p-0.5 select-none">
                                  {order.bookId?.title || 'ই-বুক'}
                                </div>
                                <div className="flex flex-col min-w-0 text-left">
                                  <h4 className="font-extrabold text-slate-200 truncate">{order.bookId?.title || 'ডিজিটাল গাইড'}</h4>
                                  <span className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">{order.paymentGateway}</span>
                                </div>
                              </div>
                            </td>

                            {/* Customer Phone */}
                            <td className="p-3.5 font-mono text-slate-300 font-bold">{order.customerPhone}</td>

                            {/* Transaction ID */}
                            <td className="p-3.5 font-mono font-bold text-lavender tracking-wider select-all uppercase">
                              {order.submittedTxID}
                            </td>

                            {/* Amount paid */}
                            <td className="p-3.5 font-mono font-bold text-slate-200">
                              ৳ {order.amountPaid}
                            </td>

                            {/* Verification status glow indicators */}
                            <td className="p-3.5 text-center">
                              <div className="flex justify-center select-none">
                                {order.status === 'pending' && (
                                  <span className="px-2.5 py-0.5 rounded-full border border-amber-500/25 bg-amber-500/5 text-amber-400 text-[9px] font-black tracking-wide flex items-center gap-1.5 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                    যাচাইাধীন
                                  </span>
                                )}
                                {order.status === 'approved' && (
                                  <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-wide flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    সফল
                                  </span>
                                )}
                                {order.status === 'rejected' && (
                                  <span className="px-2.5 py-0.5 rounded-full border border-rose-500/25 bg-rose-500/10 text-rose-400 text-[9px] font-black tracking-wide flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    বাতিল
                                  </span>
                                )}
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </section>

      </div>
    </main>
    <Footer />
    </>
  );
}
