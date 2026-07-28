'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, User, Mail, Phone, School, BookOpen, Calendar, Eye, Globe, Ticket, CreditCard, CheckCircle2, ShieldAlert, Download, Plus, Search, ArrowRight } from 'lucide-react';
const loadRazorpayScript = () => {
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

  // UI Flow States
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Payment states
  const [paymentStep, setPaymentStep] = useState<'form' | 'razorpay' | 'success'>('form');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paidUser, setPaidUser] = useState<any>(null);
  const [receiptDetails, setReceiptDetails] = useState<any>(null);

  // If user is already registered and paid, redirect appropriately
  useEffect(() => {
    if (user && user.paymentStatus === 'paid') {
      if (user.teamId) {
        router.push('/dashboard');
      } else {
        router.push('/get-in');
      }
    }
  }, [user, router]);

  // Proactively load Razorpay checkout script on page mount to reduce latency
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Validate and Apply Coupon Code
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponError('');
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, college: formData.college })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      console.error(err);
      setCouponError('Error validating coupon code');
    }
  };

  // Step 1: Submit Form -> Create Order & Open Razorpay Simulation
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const price = appliedCoupon ? appliedCoupon.finalPrice : 1000;

    try {
      // 1. Create/Verify User account first
      const signupRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: '123456' // Mock OTP bypass
        })
      });

      const signupData = await signupRes.json();
      if (!signupRes.ok && signupRes.status !== 202) {
        setErrorMsg(signupData.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      const verifiedUserToken = signupData.token;
      const verifiedUser = signupData.user;

      // Log in client session
      if (verifiedUserToken && verifiedUser) {
        login(verifiedUserToken, verifiedUser);
      }

      // 2. Create Razorpay order
      const activeToken = verifiedUserToken || localStorage.getItem('designthon_token');
      const orderRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ amount: price })
      });

      const orderData = await orderRes.json();
      if (orderRes.ok) {
        setCreatedOrder(orderData);

        const isScriptLoaded = typeof window !== 'undefined' && (window as any).Razorpay
          ? true
          : await loadRazorpayScript();
        if (!isScriptLoaded) {
          setErrorMsg('Failed to load Razorpay SDK. Please check your internet connection.');
          setLoading(false);
          return;
        }

        const options = {
          key: 'rzp_live_TCCObXZRQiSVV7',
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'DESIGNTHON 2026',
          description: 'Registration Fee',
          order_id: orderData.id,
          handler: async function (response: any) {
            await handleRealPaymentVerify(response);
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
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setErrorMsg(orderData.message || 'Failed to create payment order.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection error. Please try again.');
      setLoading(false);
    }
  };

  // Step 2: Complete Real Razorpay payment verification
  const handleRealPaymentVerify = async (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    setLoading(true);
    setErrorMsg('');

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
        // Update user state
        login(tokenToUse!, verifyData.user);
        setPaidUser(verifyData.user);
        
        // Setup receipt info
        setReceiptDetails({
          receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString(),
          amount: finalAmount,
          couponUsed: appliedCoupon?.code || 'None',
          discount: appliedCoupon ? (1000 - appliedCoupon.finalPrice) : 0,
          paymentId: verifyData.user.paymentId,
        });

        // Refresh user context profile
        await refreshUser();
        setPaymentStep('success');
      } else {
        setErrorMsg(verifyData.message || 'Payment verification failed.');
        setPaymentStep('form');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error confirming payment verification.');
      setPaymentStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 w-full bg-[#03030f] relative overflow-hidden bg-grid flex items-center justify-center py-20 px-4">
      {/* Glow decorations */}
      <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[45%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-2xl glass-panel border-white/5 rounded-3xl p-8 relative backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 left-[50%] transform -translate-x-[50%] h-[1px] w-[80%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* --- STEP 1: REGISTRATION FORM --- */}
        {paymentStep === 'form' && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-400 backdrop-blur-md mb-3">
                <Sparkles className="h-3 w-3" />
                Step 1: Individual Registration Details
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">DESIGNTHON 2026 Registration</h1>
              <p className="text-xs text-zinc-500 mt-1">₹1000 entry fee per student. Teams will be created after payment.</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs mb-6 flex gap-2.5 items-start leading-relaxed">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-zinc-400 mb-1.5 pl-1 uppercase">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><User className="h-4 w-4" /></span>
                    <input id="name" type="text" required placeholder="John Doe" value={formData.name} onChange={handleChange} className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-xs" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 mb-1.5 pl-1 uppercase">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Mail className="h-4 w-4" /></span>
                    <input id="email" type="email" required placeholder="john@college.edu" value={formData.email} onChange={handleChange} className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-xs" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-zinc-400 mb-1.5 pl-1 uppercase">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Phone className="h-4 w-4" /></span>
                    <input id="phone" type="tel" required placeholder="9876543210" value={formData.phone} onChange={handleChange} className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-xs" />
                  </div>
                </div>

                {/* College */}
                <div>
                  <label htmlFor="college" className="block text-xs font-semibold text-zinc-400 mb-1.5 pl-1 uppercase">College Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><School className="h-4 w-4" /></span>
                    <input id="college" type="text" required placeholder="VNR Vignana Jyothi / JNTUH" value={formData.college} onChange={handleChange} className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-xs" />
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label htmlFor="branch" className="block text-xs font-semibold text-zinc-400 mb-1.5 pl-1 uppercase">Branch / Specialization</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><BookOpen className="h-4 w-4" /></span>
                    <input id="branch" type="text" required placeholder="CSE / UI-UX Design" value={formData.branch} onChange={handleChange} className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-xs" />
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label htmlFor="year" className="block text-xs font-semibold text-zinc-400 mb-1.5 pl-1 uppercase">Current Year</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Calendar className="h-4 w-4" /></span>
                    <select id="year" value={formData.year} onChange={handleChange} className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-300 focus:outline-none focus:border-purple-500/50 text-xs">
                      <option className="bg-[#0b0b1a] text-zinc-300">1st Year</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">2nd Year</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">3rd Year</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">4th Year</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">Postgraduate</option>
                    </select>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-xs font-semibold text-zinc-400 mb-1.5 pl-1 uppercase">Gender</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><User className="h-4 w-4" /></span>
                    <select id="gender" value={formData.gender} onChange={handleChange} className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-300 focus:outline-none focus:border-purple-500/50 text-xs">
                      <option className="bg-[#0b0b1a] text-zinc-300">Male</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">Female</option>
                      <option className="bg-[#0b0b1a] text-zinc-300">Other</option>
                    </select>
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label htmlFor="linkedin" className="block text-xs font-semibold text-zinc-400 mb-1.5 pl-1 uppercase">LinkedIn URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Globe className="h-4 w-4" /></span>
                    <input id="linkedin" type="url" required placeholder="https://linkedin.com/in/username" value={formData.linkedin} onChange={handleChange} className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-xs" />
                  </div>
                </div>
              </div>

              {/* Portfolio */}
              <div>
                <label htmlFor="portfolio" className="block text-xs font-semibold text-zinc-400 mb-1.5 pl-1 uppercase">Portfolio / Behance / Dribbble (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Globe className="h-4 w-4" /></span>
                  <input id="portfolio" type="url" placeholder="https://behance.net/username" value={formData.portfolio} onChange={handleChange} className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-xs" />
                </div>
              </div>

              {/* Coupon Management */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
                <label htmlFor="coupon" className="block text-xs font-semibold text-zinc-400 pl-1 uppercase">Coupon Discount Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500"><Ticket className="h-4 w-4" /></span>
                    <input
                      id="coupon"
                      type="text"
                      placeholder="e.g. JNTUH50, VNR20, MGIT100"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="block w-full pl-10 pr-4 py-2 rounded-lg border border-white/5 bg-[#050514]/60 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Apply Coupon
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xxs text-emerald-400 font-semibold pl-1">
                    ✓ Code Applied! Final Price: ₹{appliedCoupon.finalPrice} ({appliedCoupon.discountValue}% discount applied)
                  </p>
                )}
                {couponError && (
                  <p className="text-xxs text-rose-400 font-semibold pl-1">✕ {couponError}</p>
                )}
              </div>

              {/* Price Calculation details */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Standard Registration Fee</span>
                  <span>₹1000</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white text-sm border-t border-white/5 pt-2">
                  <span>Grand Total to Pay</span>
                  <span className="text-gradient">₹{appliedCoupon ? appliedCoupon.finalPrice : 1000}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs shadow-lg shadow-white/5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processing Registration...' : 'Authorize and Proceed to Payment'}
                <CreditCard className="h-4 w-4" />
              </button>
            </form>
          </>
        )}

        {/* --- STEP 3: PAYMENT SUCCESS / RECEIPT --- */}
        {paymentStep === 'success' && receiptDetails && paidUser && (
          <div className="py-4 text-center">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-full border border-emerald-500/25 text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight">Registration Successful!</h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Thank you, {paidUser.name}! Your payment was verified, and your entry ticket has been dispatched.
            </p>

            {/* Printable Receipt Frame */}
            <div id="print-receipt" className="my-8 p-6 rounded-2xl border border-white/10 bg-[#060618]/90 text-left relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 text-emerald-400 text-[10px] px-3 py-1 font-semibold uppercase">
                PAID RECEIPT
              </div>
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wider font-mono">DESIGNTHON 2026</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">T-Hub, Hyderabad, India</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-zinc-500">Receipt ID</p>
                  <p className="text-xs font-semibold text-zinc-200 font-mono">{receiptDetails.receiptNo}</p>
                </div>
              </div>

              {/* receipt items */}
              <div className="space-y-3 text-xs border-b border-white/5 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Participant Name</span>
                  <span className="font-medium text-zinc-200">{paidUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Email Address</span>
                  <span className="font-medium text-zinc-200">{paidUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">College Name</span>
                  <span className="font-medium text-zinc-200">{paidUser.college}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Payment Date</span>
                  <span className="font-medium text-zinc-200">{receiptDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Razorpay Ref ID</span>
                  <span className="font-medium text-zinc-200 font-mono text-[10px]">{receiptDetails.paymentId}</span>
                </div>
                {receiptDetails.couponUsed !== 'None' && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Used</span>
                    <span>{receiptDetails.couponUsed} (-₹{receiptDetails.discount})</span>
                  </div>
                )}
              </div>

              {/* Total Paid & QR */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-zinc-500">Grand Total Paid</p>
                  <p className="text-xl font-extrabold text-white font-mono">₹{receiptDetails.amount}</p>
                </div>
                {/* Embed QR Code pointing to Check-in URL using quickchart */}
                <div className="h-16 w-16 bg-white p-1 rounded-lg">
                  <img
                    src={`https://quickchart.io/qr?text=${encodeURIComponent(paidUser.id)}&size=100&margin=1`}
                    alt="Attendee QR"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-zinc-600 text-center leading-normal">
                Present this QR code at the check-in desk during the event for entry verification.
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <button
                onClick={handlePrint}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="h-4 w-4" />
                Download Receipt PDF
              </button>

              <button
                onClick={() => router.push('/get-in')}
                className="py-3 px-4 bg-white hover:bg-zinc-100 text-black font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer w-full"
              >
                <ArrowRight className="h-4 w-4" />
                Get In — Join or Create a Team
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
        Loading checkout session...
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
