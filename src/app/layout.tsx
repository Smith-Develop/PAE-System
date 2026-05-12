import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, Fira_Code } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fontHeading = Plus_Jakarta_Sans({ variable: "--font-heading", subsets: ["latin"] });
const fontSans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const fontMono = Fira_Code({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PAE Antioquia",
  description: "Sistema de gestión del Programa de Alimentación Escolar (PAE) - Antioquia, Colombia",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "PAE Antioquia", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fontHeading.variable} ${fontSans.variable} ${fontMono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
