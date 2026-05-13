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

// --- Clientes (Instituciones Educativas) ---
export const clientSchema = z.object({
  nombre: z.string().min(1, "El nombre del cliente es requerido"),
  nit: z.string().min(1, "El NIT es requerido"),
  direccion: z.string().optional().default(""),
  municipio: z.string().optional().default(""),
  contacto: z.string().optional().default(""),
  telefono: z.string().optional().default(""),
  correo: z.string().optional().default(""),
});
export type ClientFormData = z.infer<typeof clientSchema>;

// --- Grupo Alimentos ---
export const foodGroupSchema = z.object({
  name: z.string().min(1, "El nombre del grupo es requerido"),
});
export type FoodGroupFormData = z.infer<typeof foodGroupSchema>;

// --- Productos Maestros (Catálogo) ---
export const masterProductSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  unidadMedida: z.string().min(1, "La unidad de medida es requerida"),
  foodGroupId: z.string().min(1, "Seleccione un grupo de alimentos"),
});
export type MasterProductFormData = z.infer<typeof masterProductSchema>;

// --- Productos (Variante por Proveedor) ---
export const productSchema = z.object({
  masterProductId: z.string().min(1, "Seleccione un producto del catálogo"),
  providerId: z.string().min(1, "Seleccione un proveedor"),
  descripcionMarca: z.string().min(1, "La descripción/marca es requerida"),
  registroSanitario: z.string().optional().default(""),
  currentStock: z.coerce.number().min(0, "El stock no puede ser negativo"),
});
export type ProductFormData = z.infer<typeof productSchema>;

// --- Platos (Dish) ---
export const dishIngredientSchema = z.object({
  masterProductId: z.string().min(1, "Seleccione un producto"),
  cantidadBrutaUnitaria: z.coerce
    .number()
    .positive("La cantidad debe ser mayor a 0"),
});

export const dishSchema = z.object({
  nombre: z.string().min(1, "El nombre del plato es requerido"),
  componenteId: z.string().min(1, "Seleccione un componente"),
  descripcion: z.string().optional().default(""),
  ingredients: z
    .array(dishIngredientSchema)
    .min(1, "Debe agregar al menos un ingrediente"),
});

export type DishFormData = z.infer<typeof dishSchema>;

// --- Menús ---
export const menuDishSchema = z.object({
  dishId: z.string().min(1, "Seleccione un plato"),
  orden: z.coerce.number().int().min(0).default(0),
});

export const menuSchema = z.object({
  nombre: z.string().min(1, "El nombre del menú es requerido"),
  descripcion: z.string().optional().default(""),
  dishes: z.array(menuDishSchema).min(1, "Debe agregar al menos un plato"),
});

export type MenuFormData = z.infer<typeof menuSchema>;

// --- Compras ---
export const purchaseSchema = z.object({
  productId: z.string().min(1, "Seleccione un producto"),
  operatorId: z.string().min(1, "Seleccione un operador"),
  clientId: z.string().optional().default(""),
  fechaCompra: z.coerce.date({ message: "La fecha es requerida" }),
  precioUnitario: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  cantidadComprada: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
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
  menuId: z.string().min(1, "Seleccione un menú"),
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
