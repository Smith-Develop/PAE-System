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
  menuId: string;
  menuName: string;
  raciones: number;
}

export interface PackingItem {
  masterProductId: string;
  productName: string;
  unit: string;
  totalQuantity: number;
  selectedProductId?: string; // ID de la variante de proveedor elegida
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

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  active: boolean;
  planId?: string | null;
  plan?: Plan | null;
  maxUsers: number;
  aiScansLimit: number;
  aiScansUsed: number;
  expirationDate?: Date | string | null;
  createdAt?: Date;
  updatedAt?: Date;
  _count?: { users: number };
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  maxUsers: number;
  aiScansLimit: number;
  price: number;
  durationDays: number;
  active: boolean;
  mercadoPagoPlanId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Subscription {
  id: string;
  tenantId: string;
  tenant?: Tenant;
  planId: string;
  plan?: Plan;
  startDate: Date | string;
  endDate: Date | string;
  amount: number;
  active: boolean;
  createdAt?: Date;
}

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

export interface Client {
  id: string;
  nombre: string;
  nit: string;
  direccion?: string;
  municipio?: string;
  contacto?: string;
  telefono?: string;
  correo?: string;
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

export interface MasterProduct {
  id: string;
  nombre: string;
  unidadMedida: string;
  foodGroupId: string;
  foodGroup?: FoodGroup;
  providerProducts?: Product[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FoodGroup {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  masterProductId: string;
  masterProduct?: MasterProduct;
  providerId: string;
  provider?: Provider;
  descripcionMarca: string;
  registroSanitario?: string;
  currentStock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Component {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DishIngredient {
  id: string;
  cantidadBrutaUnitaria: number;
  dishId: string;
  masterProductId: string;
  masterProduct?: MasterProduct;
}

export interface Dish {
  id: string;
  nombre: string;
  componenteId: string;
  componente?: Component;
  descripcion?: string | null;
  ingredients: DishIngredient[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MenuDish {
  id: string;
  orden: number;
  menuId: string;
  dishId: string;
  dish?: Dish;
}

export interface Menu {
  id: string;
  nombre: string;
  descripcion?: string | null;
  dishes: MenuDish[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Purchase {
  id: string;
  fechaCompra: Date | string;
  precioUnitario: number;
  cantidadComprada: number;
  valorTotal: number;
  productId: string;
  product?: Product;
  operatorId?: string | null;
  operator?: Operator | null;
  clientId?: string | null;
  client?: Client | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id: string;
  raciones: number;
  orderId: string;
  menuId: string;
  menu?: Menu;
}

export interface Order {
  id: string;
  fecha: Date | string;
  nota?: string | null;
  clientId?: string | null;
  client?: Client | null;
  operatorId?: string | null;
  operator?: Operator | null;
  items: OrderItem[];
  materials?: OrderMaterial[];
  createdAt?: Date;
}

export interface OrderMaterial {
  id: string;
  orderId: string;
  masterProductId: string;
  masterProduct?: MasterProduct;
  productId: string;
  product?: Product;
  cantidadTotal: number;
}

export interface StockTransaction {
  id: string;
  type: "ENTRADA" | "SALIDA" | "AJUSTE";
  quantity: number;
  reason?: string | null;
  productId: string;
  createdAt: Date | string;
}
