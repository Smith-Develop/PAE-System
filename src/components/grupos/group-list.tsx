"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
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
import { Pagination } from "@/components/ui/pagination";
import { GroupForm } from "./group-form";

interface FoodGroup {
  id: string;
  name: string;
  description: string | null;
  _count?: { masterProducts: number };
}

interface GroupListProps {
  initialGroups: FoodGroup[];
}

export function GroupList({ initialGroups }: GroupListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FoodGroup | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedItem, setSelectedItem] = useState<FoodGroup | null>(null);

  const filteredGroups = initialGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGroups.length / pageSize);
  const paginatedGroups = filteredGroups.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este grupo?")) return;

    try {
      const res = await fetch(`/api/food-groups/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Grupo eliminado");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const openEditModal = (group: FoodGroup) => {
    setEditingGroup(group);
    setIsOpen(true);
  };

  const openCreateModal = () => {
    setEditingGroup(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar grupo o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={openCreateModal} />}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Grupo
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Editar Grupo Alimentario" : "Nuevo Grupo Alimentario"}
              </DialogTitle>
            </DialogHeader>
            <GroupForm
              initialData={editingGroup}
              onSuccess={() => {
                setIsOpen(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-white shadow-lg overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[400px] table-fixed">
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight w-[30%]">Nombre del Grupo</TableHead>
              <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight w-[45%]">Descripción / Items</TableHead>
              <TableHead className="text-center font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight w-[10%]">Ítems</TableHead>
              <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight w-[15%]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                  No se encontraron grupos alimentarios.
                </TableCell>
              </TableRow>
            ) : (
              paginatedGroups.map((g) => (
                <TableRow key={g.id} className="cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setSelectedItem(g)}>
                  <TableCell className="align-top py-4">
                    <span className="font-bold text-slate-800 block break-all whitespace-normal overflow-hidden max-w-[250px]">
                      {g.name}
                    </span>
                  </TableCell>
                  <TableCell className="align-top py-4">
                    {g.description ? (
                      <p className="text-sm text-slate-600 line-clamp-3 break-all whitespace-normal overflow-hidden">
                        {g.description}
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin descripción</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center align-top py-4">
                    <Badge variant="secondary" className="font-bold">
                      {g._count?.masterProducts || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right align-top py-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); openEditModal(g); }}
                        className="h-9 w-9 text-primary hover:bg-primary/10"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleDelete(g.id); }}
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                        title="Eliminar"
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
      </div>

      <Pagination currentPage={page} totalPages={totalPages} totalItems={filteredGroups.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />

      <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Grupo Alimentario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Nombre</p>
              <p className="text-base font-medium">{selectedItem?.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Descripción</p>
              <p className="text-base break-all whitespace-normal overflow-hidden">{selectedItem?.description || "Sin descripción"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ítems asociados</p>
              <Badge variant="secondary" className="font-bold text-sm">{selectedItem?._count?.masterProducts || 0}</Badge>
            </div>
            <p className="text-sm text-muted-foreground italic">Ver productos asociados en la pestaña Productos por Grupo</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
