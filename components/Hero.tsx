"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Zap, Bot } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Introducing Velora for Facebook
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-black dark:text-white"
          >
            Turn Comments into {" "}
            <span className="text-gradient">Customers</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Track keywords on your Facebook posts, instantly reply via Messenger, and guide leads through automated chat flows to close more sales.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:scale-105 transition-transform duration-300 flex items-center justify-center shadow-xl shadow-black/10 dark:shadow-white/10"
            >
              Start Automating Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-300"
            >
              See How It Works
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-black via-transparent to-transparent z-10 h-full w-full pointer-events-none" />
          
          {/* Mockup UI Container */}
          <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="h-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            
            <div className="p-8 grid md:grid-cols-2 gap-8 items-center h-[400px]">
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 w-4/5 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Facebook Comment</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">"Details please! How much is it?"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 w-4/5 ml-auto shadow-sm">
                  <div>
                    <h4 className="text-sm font-semibold mb-1 text-right text-primary">Velora Messenger Bot</h4>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 text-right">Hi there! Thanks for your interest ❤️ Would you like to see our Product List or Offers?</p>
                    <div className="flex gap-2 justify-end mt-2">
                      <span className="text-xs px-2 py-1 bg-white dark:bg-black border border-primary/30 rounded-md text-primary">Products</span>
                      <span className="text-xs px-2 py-1 bg-white dark:bg-black border border-primary/30 rounded-md text-primary">Offers</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/30">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex flex-col gap-4">
                 <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-sm">Comments Replied</h3>
                      <span className="text-green-500 text-xs font-bold">+120%</span>
                    </div>
                    <div className="text-4xl font-bold tracking-tight mb-2 text-gradient">2,405</div>
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[75%] rounded-full" />
                    </div>
                 </div>
                 
                 <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Engagement Rate</h3>
                      <div className="text-2xl font-bold">84%</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-green-500" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
