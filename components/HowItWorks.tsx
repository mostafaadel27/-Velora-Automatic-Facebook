"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MessageSquareText } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Connect your Facebook Page",
    desc: "Securely link your Facebook account to Velora with one click. No technical setup."
  },
  {
    num: "02",
    title: "Set your trigger keywords",
    desc: "Define words like 'price' or 'details' on specific posts to activate the automation."
  },
  {
    num: "03",
    title: "Design the Messenger flow",
    desc: "Set up sequential automated replies and interactive buttons to guide users to a sale."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-zinc-50 dark:bg-[#0a0a0a] border-y border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
              Launch in Minutes. <br />
              <span className="text-foreground/50">Automate Forever.</span>
            </h2>
            
            <div className="space-y-8">
              {steps.map((step, i) => (
                <motion.div 
                  key={step.num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.5 }}
                  className="flex gap-6 relative group"
                >
                  <div className="text-2xl font-bold text-zinc-300 dark:text-zinc-700 group-hover:text-primary transition-colors">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-primary/5 opacity-50 pointer-events-none" />
            
            <div className="w-full max-w-sm rounded-2xl bg-black border border-zinc-800 p-6 shadow-2xl relative z-10">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                   <MessageSquareText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Messenger</h4>
                  <div className="flex items-center text-xs text-green-400 gap-1">
                    <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Bot Active
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-zinc-900 text-zinc-300 p-3 rounded-2xl rounded-tl-sm text-sm border border-zinc-800 w-[85%]">
                  Hi! We saw you commented "price" on our latest post. Are you looking to buy a Laptop or a Tablet?
                  <div className="flex gap-2 flex-col mt-3">
                    <button className="w-full text-center text-xs p-2 bg-blue-600/10 text-blue-400 border border-blue-600/30 rounded-lg">Laptop</button>
                    <button className="w-full text-center text-xs p-2 bg-blue-600/10 text-blue-400 border border-blue-600/30 rounded-lg">Tablet</button>
                  </div>
                </div>
                <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm text-sm w-max ml-auto shadow-lg shadow-blue-600/20 text-right">
                  Laptop
                </div>
                <div className="bg-zinc-900 text-zinc-300 p-3 rounded-2xl rounded-tl-sm text-sm border border-zinc-800">
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span>Great choice! Here is a special 20% discount link for our new Laptops: <span className="text-blue-400 cursor-pointer hover:underline">checkout.url</span></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
