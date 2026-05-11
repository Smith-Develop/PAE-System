"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuSchema, MenuFormData } from "@/lib/validations";
import {
  Plus,
  Trash2,
  GripVertical,
  ClipboardList,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Dish } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const COMPONENTE_ORDER: string[] = [];

const COMPONENTE_COLORS: Record<string, string> = {};

interface MenuFormProps {
  initialData?: any | null;
  dishes: Dish[];
  onSubmit: (data: MenuFormData) => void;
  isSubmitting: boolean;
}

export function MenuForm({
  initialData,
  dishes,
  onSubmit,
  isSubmitting,
}: MenuFormProps) {
  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema) as any,
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          descripcion: initialData.descripcion || "",
          dishes: initialData.dishes.map((md: any, idx: number) => ({
            dishId: md.dishId || md.dish?.id,
            orden: md.orden ?? idx,
          })),
        }
      : {
          nombre: "",
          descripcion: "",
          dishes: [],
        },
  });

  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: "dishes",
    keyName: "fieldKey",
  });

  const selectedIds = fields.map((f: any) => f.dishId);

  const groupedDishes: Record<string, Dish[]> = {};
  for (const d of dishes) {
    const comp = d.componente?.name || "Otros";
    if (!groupedDishes[comp]) groupedDishes[comp] = [];
    groupedDishes[comp].push(d);
  }

  const sortedComponents = Object.keys(groupedDishes).sort();

  const toggleDish = (dishId: string, checked: boolean) => {
    if (checked) {
      append({ dishId, orden: fields.length });
    } else {
      const idx = fields.findIndex((f: any) => f.dishId === dishId);
      if (idx >= 0) remove(idx);
    }
  };

  const moveDish = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < fields.length) {
      swap(index, newIndex);
      // Update orden values
      setTimeout(() => {
        fields.forEach((_: any, i: number) => {
          form.setValue(`dishes.${i}.orden`, i);
        });
      }, 50);
    }
  };

  const getDishName = (dishId: string) => {
    return dishes.find((d) => d.id === dishId)?.nombre || "Desconocido";
  };

  const getDishComponente = (dishId: string) => {
    return dishes.find((d) => d.id === dishId)?.componente?.name || "";
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col h-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Nombre del Menú *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. Menú No. 1"
                      {...field}
                      className="bg-white h-11 border-slate-200 focus:ring-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 font-semibold uppercase text-xs tracking-wider">
                    Descripción
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles del menú (opcional)"
                      {...field}
                      className="bg-white border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Platos seleccionados ({fields.length})
            </h3>
            {fields.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 border rounded-lg border-dashed text-center">
                Selecciona platos de la lista para agregarlos al menú.
              </div>
            ) : (
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto bg-white">
                {fields.map((field: any, index: number) => (
                  <div
                    key={field.fieldKey}
                    className="flex items-center gap-2 p-3 hover:bg-slate-50"
                  >
                    <div className="flex flex-col">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => moveDish(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => moveDish(index, "down")}
                        disabled={index === fields.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-xs font-mono text-slate-400 w-6">
                      {index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {getDishName(field.dishId)}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] border ${
                        COMPONENTE_COLORS[getDishComponente(field.dishId)] ||
                        "bg-slate-100"
                      }`}
                    >
                      {getDishComponente(field.dishId)}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista de platos disponibles por componente */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider">
            Platos disponibles para agregar
          </h3>
          {dishes.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 border rounded-lg border-dashed text-center">
              No hay platos creados. Crea platos primero.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-48 overflow-y-auto">
              {sortedComponents.map((comp) => (
                <div key={comp} className="space-y-1">
                <Badge
                  variant="outline"
                  className="text-[10px] border bg-slate-100 text-slate-700"
                >
                  {comp}
                </Badge>
                  {groupedDishes[comp].map((d) => (
                    <label
                      key={d.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedIds.includes(d.id)}
                        onCheckedChange={(c) =>
                          toggleDish(d.id, c === true)
                        }
                      />
                      <span className="text-sm text-slate-700 truncate">
                        {d.nombre}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {d.ingredients.length} ing.
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {form.formState.errors.dishes?.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.dishes.root.message}
          </p>
        )}

        <div className="flex justify-end gap-4 pt-6 mt-auto border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="px-8 h-12 font-bold text-slate-500 border-slate-300 hover:bg-slate-100 uppercase tracking-widest text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-10 h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white uppercase tracking-widest text-xs shadow-lg"
          >
            {isSubmitting ? "Guardando..." : "Crear Menú →"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
