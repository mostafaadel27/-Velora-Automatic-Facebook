"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Play, Pause, Trash2, Workflow, Zap, MessageSquare, Send, Search } from "lucide-react";

interface Automation {
  id: string;
  name: string;
  keywords: string;
  targetPostId: string | null;
  replyText: string | null;
  dmText: string | null;
  isActive: boolean;
  metricsSent: number;
  createdAt: string;
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, totalSent: 0 });
  const [pageName, setPageName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const deleteAutomation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    const res = await fetch(`/api/automations?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setAutomations(prev => prev.filter(a => a.id !== id));
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        active: prev.active - (automations.find(a => a.id === id)?.isActive ? 1 : 0),
      }));
    }
  };

  const filtered = automations.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.keywords.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 relative z-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Automations</h1>
          <p className="text-zinc-500">
            Manage your comment-to-DM flows{pageName ? ` for ${pageName}` : ""}.
          </p>
        </div>
        <Link href="/dashboard/automations/builder">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            New Automation
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Workflow className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-zinc-500">Total Flows</span>
          </div>
          <span className="text-3xl font-extrabold">{stats.total}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm font-medium text-zinc-500">Active</span>
          </div>
          <span className="text-3xl font-extrabold text-green-600">{stats.active}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-zinc-500">Total Replies Sent</span>
          </div>
          <span className="text-3xl font-extrabold">{stats.totalSent}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search automations by name or keyword..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Automations List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-zinc-500">Loading automations...</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(auto => (
            <div
              key={auto.id}
              className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-3 h-3 rounded-full shrink-0 ${auto.isActive ? "bg-green-500 shadow-sm shadow-green-500/50" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm mb-1 truncate">{auto.name}</h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                      <Zap className="w-3 h-3" />
                      {auto.keywords || "Any keyword"}
                    </span>
                    {auto.replyText && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-medium">
                        <MessageSquare className="w-3 h-3" />
                        Comment Reply
                      </span>
                    )}
                    {auto.dmText && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-medium">
                        <Send className="w-3 h-3" />
                        DM
                      </span>
                    )}
                    {auto.targetPostId && (
                      <span className="text-xs text-zinc-400">Specific post</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <span className="text-xs text-zinc-500 font-medium mr-2">{auto.metricsSent} sent</span>
                <button
                  onClick={() => toggleActive(auto.id, auto.isActive)}
                  className={`p-2 rounded-lg border transition-colors shadow-sm ${
                    auto.isActive
                      ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800 text-green-600 hover:bg-green-100"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-black dark:hover:text-white"
                  }`}
                  title={auto.isActive ? "Pause" : "Activate"}
                >
                  {auto.isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={() => deleteAutomation(auto.id)}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-300 transition-colors shadow-sm"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <Workflow className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="font-bold text-lg mb-1">No Automations Yet</h3>
          <p className="text-sm text-zinc-500 max-w-xs mb-6">
            Create your first automation to auto-reply to comments and send DMs when someone uses a keyword.
          </p>
          <Link href="/dashboard/automations/builder">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Create First Automation
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
