"use client";

import { motion } from "framer-motion";

const companies = [
  "Acme Corp", "Quantum", "Echo Valley", "Globex", "Initech", "Soylent"
];

export function TrustedBy() {
  return (
    <section className="py-12 bg-zinc-50 dark:bg-black border-y border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-zinc-500 uppercase tracking-widest mb-8">
          Trusted by innovative teams worldwide
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {companies.map((company, i) => (
            <motion.div
              key={company}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-xl md:text-2xl font-bold text-zinc-400 dark:text-zinc-600 tracking-tighter"
            >
              {company}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
