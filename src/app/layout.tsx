import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/contexts/QueryProvider";
import { AppProvider } from "@/contexts/AppContext";

export const metadata: Metadata = {
  title: "Bid Hunter - Web Application",
  description: "Comprehensive bid hunting web application for government portals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <QueryProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
