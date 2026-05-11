# AGENTS.md / Project System Prompt

## Contexto del Proyecto
Esta es una aplicación web B2B para la gestión del Programa de Alimentación Escolar (PAE) en Antioquia, Colombia. El sistema automatiza el flujo logístico: desde la definición de recetas y el ingreso de pedidos diarios, hasta la "explosión de materiales" (cálculo de insumos para bodega) y el cruce de facturas de compra para generar automáticamente el "Reporte de Proveeduría de Alimentos" exigido por la Gobernación (Resolución 719).

## Tech Stack
* **Framework:** Next.js (App Router)
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS
* **UI Components:** Shadcn UI (para tablas, formularios, modales y botones)
* **Base de Datos:** Prisma ORM con PostgreSQL (o SQLite para el MVP)
* **Exportación:** Librería para exportar tablas a CSV/Excel (ej. `xlsx` o `papaparse`).

## Reglas de Arquitectura y Negocio (Los 5 Módulos)

El AI Agent debe estructurar la aplicación en los siguientes 5 módulos principales (rutas/pantallas):

### 1. Maestro de Proveedores y Productos (`/maestro`)
* **Propósito:** Base de datos estática de insumos.
* **Campos Clave requeridos por la Gobernación:** ID Producto, Nombre Operador, NIT Operador, Dirección Bodega, Razón Social Proveedor, NIT Proveedor, Representante Legal, Municipio, Tipo Actividad, Compra Local (Sí/No), Grupo Alimentos (Res 719), Alimento (Res 719), Descripción/Marca, Registro Sanitario.
* **Acción:** CRUD de productos. Un producto debe tener una unidad de medida base (Kilogramos, Litros).

### 2. Recetario (`/recetas`)
* **Propósito:** Definir los menús y sus porciones unitarias.
* **Lógica:** Una Receta (ej. "Menú No. 1") tiene muchos Ingredientes (relación con el Maestro de Productos).
* **Campos:** Componente, Preparación, Producto (relacionado), Cantidad Bruta Unitaria (gramos o mililitros).

### 3. Calculadora de Pedidos y Bodega (`/pedidos`)
* **Propósito:** Interfaz operativa diaria.
* **Acción 1:** El usuario selecciona uno o varios Menús y digita la cantidad de raciones solicitadas (Ej: Menú 1 -> 1000 raciones, Menú 2 -> 500 raciones).
* **Acción 2 (Explosión de Materiales):** El sistema calcula automáticamente el total de insumos requeridos. 
    * *Fórmula:* `(Cantidad Bruta en gramos * Raciones) / 1000 = Total en Kilogramos o Litros`.
    * Agrupa ingredientes idénticos (si 2 recetas usan Sal, suma la sal total).
* **Output:** Genera una "Lista de Empaque" para que la bodega despache/compre.

### 4. Registro de Compras (`/compras`)
* **Propósito:** Registrar las facturas reales basadas en los pedidos de bodega.
* **Acción:** Formulario donde el usuario selecciona un Producto del Maestro, indica el "Mes de Compra", la "Cantidad Comprada" y el "Valor Total".

### 5. Reporte Gobernación (`/reporte`)
* **Propósito:** Pantalla de cumplimiento normativo y exportación.
* **Lógica de Cruce (Equivalente a VLOOKUP/JOIN):** Por cada registro en "Compras", el sistema debe hacer un JOIN con el "Maestro de Productos" para traer todos los datos técnicos y legales del proveedor de ese insumo.
* **Output:** Una tabla estricta de 30 columnas.
* **Columnas exigidas (Orden estricto):** NOMBRE DEL OPERADOR, CC/NIT OPERADOR, MODELO ATENCIÓN, MODALIDAD ATENCIÓN, DIRECCIÓN BODEGA, MUNICIPIO BODEGA, CONTACTO BODEGA, TELÉFONO BODEGA, RAZÓN SOCIAL PROVEEDOR, CÓDIGO INSCRIPCIÓN, NIT PROVEEDOR, REPRESENTANTE LEGAL, MUNICIPIO PROVEEDOR, DIRECCIÓN ESTABLECIMIENTO, TELÉFONO, CORREO, TIPO ACTIVIDAD, COMPRA LOCAL, GRUPO ALIMENTOS (Res 719), ALIMENTOS (Res 719), DESCRIPCIÓN Y MARCA, REGISTRO SANITARIO, FECHA VISITA, CONCEPTO SANITARIO, ENTIDAD EMISORA, MES COMPRA, ALIMENTO COMPRADO, CANTIDAD TOTAL COMPRADA, UNIDAD, VALOR TOTAL.
* **Acción:** Botón gigante de "Exportar a CSV/Excel". Si la cantidad comprada es 0, el registro no debe aparecer en el reporte.

## Instrucciones para el AI Agent
1.  **TypeScript First:** Usa interfaces estrictas para los modelos de datos (Product, Recipe, Order, Purchase).
2.  **Schema de BD:** Antes de codificar el frontend, genera el schema de Prisma (`schema.prisma`) basándote estrictamente en las reglas de negocio anteriores y pídele confirmación al usuario.
3.  **UI/UX:** Crea un `Sidebar` o `Navbar` de navegación clara para los 5 módulos. Usa tarjetas (Cards) y tablas (DataTables de Shadcn) limpias.
4.  **Cálculos Seguros:** Asegúrate de manejar correctamente las conversiones de unidades (gramos a kilos, mililitros a litros) para evitar errores de coma flotante en JavaScript.
5.  **Formularios:** Usa `react-hook-form` y `zod` para validar que no se ingresen datos vacíos, especialmente en los IDs de productos.