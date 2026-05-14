"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Zap, Star, Play, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AIModel {
  id: string; name: string; provider: string; modelId: string;
  apiKey: string; baseUrl?: string | null;
  isDefault: boolean; active: boolean;
}

const PROVIDERS: Record<string, { label: string; color: string }> = {
  google: { label: "Google", color: "bg-blue-100 text-blue-700" },
  openai: { label: "OpenAI", color: "bg-green-100 text-green-700" },
  deepseek: { label: "DeepSeek", color: "bg-purple-100 text-purple-700" },
  anthropic: { label: "Anthropic", color: "bg-orange-100 text-orange-700" },
  custom: { label: "Custom", color: "bg-slate-100 text-slate-700" },
};

export function AiModelManager() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AIModel | null>(null);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("google");
  const [modelId, setModelId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const fetchModels = async () => {
    try {
      const res = await fetch("/api/super-admin/ai-models");
      if (res.ok) setModels(await res.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchModels(); }, []);

  const openCreate = () => {
    setEditing(null); setName(""); setProvider("google"); setModelId(""); setApiKey(""); setBaseUrl(""); setIsDefault(false); setActive(true);
    setModalOpen(true);
  };

  const openEdit = (m: AIModel) => {
    setEditing(m); setName(m.name); setProvider(m.provider); setModelId(m.modelId); setApiKey(""); setBaseUrl(m.baseUrl || ""); setIsDefault(m.isDefault); setActive(m.active);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name || !provider || !modelId) { toast.error("Completa nombre, proveedor y modelo"); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/super-admin/ai-models/${editing.id}` : "/api/super-admin/ai-models";
      const method = editing ? "PUT" : "POST";
      const body: any = { name, provider, modelId, isDefault, active, baseUrl: baseUrl || null };
      if (apiKey) body.apiKey = apiKey;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success(editing ? "Modelo actualizado" : "Modelo creado");
      setModalOpen(false); fetchModels();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (m: AIModel) => {
    if (!confirm(`¿Eliminar "${m.name}"?`)) return;
    try {
      const res = await fetch(`/api/super-admin/ai-models/${m.id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      toast.success("Modelo eliminado"); fetchModels();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleTest = async (m: AIModel) => {
    setTesting(m.id); setTestResult((prev) => { const n = { ...prev }; delete n[m.id]; return n; });
    try {
      const res = await fetch("/api/super-admin/ai-models/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ modelId: m.id }) });
      const data = await res.json();
      if (data.success) {
        setTestResult((prev) => ({ ...prev, [m.id]: { ok: true, msg: `${data.latency}` } }));
        toast.success(`${m.name}: Conectado (${data.latency})`);
      } else {
        setTestResult((prev) => ({ ...prev, [m.id]: { ok: false, msg: data.error?.slice(0, 40) || "Error" } }));
        toast.error(`${m.name}: ${data.error?.slice(0, 60)}`);
      }
    } catch (e: any) {
      setTestResult((prev) => ({ ...prev, [m.id]: { ok: false, msg: "Timeout" } }));
      toast.error(`Error al probar ${m.name}`);
    } finally { setTesting(null); }
  };

  const maskKey = (key: string) => key ? `${key.slice(0, 6)}...${key.slice(-4)}` : "—";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2"><Zap className="h-4 w-4" /> Modelos IA Configurados</h3>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-2" /> Nuevo Modelo</Button>
      </div>

      {loading ? <p className="text-muted-foreground text-xs">Cargando...</p> : models.length === 0 ? (
        <p className="text-muted-foreground text-xs py-4">No hay modelos configurados. Agrega uno.</p>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="py-2 px-3 font-semibold">Nombre</th>
                <th className="py-2 px-3 font-semibold">Proveedor</th>
                <th className="py-2 px-3 font-semibold">Modelo</th>
                <th className="py-2 px-3 font-semibold">API Key</th>
                <th className="py-2 px-3 font-semibold text-center">Default</th>
                <th className="py-2 px-3 font-semibold text-center">Estado</th>
                <th className="py-2 px-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id} className="border-b hover:bg-slate-50">
                  <td className="py-2 px-3 font-medium">{m.name}</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className={`text-[10px] ${PROVIDERS[m.provider]?.color || "bg-slate-100"}`}>{PROVIDERS[m.provider]?.label || m.provider}</Badge>
                  </td>
                  <td className="py-2 px-3 font-mono text-[10px]">{m.modelId}</td>
                  <td className="py-2 px-3 font-mono text-[10px]">{maskKey(m.apiKey)}</td>
                  <td className="py-2 px-3 text-center">{m.isDefault && <Star className="h-3.5 w-3.5 text-amber-500 mx-auto" />}</td>
                  <td className="py-2 px-3 text-center"><Badge variant={m.active ? "secondary" : "destructive"} className="text-[10px]">{m.active ? "Activo" : "Inactivo"}</Badge></td>
                  <td className="py-2 px-3 text-right">
                    {testResult[m.id] ? (
                      <span className={`inline-flex items-center gap-0.5 text-[10px] mr-1 ${testResult[m.id].ok ? "text-green-600" : "text-red-600"}`}>
                        {testResult[m.id].ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {testResult[m.id].msg}
                      </span>
                    ) : null}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTest(m)} disabled={testing === m.id} title="Probar conexión">
                      {testing === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(m)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editing ? "Editar Modelo IA" : "Nuevo Modelo IA"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><p className="text-xs text-muted-foreground uppercase">Nombre</p>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gemini 2.5 Flash" /></div>
            <div className="space-y-1"><p className="text-xs text-muted-foreground uppercase">Proveedor</p>
              <select className="w-full border rounded px-3 py-2 text-sm" value={provider} onChange={(e) => setProvider(e.target.value)}>
                {Object.entries(PROVIDERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select></div>
            <div className="space-y-1"><p className="text-xs text-muted-foreground uppercase">Model ID</p>
              <Input value={modelId} onChange={(e) => setModelId(e.target.value)} placeholder="gemini-2.5-flash" /></div>
            <div className="space-y-1"><p className="text-xs text-muted-foreground uppercase">API Key {editing ? "(dejar vacía = no cambiar)" : ""}</p>
              <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={editing ? "••••••••" : "sk-..."} /></div>
            <div className="space-y-1"><p className="text-xs text-muted-foreground uppercase">Base URL (opcional)</p>
              <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" /></div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
                Modelo por defecto
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Activo
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
