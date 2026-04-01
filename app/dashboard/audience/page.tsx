"use client";

import { useState, useEffect } from "react";
import { Search, User, Filter, MoreHorizontal, MessageSquare, Calendar, ChevronRight, Activity } from "lucide-react";

interface Contact {
  id: string;
  psid: string;
  name: string;
  profilePic: string | null;
  totalMessages: number;
  createdAt: string;
  lastActive: string;
}

export default function AudiencePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    fetch("/api/audience")
      .then(res => res.json())
      .then(data => {
        if (data.contacts) setContacts(data.contacts);
        if (data.stats) setStats(data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.psid.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 relative z-10 space-y-8 h-full flex flex-col">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
             Audience
             <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">{stats.total} total</span>
          </h1>
          <p className="text-zinc-500">View and manage all captured leads from Facebook interactions.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:border-primary outline-none transition-colors"
              />
           </div>
           <button className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 hover:text-black dark:hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* 2. Stats Grid Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
               <User className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-sm font-medium text-zinc-500">Total Contacts</h3>
               <p className="text-2xl font-extrabold text-black dark:text-white tracking-tight">{stats.total}</p>
            </div>
         </div>
         <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
               <Activity className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-sm font-medium text-zinc-500">Active (24h)</h3>
               <p className="text-2xl font-extrabold text-black dark:text-white tracking-tight">0</p>
            </div>
         </div>
         <div className="p-6 rounded-3xl bg-zinc-900 dark:bg-primary text-white border border-transparent shadow-xl shadow-primary/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center">
               <MessageSquare className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-sm font-medium text-white/70">Conversation Rate</h3>
               <p className="text-2xl font-extrabold text-white tracking-tight">100%</p>
            </div>
         </div>
      </div>

      {/* 3. Table */}
      <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col min-h-0 shadow-sm">
         <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full text-left border-collapse min-w-[800px]">
               <thead className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                     <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Contact</th>
                     <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Captured Date</th>
                     <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Messages</th>
                     <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Last Active</th>
                     <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <span className="text-sm text-zinc-400">Loading audience...</span>
                      </td>
                    </tr>
                  ) : filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <tr key={contact.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden shrink-0">
                                 {contact.profilePic ? (
                                    <img src={contact.profilePic} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                       <User className="w-5 h-5 text-zinc-400" />
                                    </div>
                                 )}
                              </div>
                              <div className="min-w-0">
                                 <h4 className="text-sm font-bold truncate">{contact.name}</h4>
                                 <p className="text-[10px] text-zinc-500 font-medium font-mono">PSID: {contact.psid}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2 text-zinc-500 text-sm">
                              <Calendar className="w-4 h-4" />
                              {new Date(contact.createdAt).toLocaleDateString()}
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs">
                              {contact.totalMessages}
                           </span>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                              {new Date(contact.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           <p className="text-[10px] text-zinc-400">
                             {new Date(contact.lastActive).toLocaleDateString()}
                           </p>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button className="p-2 rounded-lg text-zinc-400 hover:text-primary hover:bg-primary/5 transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                           </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-32 text-center text-zinc-500">
                        <div className="w-20 h-20 rounded-[40px] bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mx-auto mb-6">
                           <User className="w-10 h-10 text-zinc-200" />
                        </div>
                        <h3 className="text-lg font-bold">Your audience is empty</h3>
                        <p className="text-sm max-w-[250px] mx-auto mt-2">
                          Once someone interacts with your Facebook page, they will appear here as a contact.
                        </p>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
         {/* Footer / Pagination */}
         <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <p className="text-xs text-zinc-500 font-medium">Showing {filteredContacts.length} of {stats.total} results</p>
            <div className="flex items-center gap-2">
               <button disabled className="p-1 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-400 cursor-not-allowed">Previous</button>
               <button disabled className="p-1 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-400 cursor-not-allowed">Next</button>
            </div>
         </div>
      </div>
    </div>
  );
}
