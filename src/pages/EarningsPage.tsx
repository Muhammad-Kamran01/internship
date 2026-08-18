import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { proposalService } from '../services/supabase/proposalService';
import { useAuth } from '../context/AuthContext';
import { EarningRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  DollarSign,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield,
  Briefcase,
  Sparkles,
  Download,
  AlertCircle,
  Building2,
  Smartphone,
} from 'lucide-react';

export const EarningsPage: React.FC = () => {
  const { user } = useAuth();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [earningsData, setEarningsData] = useState<{
    totalEarnings: number;
    completedEarnings: number;
    pendingEarnings: number;
    availableBalance: number;
    records: EarningRecord[];
  }>({
    totalEarnings: 0,
    completedEarnings: 0,
    pendingEarnings: 0,
    availableBalance: 0,
    records: [],
  });

  const [loading, setLoading] = useState(true);

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'jazzcash' | 'easypaisa' | 'stripe'>('bank');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [providerName, setProviderName] = useState('HBL');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    if (user) loadEarnings();
  }, [user]);

  const loadEarnings = async () => {
    if (!user) return;
    setLoading(true);
    const data = await proposalService.getEarningsForFreelancer(user.id);
    setEarningsData(data);
    setWithdrawAmount(data.availableBalance);
    setLoading(false);
  };

  const handleSelectMethod = (method: 'bank' | 'jazzcash' | 'easypaisa' | 'stripe') => {
    setWithdrawMethod(method);
    if (method === 'bank') setProviderName('HBL');
    else if (method === 'jazzcash') setProviderName('JazzCash');
    else if (method === 'easypaisa') setProviderName('EasyPaisa');
    else if (method === 'stripe') setProviderName('Stripe');
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > earningsData.availableBalance) {
      alert('Invalid withdrawal amount. Must be greater than 0 and not exceed available balance.');
      return;
    }
    if (!providerName.trim()) {
      alert('Please enter Bank Name / Mobile Service Provider.');
      return;
    }
    if (!accountTitle.trim()) {
      alert('Please enter Account Title / Name on Account.');
      return;
    }
    if (!accountNumber.trim()) {
      alert('Please enter Account / Mobile Number.');
      return;
    }

    setWithdrawSuccess(true);
    try {
      if (user) {
        await proposalService.processWithdrawal({
          freelancerId: user.id,
          amount: withdrawAmount,
          payoutMethod: withdrawMethod,
          providerName: providerName.trim(),
          accountTitle: accountTitle.trim(),
          accountNumber: accountNumber.trim(),
        });
      }
      setTimeout(async () => {
        setWithdrawSuccess(false);
        setShowWithdrawModal(false);
        setAccountTitle('');
        setAccountNumber('');
        await loadEarnings();
        alert(
          `✅ Payout request of PKR ${withdrawAmount.toLocaleString()} submitted successfully to ${providerName} (${accountNumber}). Funds will arrive in 24-48 hours.`
        );
      }, 1200);
    } catch (err: any) {
      setWithdrawSuccess(false);
      alert('Error processing withdrawal: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar className="hidden lg:flex shrink-0 border-r border-slate-200/80 sticky top-0 h-screen" />

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/50 backdrop-blur-xs">
          <Sidebar
            className="w-72 h-full shadow-2xl"
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenHelp={() => setShowWelcomeModal(true)}
          title="Earnings & Financials"
          subtitle="Track project payouts, manage available balance, and request payouts"
        />

        <OnboardingModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          role="freelancer"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Financial Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Earnings */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Net Earnings</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {formatCurrency(earningsData.totalEarnings)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold block">
                ↑ Lifetime Earnings
              </span>
            </div>

            {/* Available Balance */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-md space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-indigo-200">
                <span className="text-[10px] font-bold uppercase tracking-wider">Available Balance</span>
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </div>
              <p className="text-2xl font-black text-white">
                {formatCurrency(earningsData.availableBalance)}
              </p>
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={earningsData.availableBalance <= 0}
                className="mt-2 w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Withdraw Funds
              </button>
            </div>

            {/* Pending Escrow */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {formatCurrency(earningsData.pendingEarnings)}
              </p>
              <span className="text-[10px] text-slate-500 font-medium block">
                Released upon student work approval
              </span>
            </div>

            {/* Completed Projects */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Completed Tasks</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {earningsData.records.filter((r) => r.status === 'Available').length}
              </p>
              <span className="text-[10px] text-blue-600 font-bold block">
                100% Academic Satisfaction
              </span>
            </div>
          </div>

          {/* Earnings History Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> Transaction & Payment History
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {earningsData.records.length} Records
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Loading earnings history...
              </div>
            ) : earningsData.records.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-slate-400">
                <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold">No earnings records found yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="py-3 px-2">Project Title</th>
                      <th className="py-3 px-2">Date Completed</th>
                      <th className="py-3 px-2">Amount</th>
                      <th className="py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {earningsData.records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-2 font-bold text-slate-900">
                          {rec.project_title}
                        </td>
                        <td className="py-3.5 px-2 text-slate-600 font-medium">
                          {formatDate(rec.completed_at)}
                        </td>
                        <td className="py-3.5 px-2 font-black text-emerald-700">
                          {formatCurrency(rec.amount)}
                        </td>
                        <td className="py-3.5 px-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              rec.status === 'Available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Withdraw Funds Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Withdraw Earnings
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Available Balance: {formatCurrency(earningsData.availableBalance)}
                </label>
                <input
                  type="number"
                  max={earningsData.availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectMethod('bank')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      withdrawMethod === 'bank'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" /> Bank Wire
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectMethod('jazzcash')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      withdrawMethod === 'jazzcash'
                        ? 'bg-red-50 border-red-600 text-red-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-red-600 shrink-0" /> JazzCash
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectMethod('easypaisa')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      withdrawMethod === 'easypaisa'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" /> EasyPaisa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectMethod('stripe')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      withdrawMethod === 'stripe'
                        ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-purple-600 shrink-0" /> Stripe / Card
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Bank Name / Mobile Service Provider
                </label>
                <input
                  type="text"
                  placeholder="e.g. HBL, JazzCash, EasyPaisa, Stripe"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Account Title / Name on Account
                </label>
                <input
                  type="text"
                  placeholder="e.g. Your Name or Business Name"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Account / Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. IBAN PK36MEZN... or Mobile 03001234567"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawSuccess}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {withdrawSuccess ? 'Processing...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};