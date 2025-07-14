# Guía de Base de Datos y API - Sistema Siclo

## Información del Backend

**URL Base:** `https://quejasapi.emetstudio.com/api/v1`

### Variables de Entorno del Backend
```env
COMPANY_NAME=Siclo QUejas
MAIL_FROM_ADDRESS=reclamos@siclo.com.pe
MAIL_FROM_NAME=Formulario desde Web
MAIL_HOST=mail.siclo.com.pe
MAIL_PASSWORD="SIcloT769#$"
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=reclamos@siclo.com.pe
DATABASE_URL=postgres://postgres:n84SJBEOEik3wSSojUkwJIu8wUu8EAKuQYdHaWHf5c2QhyQ8qP1k43SOiaLuOW0I@161.132.51.242:5432/quejas-siclo
PUBLIC_KEY=MIIBIjraar33314iG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv7oK2LrZxTbbZaffararxk3zSTxB0W0dXpJ9UDszX8aFQ9/uNsMZj+v34y6b57Jprds0kZyAbs8yDmhnxHvR5Ln85YVpP7Zm1fZqV+m1pWn6pSLoQo5X9nM5XwvR9LmUpl9Jl5m6+lM9GHRgVxyN7EHRR+op+Yh7VGpLLftNyP3gf+5RfzHk4vvzLz1XOD+SbV02RHEh5pP/9JBo9CjvZZZ7sFIJh
SECRET=quejassecretjson
```

## Modelo de Base de Datos (PostgreSQL)

### Esquema Principal

```prisma
// Enums
enum UserRole {
  ADMIN
  MANAGER
  USER
}

enum AuthProvider {
  EMAIL
  GOOGLE
  FACEBOOK
  APPLE
}

enum ComplaintStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  REJECTED
}

enum ComplaintPriority {
  HIGH
  MEDIUM
  LOW
}

enum Discipline {
  SICLO
  BARRE
  EJERCITO
  YOGA
}

// Modelo User (Usuarios/Managers/Admins)
model User {
  id                  String        @id @default(cuid())
  name                String?
  email               String        @unique
  password            String?
  emailVerified       DateTime?
  image               String?
  role                UserRole      @default(USER)
  
  // Additional user information
  firstName           String?
  lastName            String?
  phone               String?
  company             String?
  
  // Auth fields
  authProvider        AuthProvider  @default(EMAIL)
  lastLogin           DateTime?
  failedLoginAttempts Int?          @default(0)
  lockedUntil         DateTime?
  isActive            Boolean       @default(true)
  
  // Timestamps
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  
  // Relaciones
  accounts            Account[]
  branches            Branch[]
}

// Modelo Branch (Sucursales/Tiendas)
model Branch {
  id          String   @id @default(dbgenerated("gen_random_uuid()"))
  name        String
  address     String
  phone       String?
  email       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  users       User[]
  instructors Instructor[]
  complaints  Complaint[]
  ratings     Rating[]
}

// Modelo Instructor
model Instructor {
  id         String     @id @default(dbgenerated("gen_random_uuid()"))
  name       String
  email      String?
  phone      String?
  discipline Discipline
  branchId   String
  isActive   Boolean    @default(true)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  
  // Relaciones
  branch     Branch     @relation(fields: [branchId], references: [id], onDelete: Cascade)
  ratings    Rating[]
}

// Modelo Complaint (Quejas)
model Complaint {
  id                     String            @id @default(dbgenerated("'SICLO-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8)"))
  fullName               String
  email                  String
  branchId               String
  observationType        String
  detail                 String
  priority               ComplaintPriority
  status                 ComplaintStatus   @default(PENDING)
  resolution             String?
  managerComments        String?
  attachments            Json              @default("[]")
  resolutionAttachments  Json              @default("[]")
  createdAt              DateTime          @default(now())
  updatedAt              DateTime          @updatedAt
  
  // Relaciones
  branch                 Branch            @relation(fields: [branchId], references: [id])
}

// Modelo Rating (Calificaciones)
model Rating {
  id                     String     @id @default(dbgenerated("'RATING-' || extract(epoch from now())::text || '-' || substr(gen_random_uuid()::text, 1, 8)"))
  instructorId           String
  branchId               String
  instructorName         String
  discipline             Discipline
  schedule               String
  date                   String
  instructorRating       Int
  cleanlinessRating      Int
  audioRating            Int
  attentionQualityRating Int
  amenitiesRating        Int
  punctualityRating      Int
  npsScore               Decimal    @db.Decimal(3, 1)
  comments               String?
  createdAt              DateTime   @default(now())
  
  // Relaciones
  instructor             Instructor @relation(fields: [instructorId], references: [id])
  branch                 Branch     @relation(fields: [branchId], references: [id])
}
```

## Arquitectura de la Aplicación Frontend

