"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/events");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-primary to-pink-dark">
      <div className="flex flex-col items-center justify-center space-y-8 text-white px-8">
        <div className="w-24 h-24 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
            <path d="M 30 50 Q 50 30 70 50" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="35" cy="45" r="3" fill="currentColor" />
            <circle cx="65" cy="45" r="3" fill="currentColor" />
          </svg>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold tracking-wider">PAY LATER</h1>
          <p className="text-lg uppercase tracking-wide">
            Ultimate Team Building<br />Debt Solution
          </p>
        </div>

        <div className="pt-12">
          <Link
            href="/auth/signin"
            className="px-8 py-3 bg-white text-pink-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            LET&apos;S GO
          </Link>
        </div>
      </div>
    </div>
  );
}
