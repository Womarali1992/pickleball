"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            PicklePro
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4">
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

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
            <div className="container py-4 space-y-4">
              <Link 
                href="/" 
                className={`block text-sm font-medium hover:underline ${
                  pathname === "/" ? "text-primary" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Book Court
              </Link>
              <Link 
                href="/schedule" 
                className={`block text-sm font-medium hover:underline ${
                  pathname === "/schedule" ? "text-primary" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Schedule
              </Link>
              <Link 
                href="/about" 
                className={`block text-sm font-medium hover:underline ${
                  pathname === "/about" ? "text-primary" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`block text-sm font-medium hover:underline ${
                  pathname === "/contact" ? "text-primary" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/admin" 
                className={`flex items-center p-1 rounded-full w-fit ${
                  pathname === "/admin" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Admin Dashboard"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
} 