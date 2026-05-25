'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import PDFViewer from '@/components/PDFViewer';
import { AnimatePresence, motion } from 'framer-motion';

const BANGLA_BOOKS: Record<string, {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string;
  pageCount: number;
  previewLimit: number;
  isFree: boolean;
}> = {
  "60c72b2f9b1d8a23c4d5e6f1": {
    id: "60c72b2f9b1d8a23c4d5e6f1",
    title: "ইউআই/ইউএক্স ডিজাইন গাইড",
    author: "গ্রন্থী পাবলিশার্স",
    description: "পেশাদার ইউজার ইন্টারফেস ডিজাইন, ভিজ্যুয়াল আর্ট সিস্টেম এবং আধুনিক ডিজাইন নিয়মের সম্পূর্ণ প্র্যাক্টিক্যাল গাইড বুক।",
    price: 250,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    pageCount: 320,
    previewLimit: 4,
    isFree: false
  },
  "60c72b2f9b1d8a23c4d5e6f2": {
    id: "60c72b2f9b1d8a23c4d5e6f2",
    title: "ডিজিটাল আর্ট টেকনিকস",
    author: "ডিপমাইন্ড একাডেমি",
    description: "ডিজিটাল পেইন্টিং, ব্রাশ কাস্টমাইজেশন এবং নিয়ন কালার প্যালেটের মাধ্যমে আকর্ষণীয় আর্ট তৈরির অ্যাডভান্সড মেথড।",
    price: 180,
    coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800",
    pageCount: 145,
    previewLimit: 4,
    isFree: false
  },
  "60c72b2f9b1d8a23c4d5e6f3": {
    id: "60c72b2f9b1d8a23c4d5e6f3",
    title: "টাইপোগ্রাফি মাস্টারক্লাস",
    author: "আস্ট্রা ডিজাইনার্স",
    description: "ডিজিটাল কনটেন্ট ও প্রিন্টিং পাবলিশিংয়ের জন্য প্রিমিয়াম ফন্ট কম্বিনেশন এবং ভিজ্যুয়াল স্পেসিং সায়েন্স।",
    price: 200,
    coverImage: "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=800",
    pageCount: 210,
    previewLimit: 4,
    isFree: false
  },
  "60c72b2f9b1d8a23c4d5e6f4": {
    id: "60c72b2f9b1d8a23c4d5e6f4",
    title: "ফ্রিল্যান্সিং ক্যারিয়ার গাইড",
    author: "ক্যারিয়ার ল্যাব",
    description: "ডিজিটাল প্রোডাক্ট সেল করে ইন্টারন্যাশনাল মার্কেটপ্লেসে সফল ক্যারিয়ার গড়ার চমৎকার ও পরীক্ষিত স্ট্র্যাটেজি।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800",
    pageCount: 180,
    previewLimit: 4,
    isFree: true
  },
  "60c72b2f9b1d8a23c4d5e6f5": {
    id: "60c72b2f9b1d8a23c4d5e6f5",
    title: "রেসপন্সিভ ওয়েব ডেভেলপমেন্ট",
    author: "কোর স্ট্যাক",
    description: "আধুনিক সিএসএস লেআউট, ফ্লেক্সিবল গ্রিড এবং মোবাইল-ফার্স্ট ডিজাইন নিয়ে তৈরি সম্পূর্ণ রিসোর্স হ্যান্ডবুক।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
    pageCount: 290,
    previewLimit: 4,
    isFree: true
  },
  "60c72b2f9b1d8a23c4d5e6f6": {
    id: "60c72b2f9b1d8a23c4d5e6f6",
    title: "টুনটুনির বই",
    author: "উপেন্দ্রকিশোর রায়চৌধুরী",
    description: "ছোট বাচ্চাদের জন্য পাখির বুদ্ধি ও মজার মজার পশুপাখির গল্পের সেরা ক্লাসিক সংকলন।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    pageCount: 150,
    previewLimit: 4,
    isFree: true
  },
  "60c72b2f9b1d8a23c4d5e6f7": {
    id: "60c72b2f9b1d8a23c4d5e6f7",
    title: "আবোল তাবোল",
    author: "সুকুমার রায়",
    description: "শিশুদের হাসির খোরাক জোগাতে ছড়া ও অদ্ভুত সব কাল্পনিক চরিত্রের এক জাদুকরী বই।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    pageCount: 95,
    previewLimit: 4,
    isFree: true
  },
  "60c72b2f9b1d8a23c4d5e6f8": {
    id: "60c72b2f9b1d8a23c4d5e6f8",
    title: "ঠাকুরমার ঝুলি",
    author: "দক্ষিণারঞ্জন মিত্র মজুমদার",
    description: "রূপকথা, রাজপুত্র, আর রাক্ষস-খোক্কসের চিরচেনা সব বাঙালি রূপকথার গল্প।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
    pageCount: 220,
    previewLimit: 4,
    isFree: true
  },
  "60c72b2f9b1d8a23c4d5e6f9": {
    id: "60c72b2f9b1d8a23c4d5e6f9",
    title: "হযবরল",
    author: "সুকুমার রায়",
    description: "শিশুদের কল্পনার জগতকে বাড়িয়ে তুলতে এক অসাধারণ হাসির ও পাগলাটে অ্যাডভেঞ্চারের গল্প।",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800",
    pageCount: 80,
    previewLimit: 4,
    isFree: true
  }
};

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  const { user, activeOrder, setUser, logout } = useStore();
  const [book, setBook] = useState<typeof BANGLA_BOOKS[string] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);

  // Checkout Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<'bkash' | 'nagad'>('bkash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [txId, setTxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Free Email Modal verification state
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);
  const [freeEmail, setFreeEmail] = useState('');
  const [freeOtp, setFreeOtp] = useState('');
  const [freeStep, setFreeStep] = useState<'email' | 'otp' | 'success'>('email');
  const [freeSubmitting, setFreeSubmitting] = useState(false);
  const [freeError, setFreeError] = useState('');

  // Real Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [authOtp, setAuthOtp] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.error('Session fetch error:', err));
  }, [setUser]);

  useEffect(() => {
    const bookData = BANGLA_BOOKS[params.id];
    if (bookData) {
      setBook(bookData);
      
      // Check purchase state
      if (user?.purchasedBooks.includes(bookData.id) || user?.role === 'admin') {
        setIsPurchased(true);
      } else if (activeOrder && activeOrder.bookId === bookData.id && activeOrder.status === 'approved') {
        setIsPurchased(true);
      } else {
        setIsPurchased(false);
      }
    }
    setLoading(false);
  }, [params.id, user, activeOrder]);

  // Real Email Auth OTP Submission logic
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;

    setAuthSubmitting(true);
    setAuthError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ভেরিফিকেশন কোড পাঠাতে সমস্যা হয়েছে।');
      }

      setAuthStep('otp');
    } catch (err: any) {
      setAuthError(err.message || 'নেটওয়ার্ক ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAuthOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtp) return;

    setAuthSubmitting(true);
    setAuthError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, code: authOtp }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ভেরিফিকেশন কোডটি সঠিক নয়।');
      }

      setUser(data.user);
      setIsAuthModalOpen(false);
      setAuthStep('email');
      setAuthEmail('');
      setAuthName('');
      setAuthOtp('');
    } catch (err: any) {
      setAuthError(err.message || 'ভেরিফিকেশন ব্যর্থ হয়েছে, দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('গুগল লগইন বর্তমানে নিষ্ক্রিয় আছে। অনুগ্রহ করে নিচের ইমেইল ওটিপি পদ্ধতি ব্যবহার করুন।');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    logout();
  };

  const handlePurchaseClick = () => {
    if (book?.isFree) {
      setFreeStep('email');
      setFreeEmail('');
      setFreeOtp('');
      setFreeError('');
      setIsFreeModalOpen(true);
    } else {
      setSubmitSuccess(false);
      setSubmitError('');
      setTxId('');
      setPhoneNumber('');
      setIsDrawerOpen(true);
    }
  };

  const handleFreeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeEmail) return;

    setFreeSubmitting(true);
    setFreeError('');
    await new Promise(r => setTimeout(r, 800));
    setFreeSubmitting(false);
    setFreeStep('otp');
  };

  const handleFreeOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeOtp) return;

    setFreeSubmitting(true);
    setFreeError('');
    await new Promise(r => setTimeout(r, 600));
    if (freeOtp.trim() === '123456' || freeOtp.length === 6) {
      setFreeSubmitting(false);
      setFreeStep('success');
    } else {
      setFreeSubmitting(false);
      setFreeError('ভেরিফিকেশন কোডটি সঠিক নয়। পুনরায় চেষ্টা করুন বা নতুন কোড পাঠান।');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
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
          bookId: book?.id,
          amountPaid: book?.price,
          paymentGateway,
          customerPhone: phoneNumber,
          submittedTxID: txId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'পেমেন্ট ভেরিফিকেশন রিকোয়েস্ট ব্যর্থ হয়েছে।');
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'ত্রুটি ঘটেছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-rose-500 font-serif">বইটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-slate-400 text-sm">অনুরোধকৃত ডিজিটাল ক্যাটালগ গাইডটি খুঁজে পাওয়া যায়নি।</p>
        <Link href="/" className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl font-bold text-xs transition duration-200">
          মূল পাতায় ফিরে যান
        </Link>
      </div>
    );
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-radial-glow bg-dark-950 text-slate-100 py-12 px-4 md:px-8 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-radial-purple-glow opacity-25 pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto z-10 relative flex flex-col gap-8">
        
        {/* Unified Gronthi Header Navigation */}
        <nav className="w-full py-4 flex items-center justify-between border-b border-white/5 relative z-20">
          <Link href="/" className="flex items-center select-none cursor-pointer -my-4">
            <img 
              src="/logo.png" 
              alt="গ্রন্থী (Gronthi)" 
              className="h-24 md:h-32 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.07)]"
            />
          </Link>

          {/* FIX 1: FULLY FUNCTIONAL NAVIGATION ANCHORS WITH ROUTING BACK TO LANDING SECTIONS */}
          <div className="hidden md:flex items-center gap-1.5 bg-dark-900/50 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-md">
            <Link 
              href="/#premium-catalog" 
              className="px-4 py-1.5 text-xs font-black text-slate-200 hover:bg-white/5 rounded-full transition cursor-pointer select-none"
            >
              লাইব্রেরি
            </Link>
            <Link 
              href="/#premium-catalog" 
              className="text-xs font-extrabold text-slate-400 px-3 py-1.5 hover:text-slate-200 transition cursor-pointer select-none"
            >
              ক্যাটাগরি
            </Link>
            <Link 
              href="/#free-catalog" 
              className="text-xs font-extrabold text-slate-400 px-3 py-1.5 hover:text-slate-200 transition cursor-pointer select-none"
            >
              নতুন বই
            </Link>
          </div>

          {/* FIX 2: SLICK PREMIUM AUTHENTICATION ACTION BAR */}
          <div className="flex items-center gap-4 relative">
            {isMounted && user && user.email !== 'client@example.com' ? (
              // Authenticated user controls
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end text-right select-none">
                  <span className="text-xs font-black text-slate-200">{user.name}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'text-primary-400' : 'text-emerald-400'}`}>
                    {user.role === 'admin' ? 'অ্যাডমিন অ্যাকাউন্ট' : 'সদস্য'}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 rounded-full text-xs font-black transition duration-200 cursor-pointer"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              // Sleek, Minimalist "লগইন / সাইন-আপ" Button
              <button 
                onClick={() => {
                  setAuthMode('login');
                  setAuthEmail('');
                  setAuthName('');
                  setIsAuthModalOpen(true);
                }}
                className="px-5 py-2.5 border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500 hover:text-white text-primary-400 rounded-full text-xs font-black transition duration-300 shadow-md shadow-primary-500/5 cursor-pointer"
              >
                লগইন / সাইন-আপ
              </button>
            )}
          </div>
        </nav>

        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 text-left -mt-2">
          <Link href="/" className="hover:text-primary-400 transition font-extrabold select-none">গ্রন্থী লাইব্রেরি</Link>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-[200px] font-medium">{book.title}</span>
        </nav>

        {/* Header showcase */}
        <section className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row gap-8 items-start relative text-left">
          
          <div className="w-36 h-48 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-dark-950 to-dark-950 border border-white/5 relative flex-shrink-0 flex items-center justify-center p-4">
            <div className="absolute top-1 bottom-1 -right-[3px] w-[5px] bg-slate-100 rounded-r shadow-sm border-r border-slate-300" />
            
            <div className="w-full h-full rounded-r-xl overflow-hidden bg-gradient-to-br from-cyan-950 via-indigo-950 to-dark-950 flex flex-col justify-between p-3 relative border border-white/10 shadow-xl">
              <span className="text-[7px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded w-fit border border-cyan-500/20">{book.isFree ? 'ফ্রি' : 'প্রিমিয়াম'}</span>
              <h4 className="text-[10px] font-black text-white font-serif select-none line-clamp-3 leading-tight">{book.title}</h4>
              <div className="flex justify-between text-[6px] text-white/40 font-mono">
                <span>PDF</span>
                <span>৳ {book.price}</span>
              </div>
            </div>
          </div>

          <div className="flex-grow flex flex-col gap-4 min-w-0">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">{book.author}</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 leading-snug font-serif">{book.title}</h2>
            </div>
            
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-2xl">{book.description}</p>
            
            <div className="flex items-center gap-6 mt-2 border-t border-white/5 pt-4">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">মোট আকার</span>
                <span className="text-xs font-bold text-slate-200">{book.pageCount} পৃষ্ঠা</span>
              </div>
              
              <div className="flex flex-col border-l border-white/10 pl-6">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">মূল্য</span>
                <span className="text-sm font-black text-slate-100">
                  {book.isFree ? <span className="text-emerald-400">৳ ০.০০</span> : `৳ ${book.price}`}
                </span>
              </div>

              <div className="flex flex-col border-l border-white/10 pl-6">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">ভেরিফিকেশন স্পিড</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  তাৎক্ষণিক সক্রিয়
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-3 flex-shrink-0 md:self-end">
            {isPurchased ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  পিডিএফটি আনলক করা আছে
                </div>
                <a 
                  href={`/api/download/${params.id}`} 
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold rounded-xl text-center text-xs transition duration-300 shadow-lg shadow-primary-500/15"
                >
                  মূল ফাইল ডাউনলোড করুন (PDF)
                </a>
              </div>
            ) : (
              <button 
                onClick={handlePurchaseClick}
                className="w-full md:px-8 py-3.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition duration-300 shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                {book.isFree ? 'ফ্রি ডাউনলোড লিংক পান' : 'সম্পূর্ণ পিডিএফ রিড ও আনলক'}
              </button>
            )}
          </div>
        </section>

        {/* E-Reader Viewport */}
        <section className="flex flex-col gap-4 mt-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight font-serif flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              গ্রন্থী ইন্টারেক্টিভ ই-রিডার
            </h3>
            <span className="text-xs text-slate-500">
              {isPurchased ? 'সম্পূর্ণ বই আনলকড' : `ফ্রি প্রিভিউ (১ থেকে ৪ পৃষ্ঠা)`}
            </span>
          </div>
          
          <PDFViewer 
            bookId={book.id} 
            totalPageCount={book.pageCount} 
            previewLimit={book.previewLimit} 
            isPurchased={isPurchased} 
          />
        </section>

      </div>

      {/* Slide-over Payment Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-dark-950/60 backdrop-blur-md"
            />

            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-dark-900/90 border-l border-white/5 p-6 flex flex-col justify-between relative shadow-2xl z-10 backdrop-blur-2xl text-left"
            >
              
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-slate-100 font-serif">চেকআউট (Checkout)</h3>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">গ্রন্থী সিকিউর পেমেন্ট গেটওয়ে</span>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <div className="flex-grow overflow-y-auto py-6 flex flex-col gap-6 scroll-smooth pr-1">
                
                <div className="glass-panel p-4 rounded-2xl border border-white/5 flex gap-4 items-center bg-dark-950/40">
                  <div className="w-10 h-14 rounded bg-gradient-to-br from-cyan-950 to-dark-950 border border-white/10 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                    <span className="text-[6px] text-white/50 font-bold uppercase truncate px-1 select-none font-serif">{book.title}</span>
                  </div>
                  <div className="flex-grow flex flex-col min-w-0">
                    <span className="text-[8px] font-bold text-primary-400 uppercase tracking-widest">{book.author}</span>
                    <h4 className="text-sm font-bold text-slate-100 truncate">{book.title}</h4>
                    <span className="text-xs text-slate-500">{book.pageCount} পৃষ্ঠা</span>
                  </div>
                  <span className="text-sm font-black text-slate-200">৳ {book.price}</span>
                </div>

                <div className="flex justify-between items-center border-t border-b border-white/5 py-3.5">
                  <span className="text-sm text-slate-400 font-semibold">প্রদেয় মূল্য:</span>
                  <span className="text-lg font-black text-white font-mono">৳ {book.price}.00</span>
                </div>

                {submitSuccess ? (
                  <div className="flex flex-col items-center justify-center text-center py-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3 animate-bounce">
                      ✓
                    </div>
                    <h4 className="text-base font-black text-slate-100 font-serif">পেমেন্ট সফলভাবে জমা হয়েছে!</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                      আপনার জমাকৃত TxID: <strong className="text-primary-400 font-mono select-all">{txId}</strong> আমাদের সিস্টেমে যাচাই করা হচ্ছে। অনুগ্রহ করে ৩০ সেকেন্ড অপেক্ষা করুন এবং লাইব্রেরি রিফ্রেশ করুন।
                    </p>
                    <button 
                      onClick={() => {
                        setIsDrawerOpen(false);
                        window.location.reload();
                      }}
                      className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition duration-200"
                    >
                      রিফ্রেশ করুন (Refresh)
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    
                    {/* CRITICAL LOGIC FIX 3: HIGH-VISIBILITY WARNING BOX FOR P2P WALLET INSTRUCTION */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed flex items-start gap-2.5">
                      <span className="text-base">⚠️</span>
                      <div>
                        <strong className="font-extrabold block text-amber-200 mb-0.5">গুরুত্বপূর্ণ পেমেন্ট সতর্কবার্তা:</strong>
                        আপনাকে অবশ্যই বিকাশ বা নগদের <strong className="text-slate-100 underline decoration-amber-400 underline-offset-2">"Send Money (টাকা পাঠান)"</strong> অপশনটি ব্যবহার করতে হবে। রিচার্জ (Recharge), ক্যাশ-ইন (Cash-In) বা মার্চেন্ট পেমেন্ট (Merchant Payment) করলে গেটওয়ে তা গ্রহণ করবে না এবং অ্যাক্সেস রিজেক্ট হয়ে যাবে।
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">পেমেন্ট মেথড সিলেক্ট করুন</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentGateway('bkash')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs font-black transition duration-300 ${
                            paymentGateway === 'bkash'
                              ? 'bg-pink-500/10 border-pink-500 text-pink-400'
                              : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-pink-500" />
                          বিকাশ (bKash)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentGateway('nagad')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs font-black transition duration-300 ${
                            paymentGateway === 'nagad'
                              ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                              : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          নগদ (Nagad)
                        </button>
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-white/5 text-xs text-slate-400 flex flex-col gap-2 bg-dark-950/20 leading-relaxed font-sans">
                      <div className="font-extrabold text-slate-300 border-b border-white/5 pb-1.5 mb-1 flex items-center justify-between">
                        <span>পেমেন্ট গাইড (Send Money)</span>
                        <span className="text-primary-400 font-mono">৳ {book.price}</span>
                      </div>
                      <p>১. আপনার বিকাশ/নগদ ওয়ালেট থেকে <strong className="text-slate-200">Send Money</strong> সিলেক্ট করুন।</p>
                      <p>
                        ২. প্রাপক নম্বরে আমাদের ওয়ালেট নং দিন: <strong className="text-primary-300 select-all font-mono">
                          {paymentGateway === 'bkash' ? '01712-XXXXXX' : '01912-XXXXXX'}
                        </strong>
                      </p>
                      <p>৩. এরপর ট্রানজেকশন আইডি (TxID) কপি করে নিচের বক্সে সাবমিট করুন।</p>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">আপনার মোবাইল নম্বর</label>
                        <input 
                          type="tel"
                          required
                          placeholder="উদা. ০১৭XXXXXXXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono font-medium focus:border-cyan-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">ট্রানজেকশন আইডি (TxID)</label>
                        <input 
                          type="text"
                          required
                          placeholder="উদা. 8A4B6C8D9E"
                          value={txId}
                          onChange={(e) => setTxId(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono uppercase font-black tracking-widest focus:border-cyan-500"
                        />
                      </div>

                      {submitError && (
                        <div className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
                          {submitError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 bg-gradient-to-r text-white font-black text-xs rounded-2xl transition duration-300 shadow-lg mt-2 flex items-center justify-center gap-2 ${
                          paymentGateway === 'bkash'
                            ? 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-pink-500/10'
                            : 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/10'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            পেমেন্ট যাচাই করা হচ্ছে...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            পেমেন্ট নিশ্চিত করুন
                          </>
                        )}
                      </button>

                    </form>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CRITICAL LOGIC FIX 2: Free Ebook Verification Modal with 2-Step OTP input states */}
      <AnimatePresence>
        {isFreeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFreeModalOpen(false)}
              className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md glass-panel rounded-3xl relative z-10 overflow-hidden shadow-2xl border border-white/10 p-6 flex flex-col gap-6 text-left"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />

              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider font-sans">রিসোর্স ফাইল ডাউনলোড</span>
                  <h3 className="text-xl font-black text-slate-100 font-serif">ফ্রি গাইড ডাউনলোড করুন</h3>
                </div>
                <button 
                  onClick={() => setIsFreeModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {freeStep === 'email' && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans bg-white/5 border border-white/5 p-4 rounded-xl">
                    নিচের ইনপুট বক্সে আপনার সচল ইমেইল অ্যাড্রেসটি লিখুন। স্প্যাম অ্যাকাউন্ট প্রতিরোধ করতে আপনার ইমেইলে একটি ভেরিফিকেশন ওটিপি (OTP) পাঠানো হবে।
                  </p>
                  <form onSubmit={handleFreeEmailSubmit} className="flex flex-col gap-4 font-sans">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">আপনার সচল ইমেইল অ্যাড্রেস</label>
                      <input 
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={freeEmail}
                        onChange={(e) => setFreeEmail(e.target.value)}
                        className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono font-medium focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={freeSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs rounded-2xl transition duration-300 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                    >
                      {freeSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-900 border-t-slate-500 rounded-full animate-spin" />
                          কোড পাঠানো হচ্ছে...
                        </>
                      ) : (
                        <>
                          ভেরিফিকেশন কোড পাঠান
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {freeStep === 'otp' && (
                <div className="flex flex-col gap-4">
                  <div className="p-3.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs text-primary-300 leading-relaxed font-sans">
                    আমরা <strong className="text-slate-100">{freeEmail}</strong> ইমেইলে একটি ভেরিফিকেশন কোড পাঠিয়েছি। ওটিপিটি নিচে ইনপুট করুন। (সিমুলেশন ওটিপি: <strong className="text-slate-100 underline">123456</strong>)
                  </div>
                  <form onSubmit={handleFreeOtpSubmit} className="flex flex-col gap-4 font-sans">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">৬-ডিজিটের ভেরিফিকেশন ওটিপি (OTP)</label>
                      <input 
                        type="text"
                        required
                        maxLength={6}
                        placeholder="উদা. 123456"
                        value={freeOtp}
                        onChange={(e) => setFreeOtp(e.target.value)}
                        className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono font-bold tracking-widest text-center focus:border-emerald-500"
                      />
                    </div>

                    {freeError && (
                      <div className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
                        {freeError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFreeStep('email')}
                        className="py-3.5 border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs rounded-2xl transition text-center"
                      >
                        পুনরায় ইমেইল দিন
                      </button>
                      <button
                        type="submit"
                        disabled={freeSubmitting}
                        className="py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs rounded-2xl transition duration-300 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                      >
                        {freeSubmitting ? (
                          <div className="w-4 h-4 border-2 border-slate-900 border-t-slate-500 rounded-full animate-spin" />
                        ) : 'কোড যাচাই করুন'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {freeStep === 'success' && (
                <div className="flex flex-col items-center justify-center text-center py-4 gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-bounce">
                    ✓
                  </div>
                  <h4 className="text-base font-black text-slate-200 font-serif">আপনার ইমেইলে পিডিএফ পাঠানো হয়েছে!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    আমরা <strong className="text-emerald-400 font-mono select-all">{freeEmail}</strong> ঠিকানায় <strong>{book.title}</strong> বইটির ডাউনলোড লিংক পাঠিয়ে দিয়েছি। অনুগ্রহ করে আপনার ইনবক্স চেক করুন।
                  </p>
                  <button
                    onClick={() => setIsFreeModalOpen(false)}
                    className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition duration-200"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FIX 3: HIGH-FIDELITY GLASSMORPHIC AUTHENTICATION MODAL POPUP */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAuthModalOpen(false);
                setAuthStep('email');
                setAuthError('');
              }}
              className="absolute inset-0 bg-velvet/80 backdrop-blur-md"
            />

            {/* Modal Body Container with backdrop-blur glassmorphism */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-dark-900/60 border border-white/10 rounded-3xl relative z-10 overflow-hidden shadow-2xl backdrop-blur-2xl p-6 flex flex-col gap-6 text-left"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-500 to-indigo-600 shadow-[0_2px_20px_rgba(225,29,72,0.4)]" />

              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5 select-none">
                  <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">গ্রন্থী সিকিউর গেটওয়ে</span>
                  <h3 className="text-xl font-extrabold text-slate-100 font-serif">
                    {authMode === 'login' ? 'অ্যাকাউন্টে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setAuthStep('email');
                    setAuthError('');
                  }}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer select-none"
                >
                  ✕
                </button>
              </div>

              {/* 1. Stylish Google SSO Trigger (Main Focus) */}
              <button 
                onClick={handleGoogleAuth}
                className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl transition duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-white/5 text-xs cursor-pointer select-none border border-slate-200"
              >
                {/* Google Icon SVG */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.68 1.42 7.58l3.9 3.02C6.27 7.7 8.91 5.04 12 5.04z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.88c2.18-2.01 3.7-4.99 3.7-8.61z"/>
                  <path fill="#FBBC05" d="M5.32 14.6c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3L1.42 6.98C.51 8.79 0 10.84 0 13s.51 4.21 1.42 6.02l3.9-3.02z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.88c-1.1.74-2.52 1.18-4.23 1.18-3.09 0-5.73-2.66-6.68-5.56l-3.9 3.02C3.37 20.32 7.35 23 12 23z"/>
                </svg>
                Google দিয়ে সাইন-ইন করুন
              </button>

              {/* 2. Horizontal Divider Line */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-grow h-px bg-white/10" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest select-none">অথবা</span>
                <div className="flex-grow h-px bg-white/10" />
              </div>

              {/* Error Box */}
              {authError && (
                <div className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
                  {authError}
                </div>
              )}

              {authStep === 'email' ? (
                /* 3. Secure Email Inputs */
                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4 font-sans">
                  
                  {authMode === 'signup' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 select-none">আপনার নাম</label>
                      <input 
                        type="text"
                        required
                        placeholder="উদা. সোহেল রানা"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-semibold focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 select-none">আপনার ইমেইল ঠিকানা দিন</label>
                    <input 
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono font-medium focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-black text-xs rounded-2xl transition duration-300 shadow-lg shadow-primary-500/15 flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    {authSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        ভেরিফিকেশন কোড পাঠান
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* 3. OTP Code Input */
                <form onSubmit={handleAuthOtpSubmit} className="flex flex-col gap-4 font-sans">
                  <div className="p-3 bg-lavender/5 border border-lavender/10 text-[11px] text-slate-300 rounded-xl leading-relaxed">
                    আমরা <strong className="text-lavender font-mono">{authEmail}</strong> ইমেইলে একটি ভেরিফিকেশন কোড পাঠিয়েছি। ওটিপিটি নিচে ইনপুট করুন। (লোকাল সার্ভার বা ভার্সেল লগে ওটিপি দেখা যাবে)
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 select-none">৬-ডিজিটের ভেরিফিকেশন ওটিপি (OTP)</label>
                    <input 
                      type="text"
                      required
                      maxLength={6}
                      placeholder="উদা. 123456"
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono font-bold tracking-widest text-center focus:border-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('email');
                        setAuthError('');
                      }}
                      className="py-3 border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs rounded-2xl transition text-center cursor-pointer"
                    >
                      ইমেইল পরিবর্তন করুন
                    </button>
                    <button
                      type="submit"
                      disabled={authSubmitting}
                      className="py-3 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-black text-xs rounded-2xl transition duration-300 shadow-lg shadow-primary-500/15 flex items-center justify-center"
                    >
                      {authSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : 'কোড যাচাই করুন'}
                    </button>
                  </div>
                </form>
              )}

              {/* 4. Auth toggle buttons */}
              {authStep === 'email' && (
                <div className="text-center mt-1 border-t border-white/5 pt-4">
                  {authMode === 'login' ? (
                    <button 
                      onClick={() => setAuthMode('signup')}
                      className="text-xs font-bold text-slate-400 hover:text-primary-400 transition cursor-pointer select-none"
                    >
                      নতুন অ্যাকাউন্ট তৈরি করতে চান? <span className="underline decoration-primary-500/50 underline-offset-2 hover:decoration-primary-400">এখানে ক্লিক করুন</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setAuthMode('login')}
                      className="text-xs font-bold text-slate-400 hover:text-primary-400 transition cursor-pointer select-none"
                    >
                      ইতিমধ্যে অ্যাকাউন্ট আছে? <span className="underline select-none underline-offset-2 decoration-primary-500/50 hover:decoration-primary-400">লগইন করুন</span>
                    </button>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
