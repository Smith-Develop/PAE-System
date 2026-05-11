import { z } from "zod";

// --- Proveedores ---
export const providerSchema = z.object({
  razonSocial: z.string().min(1, "La razón social es requerida"),
  nit: z.string().min(1, "El NIT del proveedor es requerido"),
  codigoInscripcion: z.string().optional().default(""),
  representanteLegal: z.string().min(1, "El representante legal es requerido"),
  municipio: z.string().min(1, "El municipio es requerido"),
  direccionEstablecimiento: z.string().optional().default(""),
  telefono: z.string().optional().default(""),
  correo: z.string().optional().default(""),
  tipoActividad: z.string().min(1, "El tipo de actividad es requerido"),
  compraLocal: z.boolean().default(false),
  fechaVisita: z.string().optional().default(""),
  conceptoSanitario: z.string().optional().default(""),
  entidadEmisora: z.string().optional().default(""),
});
export type ProviderFormData = z.infer<typeof providerSchema>;

// --- Grupo Alimentos ---
export const foodGroupSchema = z.object({
  name: z.string().min(1, "El nombre del grupo es requerido"),
});
export type FoodGroupFormData = z.infer<typeof foodGroupSchema>;

// --- Productos (Maestro) ---
export const productSchema = z.object({
  providerId: z.string().min(1, "Seleccione un proveedor"),
  foodGroupId: z.string().min(1, "Seleccione un grupo de alimentos"),
  alimento: z.string().min(1, "El alimento es requerido"),
  descripcionMarca: z.string().min(1, "La descripción/marca es requerida"),
  registroSanitario: z.string().optional().default(""),
  unidadMedida: z.string().min(1, "La unidad de medida es requerida"),
});

export type ProductFormData = z.infer<typeof productSchema>;

// --- Recetas ---
export const recipeIngredientSchema = z.object({
  componente: z.string().min(1, "El componente es requerido"),
  preparacion: z.string().min(1, "La preparación es requerida"),
  productId: z.string().min(1, "Seleccione un producto"),
  cantidadBrutaUnitaria: z.coerce
    .number()
    .positive("La cantidad debe ser mayor a 0"),
});

export const recipeSchema = z.object({
  nombre: z.string().min(1, "El nombre de la receta es requerido"),
  descripcion: z.string().optional().default(""),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, "Debe agregar al menos un ingrediente"),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;

// --- Compras ---
export const purchaseSchema = z.object({
  productId: z.string().min(1, "Seleccione un producto"),
  operatorId: z.string().min(1, "Seleccione un operador"),
  fechaCompra: z.coerce.date({ message: "La fecha es requerida" }),
  cantidadComprada: z.coerce
    .number()
    .positive("La cantidad debe ser mayor a 0"),
  valorTotal: z.coerce.number().positive("El valor debe ser mayor a 0"),
});

export type PurchaseFormData = z.infer<typeof purchaseSchema>;

// --- Operador ---
export const operatorSchema = z.object({
  nombreOperador: z.string().min(1, "El nombre del operador es requerido"),
  nitOperador: z.string().min(1, "El NIT es requerido"),
  modeloAtencion: z.string().min(1, "El modelo de atención es requerido"),
  modalidadAtencion: z.string().min(1, "La modalidad es requerida"),
  direccionBodega: z.string().min(1, "La dirección de bodega es requerida"),
  municipioBodega: z.string().min(1, "El municipio de bodega es requerido"),
  contactoBodega: z.string().min(1, "El contacto de bodega es requerido"),
  telefonoBodega: z.string().min(1, "El teléfono de bodega es requerido"),
});

export type OperatorFormData = z.infer<typeof operatorSchema>;

// --- Pedidos ---
export const orderItemSchema = z.object({
  recipeId: z.string().min(1, "Seleccione una receta"),
  raciones: z.coerce.number().int().positive("Las raciones deben ser mayores a 0"),
});

export const orderSchema = z.object({
  operatorId: z.string().min(1, "Seleccione un operador"),
  nota: z.string().optional().default(""),
  items: z.array(orderItemSchema).min(1, "Debe agregar al menos un ítem"),
});

export type OrderFormData = z.infer<typeof orderSchema>;

// --- Usuarios ---
export const userSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "El nombre es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  roleId: z.string().min(1, "Seleccione un rol"),
});

export const userUpdateSchema = userSchema.partial({ password: true });

export type UserFormData = z.infer<typeof userSchema>;
