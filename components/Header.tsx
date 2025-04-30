"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            PicklePro
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link 
            href="/" 
            className={`text-sm font-medium hover:underline ${
              pathname === "/" ? "text-primary" : ""
            }`}
          >
            Book Court
          </Link>
          <Link 
            href="/schedule" 
            className={`text-sm font-medium hover:underline ${
              pathname === "/schedule" ? "text-primary" : ""
            }`}
          >
            Schedule
          </Link>
          <Link 
            href="/about" 
            className={`text-sm font-medium hover:underline ${
              pathname === "/about" ? "text-primary" : ""
            }`}
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className={`text-sm font-medium hover:underline ${
              pathname === "/contact" ? "text-primary" : ""
            }`}
          >
            Contact
          </Link>
          <Link 
            href="/admin" 
            className={`flex items-center ml-2 p-1 rounded-full ${
              pathname === "/admin" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title="Admin Dashboard"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </nav>
      </div>
    </header>
  );
} 