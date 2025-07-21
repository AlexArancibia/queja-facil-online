# Instrucciones de Debugging - Pantalla en Blanco

## 🔍 **Problema Identificado**
Después del login como admin, aparece una pantalla en blanco.

## ✅ **Cambios Realizados**

### 🔐 **Token de Autenticación**
- **Cambiado**: `auth-storage` → `siclo_quejas_auth_storage_v1`
- **Archivo**: `src/stores/authStore.ts`

### 🐛 **Logs de Debugging Agregados**
- **AuthInitializer**: Logs del estado de autenticación
- **ProtectedRoute**: Logs de verificación de permisos
- **AdminPanel**: Logs de carga de datos y estados

### ⚡ **Mejoras en Loading States**
- **AdminPanel**: Loading state más específico (`isInitialLoading`)
- **Error handling**: Estado de error si no hay usuario
- **Mejor UX**: Mensajes más claros durante la carga

## 🔧 **Pasos para Debuggear**

### 1. **Abrir DevTools**
```bash
# En el navegador, presionar F12
# Ir a la pestaña Console
```

### 2. **Limpiar localStorage (Opcional)**
```javascript
// En la consola del navegador
localStorage.clear();
```

### 3. **Hacer Login como Admin**
- Ir a `/login`
- Ingresar credenciales de admin
- Observar los logs en la consola

### 4. **Logs Esperados**
```
🚀 AuthInitializer: Inicializando autenticación...
🔍 AuthInitializer - Estado actual: {user: null, isAuthenticated: false, loading: true}
🔄 Estado de autenticación restaurado: {user: {...}, isAuthenticated: true}
🔄 AuthInitializer - Estado actualizado: {user: {...}, isAuthenticated: true, loading: false}
🔍 ProtectedRoute - Estado: {user: {...}, isAuthenticated: true, loading: false, requiredRole: "ADMIN"}
✅ Usuario autorizado, mostrando contenido
🔍 AdminPanel useEffect - user: {...}
✅ Usuario autorizado, cargando datos...
🚀 Iniciando carga de datos para admin...
✅ Datos cargados exitosamente
🔄 Initial loading state
```

### 5. **Posibles Problemas y Soluciones**

#### **Problema A**: No aparecen logs de AuthInitializer
**Solución**: Verificar que el componente esté montado en App.tsx

#### **Problema B**: Logs de AuthInitializer pero no de ProtectedRoute
**Solución**: Verificar que la ruta `/admin` esté configurada correctamente

#### **Problema C**: Logs de ProtectedRoute pero no de AdminPanel
**Solución**: Verificar que el usuario tenga rol ADMIN

#### **Problema D**: Loading infinito en AdminPanel
**Solución**: Verificar que las APIs estén respondiendo correctamente

## 🚨 **Comandos de Debugging**

### **Verificar Estado de Auth**
```javascript
// En la consola
console.log('Auth State:', {
  user: JSON.parse(localStorage.getItem('siclo_quejas_auth_storage_v1'))?.state?.user,
  isAuthenticated: JSON.parse(localStorage.getItem('siclo_quejas_auth_storage_v1'))?.state?.isAuthenticated
});
```

### **Verificar Token**
```javascript
// En la consola
console.log('Token:', localStorage.getItem('siclo_quejas_sistema_auth_token_v1'));
```

### **Limpiar Todo y Reiniciar**
```javascript
// En la consola
localStorage.clear();
location.reload();
```

## 📋 **Checklist de Verificación**

- [ ] AuthInitializer se ejecuta
- [ ] Token se guarda correctamente
- [ ] Usuario se autentica correctamente
- [ ] ProtectedRoute permite acceso
- [ ] AdminPanel se monta
- [ ] Datos se cargan correctamente
- [ ] Loading state se resuelve

## 🔄 **Si el Problema Persiste**

1. **Verificar API**: Asegurar que el backend esté funcionando
2. **Verificar Red**: Revisar Network tab en DevTools
3. **Verificar Errores**: Revisar si hay errores en la consola
4. **Verificar Rutas**: Confirmar que las rutas estén bien configuradas

## 📞 **Información para Reporte**

Si el problema persiste, incluir en el reporte:
- Logs completos de la consola
- Estado del localStorage
- Errores en Network tab
- Versión del navegador
- Pasos exactos para reproducir 