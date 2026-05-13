"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Building, Users } from "lucide-react";
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
import { ClientForm } from "./client-form";
import { ClientFormData } from "@/lib/validations";
import { Client } from "@/types";

interface ClientListProps {
  clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filteredClients = clients.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nit.includes(searchTerm) ||
      (c.municipio || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingClient
        ? `/api/clients/${editingClient.id}`
        : `/api/clients`;

      const method = editingClient ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success(editingClient ? "Cliente actualizado" : "Cliente creado");
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Cliente eliminado");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsOpen(true);
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar por nombre, NIT o municipio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreateModal} />}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-3xl h-[90vh] overflow-y-auto p-0 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl font-bold">
                {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <ClientForm
                initialData={editingClient}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-lg overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-primary py-4">
                Nombre
              </TableHead>
              <TableHead className="font-bold text-primary py-4">NIT</TableHead>
              <TableHead className="font-bold text-primary py-4">
                Municipio
              </TableHead>
              <TableHead className="font-bold text-primary py-4">
                Contacto
              </TableHead>
              <TableHead className="text-right font-bold text-primary py-4">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-20 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-10 w-10 opacity-20" />
                    <p className="text-lg font-medium">
                      No se encontraron clientes
                    </p>
                    <p className="text-sm">
                      Registra instituciones educativas para asignarles
                      pedidos.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell>
                    <div className="font-bold text-slate-800">
                      <span className="truncate max-w-[200px] block" title={c.nombre}>{c.nombre}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[200px] block" title={c.direccion || ""}>{c.direccion}</div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-slate-100 px-2 py-0.5 rounded font-mono border border-slate-200">
                      {c.nit}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-600 truncate max-w-[120px] block" title={c.municipio || ""}>{c.municipio}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {c.contacto && (
                        <div className="font-medium truncate max-w-[120px] block" title={c.contacto}>{c.contacto}</div>
                      )}
                      {(c.telefono || c.correo) && (
                        <div className="text-xs text-muted-foreground truncate max-w-[120px] block" title={[c.telefono, c.correo].filter(Boolean).join(" · ")}>
                          {c.telefono && <span>{c.telefono}</span>}
                          {c.telefono && c.correo && <span> · </span>}
                          {c.correo && <span>{c.correo}</span>}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); openEditModal(c); }}
                        className="h-9 w-9 text-primary hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} totalItems={filteredClients.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />

      <Dialog open={selectedClient !== null} onOpenChange={(open) => { if (!open) setSelectedClient(null); }}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedClient?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 text-sm py-2">
            {[
              ["NIT", selectedClient?.nit],
              ["Dirección", selectedClient?.direccion],
              ["Municipio", selectedClient?.municipio],
              ["Contacto", selectedClient?.contacto],
              ["Teléfono", selectedClient?.telefono],
              ["Correo", selectedClient?.correo],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-muted-foreground font-medium">{label}</span>
                <span className="text-right max-w-[60%] truncate" title={String(value)}>{String(value)}</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground font-medium">Creado</span>
              <span className="text-right max-w-[60%] truncate">
                {selectedClient?.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString("es-CO") : "-"}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
