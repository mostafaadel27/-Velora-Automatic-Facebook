"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: "error" | "success", text: string} | null>(null);

  const handleFacebookLogin = async () => {
    await signIn("facebook", { callbackUrl: "/dashboard" });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors = { name: "", email: "", password: "" };
    let isValid = true;

    if (!formData.name.trim() || formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setSubmitMessage({ type: "success", text: data.message });
          setFormData({ name: "", email: "", password: "" });
        } else {
          setSubmitMessage({ type: "error", text: data.error || "Registration failed" });
        }
      } catch (err) {
        setSubmitMessage({ type: "error", text: "Something went wrong. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a] overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-bold tracking-tighter text-gradient mb-2">
            Velora
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Start your 14-day free trial
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No credit card required. Connect your Facebook Page in seconds.
          </p>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl">
          {/* Primary Facebook Action */}
          <button 
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1864D9] text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
          >
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>

          <div className="mt-6 mb-6 flex items-center justify-center">
            <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider bg-transparent whitespace-nowrap">
              Or sign up with email
            </span>
            <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <form className="space-y-4" onSubmit={handleEmailSignup}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${errors.name ? 'text-red-400' : 'text-zinc-400'}`} />
                </div>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border ${errors.name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 focus:border-primary'} rounded-xl text-sm outline-none focus:ring-2 transition-all text-black dark:text-white`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-zinc-400'}`} />
                </div>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border ${errors.email ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 focus:border-primary'} rounded-xl text-sm outline-none focus:ring-2 transition-all text-black dark:text-white`}
                  placeholder="john@company.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-zinc-400'}`} />
                </div>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border ${errors.password ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 focus:border-primary'} rounded-xl text-sm outline-none focus:ring-2 transition-all text-black dark:text-white`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {submitMessage && (
              <div className={`p-4 rounded-xl text-sm font-medium ${submitMessage.type === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20'}`}>
                {submitMessage.text}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 px-4 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-semibold rounded-xl transition-all mt-6 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Creating Account...
                </>
              ) : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
