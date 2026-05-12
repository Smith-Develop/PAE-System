"use client";

import { useState, useEffect } from "react";
import { Monitor, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPromptGlobal: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPromptGlobal = e as BeforeInstallPromptEvent;
  });
}

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    if (mediaQuery.matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }
    setIsInstalled(false);

    // Use the global deferred prompt if already captured
    if (deferredPromptGlobal) {
      setDeferredPrompt(deferredPromptGlobal);
      // Show after 2 seconds
      setTimeout(() => setShowPrompt(true), 2000);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const dp = e as BeforeInstallPromptEvent;
      setDeferredPrompt(dp);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    // Fallback: if beforeinstallprompt hasn't fired after 10s, show manual instructions
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        setShowPrompt(true);
      }
    }, 8000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(fallbackTimer);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      // Manual instructions for desktop
      alert(
        "Para instalar la app:\n\n" +
        "• Chrome/Edge: Haz clic en el ícono ⊕ en la barra de direcciones, o en el menú (⋮) → 'Instalar PAE System'\n\n" +
        "• Celular Android: Abre el menú (⋮) → 'Agregar a pantalla de inicio'\n\n" +
        "• iPhone/iPad: Toca el botón Compartir → 'Agregar a la pantalla de inicio'"
      );
    }
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4">
      <div className="bg-white border-2 border-primary/30 shadow-xl rounded-xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          {typeof window !== "undefined" && window.innerWidth < 768 ? (
            <Smartphone className="h-5 w-5 text-white" />
          ) : (
            <Monitor className="h-5 w-5 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">Instalar PAE System</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {deferredPrompt
              ? "Agrega esta app a tu pantalla de inicio para acceso rápido."
              : "Usa el botón ⊕ en la barra de direcciones o el menú del navegador para instalar."}
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall} className="h-8 text-xs bg-primary hover:bg-primary/90">
              {deferredPrompt ? "Instalar App" : "¿Cómo instalar?"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowPrompt(false)} className="h-8 text-xs">
              Cerrar
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 absolute top-2 right-2" onClick={() => setShowPrompt(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
