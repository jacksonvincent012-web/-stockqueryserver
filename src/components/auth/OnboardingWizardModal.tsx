import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User, Globe, DollarSign, Clock, Bell, TrendingUp, ShieldAlert, CheckCircle2, ArrowRight, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (profileData: any) => void;
  initialName?: string;
}

export function OnboardingWizardModal({ isOpen, onClose, onComplete, initialName = "" }: OnboardingWizardModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English (US)');
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [country, setCountry] = useState('United States');
  const [experience, setExperience] = useState('Intermediate (2-5 years)');
  const [riskPreference, setRiskPreference] = useState('Balanced Growth');
  const [photoURL, setPhotoURL] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250');
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    securityAlerts: true,
    executionReports: true,
    weeklyDigest: false
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleComplete = async () => {
    setLoading(true);
    const profileData = {
      preferredCurrency: currency,
      preferredLanguage: language,
      timeZone,
      country,
      tradingExperience: experience,
      riskPreference,
      photoURL,
      notificationPreferences: notifications,
      profileCompleted: true
    };

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/auth/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });
      }
    } catch (e) {
      // Ignore network errors in SQ Platform
    } finally {
      setLoading(false);
      if (onComplete) onComplete(profileData);
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl p-6 sm:p-10 w-full max-w-none md:w-1/2 min-w-[320px] shadow-2xl border border-slate-100 relative text-slate-800"
        >
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button 
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              Skip Onboarding
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">SQ Platform Onboarding Wizard</h2>
              <p className="text-sm text-slate-500 mt-1">Configure your SQ Platform trading environment</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-1.5 w-full rounded-full transition-all ${
                  s <= step ? 'bg-indigo-600' : 'bg-slate-200'
                }`} />
                <span className={`text-[10px] font-semibold ${s === step ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                  {s === 1 ? 'Profile & Locale' : s === 2 ? 'Trading Profile' : 'Notifications'}
                </span>
              </div>
            ))}
          </div>

          {/* STEP 1: Profile & Locale */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <img src={photoURL} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-sm" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">Profile Picture</p>
                  <p className="text-[11px] text-slate-500 mb-2">Upload or select an SQ Platform avatar</p>
                  <button
                    type="button"
                    onClick={() => setPhotoURL("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250")}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-500 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-sm"
                  >
                    <Upload className="w-3 h-3 text-indigo-600" />
                    Change Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country / Region</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Kenya">Kenya 🇰🇪 (+254)</option>
                    <option value="Nigeria">Nigeria 🇳🇬 (+234)</option>
                    <option value="South Africa">South Africa 🇿🇦 (+27)</option>
                    <option value="Egypt">Egypt 🇪🇬 (+20)</option>
                    <option value="Ghana">Ghana 🇬🇭 (+233)</option>
                    <option value="Tanzania">Tanzania 🇹🇿 (+255)</option>
                    <option value="Uganda">Uganda 🇺🇬 (+256)</option>
                    <option value="Rwanda">Rwanda 🇷🇼 (+250)</option>
                    <option value="Morocco">Morocco 🇲🇦 (+212)</option>
                    <option value="Algeria">Algeria 🇩🇿 (+213)</option>
                    <option value="Ethiopia">Ethiopia 🇪🇹 (+251)</option>
                    <option value="Ivory Coast">Ivory Coast 🇨🇮 (+225)</option>
                    <option value="Senegal">Senegal 🇸🇳 (+221)</option>
                    <option value="Zambia">Zambia 🇿🇲 (+260)</option>
                    <option value="Zimbabwe">Zimbabwe 🇿🇼 (+263)</option>
                    <option value="Tunisia">Tunisia 🇹🇳 (+216)</option>
                    <option value="Botswana">Botswana 🇧🇼 (+267)</option>
                    <option value="Mauritius">Mauritius 🇲🇺 (+230)</option>
                    <option value="Cameroon">Cameroon 🇨🇲 (+237)</option>
                    <option value="Angola">Angola 🇦🇴 (+244)</option>
                    <option value="Mozambique">Mozambique 🇲🇿 (+258)</option>
                    <option value="Namibia">Namibia 🇳🇦 (+264)</option>
                    <option value="Malawi">Malawi 🇲🇼 (+265)</option>
                    <option value="Madagascar">Madagascar 🇲🇬 (+261)</option>
                    <option value="United States">United States 🇺🇸 (+1)</option>
                    <option value="United Kingdom">United Kingdom 🇬🇧 (+44)</option>
                    <option value="Canada">Canada 🇨🇦 (+1)</option>
                    <option value="Germany">Germany 🇩🇪 (+49)</option>
                    <option value="Singapore">Singapore 🇸🇬 (+65)</option>
                    <option value="Japan">Japan 🇯🇵 (+81)</option>
                    <option value="Australia">Australia 🇦🇺 (+61)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
                  >
                    <option value="KES">KES (KSh - Kenya Shilling)</option>
                    <option value="NGN">NGN (₦ - Nigerian Naira)</option>
                    <option value="ZAR">ZAR (R - South African Rand)</option>
                    <option value="EGP">EGP (E£ - Egyptian Pound)</option>
                    <option value="GHS">GHS (GH₵ - Ghanaian Cedi)</option>
                    <option value="TZS">TZS (TSh - Tanzanian Shilling)</option>
                    <option value="UGX">UGX (USh - Ugandan Shilling)</option>
                    <option value="RWF">RWF (FRw - Rwandan Franc)</option>
                    <option value="MAD">MAD (DH - Moroccan Dirham)</option>
                    <option value="DZD">DZD (DA - Algerian Dinar)</option>
                    <option value="ETB">ETB (Br - Ethiopian Birr)</option>
                    <option value="ZMW">ZMW (ZK - Zambian Kwacha)</option>
                    <option value="XOF">XOF (CFA - CFA Franc)</option>
                    <option value="ZWL">ZWL ($ - Zimbabwe Dollar)</option>
                    <option value="TND">TND (DT - Tunisian Dinar)</option>
                    <option value="BWP">BWP (P - Botswana Pula)</option>
                    <option value="MUR">MUR (₨ - Mauritian Rupee)</option>
                    <option value="XAF">XAF (FCFA - Central African CFA)</option>
                    <option value="AOA">AOA (Kz - Angolan Kwanza)</option>
                    <option value="MZN">MZN (MT - Mozambican Metical)</option>
                    <option value="NAD">NAD (N$ - Namibian Dollar)</option>
                    <option value="MWK">MWK (MK - Malawian Kwacha)</option>
                    <option value="MGA">MGA (Ar - Malagasy Ariary)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="JPY">JPY (¥ - Japanese Yen)</option>
                    <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="English (UK)">English (UK)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="French">French (Français)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Zone</label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="America/New_York">EST / EDT (New York)</option>
                    <option value="America/Chicago">CST / CDT (Chicago)</option>
                    <option value="America/Los_Angeles">PST / PDT (Los Angeles)</option>
                    <option value="Europe/London">GMT / BST (London)</option>
                    <option value="Europe/Berlin">CET / CEST (Frankfurt)</option>
                    <option value="Asia/Tokyo">JST (Tokyo)</option>
                    <option value="Asia/Hong_Kong">HKT (Hong Kong)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                Next: Trading Experience
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Trading Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Trading Experience Level</label>
                <div className="space-y-2">
                  {[
                    "Novice (< 1 year trading equities)",
                    "Intermediate (2-5 years equities & ETFs)",
                    "Advanced (5+ years derivatives & margin)",
                    "SQ Platform / Professional Analyst"
                  ].map((exp) => (
                    <div
                      key={exp}
                      onClick={() => setExperience(exp)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-semibold ${
                        experience === exp ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span>{exp}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        experience === exp ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {experience === exp && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Risk Preference & Mandate</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { title: "Conservative", desc: "Capital preservation, dividend yields" },
                    { title: "Balanced Growth", desc: "Moderate risk, multi-asset alpha" },
                    { title: "Aggressive Alpha", desc: "High volatility, leveraged growth" }
                  ].map((risk) => (
                    <div
                      key={risk.title}
                      onClick={() => setRiskPreference(risk.title)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left ${
                        riskPreference === risk.title ? 'bg-indigo-50/70 border-indigo-500 text-indigo-900 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold">{risk.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{risk.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-2/3 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Next: Notifications
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Notifications & Finalize */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 mb-2">SQ Platform Notification Preferences</label>
              
              <div className="space-y-2">
                {[
                  { id: 'priceAlerts', label: 'Real-Time Price & Volatility Alerts', desc: 'Instant SSE push when watchlisted assets move > 3%' },
                  { id: 'securityAlerts', label: 'Security & Login Audit Notifications', desc: 'Instant email alerts on new device logins or 2FA checks' },
                  { id: 'executionReports', label: 'Trade & Portfolio Execution Reports', desc: 'Automated confirmations and risk balance summaries' },
                  { id: 'weeklyDigest', label: 'Weekly Macro & Analyst Digest', desc: 'Comprehensive SQ Platform market outlook report' }
                ].map((pref) => (
                  <div
                    key={pref.id}
                    onClick={() => setNotifications({ ...notifications, [pref.id]: !(notifications as any)[pref.id] })}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{pref.label}</p>
                      <p className="text-[10px] text-slate-500">{pref.desc}</p>
                    </div>
                    <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      (notifications as any)[pref.id] ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        (notifications as any)[pref.id] ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Your SQ Platform profile is ready. You can modify these settings anytime in Account Security.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-2/3 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Saving Profile...' : 'Finish SQ Platform Setup'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
