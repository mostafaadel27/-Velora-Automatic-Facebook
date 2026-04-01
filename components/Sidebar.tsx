"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Workflow, Inbox, Users, Settings } from "lucide-react";
import { useSession } from "next-auth/react";

const navigation = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Automations', href: '/dashboard/automations', icon: Workflow },
  { name: 'Inbox', href: '/dashboard/inbox', icon: Inbox },
  { name: 'Audience', href: '/dashboard/audience', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  
  return (
    <div className="flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] h-full z-20">
      <div className="flex items-center h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-gradient">
          Velora
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          {user?.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={user.image} alt={user.name || "User"} className="w-10 h-10 rounded-full object-cover shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-black dark:text-white truncate">{user?.name || "Loading..."}</p>
            <p className="text-xs font-medium text-zinc-500 truncate">{user?.email || "Pro Plan"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
