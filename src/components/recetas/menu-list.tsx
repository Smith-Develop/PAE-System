"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ClipboardList, Info } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MenuForm } from "./menu-form";
import { MenuFormData } from "@/lib/validations";
import { Menu, Dish } from "@/types";

const COMPONENTE_COLORS: Record<string, string> = {};

interface MenuListProps {
  menus: Menu[];
  dishes: Dish[];
}

export function MenuList({ menus, dishes }: MenuListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [selectedMenuDetail, setSelectedMenuDetail] = useState<Menu | null>(null);

  const filteredMenus = menus.filter((m) =>
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: MenuFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingMenu
        ? `/api/menus/${editingMenu.id}`
        : `/api/menus`;
      const method = editingMenu ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      toast.success(editingMenu ? "Menú actualizado" : "Menú creado");
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este menú?")) return;

    try {
      const res = await fetch(`/api/menus/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Menú eliminado");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar menú por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-white"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button
                onClick={() => {
                  setEditingMenu(null);
                  setIsOpen(true);
                }}
              />
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Menú
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl h-[90vh] overflow-y-auto p-0 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle className="text-2xl font-bold">
                {editingMenu ? "Editar Menú" : "Nuevo Menú"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <MenuForm
                initialData={editingMenu}
                dishes={dishes}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenus.length === 0 ? (
          <div className="col-span-full text-center py-20 text-muted-foreground border rounded-xl bg-white">
            <div className="flex flex-col items-center gap-2">
              <ClipboardList className="h-10 w-10 opacity-20" />
              <p className="text-lg font-medium">
                No se encontraron menús
              </p>
              <p className="text-sm">
                Agrupa platos en menús para usarlos en los pedidos.
              </p>
            </div>
          </div>
        ) : (
          filteredMenus.map((m) => (
            <Card key={m.id} className="flex flex-col cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedMenuDetail(m)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-primary">
                  {m.nombre}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {m.descripcion || "Sin descripción"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-sm font-medium mb-2">
                  {m.dishes?.length || 0} Platos
                </div>
                <div className="space-y-1.5">
                  {(m.dishes || []).map((md, idx) => (
                    <div
                      key={md.id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="text-slate-400 w-5 text-right">
                        {idx + 1}.
                      </span>
                      <span className="font-medium text-slate-700 truncate">
                        {md.dish?.nombre || "Plato"}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] border bg-slate-100 text-slate-700"
                      >
                        {md.dish?.componente?.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingMenu(m);
                    setIsOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(m.id);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedMenuDetail} onOpenChange={(v) => { if (!v) setSelectedMenuDetail(null); }}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto p-0 flex flex-col">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Info className="h-5 w-5 text-primary" />
              Detalle del Menú: {selectedMenuDetail?.nombre}
            </DialogTitle>
          </DialogHeader>
          {selectedMenuDetail && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border text-sm">
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Nombre</span>
                  <p className="font-bold text-slate-800">{selectedMenuDetail.nombre}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Total Platos</span>
                  <p className="font-bold text-slate-800">{selectedMenuDetail.dishes?.length || 0}</p>
                </div>
                {selectedMenuDetail.descripcion && (
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground uppercase">Descripción</span>
                    <p className="text-sm text-slate-600">{selectedMenuDetail.descripcion}</p>
                  </div>
                )}
                {selectedMenuDetail.createdAt && (
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground uppercase">Creado</span>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedMenuDetail.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-slate-700">
                  Platos del Menú
                </h4>
                {(selectedMenuDetail.dishes || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin platos registrados.</p>
                ) : (
                  <div className="space-y-4">
                    {(selectedMenuDetail.dishes || []).map((md, idx) => (
                      <div key={md.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-slate-500">{idx + 1}.</span>
                          <span className="font-bold text-slate-800">{md.dish?.nombre || "Plato"}</span>
                          <Badge variant="outline" className="text-xs border bg-slate-100 text-slate-700">
                            {md.dish?.componente?.name}
                          </Badge>
                        </div>
                        {md.dish?.ingredients && md.dish.ingredients.length > 0 && (
                          <div className="overflow-x-auto">
                            <Table className="table-fixed w-full">
                            <TableHeader>
                              <TableRow className="bg-slate-50">
                                <TableHead className="text-xs">Producto</TableHead>
                                <TableHead className="text-xs text-right">Cantidad Bruta Unitaria</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {md.dish.ingredients.map((ing) => (
                                <TableRow key={ing.id}>
                                  <TableCell className="text-sm font-medium break-all whitespace-normal overflow-hidden">
                                    {ing.masterProduct?.nombre || "Desconocido"}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-sm">
                                    {ing.cantidadBrutaUnitaria.toLocaleString("es-CO")} g
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
