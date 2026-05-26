'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';

const BANGLA_BOOKS = [
  {
    id: "60c72b2f9b1d8a23c4d5e6f1",
    title: "ইউআই/ইউএক্স ডিজাইন গাইড",
    author: "গ্রন্থী পাবলিশার্স",
    description: "পেশাদার ইউজার ইন্টারফেস ডিজাইন, ভিজ্যুয়াল আর্ট সিস্টেম এবং আধুনিক ডিজাইন নিয়মের সম্পূর্ণ প্র্যাক্টিক্যাল গাইড বুক।",
    price: 250,
    rating: 4.9,
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    pageCount: 320,
    previewLimit: 4,
    isFree: false
  },
  {
    id: "60c72b2f9b1d8a23c4d5e6f2",
    title: "ডিজিটাল আর্ট টেকনিকস",
    author: "ডিপমাইন্ড একাডেমি",
    description: "ডিজিটাল পেইন্টিং, ব্রাশ কাস্টমাইজেশন এবং নিয়ন কালার প্যালেটের মাধ্যমে আকর্ষণীয় আর্ট তৈরির অ্যাডভান্সড মেথড।",
    price: 180,
    rating: 4.9,
    coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800",
    pageCount: 145,
    previewLimit: 4,
    isFree: false
  },
  {
    id: "60c72b2f9b1d8a23c4d5e6f3",
    title: "টাইপোগ্রাফি মাস্টারক্লাস",
    author: "আস্ট্রা ডিজাইনার্স",
    description: "ডিজিটাল কনটেন্ট ও প্রিন্টিং পাবলিশিংয়ের জন্য প্রিমিয়াম ফন্ট কম্বিনেশন এবং ভিজ্যুয়াল স্পেসিং সায়েন্স।",
    price: 200,
    rating: 4.8,
    coverImage: "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=800",
    pageCount: 210,
    previewLimit: 4,
    isFree: false
  },
  {
    id: "60c72b2f9b1d8a23c4d5e6f4",
    title: "ফ্রিল্যান্সিং ক্যারিয়ার গাইড",
    author: "ক্যারিয়ার ল্যাব",
    description: "ডিজিটাল প্রোডাক্ট সেল করে ইন্টারন্যাশনাল মার্কেটপ্লেসে সফল ক্যারিয়ার গড়ার চমৎকার ও পরীক্ষিত স্ট্র্যাটেজি।",
    price: 0,
    rating: 4.9,
    coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800",
    pageCount: 180,
    previewLimit: 4,
    isFree: true
  },
  {
    id: "60c72b2f9b1d8a23c4d5e6f5",
    title: "রেসপন্সিভ ওয়েব ডেভেলপমেন্ট",
    author: "কোর স্ট্যাক",
    description: "আধুনিক সিএসএস লেআউট, ফ্লেক্সিবল গ্রিড এবং মোবাইল-ফার্স্ট ডিজাইন নিয়ে তৈরি সম্পূর্ণ রিসোর্স হ্যান্ডবুক।",
    price: 0,
    rating: 4.9,
    coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
    pageCount: 290,
    previewLimit: 4,
    isFree: true
  },
  {
    id: "60c72b2f9b1d8a23c4d5e6f6",
    title: "টুনটুনির বই",
    author: "উপেন্দ্রকিশোর রায়চৌধুরী",
    description: "ছোট বাচ্চাদের জন্য পাখির বুদ্ধি ও মজার মজার পশুপাখির গল্পের সেরা ক্লাসিক সংকলন।",
    price: 0,
    rating: 4.9,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
    pageCount: 150,
    previewLimit: 4,
    isFree: true
  },
  {
    id: "60c72b2f9b1d8a23c4d5e6f7",
    title: "আবোল তাবোল",
    author: "সুকুমার রায়",
    description: "শিশুদের হাসির খোরাক জোগাতে ছড়া ও অদ্ভুত সব কাল্পনিক চরিত্রের এক জাদুকরী বই।",
    price: 0,
    rating: 4.9,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
    pageCount: 95,
    previewLimit: 4,
    isFree: true
  },
  {
    id: "60c72b2f9b1d8a23c4d5e6f8",
    title: "ঠাকুরমার ঝুলি",
    author: "দক্ষিণারঞ্জন মিত্র মজুমদার",
    description: "রূপকথা, রাজপুত্র, আর রাক্ষস-খোক্কসের চিরচেনা সব বাঙালি রূপকথার গল্প।",
    price: 0,
    rating: 4.9,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
    pageCount: 220,
    previewLimit: 4,
    isFree: true
  },
  {
    id: "60c72b2f9b1d8a23c4d5e6f9",
    title: "হযবরল",
    author: "সুকুমার রায়",
    description: "শিশুদের কল্পনার জগতকে বাড়িয়ে তুলতে এক অসাধারণ হাসির ও পাগলাটে অ্যাডভেঞ্চারের গল্প।",
    price: 0,
    rating: 4.8,
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800",
    pageCount: 80,
    previewLimit: 4,
    isFree: true
  }
];

