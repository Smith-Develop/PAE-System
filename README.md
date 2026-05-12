# PAE Antioquia - Sistema de Gestión de Alimentación Escolar

Aplicación web B2B para la gestión del **Programa de Alimentación Escolar (PAE)** en Antioquia, Colombia. Automatiza el flujo logístico completo: desde la definición de recetas y el ingreso de pedidos diarios, hasta la "explosión de materiales" (cálculo de insumos) y la generación del **Reporte de Proveeduría de Alimentos** exigido por la Gobernación (Resolución 719).

---

## Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS 4 |
| **UI** | Shadcn UI + Base UI |
| **Base de Datos** | PostgreSQL (Supabase) + Prisma ORM |
| **Autenticación** | NextAuth v5 (Credentials) |
| **Exportación** | xlsx (Excel/CSV) |
| **PWA** | Service Worker + Web App Manifest |

---

## Módulos del Sistema

### 1. Autenticación y Roles

Sistema de login con credenciales (email/contraseña) con dos roles:

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso total: todos los módulos, crear usuarios, backups, borrado masivo, logs de auditoría |
| **EMPLEADO** | Operaciones diarias: pedidos, registro de compras, ver reportes |

### 2. Operadores (`/operadores`)

CRUD de los operadores logísticos del PAE. Cada operador tiene: nombre, NIT, modelo de atención, modalidad, dirección de bodega, municipio, contacto y teléfono.

### 3. Clientes (`/clientes`)

Gestión de instituciones educativas y dependencias que reciben los pedidos. Campos: nombre, NIT, dirección, municipio, persona de contacto, teléfono y correo.

### 4. Proveedores (`/proveedores`)

Directorio de proveedores con datos completos exigidos por la Gobernación:
- Razón social, NIT, código de inscripción
- Representante legal, municipio, dirección
- Teléfono, correo, tipo de actividad
- Compra local (Sí/No)
- Datos sanitarios: fecha de visita, concepto sanitario, entidad emisora

### 5. Maestro de Productos (`/maestro`)

Dos pestañas:

- **Catálogo General**: Productos genéricos (ARROZ, LECHE, CARNE DE RES...) con unidad de medida y grupo alimentario. Son la base de datos maestra de insumos.
- **Productos por Proveedor**: Variantes específicas de cada producto por proveedor (descripción/marca, registro sanitario, stock actual).

### 6. Grupos Alimentarios (`/grupos`)

Dos pestañas basadas en la **Resolución 719**:

- **Grupos Alimentarios**: 15 grupos definidos por la normativa (Lácteos, Grasas, Aguas, Frutas/Verduras, Confitería, Cereales, Panadería, Carnes, Pescados, Huevos, Azúcar, Miel, Sal/Especias, Uso Especial, Compuestos).
- **Productos por Grupo**: CRUD de productos del catálogo general, filtrable por grupo alimentario.

### 7. Componentes (`/componentes`)

Tipos de componentes para clasificar platos: Proteína, Cereal, Fruta, Bebida, Complemento, Sopas, Ensalada, Postre. Totalmente personalizables.

### 8. Recetario (`/recetas`)

Dos pestañas con la jerarquía **Plato → Menú**:

- **Platos (Dish)**: Cada plato pertenece a un componente (ej. "Carne Sudada" → Proteína) y tiene múltiples ingredientes con sus cantidades brutas unitarias en gramos/mililitros por ración.
- **Menús**: Agrupan varios platos en un orden específico. Ej: Menú No. 1 = Proteína + Cereal + Sopa + Bebida + Fruta.

### 9. Bodega / Inventario (`/bodega`)

Visualización del inventario actual por producto (variante de proveedor) con stock disponible, y registro de transacciones (entradas, salidas, ajustes).

### 10. Pedidos (`/pedidos`)

**Panel izquierdo**: Selección de cliente, operador, menú(es) y cantidad de raciones.

