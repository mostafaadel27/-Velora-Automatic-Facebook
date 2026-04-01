"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ClientGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user && !(session.user as any).facebookConnected) {
      router.push("/connect-facebook");
    }
  }, [session, status, router]);

  if (status === "loading" || (status === "authenticated" && !(session?.user as any).facebookConnected)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-[#0f0f11]">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-zinc-500 font-medium">Checking authorizations...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
