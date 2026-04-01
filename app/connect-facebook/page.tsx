"use client";

import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function ConnectFacebook() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // If they aren't logged in at all, send them to login
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // If they are logged in and already connected to Facebook, send them to dashboard
    if (status === "authenticated" && (session?.user as any)?.facebookConnected) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleConnect = async () => {
    setIsConnecting(true);
    await signIn("facebook", { callbackUrl: "/dashboard" });
  };

  if (status === "loading" || (session?.user as any)?.facebookConnected) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0f0f11] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a] overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-2xl text-center">
          
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full mx-auto flex items-center justify-center mb-6">
            <svg className="w-10 h-10 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-3">
            One Last Step
          </h1>
          
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm mx-auto leading-relaxed">
            To use Velora's automation tools, you must connect your Facebook account. We need this to manage your page's messages.
          </p>

          <div className="bg-blue-50 dark:bg-zinc-800/50 rounded-2xl p-5 mb-8 text-left border border-blue-100 dark:border-zinc-700/50">
            <h4 className="flex items-center gap-2 font-semibold text-black dark:text-white mb-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Secure Connection
            </h4>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-disc list-inside">
              <li>Read and reply to messages</li>
              <li>Setup automated responses</li>
              <li>You can revoke access anytime</li>
            </ul>
          </div>

          <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1864D9] disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Connect Facebook Account
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
