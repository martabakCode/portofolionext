import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SiteService } from "@/modules/site/site.service";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteService = new SiteService();
    const config = await siteService.getSiteConfig();
    return {
      title: config?.site_name || "3D Portfolio",
      description: config?.site_description || "Interactive 3D Portfolio",
    };
  } catch {
    return {
      title: "3D Portfolio",
      description: "Interactive 3D Portfolio",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let themeColors: React.CSSProperties = {};
  
  try {
    const siteService = new SiteService();
    const config = await siteService.getSiteConfig();
    if (config) {
      themeColors = {
        "--primary-color": config.primary_color,
        "--secondary-color": config.secondary_color,
        "--accent-color": config.accent_color,
      } as React.CSSProperties;
    }
  } catch (e) {
    console.log('Site config fetch failed, using defaults');
  }

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={themeColors}
      >
        {children}
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
