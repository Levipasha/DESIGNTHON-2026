import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DESIGNTHON 2026 | Hyderabad's Premier UI/UX Hackathon",
  description: "Register for DESIGNTHON, Hyderabad's premier UI/UX Design Hackathon. Showcase your creative UI design capabilities, team up, win prizes, and learn from industry mentors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#03030f] text-foreground antialiased selection:bg-purple-500/30 selection:text-purple-200">
        <AuthProvider>
          <SocketProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <Footer />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
