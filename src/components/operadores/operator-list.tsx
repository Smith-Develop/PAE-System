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

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
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
                <TableRow key={op.id}>
                  <TableCell>
                    <div className="font-medium">{op.nombreOperador}</div>
                  </TableCell>
                  <TableCell>{op.nitOperador}</TableCell>
                  <TableCell>
                    <div className="text-sm">{op.modeloAtencion}</div>
                    <div className="text-xs text-muted-foreground">{op.modalidadAtencion}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{op.direccionBodega}</div>
                    <div className="text-xs text-muted-foreground">{op.municipioBodega}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(op)}>
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(op.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
