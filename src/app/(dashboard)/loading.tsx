import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-6 animate-slide-up">
        <img src="/logo.png" alt="PAE System" className="h-20 w-20 object-contain drop-shadow-lg" />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-600">Cargando...</p>
        </div>
      </div>
    </div>
  );
}
