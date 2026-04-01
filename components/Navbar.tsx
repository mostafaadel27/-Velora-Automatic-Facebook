"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <div className="flex-shrink-0">
          <Link href="/" className="text-2xl font-bold text-gradient tracking-tighter">
            Velora
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8">
          {['Features', 'How it Works', 'Pricing'].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Link 
            href="/login" 
            className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-all shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>

        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-zinc-50 dark:bg-black border-b border-zinc-200 dark:border-zinc-800"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {['Features', 'How it Works', 'Pricing'].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Link 
                href="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
              <Link 
                href="/register" 
                className="block mt-2 px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary-hover transition-colors text-center"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
