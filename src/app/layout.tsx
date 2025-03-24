import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EZJSON",
  description:
    "A simple yet powerful tool designed to make JSON data more readable and presentable. Whether you're a developer, data analyst, or someone who needs to communicate structured data to non-technical users, EZJSON transforms raw JSON into a visually appealing and easy-to-understand format.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          richColors
          toastOptions={{
            duration: 2000,
          }}
        />
      </body>
    </html>
  );
}
