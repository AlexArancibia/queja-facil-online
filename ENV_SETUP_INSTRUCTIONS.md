# 🔧 Configuración de Variables de Entorno

## 📋 Archivo .env requerido

Para que el sistema de subida de imágenes funcione correctamente, necesitas crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Cloudflare R2 Configuration
VITE_CLOUDFLARE_ENDPOINT=https://[TU-CUENTA-ID].r2.cloudflarestorage.com
VITE_CLOUDFLARE_ACCESS_KEY_ID=tu_access_key_aqui
VITE_CLOUDFLARE_SECRET_KEY=tu_secret_key_aqui
VITE_CLOUDFLARE_BUCKET_NAME=tu_bucket_name_aqui
VITE_IMAGE_DOMAIN=https://tu-dominio-cdn.com

# Email Configuration
VITE_FROM_EMAIL_ADDRESS=test@estrategiags.com
VITE_FROM_EMAIL_NAME=Siclo
```

## 🌐 Ejemplo de configuración real:

```env
VITE_CLOUDFLARE_ENDPOINT=https://abc123def456.r2.cloudflarestorage.com
VITE_CLOUDFLARE_ACCESS_KEY_ID=1a2b3c4d5e6f7g8h9i0j
VITE_CLOUDFLARE_SECRET_KEY=A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0
VITE_CLOUDFLARE_BUCKET_NAME=quejas-siclo-storage
VITE_IMAGE_DOMAIN=https://cdn.midominio.com

# Email Configuration
VITE_FROM_EMAIL_ADDRESS=support@misiclo.com
VITE_FROM_EMAIL_NAME=Siclo
```

## ⚠️ Importante:

1. **Prefijo VITE_**: Todas las variables deben empezar con `VITE_` para ser accesibles en el frontend
2. **Seguridad**: El archivo `.env` ya está en `.gitignore` - NO lo subas al repositorio
3. **Cloudflare R2**: Necesitas crear un bucket en Cloudflare R2 y obtener las credenciales
4. **Dominio CDN**: Configura un dominio personalizado para servir las imágenes
5. **Email**: Solo necesitas configurar un email address que enviará todos los correos del sistema

## 📧 Configuración de Email:

- **VITE_FROM_EMAIL_ADDRESS**: El email que enviará todas las notificaciones (quejas y calificaciones)
- **VITE_FROM_EMAIL_NAME**: El nombre que aparecerá como remitente (opcional, por defecto "Siclo")

### 📋 Metadata en Emails:

Todos los emails incluyen automáticamente metadata con información del branch y managers:

```json
{
  "metadata": {
    "branchId": "branch-123",
    "branchName": "Siclo San Isidro",
    "managers": [
      {
        "id": "manager-456",
        "name": "Ana García",
        "email": "ana.garcia@siclo.com"
      }
    ],
    "type": "complaint", // "complaint", "rating" o "status_update"
    "entityId": "queja-789" // ID de la queja o calificación
  }
}
```

Esta metadata es útil para:
- **Tracking**: Rastrear emails por branch
- **Analytics**: Análisis de comunicaciones por local
- **Management**: Identificar managers responsables
- **Automation**: Sistemas automatizados de seguimiento

## 🚀 Pasos para configurar Cloudflare R2:

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navega a R2 Object Storage
3. Crea un nuevo bucket (ej: `quejas-siclo-storage`)
4. Ve a "Manage R2 API tokens"
5. Crea un nuevo token con permisos de lectura/escritura
6. Copia las credenciales al archivo `.env`
7. Configura un dominio personalizado para el bucket

## 🔍 Verificación:

Una vez configurado, las imágenes se subirán automáticamente y las URLs se incluirán en el payload de las quejas.

## 🐛 Solución de problemas:

- **Error "process is not defined"**: Ya corregido - ahora usa `import.meta.env`
- **Variables undefined**: Verifica que empiecen con `VITE_`
- **CORS errors**: Configura CORS en tu bucket de R2
- **403 Forbidden**: Verifica las credenciales y permisos del token 