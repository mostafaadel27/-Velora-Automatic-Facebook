"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function Scale() {
  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Maximize Engagement. <br/> Never Miss a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Lead.</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-lg">
              Every ignored comment is a lost sale. Velora ensures every interacting user gets an immediate private message, driving them straight to your offers.
            </p>
            
            <div className="grid grid-cols-2 gap-8 border-t border-zinc-800 pt-8">
              <div>
                <div className="text-4xl font-extrabold text-white mb-2">24/7</div>
                <div className="text-sm font-medium text-zinc-500">Always Active</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-white mb-2">Instant</div>
                <div className="text-sm font-medium text-zinc-500">DM Delivery</div>
              </div>
            </div>
          </motion.div>
          
          <div className="relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.7 }}
               className="relative grid grid-cols-2 gap-4"
             >
                <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 aspect-square flex flex-col justify-between hover:bg-zinc-800/80 transition-colors">
                  <div className="text-emerald-400 bg-emerald-400/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">98%</div>
                    <div className="text-sm text-zinc-400">Open Rates in Messenger</div>
                  </div>
                </div>
                
                <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 aspect-square flex flex-col justify-between mt-12 hover:bg-zinc-800/80 transition-colors">
                  <div className="text-cyan-400 bg-cyan-400/10 w-12 h-12 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">10x</div>
                    <div className="text-sm text-zinc-400">Higher Convertion</div>
                  </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
