"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Trash2, Printer, Save, Eye, History } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import {
  SelectedMenu,
  PackingItem,
  Recipe,
  Operator,
  Client,
  MasterProduct,
} from "@/types";
import { calculatePackingList } from "@/lib/calculations";

interface OrderCalculatorProps {
  recipes: Recipe[];
  operators: Operator[];
  masterProducts: MasterProduct[];
  clients: Client[];
}

interface OrderRecord {
  id: string;
  fecha: string;
  nota?: string | null;
  client?: { id: string; nombre: string; nit: string } | null;
  operator?: { id: string; nombreOperador: string } | null;
  items: { recipeId: string; raciones: number }[];
  materials: {
    id: string;
    cantidadTotal: number;
    masterProduct: { nombre: string; unidadMedida: string };
    product: {
      descripcionMarca: string;
      currentStock: number;
      provider?: { razonSocial: string } | null;
    };
  }[];
}

export function OrderCalculator({
  recipes,
  operators,
  masterProducts,
  clients,
}: OrderCalculatorProps) {
  const [selectedMenus, setSelectedMenus] = useState<SelectedMenu[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [nota, setNota] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Historial de pedidos
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const selectedOperator = useMemo(
    () => operators.find((op) => op.id === selectedOperatorId),
    [operators, selectedOperatorId]
  );

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId),
    [clients, selectedClientId]
  );

  const packingList: PackingItem[] = useMemo(() => {
    const recipeData = recipes.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      ingredients: (r.ingredients || []).map((ing) => ({
        masterProductId: ing.masterProductId,
        productName: ing.masterProduct?.nombre || "Desconocido",
        unit: ing.masterProduct?.unidadMedida || "Kg",
        cantidadBrutaUnitaria: ing.cantidadBrutaUnitaria,
      })),
    }));
    return calculatePackingList(selectedMenus, recipeData);
  }, [selectedMenus, recipes]);

  useEffect(() => {
    const newVariants = { ...selectedVariants };
    let changed = false;

    packingList.forEach((item) => {
      const master = masterProducts.find(
        (mp) => mp.id === item.masterProductId
      );
      const availableVariants = (master?.providerProducts || []).filter(
        (v) => v.currentStock > 0
      );

      if (
        availableVariants.length === 1 &&
        !selectedVariants[item.masterProductId]
      ) {
        newVariants[item.masterProductId] = availableVariants[0].id;
        changed = true;
      }
    });

    if (changed) {
      setSelectedVariants(newVariants);
    }
  }, [packingList, masterProducts, selectedVariants]);

  const addMenu = () => {
    setSelectedMenus([
      ...selectedMenus,
      { recipeId: "", recipeName: "", raciones: 0 },
    ]);
  };

  const removeMenu = (index: number) => {
    setSelectedMenus(selectedMenus.filter((_, i) => i !== index));
  };

  const updateMenu = (
    index: number,
    field: keyof SelectedMenu,
    value: string | number
  ) => {
    const newMenus = [...selectedMenus];
    if (field === "recipeId") {
      newMenus[index].recipeId = value as string;
      newMenus[index].recipeName =
        recipes.find((r) => r.id === value)?.nombre || "";
    } else {
      newMenus[index] = { ...newMenus[index], [field]: value };
    }
    setSelectedMenus(newMenus);
  };

  const handleSaveOrder = async () => {
    const validMenus = selectedMenus.filter(
      (m) => m.recipeId && m.raciones > 0
    );
    if (validMenus.length === 0) {
      toast.error("Agrega al menos un menú con raciones válidas.");
      return;
    }

    if (!selectedOperatorId) {
      toast.error("Debe seleccionar un operador.");
      return;
    }

    if (!selectedClientId) {
      toast.error("Debe seleccionar un cliente.");
      return;
    }

    const missingProvider = packingList.some(
      (item) => !selectedVariants[item.masterProductId]
    );
    if (missingProvider) {
      toast.error(
        "Por favor seleccione un proveedor para cada producto de la lista de empaque."
      );
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorId: selectedOperatorId,
          clientId: selectedClientId,
          nota,
          items: validMenus.map((m) => ({
            recipeId: m.recipeId,
            raciones: m.raciones,
          })),
          materials: packingList.map((item) => ({
            masterProductId: item.masterProductId,
            productId: selectedVariants[item.masterProductId],
            cantidadTotal: item.totalQuantity,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar el pedido");
      }

      toast.success("Pedido guardado exitosamente y stock actualizado");
      setSelectedMenus([]);
      setSelectedOperatorId("");
      setSelectedClientId("");
      setSelectedVariants({});
      setNota("");
      fetchOrders();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const openOrderModal = (order: OrderRecord) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
        {/* PANEL IZQUIERDO: SELECCIÓN DE MENÚS */}
        <Card className="flex flex-col h-[60vh] overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4 shrink-0">
            <CardTitle className="text-xl text-primary">
              1. Datos del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Selección de Cliente */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Cliente / Institución *
              </label>
              <Combobox
                options={clients.map((c) => ({
                  label: `${c.nombre} (${c.nit})`,
                  value: c.id,
                }))}
                value={selectedClientId}
                onValueChange={(val) => setSelectedClientId(val)}
                placeholder="Seleccionar cliente..."
                className="border-primary/20"
              />
            </div>

            {/* Selección de Operador */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Operador Responsable *
              </label>
              <Combobox
                options={operators.map((op) => ({
                  label: `${op.nombreOperador} (${op.nitOperador})`,
                  value: op.id,
                }))}
                value={selectedOperatorId}
                onValueChange={(val) => setSelectedOperatorId(val)}
                placeholder="Seleccionar operador..."
                className="border-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Nota / Observación
              </label>
              <Input
                placeholder="Ej: Entrega urgente, cambio de marca, etc."
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-semibold text-primary">
                  Menús y Raciones *
                </label>
              </div>

              <div className="space-y-3">
                {selectedMenus.map((menu, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-center bg-muted/10 p-3 rounded-lg border border-primary/10"
                  >
                    <div className="col-span-12 md:col-span-7">
                      <Combobox
                        options={recipes.map((r) => ({
                          label: r.nombre,
                          value: r.id,
                        }))}
                        value={menu.recipeId}
                        onValueChange={(val) =>
                          updateMenu(index, "recipeId", val)
                        }
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
                        onChange={(e) =>
                          updateMenu(
                            index,
                            "raciones",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="bg-white h-9"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMenu(index)}
                        className="h-9 w-9 text-destructive hover:bg-destructive/10"
                      >
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
        <Card className="flex flex-col h-[60vh] border-primary/20 shadow-md overflow-hidden bg-white">
          <CardHeader className="border-b bg-primary/5 pb-4 shrink-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  2. Lista de Empaque
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Generado el{" "}
                  {format(new Date(), "dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
              <div className="flex gap-2 print:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrint}
                  title="Imprimir Lista"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleSaveOrder}
                  disabled={isSaving || packingList.length === 0}
                  title="Guardar Histórico y Descontar Stock"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Datos del Cliente + Operador */}
            <div className="mt-4 p-3 bg-white border rounded-md text-xs grid grid-cols-2 gap-x-4 gap-y-1 border-primary/20">
              {selectedClient && (
                <>
                  <div className="col-span-2 font-bold text-primary text-sm mb-1 uppercase">
                    {selectedClient.nombre}
                  </div>
                  <div>
                    <span className="font-semibold">NIT:</span>{" "}
                    {selectedClient.nit}
                  </div>
                  <div>
                    <span className="font-semibold">MUNICIPIO:</span>{" "}
                    {selectedClient.municipio || "N/A"}
                  </div>
                </>
              )}
              {selectedOperator && (
                <>
                  <div className="col-span-2 font-bold text-slate-700 text-sm mt-2 mb-1 uppercase border-t pt-1">
                    {selectedOperator.nombreOperador}
                  </div>
                  <div>
                    <span className="font-semibold">NIT OP:</span>{" "}
                    {selectedOperator.nitOperador}
                  </div>
                  <div>
                    <span className="font-semibold">MODELO:</span>{" "}
                    {selectedOperator.modeloAtencion}
                  </div>
                  <div>
                    <span className="font-semibold">BODEGA:</span>{" "}
                    {selectedOperator.direccionBodega}
                  </div>
                  <div>
                    <span className="font-semibold">MUNICIPIO:</span>{" "}
                    {selectedOperator.municipioBodega}
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {packingList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <span className="text-3xl">📦</span>
                </div>
                <p>
                  Selecciona el cliente, operador, menús e ingresa raciones para
                  calcular la explosión de materiales.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="font-semibold text-primary">
                      Producto
                    </TableHead>
                    <TableHead className="font-semibold text-primary">
                      Proveedor / Marca *
                    </TableHead>
                    <TableHead className="font-semibold text-primary text-right">
                      Cantidad
                    </TableHead>
                    <TableHead className="font-semibold text-primary">
                      Unidad
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packingList.map((item, index) => {
                    const master = masterProducts.find(
                      (mp) => mp.id === item.masterProductId
                    );
                    const variants = master?.providerProducts || [];
                    const selectedVariant = variants.find(
                      (v) => v.id === selectedVariants[item.masterProductId]
                    );
                    const selectedLabel = selectedVariant
                      ? `${selectedVariant.provider?.razonSocial || "N/A"} - ${selectedVariant.descripcionMarca}`
                      : "";

                    return (
                      <TableRow key={index} className="hover:bg-accent/50">
                        <TableCell className="font-medium">
                          {item.productName}
                        </TableCell>
                        <TableCell className="min-w-[250px]">
                          <Select
                            value={
                              selectedVariants[item.masterProductId] || ""
                            }
                            onValueChange={(val) =>
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [item.masterProductId]: val,
                              }))
                            }
                          >
                            <SelectTrigger className="h-9 bg-white border-primary/10">
                              <SelectValue>
                                {selectedLabel || "Seleccione proveedor..."}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {variants
                                .filter((v) => v.currentStock > 0)
                                .map((v) => (
                                  <SelectItem key={v.id} value={v.id}>
                                    {v.provider?.razonSocial || "N/A"} -{" "}
                                    {v.descripcionMarca} ({v.currentStock})
                                  </SelectItem>
                                ))}
                              {variants.filter((v) => v.currentStock > 0)
                                .length === 0 && (
                                <SelectItem value="none" disabled>
                                  Sin stock disponible
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-lg text-secondary">
                          {item.totalQuantity.toLocaleString("es-CO", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.unit}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {packingList.length > 0 && (
            <CardFooter className="border-t bg-muted/10 p-4 shrink-0">
              <div className="w-full flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Total de items:{" "}
                  <strong className="text-foreground">
                    {packingList.length}
                  </strong>
                </span>
                <span className="text-muted-foreground">
                  Total raciones:{" "}
                  <strong className="text-foreground">
                    {selectedMenus
                      .reduce((acc, curr) => acc + (curr.raciones || 0), 0)
                      .toLocaleString("es-CO")}
                  </strong>
                </span>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* HISTORIAL DE PEDIDOS */}
      <div className="flex-1 min-h-0">
        <Card className="h-full flex flex-col overflow-hidden border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 pb-4 shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-slate-700 flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Pedidos
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchOrders}
                disabled={isLoadingOrders}
                className="text-xs"
              >
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {orders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 space-y-2">
                <History className="h-10 w-10 opacity-20" />
                <p>No hay pedidos registrados aún.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/20 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">
                      Fecha
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Cliente
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Operador
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">
                      Raciones
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">
                      Materiales
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">
                      Ver
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => openOrderModal(order)}
                    >
                      <TableCell>
                        <span className="text-sm font-medium">
                          {format(new Date(order.fecha), "dd/MM/yyyy HH:mm", {
                            locale: es,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium text-sm text-primary">
                            {order.client?.nombre || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {order.operator?.nombreOperador || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-mono">
                          {order.items
                            .reduce((sum, i) => sum + i.raciones, 0)
                            .toLocaleString("es-CO")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-slate-500">
                        {order.materials.length} items
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderModal(order);
                          }}
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODAL: RESUMEN DEL PEDIDO */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-0 flex flex-col">
          <DialogHeader className="p-6 border-b shrink-0">
            <DialogTitle className="text-xl font-bold">
              Resumen del Pedido
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border text-sm">
                <div>
                  <span className="text-xs text-muted-foreground uppercase">
                    Fecha
                  </span>
                  <p className="font-semibold">
                    {format(
                      new Date(selectedOrder.fecha),
                      "dd 'de' MMMM 'de' yyyy - HH:mm",
                      { locale: es }
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">
                    Cliente
                  </span>
                  <p className="font-semibold text-primary">
                    {selectedOrder.client?.nombre || "—"}
                  </p>
                  <p className="text-xs text-slate-500">
                    NIT: {selectedOrder.client?.nit || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">
                    Operador
                  </span>
                  <p className="font-semibold">
                    {selectedOrder.operator?.nombreOperador || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">
                    Total Raciones
                  </span>
                  <p className="font-semibold text-lg">
                    {selectedOrder.items
                      .reduce((sum, i) => sum + i.raciones, 0)
                      .toLocaleString("es-CO")}
                  </p>
                </div>
                {selectedOrder.nota && (
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground uppercase">
                      Nota
                    </span>
                    <p className="text-sm italic">{selectedOrder.nota}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700">
                  Materiales Despachados
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs">Producto</TableHead>
                      <TableHead className="text-xs">Proveedor</TableHead>
                      <TableHead className="text-xs text-right">
                        Cantidad
                      </TableHead>
                      <TableHead className="text-xs">Unidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.materials.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-sm font-medium">
                          {m.masterProduct.nombre}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {m.product.provider?.razonSocial || "N/A"} —{" "}
                          {m.product.descripcionMarca}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {m.cantidadTotal.toLocaleString("es-CO", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-xs">
                          {m.masterProduct.unidadMedida}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
