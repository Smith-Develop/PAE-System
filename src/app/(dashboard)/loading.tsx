import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <img src="/logo.png" alt="PAE System" className="h-16 w-16 object-contain drop-shadow-lg" />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-600">Cargando...</p>
        </div>
      </div>
    </div>
  );
}
