import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, Fira_Code } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fontHeading = Plus_Jakarta_Sans({ variable: "--font-heading", subsets: ["latin"] });
const fontSans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const fontMono = Fira_Code({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PAE System",
  description: "Sistema de gestión del Programa de Alimentación Escolar (PAE)",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "PAE System", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png", shortcut: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fontHeading.variable} ${fontSans.variable} ${fontMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster richColors position="top-right" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('SW registered:', reg.scope); },
                    function(err) { console.log('SW registration failed:', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
