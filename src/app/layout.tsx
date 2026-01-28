import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import SessionProvider from "../components/providers/session-provider";
import { auth } from "@/lib";
import { Session } from "next-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RFID Access Control System",
  description: "Automated entry and exit management with payment tracking",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider
          session={session as Session}
          refetchInterval={10}
          refetchOnWindowFocus={true}
        >
          <div className="min-h-screen flex flex-col overflow-x-hidden">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
