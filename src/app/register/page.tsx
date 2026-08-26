'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, User, Mail, Phone, School, BookOpen, Calendar, 
  Globe, Ticket, CreditCard, CheckCircle2, ShieldAlert, 
  Download, ArrowRight, ArrowLeft, RefreshCw, Check, Loader2, Tag
} from 'lucide-react';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, refreshUser } = useAuth();

  // Pre-fill from query params if coming from Login/Google redirects
  const initialEmail = searchParams.get('email') || '';
  const initialName = searchParams.get('name') || '';

  // Form Fields
  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    phone: '',
    college: '',
    branch: '',
    year: '1st Year',
    gender: 'Male',
    linkedin: '',
    portfolio: ''
  });

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // UI Flow States: 'details' (Phase 1) | 'payment' (Phase 2) | 'verifying' | 'confirmation' (Phase 3)
  const [currentPhase, setCurrentPhase] = useState<'details' | 'payment' | 'verifying' | 'confirmation'>('details');
  const [loading, setLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState<string>('');
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  
  // General Alert Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');

  // Payment Confirmation / Receipt details
  const [paidUser, setPaidUser] = useState<any>(null);
  const [receiptDetails, setReceiptDetails] = useState<any>(null);

  // Sync user state on load or login
  useEffect(() => {
    if (user) {
      if (user.paymentStatus === 'paid' || user.registrationStatus === 'CONFIRMED') {
        if (currentPhase !== 'confirmation') {
          if (user.teamId) {
            router.push('/dashboard');
          } else {
            router.push('/get-in');
          }
        }
      } else {
        // Pre-fill existing user info if pending
        setFormData(prev => ({
          name: prev.name || user.name || '',
          email: prev.email || user.email || '',
          phone: prev.phone || user.phone || '',
          college: prev.college || user.college || '',
          branch: prev.branch || user.branch || '',
          year: prev.year || user.year || '1st Year',
          gender: prev.gender || user.gender || 'Male',
          linkedin: prev.linkedin || user.linkedin || '',
          portfolio: prev.portfolio || user.portfolio || ''
        }));
        if (user.registrationId) {
          setRegistrationId(user.registrationId);
        }
        if (user.currentPhase === 'PAYMENT' || user.registrationStatus === 'DETAILS_SUBMITTED' || user.registrationStatus === 'PAYMENT_PENDING') {
          setCurrentPhase('payment');
        }
      }
    }
  }, [user, router, currentPhase]);

  // Load Razorpay checkout script proactively
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Handle Input Changes & Clear specific field error
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
    if (errorMsg) setErrorMsg('');
  };

  // Validate Phase 1 Form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.college.trim()) {
      newErrors.college = 'College/Organization name is required';
    }
    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch / Specialization is required';
    }
    if (!formData.linkedin.trim()) {
      newErrors.linkedin = 'LinkedIn profile URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Submit Phase 1 Details -> Saves immediately to Backend Database
  const handlePhase1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrorMsg('');
    setPaymentNotice('');
    setLoading(true);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/register/phase1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Failed to save registration details. Please try again.');
        setLoading(false);
        return;
      }

      // Login session
      if (data.token && data.user) {
        login(data.token, data.user);
      }

      setRegistrationId(data.registrationId || data.user?.registrationId || 'DT26-PENDING');

      if (data.alreadyConfirmed) {
        // User has already paid
        setPaidUser(data.user);
        setCurrentPhase('confirmation');
      } else {
        // Move to Phase 2: Payment
        setCurrentPhase('payment');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not connect to server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Validate & Apply Coupon Code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode.trim(), 
          college: formData.college 
        })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponSuccess(`Coupon ${data.code} applied! Saved ₹${data.discountAmount}`);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.message || 'Invalid or inactive coupon code');
      }
    } catch (err) {
      console.error(err);
      setCouponError('Error validating coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };

  // Step 2: Handle Payment (Razorpay or Free 100% Discount)
  const handleInitiatePayment = async () => {
    setErrorMsg('');
    setPaymentNotice('');
    setLoading(true);

    const tokenToUse = localStorage.getItem('designthon_token');
    if (!tokenToUse) {
      setErrorMsg('Session expired. Please re-enter your details.');
      setCurrentPhase('details');
      setLoading(false);
      return;
    }

    const price = appliedCoupon ? appliedCoupon.finalPrice : 1000;

    // If 100% discount (₹0 payable)
    if (price === 0) {
      try {
        setPaymentStepVerifying();
        const freeRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/payments/verify-free', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenToUse}`
          },
          body: JSON.stringify({ couponCode: appliedCoupon.code })
        });
        const freeData = await freeRes.json();
        if (freeRes.ok && freeData.success) {
          login(tokenToUse, freeData.user);
          setPaidUser(freeData.user);
          setReceiptDetails({
            receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            amount: 0,
            couponUsed: appliedCoupon.code,
            discount: 1000,
            paymentId: freeData.user.paymentId,
            registrationId: freeData.user.registrationId || registrationId
          });
          await refreshUser();
          setCurrentPhase('confirmation');
        } else {
          setErrorMsg(freeData.message || 'Failed to apply 100% coupon.');
          setCurrentPhase('payment');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Error confirming free coupon registration.');
        setCurrentPhase('payment');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Standard Paid Flow via Razorpay
    try {
      const orderRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
          amount: price,
          couponCode: appliedCoupon?.code || undefined
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setErrorMsg(orderData.message || 'Failed to create payment order. Please try again.');
        setLoading(false);
        return;
      }

      const isScriptLoaded = typeof window !== 'undefined' && (window as any).Razorpay
        ? true
        : await loadRazorpayScript();

      if (!isScriptLoaded) {
        setErrorMsg('Failed to load Razorpay payment gateway. Please check your internet connection.');
        setLoading(false);
        return;
      }

      const options = {
        key: 'rzp_live_TCCObXZRQiSVV7',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'DESIGNATHON 2026',
        description: 'Individual 2-Day Pass Registration',
        order_id: orderData.id,
        handler: async function (response: any) {
          await handlePaymentVerification(response);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#7c3aed'
        },
        modal: {
          ondismiss: async function () {
            setLoading(false);
            setPaymentNotice('Payment was not completed. Your details are saved — you can retry payment whenever you are ready.');
            // Send cancellation/pending status update to backend
            try {
              await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/payments/status-update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${tokenToUse}`
                },
                body: JSON.stringify({ status: 'PAYMENT_PENDING', phase: 'PAYMENT' })
              });
            } catch {}
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', async function (response: any) {
        setLoading(false);
        setErrorMsg(`Payment failed: ${response.error?.description || 'Transaction declined by bank.'}`);
        try {
          await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/payments/status-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenToUse}`
            },
            body: JSON.stringify({ status: 'PAYMENT_FAILED', phase: 'PAYMENT' })
          });
        } catch {}
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error connecting to payment provider.');
      setLoading(false);
    }
  };

  const setPaymentStepVerifying = () => {
    setCurrentPhase('verifying');
  };

  // Step 2.5: Verify Real Razorpay Payment Signature
  const handlePaymentVerification = async (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    setLoading(true);
    setCurrentPhase('verifying');
    setErrorMsg('');
    setPaymentNotice('');

    const tokenToUse = localStorage.getItem('designthon_token');
    const finalAmount = appliedCoupon ? appliedCoupon.finalPrice : 1000;

    try {
      const verifyRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          couponCode: appliedCoupon?.code || undefined,
          amount: finalAmount
        })
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        login(tokenToUse!, verifyData.user);
        setPaidUser(verifyData.user);
        
        setReceiptDetails({
          receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: finalAmount,
          couponUsed: appliedCoupon?.code || 'None',
          discount: appliedCoupon ? (1000 - appliedCoupon.finalPrice) : 0,
          paymentId: verifyData.user.paymentId,
          registrationId: verifyData.user.registrationId || registrationId
        });

        await refreshUser();
        setCurrentPhase('confirmation');
      } else {
        setErrorMsg(verifyData.message || 'Payment signature verification failed.');
        setCurrentPhase('payment');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error confirming payment. Please contact support if money was debited.');
      setCurrentPhase('payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const finalPayable = appliedCoupon ? appliedCoupon.finalPrice : 1000;

  return (
    <div className="flex-1 w-full bg-[#03030f] relative overflow-hidden bg-grid flex items-center justify-center py-16 px-4">
      {/* Glow decorations */}
      <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[45%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-2xl glass-panel border-white/5 rounded-3xl p-6 sm:p-8 relative backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 left-[50%] transform -translate-x-[50%] h-[1px] w-[80%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Phase Indicator Header */}
        <div className="mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Step 1: Details */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentPhase === 'details'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/30'
                  : currentPhase === 'payment' || currentPhase === 'verifying' || currentPhase === 'confirmation'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-zinc-500'
              }`}>
                {currentPhase === 'payment' || currentPhase === 'verifying' || currentPhase === 'confirmation' ? (
                  <Check className="h-4 w-4" />
                ) : '1'}
              </div>
              <span className={`text-[10px] font-semibold ${
                currentPhase === 'details' ? 'text-white' : 'text-zinc-400'
              }`}>
                Registration
              </span>
            </div>

            {/* Connecting line 1 */}
            <div className={`flex-1 h-[2px] mx-2 transition-all ${
              currentPhase !== 'details' ? 'bg-emerald-500/40' : 'bg-white/10'
            }`} />

            {/* Step 2: Payment */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentPhase === 'payment' || currentPhase === 'verifying'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/30'
                  : currentPhase === 'confirmation'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-zinc-500'
              }`}>
                {currentPhase === 'confirmation' ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className={`text-[10px] font-semibold ${
                currentPhase === 'payment' || currentPhase === 'verifying' ? 'text-white' : 'text-zinc-500'
              }`}>
                Payment
              </span>
            </div>

            {/* Connecting line 2 */}
            <div className={`flex-1 h-[2px] mx-2 transition-all ${
              currentPhase === 'confirmation' ? 'bg-emerald-500/40' : 'bg-white/10'
            }`} />

            {/* Step 3: Confirmation */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentPhase === 'confirmation'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                  : 'bg-white/5 text-zinc-500'
              }`}>
                3
              </div>
              <span className={`text-[10px] font-semibold ${
                currentPhase === 'confirmation' ? 'text-white' : 'text-zinc-500'
              }`}>
                Pass & Receipt
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs mb-6 flex gap-2.5 items-start leading-relaxed">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Payment Notice (e.g. on dismissal) */}
        {paymentNotice && currentPhase === 'payment' && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs mb-6 flex gap-2.5 items-start leading-relaxed">
            <Sparkles className="h-4.5 w-4.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>{paymentNotice}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- PHASE 1: REGISTRATION DETAILS FORM --- */}
        {/* ========================================================================= */}
        {currentPhase === 'details' && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-300 backdrop-blur-md mb-2.5">
                <Sparkles className="h-3 w-3 text-amber-400" />
                Phase 1: Enter Attendee Details
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">DESIGNATHON 2026 Registration</h1>
              <p className="text-xs text-zinc-400 mt-1">₹1000 all-inclusive individual fee • Teams formed after confirmation.</p>
              
              {/* Event inclusion pills */}
              <div className="mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-around gap-2 text-left sm:text-center text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-zinc-300 font-medium"><strong className="text-white">Day 1:</strong> Hands-on Workshop</span>
                </div>
                <span className="hidden sm:inline text-zinc-600">•</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-zinc-300 font-medium"><strong className="text-white">Day 2:</strong> UI/UX Hackathon</span>
                </div>
                <span className="hidden sm:inline text-zinc-600">•</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-zinc-300 font-medium">Food & Certificate</span>
                </div>
              </div>
            </div>

            <form onSubmit={handlePhase1Submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">Full Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><User className="h-4 w-4" /></span>
                    <input 
                      id="name" 
                      type="text" 
                      placeholder="Aarav Sharma" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className={`block w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-all ${
                        errors.name ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-purple-500/50'
                      }`} 
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-rose-400 mt-1 pl-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">Email Address *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Mail className="h-4 w-4" /></span>
                    <input 
                      id="email" 
                      type="email" 
                      placeholder="aarav@college.edu" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className={`block w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-all ${
                        errors.email ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-purple-500/50'
                      }`} 
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-rose-400 mt-1 pl-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">Phone Number (10 Digits) *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Phone className="h-4 w-4" /></span>
                    <input 
                      id="phone" 
                      type="tel" 
                      maxLength={14}
                      placeholder="9876543210" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className={`block w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-all ${
                        errors.phone ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-purple-500/50'
                      }`} 
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-rose-400 mt-1 pl-1">{errors.phone}</p>}
                </div>

                {/* College */}
                <div>
                  <label htmlFor="college" className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">College / Organization *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><School className="h-4 w-4" /></span>
                    <input 
                      id="college" 
                      type="text" 
                      placeholder="JNTUH / VNR VJIET / MGIT" 
                      value={formData.college} 
                      onChange={handleChange} 
                      className={`block w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-all ${
                        errors.college ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-purple-500/50'
                      }`} 
                    />
                  </div>
                  {errors.college && <p className="text-[10px] text-rose-400 mt-1 pl-1">{errors.college}</p>}
                </div>

                {/* Branch */}
                <div>
                  <label htmlFor="branch" className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">Branch / Field *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><BookOpen className="h-4 w-4" /></span>
                    <input 
                      id="branch" 
                      type="text" 
                      placeholder="CSE / UI-UX / IT / ECE" 
                      value={formData.branch} 
                      onChange={handleChange} 
                      className={`block w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-all ${
                        errors.branch ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-purple-500/50'
                      }`} 
                    />
                  </div>
                  {errors.branch && <p className="text-[10px] text-rose-400 mt-1 pl-1">{errors.branch}</p>}
                </div>

                {/* Year */}
                <div>
                  <label htmlFor="year" className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">Academic Year *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Calendar className="h-4 w-4" /></span>
                    <select 
                      id="year" 
                      value={formData.year} 
                      onChange={handleChange} 
                      className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#050514]/60 text-zinc-200 focus:outline-none focus:border-purple-500/50 text-xs"
                    >
                      <option className="bg-[#0b0b1a] text-zinc-300">1st Year</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">2nd Year</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">3rd Year</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">4th Year</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">Postgraduate</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">Working Professional</option>
                    </select>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">Gender *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><User className="h-4 w-4" /></span>
                    <select 
                      id="gender" 
                      value={formData.gender} 
                      onChange={handleChange} 
                      className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#050514]/60 text-zinc-200 focus:outline-none focus:border-purple-500/50 text-xs"
                    >
                      <option className="bg-[#0b0b1a] text-zinc-300">Male</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">Female</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">Other</option>
                    </select>
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label htmlFor="linkedin" className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">LinkedIn URL *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Globe className="h-4 w-4" /></span>
                    <input 
                      id="linkedin" 
                      type="url" 
                      placeholder="https://linkedin.com/in/aaravsharma" 
                      value={formData.linkedin} 
                      onChange={handleChange} 
                      className={`block w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none text-xs transition-all ${
                        errors.linkedin ? 'border-rose-500/60 focus:border-rose-500' : 'border-white/10 focus:border-purple-500/50'
                      }`} 
                    />
                  </div>
                  {errors.linkedin && <p className="text-[10px] text-rose-400 mt-1 pl-1">{errors.linkedin}</p>}
                </div>
              </div>

              {/* Portfolio */}
              <div className="text-left">
                <label htmlFor="portfolio" className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">Portfolio / Behance / GitHub (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Globe className="h-4 w-4" /></span>
                  <input 
                    id="portfolio" 
                    type="url" 
                    placeholder="https://behance.net/aaravsharma" 
                    value={formData.portfolio} 
                    onChange={handleChange} 
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-xs" 
                  />
                </div>
              </div>

              {/* Submit Phase 1 Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs shadow-lg shadow-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Registration Details...</span>
                    </>
                  ) : (
                    <>
                      <span>Next: Proceed to Payment</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-zinc-500 text-center mt-2">
                  Your participant record will be securely registered before payment.
                </p>
              </div>
            </form>
          </>
        )}

        {/* ========================================================================= */}
        {/* --- PHASE 2: PAYMENT & COUPON SCREEN --- */}
        {/* ========================================================================= */}
        {currentPhase === 'payment' && (
          <div className="space-y-6 text-left animate-fade-in">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-purple-300 backdrop-blur-md mb-2.5">
                <CreditCard className="h-3.5 w-3.5 text-purple-400" />
                Phase 2: Payment & Entry Pass Confirmation
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Complete Your Pass Payment</h1>
              <p className="text-xs text-zinc-400 mt-1">Review your details, apply college coupon codes, and authorize payment.</p>
            </div>

            {/* Attendee Summary Card */}
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] relative overflow-hidden">
              <div className="flex items-start justify-between gap-4 mb-3 border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Registered Attendee</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{formData.name}</h3>
                  <p className="text-xxs text-zinc-400">{formData.email} • {formData.phone}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] text-purple-400 font-mono font-bold bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                    {registrationId || 'DT26-REGISTERED'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPhase('details')}
                    className="text-[10px] text-zinc-400 hover:text-white underline mt-1 cursor-pointer transition-colors"
                  >
                    Edit details
                  </button>
                </div>
              </div>
              <div className="text-xxs text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                <span>College: <strong className="text-zinc-200">{formData.college}</strong></span>
                <span>Branch: <strong className="text-zinc-200">{formData.branch}</strong></span>
                <span>Year: <strong className="text-zinc-200">{formData.year}</strong></span>
              </div>
            </div>

            {/* Coupon Code Box */}
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.01] space-y-3">
              <label htmlFor="coupon" className="block text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-purple-400" />
                Apply College / Partner Coupon
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Ticket className="h-4 w-4" />
                  </span>
                  <input
                    id="coupon"
                    type="text"
                    placeholder="e.g. JNTUH50, VNR20, MGIT100"
                    value={couponCode}
                    disabled={!!appliedCoupon || couponLoading}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-xs font-mono"
                  />
                </div>

                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    {couponLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Apply</span>
                  </button>
                )}
              </div>

              {couponSuccess && (
                <p className="text-xxs text-emerald-400 font-semibold pl-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{couponSuccess}</span>
                </p>
              )}
              {couponError && (
                <p className="text-xxs text-rose-400 font-semibold pl-1">
                  ✕ {couponError}
                </p>
              )}
            </div>

            {/* Price Breakdown Calculation */}
            <div className="border border-white/10 rounded-2xl p-4 bg-white/[0.01] space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Standard Individual Pass (2 Days)</span>
                <span className="font-mono">₹1000</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-mono">-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-white text-sm border-t border-white/10 pt-3">
                <span>Grand Total to Pay</span>
                <span className="text-gradient font-mono text-base">₹{finalPayable}</span>
              </div>
            </div>

            {/* Pay Button & Back Action */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs shadow-lg shadow-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Payment Session...</span>
                  </>
                ) : finalPayable === 0 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Confirm Free Registration Pass (₹0)</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Authorize & Pay ₹{finalPayable}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPhase('details')}
                disabled={loading}
                className="w-full py-2.5 text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Phase 1 Details</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- PHASE 2.5: VERIFYING PAYMENT LOADER --- */}
        {/* ========================================================================= */}
        {currentPhase === 'verifying' && (
          <div className="py-12 text-center flex flex-col items-center justify-center animate-fade-in">
            {/* Spinning Ring */}
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-white/5" />
              <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
              <div className="absolute w-12 h-12 rounded-full bg-purple-950/20 border border-purple-500/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-400 animate-pulse" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight">Verifying Payment Security...</h1>
            <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
              We are confirming transaction signature and generating your official DESIGNATHON Entry Pass. Please do not refresh.
            </p>

            <div className="mt-8 space-y-2 w-full max-w-xs text-left border-t border-white/5 pt-6">
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Payment authorization verified</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <Loader2 className="h-4 w-4 text-purple-400 animate-spin flex-shrink-0" />
                <span>Issuing official registration ID...</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-500">
                <div className="h-2 w-2 rounded-full bg-zinc-700 mx-1 flex-shrink-0" />
                <span>Sending confirmation pass to email</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- PHASE 3: CONFIRMATION ENTRY PASS & RECEIPT --- */}
        {/* ========================================================================= */}
        {currentPhase === 'confirmation' && paidUser && receiptDetails && (
          <div className="py-4 text-center animate-fade-in">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-full border border-emerald-500/25 text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight">Registration Confirmed!</h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Welcome, {paidUser.name}! Your payment has been verified and your ticket is secured.
            </p>

            {/* Printable Entry Pass Frame */}
            <div id="print-receipt" className="my-6 p-6 rounded-2xl border border-white/10 bg-[#060618]/90 text-left relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-emerald-400 text-[10px] px-3 py-1 font-semibold uppercase font-mono">
                CONFIRMED PASS
              </div>
              
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wider font-mono">DESIGNATHON 2026</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Cohort, Hyderabad, India</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-zinc-500">Registration ID</p>
                  <p className="text-xs font-bold text-purple-300 font-mono">{receiptDetails.registrationId || registrationId}</p>
                </div>
              </div>

              {/* Pass details */}
              <div className="space-y-2.5 text-xs border-b border-white/5 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Attendee Name</span>
                  <span className="font-semibold text-zinc-200">{paidUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Email Address</span>
                  <span className="font-medium text-zinc-300 font-mono text-[11px]">{paidUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">College / Org</span>
                  <span className="font-medium text-zinc-200">{paidUser.college}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date Issued</span>
                  <span className="font-medium text-zinc-300">{receiptDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction ID</span>
                  <span className="font-medium text-zinc-300 font-mono text-[10px]">{receiptDetails.paymentId}</span>
                </div>
                {receiptDetails.couponUsed !== 'None' && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Applied</span>
                    <span>{receiptDetails.couponUsed} (-₹{receiptDetails.discount})</span>
                  </div>
                )}
              </div>

              {/* Total Paid & QR Code for Check-in */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-500">Grand Total Paid</p>
                  <p className="text-xl font-extrabold text-white font-mono">₹{receiptDetails.amount}</p>
                </div>
                <div className="h-16 w-16 bg-white p-1 rounded-lg">
                  <img
                    src={`https://quickchart.io/qr?text=${encodeURIComponent(paidUser.id)}&size=100&margin=1`}
                    alt="Attendee Check-in QR"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-zinc-500 text-center leading-normal">
                Present this QR pass at the check-in desk during the event for entry badge verification.
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="h-4 w-4" />
                Print / Save Pass
              </button>

              <button
                onClick={() => router.push('/get-in')}
                className="flex-1 py-3 px-4 bg-white hover:bg-zinc-100 text-black font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Get In (Join Team)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full bg-[#03030f] flex items-center justify-center text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}

