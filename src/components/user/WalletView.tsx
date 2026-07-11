import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, DollarSign, Bitcoin, CreditCard, Building, Smartphone, FileText, CheckCircle, Clock, AlertTriangle, ShieldCheck, Download, Share2, ChevronRight, Check, User, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WalletViewProps {
  theme?: 'light' | 'dark';
}

type Transaction = {
  id: string;
  timestamp: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'transfer';
  asset: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  reference: string;
  balanceAfter: number;
};

type FlowStep = 'input' | 'summary' | 'security' | 'processing' | 'success' | 'error';

export default function WalletView({ theme = 'light' }: WalletViewProps) {
  const [fiatBalance, setFiatBalance] = useState({ usd: 24500.00, kes: 150000.00, eur: 1250.00 });
  const [cryptoBalance, setCryptoBalance] = useState({ btc: 1.25, eth: 14.5, usdt: 5400.00 });
  
  const [activeAction, setActiveAction] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'bank' | 'card' | 'crypto' | 'platform' | 'wallet'>('mpesa');
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TX-9942', timestamp: '2026-07-04T10:42:00Z', type: 'deposit', asset: 'USD', amount: 5000.00, status: 'completed', method: 'Bank Wire', reference: 'REF-8849-NS', balanceAfter: 24500.00 },
    { id: 'TX-9810', timestamp: '2026-07-03T15:15:00Z', type: 'trade', asset: 'USD', amount: -1285.00, status: 'completed', method: 'Platform', reference: 'BUY-NVDA', balanceAfter: 19500.00 },
    { id: 'TX-9755', timestamp: '2026-07-02T09:30:00Z', type: 'deposit', asset: 'KES', amount: 50000.00, status: 'completed', method: 'M-Pesa', reference: 'QAW3ERTY56', balanceAfter: 150000.00 },
    { id: 'TX-9612', timestamp: '2026-06-25T14:20:00Z', type: 'withdrawal', asset: 'USDT', amount: -2500.00, status: 'completed', method: 'Crypto', reference: '0xabc...def', balanceAfter: 5400.00 },
  ]);

  // Transaction Flow State
  const [step, setStep] = useState<FlowStep>('input');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [processingStep, setProcessingStep] = useState(0);
  const [currentTxId, setCurrentTxId] = useState('');

  // Saved Bank & Card State
  const [savedBanks, setSavedBanks] = useState([
    { id: '1', bankName: 'Chase Bank', accountNumber: '**** 4829', accountHolder: 'Christian Alexander', routing: '021000021' },
    { id: '2', bankName: 'Barclays UK', accountNumber: '**** 9102', accountHolder: 'Christian Alexander', routing: '20-00-00' }
  ]);
  const [savedCards, setSavedCards] = useState([
    { id: '1', cardBrand: 'Visa', cardNumber: '**** **** **** 8832', expiry: '08/28', holder: 'Christian Alexander' },
    { id: '2', cardBrand: 'Mastercard', cardNumber: '**** **** **** 1490', expiry: '11/27', holder: 'Christian Alexander' }
  ]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountHolder: '', routing: '' });
  const [newCard, setNewCard] = useState({ cardBrand: 'Visa', cardNumber: '', expiry: '', holder: '', cvc: '' });

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank.bankName || !newBank.accountNumber) return;
    setSavedBanks(prev => [...prev, { id: Date.now().toString(), ...newBank, accountNumber: `**** ${newBank.accountNumber.slice(-4)}` }]);
    setNewBank({ bankName: '', accountNumber: '', accountHolder: '', routing: '' });
    setShowAddBank(false);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.cardNumber || !newCard.expiry) return;
    setSavedCards(prev => [...prev, { id: Date.now().toString(), ...newCard, cardNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}` }]);
    setNewCard({ cardBrand: 'Visa', cardNumber: '', expiry: '', holder: '', cvc: '' });
    setShowAddCard(false);
  };

  const resetFlow = (action: 'deposit' | 'withdraw' | 'transfer' | null) => {
    setActiveAction(action);
    setStep('input');
    setAmount('');
    setPhoneNumber('');
    setRecipientId('');
    setBankName('');
    setBankAccount('');
    setCryptoAddress('');
    setTransferNote('');
    setSecurityCode('');
    setErrorMsg('');
    setProcessingStep(0);
    if (action === 'transfer') setPaymentMethod('platform');
    else setPaymentMethod('mpesa');
  };

  const getCurrency = () => paymentMethod === 'mpesa' ? 'KES' : 'USD';
  const getBalance = () => paymentMethod === 'mpesa' ? fiatBalance.kes : fiatBalance.usd;
  const getFee = () => {
    const numAmount = parseFloat(amount) || 0;
    if (paymentMethod === 'platform' || paymentMethod === 'wallet') return 0;
    if (paymentMethod === 'mpesa') return 30; // KES 30
    if (paymentMethod === 'card') return numAmount * 0.029; // 2.9%
    if (paymentMethod === 'bank') return 15; // USD 15
    return 5; // Crypto network fee approx
  };

  const handleReview = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }
    
    if ((activeAction === 'withdraw' || activeAction === 'transfer') && numAmount > getBalance()) {
      setErrorMsg(`Insufficient funds for this ${activeAction}.`);
      return;
    }

    if (paymentMethod === 'mpesa' && (!phoneNumber || phoneNumber.length < 9)) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    
    if (activeAction === 'transfer' && paymentMethod === 'platform' && !recipientId) {
      setErrorMsg('Please enter a valid recipient username or ID.');
      return;
    }

    setErrorMsg('');
    setStep('summary');
  };

  const handleConfirmSummary = () => {
    setStep('security');
  };

  const handleSecuritySubmit = () => {
    if (!securityCode || securityCode.length < 4) {
      setErrorMsg('Invalid security code.');
      return;
    }
    setErrorMsg('');
    setStep('processing');
  };

  useEffect(() => {
    if (step === 'processing') {
      const timer1 = setTimeout(() => setProcessingStep(1), 1500);
      const timer2 = setTimeout(() => setProcessingStep(2), 3000);
      const timer3 = setTimeout(() => setProcessingStep(3), 4500);
      const timer4 = setTimeout(() => {
        setProcessingStep(4);
        
        // Finalize transaction
        const numAmount = parseFloat(amount);
        const newTxId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
        setCurrentTxId(newTxId);
        
        const isDeposit = activeAction === 'deposit';
        const isTransfer = activeAction === 'transfer';
        const fee = getFee();
        
        let totalAmount = 0;
        if (isDeposit) totalAmount = numAmount;
        else if (isTransfer) totalAmount = -(numAmount + fee);
        else totalAmount = -(numAmount + fee);
        
        const newTx: Transaction = {
          id: newTxId,
          timestamp: new Date().toISOString(),
          type: isDeposit ? 'deposit' : isTransfer ? 'transfer' : 'withdrawal',
          asset: getCurrency(),
          amount: isDeposit ? numAmount - fee : -numAmount,
          status: 'completed',
          method: paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'bank' ? 'Bank Transfer' : paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'platform' ? 'Platform User' : paymentMethod === 'wallet' ? 'Internal Wallet' : 'Crypto Wallet',
          reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          balanceAfter: getBalance() + totalAmount
        };
        
        setTransactions(prev => [newTx, ...prev]);
        
        if (getCurrency() === 'KES') {
          setFiatBalance(prev => ({ ...prev, kes: prev.kes + totalAmount }));
        } else {
          setFiatBalance(prev => ({ ...prev, usd: prev.usd + totalAmount }));
        }
        
        setStep('success');
      }, 6000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [step]);

  const numAmount = parseFloat(amount) || 0;
  const fee = getFee();
  const currency = getCurrency();
  const totalDebit = (activeAction === 'withdraw' || activeAction === 'transfer') ? numAmount + fee : numAmount;
  const youReceive = (activeAction === 'withdraw' || activeAction === 'transfer') ? numAmount : numAmount - fee;
  const balanceAfter = (activeAction === 'withdraw' || activeAction === 'transfer') ? getBalance() - totalDebit : getBalance() + youReceive;

  return (
    <div className="space-y-6 w-full max-w-none">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border shadow-sm ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Fiat Balances</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className={`font-bold ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>US Dollar (USD)</span>
              <span className={`text-xl font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>${fiatBalance.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className={`font-bold ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Kenyan Shilling (KES)</span>
              <span className={`text-xl font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>KSh {fiatBalance.kes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`font-bold ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Euro (EUR)</span>
              <span className={`text-xl font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>€{fiatBalance.eur.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-sm ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/30 text-amber-400'}`}>
              <Bitcoin className="w-5 h-5" />
            </div>
            <h3 className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Crypto Balances</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className={`font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Bitcoin (BTC)</span>
              <span className={`text-xl font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{cryptoBalance.btc}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className={`font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Ethereum (ETH)</span>
              <span className={`text-xl font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{cryptoBalance.eth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Tether (USDT)</span>
              <span className={`text-xl font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{cryptoBalance.usdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`flex flex-wrap gap-4 p-4 rounded-2xl border shadow-sm ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
        <button 
          onClick={() => resetFlow(activeAction === 'deposit' ? null : 'deposit')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all ${
            activeAction === 'deposit' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : theme === 'light' ? 'bg-slate-50 hover:bg-slate-100 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <ArrowDownLeft className="w-5 h-5" />
          Deposit Funds
        </button>
        <button 
          onClick={() => resetFlow(activeAction === 'withdraw' ? null : 'withdraw')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all ${
            activeAction === 'withdraw' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : theme === 'light' ? 'bg-slate-50 hover:bg-slate-100 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <ArrowUpRight className="w-5 h-5" />
          Withdraw Funds
        </button>
        <button 
          onClick={() => resetFlow(activeAction === 'transfer' ? null : 'transfer')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all ${
            activeAction === 'transfer' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : theme === 'light' ? 'bg-slate-50 hover:bg-slate-100 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <ArrowRightLeft className="w-5 h-5" />
          Transfer
        </button>
      </div>

      <AnimatePresence>
        {activeAction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`overflow-hidden rounded-2xl border shadow-sm ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}
          >
            <div className="p-6 sm:p-8">
              <h3 className={`text-xl font-bold mb-6 capitalize ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {activeAction} Funds
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1 space-y-4">
                  <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Select Method</p>
                  
                  {activeAction === 'transfer' && (
                    <>
                      <button 
                        onClick={() => setPaymentMethod('platform')}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          paymentMethod === 'platform' 
                            ? (theme === 'light' ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-500 bg-indigo-500/10')
                            : (theme === 'light' ? 'border-slate-200 hover:border-slate-300' : 'border-slate-800 hover:border-slate-700')
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <User className={`w-5 h-5 ${paymentMethod === 'platform' ? 'text-indigo-500' : (theme === 'light' ? 'text-slate-400' : 'text-slate-500')}`} />
                          <div className="text-left">
                            <div className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Platform User</div>
                            <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Instant • No Fee</div>
                          </div>
                        </div>
                      </button>

                      <button 
                        onClick={() => setPaymentMethod('wallet')}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          paymentMethod === 'wallet' 
                            ? (theme === 'light' ? 'border-teal-500 bg-teal-50' : 'border-teal-500 bg-teal-500/10')
                            : (theme === 'light' ? 'border-slate-200 hover:border-slate-300' : 'border-slate-800 hover:border-slate-700')
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className={`w-5 h-5 ${paymentMethod === 'wallet' ? 'text-teal-500' : (theme === 'light' ? 'text-slate-400' : 'text-slate-500')}`} />
                          <div className="text-left">
                            <div className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>My Other Wallets</div>
                            <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Instant • No Fee</div>
                          </div>
                        </div>
                      </button>
                    </>
                  )}

                  <button 
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      paymentMethod === 'mpesa' 
                        ? (theme === 'light' ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-500 bg-emerald-500/10')
                        : (theme === 'light' ? 'border-slate-200 hover:border-slate-300' : 'border-slate-800 hover:border-slate-700')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className={`w-5 h-5 ${paymentMethod === 'mpesa' ? 'text-emerald-500' : (theme === 'light' ? 'text-slate-400' : 'text-slate-500')}`} />
                      <div className="text-left">
                        <div className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>M-Pesa</div>
                        <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Instant • KES 30 Fee</div>
                      </div>
                    </div>
                    <div className={`text-[10px] text-right font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      <div>Min: KES 100</div>
                      <div>Max: KES 300K</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('bank')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      paymentMethod === 'bank' 
                        ? (theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-500 bg-blue-500/10')
                        : (theme === 'light' ? 'border-slate-200 hover:border-slate-300' : 'border-slate-800 hover:border-slate-700')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building className={`w-5 h-5 ${paymentMethod === 'bank' ? 'text-blue-500' : (theme === 'light' ? 'text-slate-400' : 'text-slate-500')}`} />
                      <div className="text-left">
                        <div className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Bank Transfer</div>
                        <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>1-3 Days • USD 15 Fee</div>
                      </div>
                    </div>
                    <div className={`text-[10px] text-right font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      <div>Min: USD 100</div>
                      <div>Max: USD 100K</div>
                    </div>
                  </button>

                  {activeAction !== 'transfer' && (
                    <button 
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        paymentMethod === 'card' 
                          ? (theme === 'light' ? 'border-purple-500 bg-purple-50' : 'border-purple-500 bg-purple-500/10')
                          : (theme === 'light' ? 'border-slate-200 hover:border-slate-300' : 'border-slate-800 hover:border-slate-700')
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-purple-500' : (theme === 'light' ? 'text-slate-400' : 'text-slate-500')}`} />
                        <div className="text-left">
                          <div className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Credit/Debit Card</div>
                          <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Instant • 2.9% Fee</div>
                        </div>
                      </div>
                      <div className={`text-[10px] text-right font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        <div>Min: USD 10</div>
                        <div>Max: USD 5K</div>
                      </div>
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setPaymentMethod('crypto')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      paymentMethod === 'crypto' 
                        ? (theme === 'light' ? 'border-amber-500 bg-amber-50' : 'border-amber-500 bg-amber-500/10')
                        : (theme === 'light' ? 'border-slate-200 hover:border-slate-300' : 'border-slate-800 hover:border-slate-700')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bitcoin className={`w-5 h-5 ${paymentMethod === 'crypto' ? 'text-amber-500' : (theme === 'light' ? 'text-slate-400' : 'text-slate-500')}`} />
                      <div className="text-left">
                        <div className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Crypto Wallet</div>
                        <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Est 5 min • Gas Fee</div>
                      </div>
                    </div>
                    <div className={`text-[10px] text-right font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      <div>Min: USD 50</div>
                      <div>Max: No Limit</div>
                    </div>
                  </button>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <div className={`p-6 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'}`}>
                    
                    {step === 'input' && (
                      <form className="space-y-6">
                        {paymentMethod === 'mpesa' && (
                          <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Phone Number</label>
                            <input 
                              type="text" 
                              placeholder="254 7XX XXX XXX"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className={`w-full p-3 rounded-xl border font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                            />
                          </div>
                        )}
                        
                        {activeAction === 'transfer' && paymentMethod === 'platform' && (
                          <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Recipient (Username, Email, or ID)</label>
                            <input 
                              type="text" 
                              placeholder="@username or email@example.com"
                              value={recipientId}
                              onChange={(e) => setRecipientId(e.target.value)}
                              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                            />
                          </div>
                        )}

                        {paymentMethod === 'bank' && (
                          <div className="space-y-4">
                            <div>
                              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Bank Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Chase Bank, Barclays"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                              />
                            </div>
                            <div>
                              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Account Number / IBAN</label>
                              <input 
                                type="text" 
                                placeholder="Account Number"
                                value={bankAccount}
                                onChange={(e) => setBankAccount(e.target.value)}
                                className={`w-full p-3 rounded-xl border font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'crypto' && (
                          <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                              {activeAction === 'deposit' ? 'Your Deposit Wallet Address (Auto-Generated)' : 'Recipient Wallet Address'}
                            </label>
                            <input 
                              type="text" 
                              placeholder="0x..."
                              value={activeAction === 'deposit' ? '0x71C...9A23' : cryptoAddress}
                              onChange={(e) => activeAction === 'deposit' ? null : setCryptoAddress(e.target.value)}
                              disabled={activeAction === 'deposit'}
                              className={`w-full p-3 rounded-xl border font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                            />
                          </div>
                        )}

                        {paymentMethod === 'card' && (
                          <div className="space-y-4">
                            <div>
                              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Card Number</label>
                              <input 
                                type="text" 
                                placeholder="XXXX XXXX XXXX XXXX"
                                className={`w-full p-3 rounded-xl border font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Expiry</label>
                                <input 
                                  type="text" 
                                  placeholder="MM/YY"
                                  className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>CVC</label>
                                <input 
                                  type="text" 
                                  placeholder="123"
                                  className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeAction === 'transfer' && paymentMethod === 'wallet' && (
                          <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Target Wallet</label>
                            <select 
                              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                            >
                              <option>Euro (EUR) Wallet</option>
                              <option>Bitcoin (BTC) Wallet</option>
                              <option>Ethereum (ETH) Wallet</option>
                            </select>
                          </div>
                        )}
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className={`block text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Amount</label>
                            <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                              Balance: {currency === 'KES' ? 'KSh' : '$'} {getBalance().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="relative">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                              {currency}
                            </span>
                            <input 
                              type="number" 
                              placeholder="0.00"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className={`w-full p-4 pl-12 rounded-xl border text-xl font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                            />
                          </div>
                          
                          {amount && (
                            <div className="mt-3 space-y-1.5 px-1">
                              <div className="flex justify-between text-xs">
                                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Processing Fee:</span>
                                <span className={`font-mono font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{currency} {fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>You {activeAction === 'deposit' ? 'Receive' : 'Will Be Debited'}:</span>
                                <span className={`font-mono font-bold ${activeAction === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {currency} {(activeAction === 'deposit' ? Math.max(0, numAmount - fee) : numAmount + fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {activeAction === 'transfer' && (
                          <div>
                            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Transfer Note (Optional)</label>
                            <input 
                              type="text" 
                              placeholder="What is this for?"
                              value={transferNote}
                              onChange={(e) => setTransferNote(e.target.value)}
                              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                            />
                          </div>
                        )}

                        {errorMsg && (
                          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold flex items-center gap-2 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                            <AlertTriangle className="w-4 h-4" />
                            {errorMsg}
                          </div>
                        )}

                        <button 
                          type="button" 
                          onClick={handleReview}
                          className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-sm shadow-xl transition-transform active:scale-[0.98] ${activeAction === 'withdraw' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'}`}
                        >
                          Review {activeAction}
                        </button>
                      </form>
                    )}

                    {step === 'summary' && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h4 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Transaction Summary</h4>
                          <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Please review the details before confirming.</p>
                        </div>
                        
                        <div className={`rounded-xl border divide-y ${theme === 'light' ? 'bg-white border-slate-200 divide-slate-100' : 'bg-[#0b0e14] border-slate-800 divide-slate-800'}`}>
                          <div className="p-4 flex justify-between items-center">
                            <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Type</span>
                            <span className={`font-bold capitalize ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{activeAction}</span>
                          </div>
                          <div className="p-4 flex justify-between items-center">
                            <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Method</span>
                            <span className={`font-bold capitalize ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                              {paymentMethod === 'mpesa' ? 'M-Pesa' : paymentMethod === 'bank' ? 'Bank Transfer' : paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'platform' ? 'Platform User' : paymentMethod === 'wallet' ? 'Internal Wallet' : 'Crypto'}
                            </span>
                          </div>
                          {paymentMethod === 'mpesa' && (
                            <div className="p-4 flex justify-between items-center">
                              <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{activeAction === 'deposit' ? 'From' : 'To'}</span>
                              <span className={`font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{phoneNumber}</span>
                            </div>
                          )}
                          {activeAction === 'transfer' && paymentMethod === 'platform' && (
                            <div className="p-4 flex justify-between items-center">
                              <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Recipient</span>
                              <span className={`font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{recipientId}</span>
                            </div>
                          )}
                          {paymentMethod === 'bank' && (
                            <div className="p-4 flex justify-between items-center">
                              <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Bank Account</span>
                              <div className="text-right">
                                <div className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{bankName || 'My Bank'}</div>
                                <div className={`font-mono text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{bankAccount || '****'}</div>
                              </div>
                            </div>
                          )}
                          {paymentMethod === 'crypto' && (
                            <div className="p-4 flex justify-between items-center">
                              <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Wallet Address</span>
                              <span className={`font-mono font-bold text-xs max-w-[150px] truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                {activeAction === 'deposit' ? '0x71C...9A23' : cryptoAddress}
                              </span>
                            </div>
                          )}
                          {paymentMethod === 'card' && (
                            <div className="p-4 flex justify-between items-center">
                              <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Card</span>
                              <span className={`font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>**** **** **** 1234</span>
                            </div>
                          )}
                          <div className="p-4 flex justify-between items-center">
                            <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Amount</span>
                            <span className={`font-mono font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{currency} {numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="p-4 flex justify-between items-center">
                            <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Fee</span>
                            <span className={`font-mono font-bold text-rose-500`}>{currency} {fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className={`p-4 flex justify-between items-center ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
                            <span className={`text-sm font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{activeAction === 'deposit' ? 'You Receive' : 'Total Debit'}</span>
                            <span className={`text-lg font-mono font-black ${activeAction === 'deposit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {currency} {activeAction === 'deposit' ? youReceive.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center px-2">
                          <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Balance After</span>
                          <span className={`font-mono font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{currency} {balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={() => setStep('input')}
                            className={`flex-1 py-4 rounded-xl font-bold transition-colors ${theme === 'light' ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-[#0b0e14] border border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                          >
                            Back
                          </button>
                          <button 
                            type="button" 
                            onClick={handleConfirmSummary}
                            className={`flex-1 py-4 rounded-xl text-white font-black uppercase tracking-widest text-sm shadow-xl transition-transform active:scale-[0.98] ${activeAction === 'withdraw' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'}`}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 'security' && (
                      <div className="space-y-6 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                          <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h4 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Security Check</h4>
                        <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Please enter your 2FA code or password to authorize this {activeAction}.
                        </p>
                        
                        <div className="pt-4">
                          <input 
                            type="password" 
                            placeholder="Enter Code or Password"
                            value={securityCode}
                            onChange={(e) => setSecurityCode(e.target.value)}
                            className={`w-full p-4 rounded-xl border text-center font-mono font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                          />
                        </div>

                        {errorMsg && (
                          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold flex items-center justify-center gap-2 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
                            <AlertTriangle className="w-4 h-4" />
                            {errorMsg}
                          </div>
                        )}

                        <div className="flex gap-4 pt-4">
                          <button 
                            type="button" 
                            onClick={() => setStep('summary')}
                            className={`flex-1 py-4 rounded-xl font-bold transition-colors ${theme === 'light' ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-[#0b0e14] border border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            onClick={handleSecuritySubmit}
                            className={`flex-1 py-4 rounded-xl text-white font-black uppercase tracking-widest text-sm shadow-xl transition-transform active:scale-[0.98] bg-blue-600 hover:bg-blue-500 shadow-blue-600/20`}
                          >
                            Verify & Submit
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 'processing' && (
                      <div className="py-8 space-y-8">
                        <div className="text-center">
                          <div className="inline-block relative w-16 h-16 mb-6">
                            <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                          </div>
                          <h4 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Processing Transaction</h4>
                          <p className={`text-sm mt-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Please do not close this window</p>
                        </div>

                        <div className="max-w-xs mx-auto space-y-4">
                          <div className="flex items-center gap-3">
                            {processingStep >= 1 ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-slate-400" />}
                            <span className={`text-sm font-bold ${processingStep >= 1 ? (theme === 'light' ? 'text-slate-900' : 'text-white') : (theme === 'light' ? 'text-slate-400' : 'text-slate-600')}`}>Verifying Identity</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {processingStep >= 2 ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-slate-400" />}
                            <span className={`text-sm font-bold ${processingStep >= 2 ? (theme === 'light' ? 'text-slate-900' : 'text-white') : (theme === 'light' ? 'text-slate-400' : 'text-slate-600')}`}>Checking Balance</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {processingStep >= 3 ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-slate-400" />}
                            <span className={`text-sm font-bold ${processingStep >= 3 ? (theme === 'light' ? 'text-slate-900' : 'text-white') : (theme === 'light' ? 'text-slate-400' : 'text-slate-600')}`}>{activeAction === 'transfer' ? 'Validating Recipient' : 'Contacting Payment Provider'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {processingStep >= 4 ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-slate-400" />}
                            <span className={`text-sm font-bold ${processingStep >= 4 ? (theme === 'light' ? 'text-slate-900' : 'text-white') : (theme === 'light' ? 'text-slate-400' : 'text-slate-600')}`}>{activeAction === 'transfer' ? 'Sending Transfer' : 'Finalizing Transaction'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 'success' && (
                      <div className="space-y-6 text-center">
                        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <Check className="w-10 h-10" />
                        </div>
                        <div>
                          <h4 className={`text-2xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Transaction Successful</h4>
                          <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Your {activeAction} has been processed</p>
                        </div>

                        <div className={`p-4 rounded-xl border text-left space-y-3 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Transaction ID</span>
                            <span className={`font-mono text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{currentTxId}</span>
                          </div>
                          {activeAction === 'transfer' && paymentMethod === 'platform' && (
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Recipient</span>
                              <span className={`font-mono text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{recipientId}</span>
                            </div>
                          )}
                          {paymentMethod === 'mpesa' && (
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{activeAction === 'deposit' ? 'From Phone' : 'To Phone'}</span>
                              <span className={`font-mono text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{phoneNumber}</span>
                            </div>
                          )}
                          {paymentMethod === 'bank' && (
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Bank Account</span>
                              <span className={`font-mono text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{bankAccount || '****'}</span>
                            </div>
                          )}
                          {paymentMethod === 'crypto' && (
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Address</span>
                              <span className={`font-mono text-xs max-w-[150px] truncate font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                {activeAction === 'deposit' ? '0x71C...9A23' : cryptoAddress}
                              </span>
                            </div>
                          )}
                          {paymentMethod === 'card' && (
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Card</span>
                              <span className={`font-mono text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>**** 1234</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Amount</span>
                            <span className={`font-mono text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{currency} {numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Date</span>
                            <span className={`font-mono text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{new Date().toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          <button 
                            type="button" 
                            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${theme === 'light' ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-[#0b0e14] border border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                          >
                            <Download className="w-4 h-4" /> Receipt
                          </button>
                          <button 
                            type="button" 
                            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${theme === 'light' ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-[#0b0e14] border border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                          >
                            <Share2 className="w-4 h-4" /> Share
                          </button>
                        </div>
                        
                        <button 
                          type="button" 
                          onClick={() => resetFlow(null)}
                          className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-sm shadow-xl transition-transform active:scale-[0.98] bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700`}
                        >
                          Return to Wallet
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Bank Accounts & Payment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Bank Accounts */}
        <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-950/40 text-indigo-400 border border-indigo-800/40'}`}>
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Linked Bank Accounts</h3>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Manage wire transfer destinations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBank(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bank</span>
              </button>
            </div>

            <div className="space-y-3">
              {savedBanks.map(bank => (
                <div key={bank.id} className={`p-4 rounded-xl border flex items-center justify-between ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${theme === 'light' ? 'bg-white text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {bank.bankName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{bank.bankName}</h4>
                      <p className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{bank.accountNumber} • {bank.accountHolder}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSavedBanks(prev => prev.filter(b => b.id !== bank.id))}
                    className={`p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer`}
                    title="Remove bank account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {savedBanks.length === 0 && (
                <p className={`text-xs text-center py-6 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>No linked bank accounts. Click "Add Bank" to connect an account.</p>
              )}
            </div>
          </div>

          {/* Add Bank Modal Inline / Box */}
          <AnimatePresence>
            {showAddBank && (
              <motion.form
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                onSubmit={handleAddBank}
                className={`overflow-hidden pt-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>New Bank Account</h4>
                  <button type="button" onClick={() => setShowAddBank(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Bank Name (e.g. Chase Bank)"
                      value={newBank.bankName}
                      onChange={e => setNewBank({...newBank, bankName: e.target.value})}
                      className={`w-full p-2.5 text-xs rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Account Number"
                      value={newBank.accountNumber}
                      onChange={e => setNewBank({...newBank, accountNumber: e.target.value})}
                      className={`w-full p-2.5 text-xs rounded-xl border font-mono focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                    />
                    <input
                      type="text"
                      placeholder="Routing / SWIFT"
                      value={newBank.routing}
                      onChange={e => setNewBank({...newBank, routing: e.target.value})}
                      className={`w-full p-2.5 text-xs rounded-xl border font-mono focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Account Holder Name"
                      value={newBank.accountHolder}
                      onChange={e => setNewBank({...newBank, accountHolder: e.target.value})}
                      className={`w-full p-2.5 text-xs rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Save Bank Account
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Saved Cards */}
        <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Saved Payment Cards</h3>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Credit & Debit cards for instant deposits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCard(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>

            <div className="space-y-3">
              {savedCards.map(card => (
                <div key={card.id} className={`p-4 rounded-xl border flex items-center justify-between ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase ${theme === 'light' ? 'bg-white text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {card.cardBrand}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm font-mono ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{card.cardNumber}</h4>
                      <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Expires {card.expiry} • {card.holder}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSavedCards(prev => prev.filter(c => c.id !== card.id))}
                    className={`p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer`}
                    title="Remove card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {savedCards.length === 0 && (
                <p className={`text-xs text-center py-6 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>No saved payment cards. Click "Add Card" to link a card.</p>
              )}
            </div>
          </div>

          {/* Add Card Modal Inline / Box */}
          <AnimatePresence>
            {showAddCard && (
              <motion.form
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                onSubmit={handleAddCard}
                className={`overflow-hidden pt-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>New Debit / Credit Card</h4>
                  <button type="button" onClick={() => setShowAddCard(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={newCard.cardBrand}
                      onChange={e => setNewCard({...newCard, cardBrand: e.target.value})}
                      className={`col-span-1 p-2.5 text-xs rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">Amex</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Card Number (16 digits)"
                      value={newCard.cardNumber}
                      onChange={e => setNewCard({...newCard, cardNumber: e.target.value})}
                      className={`col-span-2 p-2.5 text-xs rounded-xl border font-mono focus:ring-2 focus:ring-emerald-500 outline-none ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={newCard.expiry}
                      onChange={e => setNewCard({...newCard, expiry: e.target.value})}
                      className={`w-full p-2.5 text-xs rounded-xl border font-mono focus:ring-2 focus:ring-emerald-500 outline-none ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                    />
                    <input
                      type="text"
                      required
                      placeholder="CVC / CVV"
                      value={newCard.cvc}
                      onChange={e => setNewCard({...newCard, cvc: e.target.value})}
                      className={`w-full p-2.5 text-xs rounded-xl border font-mono focus:ring-2 focus:ring-emerald-500 outline-none ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Cardholder Name"
                      value={newCard.holder}
                      onChange={e => setNewCard({...newCard, holder: e.target.value})}
                      className={`w-full p-2.5 text-xs rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0e14] border-slate-700 text-white'}`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Save Payment Card
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className={`rounded-2xl border shadow-sm ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${theme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
          <div>
            <h3 className={`font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              <FileText className="w-5 h-5 text-purple-500" />
              Transaction Ledger
            </h3>
            <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Double-entry accounting record</p>
          </div>
          <button className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'}`}>
            Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs uppercase font-mono tracking-wider ${theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-800 bg-slate-900/50 text-slate-400'}`}>
                <th className="p-4 font-semibold">Date & Time</th>
                <th className="p-4 font-semibold">Reference / ID</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Asset</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-right">Balance After</th>
                <th className="p-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className={`text-sm ${theme === 'light' ? 'divide-slate-200' : 'divide-slate-800'}`}>
              {transactions.map((tx) => (
                <tr key={tx.id} className={`border-b last:border-0 transition-colors ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>
                  <td className={`p-4 font-mono text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className={`font-mono text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{tx.id}</div>
                    <div className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{tx.reference}</div>
                  </td>
                  <td className="p-4 capitalize">
                    {tx.type}
                  </td>
                  <td className={`p-4 font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {tx.asset}
                  </td>
                  <td className={`p-4 text-right font-mono font-bold ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`p-4 text-right font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    {tx.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === 'completed' 
                        ? (theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20')
                        : (theme === 'light' ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20')
                    }`}>
                      {tx.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
