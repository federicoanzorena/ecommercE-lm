# Frontend - Ecommerce API

Aplicacion SPA construida con React 19, TypeScript y Vite. UI con Tailwind CSS v4, estado del servidor con React Query y estado del cliente con Redux Toolkit.

## Arquitectura

### Estructura de Capas

```
Pages (rutas)  →  Components (UI)  →  API (fetch)  →  Backend
      │                │
      │           React Query
      │         (cache server)
      │                │
      │            Redux
      │         (carrito)
      └── Types (interfaces)
```

### Provider Jerarquia (main.tsx)

```
StrictMode
  └─ Provider (Redux store)
       └─ PersistGate (redux-persist)
            └─ QueryClientProvider (React Query)
                 └─ BrowserRouter (React Router)
                      └─ App
```

React Query configurado con staleTime de 5 minutos y refetchOnWindowFocus deshabilitado.

## Stack Tecnico

| Capa         | Tecnologia           | Version |
| ------------ | -------------------- | ------- |
| Framework    | React                | 19.2.7  |
| Build Tool   | Vite                 | 8.1.1   |
| Lenguaje     | TypeScript           | ~6.0.2  |
| CSS          | Tailwind CSS         | 4.3.2   |
| Routing      | React Router DOM     | 7.18.1  |
| Server State | TanStack React Query | 5.101.2 |
| Client State | Redux Toolkit        | 2.12.0  |
| Persist      | redux-persist        | 6.0.0   |
| Forms        | React Hook Form      | 7.81.0  |
| Tablas       | TanStack React Table | 8.21.3  |

## Estructura de Carpetas

```
src/
  main.tsx              # Entry point (providers)
  App.tsx               # Rutas + layout shell (orquesta modules)
  index.css             # Tailwind + utilidades custom
  core/                 # Infraestructura compartida
    api/
      client.ts         # Wrapper generico apiFetch<T>
    store/
      store.ts          # configureStore + persist
    components/         # UI compartida de layout
      Navbar.tsx        # Nav responsive con drawer movil
      Footer.tsx        # Footer fijo
      Menu.tsx          # Menu del navbar
      Eyebrow.tsx       # Breadcrumb con indicador
    pages/
      AdminPage.tsx     # Dashboard de administracion
  modules/              # Features (vertical slices, como el backend)
    categorias/
      api.ts  types.ts  # CRUD categorias + interfaces
      CategoriaForm.tsx CategoriesPage.tsx CategoriesManagePage.tsx CategoriaFormPage.tsx
    productos/
      api.ts  types.ts  # CRUD productos (filtros, sort, paginacion)
      ItemList.tsx ListItem.tsx ItemDetail.tsx ProductForm.tsx
      HomePage.tsx CategoryProductsPage.tsx ItemDetailPage.tsx
      ProductsManagePage.tsx ProductFormPage.tsx
    presentaciones/
      api.ts  types.ts  # CRUD presentaciones (variantes)
    ordenes/
      api.ts  types.ts  # Confirmar + buscar ordenes
      Brief.tsx Checkout.tsx CartPage.tsx OrderLookupPage.tsx
    prediccion/
      api.ts  types.ts  # Endpoint ML
      PrediccionPage.tsx
    uploads/
      api.ts            # Subida de imagenes (fetch nativo con FormData)
    carrito/            # Estado cliente (Redux) sin equivalente en backend
      cartSlice.ts      # Slice del carrito
      BadgeWidget.tsx    # Badge del carrito en nav
      AddItemButton.tsx ItemQuantitySelector.tsx
  assets/               # Imagenes estaticas
```

Los imports internos usan el alias `@/` que apunta a `src/` (definido en `vite.config.ts` y `tsconfig.app.json`).

Los modulos pueden depender entre si igual que en el backend (ej. `productos/ItemDetail.tsx` importa el carrito, `productos/ProductForm.tsx` importa categorias/uploads/presentaciones).

## Routing

| Ruta | Pagina | Descripcion |
|---|---|---|
| `/` | HomePage | Catalogo de productos (primeros 20) |
| `/categories` | CategoriesPage | Todas las categorias |
| `/categories/:categoryId` | CategoryProductsPage | Productos de una categoria |
| `/item/:id` | ItemDetailPage | Detalle de producto + agregar al carrito |
| `/cart` | CartPage | Carrito + checkout |
| `/orders` | OrderLookupPage | Buscar orden por ID |
| `/admin` | AdminPage | Dashboard de administracion |
| `/admin/categories` | CategoriesManagePage | ABM categorias (tabla) |
| `/admin/categories/new` | CategoriaFormPage | Crear categoria |
| `/admin/categories/:id/edit` | CategoriaFormPage | Editar categoria |
| `/admin/products` | ProductsManagePage | ABM productos (tabla con sort/filter) |
| `/admin/products/new` | ProductFormPage | Crear producto + variantes |
| `/admin/products/:id/edit` | ProductFormPage | Editar producto + variantes |
| `/prediccion` | PrediccionPage | Herramienta de prediccion ML |

