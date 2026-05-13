"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ProviderForm } from "./provider-form";
import { ProviderFormData } from "@/lib/validations";
import { Provider } from "@/types";

interface ProviderListProps {
  providers: Provider[];
}

export function ProviderList({ providers }: ProviderListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filteredProviders = providers.filter(
    (p) =>
      p.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nit.includes(searchTerm)
  );
  const totalPages = Math.ceil(filteredProviders.length / pageSize);
  const paginatedProviders = filteredProviders.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = async (data: ProviderFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingProvider 
        ? `/api/providers/${editingProvider.id}` 
        : `/api/providers`;
      
      const method = editingProvider ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success(editingProvider ? "Proveedor actualizado" : "Proveedor creado");
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este proveedor?")) return;

    try {
      const res = await fetch(`/api/providers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Proveedor eliminado");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const openEditModal = (provider: Provider) => {
    setEditingProvider(provider);
    setIsOpen(true);
  };

  const openCreateModal = () => {
    setEditingProvider(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar proveedor o NIT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreateModal} />}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-none h-[90vh] overflow-y-auto p-0 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl font-bold">
                {editingProvider ? "Editar Proveedor" : "Nuevo Proveedor"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <ProviderForm 
                initialData={editingProvider} 
                onSubmit={onSubmit} 
                isSubmitting={isSubmitting} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Razón Social</TableHead>
              <TableHead>NIT</TableHead>
              <TableHead>Municipio</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Compra Local</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron proveedores.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProviders.map((p) => (
                <TableRow key={p.id} onClick={() => setSelectedProvider(p)} className="cursor-pointer hover:bg-slate-50">
                  <TableCell className="font-medium">
                    <span className="truncate max-w-[200px] block" title={p.razonSocial}>{p.razonSocial}</span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <span className="truncate max-w-[120px] block" title={p.nit}>{p.nit}</span>
                  </TableCell>
                  <TableCell>
                    <span className="truncate max-w-[120px] block" title={p.municipio}>{p.municipio}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <span className="truncate max-w-[150px] block" title={p.representanteLegal}>{p.representanteLegal}</span>
                      <span className="text-muted-foreground truncate max-w-[150px] block" title={p.telefono || p.correo || ""}>{p.telefono || p.correo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.compraLocal ? (
                      <Badge className="bg-success text-white">Sí</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditModal(p); }}>
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} totalItems={filteredProviders.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />

      <Dialog open={selectedProvider !== null} onOpenChange={(open) => { if (!open) setSelectedProvider(null); }}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedProvider?.razonSocial}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 text-sm py-2">
            {[
              ["NIT", selectedProvider?.nit],
              ["Código Inscripción", selectedProvider?.codigoInscripcion],
              ["Representante Legal", selectedProvider?.representanteLegal],
              ["Municipio", selectedProvider?.municipio],
              ["Dirección Establecimiento", selectedProvider?.direccionEstablecimiento],
              ["Teléfono", selectedProvider?.telefono],
              ["Correo", selectedProvider?.correo],
              ["Tipo Actividad", selectedProvider?.tipoActividad],
              ["Fecha Visita", selectedProvider?.fechaVisita],
              ["Concepto Sanitario", selectedProvider?.conceptoSanitario],
              ["Entidad Emisora", selectedProvider?.entidadEmisora],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-muted-foreground font-medium">{label}</span>
                <span className="text-right max-w-[60%] truncate" title={String(value)}>{String(value)}</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-muted-foreground font-medium">Compra Local</span>
              <span>
                {selectedProvider?.compraLocal ? (
                  <Badge className="bg-success text-white">Sí</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground font-medium">Creado</span>
              <span className="text-right max-w-[60%] truncate">
                {selectedProvider?.createdAt ? new Date(selectedProvider.createdAt).toLocaleDateString("es-CO") : "-"}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
