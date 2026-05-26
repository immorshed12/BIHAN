'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Toasts, useToast } from '@/components/Toast';

export default function AdminDashboard() {
  const { user, setUser, logout } = useStore();
  const { toasts, addToast, dismissToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(!user);
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'logs' | 'catalog' | 'coupons'>('pending');
  const [errorMsg, setErrorMsg] = useState('');

  // Live order Activity Feed & Audio chime trackers
  const [activityFeed, setActivityFeed] = useState<string[]>([]);
  const previousPendingCountRef = useRef<number>(0);

  // Dynamic Catalog Book Form state
  const [catTitle, setCatTitle] = useState('');
  const [catAuthor, setCatAuthor] = useState('');
  const [catPrice, setCatPrice] = useState(250);
  const [catCoverImage, setCatCoverImage] = useState('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800');
  const [catFilePath, setCatFilePath] = useState('books/new-guide.pdf');
  const [catPageCount, setCatPageCount] = useState(150);
  const [catPreviewLimit, setCatPreviewLimit] = useState(4);
  const [catCategory, setCatCategory] = useState('ডিজাইন');
  const [catDescription, setCatDescription] = useState('গ্রন্থী পাবলিশার্স ডিজিটাল প্রিমিয়াম লার্নিং গাইড বুক।');
  const [catSubmitting, setCatSubmitting] = useState(false);

  // New Premium Upgrades State
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [chimeTone, setChimeTone] = useState<'royal' | 'neon'>('royal');

  // Dynamic Coupon Form state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponPercent, setCouponPercent] = useState(20);
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  // Slide-Over Drawer State for managing user book access
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedBookToGrant, setSelectedBookToGrant] = useState('');
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);

  // Dynamic Audio synthesizer chimes
  const playAudioChime = (overrideTone?: 'royal' | 'neon') => {
    try {
      const activeTone = overrideTone || chimeTone;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      if (activeTone === 'neon') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(293.66, audioCtx.currentTime); // D4
        oscillator.frequency.exponentialRampToValueAtTime(587.33, audioCtx.currentTime + 0.2); // D5
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      } else {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        oscillator.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      }

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + (activeTone === 'neon' ? 0.4 : 0.6));
    } catch (e) {
      console.warn('Audio chime failed to play:', e);
    }
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

  const fetchDashboardData = async () => {
    try {
      setErrorMsg('');
      const adminEmail = user?.email || '';
      
      const response = await fetch('/api/admin/dashboard', {
        headers: { 'x-user-email': adminEmail }
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to retrieve admin dashboard variables.');
      }
      
      const resData = await response.json();
      setData(resData);

      // Play audio chime if new order is received
      const pendingCount = resData.pendingOrders.length;
      if (pendingCount > previousPendingCountRef.current) {
        playAudioChime();
        // Append live activity feed item
        const newOrder = resData.pendingOrders[0];
        if (newOrder) {
          const feedText = `${newOrder.userName} (${newOrder.gateway}) এইমাত্র ৳ ${newOrder.amountPaid} পেমেন্ট করেছেন!`;
          setActivityFeed(prev => [feedText, ...prev.slice(0, 15)]);
        }
      }
      previousPendingCountRef.current = pendingCount;

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponsList = async () => {
    try {
      const adminEmail = user?.email || '';
      const res = await fetch('/api/admin/coupons', {
        headers: { 'x-user-email': adminEmail }
      });
      if (res.ok) {
        const d = await res.json();
        setCoupons(d.coupons || []);
      }
    } catch (e) {
      console.error('Fetch coupons list error:', e);
    }
  };

  // Re-verify session on mount to support hard page refreshes without losing Zustand state
  useEffect(() => {
    const checkAdminSession = async () => {
      if (!user) {
        try {
          const res = await fetch('/api/auth/me');
          const data = await res.json();
          if (data.user && data.user.role === 'admin' && data.user.email === 'immorshed068@gmail.com') {
            setUser(data.user);
          }
        } catch (e) {
          console.error('Session verify failed:', e);
        } finally {
          setSessionLoading(false);
        }
      } else {
        setSessionLoading(false);
      }
    };
    checkAdminSession();
  }, [user, setUser]);

  useEffect(() => {
    if (user && user.role === 'admin' && user.email === 'immorshed068@gmail.com') {
      fetchDashboardData();
      fetchCouponsList();
    }

    // Auto poll every 10 seconds to keep live feed updated
    const interval = setInterval(() => {
      if (user && user.role === 'admin' && user.email === 'immorshed068@gmail.com') {
        fetchDashboardData();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle Manual Approval Action
  const handleApprove = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/order/${orderId}/approve`, {
        method: 'POST',
        headers: { 'x-user-email': user?.email || '' }
      });
      
      if (!response.ok) throw new Error('Could not approve order');
      await fetchDashboardData();
      alert('অর্ডারটি সফলভাবে অ্যাপ্রুভ ও বই আনলক করা হয়েছে!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Manual Revocation Action
  const handleRevoke = async (userId: string, bookId: string) => {
    const targetBook = data?.catalog?.find((b: any) => b._id === bookId);
    const bookTitle = targetBook ? `"${targetBook.title}"` : 'এই বইটির';
    const confirmRevoke = window.confirm(`আপনি কি নিশ্চিতভাবে এই গ্রাহকের কাছ থেকে ${bookTitle} অ্যাক্সেস বাতিল (Revoke) করতে চান?`);
    if (!confirmRevoke) return;

    try {
      const response = await fetch(`/api/admin/user/${userId}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ bookId })
      });
      
      if (!response.ok) throw new Error('Failed to revoke access');
      
      // Update selectedUser locally so drawer refreshes immediately
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            purchasedBooks: prev.purchasedBooks.filter((b: any) => b.id !== bookId && b._id !== bookId)
          };
        });
      }

      await fetchDashboardData();
      addToast('ইউজার লাইব্রেরি অ্যাক্সেস সফলভাবে রিভোক করা হয়েছে!', 'success');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Manual Grant Access Action
  const handleGrantAccess = async (userId: string, bookId: string) => {
    if (!bookId) return;
    setIsGrantingAccess(true);
    try {
      const response = await fetch(`/api/admin/user/${userId}/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({ bookId })
      });
      
      const d = await response.json();
      if (!response.ok) throw new Error(d.error || 'Failed to grant access');
      
      // Update local selectedUser so drawer refreshes immediately
      const grantedBook = data?.catalog?.find((b: any) => b._id === bookId);
      if (selectedUser && selectedUser.id === userId && grantedBook) {
        setSelectedUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            purchasedBooks: [...prev.purchasedBooks, { id: grantedBook._id, title: grantedBook.title }]
          };
        });
      }

      await fetchDashboardData();
      setSelectedBookToGrant('');
      addToast('ইউজার লাইব্রেরি অ্যাক্সেস সফলভাবে যুক্ত করা হয়েছে!', 'success');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGrantingAccess(false);
    }
  };

  // File Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'pdf') setUploadingPdf(true);
    else setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'x-user-email': user?.email || 'immorshed068@gmail.com'
        },
        body: formData
      });

      const d = await response.json();
      if (!response.ok) throw new Error(d.error || 'ফাইল আপলোড ব্যর্থ হয়েছে।');

      if (type === 'pdf') {
        setCatFilePath(d.url);
      } else {
        setCatCoverImage(d.url);
      }
      alert('ফাইল সফলভাবে আপলোড করা হয়েছে!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      if (type === 'pdf') setUploadingPdf(false);
      else setUploadingCover(false);
    }
  };

  // Start Edit Mode
  const startEditMode = (book: any) => {
    setEditingBookId(book._id);
    setCatTitle(book.title);
    setCatAuthor(book.author);
    setCatPrice(book.price || 0);
    setIsFree(book.isFree || book.price === 0);
    setCatCoverImage(book.coverImage);
    setCatFilePath(book.filePath);
    setCatPageCount(book.pageCount);
    setCatPreviewLimit(book.previewLimit || 4);
    setCatCategory(book.category || 'ডিজাইন');
    setCatDescription(book.description || 'গ্রন্থী পাবলিশার্স ডিজিটাল প্রিমিয়াম লার্নিং গাইড বুক।');
    
    // Scroll form to view
    const formElement = document.getElementById('catalog-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Create or Update Book dynamic catalog item
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catTitle || !catAuthor || !catFilePath) {
      alert('বইয়ের শিরোনাম, লেখক এবং ফাইলপাথ বাধ্যতামূলক!');
      return;
    }

    setCatSubmitting(true);
    try {
      const url = editingBookId ? `/api/books/${editingBookId}` : '/api/books';
      const method = editingBookId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          title: catTitle,
          author: catAuthor,
          price: isFree ? 0 : catPrice,
          coverImage: catCoverImage,
          filePath: catFilePath,
          pageCount: catPageCount,
          previewLimit: catPreviewLimit,
          category: catCategory,
          description: catDescription
        })
      });

      const d = await response.json();
      if (!response.ok) throw new Error(d.error || 'Failed to save book');

      // Clear states
      setCatTitle('');
      setCatAuthor('');
      setCatPrice(250);
      setCatCoverImage('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800');
      setCatFilePath('books/new-guide.pdf');
      setCatPageCount(150);
      setCatPreviewLimit(4);
      setCatCategory('ডিজাইন');
      setCatDescription('গ্রন্থী পাবলিশার্স ডিজিটাল প্রিমিয়াম লার্নিং গাইড বুক।');
      setIsFree(false);
      setEditingBookId(null);

      alert(editingBookId ? 'ই-বুক ক্যাটালগ সফলভাবে হালনাগাদ করা হয়েছে!' : 'নতুন ই-বুক ক্যাটালগ আইটেম সফলভাবে যোগ করা হয়েছে!');
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCatSubmitting(false);
    }
  };

  // Delete Book Catalog Item
  const handleDeleteBook = async (bookId: string) => {
    const confirmDelete = window.confirm('আপনি কি নিশ্চিতভাবে এই বইটি ডিলিট করতে চান?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
        headers: { 'x-user-email': user?.email || '' }
      });

      const d = await response.json();
      if (!response.ok) throw new Error(d.error || 'Failed to delete book');

      alert('ক্যাটালগ আইটেম সফলভাবে ডিলিট করা হয়েছে!');
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create Coupon promotion code
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponPercent) {
      alert('কুপন কোড ও ছাড়ের শতকরা হার দিন!');
      return;
    }

    setCouponSubmitting(true);
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          code: couponCode,
          discountPercent: couponPercent
        })
      });

      const d = await response.json();
      if (!response.ok) throw new Error(d.error || 'Failed to create coupon');

      setCouponCode('');
      alert('নতুন প্রমো কুপন কোড সফলভাবে তৈরি করা হয়েছে!');
      fetchCouponsList();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCouponSubmitting(false);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (couponId: string) => {
    const confirmDelete = window.confirm('আপনি কি এই প্রমো কুপন কোডটি ডিলিট করতে চান?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { 'x-user-email': user?.email || '' }
      });

      if (!response.ok) throw new Error('Failed to delete coupon');

      addToast('কুপন কোড ডিলিট সফল!', 'success');
      fetchCouponsList();
    } catch (err: any) {
      addToast(err.message || 'ডিলিট করতে সমস্যা হয়েছে।', 'error');
    }
  };

  // Determine Heartbeat Status
  const getGatewayStatus = () => {
    if (!data?.gateway) return { label: 'Automation: OFFLINE', color: 'bg-rose-500' };
    const lastPing = new Date(data.gateway.lastPing).getTime();
    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - lastPing > tenMinutes) {
      return { label: 'Automation: OFFLINE (Disconnect)', color: 'bg-rose-500' };
    }
    return { label: 'Automation: ONLINE', color: 'bg-emerald-500' };
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 100% Airtight Security Enforcer Guard
  if (!user || user.role !== 'admin' || user.email !== 'immorshed068@gmail.com') {
    return (
      <main className="min-h-screen bg-radial-glow bg-dark-950 text-slate-100 flex items-center justify-center py-12 px-4 select-none">
        <div className="w-full max-w-lg glass-panel border border-rose-500/30 bg-rose-500/10 p-8 rounded-3xl flex flex-col gap-4 text-center items-center shadow-2xl shadow-rose-950/20 animate-fade-in font-sans">
          <span className="text-4xl animate-pulse">🚫</span>
          <h3 className="text-xl font-black text-rose-400 font-serif">অননুমোদিত অ্যাক্সেস (Unauthorized)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            আপনার চলমান সেশনটিতে গ্রন্থী অ্যাডমিন প্যানেল পরিচালনার অনুমতি নেই। ক্যাটালগ পরিচালনা করতে হোমপেজে ফিরে গিয়ে <strong className="text-slate-200">immorshed068@gmail.com</strong> ইমেইলটি দিয়ে ওটিপি লগইন করুন।
          </p>
          <button 
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
              } catch (e) {}
              logout();
              window.location.href = '/';
            }}
            className="w-fit px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-black transition duration-200 cursor-pointer shadow-md shadow-rose-500/10 animate-pulse"
          >
            হোমপেজে যান
          </button>
        </div>
      </main>
    );
  }

  const getCategorySuggestions = () => {
    const defaults = ["ডিজাইন", "ওয়েব ডেভেলপমেন্ট", "ফ্রিল্যান্সিং", "ক্লাসিক", "শিশুদের বই", "কবিতা", "গল্প", "উপন্যাস"];
    if (!data?.catalog) return defaults;
    const existing = data.catalog.map((b: any) => b.category).filter(Boolean);
    return Array.from(new Set([...defaults, ...existing]));
  };

  const gateway = getGatewayStatus();

  return (
    <main className="min-h-screen bg-radial-glow bg-dark-950 text-slate-100 py-12 px-4 md:px-8 relative overflow-hidden select-none">
      <div className="w-full max-w-6xl mx-auto z-10 relative flex flex-col gap-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 bg-clip-text text-transparent tracking-tight font-serif">
              বিহান কন্ট্রোল রুম (Control Room)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              স্বয়ংক্রিয় অর্ডার ট্র্যাকিং, ই-বুক পাবলিশিং CRUD, এসএমএস গেটওয়ে ও কুপন জেনারেটর প্যানেল।
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/?view=user" className="px-5 py-2.5 border border-white/10 hover:bg-white/5 rounded-2xl text-xs font-black transition cursor-pointer">
              স্টোররুমে ফিরে যান
            </Link>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-600 hover:text-white text-rose-400 rounded-2xl text-xs font-black transition cursor-pointer"
            >
              লগআউট করুন
            </button>
          </div>
        </div>

        {/* System Error warnings */}
        {errorMsg && (
          <div className="glass-panel border-rose-500/30 bg-rose-500/10 p-6 rounded-3xl flex flex-col gap-3">
            <h3 className="text-lg font-bold text-rose-400">অ্যাডমিন অ্যাক্সেস প্রয়োজন</h3>
            <p className="text-sm text-slate-500">
              আপনার সেশনটি অ্যাডমিন অ্যাক্সেসের অনুমতিপ্রাপ্ত নয়। হোমপেজে ফিরে গিয়ে <strong className="text-slate-200">immorshed068@gmail.com</strong> ইমেইলটি দিয়ে ওটিপি লগইন করুন।
            </p>
            <Link href="/" className="w-fit px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition">
              হোমপেজে যান
            </Link>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-8">
            
            {/* 📊 Vector SVG Sales Statistics & Latency Visualizer */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-dark-900/40 col-span-2 flex flex-col justify-between min-h-[220px]">
                <div className="flex justify-between items-start border-b border-white/5 pb-2 mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-black">সাপ্তাহিক সেলস ভলিউম গ্রাফ (Sales Performance)</span>
                  <span className="text-xs text-emerald-400 font-bold">৳ {data.metrics.totalRevenue} সর্বমোট</span>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* SVG Graph Visualizer */}
                  <div className="flex-grow h-32 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area path */}
                      <path 
                        d="M0 30 Q 15 15, 30 22 T 60 8 T 90 4 T 100 30 Z" 
                        fill="url(#salesGrad)" 
                      />
                      {/* Line path */}
                      <path 
                        d="M0 30 Q 15 15, 30 22 T 60 8 T 90 4" 
                        fill="none" 
                        stroke="#d97706" 
                        strokeWidth="1.2" 
                        strokeLinecap="round"
                      />
                      {/* Interaction points */}
                      <circle cx="30" cy="22" r="1.2" fill="#d97706" className="animate-ping" />
                      <circle cx="60" cy="8" r="1.2" fill="#d97706" />
                      <circle cx="90" cy="4" r="1.2" fill="#d97706" className="animate-pulse" />
                    </svg>
                    {/* Axis values labels */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between text-[9px] text-slate-500 font-bold px-1 select-none">
                      <span>শনিবার</span>
                      <span>সোমবার</span>
                      <span>বুধবার</span>
                      <span>আজ</span>
                    </div>
                  </div>

                  {/* SVG circular performance target indicator */}
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0 select-none bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/40">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="rgba(15,23,42,0.03)" strokeWidth="4" fill="transparent" />
                        <circle cx="32" cy="32" r="26" stroke="#f59e0b" strokeWidth="4" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 26} 
                          strokeDashoffset={2 * Math.PI * 26 * (1 - 0.82)} 
                          className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(245,158,11,0.45)]"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-black text-slate-100 font-mono">82%</span>
                    </div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-black text-center">আজকের টার্গেট</span>
                  </div>
                </div>
              </div>

              {/* Live Order activity logs with Web Audio triggers */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-dark-900/40 flex flex-col justify-between min-h-[220px]">
                <div className="border-b border-white/5 pb-2 mb-2 flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-black">লাইভ অর্ডার ফিড (Live Feed)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex-grow overflow-y-auto max-h-[140px] flex flex-col gap-2.5 pr-1 text-left">
                  {activityFeed.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic py-6 text-center">নতুন অর্ডারের জন্য গেটওয়ে কানেকশন অপেক্ষা করছে...</p>
                  ) : (
                    activityFeed.map((feed, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] leading-relaxed text-slate-300 animate-fade-in font-sans">
                        📢 {feed}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Metrics cards grid */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1.5 bg-dark-900/40 border border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">মোট বিক্রয় রেভিনিউ</span>
                <span className="text-2xl font-black text-slate-200 font-mono">৳ {data.metrics.totalRevenue.toLocaleString()}</span>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1.5 bg-dark-900/40 border border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">অনুমোদিত মোট অর্ডার</span>
                <span className="text-2xl font-black text-slate-200 font-mono">{data.metrics.totalApprovedOrders} Sales</span>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1.5 bg-dark-900/40 border border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">যাচাইাধীন অর্ডার ক্লেইম</span>
                <span className={`text-2xl font-black font-mono ${data.metrics.totalPendingOrders > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
                  {data.metrics.totalPendingOrders} Claims
                </span>
              </div>

              {/* Dynamic Gateway Heartbeat Tracker & Audio synth console */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-3 bg-dark-900/40 border border-white/10 relative overflow-hidden min-h-[140px]">
                {/* Sonar Ping Radar SVG background effect */}
                <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center select-none pointer-events-none">
                  {gateway.label.includes('ONLINE') ? (
                    <>
                      <span className="absolute w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-ping" />
                      <span className="absolute w-4 h-4 rounded-full bg-emerald-400/20 border border-emerald-400/40 animate-pulse" />
                    </>
                  ) : (
                    <>
                      <span className="absolute w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30" />
                      <span className="absolute w-4 h-4 rounded-full bg-rose-400/20 border border-rose-400/40 animate-pulse" />
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">লিসেনার ও সিন্থ কনসোল</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${gateway.color} ${gateway.label.includes('ONLINE') ? 'animate-pulse' : ''}`} />
                    <span className="text-[10px] font-black text-slate-200">{gateway.label}</span>
                  </div>
                </div>

                {/* Sound chime tester controls */}
                <div className="flex flex-col gap-2 border-t border-white/5 pt-2 select-none">
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                    <span>চাইম টোন টগল</span>
                    <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded border border-slate-200">
                      <button 
                        onClick={() => { setChimeTone('royal'); playAudioChime('royal'); }}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-black transition cursor-pointer ${chimeTone === 'royal' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Royal
                      </button>
                      <button 
                        onClick={() => { setChimeTone('neon'); playAudioChime('neon'); }}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-black transition cursor-pointer ${chimeTone === 'neon' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Neon
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => playAudioChime()}
                    className="w-full py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-black text-slate-300 flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    🔊 চাইম টেস্ট (Test Sound)
                  </button>
                </div>
              </div>
            </section>

            {/* Dashboard Tabs Selector */}
            <section className="flex border-b border-white/5 pb-1 gap-2 md:gap-4 overflow-x-auto select-none">
              {[
                { key: 'pending', label: `ক্লেইম অনুমোদন (${data.pendingOrders.length})` },
                { key: 'users', label: `লাইব্রেরি অ্যাক্সেস (${data.users.length})` },
                { key: 'logs', label: `গেটওয়ে এসএমএস (${data.logs.length})` },
                { key: 'catalog', label: `বই ক্যাটালগ CRUD (${data.catalog?.length || 0})` },
                { key: 'coupons', label: `কুপন ম্যানেজার (${coupons.length})` }
              ].map((tab) => (
                <button 
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-4.5 text-xs font-black border-b-2 transition duration-200 cursor-pointer whitespace-nowrap ${
                    activeTab === tab.key 
                      ? 'border-lavender text-lavender' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </section>

            {/* Tab content renderer */}
            <section className="min-h-[400px]">
              
              {/* Tab 1: Pending Claims */}
              {activeTab === 'pending' && (
                <div className="flex flex-col gap-4">
                  {data.pendingOrders.length === 0 ? (
                    <div className="glass-panel p-12 text-center text-slate-500 rounded-3xl">
                      <p className="text-sm font-semibold">কোনো ক্লেইম ভেরিফিকেশন পেন্ডিং নেই।</p>
                      <p className="text-xs text-slate-600 mt-1">সব পেমেন্ট গেটওয়ে ট্রানজেকশন সফলভাবে রিজলভড ও ক্লিয়ার করা হয়েছে।</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.pendingOrders.map((order: any) => (
                        <div key={order.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between gap-4 border border-white/5 text-left relative">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                order.gateway === 'bkash' 
                                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' 
                                  : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                              }`}>
                                {order.gateway} Wallet
                              </span>
                              <h4 className="font-bold text-slate-200 mt-2 font-serif">{order.bookTitle}</h4>
                              <p className="text-xs text-slate-400 mt-1 font-mono">User: {order.userEmail}</p>
                            </div>
                            <span className="text-sm font-extrabold text-slate-200 font-mono">৳ {order.amountPaid}</span>
                          </div>

                          <div className="glass-panel bg-dark-950/50 p-3 rounded-xl text-xs text-slate-400 flex flex-col gap-1 font-mono leading-relaxed">
                            <div>মোবাইল নং: <strong className="text-slate-200">{order.phone}</strong></div>
                            <div>কাস্টমার TxID: <strong className="text-lavender select-all font-bold tracking-widest">{order.txId}</strong></div>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-4">
                            <span className="text-[10px] text-slate-500">
                              ক্লেইম সময়: {new Date(order.createdAt).toLocaleString()}
                            </span>
                            
                            <button 
                              onClick={() => handleApprove(order.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition duration-200 cursor-pointer"
                            >
                              Approve Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: User Library Access Controller */}
              {activeTab === 'users' && (
                <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-dark-900 border-b border-white/5 text-xs text-slate-400 uppercase font-semibold">
                        <th className="p-4">কাস্টমার ইমেইল</th>
                        <th className="p-4">সিস্টেম রোল</th>
                        <th className="p-4">আনলকড ই-বুক সংখ্যা</th>
                        <th className="p-4 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {data.users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-white/5 transition">
                          <td className="p-4 font-semibold text-slate-300 font-mono">{u.email}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                u.role === 'admin' 
                                  ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400' 
                                  : 'bg-slate-500/10 border border-slate-500/30 text-slate-400'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            {u.purchasedBooks.length === 0 ? (
                              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-500 font-semibold text-[10px]">
                                কোনো বই সংগ্রহ নেই
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-lavender/10 border border-lavender/25 text-lavender font-bold text-[10px] shadow-sm shadow-lavender/5">
                                📚 {u.purchasedBooks.length}টি বই আনলকড
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setIsDrawerOpen(true);
                              }}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 text-slate-700 rounded-xl text-[10px] font-black tracking-wide border border-slate-200/80 transition duration-200 cursor-pointer shadow-sm select-none"
                            >
                              অ্যাক্সেস নিয়ন্ত্রণ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: SMS logs */}
              {activeTab === 'logs' && (
                <div className="flex flex-col gap-4 text-left">
                  <div className="text-[10px] text-slate-500 glass-panel p-4 rounded-xl border border-white/5 leading-relaxed font-sans">
                    * Highlighted in <span className="text-orange-400 font-bold">Orange</span> represent SMS logs that are unmatched in our checkout database claims. Highlighted in <span className="text-slate-300 font-bold">White</span> represent successfully reconciled transactions.
                  </div>
                  
                  <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="bg-dark-900 border-b border-white/5 text-[10px] text-slate-400 uppercase font-semibold">
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Raw Sender</th>
                          <th className="p-4">Wallet</th>
                          <th className="p-4">Received Amount</th>
                          <th className="p-4">TxID/TrxID</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {data.logs.map((log: any) => (
                          <tr key={log._id} className={`hover:bg-white/5 transition ${
                            log.isMatched ? 'text-slate-300' : 'bg-orange-500/5 text-orange-700 font-bold'
                          }`}>
                            <td className="p-4 text-[10px] text-slate-500">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4 font-bold">{log.senderNumber}</td>
                            <td className="p-4">{log.parsedSender}</td>
                            <td className="p-4 font-bold text-slate-100">Tk {log.parsedAmount}</td>
                            <td className="p-4 font-bold text-lavender tracking-wider select-all">{log.parsedTxID}</td>
                            <td className="p-4">
                              {log.isMatched ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Reconciled
                                </span>
                              ) : (
                                <span className="text-orange-400 font-bold flex items-center gap-1 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                  Unclaimed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Dynamic Catalog Book CRUD Panel */}
              {activeTab === 'catalog' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                  
                  {/* Create / Edit Book form */}
                  <div id="catalog-form-container" className="glass-panel p-6 rounded-3xl border border-white/5 bg-dark-900/40 flex flex-col gap-4">
                    <h3 className="text-base font-black text-slate-200 font-serif">
                      {editingBookId ? 'ই-বুক ক্যাটালগ এডিট করুন' : 'নতুন ই-বুক পাবলিশ করুন'}
                    </h3>

                    {/* Edit mode cancel panel */}
                    {editingBookId && (
                      <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                        <span className="text-[10px] text-amber-400 font-bold">⚠️ আপনি এডিট মোডে আছেন</span>
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingBookId(null);
                            setCatTitle('');
                            setCatAuthor('');
                            setCatPrice(250);
                            setCatCoverImage('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800');
                            setCatFilePath('books/new-guide.pdf');
                            setCatPageCount(150);
                            setCatPreviewLimit(4);
                            setCatCategory('ডিজাইন');
                            setCatDescription('গ্রন্থী পাবলিশার্স ডিজিটাল প্রিমিয়াম লার্নিং গাইড বুক।');
                            setIsFree(false);
                          }}
                          className="text-[9px] bg-amber-500/20 hover:bg-amber-500 text-slate-900 font-black px-2.5 py-0.5 rounded transition cursor-pointer"
                        >
                          বাতিল করুন
                        </button>
                      </div>
                    )}
                    
                    <form onSubmit={handleSaveBook} className="flex flex-col gap-3 text-xs font-sans">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                          <label>বইয়ের শিরোনাম</label>
                          <span>{catTitle.length} / 80</span>
                        </div>
                        <input 
                          type="text"
                          required
                          maxLength={80}
                          value={catTitle}
                          onChange={(e) => setCatTitle(e.target.value)}
                          placeholder="উদা. ইউআই/ইউএক্স ডিজাইন গাইড"
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                          <label>লেখক</label>
                          <span>{catAuthor.length} / 50</span>
                        </div>
                        <input 
                          type="text"
                          required
                          maxLength={50}
                          value={catAuthor}
                          onChange={(e) => setCatAuthor(e.target.value)}
                          placeholder="উদা. গ্রন্থী পাবলিশার্স"
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[9px] uppercase font-bold text-slate-400">
                          <label>বইয়ের বিবরণ (Description)</label>
                          <span className={catDescription.length > 400 ? 'text-amber-400' : ''}>{catDescription.length} / 500</span>
                        </div>
                        <textarea 
                          required
                          maxLength={500}
                          value={catDescription}
                          onChange={(e) => setCatDescription(e.target.value)}
                          placeholder="বইয়ের সংক্ষিপ্ত ভূমিকা বা বিবরণ লিখুন..."
                          rows={3}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-sans resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">ক্যাটাগরি</label>
                          <input 
                            type="text"
                            required
                            list="categories-list"
                            value={catCategory}
                            onChange={(e) => setCatCategory(e.target.value)}
                            placeholder="সিলেক্ট বা টাইপ করুন..."
                            className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-slate-300"
                          />
                          <datalist id="categories-list">
                            {getCategorySuggestions().map((cat) => (
                              <option key={cat} value={cat} />
                            ))}
                          </datalist>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] uppercase font-bold text-slate-400">বইয়ের ধরণ</label>
                          <div className="grid grid-cols-2 gap-1 bg-dark-950/50 p-1 rounded-xl border border-white/5">
                            <button
                              type="button"
                              onClick={() => setIsFree(true)}
                              className={`py-1 text-[10px] font-black rounded-lg transition cursor-pointer ${
                                isFree 
                                  ? 'bg-emerald-500/25 border border-emerald-500/30 text-emerald-400' 
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              ফ্রি
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsFree(false)}
                              className={`py-1 text-[10px] font-black rounded-lg transition cursor-pointer ${
                                !isFree 
                                  ? 'bg-primary-500/25 border border-primary-500/30 text-primary-400' 
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              প্রিমিয়াম
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className={`flex flex-col gap-1 ${isFree ? 'col-span-2' : ''}`}>
                          <label className="text-[9px] uppercase font-bold text-slate-400">মূল্য (৳)</label>
                          <input 
                            type="number"
                            required
                            disabled={isFree}
                            value={isFree ? 0 : catPrice}
                            onChange={(e) => setCatPrice(Number(e.target.value))}
                            className={`w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-center font-bold ${
                              isFree ? 'opacity-40 cursor-not-allowed select-none' : ''
                            }`}
                          />
                        </div>

                        {!isFree && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-400">প্রিভিউ লিমিট (পৃষ্ঠা)</label>
                            <input 
                              type="number"
                              required
                              value={catPreviewLimit}
                              onChange={(e) => setCatPreviewLimit(Number(e.target.value))}
                              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-center font-bold"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">কভার ইমেজ থাম্বনেইল</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            required
                            value={catCoverImage}
                            onChange={(e) => setCatCoverImage(e.target.value)}
                            placeholder="ইউআরএল বা আপলোড করুন"
                            className="flex-grow glass-input px-3.5 py-2.5 rounded-xl text-xs"
                          />
                          <label className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black transition flex items-center justify-center cursor-pointer select-none">
                            {uploadingCover ? '...' : 'আপলোড'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleFileUpload(e, 'cover')} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">পিডিএফ ফাইল (FilePath)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            required
                            value={catFilePath}
                            onChange={(e) => setCatFilePath(e.target.value)}
                            placeholder="ফাইলপাথ বা আপলোড করুন"
                            className="flex-grow glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                          />
                          <label className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black transition flex items-center justify-center cursor-pointer select-none">
                            {uploadingPdf ? '...' : 'আপলোড'}
                            <input 
                              type="file" 
                              accept=".pdf" 
                              onChange={(e) => handleFileUpload(e, 'pdf')} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">মোট পৃষ্ঠা সংখ্যা</label>
                        <input 
                          type="number"
                          required
                          value={catPageCount}
                          onChange={(e) => setCatPageCount(Number(e.target.value))}
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-center"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={catSubmitting}
                        className="w-full py-3.5 bg-gradient-to-r from-lavender to-indigo-600 hover:from-lavender/90 hover:to-indigo-700 text-velvet font-black rounded-xl text-xs transition duration-200 mt-2 cursor-pointer"
                      >
                        {editingBookId 
                          ? (catSubmitting ? 'আপডেট হচ্ছে...' : 'ই-বুক ক্যাটালগ হালনাগাদ করুন')
                          : (catSubmitting ? 'প্রক্রিয়াধীন...' : 'ক্যাটালগে বই যোগ করুন')
                        }
                      </button>
                    </form>

                  </div>

                  {/* Catalog display lists */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-dark-900/40 lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-base font-black text-slate-200 font-serif">সচল ই-বুক ক্যাটালগ</h3>
                    
                    <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                      {data.catalog.map((book: any) => (
                        <div key={book._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-4 font-sans text-xs">
                          <div className="flex gap-4 items-center min-w-0">
                            <div className="w-8 h-11 bg-white/5 rounded border border-white/10 flex-shrink-0 flex items-center justify-center font-serif text-[6px] text-white/50">{book.title}</div>
                            <div className="flex flex-col min-w-0 text-left">
                              <h4 className="font-extrabold text-slate-200 truncate">{book.title}</h4>
                              <span className="text-[10px] text-slate-500 mt-0.5">{book.author} • {book.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-mono font-bold text-slate-200 mr-2">
                              {book.isFree ? <span className="text-emerald-400">ফ্রি</span> : `৳ ${book.price}`}
                            </span>
                            <button
                              onClick={() => startEditMode(book)}
                              className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500 hover:text-dark-950 border border-amber-500/20 text-amber-400 hover:text-slate-900 flex items-center justify-center transition cursor-pointer text-xs font-black"
                              title="তথ্য এডিট করুন"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book._id)}
                              className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-500 flex items-center justify-center transition cursor-pointer"
                              title="ক্যাটালগ থেকে বাদ দিন"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 5: Coupon promotions Tab panel */}
              {activeTab === 'coupons' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                  
                  {/* Create Coupon form */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-dark-900/40 flex flex-col gap-4">
                    <h3 className="text-base font-black text-slate-200 font-serif">প্রমোশনাল কুপন কোড জেনারেটর</h3>
                    
                    <form onSubmit={handleCreateCoupon} className="flex flex-col gap-4 text-xs font-sans">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase font-bold text-slate-400">কুপন কোড (Coupon Code)</label>
                        <input 
                          type="text"
                          required
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="উদা. GRONTHI50"
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase font-black tracking-widest text-center"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase font-bold text-slate-400">ডিসকাউন্ট হার (শতকরা %)</label>
                        <input 
                          type="number"
                          required
                          value={couponPercent}
                          onChange={(e) => setCouponPercent(Number(e.target.value))}
                          placeholder="উদা. ৫০"
                          className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-center font-bold"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={couponSubmitting}
                        className="w-full py-3.5 bg-gradient-to-r from-lavender to-indigo-600 hover:from-lavender/90 hover:to-indigo-700 text-velvet font-black rounded-xl text-xs transition duration-200 cursor-pointer"
                      >
                        {couponSubmitting ? 'জেনারেট হচ্ছে...' : 'কুপন কোড অ্যাক্টিভ করুন'}
                      </button>
                    </form>
                  </div>

                  {/* Active coupons lists display */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-dark-900/40 lg:col-span-2 flex flex-col gap-4">
                    <h3 className="text-base font-black text-slate-200 font-serif">সচল ওটিপি প্রমো কুপন কোড সমূহ</h3>
                    
                    <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                      {coupons.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-8 text-center">কোনো কুপন কোড জেনারেট করা নেই।</p>
                      ) : (
                        coupons.map((coupon: any) => (
                          <div key={coupon._id} className="p-4 rounded-2xl bg-dark-950/40 border border-white/5 flex items-center justify-between gap-4 font-sans text-xs">
                            <div className="flex gap-4 items-center">
                              <span className="px-3.5 py-1.5 rounded-lg bg-lavender/10 border border-lavender/25 text-lavender font-mono font-black uppercase tracking-wider text-xs">{coupon.code}</span>
                              <div className="flex flex-col text-left">
                                <span className="font-extrabold text-slate-200">{coupon.discountPercent}% ছাড় (Discount)</span>
                                <span className="text-[10px] text-slate-500 mt-0.5">মেয়াদ থাকবে: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-500 flex items-center justify-center transition cursor-pointer"
                              title="কুপন ডিলিট"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

            </section>
          </div>
        )}
      {/* ═══ USER ACCESS MANAGER SLIDE-OVER DRAWER ═══ */}
      {isDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          {/* Backdrop overlay */}
          <div 
            onClick={() => {
              setIsDrawerOpen(false);
              setSelectedUser(null);
            }}
            className="absolute inset-0 bg-velvet/80 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer Body Panel */}
          <div className="relative w-full max-w-md h-full bg-white border-l border-gray-200 shadow-2xl p-6 flex flex-col gap-6 z-10 transition-transform duration-300 transform translate-x-0 overflow-y-auto">
            {/* Top accent glow line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="text-left">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] font-mono">◈ কাস্টমার লাইব্রেরি অ্যাক্সেস</span>
                <h3 className="text-sm font-black text-slate-900 font-serif mt-1 truncate max-w-[280px]">
                  {selectedUser.email}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSelectedUser(null);
                }}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition border border-gray-200 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Body Section 1: Active Access List */}
            <div className="flex flex-col gap-3 text-left">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">আনলকড বইয়ের তালিকা</span>
              
              {selectedUser.purchasedBooks.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl bg-velvet/20 text-xs">
                  কোনো প্রিমিয়াম বই আনলক করা নেই।
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedUser.purchasedBooks.map((b: any) => {
                    const catalogBook = data?.catalog?.find((cb: any) => cb._id === b.id || cb._id === b._id);
                    return (
                      <div 
                        key={b.id || b._id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-11 bg-white/5 rounded border border-white/10 flex-shrink-0 flex items-center justify-center font-serif text-[6px] text-white/50 text-center overflow-hidden p-0.5 select-none">
                            {catalogBook?.coverImage ? (
                              <img src={catalogBook.coverImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              b.title
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 text-left">
                            <h4 className="text-xs font-black text-slate-200 truncate max-w-[200px]">{b.title}</h4>
                            <span className="text-[9px] text-slate-500 font-semibold mt-0.5">{catalogBook?.author || 'গ্রন্থী গাইড'}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRevoke(selectedUser.id, b.id || b._id)}
                          className="w-7 h-7 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center justify-center border border-rose-500/15 transition cursor-pointer text-xs"
                          title="অ্যাক্সেস রিভোক করুন"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Body Section 2: Grant Access Panel */}
            <div className="flex flex-col gap-3.5 border-t border-white/5 pt-4 text-left font-sans">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">নতুন বইয়ের অ্যাক্সেস দিন</span>
              
              {(() => {
                // Filter catalog to show books this user doesn't already own
                const unownedBooks = data?.catalog?.filter((cb: any) => 
                  !selectedUser.purchasedBooks.some((pub: any) => pub.id === cb._id || pub._id === cb._id)
                ) || [];

                return unownedBooks.length === 0 ? (
                  <p className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    ✓ সব ক্যাটালগ বই ইতিমধ্যেই এই গ্রাহকের কাছে আনলকড আছে।
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <select
                      value={selectedBookToGrant}
                      onChange={(e) => setSelectedBookToGrant(e.target.value)}
                      className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black text-slate-800 outline-none focus:border-indigo-600 cursor-pointer shadow-lg shadow-slate-100"
                    >
                      <option value="" className="bg-white text-slate-800">-- বই সিলেক্ট করুন --</option>
                      {unownedBooks.map((cb: any) => (
                        <option key={cb._id} value={cb._id} className="bg-white text-slate-800">
                          {cb.title} (৳ {cb.price || 0})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={!selectedBookToGrant || isGrantingAccess}
                      onClick={() => handleGrantAccess(selectedUser.id, selectedBookToGrant)}
                      className="w-full py-3.5 bg-gradient-to-r from-lavender to-indigo-600 hover:from-white hover:to-white hover:text-velvet text-white font-black text-xs rounded-2xl transition duration-300 shadow-lg shadow-lavender/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isGrantingAccess ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-slate-500 rounded-full animate-spin" />
                          অ্যাক্সেস যোগ হচ্ছে...
                        </>
                      ) : 'বইয়ের অ্যাক্সেস দিন (Grant Access) ⚡'}
                    </button>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}
      </div>
      <Toasts toasts={toasts} dismissToast={dismissToast} />
    </main>
  );
}
