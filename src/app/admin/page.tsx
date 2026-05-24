'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

export default function AdminDashboard() {
  const { user } = useStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'logs' | 'catalog'>('pending');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Catalog Form state
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState(100);
  const [newPath, setNewPath] = useState('books/new-guide.pdf');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'x-user-email': user?.email || 'admin@example.com' // Send current admin header
        }
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to retrieve admin dashboard variables.');
      }
      
      const resData = await response.json();
      setData(resData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Handle Manual Approval Action
  const handleApprove = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/order/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'x-user-email': user?.email || 'admin@example.com'
        }
      });
      
      if (!response.ok) throw new Error('Could not approve order');
      
      // Re-fetch data
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Manual Revocation Action
  const handleRevoke = async (userId: string, bookId: string) => {
    try {
      const response = await fetch(`/api/admin/user/${userId}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || 'admin@example.com'
        },
        body: JSON.stringify({ bookId })
      });
      
      if (!response.ok) throw new Error('Failed to revoke access');
      
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
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

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const gateway = getGatewayStatus();

  return (
    <main className="min-h-screen bg-radial-glow bg-dark-950 text-slate-100 py-12 px-4 md:px-8 relative overflow-hidden">
      <div className="w-full max-w-6xl mx-auto z-10 relative flex flex-col gap-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-100 to-primary-400 bg-clip-text text-transparent tracking-tight">
              Control Room
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Admin Manual Fallbacks, P2P Heartbeat Monitoring, and Audit Logs.
            </p>
          </div>
          
          <Link href="/" className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-xs transition duration-200">
            Return to Store
          </Link>
        </div>

        {/* System Error warnings */}
        {errorMsg && (
          <div className="glass-panel border-rose-500/30 bg-rose-500/10 p-6 rounded-3xl flex flex-col gap-3">
            <h3 className="text-lg font-bold text-rose-400">Privileges Required</h3>
            <p className="text-sm text-slate-400">
              Your logged-in session does not have administrative rights. Go back to the homepage and input an email containing &quot;admin&quot; (e.g., admin@example.com) to instantly view these controls.
            </p>
            <Link href="/" className="w-fit px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition">
              Simulate Login
            </Link>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-8">
            
            {/* System Status Cards grid */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Sales Revenue Metric */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1.5 relative overflow-hidden">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Total Net Sales</span>
                <span className="text-2xl font-black text-slate-200">Tk {data.metrics.totalRevenue.toLocaleString()}</span>
                <div className="absolute right-4 bottom-4 text-emerald-500/15">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007v.008H3.75V4.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3 19.5h18M18 19.5h3.75M18 19.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-10.5 0h.008v.008H7.5v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
              </div>

              {/* Total Approved Downloads */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1.5 relative overflow-hidden">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Total Handshakes</span>
                <span className="text-2xl font-black text-slate-200">{data.metrics.totalApprovedOrders} Sales</span>
                <div className="absolute right-4 bottom-4 text-primary-500/15">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
              </div>

              {/* Unverified pending claims */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1.5 relative overflow-hidden">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Pending Claims</span>
                <span className="text-2xl font-black text-amber-400">{data.metrics.totalPendingOrders} Claims</span>
                <div className="absolute right-4 bottom-4 text-amber-500/15">
                  <span className="w-3 h-3 bg-amber-400 rounded-full animate-ping absolute right-0" />
                </div>
              </div>

              {/* Dynamic Gateway Heartbeat Tracker */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between gap-3 relative overflow-hidden border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Android Status</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${gateway.color} ${gateway.label.includes('ONLINE') ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-bold text-slate-300">{gateway.label}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">
                  {data.gateway ? (
                    <>
                      Device: <strong className="text-slate-200 font-mono">{data.gateway.deviceId}</strong><br />
                      Last Heartbeat: <span className="text-slate-300 font-semibold">{new Date(data.gateway.lastPing).toLocaleTimeString()}</span>
                    </>
                  ) : (
                    'No gateway pings recorded yet.'
                  )}
                </div>
              </div>

            </section>

            {/* Dashboard Tabs Selector */}
            <section className="flex border-b border-white/5 pb-1 gap-4">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-4 text-sm font-bold border-b-2 transition duration-200 ${
                  activeTab === 'pending' 
                    ? 'border-primary-500 text-primary-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Pending Verification ({data.pendingOrders.length})
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`py-2 px-4 text-sm font-bold border-b-2 transition duration-200 ${
                  activeTab === 'users' 
                    ? 'border-primary-500 text-primary-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                User Library Access ({data.users.length})
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`py-2 px-4 text-sm font-bold border-b-2 transition duration-200 ${
                  activeTab === 'logs' 
                    ? 'border-primary-500 text-primary-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Gateway SMS Logs ({data.logs.length})
              </button>
            </section>

            {/* Tab content renderer */}
            <section className="min-h-[400px]">
              
              {/* Tab 1: Pending Verification List */}
              {activeTab === 'pending' && (
                <div className="flex flex-col gap-4">
                  {data.pendingOrders.length === 0 ? (
                    <div className="glass-panel p-12 text-center text-slate-400 rounded-3xl">
                      <p className="text-sm font-semibold">Zero pending claims registered.</p>
                      <p className="text-xs text-slate-500 mt-1">All customer payments are successfully synchronized or cleared.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.pendingOrders.map((order: any) => (
                        <div key={order.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between gap-4 border border-white/5 relative">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                order.gateway === 'bkash' 
                                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' 
                                  : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                              }`}>
                                {order.gateway} Wallet
                              </span>
                              <h4 className="font-bold text-slate-200 mt-2">{order.bookTitle}</h4>
                              <p className="text-xs text-slate-400 mt-1">User: {order.userEmail}</p>
                            </div>
                            <span className="text-sm font-extrabold text-slate-200">Tk {order.amountPaid}</span>
                          </div>

                          <div className="glass-panel bg-dark-950/50 p-3 rounded-xl text-xs text-slate-400 flex flex-col gap-1 font-mono">
                            <div>Phone No: <strong className="text-slate-200">{order.phone}</strong></div>
                            <div>TrxID/TxID: <strong className="text-primary-300 select-all font-bold">{order.txId}</strong></div>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-4">
                            <span className="text-[10px] text-slate-500">
                              Claimed: {new Date(order.createdAt).toLocaleString()}
                            </span>
                            
                            <button 
                              onClick={() => handleApprove(order.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition duration-200"
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
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-dark-900 border-b border-white/5 text-xs text-slate-400 uppercase font-semibold">
                        <th className="p-4">Customer Email</th>
                        <th className="p-4">Simulated Role</th>
                        <th className="p-4">Unlocked Catalog items</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-white/5 transition">
                          <td className="p-4 font-semibold text-slate-300">{u.email}</td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.role === 'admin' 
                                ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400' 
                                : 'bg-slate-500/10 border border-slate-500/30 text-slate-400'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4">
                            {u.purchasedBooks.length === 0 ? (
                              <span className="text-xs text-slate-500">No guides unlocked yet</span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {u.purchasedBooks.map((b: any) => (
                                  <div 
                                    key={b.id}
                                    className="bg-dark-900 border border-white/5 px-2.5 py-1 rounded-lg text-xs text-slate-300 flex items-center gap-1.5"
                                  >
                                    <span className="truncate max-w-[120px]">{b.title}</span>
                                    <button 
                                      onClick={() => handleRevoke(u.id, b.id)}
                                      className="text-rose-500 hover:text-rose-400 font-bold ml-1.5 focus:outline-none"
                                      title="Revoke access"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-right text-xs text-slate-500">
                            Registered {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Gateway Webhook logs */}
              {activeTab === 'logs' && (
                <div className="flex flex-col gap-4">
                  <div className="text-xs text-slate-400 glass-panel p-4 rounded-xl border border-white/5">
                    *Highlighting unmatched logs (pushed by phone SMS, but no claiming order exists on storefront yet) in <span className="text-orange-400 font-bold">Orange</span>. Highlighting matched reconciled transactions in <span className="text-emerald-400 font-bold">Green</span>.
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
                            log.isMatched ? 'text-slate-300' : 'bg-orange-500/5 text-orange-200'
                          }`}>
                            <td className="p-4 text-[10px] text-slate-500">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4 font-bold">{log.senderNumber}</td>
                            <td className="p-4">{log.parsedSender}</td>
                            <td className="p-4 font-bold text-slate-100">Tk {log.parsedAmount}</td>
                            <td className="p-4 font-bold text-primary-400">{log.parsedTxID}</td>
                            <td className="p-4">
                              {log.isMatched ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  Matched Reconciled
                                </span>
                              ) : (
                                <span className="text-orange-400 font-bold flex items-center gap-1 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                  Unclaimed Money
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

            </section>
          </div>
        )}
      </div>
    </main>
  );
}
