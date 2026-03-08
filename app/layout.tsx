import Header from "@/components/Header";
import ChunkErrorHandler from "@/components/ChunkErrorHandler";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, getSiteOrigin } from "@/src/seo/site";
import "./globals.css";
 
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteOrigin(),
  title: {
    default: `${SITE_NAME} | JSON Transformation Tool`,
    template: "%s | JSONLoom",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: `${SITE_NAME} | JSON Transformation Tool`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | JSON Transformation Tool`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/brand/jsonloom-mark.svg",
    shortcut: "/brand/jsonloom-mark.svg",
    apple: "/brand/jsonloom-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set initial class to system preference to minimize flash
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
          <ChunkErrorHandler />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <Header/>
              <div className="flex-1 min-h-0">{children}</div>
            </TooltipProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
