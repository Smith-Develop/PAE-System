"use client";

import { useState, useEffect } from "react";
import { Save, Building, Truck, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { Product, Provider, Operator } from "@/types";

interface InvoiceMapperProps {
  items: { nombre: string; cantidad: number; precioUnitario: number }[];
  onSaved: () => void;
  onCancel: () => void;
}

interface RowState {
  productId: string;
}

export function InvoiceMapper({ items, onSaved, onCancel }: InvoiceMapperProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [rows, setRows] = useState<RowState[]>([]);
  const [editableItems, setEditableItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);
  const [operatorId, setOperatorId] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/providers").then((r) => r.json()),
      fetch("/api/operators").then((r) => r.json()),
    ]).then(([p, prov, op]) => {
      setProducts(p);
      setProviders(prov);
      setOperators(op);
      setRows(items.map(() => ({ productId: "" })));
      if (prov.length > 0) setSelectedProviderId(prov[0].id);
    }).catch(() => {
      toast.error("Error al cargar datos");
    });
  }, [items]);

  // Filtrar productos por proveedor seleccionado
  const filteredProducts = selectedProviderId
    ? products.filter((p) => p.providerId === selectedProviderId)
    : products;

  const productOptions = filteredProducts.map((p) => ({
    label: `${p.masterProduct?.nombre || "?"} - ${p.descripcionMarca}`,
    value: p.id,
  }));

  const updateRow = (index: number, productId: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { productId };
      return next;
    });
  };

  const updateQuantity = (index: number, value: string) => {
    setEditableItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], cantidad: parseFloat(value) || 0 };
      return next;
    });
  };

  const updatePrice = (index: number, value: string) => {
    setEditableItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], precioUnitario: parseFloat(value) || 0 };
      return next;
    });
  };

  const removeItem = (index: number) => {
    setEditableItems((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!operatorId) { toast.error("Selecciona un operador"); return; }
    if (!fechaCompra) { toast.error("Selecciona una fecha de compra"); return; }

    const incompleteRows = rows.some((r) => !r.productId);
    if (incompleteRows) {
      toast.error("Selecciona un producto del catálogo para cada ítem");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        operatorId,
        clientId: null,
        fechaCompra,
        items: editableItems.map((item, i) => ({
          productId: rows[i].productId,
          precioUnitario: item.precioUnitario,
          cantidadComprada: item.cantidad,
          valorTotal: item.cantidad * item.precioUnitario,
        })),
      };

      const res = await fetch("/api/purchases/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      const data = await res.json();
      toast.success(`${data.count} compras registradas`);
      localStorage.removeItem("invoice-items");
      localStorage.removeItem("invoice-pending");
      onSaved();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la factura");
    } finally {
      setIsSaving(false);
    }
  };

  const formatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold">Items de la Factura</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Datos de la factura */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-semibold text-blue-600 flex items-center gap-1"><Building className="h-3 w-3" /> Operador *</p>
            <Combobox
              options={operators.map((o) => ({ label: o.nombreOperador, value: o.id }))}
              value={operatorId}
              onValueChange={setOperatorId}
              placeholder="Seleccionar..."
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-semibold text-blue-600 flex items-center gap-1"><Truck className="h-3 w-3" /> Proveedor *</p>
            <Combobox
              options={providers.map((p) => ({ label: p.razonSocial, value: p.id }))}
              value={selectedProviderId}
              onValueChange={(v) => {
                setSelectedProviderId(v);
                // Limpiar productos seleccionados al cambiar de proveedor
                setRows(editableItems.map(() => ({ productId: "" })));
              }}
              placeholder="Filtrar catálogo..."
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-semibold text-blue-600 flex items-center gap-1"><Calendar className="h-3 w-3" /> Fecha *</p>
            <Input type="date" value={fechaCompra} onChange={(e) => setFechaCompra(e.target.value)} className="h-9 bg-white" />
          </div>
        </div>

        {/* Tabla de items */}
        <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Producto</TableHead>
                <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight w-[75px]">Cant.</TableHead>
                <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight w-[95px]">P.Unit</TableHead>
                <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Catálogo</TableHead>
                <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight w-[110px]">Valor Total</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay ítems para mapear.</TableCell>
                </TableRow>
              ) : (
                editableItems.map((item, i) => {
                  const valorTotal = item.cantidad * item.precioUnitario;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-xs break-all">{item.nombre}</TableCell>
                      <TableCell className="text-right">
                        <Input type="number" min="0" step="0.01" value={item.cantidad || ""} onChange={(e) => updateQuantity(i, e.target.value)} className="h-7 w-[70px] text-xs text-right" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input type="number" min="0" step="0.01" value={item.precioUnitario || ""} onChange={(e) => updatePrice(i, e.target.value)} className="h-7 w-[90px] text-xs text-right font-mono" />
                      </TableCell>
                      <TableCell>
                        <Combobox
                          options={productOptions}
                          value={rows[i]?.productId || ""}
                          onValueChange={(v) => updateRow(i, v)}
                          placeholder="Seleccionar..."
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-primary">
                        {formatter.format(valorTotal)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(i)} title="Eliminar ítem">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving || editableItems.length === 0} className="px-10 h-11 font-bold bg-blue-600 hover:bg-blue-700 text-white uppercase tracking-widest text-xs">
            {isSaving ? "Guardando..." : <><Save className="mr-2 h-4 w-4" /> Guardar Factura Completa</>}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSaving} className="h-11">Cancelar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
