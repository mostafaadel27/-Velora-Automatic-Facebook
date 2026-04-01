"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, Send, User, ChevronLeft, MoreVertical, ShieldCheck, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";

interface Conversation {
  id: string;
  psid: string;
  name: string;
  profilePic: string | null;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageDirection: string;
  unreadCount: number;
}

interface Message {
  id: string;
  text: string;
  direction: "INBOUND" | "OUTBOUND";
  isRead: boolean;
  timestamp: string;
}

export default function InboxPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/inbox")
      .then(res => res.json())
      .then(data => {
        if (data.conversations) setConversations(data.conversations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedId) {
      setLoadingMessages(true);
      fetch(`/api/inbox/messages?contactId=${selectedId}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages) setMessages(data.messages);
          setLoadingMessages(false);
          // Mark as read locally
          setConversations(prev => 
            prev.map(c => c.id === selectedId ? { ...c, unreadCount: 0 } : c)
          );
        })
        .catch(() => setLoadingMessages(false));
    }
  }, [selectedId]);

  useEffect(() => {
    // Scroll to bottom without jumping the whole page
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedId || syncing) return;

    try {
      const text = newMessage;
      setNewMessage(""); // Clear early for better UX

      const res = await fetch("/api/inbox/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: selectedId, text }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Error sending message: " + (data.error || "Unknown error"));
        // Put text back if failed
        setNewMessage(text);
        return;
      }
      
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        // Update last message in the list
        setConversations(prev => 
          prev.map(c => c.id === selectedId ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString(), lastMessageDirection: "OUTBOUND" } : c)
        );
      }
    } catch (error) {
      console.error("[SEND_MSG_ERROR]", error);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/inbox/sync", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        // Refresh inbox
        const inboxRes = await fetch("/api/inbox");
        const inboxData = await inboxRes.json();
        if (inboxData.conversations) {
           setConversations(inboxData.conversations);
           // If current conversation was synced, refresh messages too
           if (selectedId) {
             const msgRes = await fetch(`/api/inbox/messages?contactId=${selectedId}`);
             const msgData = await msgRes.json();
             if (msgData.messages) setMessages(msgData.messages);
           }
        }
      } else {
        alert("Sync failed: " + (data.error || "Try again"));
      }
    } catch (error) {
      console.error("[SYNC_ERROR]", error);
    } finally {
      setSyncing(false);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#0a0a0a] overflow-hidden relative">
      {/* 1. Conversations List */}
      <div className={`w-full md:w-80 h-full flex flex-col border-r border-zinc-200 dark:border-zinc-800 ${selectedId ? 'hidden md:flex' : 'flex'} overflow-hidden shrink-0`}>
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
             <h1 className="text-xl font-bold">Inbox</h1>
             <button 
                onClick={handleSync}
                disabled={syncing}
                className={`p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Sync from Facebook"
             >
                <RefreshCcw className={`w-4 h-4 text-zinc-500 ${syncing ? 'animate-spin' : ''}`} />
             </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-none text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors text-left border-b border-zinc-100 dark:border-zinc-900/50 ${selectedId === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
              >
                <div className="relative shrink-0">
                  {conv.profilePic && !imageErrors[conv.id] ? (
                    <img 
                      src={conv.profilePic} 
                      alt={conv.name} 
                      className="w-12 h-12 rounded-full object-cover shadow-sm bg-zinc-100 dark:bg-zinc-800" 
                      onError={() => setImageErrors(prev => ({ ...prev, [conv.id]: true }))}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500/20 to-primary/20 flex items-center justify-center border border-primary/10">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>{conv.name}</h3>
                    <span className="text-[10px] text-zinc-500 uppercase">{new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-black dark:text-white font-medium' : 'text-zinc-500'}`}>
                    {conv.lastMessageDirection === "OUTBOUND" ? "You: " : ""}{conv.lastMessage}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <MessageCircle className="w-10 h-10 text-zinc-300 mb-2" />
              <p className="text-sm text-zinc-500">No conversations found.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Chat Window */}
      <div className={`flex-1 h-full flex flex-col bg-zinc-50 dark:bg-[#080808] ${!selectedId ? 'hidden md:flex' : 'flex'} overflow-hidden`}>
        {selectedId ? (
          <>
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-[#0a0a0a] border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedId(null)} className="md:hidden p-2 -ml-2 text-zinc-500">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  {(selectedConversation?.profilePic && !imageErrors[`header-${selectedId}`]) ? (
                    <img 
                      src={selectedConversation.profilePic} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onError={() => setImageErrors(prev => ({ ...prev, [`header-${selectedId}`]: true }))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                      <User className="w-5 h-5 text-zinc-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold">{selectedConversation?.name}</h2>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Active Customer</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-50 dark:bg-[#080808]">
                {loadingMessages ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="flex flex-col space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] md:max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                          msg.direction === 'OUTBOUND' 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-tl-none text-black dark:text-zinc-200'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <span className={`text-[10px] block mt-1.5 opacity-60 ${msg.direction === 'OUTBOUND' ? 'text-white' : 'text-zinc-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} className="h-4" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                     <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <MessageCircle className="w-8 h-8 text-zinc-300" />
                     </div>
                     <h3 className="text-sm font-bold mb-1">No Messages Yet</h3>
                     <p className="text-xs text-zinc-500 max-w-[200px]">This conversation hasn't had any messages in Velora yet.</p>
                  </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-zinc-800 shrink-0">
               <div className="flex items-end gap-2 bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-2 pl-4 border border-zinc-200 dark:border-zinc-800 focus-within:border-primary transition-colors">
                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none outline-none resize-none py-2 text-sm max-h-32 min-h-[40px]"
                    rows={1}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
               </div>
               <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1 justify-center">
                  <ShieldCheck className="w-3 h-3 text-green-500" />
                  Messages are sent via Facebook Messenger API
               </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-50 dark:bg-[#0f0f11] relative">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="w-20 h-20 rounded-[40px] bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800">
               <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Select a conversation</h2>
            <p className="text-sm text-zinc-500 max-w-xs">
              Velora captures all your Facebook DMs and automated replies in one place.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
