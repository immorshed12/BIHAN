'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import PDFViewer from '@/components/PDFViewer';
import Footer from '@/components/Footer';
import { AnimatePresence, motion } from 'framer-motion';

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  const { user, activeOrder, setUser, logout } = useStore();
  const [book, setBook] = useState<any | null>(null);
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

  // Free Email Modal state (silent bypass)
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);
  const [freeEmail, setFreeEmail] = useState('');
  const [freeStep, setFreeStep] = useState<'email' | 'success'>('email');
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

  // Premium Features States
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Viral loop states
  const [isShared, setIsShared] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);

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
            window.location.href = '/admin';
          }
        }
      })
      .catch(err => console.error('Session fetch error:', err));
  }, [setUser]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/books/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.book) {
          const mappedBook = {
            id: data.book._id,
            title: data.book.title,
            author: data.book.author,
            description: data.book.description,
            price: data.book.price,
            coverImage: data.book.coverImage,
            pageCount: data.book.pageCount,
            previewLimit: data.book.previewLimit || 4,
            isFree: data.book.isFree,
            category: data.book.category || 'General',
            averageRating: data.book.averageRating || 5.0,
            ratingsCount: data.book.ratingsCount || 0
          };
          setBook(mappedBook);

          const hasPurchased =
            user?.purchasedBooks?.includes(mappedBook.id) ||
            user?.role === 'admin' ||
            (activeOrder && activeOrder.bookId === mappedBook.id && activeOrder.status === 'approved');
          setIsPurchased(!!hasPurchased);
        }
      })
      .catch(err => console.error('Fetch book details error:', err))
      .finally(() => setLoading(false));
  }, [params.id, user, activeOrder]);

  // Load reviews on mount
  useEffect(() => {
    const saved = localStorage.getItem(`gronthi-reviews-${params.id}`);
    if (saved) {
      setReviewsList(JSON.parse(saved));
    } else {
      const defaultReviews = [
        { name: 'সোহেল রানা', rating: 5, comment: 'চমৎকার ডিজাইন গাইড! ভিজ্যুয়াল আর্ট ও থিওরির সুন্দর সমন্বয় রয়েছে।', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString() },
        { name: 'তাহসিন আহমেদ', rating: 4, comment: 'খুব কাজের রিসোর্স। প্র্যাক্টিক্যাল উদাহরণগুলো দারুণ লেগেছে।', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString() }
      ];
      setReviewsList(defaultReviews);
      localStorage.setItem(`gronthi-reviews-${params.id}`, JSON.stringify(defaultReviews));
    }
  }, [params.id]);

  // Fetch related books
  useEffect(() => {
    if (!book?.category) return;
    fetch('/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.books) {
          const related = data.books
            .filter((b: any) => b.category === book.category && b._id !== book.id)
            .map((b: any) => ({
              id: b._id,
              title: b.title,
              author: b.author,
              price: b.price,
              coverImage: b.coverImage,
              rating: b.averageRating || 4.9,
              isFree: b.isFree
            }));
          setRelatedBooks(related);
        }
      })
      .catch(err => console.error('Fetch related books error:', err));
  }, [book?.category, book?.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRating) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const response = await fetch(`/api/books/${params.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'রেটিং সাবমিট ব্যর্থ হয়েছে।');
      const newReview = {
        name: user?.name || 'অতিথি পাঠক',
        rating: newRating,
        comment: newReviewComment || 'কোনো মন্তব্য নেই।',
        date: new Date().toLocaleDateString()
      };
      const updated = [newReview, ...reviewsList];
      setReviewsList(updated);
      localStorage.setItem(`gronthi-reviews-${params.id}`, JSON.stringify(updated));
      if (book) setBook({ ...book, averageRating: data.averageRating, ratingsCount: data.ratingsCount });
      setNewReviewComment('');
      setNewRating(5);
      alert('আপনার রিভিউটি সফলভাবে জমা হয়েছে!');
    } catch (err: any) {
      setReviewError(err.message || 'রেটিং সাবমিট করতে সমস্যা হয়েছে।');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleShareClick = (platform: 'fb' | 'wa') => {
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(`বিহান (BIHAN) থেকে "${book?.title}" বইটি সম্পূর্ণ ফ্রিতে ডাউনলোড করুন!`);
    let url = '';
    if (platform === 'fb') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`;
    }
    window.open(url, '_blank', 'width=600,height=400');
    setIsShared(true);
    setShowShareModal(false);
  };

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
      if (!response.ok) throw new Error(data.error || 'ভেরিফিকেশন কোড পাঠাতে সমস্যা হয়েছে।');
      setAuthStep('otp');
    } catch (err: any) {
      setAuthError(err.message || 'নেটওয়ার্ক ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।');
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
      if (!response.ok) throw new Error(data.error || 'ভেরিফিকেশন কোডটি সঠিক নয়।');
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
      setAuthError(err.message || 'ভেরিফিকেশন ব্যর্থ হয়েছে, দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      setAuthError('গুগল লগইন বর্তমানে নিষ্ক্রিয় আছে। অনুগ্রহ করে নিচের ইমেইল ওটিপি পদ্ধতি ব্যবহার করুন।');
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
            if (!res.ok) throw new Error(data.error || 'গুগল ভেরিফিকেশন ব্যর্থ হয়েছে।');
            setUser(data.user);
            setIsAuthModalOpen(false);
            if (data.user.role === 'admin') {
              window.location.href = '/admin';
            } else {
              window.location.reload();
            }
          } catch (err: any) {
            setAuthError(err.message || 'গুগল লগইন ব্যর্থ হয়েছে।');
          } finally {
            setAuthSubmitting(false);
          }
        }
      });
      (window as any).google.accounts.id.prompt();
    } catch (err) {
      setAuthError('গুগল লগইন কনসোল লোড করা যায়নি।');
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

  const handlePurchaseClick = () => {
    if (book?.isFree) {
      setFreeStep('email');
      setFreeEmail('');
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
    try {
      const response = await fetch('/api/auth/free-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: freeEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'সমস্যা হয়েছে, আবার চেষ্টা করুন।');
      setUser(data.user);
      setFreeStep('success');
    } catch (err: any) {
      setFreeError(err.message || 'নেটওয়ার্ক ত্রুটি, অনুগ্রহ করে আবার চেষ্টা করুন।');
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
          bookId: book?._id || book?.id,
          amountPaid: book?.price,
          paymentGateway,
          customerPhone: phoneNumber,
          submittedTxID: txId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'পেমেন্ট ভেরিফিকেশন রিকোয়েস্ট ব্যর্থ হয়েছে।');
      setSubmitSuccess(true);
    } catch (err: any) {
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
        <h2 className="text-2xl font-bold text-rose-500 font-serif">বইটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-slate-400 text-sm">অনুরোধকৃত ডিজিটাল ক্যাটালগ গাইডটি খুঁজে পাওয়া যায়নি।</p>
        <Link href="/" className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl font-bold text-xs transition duration-200">
          মূল পাতায় ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radial-glow bg-dark-950 text-slate-100 py-12 px-4 md:px-8 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-radial-purple-glow opacity-25 pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto z-10 relative flex flex-col gap-8">

        {/* Navigation */}
        <nav className="w-full py-4 flex items-center justify-between border-b border-white/5 relative z-20">
          <Link href="/" className="flex items-center select-none cursor-pointer -my-4">
            <img
              src="/logo.png"
              alt="বিহান (BIHAN)"
              className="h-24 md:h-32 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.07)]"
            />
          </Link>

          <div className="hidden md:flex items-center gap-1.5 bg-dark-900/50 border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-md">
            <Link href="/#premium-catalog" className="px-4 py-1.5 text-xs font-black text-slate-200 hover:bg-white/5 rounded-full transition cursor-pointer select-none">
              লাইব্রেরি
            </Link>
            <Link href="/#premium-catalog" className="text-xs font-extrabold text-slate-400 px-3 py-1.5 hover:text-slate-200 transition cursor-pointer select-none">
              ক্যাটাগরি
            </Link>
            <Link href="/#free-catalog" className="text-xs font-extrabold text-slate-400 px-3 py-1.5 hover:text-slate-200 transition cursor-pointer select-none">
              নতুন বই
            </Link>
          </div>

          <div className="flex items-center gap-4 relative">
            {isMounted && user && user.email !== 'client@example.com' ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end text-right select-none">
                  <span className="text-xs font-black text-slate-200">{user.name}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'text-primary-400' : 'text-emerald-400'}`}>
                    {user.role === 'admin' ? 'অ্যাডমিন অ্যাকাউন্ট' : 'সদস্য'}
                  </span>
                </div>
                <Link href="/library" className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-full text-xs font-black transition duration-200">
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

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 text-left -mt-2">
          <Link href="/" className="hover:text-primary-400 transition font-extrabold select-none">বিহান লাইব্রেরি</Link>
          <span>/</span>
          <span className="text-slate-200 truncate max-w-[200px] font-medium">{book.title}</span>
        </nav>

        {/* Book Header */}
        <section className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row gap-8 items-start relative text-left">

          {/* Book Cover Mockup */}
          <div className="w-36 h-48 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-dark-950 to-dark-950 border border-white/5 relative flex-shrink-0 flex items-center justify-center p-4">
            <div className="absolute top-1 bottom-1 -right-[3px] w-[5px] bg-slate-100 rounded-r shadow-sm border-r border-slate-300" />
            <div className="w-full h-full rounded-r-xl overflow-hidden bg-gradient-to-br from-cyan-950 via-indigo-950 to-dark-950 flex flex-col justify-between p-3 relative border border-white/10 shadow-xl">
              {book.coverImage && (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <span className="text-[7px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded w-fit border border-cyan-500/20 z-10 relative">
                {book.isFree ? 'ফ্রি' : 'প্রিমিয়াম'}
              </span>
              <h4 className="text-[10px] font-black text-white font-serif select-none line-clamp-3 leading-tight z-10 relative">{book.title}</h4>
              <div className="flex justify-between text-[6px] text-white/40 font-mono z-10 relative">
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
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">ভেরিফিকেশন</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  তাৎক্ষণিক সক্রিয়
                </span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
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
            ) : book.isFree ? (
              <div className="flex flex-col gap-2 w-full">
                {isShared ? (
                  <a
                    href={`/api/download/${params.id}`}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black rounded-xl text-center text-xs transition duration-300 shadow-lg shadow-emerald-500/20"
                  >
                    📥 ফ্রি পিডিএফ ডাউনলোড করুন
                  </a>
                ) : (
                  <button
                    onClick={handlePurchaseClick}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 hover:from-emerald-500/20 hover:to-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-black rounded-xl text-xs transition duration-300 flex items-center justify-center gap-2"
                  >
                    🔗 ফ্রি ডাউনলোড পেতে ক্লিক করুন
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handlePurchaseClick}
                className="w-full md:px-8 py-3.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition duration-300 shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                সম্পূর্ণ পিডিএফ রিড ও আনলক
              </button>
            )}
          </div>
        </section>

        {/* E-Reader */}
        <section className="flex flex-col gap-4 mt-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight font-serif flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              বিহান ইন্টারেক্টিভ ই-রিডার
            </h3>
            <span className="text-xs text-slate-500">
              {isPurchased || book.isFree ? 'সম্পূর্ণ বই আনলকড' : `ফ্রি প্রিভিউ (১ থেকে ${book.previewLimit} পৃষ্ঠা)`}
            </span>
          </div>
          <PDFViewer
            bookId={book.id}
            totalPageCount={book.pageCount}
            previewLimit={book.previewLimit}
            isPurchased={isPurchased || book.isFree}
            bookPrice={book.price}
          />
        </section>

        {/* Viral Share Modal Trigger */}
        <AnimatePresence>
          {showShareModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowShareModal(false)}
                className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-sm glass-panel bg-dark-900/90 border border-white/10 rounded-3xl p-6 relative z-10 text-center flex flex-col gap-6 shadow-2xl backdrop-blur-2xl"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest font-sans">ভাইরাল লুপ ডাউনলোড আনলক</span>
                  <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="flex flex-col gap-2 font-sans">
                  <span className="text-3xl">📢</span>
                  <h3 className="text-lg font-black text-white font-serif">ফেসবুক বা হোয়াটস্যাপে শেয়ার করুন</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    বইটি বিনামূল্যে ডাউনলোড করতে যেকোনো একটি সোশ্যাল মাধ্যমে শেয়ার করুন।
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2 font-sans">
                  <button onClick={() => handleShareClick('fb')} className="py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer">
                    Facebook শেয়ার
                  </button>
                  <button onClick={() => handleShareClick('wa')} className="py-3 bg-[#25D366] hover:bg-[#20BA56] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer">
                    WhatsApp শেয়ার
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <section className="flex flex-col gap-6 mt-8 text-left select-none">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-black text-slate-100 font-serif flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400 animate-pulse" />
                এই ক্যাটাগরির অন্যান্য জনপ্রিয় বই
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedBooks.map((relBook) => (
                <div
                  key={relBook.id}
                  onClick={() => window.location.href = `/book/${relBook.id}`}
                  className="glass-panel p-5 rounded-3xl border border-white/5 hover:border-cyan-500/20 transition duration-300 bg-dark-900/30 flex flex-col gap-4 cursor-pointer group shadow-lg"
                >
                  <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-dark-950 border border-white/5 flex items-center justify-center p-2 relative overflow-hidden">
                    {relBook.coverImage ? (
                      <img src={relBook.coverImage} alt={relBook.title} className="absolute inset-0 w-full h-full object-cover rounded-2xl" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-20 h-28 bg-gradient-to-br from-indigo-950 via-dark-950 to-dark-950 rounded-r-lg border border-white/10 shadow flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                        <span className="text-[5px] text-white/50 font-bold uppercase truncate px-1 text-center select-none font-serif">{relBook.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <h4 className="text-sm font-black text-slate-200 group-hover:text-cyan-400 transition truncate">{relBook.title}</h4>
                    <div className="flex items-center justify-between text-xs mt-1.5 border-t border-white/5 pt-2 font-mono">
                      <span className="text-amber-400">★ {relBook.rating}</span>
                      <strong className="text-slate-100">{relBook.isFree ? <span className="text-emerald-400 font-sans font-bold">ফ্রি</span> : `৳ ${relBook.price}`}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 bg-dark-900/30 flex flex-col md:flex-row gap-8 mt-8 text-left shadow-xl select-none">
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <h3 className="text-lg font-black tracking-tight font-serif text-lavender flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-lavender" />
              মন্তব্য ও রিভিউ দিন
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              বইটি আপনার কেমন লেগেছে? মতামত দিয়ে অন্য পাঠকদের সহায়তা করুন।
            </p>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">আপনার স্টার রেটিং দিন</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`text-2xl transition duration-150 cursor-pointer ${star <= newRating ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.55)]' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">রিভিউ বিবরণ বা মন্তব্য</label>
                <textarea
                  placeholder="বইটির কোন অধ্যায় সবচেয়ে কার্যকর মনে হয়েছে..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="w-full min-h-[90px] glass-input px-3.5 py-2.5 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:border-lavender outline-none"
                />
              </div>
              {reviewError && (
                <div className="text-[10px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-2.5 rounded-xl">
                  {reviewError}
                </div>
              )}
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full py-3 bg-gradient-to-r from-velvet to-[#4e3a7a] hover:from-[#4e3a7a] hover:to-[#5d4692] text-lavender border border-lavender/30 text-xs font-black rounded-xl transition duration-200 cursor-pointer"
              >
                {reviewSubmitting ? 'রিভিউ জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
              </button>
            </form>
          </div>

          <div className="flex-grow flex flex-col gap-4 font-sans">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">পাঠকদের মূল্যবান মতামত</h4>
            <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
              {reviewsList.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6">বইটির কোনো রিভিউ পাওয়া যায়নি। প্রথম রিভিউটি আপনিই লিখুন!</p>
              ) : (
                reviewsList.map((rev, idx) => (
                  <div key={idx} className="glass-panel p-4 rounded-2xl border border-white/5 bg-dark-950/20 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-slate-200">{rev.name}</strong>
                      <span className="text-[10px] text-slate-500 font-semibold">{rev.date}</span>
                    </div>
                    <div className="text-amber-400 text-xs">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════════
          PAYMENT DRAWER (Slide-over from right)
      ══════════════════════════════════════════════════════════ */}
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
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-md bg-dark-900/95 border-l border-white/10 h-full relative z-10 p-6 flex flex-col gap-6 shadow-2xl backdrop-blur-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">বিহান সিকিউর পেমেন্ট</span>
                  <h3 className="text-lg font-black text-slate-200 font-serif">বিকাশ / নগদ দিয়ে পেমেন্ট করুন</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4 text-left font-sans">
                {/* Book Info */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">বইয়ের নাম</span>
                  <strong className="text-sm text-slate-200">{book.title}</strong>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs text-slate-400">পরিশোধযোগ্য মোট টাকা:</span>
                    <strong className="text-base text-rose-400 font-mono">৳ {book.price}.০০</strong>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex flex-col gap-3">
                  <span className="text-[10px] text-rose-400 font-black uppercase tracking-wider">পেমেন্ট করার নিয়মাবলী:</span>
                  <div className="flex flex-col gap-2.5 text-xs text-slate-300">
                    <p>১. আপনার বিকাশ বা নগদ পার্সোনাল অ্যাকাউন্ট থেকে নিচে দেওয়া নম্বরে <strong>Send Money</strong> করুন।</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                        <span className="text-[9px] text-slate-500 font-bold block">বিকাশ (bKash)</span>
                        <strong className="text-slate-200 font-mono select-all">01712-XXXXXX</strong>
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                        <span className="text-[9px] text-slate-500 font-bold block">নগদ (Nagad)</span>
                        <strong className="text-slate-200 font-mono select-all">01912-XXXXXX</strong>
                      </div>
                    </div>
                    <p>২. টাকা পাঠানো হয়ে গেলে <strong>Transaction ID (TxID)</strong> নিচে দিন।</p>
                  </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">পেমেন্ট মাধ্যম সিলেক্ট করুন</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentGateway('bkash')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs font-black transition duration-300 ${paymentGateway === 'bkash' ? 'bg-pink-500/10 border-pink-500 text-pink-400' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        বিকাশ (bKash)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentGateway('nagad')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs font-black transition duration-300 ${paymentGateway === 'nagad' ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        নগদ (Nagad)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">যে নম্বর থেকে টাকা পাঠিয়েছেন</label>
                    <input
                      type="text"
                      required
                      placeholder="উদা. 017XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono font-medium focus:border-rose-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">ট্রানজেকশন আইডি (TxID)</label>
                    <input
                      type="text"
                      required
                      placeholder="উদা. 9H87G6F5D4"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider focus:border-rose-500"
                    />
                  </div>

                  {submitError && (
                    <div className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
                      {submitError}
                    </div>
                  )}

                  {submitSuccess ? (
                    <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center leading-relaxed">
                      ✓ পেমেন্ট ভেরিফিকেশন সফলভাবে সাবমিট হয়েছে! খুব দ্রুত এডমিন এটি দেখে আপনার পিডিএফটি আনলক করে দিবে। ধন্যবাদ!
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-black text-xs rounded-2xl transition duration-300 shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : 'পেমেন্ট নিশ্চিত করুন'}
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          FREE DOWNLOAD MODAL (Silent bypass — email only)
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isFreeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFreeModalOpen(false)}
              className="absolute inset-0 bg-dark-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-dark-900/65 border border-white/10 rounded-3xl relative z-10 overflow-hidden shadow-2xl backdrop-blur-2xl p-6 flex flex-col gap-6 text-left"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_2px_20px_rgba(16,185,129,0.3)]" />

              {/* Modal Header */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-0.5 select-none">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ফ্রি ডাউনলোডার সিস্টেম</span>
                  <h3 className="text-xl font-black text-slate-100 font-serif">ফ্রি গাইড ডাউনলোড করুন</h3>
                </div>
                <button
                  onClick={() => setIsFreeModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* Step: Email */}
              {freeStep === 'email' && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans bg-white/5 border border-white/5 p-4 rounded-xl">
                    নিচের বক্সে আপনার ইমেইল দিন। সঙ্গে সঙ্গে অ্যাকাউন্ট তৈরি হয়ে ফ্রি বইটি আনলক হয়ে যাবে — কোনো OTP ছাড়াই!
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

                    {freeError && (
                      <div className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
                        {freeError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={freeSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs rounded-2xl transition duration-300 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                    >
                      {freeSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-900 border-t-slate-500 rounded-full animate-spin" />
                          প্রক্রিয়াধীন...
                        </>
                      ) : (
                        <>
                          তাৎক্ষণিক আনলক ও ডাউনলোড করুন
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Step: Success */}
              {freeStep === 'success' && (
                <div className="flex flex-col items-center justify-center text-center py-4 gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center animate-bounce text-xl">
                    ✓
                  </div>
                  <h4 className="text-base font-black text-slate-200 font-serif">সফলভাবে আনলক করা হয়েছে!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    <strong>{book.title}</strong> বইটি সফলভাবে আপনার জন্য আনলক হয়েছে। এখন আপনি ই-রিডারে সম্পূর্ণ বইটি পড়তে পারবেন।
                  </p>
                  <a
                    href={`/api/download/${params.id}`}
                    className="mt-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black rounded-xl text-xs transition duration-200 flex items-center gap-2"
                  >
                    📥 পিডিএফ ডাউনলোড করুন
                  </a>
                  <button
                    onClick={() => { setIsFreeModalOpen(false); window.location.reload(); }}
                    className="px-6 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 font-bold rounded-xl text-xs transition duration-200"
                  >
                    পড়া শুরু করুন (Read Now)
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          AUTH MODAL
      ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAuthModalOpen(false); setAuthStep('email'); setAuthError(''); }}
              className="absolute inset-0 bg-velvet/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-dark-900/60 border border-white/10 rounded-3xl relative z-10 overflow-hidden shadow-2xl backdrop-blur-2xl p-6 flex flex-col gap-6 text-left"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-500 to-indigo-600 shadow-[0_2px_20px_rgba(225,29,72,0.4)]" />

              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5 select-none">
                  <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">গ্রন্থী সিকিউর গেটওয়ে</span>
                  <h3 className="text-xl font-extrabold text-slate-100 font-serif">
                    {authMode === 'login' ? 'অ্যাকাউন্টে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
                  </h3>
                </div>
                <button
                  onClick={() => { setIsAuthModalOpen(false); setAuthStep('email'); setAuthError(''); }}
                  className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Google SSO */}
              <button
                onClick={handleGoogleAuth}
                className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl transition duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-white/5 text-xs cursor-pointer border border-slate-200"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.68 1.42 7.58l3.9 3.02C6.27 7.7 8.91 5.04 12 5.04z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.88c2.18-2.01 3.7-4.99 3.7-8.61z"/>
                  <path fill="#FBBC05" d="M5.32 14.6c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3L1.42 6.98C.51 8.79 0 10.84 0 13s.51 4.21 1.42 6.02l3.9-3.02z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.88c-1.1.74-2.52 1.18-4.23 1.18-3.09 0-5.73-2.66-6.68-5.56l-3.9 3.02C3.37 20.32 7.35 23 12 23z"/>
                </svg>
                Google দিয়ে সাইন-ইন করুন
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-grow h-px bg-white/10" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest select-none">অথবা</span>
                <div className="flex-grow h-px bg-white/10" />
              </div>

              {authError && (
                <div className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
                  {authError}
                </div>
              )}

              {authStep === 'email' ? (
                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4 font-sans">
                  {authMode === 'signup' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">আপনার নাম</label>
                      <input
                        type="text"
                        required
                        placeholder="উদা. সোহেল রানা"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-semibold focus:border-primary-500"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">আপনার ইমেইল ঠিকানা দিন</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-2xl text-xs font-mono font-medium focus:border-primary-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-black text-xs rounded-2xl transition duration-300 shadow-lg shadow-primary-500/15 flex items-center justify-center gap-2"
                  >
                    {authSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : 'ভেরিফিকেশন কোড পাঠান'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAuthOtpSubmit} className="flex flex-col gap-4 font-sans">
                  <div className="p-3 bg-lavender/5 border border-lavender/10 text-[11px] text-slate-300 rounded-xl leading-relaxed">
                    আমরা আপনার <strong className="text-lavender font-mono">{authEmail}</strong> ইমেইলে একটি OTP পাঠিয়েছি।
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">৬-ডিজিটের ভেরিফিকেশন OTP</label>
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
                      onClick={() => { setAuthStep('email'); setAuthError(''); }}
                      className="py-3 border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs rounded-2xl transition text-center cursor-pointer"
                    >
                      ইমেইল পরিবর্তন করুন
                    </button>
                    <button
                      type="submit"
                      disabled={authSubmitting}
                      className="py-3 bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-black text-xs rounded-2xl transition duration-300 flex items-center justify-center"
                    >
                      {authSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : 'কোড যাচাই করুন'}
                    </button>
                  </div>
                </form>
              )}

              {authStep === 'email' && (
                <div className="text-center mt-1 border-t border-white/5 pt-4">
                  {authMode === 'login' ? (
                    <button onClick={() => setAuthMode('signup')} className="text-xs font-bold text-slate-400 hover:text-primary-400 transition cursor-pointer">
                      নতুন অ্যাকাউন্ট তৈরি করতে চান? <span className="underline decoration-primary-500/50 underline-offset-2">এখানে ক্লিক করুন</span>
                    </button>
                  ) : (
                    <button onClick={() => setAuthMode('login')} className="text-xs font-bold text-slate-400 hover:text-primary-400 transition cursor-pointer">
                      ইতিমধ্যে অ্যাকাউন্ট আছে? <span className="underline underline-offset-2 decoration-primary-500/50">লগইন করুন</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    <Footer />
  );
}
