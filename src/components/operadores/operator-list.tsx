"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { OperatorForm } from "./operator-form";
import { OperatorFormData } from "@/lib/validations";
import { Operator } from "@/types";

interface OperatorListProps {
  initialOperators: Operator[];
}

export function OperatorList({ initialOperators }: OperatorListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);

  const filteredOperators = initialOperators.filter((op) =>
    op.nombreOperador.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.nitOperador.includes(searchTerm)
  );

  const onSubmit = async (data: OperatorFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingOperator 
        ? `/api/operators/${editingOperator.id}` 
        : `/api/operators`;
      
      const method = editingOperator ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success(editingOperator ? "Operador actualizado" : "Operador registrado");
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este operador? Esto podría afectar a los pedidos asociados.")) return;

    try {
      const res = await fetch(`/api/operators/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Operador eliminado");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const openEditModal = (operator: Operator) => {
    setEditingOperator(operator);
    setIsOpen(true);
  };

  const openCreateModal = () => {
    setEditingOperator(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Input
          placeholder="Buscar por nombre o NIT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreateModal} />}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Operador
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-none h-[90vh] overflow-y-auto p-0 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl font-bold">
                {editingOperator ? "Editar Operador" : "Registrar Operador"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <OperatorForm 
                initialData={editingOperator} 
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
              <TableHead>Operador</TableHead>
              <TableHead>NIT</TableHead>
              <TableHead>Atención/Modalidad</TableHead>
              <TableHead>Ubicación Bodega</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOperators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No se encontraron operadores registrados.
                </TableCell>
              </TableRow>
            ) : (
              filteredOperators.map((op) => (
                <TableRow key={op.id} onClick={() => setSelectedOperator(op)} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>
                    <div className="font-medium">
                      <span className="truncate max-w-[200px] block" title={op.nombreOperador}>{op.nombreOperador}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="truncate max-w-[120px] block" title={op.nitOperador}>{op.nitOperador}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="truncate max-w-[150px] block" title={op.modeloAtencion}>{op.modeloAtencion}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="truncate max-w-[150px] block" title={op.modalidadAtencion}>{op.modalidadAtencion}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="truncate max-w-[150px] block" title={op.direccionBodega}>{op.direccionBodega}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="truncate max-w-[150px] block" title={op.municipioBodega}>{op.municipioBodega}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditModal(op); }}>
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(op.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={selectedOperator !== null} onOpenChange={(open) => { if (!open) setSelectedOperator(null); }}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedOperator?.nombreOperador}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 text-sm py-2">
            {[
              ["NIT", selectedOperator?.nitOperador],
              ["Dirección Bodega", selectedOperator?.direccionBodega],
              ["Municipio Bodega", selectedOperator?.municipioBodega],
              ["Contacto Bodega", selectedOperator?.contactoBodega],
              ["Teléfono Bodega", selectedOperator?.telefonoBodega],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-muted-foreground font-medium">{label}</span>
                <span className="text-right max-w-[60%] truncate" title={String(value)}>{String(value)}</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-muted-foreground font-medium">Modelo Atención</span>
              <Badge variant="secondary">{selectedOperator?.modeloAtencion || "-"}</Badge>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-muted-foreground font-medium">Modalidad Atención</span>
              <Badge variant="secondary">{selectedOperator?.modalidadAtencion || "-"}</Badge>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground font-medium">Creado</span>
              <span className="text-right max-w-[60%] truncate">
                {selectedOperator?.createdAt ? new Date(selectedOperator.createdAt).toLocaleDateString("es-CO") : "-"}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
