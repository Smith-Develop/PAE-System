"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TenantInfo {
  id: string; name: string; slug: string;
  plan: { name: string } | null;
  expirationDate: string | null;
  maxUsers: number; aiScansLimit: number; aiScansUsed: number;
  active: boolean;
}

const LS_KEY_PREFIX = "pae-exp-warn-";

export function ExpirationWarning() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tenants/current");
        if (!res.ok) return;
        const data = await res.json();
        if (!data.tenant) return;
        setTenant(data.tenant);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!tenant?.expirationDate) return;

    const expDate = new Date(tenant.expirationDate);
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Check localStorage for once-per-day dismissal
    const today = new Date().toISOString().split("T")[0];
    const warned = localStorage.getItem(`${LS_KEY_PREFIX}${today}`);

    if (diffDays <= 3 && !warned) {
      setVisible(true);
    }
  }, [tenant]);

  const dismiss = () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`${LS_KEY_PREFIX}${today}`, "1");
    setVisible(false);
    setDismissed(true);
  };

  if (!visible || dismissed || !tenant?.expirationDate) return null;

  const expDate = new Date(tenant.expirationDate);
  const now = new Date();
  const diffMs = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const expired = diffMs <= 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4">
      {expired ? (
        <Card className="border-red-400 bg-red-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-red-800">Tu membresía ha vencido.</p>
                <p className="text-xs text-red-700 mt-1">
                  Contacta al administrador para renovar.
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-600 hover:bg-red-100 shrink-0" onClick={dismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-400 bg-amber-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-800">
                  Tu membresía vence en {diffDays} {diffDays === 1 ? "día" : "días"}.
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Contacta al administrador.
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-600 hover:bg-amber-100 shrink-0" onClick={dismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