export default function Home() {
  const { user, setUser, logout } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  
  // Dynamic Catalog State
  const [books, setBooks] = useState<any[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Dynamically extract unique categories from loaded books
  const getUniqueCategories = () => {
    const categoriesSet = new Set(books.map(b => b.category).filter(Boolean));
    return ['All', ...Array.from(categoriesSet)];
  };

  // Real Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const viewAsUser = searchParams?.get('view') === 'user';

    // Dynamically inject Google Identity Services script for dynamic Google login support
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

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

    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.books) {
          setBooks(data.books);
        }
      })
      .catch(err => console.error('Fetch books error:', err))
      .finally(() => setBooksLoading(false));
  }, [setUser]);

  // Checkout Drawer state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutBook, setCheckoutBook] = useState<any | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<'bkash' | 'nagad'>('bkash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [txId, setTxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Free Email Modal state
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);
  const [freeBook, setFreeBook] = useState<any | null>(null);
  const [freeEmail, setFreeEmail] = useState('');
  const [freeOtp, setFreeOtp] = useState('');
  const [freeStep, setFreeStep] = useState<'email' | 'otp' | 'success'>('email');
  const [freeSubmitting, setFreeSubmitting] = useState(false);
  const [freeError, setFreeError] = useState('');

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };



  const handleBookAction = (bookId: string) => {
    const targetBook = books.find(b => b._id === bookId || b.id === bookId);
    if (!targetBook) return;

    if (targetBook.isFree) {
      if (user && user.email && user.id !== 'guest_user') {
        window.location.href = `/book/${targetBook._id || targetBook.id}${isAdminPreview ? '?view=user' : ''}`;
      } else {
        setFreeBook(targetBook);
        setFreeStep('email');
        setFreeEmail('');
        setFreeOtp('');
        setFreeError('');
        setIsFreeModalOpen(true);
      }
    } else {
      setCheckoutBook(targetBook);
      setSubmitSuccess(false);
      setSubmitError('');
      setTxId('');
      setPhoneNumber('');
      setIsCheckoutOpen(true);
    }
  };

  // Real Email Auth OTP Submission logic
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [authOtp, setAuthOtp] = useState('');
  const [authError, setAuthError] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;

    setAuthSubmitting(true);
    setAuthError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, mode: authMode, name: authName }),
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error} (বিশদ: ${data.details})` : (data.error || 'ভেরিফিকেশন কোড পাঠাতে সমস্যা হয়েছে।');
        throw new Error(errorMsg);
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
        body: JSON.stringify({ email: authEmail, code: authOtp, name: authName }),
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error} (বিশদ: ${data.details})` : (data.error || 'ভেরিফিকেশন কোডটি সঠিক নয়।');
        throw new Error(errorMsg);
      }

      setUser(data.user);
      setIsAuthModalOpen(false);
      setAuthStep('email');
      setAuthEmail('');
      setAuthName('');
      setAuthOtp('');
      if (data.user.role === 'admin') {
        window.location.href = '/admin';
      }
    } catch (err: any) {
      setAuthError(err.message || 'ভেরিফিকেশন ব্যর্থ হয়েছে, দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.warn('[Google Auth Info] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured in your .env.local file. Google login is disabled.');
      setAuthError('গুগল লগইন বর্তমানে নিষ্ক্রিয় আছে। অনুগ্রহ করে নিচের ইমেইল ওটিপি পদ্ধতি ব্যবহার করুন।');
      return;
    }

    try {
      setAuthError('');
      setAuthSubmitting(true);

      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          try {
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: response.credential }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'গুগল ভেরিফিকেশন ব্যর্থ হয়েছে।');

            setUser(data.user);
            setIsAuthModalOpen(false);
            if (data.user.role === 'admin') {
              window.location.href = '/admin';
            } else {
              window.location.reload();
            }
          } catch (err: any) {
            setAuthError(err.message || 'গুগল লগইন ব্যর্থ হয়েছে।');
          } finally {
            setAuthSubmitting(false);
          }
        }
      });

      (window as any).google.accounts.id.prompt();
    } catch (err) {
      console.error('Google GIS prompt failed:', err);
      setAuthError('গুগল লগইন কনসোল লোড করা যায়নি। অনুগ্রহ করে নেটওয়ার্ক কানেকশন চেক করুন।');
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    logout();
  };

  // Step 1: Send Free PDF Verification Code
  const handleFreeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeEmail) return;

    setFreeSubmitting(true);
    setFreeError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: freeEmail }),
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error} (বিশদ: ${data.details})` : (data.error || 'ভেরিফিকেশন কোড পাঠাতে সমস্যা হয়েছে।');
        throw new Error(errorMsg);
      }

      setFreeStep('otp');
    } catch (err: any) {
      setFreeError(err.message || 'নেটওয়ার্ক ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setFreeSubmitting(false);
    }
  };

  // Step 2: Validate OTP & Unlock Free Guide
  const handleFreeOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeOtp) return;

    setFreeSubmitting(true);
    setFreeError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: freeEmail, code: freeOtp }),
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error} (বিশদ: ${data.details})` : (data.error || 'ভেরিফিকেশন কোডটি সঠিক নয়।');
        throw new Error(errorMsg);
      }

      setUser(data.user);
      setFreeStep('success');
    } catch (err: any) {
      setFreeError(err.message || 'ভেরিফিকেশন ব্যর্থ হয়েছে, দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setFreeSubmitting(false);
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
          bookId: checkoutBook?._id || checkoutBook?.id,
          amountPaid: checkoutBook?.price,
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
      setSubmitError(err.message || 'নেটওয়ার্ক ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <>
      {isAdminPreview && (
        <div className="w-full bg-gradient-to-r from-[#501c3e]/90 via-[#201140]/90 to-[#501c3e]/90 border-b border-lavender/30 text-slate-200 py-3 text-center text-xs font-sans font-bold flex items-center justify-center gap-3 backdrop-blur-md sticky top-0 z-[100] select-none shadow-lg">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lavender animate-pulse" />
            🛡️ <strong>এডমিন ইউজার ভিউ মোড:</strong> গ্রাহকরা যেভাবে স্টোরফ্রন্ট দেখবে, আপনিও সেভাবেই দেখছেন।
          </span>
          <Link 
            href="/admin" 
            className="px-3.5 py-1 bg-lavender text-velvet rounded-xl font-black transition-all duration-200 hover:bg-white hover:text-velvet hover:shadow-lg shadow shadow-lavender/10"
          >
            এডমিন প্যানেলে ফিরে যান →
          </Link>
        </div>
      )}
      <main className="min-h-screen bg-radial-glow bg-velvet text-slate-100 flex flex-col items-center pb-24 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-radial-purple-glow opacity-30 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-lavender/5 blur-[120px] top-[-300px] left-[50%] -translate-x-[50%] pointer-events-none" />

      <div className="w-full max-w-6xl z-10 px-4 md:px-8 flex flex-col gap-16">
        
        {/* Sleek Minimalist Bangla Header */}
        <nav className="w-full py-6 flex items-center justify-between border-b border-white/5 relative z-20">
          <Link href="/" className="flex items-center select-none cursor-pointer -my-4">
            <img 
              src="/logo.png" 
              alt="বিহান (BIHAN)" 
              className="h-24 md:h-32 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(15,23,42,0.03)]"
            />
          </Link>

          {/* FIX 1: FULLY FUNCTIONAL NAVIGATION ANCHORS WITH SMOOTH SCROLLING */}
          <div className="hidden md:flex items-center gap-1.5 bg-dark-900/50 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-md">
            <a 
              href="#premium-catalog"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('premium-catalog');
              }}
              className="px-4 py-1.5 text-xs font-black text-slate-200 hover:bg-white/5 rounded-full transition cursor-pointer select-none"
            >
              লাইব্রেরি
            </a>
            <a 
              href="#premium-catalog"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('premium-catalog');
              }}
              className="text-xs font-extrabold text-slate-400 px-3 py-1.5 hover:text-slate-200 transition cursor-pointer select-none"
            >
              ক্যাটাগরি
            </a>
            <a 
              href="#free-catalog"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('free-catalog');
              }}
              className="text-xs font-extrabold text-slate-400 px-3 py-1.5 hover:text-slate-200 transition cursor-pointer select-none"
            >
              নতুন বই
            </a>
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
                <Link
                  href={isAdminPreview ? "/library?view=user" : "/library"}
                  className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-full text-xs font-black transition duration-200"
                >
                  প্রোফাইল
                </Link>
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
                className="px-5 py-2.5 border border-lavender/25 bg-lavender/5 hover:bg-lavender hover:text-velvet text-lavender rounded-full text-xs font-black transition duration-300 shadow-md shadow-lavender/5 cursor-pointer"
              >
                লগইন / সাইন-আপ
              </button>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-6">
          <div className="flex flex-col gap-6 text-left">
            <span className="text-[11px] font-black text-lavender uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-lavender animate-ping" />
              আজকের নির্বাচিত প্রিমিয়াম গাইড
            </span>
            <div className="flex flex-col gap-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-300 tracking-wide">
                Explore the Digital Frontier.
              </h2>
              <h1 className="text-3xl lg:text-[44px] font-extrabold tracking-normal leading-[1.25] bg-gradient-to-r from-slate-100 via-slate-200 to-lavender bg-clip-text text-transparent font-serif">
                আপনার প্রয়োজনীয় সব প্রিমিয়াম পিডিএফ ও ডিজিটাল গাইড এক জায়গায়।
              </h1>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              কোনো লুকানো চার্জ ছাড়াই সরাসরি বিকাশ বা নগদে পেমেন্ট করুন এবং তাৎক্ষণিক ডাউনলোড করে নিন।
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <button 
                onClick={() => handleBookAction("60c72b2f9b1d8a23c4d5e6f1")}
                className="px-8 py-3 bg-gradient-to-r from-velvet/85 to-[#4e3a7a] hover:from-[#4e3a7a] hover:to-[#5d4692] text-lavender border border-lavender/30 font-bold rounded-2xl transition duration-300 text-sm shadow-lg shadow-lavender/10 flex items-center gap-2"
              >
                পড়ুন এবং আনলক করুন
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-lavender">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </button>

              <div className="flex items-center gap-1.5 ml-6 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full select-none">
                <span className="w-2.5 h-1 bg-primary-400 rounded-full" />
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
              </div>
            </div>
          </div>

          {/* Featured Book */}
          <div className="flex justify-center md:justify-end book-perspective">
            <div className="relative group book-mockup-hover">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-primary-500 to-indigo-700 opacity-20 blur-2xl group-hover:opacity-35 transition duration-500" />
              
              <div className="relative w-64 h-80 rounded-2xl book-mockup border border-white/10 shadow-2xl flex items-center justify-center p-1 bg-gradient-to-br from-indigo-950/40 via-dark-950 to-dark-950">
                <div className="absolute top-1 bottom-1 -right-[4px] w-[6px] bg-slate-100 rounded-r shadow" />
                <div className="absolute top-2 bottom-2 -right-[7px] w-[4px] bg-slate-50 rounded-r shadow-sm" />

                <div className="absolute top-0 bottom-0 -left-[18px] w-[18px] bg-gradient-to-r from-cyan-900 to-indigo-950 rounded-l origin-right -rotate-y-[85deg] shadow-lg flex flex-col justify-between py-6 items-center text-[9px] text-white/50 font-black tracking-widest">
                  <span>PDF</span>
                  <span className="uppercase rotate-180 writing-mode-vertical">GRONTHI</span>
                </div>

                <div className="w-full h-full rounded-r-xl overflow-hidden bg-gradient-to-br from-cyan-950 via-indigo-950 to-dark-950 flex flex-col justify-between p-6 relative">
                  <div className="absolute top-0 left-0 right-0 h-[150%] bg-gradient-to-b from-white/5 via-transparent to-transparent -skew-y-[45deg] origin-top-left pointer-events-none" />

                  <div className="flex justify-between items-start z-10">
                    <span className="text-[10px] font-black uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded shadow">প্রিমিয়াম গাইড</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  </div>

                  <div className="flex flex-col gap-2 text-left z-10">
                    <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest font-mono">গ্রন্থী পাবলিশার্স</span>
                    <h3 className="text-xl font-black text-white leading-tight font-serif select-none">
                      ইউআই/ইউএক্স ডিজাইন গাইড
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium select-none mt-1 leading-relaxed">
                      পেশাদার ইউজার ইন্টারফেস ডিজাইন, ভিজ্যুয়াল আর্ট সিস্টেম এবং আধুনিক ডিজাইন নিয়মের সম্পূর্ণ হ্যান্ডবুক।
                    </p>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/5 pt-3 z-10 text-xs font-mono font-bold text-slate-400">
                    <span>PAGE COUNT: 320</span>
                    <span className="text-sm font-black text-white">৳ ২৫০</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Search & Category Filters Widget */}
        <section className="glass-panel p-6 rounded-3xl border border-white/5 bg-dark-900/40 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl mt-4 select-none">
          {/* Fuzzy Search Field */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input 
              type="text"
              placeholder="বইয়ের নাম, লেখক বা বিবরণ দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-velvet/40 border border-white/10 rounded-2xl text-xs font-semibold focus:border-lavender text-slate-200 placeholder:text-slate-500 transition duration-300 outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs transition"
              >
                ✕
              </button>
            )}
          </div>

          {/* Glassmorphic Category Dropdown Filter */}
          <div className="relative w-full md:w-auto md:min-w-[220px]">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-lavender text-sm z-10">▾</div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none pl-9 pr-5 py-3 bg-velvet/50 border border-lavender/20 hover:border-lavender/50 rounded-2xl text-xs font-black text-slate-200 focus:outline-none focus:border-lavender focus:ring-2 focus:ring-lavender/15 transition duration-300 cursor-pointer shadow-lg shadow-lavender/5 backdrop-blur-md"
              style={{ backgroundImage: 'none' }}
            >
              {getUniqueCategories().map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className="bg-[#1a1130] text-slate-200 font-semibold"
                >
                  {cat === 'All' ? '📚 সব ক্যাটাগরি' : `• ${cat}`}
                </option>
              ))}
            </select>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-lavender/20 hover:bg-lavender/40 text-lavender text-[10px] flex items-center justify-center transition duration-200 z-10"
                title="ফিল্টার মুছুন"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Premium Products Category List */}
        <section id="premium-catalog" className="flex flex-col gap-8 mt-6">
          <div className="flex flex-col gap-1.5 text-left">
            <h2 className="text-2xl font-black tracking-tight text-lavender font-serif flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-lavender" />
              প্রিমিয়াম গাইডসমূহ
            </h2>
            <p className="text-xs text-slate-500 max-w-lg">
              বিকাশ বা নগদে পেমেন্ট করার কয়েক সেকেন্ডের মধ্যে অটোমেটিকালি আনলক হয়ে যাবে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {booksLoading ? (
              <div className="col-span-full py-16 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-lavender/20 border-t-lavender rounded-full animate-spin" />
              </div>
            ) : books.map(b => ({
                id: b._id,
                title: b.title,
                author: b.author,
                description: b.description,
                price: b.price,
                rating: b.averageRating || 4.9,
                coverImage: b.coverImage,
                pageCount: b.pageCount,
                previewLimit: b.previewLimit || 4,
                isFree: b.isFree,
                category: b.category
              })).filter(book => {
                const matchesSearch = 
                  book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  book.description.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
                return matchesSearch && matchesCategory && !book.isFree;
              }).length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                  কোনো প্রিমিয়াম বই খুঁজে পাওয়া যায়নি।
                </div>
              ) : books.map(b => ({
                id: b._id,
                title: b.title,
                author: b.author,
                description: b.description,
                price: b.price,
                rating: b.averageRating || 4.9,
                coverImage: b.coverImage,
                pageCount: b.pageCount,
                previewLimit: b.previewLimit || 4,
                isFree: b.isFree,
                category: b.category
              })).filter(book => {
                const matchesSearch = 
                  book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  book.description.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
                return matchesSearch && matchesCategory && !book.isFree;
              }).map((book) => (
                <ProductCard 
                  key={book.id} 
                  book={book} 
                  onAction={handleBookAction} 
                />
              ))
            }
          </div>
        </section>

        {/* Free Products Category List */}
        <section id="free-catalog" className="flex flex-col gap-8 mt-6">
          <div className="flex flex-col gap-1.5 text-left">
            <h2 className="text-2xl font-black tracking-tight text-slate-100 font-serif flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              ফ্রি রিসোর্স ও গাইড
            </h2>
            <p className="text-xs text-slate-500 max-w-lg">
              কোনো পেমেন্ট ছাড়াই সরাসরি অ্যাকাউন্ট ইমেইলে ফ্রি ডাউনলোড করে নিন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {booksLoading ? (
              <div className="col-span-full py-16 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-lavender/20 border-t-lavender rounded-full animate-spin" />
              </div>
            ) : books.map(b => ({
                id: b._id,
                title: b.title,
                author: b.author,
                description: b.description,
                price: b.price,
                rating: b.averageRating || 4.9,
                coverImage: b.coverImage,
                pageCount: b.pageCount,
                previewLimit: b.previewLimit || 4,
                isFree: b.isFree,
                category: b.category
              })).filter(book => {
                const matchesSearch = 
                  book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  book.description.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
                return matchesSearch && matchesCategory && book.isFree;
              }).length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                  কোনো ফ্রি রিসোর্স খুঁজে পাওয়া যায়নি।
                </div>
              ) : books.map(b => ({
                id: b._id,
                title: b.title,
                author: b.author,
                description: b.description,
                price: b.price,
                rating: b.averageRating || 4.9,
                coverImage: b.coverImage,
                pageCount: b.pageCount,
                previewLimit: b.previewLimit || 4,
                isFree: b.isFree,
                category: b.category
              })).filter(book => {
                const matchesSearch = 
                  book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  book.description.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
                return matchesSearch && matchesCategory && book.isFree;
              }).map((book) => (
                <ProductCard 
                  key={book.id} 
                  book={book} 
                  onAction={handleBookAction} 
                />
              ))
            }
          </div>
        </section>

      </div>

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
                    আমরা আপনার <strong className="text-lavender font-mono">{authEmail}</strong> ইমেইলে একটি ভেরিফিকেশন ওটিপি (OTP) কোড পাঠিয়েছি। ওটিপিটি নিচে ইনপুট করুন। (মেইলটি না পেলে অনুগ্রহ করে আপনার ইনবক্স ও স্প্যাম ফোল্ডার চেক করুন)
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

      {/* Floating Checkout Drawer Panel */}
      <AnimatePresence>
        {isCheckoutOpen && checkoutBook && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-velvet/60 backdrop-blur-md"
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
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <div className="flex-grow overflow-y-auto py-6 flex flex-col gap-6 scroll-smooth pr-1">
                
                <div className="glass-panel p-4 rounded-2xl border border-lavender/5 flex gap-4 items-center bg-velvet/40">
                  <div className="w-12 h-16 rounded bg-gradient-to-br from-velvet to-dark-950 border border-lavender/10 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                    <span className="text-[7px] text-white/50 font-bold uppercase truncate px-1 text-center select-none font-serif">{checkoutBook.title}</span>
                  </div>
                  <div className="flex-grow flex flex-col min-w-0">
                    <span className="text-[8px] font-bold text-lavender uppercase tracking-widest">{checkoutBook.author}</span>
                    <h4 className="text-sm font-bold text-slate-100 truncate">{checkoutBook.title}</h4>
                    <span className="text-xs text-slate-500">{checkoutBook.pageCount} পৃষ্ঠা</span>
                  </div>
                  <span className="text-sm font-black text-slate-200 flex-shrink-0">৳ {checkoutBook.price}</span>
                </div>

                <div className="flex justify-between items-center border-t border-b border-lavender/5 py-3.5">
                  <span className="text-sm text-slate-400 font-semibold">সর্বমোট প্রদেয় মূল্য:</span>
                  <span className="text-lg font-black text-white font-mono">৳ {checkoutBook.price}.00</span>
                </div>

                {submitSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3 animate-bounce">
                      ✓
                    </div>
                    <h4 className="text-base font-black text-slate-100 font-serif">ট্রানজেকশন সফলভাবে জমা হয়েছে!</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                      আপনার জমাকৃত TxID: <strong className="text-lavender font-mono select-all">{txId}</strong> আমাদের অটোমেটেড গেটওয়েতে ভেরিফিকেশন করা হচ্ছে। ভেরিফিকেশন শেষ হলে কয়েক সেকেন্ডের মধ্যে বইটি লাইব্রেরিতে আনলক হয়ে যাবে।
                    </p>
                    <button 
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        window.location.reload();
                      }}
                      className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition duration-200"
                    >
                      লাইব্রেরি চেক করুন
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col gap-6">
                    
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed flex items-start gap-2.5">
                      <span className="text-base">⚠️</span>
                      <div>
                        <strong className="font-extrabold block text-amber-200 mb-0.5">গুরুত্বपूर्ण পেমেন্ট সতর্কবার্তা:</strong>
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
                              : 'border-lavender/5 bg-lavender/5 text-slate-400 hover:bg-lavender/10'
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
                              : 'border-lavender/5 bg-lavender/5 text-slate-400 hover:bg-lavender/10'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          নগদ (Nagad)
                        </button>
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-lavender/5 text-xs text-slate-400 flex flex-col gap-2 bg-velvet/20 leading-relaxed font-sans">
                      <div className="font-extrabold text-slate-300 border-b border-lavender/5 pb-1.5 mb-1 flex items-center justify-between">
                        <span>পেমেন্ট নির্দেশনাবলী (Send Money)</span>
                        <span className="text-lavender font-mono">৳ {checkoutBook.price}</span>
                      </div>
                      <p>১. আপনার ওয়ালেট অ্যাপ থেকে <strong className="text-slate-200">Send Money</strong> সিলেক্ট করুন।</p>
                      <p>
                        ২. প্রাপক নম্বরে আমাদের ওয়ালেট নং দিন: <strong className="text-lavender select-all font-mono">
                          {paymentGateway === 'bkash' ? '01712-XXXXXX' : '01912-XXXXXX'}
                        </strong>
                      </p>
                      <p>৩. পরিমাণের ঘরে <strong className="text-slate-200">৳ {checkoutBook.price}</strong> লিখে পিন দিয়ে কনফার্ম করুন।</p>
                      <p>৪. সফলভাবে পেমেন্ট করার পর ট্রানজেকশন আইডি (<strong className="text-slate-200">TrxID/TxID</strong>) নিচে বসান।</p>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">আপনার মোবাইল নম্বর (যে নম্বর থেকে পেমেন্ট করেছেন)</label>
                        <input 
                          type="tel"
                          required
                          placeholder="উদা. ০১৭XXXXXXXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono font-medium focus:border-lavender"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">ট্রানজেকশন আইডি (Transaction ID / TxID)</label>
                        <input 
                          type="text"
                          required
                          placeholder="উদা. 8A4B6C8D9E"
                          value={txId}
                          onChange={(e) => setTxId(e.target.value)}
                          className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono uppercase font-black tracking-widest focus:border-lavender"
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
                            ? 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-pink-500/10 shadow-pink-500/15'
                            : 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/10 shadow-orange-500/15'
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

      {/* Free Book Modal */}
      <AnimatePresence>
        {isFreeModalOpen && freeBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFreeModalOpen(false)}
              className="absolute inset-0 bg-velvet/80 backdrop-blur-md"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md glass-panel rounded-3xl relative z-10 overflow-hidden shadow-2xl border border-lavender/10 p-6 flex flex-col gap-6 text-left"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />

              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider font-sans">রিসোর্স ফাইল ডাউনলোড</span>
                  <h3 className="text-xl font-black text-slate-100 font-serif">ফ্রি গাইড বুক ডাউনলোড করুন</h3>
                </div>
                <button 
                  onClick={() => setIsFreeModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-lavender/10 bg-lavender/5 hover:bg-lavender/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {freeStep === 'email' && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans bg-lavender/5 border border-lavender/5 p-4 rounded-xl">
                    নিচের ইনপুট বক্সে আপনার সচল ইমেইল অ্যাড্রেসটি লিখুন। স্প্যাম অ্যাকাউন্ট প্রতিরোধ করতে আপনার ইমেইলে একটি ভেরিফিকেশন ওটিপি (OTP) পাঠানো হবে।
                  </p>
                  <form onSubmit={handleFreeEmailSubmit} className="flex flex-col gap-4">
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
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs rounded-2xl transition duration-300 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
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
                  <div className="p-3.5 rounded-xl bg-lavender/10 border border-lavender/20 text-xs text-lavender leading-relaxed font-sans">
                    আমরা আপনার <strong className="text-slate-100">{freeEmail}</strong> ইমেইলে একটি ভেরিফিকেশন ওটিপি (OTP) কোড পাঠিয়েছি। ওটিপিটি নিচে ইনপুট করুন। (মেইলটি না পেলে অনুগ্রহ করে আপনার ইনবক্স ও স্প্যাম ফোল্ডার চেক করুন)
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
                        className="py-3.5 border border-lavender/10 hover:bg-lavender/5 text-slate-300 font-bold text-xs rounded-2xl transition text-center"
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
                    আমরা <strong className="text-emerald-400 font-mono select-all">{freeEmail}</strong> ঠিকানায় <strong>{freeBook.title}</strong> বইটির ডাউনলোড লিংক পাঠিয়ে দিয়েছি। অনুগ্রহ করে আপনার ইনবক্স চেক করুন।
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


    </main>
    <Footer />
    </>
  );
}
