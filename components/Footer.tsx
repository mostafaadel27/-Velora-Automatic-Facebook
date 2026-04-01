"use client";

import Link from "next/link";
import { MessageCircle, Send, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="text-2xl font-bold tracking-tighter mb-4 block">
            Velora
          </Link>
          <p className="text-sm text-zinc-500 mb-6">
            The leading platform for turning Facebook post comments into automated Messenger sales.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
              <Send className="w-5 h-5" />
            </a>
            <a href="#" className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-sm">Product</h4>
          <ul className="space-y-3 text-sm text-zinc-500">
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Features</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Integrations</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Changelog</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-sm">Company</h4>
          <ul className="space-y-3 text-sm text-zinc-500">
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Careers</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-sm">Legal</h4>
          <ul className="space-y-3 text-sm text-zinc-500">
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Security</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500 gap-4">
        <div>&copy; {new Date().getFullYear()} Velora Inc. All rights reserved.</div>
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