### 1. Stores (Zustand)
Los stores manejan el estado global y las llamadas a la API:

- **`authStore.ts`** - Autenticación y gestión de usuarios
- **`complaintsStore.ts`** - Gestión de quejas
- **`ratingsStore.ts`** - Gestión de calificaciones
- **`managersStore.ts`** - Gestión de managers/usuarios
- **`branchesStore.ts`** - Gestión de sucursales
- **`instructorsStore.ts`** - Gestión de instructores

### 2. Configuración de API
**`src/lib/api.ts`** - Cliente Axios configurado con:
- Interceptores para autenticación automática
- Manejo de errores globales
- Timeout de 30 segundos
- Base URL del backend

### 3. Types
**`src/types/api.ts`** - Todos los tipos TypeScript sincronizados con el backend:
- Enums (UserRole, ComplaintStatus, etc.)
- Interfaces para modelos de datos
- DTOs para requests
- Tipos para responses paginados

## Guía de Uso de los Stores

### 1. Auth Store
```typescript
import { useAuthStore } from '@/stores/authStore';

const Component = () => {
  const { user, login, logout, isAuthenticated } = useAuthStore();
  
  // Login
  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  // Logout
  const handleLogout = () => {
    logout();
  };
};
```

### 2. Complaints Store
```typescript
import { useComplaintsStore } from '@/stores/complaintsStore';
import { ComplaintPriority } from '@/types/api';

const Component = () => {
  const { 
    complaints, 
    loading, 
    fetchComplaints, 
    createComplaint,
    getComplaintStats 
  } = useComplaintsStore();
  
  // Cargar quejas con paginación
  const loadComplaints = async () => {
    await fetchComplaints({ 
      page: 1, 
      limit: 10, 
      status: 'PENDING' 
    });
  };
  
  // Crear nueva queja
  const handleCreateComplaint = async () => {
    try {
      const id = await createComplaint({
        fullName: 'John Doe',
        email: 'john@example.com',
        branchId: 'branch-id',
        observationType: 'Servicio',
        detail: 'Descripción de la queja',
        priority: ComplaintPriority.MEDIUM
      });
      console.log('Queja creada con ID:', id);
    } catch (error) {
      console.error('Error creating complaint:', error);
    }
  };
  
  // Obtener estadísticas
  const loadStats = async () => {
    try {
      const stats = await getComplaintStats('branch-id');
      console.log('Stats:', stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
};
```

### 3. Ratings Store
```typescript
import { useRatingsStore } from '@/stores/ratingsStore';
import { Discipline } from '@/types/api';

const Component = () => {
  const { 
    ratings, 
    loading, 
    fetchRatings, 
    createRating,
    getRatingStats 
  } = useRatingsStore();
  
  // Cargar calificaciones
  const loadRatings = async () => {
    await fetchRatings({ 
      page: 1, 
      limit: 10, 
      branchId: 'branch-id' 
    });
  };
  
  // Crear nueva calificación
  const handleCreateRating = async () => {
    try {
      const id = await createRating({
        instructorId: 'instructor-id',
        branchId: 'branch-id',
        instructorName: 'Jane Smith',
        discipline: Discipline.SICLO,
        schedule: '08:00 - 09:00',
        date: '2024-01-15',
        instructorRating: 5,
        cleanlinessRating: 4,
        audioRating: 5,
        attentionQualityRating: 5,
        amenitiesRating: 4,
        punctualityRating: 5,
        npsScore: 9,
        comments: 'Excelente clase'
      });
      console.log('Calificación creada con ID:', id);
    } catch (error) {
      console.error('Error creating rating:', error);
    }
  };
};
```

### 4. Branches Store
```typescript
import { useBranchesStore } from '@/stores/branchesStore';

const Component = () => {
  const { 
    branches, 
    loading, 
    fetchBranches, 
    createBranch,
    getAllBranches 
  } = useBranchesStore();
  
  // Cargar sucursales
  const loadBranches = async () => {
    await fetchBranches({ active: true });
  };
  
  // Obtener todas las sucursales para dropdown
  const loadAllBranches = async () => {
    const allBranches = await getAllBranches();
    console.log('All branches:', allBranches);
  };
  
  // Crear nueva sucursal
  const handleCreateBranch = async () => {
    try {
      const id = await createBranch({
        name: 'Sucursal Centro',
        address: 'Av. Principal 123',
        phone: '+51 1 234-5678',
        email: 'centro@siclo.com.pe'
      });
      console.log('Sucursal creada con ID:', id);
    } catch (error) {
      console.error('Error creating branch:', error);
    }
  };
};
```

