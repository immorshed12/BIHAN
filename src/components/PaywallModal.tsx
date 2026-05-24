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
      setErrorMsg('Please enter both your phone number and Transaction ID (TxID)');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      // Hit our pre-checkout API to create a pending Order record.
      // This will wait for the Android receiver webhook or manual admin approval.
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Simulated email verification context header
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
        throw new Error(data.error || 'Failed to submit payment details');
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
      setErrorMsg(err.message || 'Something went wrong, please try again.');
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
          className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
        />

        {/* Modal body container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg glass-panel rounded-3xl relative z-10 overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Top glowing ambient effect */}
          <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${
            gateway === 'bkash' ? 'from-pink-500 to-rose-600' : 'from-orange-500 to-amber-600'
          }`} />

          {/* Close button */}
          <button 
            onClick={() => setPaywallModalOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6 md:p-8">
            {success ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-100">TxID Registered!</h3>
                <p className="text-sm text-slate-400 max-w-sm mt-2">
                  We are reconciling your transaction ID: <strong className="text-primary-400">{txId}</strong>.
                </p>
                <div className="w-full glass-panel bg-dark-900/50 border border-white/5 rounded-2xl p-4 my-6 text-left">
                  <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2 mb-2 text-slate-400">
                    <span>STATUS</span>
                    <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                      Pending Verification
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our local automated matching system is validating the transaction. The contents will unlock automatically within seconds of payment receipt. You can also monitor your profile dashboard.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setPaywallModalOpen(false);
                    // Reload to verify if quick-approval matches
                    window.location.reload();
                  }}
                  className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition duration-300 shadow-lg shadow-primary-500/20"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">Secure Paywall Lock</span>
                <h3 className="text-2xl font-extrabold text-slate-100 mt-1">Unlock & Read</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Gain instant life-time reading access and flattened watermarked high-res PDF download of <strong>{bookTitle}</strong>.
                </p>

                {/* Gateway Switch Selector */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setGateway('bkash')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition duration-300 ${
                      gateway === 'bkash' 
                        ? 'bg-pink-500/10 border-pink-500 text-pink-400 shadow-md' 
                        : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    bKash Wallet
                  </button>
                  <button 
                    type="button"
                    onClick={() => setGateway('nagad')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition duration-300 ${
                      gateway === 'nagad' 
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-md' 
                        : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    Nagad Wallet
                  </button>
                </div>

                {/* Step-by-Step Payment Instructions */}
                <div className="glass-panel bg-dark-900/50 border border-white/5 rounded-2xl p-4 my-5 text-xs text-slate-400 flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                    <span className="font-semibold text-slate-300">Payment Steps (P2P Send Money)</span>
                    <span className="text-primary-400 font-bold">Tk {price.toLocaleString()}</span>
                  </div>
                  <p>1. Open your {gateway === 'bkash' ? 'bKash' : 'Nagad'} app or dial USSD.</p>
                  <p>2. Select <strong className="text-slate-200">Send Money</strong> (ব্যক্তিগত).</p>
                  <p>
                    3. Enter Wallet No: <strong className="text-primary-300 select-all font-mono">
                      {gateway === 'bkash' ? '01712-XXXXXX' : '01912-XXXXXX'}
                    </strong>
                  </p>
                  <p>4. Input Amount: <strong className="text-slate-200">Tk {price}</strong> and enter your PIN.</p>
                  <p>5. Copy the transaction code (<strong className="text-slate-200">TrxID/TxnID</strong>) from the success screen or SMS, and paste it below.</p>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Phone Number (paid from)
                    </label>
                    <input 
                      type="tel"
                      required
                      placeholder="e.g. 017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Transaction ID (TxID)
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 8A4B6C8D9E"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono tracking-wider"
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-rose-500 font-semibold bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl">
                      {errorMsg}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 bg-gradient-to-r text-white font-bold rounded-xl transition duration-300 shadow-lg mt-2 ${
                      gateway === 'bkash' 
                        ? 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-pink-500/10' 
                        : 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/10'
                    } flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Verifying Transaction...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        Verify Payment & Unlock
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