**Panel derecho**: Lista de Empaque generada automáticamente por **explosión de materiales**:

```
Fórmula: (Cantidad Bruta en gramos × Raciones) / 1000 = Total en Kg o L
```

- Agrupa ingredientes idénticos entre menús
- Selección de proveedor/marca para cada producto
- Descuento automático de stock al guardar

**Panel inferior**: Historial de pedidos con modal de resumen y opción de eliminar (restaura stock).

### 11. Registro de Compras (`/compras`)

Formulario para registrar facturas reales: producto (variante de proveedor), operador, cliente, fecha de compra, cantidad comprada y valor total. Incluye tabla con historial de compras y filtros.

### 12. Reporte Gobernación (`/reporte`)

Genera las **30 columnas exactas** exigidas por la Resolución 719 a partir de los pedidos registrados:

| Columnas |
|----------|
| Nombre Operador, NIT Operador, Modelo Atención, Modalidad, Dirección Bodega, Municipio Bodega, Contacto, Teléfono, Razón Social Proveedor, Código Inscripción, NIT Proveedor, Representante Legal, Municipio Proveedor, Dirección Establecimiento, Teléfono, Correo, Tipo Actividad, Compra Local, Grupo Alimentos (Res 719), Alimentos (Res 719), Descripción y Marca, Registro Sanitario, Fecha Visita, Concepto Sanitario, Entidad Emisora, Mes Compra, Alimento Comprado, Cantidad Total Comprada, Unidad, Valor Total |

Filtros por **mes** y **cliente**. Botón de exportación a **Excel** con `xlsx`.

### 13. Ajustes (`/ajustes`)

Panel de administración con 5 pestañas:

| Pestaña | Funcionalidad |
|---------|--------------|
| **Perfil** | Cambiar nombre y correo electrónico |
| **Contraseña** | Cambiar contraseña (valida actual) |
| **Usuarios** | CRUD completo de usuarios (solo admin). Asignar rol, activar/desactivar |
| **Backup** | Descargar toda la BD como JSON. Restaurar desde archivo |
| **Mantenimiento** | Botones de borrado masivo por entidad (proveedores, operadores, pedidos, etc.) + "Limpiar Todo". Solo admin |
| **Logs** | Auditoría completa: quién hizo qué, cuándo. Filtro por tipo de acción. Solo admin |

---

## PWA (Progressive Web App)

La aplicación es instalable como PWA en dispositivos móviles y escritorio:

- **Service Worker**: Caché offline de recursos estáticos
- **Manifest**: Iconos, nombre, tema, orientación
- **Install Prompt**: Al iniciar sesión, aparece un diálogo en la esquina inferior derecha invitando a instalar la app. Si ya está instalada o se descarta, no vuelve a mostrarse.

---

## Base de Datos

PostgreSQL en Supabase con 18 tablas modeladas en Prisma:

```
User, Role, Log
Client, Operator, Provider
FoodGroup, MasterProduct, Product, StockTransaction
Component, Dish, DishIngredient
Menu, MenuDish
Order, OrderItem, OrderMaterial
Purchase
```

---

## Variables de Entorno

Crear archivo `.env`:

```env
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/postgres"
AUTH_SECRET="clave-secreta-nextauth"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Instalación y Uso

```bash
# Instalar dependencias
npm install

# Sincronizar base de datos
npx prisma db push

# Ejecutar seed (crea admin + roles)
npm run seed

# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Credenciales por defecto

| Email | Password | Rol |
|-------|----------|-----|
| `admin@pae.gov.co` | `admin123` | ADMIN |
| `empleado@pae.gov.co` | `empleado123` | EMPLEADO |

---

## Despliegue en Vercel

1. Conectar repositorio en Vercel
2. Agregar variables de entorno (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`)
3. El build ejecuta automáticamente `prisma generate` + `next build`
4. En runtime, `ensureDb()` verifica/crea el admin y componentes