### 5. Managers Store
```typescript
import { useManagersStore } from '@/stores/managersStore';
import { UserRole } from '@/types/api';

const Component = () => {
  const { 
    managers, 
    loading, 
    fetchManagers, 
    createManager,
    updateManager 
  } = useManagersStore();
  
  // Cargar managers
  const loadManagers = async () => {
    await fetchManagers({ page: 1, limit: 10 });
  };
  
  // Crear nuevo manager
  const handleCreateManager = async () => {
    try {
      const id = await createManager({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@siclo.com.pe',
        password: 'securePassword123',
        phone: '+51 987 654 321',
        role: UserRole.MANAGER,
        branchId: 'branch-id'
      });
      console.log('Manager creado con ID:', id);
    } catch (error) {
      console.error('Error creating manager:', error);
    }
  };
  
  // Actualizar manager
  const handleUpdateManager = async (managerId: string) => {
    try {
      await updateManager(managerId, {
        firstName: 'Jane',
        phone: '+51 987 654 322'
      });
      console.log('Manager actualizado');
    } catch (error) {
      console.error('Error updating manager:', error);
    }
  };
};
```

## Autenticación

### Headers de Autenticación

**Para endpoints públicos (crear quejas/calificaciones):**
```
X-API-Key: MIIBIjraar33314iG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv7oK2LrZxTbbZaffararxk3zSTxB0W0dXpJ9UDszX8aFQ9/uNsMZj+v34y6b57Jprds0kZyAbs8yDmhnxHvR5Ln85YVpP7Zm1fZqV+m1pWn6pSLoQo5X9nM5XwvR9LmUpl9Jl5m6+lM9GHRgVxyN7EHRR+op+Yh7VGpLLftNyP3gf+5RfzHk4vvzLz1XOD+SbV02RHEh5pP/9JBo9CjvZZZ7sFIJh
```

**Para endpoints protegidos (paneles admin/manager):**
```
Authorization: Bearer <jwt-token>
```

### Flujo de Autenticación

1. Usuario ingresa credenciales
2. Frontend llama a `/auth/login`
3. Backend retorna JWT token
4. Token se guarda en localStorage
5. Interceptor de Axios agrega automáticamente el token a las requests

## Paginación

Todos los stores soportan paginación:

```typescript
const { pagination, fetchData } = useStore();

// Cargar página específica
await fetchData({ page: 2, limit: 20 });

// Estado de paginación
console.log(pagination); 
// { page: 2, limit: 20, total: 100, totalPages: 5 }
```

## Manejo de Errores

Los stores manejan automáticamente errores:

```typescript
const { error, loading } = useStore();

if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
```

## Filtros y Búsquedas

### Quejas con filtros:
```typescript
await fetchComplaints({
  page: 1,
  limit: 10,
  branchId: 'branch-id',
  status: 'PENDING',
  priority: 'HIGH'
});
```

### Calificaciones con filtros:
```typescript
await fetchRatings({
  page: 1,
  limit: 10,
  branchId: 'branch-id',
  instructorId: 'instructor-id'
});
```

### Búsqueda de quejas:
```typescript
const results = await searchComplaints('user@example.com', 'SICLO-123');
```

## Estados del Store

Cada store tiene el mismo patrón de estado:

```typescript
interface StoreState {
  data: T[];              // Array de datos
  loading: boolean;       // Estado de carga
  error: string | null;   // Mensaje de error
  pagination: {          // Info de paginación
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Endpoints Principales

### Autenticación
- `POST /auth/login` - Login
- `POST /auth/register` - Registro (público)
- `GET /auth/profile` - Perfil del usuario
- `POST /auth/verify-email` - Verificar email

### Quejas
- `GET /complaints` - Listar quejas (con filtros)
- `POST /complaints` - Crear queja (público)
- `GET /complaints/:id` - Obtener queja específica
- `PATCH /complaints/:id` - Actualizar queja
- `GET /complaints/stats` - Estadísticas

### Calificaciones
- `GET /ratings` - Listar calificaciones
- `POST /ratings` - Crear calificación (público)
- `GET /ratings/stats` - Estadísticas
- `GET /ratings/:id` - Obtener calificación específica

### Usuarios/Managers
- `GET /auth` - Listar usuarios
- `POST /auth` - Crear usuario (admin)
- `PATCH /auth/:id` - Actualizar usuario
- `DELETE /auth/:id` - Eliminar usuario

### Sucursales
- `GET /branches` - Listar sucursales
- `POST /branches` - Crear sucursal
- `PATCH /branches/:id` - Actualizar sucursal
- `DELETE /branches/:id` - Eliminar sucursal

### Instructores
- `GET /instructors` - Listar instructores
- `POST /instructors` - Crear instructor
- `PATCH /instructors/:id` - Actualizar instructor
- `DELETE /instructors/:id` - Eliminar instructor

Esta guía te permite integrar completamente el frontend con tu backend mediante los stores de Zustand y la configuración de Axios proporcionada.