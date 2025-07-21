# Sistema de Autenticación - Queja Fácil Online

## Características Implementadas

### 🔐 Persistencia de Sesión
- **localStorage**: El estado de autenticación se guarda automáticamente en localStorage
- **Restauración automática**: Al recargar la página, la sesión se restaura automáticamente
- **Validación de token**: Se verifica la validez del token al inicializar la aplicación

### 🛡️ Protección de Rutas
- **ProtectedRoute**: Componente que protege rutas que requieren autenticación
- **Control de roles**: Verificación de permisos basada en roles de usuario
- **Redirección automática**: Usuarios no autenticados son redirigidos al login

### 🎯 Gestión de Estados
- **Zustand con persistencia**: Store de autenticación con middleware de persistencia
- **Estados de loading**: Indicadores visuales durante operaciones de autenticación
- **Manejo de errores**: Gestión centralizada de errores de autenticación

## Componentes Principales

### AuthStore (`src/stores/authStore.ts`)
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Acciones
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  // ... más métodos
}
```

### AuthInitializer (`src/components/AuthInitializer.tsx`)
- Se ejecuta al cargar la aplicación
- Restaura la sesión desde localStorage
- Verifica la validez del token

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
```typescript
<ProtectedRoute requiredRole={UserRole.MANAGER}>
  <ManagerPanel />
</ProtectedRoute>
```

### LoadingSpinner (`src/components/LoadingSpinner.tsx`)
- Componente reutilizable para estados de carga
- Diferentes tamaños: sm, md, lg
- Texto personalizable

## Hook Personalizado

### useAuth (`src/hooks/useAuth.ts`)
```typescript
const { user, isAuthenticated, isAdmin, isManager, hasRole } = useAuth();
```

## Flujo de Autenticación

1. **Inicialización**: `AuthInitializer` se ejecuta al cargar la app
2. **Restauración**: Se verifica si hay un token válido en localStorage
3. **Validación**: Se hace una llamada al servidor para verificar el token
4. **Estado**: Se actualiza el estado de autenticación
5. **Navegación**: Se redirige al usuario según su rol

## Estructura de Archivos

```
src/
├── stores/
│   └── authStore.ts          # Store principal de autenticación
├── components/
│   ├── AuthInitializer.tsx   # Inicialización de auth
│   ├── ProtectedRoute.tsx    # Protección de rutas
│   ├── LoadingSpinner.tsx    # Componente de loading
│   └── Navbar.tsx           # Barra de navegación
├── hooks/
│   └── useAuth.ts           # Hook personalizado
└── lib/
    └── api.ts               # Configuración de API y tokens
```

## Uso en Componentes

### Login
```typescript
const { login, isAuthenticated, user } = useAuthStore();

useEffect(() => {
  if (isAuthenticated && user) {
    // Redirigir según el rol
  }
}, [isAuthenticated, user]);
```

### Protección de Rutas
```typescript
// Ruta pública
<Route path="/" element={<Home />} />

// Ruta protegida (cualquier usuario autenticado)
<Route path="/complaints" element={
  <ProtectedRoute>
    <Index />
  </ProtectedRoute>
} />

// Ruta con rol específico
<Route path="/manager" element={
  <ProtectedRoute requiredRole={UserRole.MANAGER}>
    <ManagerPanel />
  </ProtectedRoute>
} />
```

### Verificación de Roles
```typescript
const { isAdmin, isManager, hasRole } = useAuth();

if (isAdmin) {
  // Mostrar funcionalidades de admin
}

if (hasRole(UserRole.MANAGER)) {
  // Mostrar funcionalidades de manager
}
```

## Seguridad

- **Tokens JWT**: Autenticación basada en tokens
- **Validación automática**: Verificación de validez de tokens
- **Limpieza automática**: Tokens inválidos se eliminan automáticamente
- **Headers seguros**: Tokens se envían en headers Authorization

## Mejoras Futuras

- [ ] Refresh tokens para renovación automática
- [ ] Logout automático por inactividad
- [ ] Auditoría de sesiones
- [ ] Autenticación de dos factores
- [ ] Integración con OAuth (Google, Facebook, etc.) 