"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Puzzle } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const componentSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

type ComponentFormData = z.infer<typeof componentSchema>;

interface ComponentWithCount {
  id: string;
  name: string;
  _count?: { dishes: number };
}

interface ComponentListProps {
  components: ComponentWithCount[];
}

export function ComponentList({ components }: ComponentListProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComponent, setEditingComponent] =
    useState<ComponentWithCount | null>(null);
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentWithCount | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const form = useForm<ComponentFormData>({
    resolver: zodResolver(componentSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: ComponentFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingComponent
        ? `/api/components/${editingComponent.id}`
        : "/api/components";
      const method = editingComponent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success(
        editingComponent ? "Componente actualizado" : "Componente creado"
      );
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este componente?")) return;

    try {
      const res = await fetch(`/api/components/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Componente eliminado");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const openEditModal = (c: ComponentWithCount) => {
    setEditingComponent(c);
    form.reset({ name: c.name });
    setIsOpen(true);
  };

  const openCreateModal = () => {
    setEditingComponent(null);
    form.reset({ name: "" });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingComponent(null);
      form.reset({ name: "" });
    }
  };

  const totalPages = Math.ceil(components.length / pageSize);
  const paginatedComponents = components.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {components.length} componente
          {components.length !== 1 ? "s" : ""}
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger render={<Button onClick={openCreateModal} />}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Componente
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md p-0 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-xl font-bold">
                {editingComponent
                  ? "Editar Componente"
                  : "Nuevo Componente"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                          Nombre del Componente *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej. Proteína, Cereal, Fruta..."
                            {...field}
                            className="bg-white h-11 border-slate-200"
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenChange(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-lg overflow-x-auto">
        <Table className="min-w-[350px] table-fixed">
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-primary py-4 w-full">
                Nombre del Componente
              </TableHead>
              <TableHead className="font-bold text-primary py-4 text-center">
                Platos
              </TableHead>
              <TableHead className="text-right font-bold text-primary py-4">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {components.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-20 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Puzzle className="h-10 w-10 opacity-20" />
                    <p className="text-lg font-medium">
                      No hay componentes creados
                    </p>
                    <p className="text-sm">
                      Agrega componentes como Proteína, Cereal, Fruta, etc.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedComponents.map((c) => (
                <TableRow
                  key={c.id}
                  onClick={() => setSelectedComponent(c)}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell>
                    <span className="font-bold text-slate-800 text-lg break-all whitespace-normal overflow-hidden max-w-[250px] block">{c.name}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono">
                      {c._count?.dishes || 0}
                    </Badge>
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
      <Pagination currentPage={page} totalPages={totalPages} totalItems={components.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />

      <Dialog open={selectedComponent !== null} onOpenChange={(open) => { if (!open) setSelectedComponent(null); }}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedComponent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 text-sm py-2">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-muted-foreground font-medium">Nombre</span>
              <span className="text-right max-w-[60%] truncate" title={selectedComponent?.name}>{selectedComponent?.name}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground font-medium">Platos asociados</span>
              <Badge variant="secondary" className="font-mono">{selectedComponent?._count?.dishes || 0}</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
