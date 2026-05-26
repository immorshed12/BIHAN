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

    window.speechSynthesis.cancel();

    // Fetch dynamic elements text details
    const bookTitle = document.querySelector('h2')?.textContent || 'ডিজিটাল বুক গাইড';
    const bookAuthor = document.querySelector('span.text-amber-600')?.textContent || 'বিহান প্রকাশনী';
    const bookDesc = document.querySelector('p.text-slate-600')?.textContent || '';

    const spokenIntroText = `বিহান আর্টিফিশিয়াল ইন্টেলিজেন্স বাংলা অডিওবুক রিডারে আপনাকে স্বাগতম। আপনি এখন শুনছেন ${bookAuthor} এর অসাধারণ জনপ্রিয় বই, ${bookTitle}। বইটির ভূমিকা ও সারসংক্ষেপ নিম্নরূপ: ${bookDesc}`;

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

  // Capture Bengali selected word for definition tooltip
  const handleTextSelection = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString().trim();
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
    if (term.includes('গ্রন্থী') || term.includes('বিহান')) {
      return "বিহান (BIHAN) - আমাদের ডিজিটাল রিডিং প্ল্যাটফর্ম ও লাইব্রেরি লাউঞ্জ।";
    }
    if (term.includes('ঠাকুরমার')) {
      return "দাদী বা পিতামহী - রূপকথার গল্পের পরিচিত চরিত্র।";
    }
    if (term.includes('ডিজিটাল')) {
      return "ডিজিটাল প্রযুক্তি - বাইনারি ডেটা সিস্টেম ও ইলেকট্রনিক্স ভিত্তিক মাধ্যম।";
    }
    return `"${word}" - বিহান অভিধান: শব্দার্থের আলোকপাত ও সাহিত্য প্রসঙ্গ সন্ধান।`;
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
          'x-user-email': user?.email || 'customer@bihan.com',
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
      
      {/* 🚀 Ultimate E-Reader Toolbar (Light-theme premium glassmorphism controls) */}
      <div className="w-full bg-white border border-slate-200 shadow-md px-4 md:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-4 z-20 select-none">
        
        {/* Left Side: Page counter & Bookmarks tracker */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-slate-700 font-mono font-bold">
              পৃষ্ঠা {currentViewPage} / {totalPageCount}
            </span>
          </div>

          <button
            onClick={() => toggleBookmark(currentViewPage)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              bookmarks.includes(currentViewPage)
                ? 'bg-amber-50 border-amber-200 text-amber-600 font-bold shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>{bookmarks.includes(currentViewPage) ? '★ বুকমার্কড' : '☆ বুকমার্ক'}</span>
          </button>
        </div>

        {/* Center: AI Bengali Audiobook Synthesizer Controls */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-inner">
          <span className="text-[10px] text-slate-500 font-black uppercase px-2 select-none">অডিওবুক</span>
          <button
            onClick={handlePlayTTS}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer font-bold ${
              isTtsPlaying && !isTtsPaused
                ? 'bg-amber-500 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="প্লে অডিওবুক"
          >
            ▶
          </button>
          {isTtsPlaying && (
            <>
              <button
                onClick={handlePauseTTS}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer font-bold ${
                  isTtsPaused ? 'bg-amber-400 text-slate-900 shadow' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title="পজ অডিওবুক"
              >
                ⏸
              </button>
              <button
                onClick={handleStopTTS}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-750 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition cursor-pointer font-bold"
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
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setScale(prev => Math.max(0.8, prev - 0.1))}
              className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black rounded-lg transition shadow-sm cursor-pointer"
              title="জুম আউট"
            >
              －
            </button>
            <span className="text-[10px] font-mono text-slate-600 px-1 font-bold">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(prev => Math.min(1.4, prev + 0.1))}
              className="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black rounded-lg transition shadow-sm cursor-pointer"
              title="জুম ইন"
            >
              ＋
            </button>
          </div>

          {/* Night Mode Switcher */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition border cursor-pointer ${
              isNightMode
                ? 'bg-amber-50 border-amber-500 text-amber-600 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-650 hover:text-slate-800 hover:bg-slate-100'
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
        className="w-full h-[80vh] overflow-y-auto bg-slate-100 border border-slate-200 rounded-3xl p-4 md:p-8 flex flex-col items-center gap-8 scroll-smooth relative shadow-inner shadow-slate-200/50"
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

        {/* Scribd-style paywall overlay */}
        {!isPurchased && (
          <div className="w-full max-w-[800px] rounded-2xl border border-slate-200 overflow-hidden relative min-h-[480px] bg-white/70 flex flex-col items-center justify-center p-6 md:p-12 text-center backdrop-blur-xl shadow-lg shadow-slate-100">
            
            {/* Blurry document visual simulation sheet in background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 to-slate-100/90 pointer-events-none z-0" />
            <div className="absolute top-10 left-[50%] -translate-x-[50%] w-[90%] h-[350px] bg-slate-900 opacity-[0.03] blur-[4px] rounded border border-slate-200/30 flex flex-col gap-4 p-8 z-0">
              <div className="h-6 bg-slate-900/20 w-3/4 rounded" />
              <div className="h-4 bg-slate-900/10 w-full rounded" />
              <div className="h-4 bg-slate-900/10 w-full rounded" />
              <div className="h-4 bg-slate-900/10 w-5/6 rounded" />
              <div className="h-4 bg-slate-900/10 w-2/3 rounded" />
            </div>

            {/* Paywall content card overlay */}
            <div className="relative z-10 w-full max-w-lg bg-white border border-slate-200 shadow-2xl p-6 md:p-8 rounded-3xl flex flex-col gap-6">
              
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-amber-655 uppercase tracking-widest text-amber-600">রিডার পে-ওয়াল লক</span>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 font-serif">বাকি অংশ পড়তে বইটি আনলক করুন</h3>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  বিকাশ বা নগদে সরাসরি সেন্ড মানি করুন। পেমেন্ট পাওয়ার কয়েক সেকেন্ডের মধ্যে পুরো বইটি আনলক হয়ে যাবে।
                </p>
              </div>

              {submitSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-4 gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center animate-bounce">
                    ✓
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">TxID সফলভাবে রেজিস্টার্ড হয়েছে!</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    আপনার ট্রানজেকশন কোড <strong className="text-amber-600 font-mono select-all font-bold">{txId}</strong> যাচাই করা হচ্ছে। অনুগ্রহ করে লাইব্রেরি ড্যাশবোর্ড রিফ্রেশ করুন।
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition duration-200 mt-2 shadow-sm cursor-pointer"
                  >
                    রিফ্রেশ করুন (Refresh Viewer)
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-5 text-left">
                  
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed flex items-start gap-2.5 shadow-sm">
                    <span className="text-base select-none">⚠️</span>
                    <div className="font-sans">
                      <strong className="font-extrabold block text-amber-700 mb-0.5">গুরুত্বপূর্ণ পেমেন্ট সতর্কবার্তা:</strong>
                      আপনাকে অবশ্যই বিকাশ বা নগদের <strong className="text-slate-900 underline decoration-amber-500 underline-offset-2 font-bold">"Send Money (টাকা পাঠান)"</strong> অপশনটি ব্যবহার করতে হবে। রিচার্জ, ক্যাশ-ইন বা মার্চেন্ট পেমেন্ট প্রসেসড হবে না।
                    </div>
                  </div>

                  {/* bKash/Nagad toggle buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('bkash')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-black transition duration-200 cursor-pointer ${
                        paymentGateway === 'bkash'
                          ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-sm font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-550 hover:bg-slate-100 font-semibold'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      বিকাশ ওয়ালেট
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('nagad')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-black transition duration-200 cursor-pointer ${
                        paymentGateway === 'nagad'
                          ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-550 hover:bg-slate-100 font-semibold'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      নগদ ওয়ালেট
                    </button>
                  </div>

                  {/* Payment numbers guidelines */}
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-[11px] text-slate-600 flex flex-col gap-1.5 leading-relaxed font-sans shadow-inner shadow-slate-100">
                    <div className="font-extrabold text-slate-700 border-b border-slate-200 pb-1 flex justify-between">
                      <span>সেন্ড মানি গাইড (Send Money)</span>
                      <span className="text-amber-600 font-bold">৳ {bookPrice}</span>
                    </div>
                    <p>১. ওয়ালেট অ্যাপ থেকে <strong className="text-slate-800 font-bold">Send Money</strong> অপশনটি বেছে নিন।</p>
                    <p>
                      ২. পেমেন্ট করুন এই নম্বরে: <strong className="text-amber-600 select-all font-mono font-bold text-xs">
                        01832984186
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
                          className="w-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium focus:border-amber-500 focus:outline-none text-slate-800 placeholder-slate-450"
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
                          className="w-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase font-black tracking-wider focus:border-amber-500 focus:outline-none text-slate-800 placeholder-slate-450"
                        />
                      </div>

                    </div>

                    {submitError && (
                      <div className="text-[11px] text-rose-650 font-bold bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 text-white font-black text-xs rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                        paymentGateway === 'bkash'
                          ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/10'
                          : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/10'
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
          className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-2xl z-[1000] w-64 text-left leading-relaxed text-xs text-slate-700 animate-fade-in pointer-events-auto shadow-slate-300/40"
        >
          <div className="flex flex-col gap-1.5 font-sans">
            <div className="flex justify-between items-center border-b border-slate-100 pb-1">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">বিহান শব্দার্থ অভিধান</span>
              <button 
                onClick={() => setSelectedWord('')}
                className="text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <strong className="text-slate-900 text-sm font-serif select-none">"{selectedWord}"</strong>
            <p className="text-slate-650 text-[11px] leading-relaxed select-all">
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
      className="pdf-page-wrapper w-full max-w-[800px] flex flex-col items-center bg-white border border-slate-200 shadow-md rounded-xl overflow-hidden relative min-h-[500px]"
      style={{ maxWidth: `${800 * scaleMultiplier}px` }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/70 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-650">পৃষ্ঠা {pageNum} তৈরি হচ্ছে...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-rose-500 mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="text-sm font-semibold text-slate-700">পৃষ্ঠা রেন্ডার করা যায়নি</p>
          <p className="text-xs text-slate-500 mt-1">অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করে পেজ রিফ্রেশ করুন।</p>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        className={`bg-white block select-none pointer-events-none transition-all duration-300 ${
          isNightMode ? 'invert hue-rotate-180 bg-slate-900' : 'bg-white'
        }`} 
      />
      
      {/* 🌊 Copyright-Protection Layer: Dynamic Licensed Watermarking */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none z-10 opacity-[0.03] rotate-[-30deg] text-slate-800 font-mono text-[9px] md:text-xs tracking-[0.25em] uppercase whitespace-nowrap">
        Licensed to: {userEmail || 'Bihan Reader'} - {new Date().toLocaleDateString()}
      </div>

      <div className="w-full bg-slate-50 py-2.5 border-t border-slate-100 flex items-center justify-between px-6 text-xs text-slate-500">
        <span>পৃষ্ঠা {pageNum}</span>
        <span className="font-semibold select-none">সুরক্ষিত প্রিভিউ রিডার</span>
      </div>
    </div>
  );
}
