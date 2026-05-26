'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

interface PaywallModalProps {
  bookId: string;
  bookTitle: string;
  price: number;
}

export default function PaywallModal({ bookId, bookTitle, price }: PaywallModalProps) {
  const { paywallModalOpen, setPaywallModalOpen, user, setActiveOrder } = useStore();
  const [gateway, setGateway] = useState<'bkash' | 'nagad'>('bkash');
  const [phone, setPhone] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!paywallModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !txId) {
      setErrorMsg('অনুগ্রহ করে মোবাইল নম্বর এবং Transaction ID (TxID) উভয়ই লিখুন।');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      // Hit our pre-checkout API to create a pending Order record.
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || 'guest@example.com',
        },
        body: JSON.stringify({
          bookId,
          amountPaid: price,
          paymentGateway: gateway,
          customerPhone: phone,
          submittedTxID: txId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'পেমেন্ট ডিটেইলস সাবমিট করতে ব্যর্থ হয়েছে');
      }

      setSuccess(true);
      setActiveOrder({
        orderId: data.orderId,
        bookId,
        amount: price,
        submittedTxID: txId,
        gateway,
        status: 'pending',
      });
    } catch (err: any) {
      console.error('Payment submission error:', err);
      setErrorMsg(err.message || 'সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop blur overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setPaywallModalOpen(false)}
          className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        />

        {/* Modal body container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-white rounded-3xl relative z-10 overflow-hidden shadow-2xl border border-slate-200 text-left"
        >
          {/* Top glowing ambient effect */}
          <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${
            gateway === 'bkash' ? 'from-pink-500 to-rose-600' : 'from-orange-500 to-amber-600'
          }`} />

          {/* Close button */}
          <button 
            onClick={() => setPaywallModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition cursor-pointer border border-slate-200/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6 md:p-8">
            {success ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">TxID রেজিস্টার করা হয়েছে!</h3>
                <p className="text-sm text-slate-600 max-w-sm mt-2">
                  আমরা আপনার ট্রানজেকশন আইডি: <strong className="text-amber-600 font-bold">{txId}</strong> ভেরিফাই করছি।
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-6 text-left shadow-inner shadow-slate-100/55">
                  <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2 mb-2 text-slate-500">
                    <span>স্ট্যাটাস</span>
                    <span className="font-semibold text-amber-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                      ভেরিফিকেশন অপেক্ষমান
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    আমাদের স্বয়ংক্রিয় ম্যাচিং সিস্টেম ট্রানজেকশনটি যাচাই করছে। পেমেন্ট নিশ্চিত হওয়ার কয়েক সেকেন্ডের মধ্যে বইটি স্বয়ংক্রিয়ভাবে আনলক হয়ে যাবে। আপনি আপনার প্রোফাইল ড্যাশবোর্ড থেকেও এটি ট্র্যাক করতে পারবেন।
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setPaywallModalOpen(false);
                    window.location.reload();
                  }}
                  className="px-6 py-2.5 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 font-semibold rounded-xl transition duration-300 shadow-sm cursor-pointer"
                >
                  মূল পাতায় ফিরে যান
                </button>
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">নিরাপদ পেমেন্ট গেটওয়ে</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">আনলক ও রিড করুন</h3>
                <p className="text-sm text-slate-600 mt-2 font-sans">
                  <strong>{bookTitle}</strong> বইটি সম্পূর্ণ পড়তে এবং ওয়াটারমার্ক ছাড়া হাই-রেজোলিউশন PDF ডাউনলোড পেতে পেমেন্ট সম্পন্ন করুন।
                </p>

                {/* Gateway Switch Selector */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setGateway('bkash')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition duration-300 ${
                      gateway === 'bkash' 
                        ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-sm font-bold' 
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    বিকাশ (bKash)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setGateway('nagad')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition duration-300 ${
                      gateway === 'nagad' 
                        ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm font-bold' 
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    নগদ (Nagad)
                  </button>
                </div>

                {/* Step-by-Step Payment Instructions */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-5 text-xs text-slate-650 flex flex-col gap-2 shadow-inner shadow-slate-100/50">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                    <span className="font-semibold text-slate-700">পেমেন্ট করার নিয়ম (P2P Send Money)</span>
                    <span className="text-amber-600 font-bold">৳ {price.toLocaleString()}</span>
                  </div>
                  <p>১. আপনার {gateway === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাপ অথবা USSD কোড ডায়াল করুন।</p>
                  <p>২. <strong className="text-slate-800">Send Money</strong> (ব্যক্তিগত) অপশনটি নির্বাচন করুন।</p>
                  <p>
                    ৩. প্রাপক নম্বর দিন: <strong className="text-amber-600 select-all font-mono font-bold">
                      01832984186
                    </strong>
                  </p>
                  <p>৪. অ্যামাউন্ট দিন: <strong className="text-slate-800 font-bold">৳ {price}</strong> এবং আপনার PIN দিয়ে সম্পন্ন করুন।</p>
                  <p>৫. পেমেন্ট শেষে পাওয়া ট্রানজেকশন কোড (<strong className="text-slate-850 font-bold">TrxID/TxnID</strong>) কপি করে নিচে দিন।</p>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      যে নম্বর থেকে টাকা পাঠিয়েছেন
                    </label>
                    <input 
                      type="tel"
                      required
                      placeholder="উদা. 017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl text-sm focus:border-amber-500 focus:outline-none text-slate-850 placeholder-slate-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      ট্রানজেকশন আইডি (TxID)
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="উদা. 8A4B6C8D9E"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      className="w-full border border-slate-200 bg-slate-50 px-4 py-3 rounded-xl text-sm font-mono tracking-wider focus:border-amber-500 focus:outline-none text-slate-850 placeholder-slate-400 font-bold"
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-rose-650 font-semibold bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl">
                      {errorMsg}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 text-white font-bold rounded-xl transition duration-300 shadow-lg mt-2 cursor-pointer ${
                      gateway === 'bkash' 
                        ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/10' 
                        : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/10'
                    } flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        যাচাই করা হচ্ছে...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
    </AnimatePresence>
  );
}