## Estado del Servidor (React Query)

Toda data que viene del backend se maneja con React Query:

```typescript
// Lectura
const { data, isLoading, error } = useQuery({
  queryKey: ["resource", ...ids],
  queryFn: () => apiFunction(params),
});

// Escritura
const mutation = useMutation({
  mutationFn: (data) => apiFunction(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["resource"] });
  },
});
```

No hay hooks personalizados toda la logica query/mutation esta inline en las paginas.

## Estado del Cliente (Redux)

Redux se usa exclusivamente para el **carrito de compras**:

**Slice:** `cartSlice` con acciones:

- `addItem(CartItem)` - Agrega o incrementa cantidad (tope en stock)
- `removeItem(presentacionId)` - Elimina variante
- `updateCantidad({presentacionId, cantidad}) - Setea cantidad (clamp 1..stock)
- `clearCart()` - Vacia el carrito

**Persistencia:** `redux-persist` con localStorage. Solo se persiste la key `cart`.

**State shape:** `{ cart: { items: CartItem[] } }`

## Capa API

**Cliente base** (`core/api/client.ts`):

- Funcion generica `apiFetch<T>(path, options)`
- URL base desde `VITE_API_URL` (default `http://localhost:8000`)
- Todas las requests van a `/api/v1/*`
- Manejo de errores: parsea `detail` del response JSON

**Modulos por feature:** Cada modulo expone su `api.ts` con funciones tipadas que llaman a `apiFetch`:

- `categorias/api.ts` - CRUD completo
- `productos/api.ts` - CRUD con query params (busqueda, filtro, sort)
- `presentaciones/api.ts` - CRUD por producto
- `ordenes/api.ts` - confirmar + buscar
- `prediccion/api.ts` - POST prediccion
- `uploads/api.ts` - Subida multipart (no usa apiFetch, usa fetch nativo con FormData)

## Formularios (React Hook Form)

### Checkout.tsx

Formulario de datos del comprador (nombre, apellido, telefono, email, email_confirmacion).

- Validacion de email con regex
- Validacion cruzada de confirmacion de email

### CategoriaForm.tsx

Formulario simple: nombre + descripcion con required validators.

### ProductForm.tsx (381 lineas)

El form mas complejo del proyecto:

- Campos del producto (nombre, precio, descripcion, imagen, categoria)
- Subida de imagen con preview via `URL.createObjectURL`
- Builder de presentaciones (variantes) con color/talla/stock/imagen
- Edicion inline de variantes existentes
- Tracking de variantes nuevas, modificadas y a eliminar
- Exporta `PresentacionesFormData` consumido por la pagina padre

## Paginas Destacadas

### ProductsManagePage (273 lineas)

La pagina mas compleja. Usa TanStack React Table con:

- `manualSorting` y `manualPagination` (todo server-side)
- Busqueda con debounce (400ms via useState + useEffect + setTimeout)
- Filtro por categoria (dropdown)
- Sort clickeable en columnas
- Paginacion prev/next

### CartPage

Combina estado Redux (carrito) con estado local (flow de checkout):

- Carrito con selects de cantidad
- Resumen de la orden (Brief)
- Formulario de checkout (Checkout)
- Al confirmar exitosamente: limpia carrito y muestra modal fullscreen con numero de orden

### PrediccionPage

Herramienta standalone de prediccion ML:

- 3 inputs: dia de semana, precio (range slider), stock (range slider)
- Llama a `/prediccion/demanda`
- Muestra cantidad estimada

## Estilos (Tailwind CSS v4)

Tema oscuro con acento cyan/teal (espacio de color oklch).

Utilidades custom definidas en `index.css`:

- `glass-card`, `glass-panel` - Paneles translucidos con backdrop blur
- `dark-card` - Card oscura
- `input-field`, `input-label` - Estilos de formulario
- `btn-primary` - Boton principal
- `eyebrow-label`, `eyebrow-dot` - Breadcrumb
- `grid-bg`, `circuit-bg` - Fondos decorativos
- `animate-slide-in` - Animacion de entrada

El lenguaje de diseno es "glassmorphism": paneles translucidos con bordes neon cyan.

## Comandos

```bash
npm run dev      # Desarrollo (Vite)
npm run build    # Build de produccion
npm run lint     # ESLint
npm run preview  # Preview del build
```
