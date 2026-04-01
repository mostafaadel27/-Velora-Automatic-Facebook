import { Sidebar } from "@/components/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!(session.user as any).facebookConnected) {
    redirect("/connect-facebook");
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#0f0f11] overflow-hidden text-black dark:text-white font-sans">
      <Sidebar />
      <main className="flex-1 h-screen relative overflow-hidden bg-white dark:bg-[#0a0a0a]">
        {/* Subtle Purple Gradient Accent */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] pointer-events-none" />
        
        <div className="h-full w-full relative">
          {children}
        </div>
      </main>
    </div>
  );
}
