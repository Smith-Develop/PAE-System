"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Printer, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SelectedMenu, PackingItem, Recipe, Operator } from "@/types";
import { calculatePackingList } from "@/lib/calculations";

interface OrderCalculatorProps {
  recipes: Recipe[];
  operators: Operator[];
}

export function OrderCalculator({ recipes, operators }: OrderCalculatorProps) {
  const [selectedMenus, setSelectedMenus] = useState<SelectedMenu[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>("");
  const [nota, setNota] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Obtener datos del operador seleccionado
  const selectedOperator = useMemo(() => 
    operators.find(op => op.id === selectedOperatorId),
  [operators, selectedOperatorId]);

  // Derivamos la lista de empaque automáticamente cuando cambia `selectedMenus`
  const packingList: PackingItem[] = useMemo(() => {
    // Formatear recipes a RecipeData como requiere calculatePackingList
    const recipeData = recipes.map(r => ({
      id: r.id,
      nombre: r.nombre,
      ingredients: (r.ingredients || []).map((ing) => ({
        productId: ing.product?.id || ing.productId,
        productName: ing.product?.alimento || "Producto desconocido",
        unit: ing.product?.unidadMedida || "Kg",
        cantidadBrutaUnitaria: ing.cantidadBrutaUnitaria,
      }))
    }));
    return calculatePackingList(selectedMenus, recipeData);
  }, [selectedMenus, recipes]);

  const addMenu = () => {
    setSelectedMenus([...selectedMenus, { recipeId: "", recipeName: "", raciones: 0 }]);
  };

  const removeMenu = (index: number) => {
    setSelectedMenus(selectedMenus.filter((_, i) => i !== index));
  };

  const updateMenu = (index: number, field: keyof SelectedMenu, value: string | number) => {
    const newMenus = [...selectedMenus];
    if (field === 'recipeId') {
      newMenus[index].recipeId = value as string;
      newMenus[index].recipeName = recipes.find(r => r.id === value)?.nombre || "";
    } else {
      newMenus[index] = { ...newMenus[index], [field]: value };
    }
    setSelectedMenus(newMenus);
  };

  const handleSaveOrder = async () => {
    const validMenus = selectedMenus.filter(m => m.recipeId && m.raciones > 0);
    if (validMenus.length === 0) {
      toast.error("Agrega al menos un menú con raciones válidas.");
      return;
    }

    if (!selectedOperatorId) {
      toast.error("Debe seleccionar un operador.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorId: selectedOperatorId,
          nota,
          items: validMenus.map(m => ({
            recipeId: m.recipeId,
            raciones: m.raciones
          }))
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar el pedido");
      }

      toast.success("Pedido guardado exitosamente y stock actualizado");
      setSelectedMenus([]); // Limpiar después de guardar
      setSelectedOperatorId("");
      setNota("");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
      {/* PANEL IZQUIERDO: SELECCIÓN DE MENÚS */}
      <Card className="flex flex-col h-full overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-xl text-primary">1. Datos del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Selección de Operador */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Operador Responsable *</label>
            <Combobox
              options={operators.map(op => ({ label: `${op.nombreOperador} (${op.nitOperador})`, value: op.id }))}
              value={selectedOperatorId}
              onValueChange={(val) => setSelectedOperatorId(val)}
              placeholder="Seleccionar operador..."
              className="border-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Nota / Observación</label>
            <Input 
              placeholder="Ej: Entrega urgente, cambio de marca, etc."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-primary">Menús y Raciones *</label>
            </div>
            
            <div className="space-y-4">
              {selectedMenus.map((menu, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center bg-muted/10 p-3 rounded-lg border border-primary/10">
                  <div className="col-span-12 md:col-span-7">
                    <Combobox
                      options={recipes.map(r => ({ label: r.nombre, value: r.id }))}
                      value={menu.recipeId}
                      onValueChange={(val) => updateMenu(index, "recipeId", val)}
                      placeholder="Seleccionar menú..."
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-10 md:col-span-4">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Raciones"
                      value={menu.raciones || ""}
                      onChange={(e) => updateMenu(index, "raciones", parseInt(e.target.value) || 0)}
                      className="bg-white h-9"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => removeMenu(index)} className="h-9 w-9 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full border-dashed border-2 bg-transparent hover:bg-primary/5 text-primary h-11"
                onClick={addMenu}
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar otro menú
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PANEL DERECHO: LISTA DE EMPAQUE */}
      <Card className="flex flex-col h-full border-primary/20 shadow-md overflow-hidden bg-white">
        <CardHeader className="border-b bg-primary/5 pb-4 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-primary flex items-center gap-2">
                2. Lista de Empaque
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generado el {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="icon" onClick={handlePrint} title="Imprimir Lista">
                <Printer className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={handleSaveOrder} disabled={isSaving || packingList.length === 0} title="Guardar Histórico y Descontar Stock">
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Datos del Operador en la Cabecera para impresión */}
          {selectedOperator && (
            <div className="mt-4 p-3 bg-white border rounded-md text-xs grid grid-cols-2 gap-x-4 gap-y-1 border-primary/20">
              <div className="col-span-2 font-bold text-primary text-sm mb-1 uppercase">
                {selectedOperator.nombreOperador}
              </div>
              <div><span className="font-semibold">NIT:</span> {selectedOperator.nitOperador}</div>
              <div><span className="font-semibold">MODELO:</span> {selectedOperator.modeloAtencion}</div>
              <div><span className="font-semibold">MODALIDAD:</span> {selectedOperator.modalidadAtencion}</div>
              <div><span className="font-semibold">BODEGA:</span> {selectedOperator.direccionBodega}</div>
              <div><span className="font-semibold">MUNICIPIO:</span> {selectedOperator.municipioBodega}</div>
              <div><span className="font-semibold">CONTACTO:</span> {selectedOperator.contactoBodega}</div>
              <div><span className="font-semibold">TELÉFONO:</span> {selectedOperator.telefonoBodega}</div>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {packingList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <span className="text-3xl">📦</span>
              </div>
              <p>Selecciona el operador, menús e ingresa raciones para calcular la explosión de materiales.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="font-semibold text-primary">Producto</TableHead>
                  <TableHead className="font-semibold text-primary text-right">Cantidad Requerida</TableHead>
                  <TableHead className="font-semibold text-primary">Unidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packingList.map((item, index) => (
                  <TableRow key={index} className="hover:bg-accent/50">
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-lg text-secondary">
                      {item.totalQuantity.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {packingList.length > 0 && (
          <CardFooter className="border-t bg-muted/10 p-4 shrink-0">
            <div className="w-full flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total de items: <strong className="text-foreground">{packingList.length}</strong></span>
              <span className="text-muted-foreground">Total raciones: <strong className="text-foreground">
                {selectedMenus.reduce((acc, curr) => acc + (curr.raciones || 0), 0).toLocaleString("es-CO")}
              </strong></span>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
