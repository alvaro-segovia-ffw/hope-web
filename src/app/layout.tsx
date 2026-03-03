import type { Metadata } from "next";

import { AppProviders } from "@/components/app-providers";
import { TopNav } from "@/components/top-nav";

import "./globals.css";

export const metadata: Metadata = {
  title: "Hope Web",
  description: "Public and admin frontend for Hope API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProviders>
          <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,_#efe5cf,_transparent_30%),radial-gradient(circle_at_100%_0%,_#f7f3e9,_transparent_25%),linear-gradient(#f3f1ea,_#eeeadf)]">
            <TopNav />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
