import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "QLCôngViệc - Full-Stack Clean Architecture Platform",
  description: "Dự án Quản Lý Công Việc với Next.js 14, Supabase, Zustand & Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden bg-slate-950 light:bg-slate-50 transition-colors duration-200">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
