// ============================================
// Interfaces de TypeScript para la app PAE
// ============================================

// --- Autenticación y Roles ---
export interface RolePermissions {
  maestro: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
  recetas: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
  pedidos: { ver: boolean; crear: boolean };
  compras: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
  reporte: { ver: boolean; exportar: boolean };
  ajustes: { ver: boolean; editar: boolean };
}

export const DEFAULT_ADMIN_PERMISSIONS: RolePermissions = {
  maestro: { ver: true, crear: true, editar: true, eliminar: true },
  recetas: { ver: true, crear: true, editar: true, eliminar: true },
  pedidos: { ver: true, crear: true },
  compras: { ver: true, crear: true, editar: true, eliminar: true },
  reporte: { ver: true, exportar: true },
  ajustes: { ver: true, editar: true },
};

export const DEFAULT_VIEWER_PERMISSIONS: RolePermissions = {
  maestro: { ver: true, crear: false, editar: false, eliminar: false },
  recetas: { ver: true, crear: false, editar: false, eliminar: false },
  pedidos: { ver: true, crear: false },
  compras: { ver: true, crear: false, editar: false, eliminar: false },
  reporte: { ver: true, exportar: false },
  ajustes: { ver: false, editar: false },
};

export type ModuleName = keyof RolePermissions;

// --- Módulo de Pedidos ---
export interface SelectedMenu {
  recipeId: string;
  recipeName: string;
  raciones: number;
}

export interface PackingItem {
  productId: string;
  productName: string;
  unit: string;
  totalQuantity: number; // Ya convertido a la unidad base
}

// --- Reporte Gobernación ---
export const REPORT_COLUMNS = [
  "NOMBRE DEL OPERADOR",
  "CC/NIT OPERADOR",
  "MODELO ATENCIÓN",
  "MODALIDAD ATENCIÓN",
  "DIRECCIÓN BODEGA",
  "MUNICIPIO BODEGA",
  "CONTACTO BODEGA",
  "TELÉFONO BODEGA",
  "RAZÓN SOCIAL PROVEEDOR",
  "CÓDIGO INSCRIPCIÓN",
  "NIT PROVEEDOR",
  "REPRESENTANTE LEGAL",
  "MUNICIPIO PROVEEDOR",
  "DIRECCIÓN ESTABLECIMIENTO",
  "TELÉFONO",
  "CORREO",
  "TIPO ACTIVIDAD",
  "COMPRA LOCAL",
  "GRUPO ALIMENTOS (Res 719)",
  "ALIMENTOS (Res 719)",
  "DESCRIPCIÓN Y MARCA",
  "REGISTRO SANITARIO",
  "FECHA VISITA",
  "CONCEPTO SANITARIO",
  "ENTIDAD EMISORA",
  "MES COMPRA",
  "ALIMENTO COMPRADO",
  "CANTIDAD TOTAL COMPRADA",
  "UNIDAD",
  "VALOR TOTAL",
] as const;

export const UNIT_OPTIONS = [
  "Kilogramos",
  "Litros",
  "Paquete",
  "Unidad",
  "Libras",
  "Gramos",
  "Mililitros",
] as const;

export type UnitMeasure = (typeof UNIT_OPTIONS)[number];

// --- Entidades Base ---

export interface Operator {
  id: string;
  nombreOperador: string;
  nitOperador: string;
  modeloAtencion: string;
  modalidadAtencion: string;
  direccionBodega: string;
  municipioBodega: string;
  contactoBodega: string;
  telefonoBodega: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Provider {
  id: string;
  razonSocial: string;
  nit: string;
  codigoInscripcion?: string;
  representanteLegal: string;
  municipio: string;
  direccionEstablecimiento?: string;
  telefono?: string;
  correo?: string;
  tipoActividad: string;
  compraLocal: boolean;
  fechaVisita?: string;
  conceptoSanitario?: string;
  entidadEmisora?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FoodGroup {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  providerId: string;
  provider?: Provider;
  foodGroupId: string;
  foodGroup?: FoodGroup;
  alimento: string;
  descripcionMarca: string;
  registroSanitario?: string;
  unidadMedida: string;
  currentStock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipeIngredient {
  id: string;
  componente: string;
  preparacion: string;
  cantidadBrutaUnitaria: number;
  recipeId: string;
  productId: string;
  product?: Product;
}

export interface Recipe {
  id: string;
  nombre: string;
  descripcion?: string | null;
  ingredients: RecipeIngredient[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Purchase {
  id: string;
  fechaCompra: Date | string;
  cantidadComprada: number;
  valorTotal: number;
  productId: string;
  product?: Product;
  operatorId?: string | null;
  operator?: Operator | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id: string;
  raciones: number;
  orderId: string;
  recipeId: string;
}

export interface Order {
  id: string;
  fecha: Date | string;
  nota?: string | null;
  operatorId?: string | null;
  operator?: Operator | null;
  items: OrderItem[];
  createdAt?: Date;
}

export interface StockTransaction {
  id: string;
  type: "ENTRADA" | "SALIDA" | "AJUSTE";
  quantity: number;
  reason?: string | null;
  productId: string;
  createdAt: Date | string;
}
