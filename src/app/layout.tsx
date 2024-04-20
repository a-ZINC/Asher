import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/ui/Navbar";
import Provider from "@/components/ui/Provider";
import "react-loading-skeleton/dist/skeleton.css"
import { Toaster } from "@/components/ui/toaster";
import 'simplebar-react/dist/simplebar.min.css';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asher",
  description: "Powered by aZinc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className='light'>
      <Provider>
      <body className={
            `min-h-screen font-sans antialiased grainy
            ${inter.className}`}
            suppressHydrationWarning={true} >
            <Toaster/>
            <Navbar/>
            {children}
      </body>
      </Provider>
    </html>
  );
}
