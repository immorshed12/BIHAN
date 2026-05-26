'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200/80 mt-16 font-sans">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        
        {/* Top section: Brand + Nav columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand column */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center select-none cursor-pointer -my-2">
              <img
                src="/logo.png"
                alt="বিহান (BIHAN)"
                className="h-16 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(15,23,42,0.03)]"
              />
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-sans">
              বিহান হলো বাংলাদেশের প্রথম প্রিমিয়াম ডিজিটাল পাঠশালা। বিকাশ ও নগদে সহজ পেমেন্টে প্রিমিয়াম পিডিএফ গাইড, ই-বুক এবং শিক্ষামূলক রিসোর্স সংগ্রহ করুন।
            </p>
            <div className="flex items-center gap-3 mt-2">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-100 hover:bg-[#1877F2]/20 border border-slate-200/60 hover:border-[#1877F2]/40 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#1877F2] transition duration-300"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-100 hover:bg-[#25D366]/20 border border-slate-200/60 hover:border-[#25D366]/40 rounded-xl flex items-center justify-center text-slate-500 hover:text-[#25D366] transition duration-300"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              {/* Email */}
              <a
                href="mailto:immorshed068@gmail.com"
                className="w-9 h-9 bg-slate-100 hover:bg-amber-500/20 border border-slate-200/60 hover:border-amber-500/40 rounded-xl flex items-center justify-center text-slate-500 hover:text-amber-600 transition duration-300"
                aria-label="ইমেইল করুন"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nav column: লাইব্রেরি */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500">লাইব্রেরি</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/#premium-catalog" className="text-xs text-slate-600 hover:text-amber-600 transition font-medium">প্রিমিয়াম গাইড</Link>
              <Link href="/#free-catalog" className="text-xs text-slate-600 hover:text-amber-600 transition font-medium">ফ্রি বই</Link>
              <Link href="/" className="text-xs text-slate-600 hover:text-amber-600 transition font-medium">সকল ক্যাটাগরি</Link>
              <Link href="/library" className="text-xs text-slate-600 hover:text-amber-600 transition font-medium">আমার শেলফ</Link>
            </nav>
          </div>

          {/* Nav column: সহায়তা */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500">সহায়তা ও যোগাযোগ</h4>
            <nav className="flex flex-col gap-2.5">
              <a href="mailto:immorshed068@gmail.com" className="text-xs text-slate-600 hover:text-amber-600 transition font-medium">সাপোর্ট ইমেইল</a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-600 hover:text-amber-600 transition font-medium">হোয়াটসঅ্যাপ সাপোর্ট</a>
              <span className="text-xs text-slate-600 font-medium">পেমেন্ট: বিকাশ / নগদ</span>
              <span className="text-xs text-slate-500 font-medium">সার্ভিস: ২৪ ঘণ্টা, ৭ দিন</span>
            </nav>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 font-sans text-center md:text-left">
            © {currentYear} বিহান (BIHAN). সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Powered by Vercel &amp; MongoDB Atlas</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-500 cursor-default select-none">গোপনীয়তা নীতি</span>
            <span className="text-[11px] text-slate-500 cursor-default select-none">পরিষেবার শর্তাবলী</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
