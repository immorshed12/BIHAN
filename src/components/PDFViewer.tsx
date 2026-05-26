'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import * as pdfjsLib from 'pdfjs-dist';

// Use local worker file served from /public — avoids CDN CORS/CSP issues entirely
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}


interface PDFViewerProps {
  bookId: string;
  totalPageCount: number;
  previewLimit: number;
  isPurchased: boolean;
  bookPrice?: number;
}

export default function PDFViewer({ bookId, totalPageCount, previewLimit, isPurchased, bookPrice = 250 }: PDFViewerProps) {
  const { user } = useStore();
  const [renderedPages, setRenderedPages] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Premium custom state controls
  const [scale, setScale] = useState<number>(1.0); // 0.8 to 1.4 zoom levels
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [currentViewPage, setCurrentViewPage] = useState<number>(1);
  
  // Bengali Dictionary State
  const [selectedWord, setSelectedWord] = useState('');
  const [dictionaryPosition, setDictionaryPosition] = useState<{ x: number, y: number } | null>(null);

  // Bengali Speech Synthesis (TTS Audiobook Player)
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [isTtsPaused, setIsTtsPaused] = useState(false);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Form State for inline reader paywall
  const [paymentGateway, setPaymentGateway] = useState<'bkash' | 'nagad'>('bkash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [txId, setTxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const pagesToLoad = isPurchased ? totalPageCount : Math.min(totalPageCount, previewLimit);

  // Load Bookmarks & Last Read page from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`gronthi-bookmarks-${bookId}`);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

    const lastPage = localStorage.getItem(`gronthi-lastpage-${bookId}`);
    if (lastPage && containerRef.current) {
      const pageInt = parseInt(lastPage, 10);
      if (pageInt > 1) {
        // Trigger a premium custom prompt toast or small confirm dialog
        const confirmContinue = window.confirm(`আপনি কি সর্বশেষ পড়া পৃষ্ঠা ${pageInt} থেকে পড়া শুরু করতে চান?`);
        if (confirmContinue) {
          setTimeout(() => {
            const el = containerRef.current?.querySelector(`[data-page="${pageInt}"]`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 800);
        }
      }
    }
  }, [bookId]);

  useEffect(() => {
    const initialPages = Array.from({ length: pagesToLoad }, (_, i) => i + 1);
    setRenderedPages(initialPages);
    setSubmitSuccess(false);
    setSubmitError('');
    setTxId('');
    setPhoneNumber('');
  }, [pagesToLoad]);

  // Track active page scrolling in viewer container
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollPos = container.scrollTop + container.clientHeight / 2;
    const pageElements = container.querySelectorAll('.pdf-page-wrapper');
    
    pageElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const pageNum = parseInt(htmlEl.getAttribute('data-page') || '1', 10);
      const top = htmlEl.offsetTop;
      const bottom = top + htmlEl.clientHeight;
      
      if (scrollPos >= top && scrollPos <= bottom) {
        setCurrentViewPage(pageNum);
        localStorage.setItem(`gronthi-lastpage-${bookId}`, pageNum.toString());
      }
    });
  };

  const toggleBookmark = (page: number) => {
    let updated;
    if (bookmarks.includes(page)) {
      updated = bookmarks.filter(p => p !== page);
    } else {
      updated = [...bookmarks, page];
    }
    setBookmarks(updated);
    localStorage.setItem(`gronthi-bookmarks-${bookId}`, JSON.stringify(updated));
  };

  // Text-To-Speech Playback controls
  const handlePlayTTS = () => {
    if (isTtsPlaying && isTtsPaused) {
      window.speechSynthesis.resume();
      setIsTtsPaused(false);
      return;
    }

    // Cancel active synthesis first
    window.speechSynthesis.cancel();

    // Fetch dynamic elements text details
    const bookTitle = document.querySelector('h2')?.textContent || 'ইউআই/ইউএক্স গাইড';
    const bookAuthor = document.querySelector('span.text-primary-400')?.textContent || 'গ্রন্থী প্রকাশনী';
    const bookDesc = document.querySelector('p.text-slate-400')?.textContent || '';

    const spokenIntroText = `গ্রন্থী আর্টিফিশিয়াল ইন্টেলিজেন্স বাংলা অডিওবুক রিডারে আপনাকে স্বাগতম। আপনি এখন শুনছেন ${bookAuthor} এর অসাধারণ জনপ্রিয় বই, ${bookTitle}। বইটির ভূমিকা ও সারসংক্ষেপ নিম্নরূপ: ${bookDesc}`;

    const utterance = new SpeechSynthesisUtterance(spokenIntroText);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsTtsPlaying(false);
      setIsTtsPaused(false);
    };

    utterance.onerror = () => {
      setIsTtsPlaying(false);
      setIsTtsPaused(false);
    };

    ttsUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsTtsPlaying(true);
    setIsTtsPaused(false);
  };

  const handlePauseTTS = () => {
    window.speechSynthesis.pause();
    setIsTtsPaused(true);
  };

  const handleStopTTS = () => {
    window.speechSynthesis.cancel();
    setIsTtsPlaying(false);
    setIsTtsPaused(false);
  };

  // Capture Bengali selected word for instant dictionary definition tooltip
  const handleTextSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString().trim();
      // Dictionary triggers only on single words (length between 2 to 15 characters)
      if (text && text.length >= 2 && text.length <= 15) {
        setSelectedWord(text);
        setDictionaryPosition({ x: e.clientX, y: e.clientY - 45 });
      } else {
        setSelectedWord('');
        setDictionaryPosition(null);
      }
    }
  };

  const getBengaliDefinition = (word: string) => {
    const term = word.toLowerCase();
    if (term.includes('ইউআই') || term.includes('ui')) {
      return "User Interface (ব্যবহারকারী ইন্টারফেস) - কম্পিউটার ও ডিজিটাল ডিভাইসের বাহ্যিক রূপ নকশা।";
    }
    if (term.includes('ইউএক্স') || term.includes('ux')) {
      return "User Experience (ব্যবহারকারীর অভিজ্ঞতা) - ব্যবহারকারীর স্বাচ্ছন্দ্য ও সন্তুষ্টির পরিমাপক।";
    }
    if (term.includes('ডিজাইন')) {
      return "নকশা বা শিল্প পরিকল্পনা - কোনো বস্তু বা ব্যবস্থার সুপরিকল্পিত রূপ তৈরি করা।";
    }
    if (term.includes('বই') || term.includes('বইটি')) {
      return "গ্রন্থ বা পুস্তক - পৃষ্ঠা সংবলিত লিখিত বা মুদ্রিত সাহিত্য সম্ভার।";
    }
    if (term.includes('গ্রন্থী')) {
      return "গ্রন্থের বাঁধন বা সংযোগস্থল - আমাদের ডিজিটাল রিডিং প্ল্যাটফর্ম।";
    }
    if (term.includes('ঠাকুরমার')) {
      return "দাদী বা পিতামহী - রূপকথার গল্পের পরিচিত চরিত্র।";
    }
    if (term.includes('ডিজিটাল')) {
      return "ডিজিটাল প্রযুক্তি - বাইনারি ডেটা সিস্টেম ও ইলেকট্রনিক্স ভিত্তিক মাধ্যম।";
    }
    return `"${word}" - গ্রন্থী অভিধান: শব্দার্থের আলোকপাত ও সাহিত্য প্রসঙ্গ সন্ধান।`;
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !txId) {
      setSubmitError('অনুগ্রহ করে সঠিক মোবাইল নম্বর এবং TxID লিখুন।');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');

      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || 'customer@gronthi.com',
        },
        body: JSON.stringify({
          bookId,
          amountPaid: bookPrice,
          paymentGateway,
          customerPhone: phoneNumber,
          submittedTxID: txId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'পেমেন্ট ভেরিফিকেশন ব্যর্থ হয়েছে।');
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'ত্রুটি ঘটেছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 relative" onMouseUp={handleTextSelection}>
      
      {/* 🚀 Ultimate E-Reader Toolbar (Floating glassmorphism controls) */}
      <div className="w-full glass-panel px-4 md:px-6 py-3 rounded-2xl border border-white/5 bg-dark-900/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 z-20 select-none">
        
        {/* Left Side: Page counter & Bookmarks tracker */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-mono">
              পৃষ্ঠা {currentViewPage} / {totalPageCount}
            </span>
          </div>

          <button
            onClick={() => toggleBookmark(currentViewPage)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              bookmarks.includes(currentViewPage)
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{bookmarks.includes(currentViewPage) ? '★ বুকমার্কড' : '☆ বুকমার্ক'}</span>
          </button>
        </div>

        {/* Center: AI Bengali Audiobook Synthesizer Controls */}
        <div className="flex items-center gap-2 bg-dark-950/40 border border-white/5 p-1 rounded-xl">
          <span className="text-[10px] text-slate-500 font-black uppercase px-2 select-none">অডিওবুক</span>
          <button
            onClick={handlePlayTTS}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              isTtsPlaying && !isTtsPaused
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
            title="প্লে অডিওবুক"
          >
            ▶
          </button>
          {isTtsPlaying && (
            <>
              <button
                onClick={handlePauseTTS}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                  isTtsPaused ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
                title="পজ অডিওবুক"
              >
                ⏸
              </button>
              <button
                onClick={handleStopTTS}
                className="w-8 h-8 rounded-lg bg-white/5 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition"
                title="স্টপ অডিওবুক"
              >
                ■
              </button>
            </>
          )}
        </div>

        {/* Right Side: Night mode toggle & Scale (Zoom) controls */}
        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => setScale(prev => Math.max(0.8, prev - 0.1))}
              className="w-7 h-7 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-black rounded-lg transition"
              title="জুম আউট"
            >
              －
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(prev => Math.min(1.4, prev + 0.1))}
              className="w-7 h-7 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-black rounded-lg transition"
              title="জুম ইন"
            >
              ＋
            </button>
          </div>

          {/* Night Mode Switcher */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
              isNightMode
                ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-md'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
            title="নাইট মোড সুইচ"
          >
            🌙
          </button>
        </div>

      </div>

      {/* Premium clean e-reader container */}
      <div 
        ref={containerRef} 
        onScroll={handleScroll}
        className="w-full h-[80vh] overflow-y-auto bg-dark-900/40 border border-white/5 rounded-3xl p-4 md:p-8 flex flex-col items-center gap-8 scroll-smooth relative"
      >
        {renderedPages.map((pageNum) => (
          <PDFPage 
            key={pageNum} 
            bookId={bookId} 
            pageNum={pageNum} 
            userEmail={user?.email} 
            isNightMode={isNightMode}
            scaleMultiplier={scale}
          />
        ))}

        {/* Scribd-style Frosted Paywall Overlay immediately below the 4th preview page */}
        {!isPurchased && (
          <div className="w-full max-w-[800px] rounded-2xl border border-white/5 overflow-hidden relative min-h-[480px] bg-dark-950/30 flex flex-col items-center justify-center p-6 md:p-12 text-center backdrop-blur-xl">
            
            {/* Blurry document visual simulation sheet in background */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-900/60 to-dark-950/90 pointer-events-none z-0" />
            <div className="absolute top-10 left-[50%] -translate-x-[50%] w-[90%] h-[350px] bg-white opacity-[0.02] blur-[4px] rounded border border-white/10 flex flex-col gap-4 p-8 z-0">
              <div className="h-6 bg-white/20 w-3/4 rounded" />
              <div className="h-4 bg-white/10 w-full rounded" />
              <div className="h-4 bg-white/10 w-full rounded" />
              <div className="h-4 bg-white/10 w-5/6 rounded" />
              <div className="h-4 bg-white/10 w-2/3 rounded" />
            </div>

            {/* Paywall content card overlay */}
            <div className="relative z-10 w-full max-w-lg glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-6">
              
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-primary-400 uppercase tracking-widest">রিডার পে-ওয়াল লক</span>
                <h3 className="text-xl md:text-2xl font-black text-slate-100 font-serif">বাকি অংশ পড়তে বইটি আনলক করুন</h3>
                <p className="text-xs text-slate-400 mt-1">
                  বিকাশ বা নগদে সরাসরি সেন্ড মানি করুন। পেমেন্ট পাওয়ার কয়েক সেকেন্ডের মধ্যে পুরো বইটি আনলক হয়ে যাবে।
                </p>
              </div>

              {submitSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-4 gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-bounce">
                    ✓
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">TxID সফলভাবে রেজিস্টার্ড হয়েছে!</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Your transaction code <strong className="text-primary-400 font-mono select-all">{txId}</strong> is under verification. Refresh library dashboard check.
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition duration-200 mt-2"
                  >
                    রিফ্রেশ করুন (Refresh Viewer)
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-5 text-left">
                  
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed flex items-start gap-2.5">
                    <span className="text-base">⚠️</span>
                    <div>
                      <strong className="font-extrabold block text-amber-200 mb-0.5">গুরুত্বপূর্ণ পেমেন্ট সতর্কবার্তা:</strong>
                      আপনাকে অবশ্যই বিকাশ বা নগদের <strong className="text-slate-100 underline decoration-amber-400 underline-offset-2">"Send Money (টাকা পাঠান)"</strong> অপশনটি ব্যবহার করতে হবে। রিচার্জ, ক্যাশ-ইন বা মার্চেন্ট পেমেন্ট গেটওয়েতে প্রসেসড হবে না।
                    </div>
                  </div>

                  {/* bKash/Nagad toggle buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('bkash')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-black transition duration-200 ${
                        paymentGateway === 'bkash'
                          ? 'bg-pink-500/10 border-pink-500 text-pink-400'
                          : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      বিকাশ ওয়ালেট
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('nagad')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-black transition duration-200 ${
                        paymentGateway === 'nagad'
                          ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                          : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      নগদ ওয়ালেট
                    </button>
                  </div>

                  {/* Payment numbers guidelines */}
                  <div className="bg-dark-950/40 border border-white/5 p-3.5 rounded-2xl text-[11px] text-slate-400 flex flex-col gap-1.5 leading-relaxed font-sans bg-dark-950/20">
                    <div className="font-extrabold text-slate-300 border-b border-white/5 pb-1 flex justify-between">
                      <span>সেন্ড মানি গাইড (Send Money)</span>
                      <span className="text-primary-400 font-bold">৳ ২৫০</span>
                    </div>
                    <p>১. ওয়ালেট অ্যাপ থেকে <strong className="text-slate-200">Send Money</strong> অপশনটি বেছে নিন।</p>
                    <p>
                      ২. পেমেন্ট করুন এই নম্বরে: <strong className="text-primary-300 select-all font-mono">
                        {paymentGateway === 'bkash' ? '01712-XXXXXX' : '01912-XXXXXX'}
                      </strong>
                    </p>
                    <p>৩. সফল পেমেন্ট শেষে প্রাপ্ত TxID কোড নিচে সাবমিট করুন।</p>
                  </div>

                  {/* Payment Verification Form */}
                  <form onSubmit={handleInlineSubmit} className="flex flex-col gap-3.5 bg-transparent p-0 border-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500">আপনার মোবাইল নম্বর</label>
                        <input 
                          type="tel"
                          required
                          placeholder="উদা. ০১৭XXXXXXXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium focus:border-cyan-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500">ট্রানজেকশন আইডি (TxID)</label>
                        <input 
                          type="text"
                          required
                          placeholder="উদা. 8A4B6C8D9E"
                          value={txId}
                          onChange={(e) => setTxId(e.target.value)}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase font-black tracking-wider focus:border-cyan-500"
                        />
                      </div>

                    </div>

                    {submitError && (
                      <div className="text-[11px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 bg-gradient-to-r text-white font-black text-xs rounded-xl transition duration-200 shadow flex items-center justify-center gap-1.5 ${
                        paymentGateway === 'bkash'
                          ? 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700'
                          : 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          যাচাই করা হচ্ছে...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                          আনলক করুন (Unlock Guide)
                        </>
                      )}
                    </button>

                  </form>
                </div>
              )}

            </div>

          </div>
        )}
      </div>

      {/* 📖 Glassmorphic Selection Dictionary definition Tooltip overlay */}
      {dictionaryPosition && selectedWord && (
        <div 
          style={{
            position: 'fixed',
            left: `${dictionaryPosition.x}px`,
            top: `${dictionaryPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
          className="bg-dark-900/95 border border-lavender/35 p-4.5 rounded-2xl shadow-2xl z-[1000] w-64 text-left leading-relaxed text-xs text-slate-200 backdrop-blur-2xl animate-fade-in pointer-events-auto"
        >
          <div className="flex flex-col gap-1.5 font-sans">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">গ্রন্থী শব্দার্থ অভিধান</span>
              <button 
                onClick={() => setSelectedWord('')}
                className="text-slate-400 hover:text-white text-[10px]"
              >
                ✕
              </button>
            </div>
            <strong className="text-white text-sm font-serif select-none">"{selectedWord}"</strong>
            <p className="text-slate-300 text-[11px] leading-relaxed select-all">
              {getBengaliDefinition(selectedWord)}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

interface PDFPageProps {
  bookId: string;
  pageNum: number;
  userEmail?: string;
  isNightMode: boolean;
  scaleMultiplier: number;
}

function PDFPage({ bookId, pageNum, userEmail, isNightMode, scaleMultiplier }: PDFPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function renderPage() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(`/api/books/${bookId}/preview?page=${pageNum}`, {
          headers: userEmail ? { 'x-user-email': userEmail } : {},
        });

        if (!response.ok) {
          throw new Error('Failed to load page buffer');
        }

        const arrayBuffer = await response.arrayBuffer();
        if (!active) return;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = '100%';
        canvas.style.maxWidth = `${800 * scaleMultiplier}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error('Error rendering PDF page canvas:', err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    }

    renderPage();

    return () => {
      active = false;
    };
  }, [bookId, pageNum, userEmail, scaleMultiplier, retryKey]);

  return (
    <div 
      data-page={pageNum} 
      className="pdf-page-wrapper w-full max-w-[800px] flex flex-col items-center bg-dark-900 border border-white/5 shadow-2xl rounded-xl overflow-hidden relative min-h-[500px]"
      style={{ maxWidth: `${800 * scaleMultiplier}px` }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">পৃষ্ঠা {pageNum} তৈরি হচ্ছে...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900 text-slate-400 p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-rose-500 mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-sm font-semibold text-slate-300">পৃষ্ঠা রেন্ডার করা যায়নি</p>
          <p className="text-xs text-slate-500 mt-1">অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করে পেজ রিফ্রেশ করুন।</p>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        className={`bg-white block select-none pointer-events-none transition-all duration-300 ${
          isNightMode ? 'invert hue-rotate-180 bg-slate-900' : 'bg-white'
        }`} 
      />
      
      {/* 🌊 Copyright Copyright-Protection Layer: Dynamic Diagonal Licensed Watermarking */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none z-10 opacity-[0.06] rotate-[-30deg] text-slate-400 font-mono text-[9px] md:text-xs tracking-[0.25em] uppercase whitespace-nowrap">
        Licensed to: {userEmail || 'Gronthi Reader'} - {new Date().toLocaleDateString()}
      </div>

      <div className="w-full bg-dark-950/60 py-2 border-t border-white/5 flex items-center justify-between px-6 text-xs text-slate-500">
        <span>পৃষ্ঠা {pageNum}</span>
        <span className="font-semibold select-none">সুরক্ষিত প্রিভিউ রিডার</span>
      </div>
    </div>
  );
}
