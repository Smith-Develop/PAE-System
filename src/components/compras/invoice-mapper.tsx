"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { Product, Provider } from "@/types";

interface InvoiceMapperProps {
  items: { nombre: string; cantidad: number; precioUnitario: number }[];
  operatorId: string;
  clientId: string;
  fechaCompra: Date | string;
  onSaved: () => void;
  onCancel: () => void;
}

interface RowState {
  productId: string;
  providerId: string;
}

export function InvoiceMapper({
  items,
  operatorId,
  clientId,
  fechaCompra,
  onSaved,
  onCancel,
}: InvoiceMapperProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [rows, setRows] = useState<RowState[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/providers").then((r) => r.json()),
    ]).then(([p, prov]) => {
      setProducts(p);
      setProviders(prov);
      setRows(items.map(() => ({ productId: "", providerId: "" })));
    }).catch(() => {
      toast.error("Error al cargar catálogo de productos y proveedores");
    });
  }, [items]);

  const updateRow = (index: number, field: keyof RowState, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      if (field === "productId") {
        const product = products.find((p) => p.id === value);
        next[index] = {
          productId: value,
          providerId: product?.providerId || next[index].providerId,
        };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const handleSave = async () => {
    const incompleteRows = rows.some((r) => !r.productId);
    if (incompleteRows) {
      toast.error("Selecciona un producto del catálogo para cada ítem");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        operatorId,
        clientId: clientId || null,
        fechaCompra: typeof fechaCompra === "string" ? fechaCompra : fechaCompra.toISOString(),
        items: items.map((item, i) => ({
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
      onSaved();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la factura");
    } finally {
      setIsSaving(false);
    }
  };

  const productOptions = products.map((p) => ({
    label: `${p.masterProduct?.nombre} (${p.provider?.razonSocial} - ${p.descripcionMarca})`,
    value: p.id,
  }));

  const providerOptions = providers.map((p) => ({
    label: `${p.razonSocial} (${p.nit})`,
    value: p.id,
  }));

  const formatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          Items de la Factura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Producto</TableHead>
                <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Cantidad</TableHead>
                <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Precio Unitario</TableHead>
                <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Catálogo</TableHead>
                <TableHead className="font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Proveedor</TableHead>
                <TableHead className="text-right font-bold text-primary py-2 px-2 text-[11px] sm:text-xs break-all whitespace-normal leading-tight">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay ítems para mapear.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, i) => {
                  const valorTotal = item.cantidad * item.precioUnitario;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-xs">{item.nombre}</TableCell>
                      <TableCell className="text-right text-xs">{item.cantidad}</TableCell>
                      <TableCell className="text-right text-xs font-mono">
                        {formatter.format(item.precioUnitario)}
                      </TableCell>
                      <TableCell>
                        <Combobox
                          options={productOptions}
                          value={rows[i]?.productId || ""}
                          onValueChange={(v) => updateRow(i, "productId", v)}
                          placeholder="Seleccionar..."
                        />
                      </TableCell>
                      <TableCell>
                        <Combobox
                          options={providerOptions}
                          value={rows[i]?.providerId || ""}
                          onValueChange={(v) => updateRow(i, "providerId", v)}
                          placeholder="Seleccionar..."
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatter.format(valorTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving || items.length === 0}
            className="px-10 h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white uppercase tracking-widest text-xs shadow-lg"
          >
            {isSaving ? (
              "Guardando..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Factura Completa
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
