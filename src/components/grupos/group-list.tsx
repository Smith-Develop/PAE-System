"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Search, Info } from "lucide-react";
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
import { GroupForm } from "./group-form";

interface FoodGroup {
  id: string;
  name: string;
  description: string | null;
  _count?: {
    masterProducts: number;
  };
}

interface GroupListProps {
  initialGroups: FoodGroup[];
}

export function GroupList({ initialGroups }: GroupListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FoodGroup | null>(null);

  const filteredGroups = initialGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="font-bold text-primary py-4">Nombre del Grupo</TableHead>
              <TableHead className="font-bold text-primary py-4">Descripción / Items</TableHead>
              <TableHead className="text-center font-bold text-primary py-4">Productos</TableHead>
              <TableHead className="text-right font-bold text-primary py-4">Acciones</TableHead>
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
              filteredGroups.map((g) => (
                <TableRow key={g.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-bold text-slate-800 align-top max-w-[250px]">
                    {g.name}
                  </TableCell>
                  <TableCell className="align-top">
                    {g.description ? (
                      <p className="text-sm text-slate-600 line-clamp-3 hover:line-clamp-none transition-all duration-300">
                        {g.description}
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin descripción</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center align-top">
                    <Badge variant="secondary" className="font-bold">
                      {g._count?.masterProducts || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right align-top">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(g)} className="h-9 w-9 text-primary hover:bg-primary/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(g.id)} className="h-9 w-9 text-destructive hover:bg-destructive/10">
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
  );
}
