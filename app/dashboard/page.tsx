"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare, Users, Play, Pause, Settings2, ArrowRight, Workflow, MessageCircle, Zap, Send, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Automation {
  id: string;
  name: string;
  keywords: string;
  isActive: boolean;
  metricsSent: number;
  replyText: string | null;
  dmText: string | null;
}

export default function DashboardHome() {
  const { data: session } = useSession();
  const user = session?.user;
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, totalSent: 0 });
  const [pageName, setPageName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/automations")
      .then(res => res.json())
      .then(data => {
        if (data.automations) setAutomations(data.automations);
        if (data.stats) setStats(data.stats);
        if (data.pageName) setPageName(data.pageName);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleActive = async (id: string, currentState: boolean) => {
    const res = await fetch("/api/automations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !currentState }),
    });
    const data = await res.json();
    if (data.success) {
      setAutomations(prev =>
        prev.map(a => (a.id === id ? { ...a, isActive: !currentState } : a))
      );
      setStats(prev => ({
        ...prev,
        active: prev.active + (currentState ? -1 : 1),
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 relative z-10 space-y-8">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-zinc-500">
            {pageName ? `Managing ${pageName}` : "Track your Facebook automation performance."}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-left pr-5 rounded-full shadow-sm">
          {user?.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={user.image} alt={user.name || "User"} className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
               {user?.name ? user.name.charAt(0).toUpperCase() : "V"}
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-black dark:text-white leading-tight">{user?.name || "Velora Official"}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-600 font-medium">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/automations/builder" className="block">
          <button className="flex flex-col w-full h-full items-start p-6 rounded-3xl bg-primary text-white hover:bg-primary-hover transition-colors shadow-xl shadow-primary/20 group text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">Create Automation</h3>
            <p className="text-primary-50 text-sm">Build a new keyword trigger flow.</p>
          </button>
        </Link>
        
        <Link href="/dashboard/automations" className="block">
          <button className="flex flex-col items-start w-full h-full p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors shadow-sm group text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-black dark:text-white mb-1">My Automations</h3>
            <p className="text-zinc-500 text-sm">Manage your active flows.</p>
          </button>
        </Link>

        <button className="flex flex-col items-start p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors shadow-sm group text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-black dark:text-white mb-1">Analytics</h3>
          <p className="text-zinc-500 text-sm">View automation performance.</p>
        </button>
      </div>

      {/* 3. Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h4 className="text-sm font-medium text-zinc-500 mb-2">Total Automations</h4>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tight">{loading ? "-" : stats.total}</span>
            <div className="p-2 rounded-lg bg-primary/10">
              <Workflow className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h4 className="text-sm font-medium text-zinc-500 mb-2">Active Flows</h4>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-green-600">{loading ? "-" : stats.active}</span>
            <div className="p-2 rounded-lg bg-green-500/10">
              <Zap className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h4 className="text-sm font-medium text-zinc-500 mb-2">Replies Sent</h4>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-extrabold tracking-tight">{loading ? "-" : stats.totalSent}</span>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Send className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h4 className="text-sm font-medium text-zinc-500 mb-2">Connected Page</h4>
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold tracking-tight truncate">{loading ? "-" : pageName || "None"}</span>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users className="w-4 h-4 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 4. Automations */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl">Active Automations</h3>
            <Link href="/dashboard/automations" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3 flex-1 flex flex-col h-full rounded-xl">
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : automations.length > 0 ? (
              automations.slice(0, 5).map((flow) => (
                <div key={flow.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${flow.isActive ? 'bg-green-500' : 'bg-zinc-400'}`} />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm mb-0.5 truncate">{flow.name}</h4>
                      <p className="text-xs text-zinc-500 font-medium">
                        Keywords: {flow.keywords || "Any"} · {flow.metricsSent} sent
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => toggleActive(flow.id, flow.isActive)}
                      className={`p-2 rounded-lg border transition-colors shadow-sm ${
                        flow.isActive
                          ? "text-green-600 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800"
                          : "text-zinc-400 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:text-black"
                      }`}
                    >
                      {flow.isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 h-full">
                <Workflow className="w-8 h-8 text-zinc-400 mb-3" />
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No Automations Yet</h4>
                <p className="text-xs text-zinc-500 max-w-[200px] mt-1 mb-4">You haven&apos;t set up any keyword triggers.</p>
                <Link href="/dashboard/automations/builder">
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors shadow-md">
                    <Plus className="w-4 h-4" />
                    Create First Flow
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 5. Quick Overview */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl">How It Works</h3>
          </div>
          
          <div className="space-y-5 flex-1">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-0.5">Create an Automation</h4>
                <p className="text-xs text-zinc-500">Set a keyword trigger, comment reply, and DM message.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-0.5">User Comments on Post</h4>
                <p className="text-xs text-zinc-500">When someone comments with a matching keyword on your page.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-emerald-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-0.5">Auto Reply + DM</h4>
                <p className="text-xs text-zinc-500">Velora auto-replies to the comment and sends a private DM.</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Pro Tip</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Use specific keywords like &quot;price&quot;, &quot;link&quot;, or &quot;info&quot; to target high-intent commenters and convert them into leads instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
