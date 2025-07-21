import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/ImageUploader';

const ImageUploaderExample = () => {
  const [imageUrls1, setImageUrls1] = useState<string[]>([]);
  const [imageUrls2, setImageUrls2] = useState<string[]>([]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-siclo-dark">ImageUploader - Ejemplos de Uso</h1>
      
      {/* Ejemplo 1: Configuración básica */}
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo 1: Configuración Básica</CardTitle>
          <p className="text-sm text-gray-600">
            Límite de 3MB, máximo 5 imágenes, tipos por defecto
          </p>
        </CardHeader>
        <CardContent>
          <ImageUploader
            onImagesChange={setImageUrls1}
            maxImages={5}
            maxFileSize={3}
          />
          
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">URLs generadas:</p>
            <div className="bg-gray-100 p-3 rounded text-xs max-h-32 overflow-y-auto">
              {imageUrls1.length > 0 ? (
                imageUrls1.map((url, index) => (
                  <div key={index} className="mb-1">
                    {index + 1}. {url}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay imágenes subidas</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo 2: Configuración personalizada */}
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo 2: Configuración Personalizada</CardTitle>
          <p className="text-sm text-gray-600">
            Límite de 1MB, máximo 3 imágenes, solo JPEG y PNG
          </p>
        </CardHeader>
        <CardContent>
          <ImageUploader
            onImagesChange={setImageUrls2}
            maxImages={3}
            maxFileSize={1}
            allowedTypes={["image/jpeg", "image/png"]}
          />
          
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">URLs generadas:</p>
            <div className="bg-gray-100 p-3 rounded text-xs max-h-32 overflow-y-auto">
              {imageUrls2.length > 0 ? (
                imageUrls2.map((url, index) => (
                  <div key={index} className="mb-1">
                    {index + 1}. {url}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay imágenes subidas</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de uso */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Características:</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>✅ Drag & Drop compatible</li>
              <li>✅ Previews en tiempo real</li>
              <li>✅ Validación de tamaño y tipo</li>
              <li>✅ Indicadores de progreso</li>
              <li>✅ Manejo de errores y reintentos</li>
              <li>✅ Diseño responsivo</li>
              <li>✅ Límite configurable de archivos</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Props disponibles:</h4>
            <div className="text-sm bg-gray-50 p-3 rounded">
              <pre>{`interface ImageUploaderProps {
  onImagesChange?: (imageUrls: string[]) => void
  maxImages?: number           // Default: 5
  maxFileSize?: number         // Default: 3 (MB)
  allowedTypes?: string[]      // Default: jpeg, png, webp, gif
  className?: string
  disabled?: boolean
}`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Integración en formularios:</h4>
            <div className="text-sm bg-gray-50 p-3 rounded">
              <pre>{`const [imageUrls, setImageUrls] = useState<string[]>([])

const onSubmit = (data) => {
  const formData = {
    ...data,
    attachments: imageUrls.map((url, index) => ({
      filename: \`image-\${index + 1}.jpg\`,
      url: url
    }))
  }
  // Submit form data...
}`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploaderExample; 