import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pickleball Reservation System",
  description: "A reservation system for pickleball courts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col">
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </main>
      </body>
    </html>
  );
} 